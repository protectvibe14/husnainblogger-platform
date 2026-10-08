/**
 * AI Headshot Generator (tool-549) — pure request/response logic (Lane D).
 *
 * Zero imports: no DOM, no network, no fetch. All provider behaviour is
 * covered by mocked unit tests.
 *
 * Providers (priority order):
 *  - openrouter   — image EDIT: google/gemini-2.5-flash-image with the
 *                   user's selfie as an image_url part + headshot prompt.
 *                   This is the likeness-preserving route.
 *  - hf-inference — FLUX.1-schnell text-to-image from a headshot prompt.
 *                   Does NOT preserve the user's likeness (disclosed).
 *  - falai        — fal-ai/flux/schnell via queue API. Same caveat as HF.
 *
 * Endpoint verification (2026-10-01): same sources as the AI Image
 * Generator (tool-554) — fal-ai/flux/schnell verified in
 * github.com/justinperea/nebula-nodes SKILL.md,
 * github.com/fal-ai-community/skills genmedia reference, and
 * github.com/raphaelmansuy/edgecrab 004_fal_spec.md.
 */

export type HeadshotProviderId = "openrouter" | "hf-inference" | "falai";

const PROVIDERS: readonly HeadshotProviderId[] = ["openrouter", "hf-inference", "falai"];
export function getProviders(): HeadshotProviderId[] {
  return [...PROVIDERS];
}

export type HeadshotStyle = "corporate" | "creative" | "studio";
export const HEADSHOT_STYLES: readonly HeadshotStyle[] = ["corporate", "creative", "studio"];

export type FetchErrorKind =
  | "no-key"
  | "cors-blocked"
  | "unauthorized"
  | "rate-limited"
  | "billing"
  | "bad-request"
  | "server-error"
  | "network"
  | "timeout"
  | "unknown";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export interface BuiltRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface CallOutcome {
  ok: boolean;
  kind?: FetchErrorKind;
  message?: string;
  data?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateInputs(input: { style?: string; hasImage?: boolean; provider?: string }): ValidationResult {
  const errors: string[] = [];
  if (input.style !== undefined && !(HEADSHOT_STYLES as readonly string[]).includes(input.style)) {
    errors.push(`Unknown style "${input.style}". Pick one of: ${HEADSHOT_STYLES.join(", ")}.`);
  }
  // The OpenRouter edit route needs a selfie to work from.
  if (input.provider === "openrouter" && !input.hasImage) {
    errors.push("Upload a selfie first — the OpenRouter route transforms your photo.");
  }
  return { ok: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Shared status/message helpers (pure)
// ---------------------------------------------------------------------------

export function mapHttpStatus(status: number): FetchErrorKind | null {
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 402) return "billing";
  if (status === 429) return "rate-limited";
  if (status >= 500) return "server-error";
  if (status >= 400) return "bad-request";
  return null;
}

export function classifyFetchError(message: string): FetchErrorKind {
  const m = message || "";
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return "cors-blocked";
  if (/timed out|timeout|abort/i.test(m)) return "timeout";
  return "network";
}

export function providerErrorMessage(json: unknown): string | null {
  if (!json || typeof json !== "object") return null;
  const j = json as Record<string, unknown>;
  const err = j["error"];
  if (typeof err === "string") return err.slice(0, 300);
  if (err && typeof err === "object") {
    const msg = (err as Record<string, unknown>)["message"];
    if (typeof msg === "string" && msg.trim()) return msg.slice(0, 300);
  }
  for (const k of ["detail", "message"]) {
    const v = j[k];
    if (typeof v === "string" && v.trim()) return v.slice(0, 300);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Headshot prompt builder (shared text for all three routes)
// ---------------------------------------------------------------------------

export function buildHeadshotPrompt(style: HeadshotStyle): string {
  const base =
    "Transform this photo into a professional headshot. Keep the same person, same face, same identity — " +
    "only improve lighting, background, and overall polish. Photorealistic, sharp focus on the face.";
  const styles: Record<HeadshotStyle, string> = {
    corporate:
      "Corporate style: neutral grey studio backdrop, business attire, soft key light, confident neutral expression, LinkedIn-profile look.",
    creative:
      "Creative style: softly blurred warm-toned background, modern casual-smart attire, relaxed confident expression, editorial portrait look.",
    studio:
      "Studio style: dramatic dark studio backdrop with rim lighting, premium magazine-portrait look, crisp detail.",
  };
  return `${base} ${styles[style]}`;
}

// ---------------------------------------------------------------------------
// OpenRouter — image EDIT (likeness-preserving route)
// ---------------------------------------------------------------------------

export const OPENROUTER_IMAGE_URL = "https://openrouter.ai/api/v1/chat/completions";
export const OPENROUTER_IMAGE_MODEL = "google/gemini-2.5-flash-image";
export const SITE_REFERER = "https://husnainblogger.com";
export const SITE_TITLE = "HusnainBlogger AI Tools";

export function buildOpenRouterHeadshotEditRequest(args: {
  key: string;
  selfieDataUrl: string;
  style: HeadshotStyle;
}): BuiltRequest {
  return {
    url: OPENROUTER_IMAGE_URL,
    method: "POST",
    headers: {
      Authorization: "Bearer " + args.key,
      "Content-Type": "application/json",
      "HTTP-Referer": SITE_REFERER,
      "X-Title": SITE_TITLE,
    },
    body: {
      model: OPENROUTER_IMAGE_MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: buildHeadshotPrompt(args.style) },
            { type: "image_url", image_url: { url: args.selfieDataUrl } },
          ],
        },
      ],
      modalities: ["image", "text"],
    },
  };
}

export function parseOpenRouterImageResponse(status: number, json: unknown): CallOutcome {
  const kind = mapHttpStatus(status);
  if (kind) {
    return {
      ok: false,
      kind,
      message: providerErrorMessage(json) ?? `OpenRouter returned HTTP ${status}.`,
    };
  }
  const j = (json ?? {}) as Record<string, unknown>;
  const choices = j["choices"];
  const first = Array.isArray(choices) ? (choices[0] as Record<string, unknown> | undefined) : undefined;
  const message = first?.["message"] as Record<string, unknown> | undefined;
  const images = message?.["images"];
  const img0 = Array.isArray(images) ? (images[0] as Record<string, unknown> | undefined) : undefined;
  const urlObj = img0?.["image_url"] as Record<string, unknown> | undefined;
  const url = typeof urlObj?.["url"] === "string" ? (urlObj["url"] as string) : "";
  if (!url) {
    return {
      ok: false,
      kind: "unknown",
      message: "OpenRouter answered without an image. Try a clearer selfie, or another provider.",
    };
  }
  return { ok: true, data: { imageUrl: url, provider: "openrouter" as const } };
}

// ---------------------------------------------------------------------------
// Hugging Face Inference — FLUX.1-schnell (no likeness preservation)
// ---------------------------------------------------------------------------

export const HF_FLUX_URL =
  "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell";

export function buildHfHeadshotRequest(args: { key: string; style: HeadshotStyle }): BuiltRequest {
  return {
    url: HF_FLUX_URL,
    method: "POST",
    headers: {
      Authorization: "Bearer " + args.key,
      "Content-Type": "application/json",
    },
    body: {
      inputs:
        `Professional AI headshot portrait, ${args.style} style. ` +
        "Photorealistic, sharp focus on the face, flattering studio lighting, high detail.",
    },
  };
}

export function parseHfImageStatus(status: number, json: unknown, contentType: string): CallOutcome {
  if (status >= 200 && status < 300 && /^image\//i.test(contentType)) {
    return { ok: true, data: { bytes: true, provider: "hf-inference" as const } };
  }
  if (status === 503) {
    const j = (json ?? {}) as Record<string, unknown>;
    const eta = j["estimated_time"];
    const etaText =
      typeof eta === "number" && eta > 0 ? ` Try again in about ${Math.ceil(eta / 60)} minute(s).` : "";
    return { ok: false, kind: "server-error", message: `FLUX.1-schnell is warming up on Hugging Face.${etaText}` };
  }
  const kind = mapHttpStatus(status) ?? "unknown";
  return {
    ok: false,
    kind,
    message: providerErrorMessage(json) ?? `Hugging Face returned HTTP ${status}.`,
  };
}

// ---------------------------------------------------------------------------
// fal.ai — fal-ai/flux/schnell via queue API (no likeness preservation)
// ---------------------------------------------------------------------------

export const FAL_FLUX_SCHNELL_MODEL = "fal-ai/flux/schnell";

export function buildFalHeadshotSubmitRequest(args: {
  key: string;
  style: HeadshotStyle;
}): BuiltRequest {
  return {
    url: `https://queue.fal.run/${FAL_FLUX_SCHNELL_MODEL}`,
    method: "POST",
    headers: {
      Authorization: "Key " + args.key,
      "Content-Type": "application/json",
    },
    body: {
      prompt:
        `Professional AI headshot portrait, ${args.style} style. ` +
        "Photorealistic, sharp focus on the face, flattering studio lighting, high detail.",
      image_size: "portrait_4_3",
      num_images: 1,
      output_format: "jpeg",
    },
  };
}

export function parseFalSubmitResponse(status: number, json: unknown): CallOutcome {
  const kind = mapHttpStatus(status);
  if (kind) {
    return {
      ok: false,
      kind,
      message: providerErrorMessage(json) ?? `fal.ai rejected the request (HTTP ${status}).`,
    };
  }
  const j = (json ?? {}) as Record<string, unknown>;
  const requestId = typeof j["request_id"] === "string" ? (j["request_id"] as string) : "";
  if (!requestId) {
    return { ok: false, kind: "unknown", message: "fal.ai answered without a request_id. Please retry." };
  }
  return { ok: true, data: { requestId } };
}

export function buildFalStatusRequest(args: { key: string; requestId: string }): BuiltRequest {
  return {
    url: `https://queue.fal.run/${FAL_FLUX_SCHNELL_MODEL}/requests/${encodeURIComponent(args.requestId)}/status`,
    method: "GET",
    headers: { Authorization: "Key " + args.key },
  };
}

export type FalQueueStatus = "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED" | "UNKNOWN";

export function parseFalStatusResponse(status: number, json: unknown): CallOutcome {
  const kind = mapHttpStatus(status);
  if (kind) {
    return {
      ok: false,
      kind,
      message: providerErrorMessage(json) ?? `fal.ai status check failed (HTTP ${status}).`,
    };
  }
  const j = (json ?? {}) as Record<string, unknown>;
  const raw = typeof j["status"] === "string" ? (j["status"] as string) : "UNKNOWN";
  const queueStatus: FalQueueStatus =
    raw === "IN_QUEUE" || raw === "IN_PROGRESS" || raw === "COMPLETED" || raw === "FAILED" || raw === "CANCELLED"
      ? raw
      : "UNKNOWN";
  if (queueStatus === "FAILED" || queueStatus === "CANCELLED") {
    return {
      ok: false,
      kind: "server-error",
      message: providerErrorMessage(json) ?? `fal.ai job ${queueStatus === "FAILED" ? "failed" : "was cancelled"}.`,
    };
  }
  return {
    ok: true,
    data: {
      queueStatus,
      queuePosition: typeof j["queue_position"] === "number" ? (j["queue_position"] as number) : null,
    },
  };
}

export function buildFalResultRequest(args: { key: string; requestId: string }): BuiltRequest {
  return {
    url: `https://queue.fal.run/${FAL_FLUX_SCHNELL_MODEL}/requests/${encodeURIComponent(args.requestId)}/response`,
    method: "GET",
    headers: { Authorization: "Key " + args.key },
  };
}

export function parseFalImageResult(status: number, json: unknown): CallOutcome {
  const kind = mapHttpStatus(status);
  if (kind) {
    return {
      ok: false,
      kind,
      message: providerErrorMessage(json) ?? `fal.ai result fetch failed (HTTP ${status}).`,
    };
  }
  const j = (json ?? {}) as Record<string, unknown>;
  const images = j["images"];
  const img0 = Array.isArray(images) ? (images[0] as Record<string, unknown> | undefined) : undefined;
  const url = typeof img0?.["url"] === "string" ? (img0["url"] as string) : "";
  if (!url) {
    return { ok: false, kind: "unknown", message: "fal.ai finished but returned no image URL. Please retry." };
  }
  return { ok: true, data: { imageUrl: url, provider: "falai" as const } };
}

// ---------------------------------------------------------------------------
// Disclosures
// ---------------------------------------------------------------------------

export function getDisclosures(): string[] {
  return [
    "You bring your own API key — it stays in your browser and is sent only to the provider you choose. This site has no backend and cannot see it.",
    "Likeness: only the OpenRouter route edits YOUR uploaded selfie. Hugging Face and fal.ai generate a headshot from text alone — they do not preserve your face.",
    "Your selfie never leaves your browser except to the provider you pick, as part of the generation request. Nothing is uploaded to HusnainBlogger.",
    "OpenRouter image calls bill roughly $0.05–$0.10 per image; Hugging Face uses your inference credits; fal.ai bills per megapixel (fal-ai/flux/schnell, verified 2026-10-01).",
    "fal.ai officially recommends a server proxy; direct browser calls may be blocked by CORS — the tool will show a clear message if that happens.",
    "Use your own photo only — do not upload someone else's face without their permission.",
  ];
}
