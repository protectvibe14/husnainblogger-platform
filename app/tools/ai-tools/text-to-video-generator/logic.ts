/**
 * Text-to-Video Generator (tool-548) — pure request/response logic (Lane D).
 *
 * Zero imports: no DOM, no network, no fetch. All provider behaviour is
 * covered by mocked unit tests.
 *
 * Provider: falai only.
 *  - Submit: POST https://queue.fal.run/fal-ai/veo3
 *    body {prompt, duration, aspect_ratio}
 *  - Poll:   GET https://queue.fal.run/fal-ai/veo3/requests/{id}/status
 *  - Result: GET https://queue.fal.run/fal-ai/veo3/requests/{id}/response
 *            → video.url
 *
 * Endpoint-id verification (2026-10-01):
 *  - "fal-ai/veo3" as the text-to-video endpoint: github.com/elizaos/cloud
 *    packages/content/api/video.mdx — "Default: fal-ai/veo3", "The base id
 *    is the t2v endpoint; …/image-to-video is the i2v one."
 *  - Also listed by github.com/moonlight-lupin/agent-skills
 *    (creative/clips-studio/references/fal-video-models.md) as the
 *    Veo 3 family text-to-video route.
 *  - Durations '4s' | '6s' | '8s' for veo3: github.com/TanStack/ai
 *    PR #641 (per-model typed durations for fal video models).
 *  - Queue flow: github.com/api-evangelist/fal-ai (submit →
 *    /requests/{request_id}/status → /requests/{request_id}/response),
 *    statuses IN_QUEUE / IN_PROGRESS / COMPLETED / FAILED / CANCELLED
 *    (github.com/timoncool/videosos docs/fal/pages/model-endpoints/queue.md).
 *
 * Note: fal.ai officially recommends a server proxy; direct browser calls
 * may be blocked by CORS. The client surfaces a clear message for that.
 */

export type VideoProviderId = "falai";

export function getProviders(): VideoProviderId[] {
  return ["falai"];
}

export type VideoDuration = "4s" | "6s" | "8s";
export const VIDEO_DURATIONS: readonly VideoDuration[] = ["4s", "6s", "8s"];

export type VideoAspect = "16:9" | "9:16";
export const VIDEO_ASPECTS: readonly VideoAspect[] = ["16:9", "9:16"];

export const PROMPT_MIN = 3;
export const PROMPT_MAX = 2000;

/** Verified 2026-10-01 — see header. Google Veo 3 text-to-video on fal.ai. */
export const FAL_T2V_MODEL = "fal-ai/veo3";

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

export function validateInputs(input: {
  prompt?: string;
  duration?: string;
  aspect?: string;
}): ValidationResult {
  const errors: string[] = [];
  const prompt = (input.prompt ?? "").trim();
  if (prompt.length < PROMPT_MIN) errors.push(`Describe the video in at least ${PROMPT_MIN} characters.`);
  if (prompt.length > PROMPT_MAX) errors.push(`Keep the prompt under ${PROMPT_MAX} characters.`);
  if (input.duration !== undefined && !(VIDEO_DURATIONS as readonly string[]).includes(input.duration)) {
    errors.push(`Unknown duration "${input.duration}". Pick one of: ${VIDEO_DURATIONS.join(", ")}.`);
  }
  if (input.aspect !== undefined && !(VIDEO_ASPECTS as readonly string[]).includes(input.aspect)) {
    errors.push(`Unknown aspect ratio "${input.aspect}". Pick one of: ${VIDEO_ASPECTS.join(", ")}.`);
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
// fal.ai queue API
// ---------------------------------------------------------------------------

export function buildT2vSubmitRequest(args: {
  key: string;
  prompt: string;
  duration: VideoDuration;
  aspect: VideoAspect;
}): BuiltRequest {
  return {
    url: `https://queue.fal.run/${FAL_T2V_MODEL}`,
    method: "POST",
    headers: {
      Authorization: "Key " + args.key,
      "Content-Type": "application/json",
    },
    body: {
      prompt: args.prompt,
      duration: args.duration,
      aspect_ratio: args.aspect,
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
    url: `https://queue.fal.run/${FAL_T2V_MODEL}/requests/${encodeURIComponent(args.requestId)}/status`,
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
    url: `https://queue.fal.run/${FAL_T2V_MODEL}/requests/${encodeURIComponent(args.requestId)}/response`,
    method: "GET",
    headers: { Authorization: "Key " + args.key },
  };
}

/** Parse a fal.ai video result: video.url. */
export function parseFalVideoResult(status: number, json: unknown): CallOutcome {
  const kind = mapHttpStatus(status);
  if (kind) {
    return {
      ok: false,
      kind,
      message: providerErrorMessage(json) ?? `fal.ai result fetch failed (HTTP ${status}).`,
    };
  }
  const j = (json ?? {}) as Record<string, unknown>;
  const video = j["video"] as Record<string, unknown> | undefined;
  const url = typeof video?.["url"] === "string" ? (video["url"] as string) : "";
  if (!url) {
    return {
      ok: false,
      kind: "unknown",
      message: "fal.ai finished but returned no video URL. Please retry.",
    };
  }
  return { ok: true, data: { videoUrl: url, provider: "falai" as const } };
}

// ---------------------------------------------------------------------------
// Disclosures
// ---------------------------------------------------------------------------

export function getDisclosures(): string[] {
  return [
    "You bring your own fal.ai key — it stays in your browser and is sent only to fal.ai. This site has no backend and cannot see it.",
    "Video generation bills YOUR fal.ai account per second — this is the most expensive generation category. A 6–8 second clip can cost over a dollar; check your dashboard before generating in volume.",
    "fal.ai officially recommends calling through your own server proxy; direct browser calls may be blocked by CORS — the tool will show a clear message if that happens.",
    "Model endpoint fal-ai/veo3 (Google Veo 3 text-to-video) verified 2026-10-01; if fal.ai renames it, the tool will report the provider's error.",
    "AI video is invented footage — do not use it to depict real, identifiable people or events as if real.",
  ];
}
