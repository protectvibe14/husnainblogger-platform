/**
 * AI Image Generator (tool-554) — pure request/response logic (Lane D).
 *
 * Zero imports: no DOM, no network, no fetch. The browser client builds
 * real requests from these builders and parses real responses with the
 * parsers below. All provider behaviour is covered by mocked unit tests.
 *
 * Providers (priority order):
 *  - openrouter   — POST chat/completions, google/gemini-2.5-flash-image,
 *                   modalities ["image","text"] → images[0].image_url.url
 *  - hf-inference — POST router.huggingface.co FLUX.1-schnell, returns raw
 *                   image BYTES (client converts arrayBuffer → Blob → object URL)
 *  - falai        — queue API: POST queue.fal.run/fal-ai/flux/schnell →
 *                   {request_id} → poll /requests/{id}/status → GET
 *                   /requests/{id}/response → images[0].url
 *
 * Endpoint-id verification (2026-10-01):
 *  - fal-ai/flux/schnell: multiple live sources —
 *    github.com/justinperea/nebula-nodes SKILL.md (FAL endpoint table),
 *    github.com/fal-ai-community/skills genmedia reference (baked-in
 *    default for text-to-image), github.com/raphaelmansuy/edgecrab
 *    specs/imagegen/004_fal_spec.md (FLUX wire format: prompt, image_size,
 *    num_images, output_format). image_size enum: square_hd, square,
 *    portrait_4_3, portrait_16_9, landscape_4_3, landscape_16_9.
 *  - Queue flow: github.com/api-evangelist/fal-ai (POST
 *    https://queue.fal.run/{model-id} → poll /requests/{request_id}/status
 *    → /requests/{request_id}/response); statuses IN_QUEUE / IN_PROGRESS /
 *    COMPLETED / FAILED / CANCELLED (github.com/timoncool/videosos
 *    docs/fal/pages/model-endpoints/queue.md).
 */

/** Provider ids in priority order. */
export type ImageProviderId = "openrouter" | "hf-inference" | "falai";

const PROVIDERS: readonly ImageProviderId[] = ["openrouter", "hf-inference", "falai"];
export function getProviders(): ImageProviderId[] {
  return [...PROVIDERS];
}

/** Aspect options shown in the UI. */
export type ImageAspect = "square" | "landscape" | "portrait" | "wide";
export const IMAGE_ASPECTS: readonly ImageAspect[] = ["square", "landscape", "portrait", "wide"];

export const PROMPT_MIN = 3;
export const PROMPT_MAX = 2000;

/** Normalized error kind (mirrors lib/ai AiFetchErrorKind). */
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
  /** User-safe message (never raw dumps). */
  message?: string;
  data?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateInputs(input: { prompt?: string; aspect?: string }): ValidationResult {
  const errors: string[] = [];
  const prompt = (input.prompt ?? "").trim();
  if (prompt.length < PROMPT_MIN) {
    errors.push(`Describe the image in at least ${PROMPT_MIN} characters.`);
  }
  if (prompt.length > PROMPT_MAX) {
    errors.push(`Keep the prompt under ${PROMPT_MAX} characters.`);
  }
  if (input.aspect !== undefined && !(IMAGE_ASPECTS as readonly string[]).includes(input.aspect)) {
    errors.push(`Unknown aspect ratio "${input.aspect}". Pick one of: ${IMAGE_ASPECTS.join(", ")}.`);
  }
  return { ok: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Shared status/message helpers (pure)
// ---------------------------------------------------------------------------

/** Map an HTTP status to a normalized kind. Null = not an error we translate. */
export function mapHttpStatus(status: number): FetchErrorKind | null {
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 402) return "billing";
  if (status === 429) return "rate-limited";
  if (status >= 500) return "server-error";
  if (status >= 400) return "bad-request";
  return null;
}

/** Classify a caught fetch/network error message into a normalized kind. */
export function classifyFetchError(message: string): FetchErrorKind {
  const m = message || "";
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return "cors-blocked";
  if (/timed out|timeout|abort/i.test(m)) return "timeout";
  return "network";
}

/** Pull a user-safe message out of common provider error JSON shapes. */
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
// OpenRouter — google/gemini-2.5-flash-image
// ---------------------------------------------------------------------------

export const OPENROUTER_IMAGE_URL = "https://openrouter.ai/api/v1/chat/completions";
export const OPENROUTER_IMAGE_MODEL = "google/gemini-2.5-flash-image";
export const SITE_REFERER = "https://husnainblogger.com";
export const SITE_TITLE = "HusnainBlogger AI Tools";

export function buildOpenRouterImageRequest(args: { key: string; prompt: string }): BuiltRequest {
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
      messages: [{ role: "user", content: args.prompt }],
      modalities: ["image", "text"],
    },
  };
}

/** Extract images[0].image_url.url from an OpenRouter chat response. */
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
      message:
        "OpenRouter answered without an image. Try a different prompt, or check whether the model is available on your account.",
    };
  }
  return { ok: true, data: { imageUrl: url, provider: "openrouter" as const } };
}

// ---------------------------------------------------------------------------
// Hugging Face Inference — FLUX.1-schnell (returns image BYTES)
// ---------------------------------------------------------------------------

export const HF_FLUX_URL =
  "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell";

export function buildHfImageRequest(args: { key: string; prompt: string }): BuiltRequest {
  return {
    url: HF_FLUX_URL,
    method: "POST",
    headers: {
      Authorization: "Bearer " + args.key,
      "Content-Type": "application/json",
    },
    body: { inputs: args.prompt },
  };
}

/**
 * HF returns image bytes on success (the client converts arrayBuffer → Blob).
 * This parser handles the JSON *error* shapes; the client only calls it when
 * the content-type is NOT an image, or the status is an error.
 */
export function parseHfImageStatus(
  status: number,
  json: unknown,
  contentType: string,
): CallOutcome {
  if (status >= 200 && status < 300 && /^image\//i.test(contentType)) {
    return { ok: true, data: { bytes: true, provider: "hf-inference" as const } };
  }
  const kind = mapHttpStatus(status) ?? "unknown";
  // HF cold-start: 503 with {"error": "...", "estimated_time": seconds}
  if (status === 503) {
    const j = (json ?? {}) as Record<string, unknown>;
    const eta = j["estimated_time"];
    const etaText =
      typeof eta === "number" && eta > 0 ? ` Try again in about ${Math.ceil(eta / 60)} minute(s).` : "";
    return {
      ok: false,
      kind: "server-error",
      message: `FLUX.1-schnell is warming up on Hugging Face.${etaText}`,
    };
  }
  return {
    ok: false,
    kind,
    message: providerErrorMessage(json) ?? `Hugging Face returned HTTP ${status}.`,
  };
}

// ---------------------------------------------------------------------------
// fal.ai — queue API (shared by D8 / D2 / D3 / D5)
// ---------------------------------------------------------------------------

/** Verified 2026-10-01 (sources in header): FLUX.1 [schnell] endpoint id. */
export const FAL_FLUX_SCHNELL_MODEL = "fal-ai/flux/schnell";

export const FAL_IMAGE_SIZE: Record<ImageAspect, string> = {
  square: "square_hd",
  landscape: "landscape_16_9",
  portrait: "portrait_16_9",
  wide: "landscape_4_3",
};

export function buildFalImageSubmitRequest(args: {
  key: string;
  prompt: string;
  aspect: ImageAspect;
}): BuiltRequest {
  return {
    url: `https://queue.fal.run/${FAL_FLUX_SCHNELL_MODEL}`,
    method: "POST",
    headers: {
      Authorization: "Key " + args.key,
      "Content-Type": "application/json",
    },
    body: {
      prompt: args.prompt,
      image_size: FAL_IMAGE_SIZE[args.aspect] ?? "landscape_16_9",
      num_images: 1,
      output_format: "jpeg",
    },
  };
}

/** Generic fal.ai queue submit builder (submit → {request_id, status_url, response_url}). */
export function buildFalSubmitRequest(args: {
  modelId: string;
  key: string;
  input: Record<string, unknown>;
}): BuiltRequest {
  return {
    url: `https://queue.fal.run/${args.modelId}`,
    method: "POST",
    headers: {
      Authorization: "Key " + args.key,
      "Content-Type": "application/json",
    },
    body: args.input,
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
    return {
      ok: false,
      kind: "unknown",
      message: "fal.ai answered without a request_id. Please retry.",
    };
  }
  return {
    ok: true,
    data: {
      requestId,
      statusUrl: typeof j["status_url"] === "string" ? (j["status_url"] as string) : "",
      responseUrl: typeof j["response_url"] === "string" ? (j["response_url"] as string) : "",
    },
  };
}

export function buildFalStatusRequest(args: {
  modelId: string;
  key: string;
  requestId: string;
}): BuiltRequest {
  return {
    url: `https://queue.fal.run/${args.modelId}/requests/${encodeURIComponent(args.requestId)}/status`,
    method: "GET",
    headers: { Authorization: "Key " + args.key },
  };
}

export type FalQueueStatus = "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED" | "UNKNOWN";

/** Poll outcome: ok=true for every non-error poll (including IN_QUEUE/IN_PROGRESS). */
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

export function buildFalResultRequest(args: {
  modelId: string;
  key: string;
  requestId: string;
}): BuiltRequest {
  return {
    url: `https://queue.fal.run/${args.modelId}/requests/${encodeURIComponent(args.requestId)}/response`,
    method: "GET",
    headers: { Authorization: "Key " + args.key },
  };
}

/** Parse a fal.ai image result: images[0].url. */
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
    return {
      ok: false,
      kind: "unknown",
      message: "fal.ai finished but returned no image URL. Please retry.",
    };
  }
  return { ok: true, data: { imageUrl: url, provider: "falai" as const } };
}

// ---------------------------------------------------------------------------
// Disclosures
// ---------------------------------------------------------------------------

export function getDisclosures(): string[] {
  return [
    "You bring your own API key — it stays in your browser and is sent only to the provider you choose. This site has no backend and cannot see it.",
    "OpenRouter image calls bill your OpenRouter account (roughly $0.05–$0.10 per image); the model is google/gemini-2.5-flash-image.",
    "Hugging Face calls use your HF inference credits; FLUX.1-schnell may cold-start (HTTP 503) — wait and retry.",
    "fal.ai officially recommends calling through your own server proxy; direct browser calls may be blocked by CORS — the tool will show a clear message if that happens. Video/image generations bill your fal.ai account.",
    "Image models can produce unexpected results — always review before publishing.",
  ];
}
