/**
 * AI Music Generator (tool-550) — pure request/response logic (Lane D).
 *
 * Zero imports: no DOM, no network, no fetch. All request shapes and JSON
 * parsing are unit-tested here with mocked payloads.
 *
 * Honest design: Suno offers no official public API. This tool targets the
 * widely-used third-party "Suno-compatible" convention (POST
 * {base}/api/v1/generate → {code:200, data:{taskId}}; poll
 * GET {base}/api/v1/generate/record-info?taskId= → data.status +
 * response.sunoData[].audioUrl). The user pastes their own base URL + key.
 *
 * Convention verification (2026-10-01):
 *  - github.com/pico190/sunoapi-sdk — "Every creation method returns
 *    { taskId }"; POST /api/v1/generate, GET /api/v1/generate/record-info.
 *  - wanhuahua0108/claude_audio_share SKILL.md — base
 *    https://api.sunoapi.org, auth "Authorization: Bearer $SUNO_API_KEY",
 *    poll every 30s; models V4 / V4_5 / V4_5PLUS / V4_5ALL / V5 / V5_5.
 *  - the-smg/dj-music-plugin (.claude/rules/suno.md) — SunoAPI contract
 *    from docs.sunoapi.org: create POST /api/v1/generate (customMode,
 *    instrumental, model required); status GET
 *    /api/v1/generate/record-info?taskId= (PENDING, TEXT_SUCCESS,
 *    FIRST_SUCCESS, SUCCESS, failure states); audio variants under
 *    response.sunoData[] (id, audioUrl, streamAudioUrl, title, tags,
 *    duration).
 *  - bitdoze/bitdoze-skills kie-ai SKILL.md — kie.ai uses the same shape:
 *    POST api.kie.ai/api/v1/generate {prompt, customMode:false,
 *    instrumental, model:"V4"}, GET …/generate/record-info?taskId=,
 *    SUCCESS → track audioUrls.
 *
 * The user picks the compatible provider; the base URL is theirs to
 * confirm against that provider's docs.
 */

export type MusicProviderId = "custom-music-api";

export function getProviders(): MusicProviderId[] {
  return ["custom-music-api"];
}

/** localStorage key for the user-pasted compatible-API base URL. */
export const MUSIC_ENDPOINT_STORAGE_KEY = "hb-music-endpoint";

export const PROMPT_MIN = 3;
export const PROMPT_MAX = 500;
export const MUSIC_MODEL = "V4_5";

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

export interface MusicTrack {
  id: string;
  title: string;
  audioUrl: string;
  streamAudioUrl: string;
  duration: number | null;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/** Normalize a pasted base URL: trim whitespace and trailing slashes. */
export function normalizeBaseUrl(base: string): string {
  return (base ?? "").trim().replace(/\/+$/, "");
}

export function validateInputs(input: { prompt?: string; base?: string; instrumental?: boolean }): ValidationResult {
  const errors: string[] = [];
  const prompt = (input.prompt ?? "").trim();
  if (prompt.length < PROMPT_MIN) errors.push(`Describe the music in at least ${PROMPT_MIN} characters.`);
  if (prompt.length > PROMPT_MAX) errors.push(`Keep the prompt under ${PROMPT_MAX} characters.`);
  const base = normalizeBaseUrl(input.base ?? "");
  if (!base) {
    errors.push("Paste your Suno-compatible API base URL first (e.g. https://api.sunoapi.org).");
  } else if (!/^https?:\/\/.+\..+/.test(base)) {
    errors.push("That base URL does not look valid — it must start with http:// or https://.");
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
  const msg = j["msg"];
  if (typeof msg === "string" && msg.trim()) return msg.slice(0, 300);
  for (const k of ["message", "error"]) {
    const v = j[k];
    if (typeof v === "string" && v.trim()) return v.slice(0, 300);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Generate — POST {base}/api/v1/generate
// ---------------------------------------------------------------------------

export function buildGenerateRequest(args: {
  base: string;
  key: string;
  prompt: string;
  instrumental: boolean;
}): BuiltRequest {
  return {
    url: `${normalizeBaseUrl(args.base)}/api/v1/generate`,
    method: "POST",
    headers: {
      Authorization: "Bearer " + args.key,
      "Content-Type": "application/json",
    },
    body: {
      prompt: args.prompt,
      customMode: false,
      instrumental: args.instrumental,
      model: MUSIC_MODEL,
    },
  };
}

export function parseGenerateResponse(status: number, json: unknown): CallOutcome {
  const httpKind = mapHttpStatus(status);
  if (httpKind) {
    return {
      ok: false,
      kind: httpKind,
      message: providerErrorMessage(json) ?? `The music API rejected the request (HTTP ${status}).`,
    };
  }
  const j = (json ?? {}) as Record<string, unknown>;
  const code = j["code"];
  const data = (j["data"] ?? {}) as Record<string, unknown>;
  const taskId = typeof data["taskId"] === "string" ? (data["taskId"] as string) : "";
  if (code !== 200 || !taskId) {
    return {
      ok: false,
      kind: "bad-request",
      message: providerErrorMessage(json) ?? "The music API did not return a task id. Check your base URL and key.",
    };
  }
  return { ok: true, data: { taskId, provider: "custom-music-api" as const } };
}

// ---------------------------------------------------------------------------
// Record info — GET {base}/api/v1/generate/record-info?taskId=
// ---------------------------------------------------------------------------

export function buildRecordInfoRequest(args: { base: string; key: string; taskId: string }): BuiltRequest {
  return {
    url: `${normalizeBaseUrl(args.base)}/api/v1/generate/record-info?taskId=${encodeURIComponent(args.taskId)}`,
    method: "GET",
    headers: { Authorization: "Bearer " + args.key },
  };
}

export type MusicTaskState = "PENDING" | "WORKING" | "DONE" | "FAILED" | "UNKNOWN";

function taskState(raw: string): MusicTaskState {
  if (raw === "PENDING" || raw === "TEXT_SUCCESS" || raw === "FIRST_SUCCESS") return "WORKING";
  if (raw === "SUCCESS") return "DONE";
  if (raw === "FAILED" || raw === "SENSITIVE_WORD_ERROR" || raw === "CREATE_TASK_FAILED") return "FAILED";
  return "UNKNOWN";
}

/** ok=true while pending/working (not done yet) and when done. */
export function parseRecordInfoResponse(status: number, json: unknown): CallOutcome {
  const httpKind = mapHttpStatus(status);
  if (httpKind) {
    return {
      ok: false,
      kind: httpKind,
      message: providerErrorMessage(json) ?? `Status check failed (HTTP ${status}).`,
    };
  }
  const j = (json ?? {}) as Record<string, unknown>;
  if (j["code"] !== undefined && j["code"] !== 200) {
    return {
      ok: false,
      kind: "bad-request",
      message: providerErrorMessage(json) ?? "The music API reported an error for this task.",
    };
  }
  const data = (j["data"] ?? {}) as Record<string, unknown>;
  const raw = typeof data["status"] === "string" ? (data["status"] as string) : "UNKNOWN";
  const state = taskState(raw);
  if (state === "FAILED") {
    return {
      ok: false,
      kind: "server-error",
      message: providerErrorMessage(data) ?? `Generation failed (status: ${raw}). Try a different prompt.`,
    };
  }
  if (state !== "DONE") {
    return { ok: true, data: { done: false, state, rawStatus: raw } };
  }
  const response = (data["response"] ?? {}) as Record<string, unknown>;
  const sunoData = response["sunoData"];
  const tracks: MusicTrack[] = [];
  if (Array.isArray(sunoData)) {
    for (const t of sunoData) {
      const item = t as Record<string, unknown>;
      const audioUrl = typeof item["audioUrl"] === "string" ? (item["audioUrl"] as string) : "";
      if (!audioUrl) continue;
      tracks.push({
        id: typeof item["id"] === "string" ? (item["id"] as string) : "",
        title: typeof item["title"] === "string" ? (item["title"] as string) : "Untitled",
        audioUrl,
        streamAudioUrl: typeof item["streamAudioUrl"] === "string" ? (item["streamAudioUrl"] as string) : "",
        duration: typeof item["duration"] === "number" ? (item["duration"] as number) : null,
      });
    }
  }
  if (tracks.length === 0) {
    return {
      ok: false,
      kind: "unknown",
      message: "The task finished but returned no audio. Please retry.",
    };
  }
  return { ok: true, data: { done: true, tracks } };
}

// ---------------------------------------------------------------------------
// Disclosures
// ---------------------------------------------------------------------------

export function getDisclosures(): string[] {
  return [
    "Suno offers no official API — this tool uses the widely-used third-party Suno-compatible convention. Confirm your provider's docs for the exact base URL and endpoints.",
    "You paste your own base URL and key; both stay in your browser (localStorage) and are sent only to the provider you chose. This site has no backend and cannot see them.",
    "Music generation bills YOUR compatible-API account (usually in credits per generation).",
    "Each generation usually returns two song variations — listen to both and keep the one you like.",
    "Browser support depends on your chosen provider's CORS policy — if your browser blocks the call you will see a clear error.",
  ];
}
