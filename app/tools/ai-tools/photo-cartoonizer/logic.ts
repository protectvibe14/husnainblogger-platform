/**
 * Photo Cartoonizer (tool-551) — pure request/response logic (Lane D).
 *
 * Zero imports: no DOM, no network, no fetch. All provider behaviour is
 * covered by mocked unit tests.
 *
 * Providers (priority order):
 *  - openrouter   — image EDIT (PRIMARY): google/gemini-2.5-flash-image with
 *                   the user's photo as an image_url part + cartoon prompt.
 *  - hf-inference — FLUX.1-schnell text-to-image from a cartoon prompt.
 *                   Stylized output only — not a cartoon version of YOUR photo.
 *  - falai        — fal-ai/flux/schnell via queue API. Same caveat as HF.
 *
 * Style words only, no trademark claims: "3d animated", "anime", "comic-book".
 * Endpoint verification (2026-10-01): same sources as tool-554
 * (github.com/justinperea/nebula-nodes, github.com/fal-ai-community/skills,
 * github.com/raphaelmansuy/edgecrab).
 */

export type CartoonProviderId = "openrouter" | "hf-inference" | "falai";

const PROVIDERS: readonly CartoonProviderId[] = ["openrouter", "hf-inference", "falai"];
export function getProviders(): CartoonProviderId[] {
  return [...PROVIDERS];
}

export type CartoonStyle = "3d animated" | "anime" | "comic-book";
export const CARTOON_STYLES: readonly CartoonStyle[] = ["3d animated", "anime", "comic-book"];

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
  if (input.style !== undefined && !(CARTOON_STYLES as readonly string[]).includes(input.style)) {
    errors.push(`Unknown style "${input.style}". Pick one of: ${CARTOON_STYLES.join(", ")}.`);
  }
  // The OpenRouter edit route needs a photo to cartoonize.
  if (input.provider === "openrouter" && !input.hasImage) {
    errors.push("Upload a photo first — the OpenRouter route cartoonizes your image.");
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
// Cartoon prompt builder
// ---------------------------------------------------------------------------

export function buildCartoonPrompt(style: CartoonStyle): string {
  const styles: Record<CartoonStyle, string> = {
    "3d animated":
      "3d animated movie style: smooth rounded shapes, big expressive eyes, soft studio lighting, vibrant colors, family-film look.",
    anime: "anime style: clean cel shading, bold outlines, detailed hair, vibrant colors, classic Japanese animation look.",
    "comic-book":
      "comic-book style: bold ink outlines, halftone dots, dramatic shading, saturated colors, graphic-novel look.",
  };
  return (
    "Redraw this photo as a cartoon in " +
    styles[style] +
    " Keep the same composition, poses, and subjects — restyle only. High quality, polished finish."
  );
}

// ---------------------------------------------------------------------------
// OpenRouter — image EDIT (primary cartoonize route)
// ---------------------------------------------------------------------------

export const OPENROUTER_IMAGE_URL = "https://openrouter.ai/api/v1/chat/completions";
export const OPENROUTER_IMAGE_MODEL = "google/gemini-2.5-flash-image";
export const SITE_REFERER = "https://husnainblogger.com";
export const SITE_TITLE = "HusnainBlogger AI Tools";

export function buildOpenRouterCartoonEditRequest(args: {
  key: string;
  photoDataUrl: string;
  style: CartoonStyle;
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
            { type: "text", text: buildCartoonPrompt(args.style) },
            { type: "image_url", image_url: { url: args.photoDataUrl } },
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
      message: "OpenRouter answered without an image. Try a clearer photo, or another provider.",
    };
  }
  return { ok: true, data: { imageUrl: url, provider: "openrouter" as const } };
}

// ---------------------------------------------------------------------------
// Hugging Face Inference — FLUX.1-schnell (stylized only)
// ---------------------------------------------------------------------------

export const HF_FLUX_URL =
  "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell";

export function buildHfCartoonRequest(args: { key: string; style: CartoonStyle }): BuiltRequest {
  return {
    url: HF_FLUX_URL,
    method: "POST",
    headers: {
      Authorization: "Bearer " + args.key,
      "Content-Type": "application/json",
    },
    body: { inputs: "Cartoon illustration, " + buildCartoonPrompt(args.style) },
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
// fal.ai — fal-ai/flux/schnell via queue API (stylized only)
// ---------------------------------------------------------------------------

export const FAL_FLUX_SCHNELL_MODEL = "fal-ai/flux/schnell";

export function buildFalCartoonSubmitRequest(args: { key: string; style: CartoonStyle }): BuiltRequest {
  return {
    url: `https://queue.fal.run/${FAL_FLUX_SCHNELL_MODEL}`,
    method: "POST",
    headers: {
      Authorization: "Key " + args.key,
      "Content-Type": "application/json",
    },
    body: {
      prompt: "Cartoon illustration, " + buildCartoonPrompt(args.style),
      image_size: "landscape_16_9",
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
    "Only the OpenRouter route cartoonizes YOUR uploaded photo. Hugging Face and fal.ai generate a cartoon illustration from text — not a cartoon of your photo.",
    "Your photo never leaves your browser except to the provider you pick, as part of the generation request.",
    "OpenRouter image calls bill roughly $0.05–$0.10 per image; Hugging Face uses your inference credits; fal.ai bills per megapixel (fal-ai/flux/schnell, verified 2026-10-01).",
    "fal.ai officially recommends a server proxy; direct browser calls may be blocked by CORS — the tool will show a clear message if that happens.",
    "Style names are descriptive words only — this tool is not affiliated with any animation studio.",
  ];
}
