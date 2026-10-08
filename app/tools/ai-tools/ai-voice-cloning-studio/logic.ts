/**
 * AI Voice Cloning Studio (tool-547) — pure request/response logic (Lane D).
 *
 * Zero imports: no DOM, no network, no fetch. The browser client builds
 * FormData for the multipart calls and parses audio bytes itself; all
 * request shapes and JSON parsing are unit-tested here with mocks.
 *
 * Provider: elevenlabs only.
 *  - Add voice:  POST https://api.elevenlabs.io/v1/voices/add
 *                headers {xi-api-key} — multipart FormData built by the
 *                client from formFields ['name','files'] (+ optional
 *                'description'). → {voice_id}
 *  - Test key:   GET https://api.elevenlabs.io/v1/user
 *  - TTS:        POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
 *                headers {xi-api-key, Content-Type: application/json,
 *                Accept: audio/mpeg}, body {text, model_id} → audio bytes.
 *
 * CORS is unverified for browser calls (see providers.ts) — the client has
 * a graceful error path. Voice cloning requires a paid plan on most
 * ElevenLabs tiers; only clone voices you own or have permission for.
 */

export type VoiceProviderId = "elevenlabs";

export function getProviders(): VoiceProviderId[] {
  return ["elevenlabs"];
}

export const VOICE_NAME_MIN = 1;
export const VOICE_NAME_MAX = 64;
export const TTS_TEXT_MIN = 1;
export const TTS_TEXT_MAX = 2500;

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

/**
 * Request descriptor. For multipart calls the client builds FormData from
 * formFields; for JSON calls it stringifies body.
 */
export interface BuiltRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
  /** Multipart field names (client builds FormData from these). */
  formFields?: string[];
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

export function validateAddVoiceInputs(input: { name?: string; fileCount?: number }): ValidationResult {
  const errors: string[] = [];
  const name = (input.name ?? "").trim();
  if (name.length < VOICE_NAME_MIN) errors.push("Give your voice a name.");
  if (name.length > VOICE_NAME_MAX) errors.push(`Keep the voice name under ${VOICE_NAME_MAX} characters.`);
  if (!input.fileCount || input.fileCount < 1) {
    errors.push("Upload at least one audio sample — a minute or more of clear speech works best.");
  }
  return { ok: errors.length === 0, errors };
}

export function validateTtsInputs(input: { text?: string; voiceId?: string }): ValidationResult {
  const errors: string[] = [];
  if (!input.voiceId || !input.voiceId.trim()) errors.push("Create a voice first — no voice_id yet.");
  const text = (input.text ?? "").trim();
  if (text.length < TTS_TEXT_MIN) errors.push("Type something for the voice to say.");
  if (text.length > TTS_TEXT_MAX) errors.push(`Keep the text under ${TTS_TEXT_MAX} characters.`);
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

/**
 * ElevenLabs error shape: {"detail": {"status": "...", "message": "...", "code": "..."}}
 * plus generic fallbacks.
 */
export function providerErrorMessage(json: unknown): string | null {
  if (!json || typeof json !== "object") return null;
  const j = json as Record<string, unknown>;
  const detail = j["detail"];
  if (detail && typeof detail === "object") {
    const msg = (detail as Record<string, unknown>)["message"];
    if (typeof msg === "string" && msg.trim()) return msg.slice(0, 300);
  }
  if (typeof detail === "string" && detail.trim()) return detail.slice(0, 300);
  for (const k of ["error", "message"]) {
    const v = j[k];
    if (typeof v === "string" && v.trim()) return v.slice(0, 300);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Add voice (multipart)
// ---------------------------------------------------------------------------

export const ELEVENLABS_ADD_VOICE_URL = "https://api.elevenlabs.io/v1/voices/add";
export const ELEVENLABS_TTS_MODEL = "elevenlabs_multilingual_v2";

/**
 * Multipart request — the client builds FormData: 'name' (string) and
 * 'files' (one or more audio File objects). No Content-Type header here:
 * the browser sets the multipart boundary itself.
 */
export function buildAddVoiceRequest(args: { key: string; name: string }): BuiltRequest {
  return {
    url: ELEVENLABS_ADD_VOICE_URL,
    method: "POST",
    headers: { "xi-api-key": args.key },
    formFields: ["name", "files"],
  };
}

export function parseAddVoiceResponse(status: number, json: unknown): CallOutcome {
  const kind = mapHttpStatus(status);
  if (kind) {
    return {
      ok: false,
      kind,
      message: providerErrorMessage(json) ?? `ElevenLabs rejected the voice (HTTP ${status}).`,
    };
  }
  const j = (json ?? {}) as Record<string, unknown>;
  const voiceId = typeof j["voice_id"] === "string" ? (j["voice_id"] as string) : "";
  if (!voiceId) {
    return {
      ok: false,
      kind: "unknown",
      message: "ElevenLabs answered without a voice_id. Please retry.",
    };
  }
  return { ok: true, data: { voiceId, provider: "elevenlabs" as const } };
}

// ---------------------------------------------------------------------------
// Test key — GET /v1/user
// ---------------------------------------------------------------------------

export function buildUserRequest(args: { key: string }): BuiltRequest {
  return {
    url: "https://api.elevenlabs.io/v1/user",
    method: "GET",
    headers: { "xi-api-key": args.key },
  };
}

export function parseUserResponse(status: number, json: unknown): CallOutcome {
  const kind = mapHttpStatus(status);
  if (kind) {
    return {
      ok: false,
      kind,
      message: providerErrorMessage(json) ?? `ElevenLabs rejected the key (HTTP ${status}).`,
    };
  }
  const j = (json ?? {}) as Record<string, unknown>;
  const sub = (j["subscription"] ?? {}) as Record<string, unknown>;
  const tier = typeof sub["tier"] === "string" ? (sub["tier"] as string) : "unknown";
  const count = typeof sub["character_count"] === "number" ? (sub["character_count"] as number) : null;
  const limit = typeof sub["character_limit"] === "number" ? (sub["character_limit"] as number) : null;
  return { ok: true, data: { tier, characterCount: count, characterLimit: limit } };
}

// ---------------------------------------------------------------------------
// Text-to-speech (audio bytes)
// ---------------------------------------------------------------------------

export function buildTtsRequest(args: { key: string; voiceId: string; text: string }): BuiltRequest {
  return {
    url: "https://api.elevenlabs.io/v1/text-to-speech/" + encodeURIComponent(args.voiceId),
    method: "POST",
    headers: {
      "xi-api-key": args.key,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: { text: args.text, model_id: ELEVENLABS_TTS_MODEL },
  };
}

/**
 * TTS returns audio bytes on success (client converts arrayBuffer → Blob).
 * Called when the status is an error or the content-type is not audio.
 */
export function parseTtsStatus(status: number, json: unknown, contentType: string): CallOutcome {
  if (status >= 200 && status < 300 && /^audio\//i.test(contentType)) {
    return { ok: true, data: { bytes: true, provider: "elevenlabs" as const } };
  }
  const kind = mapHttpStatus(status) ?? "unknown";
  return {
    ok: false,
    kind,
    message: providerErrorMessage(json) ?? `ElevenLabs TTS failed (HTTP ${status}).`,
  };
}

// ---------------------------------------------------------------------------
// Disclosures
// ---------------------------------------------------------------------------

export function getDisclosures(): string[] {
  return [
    "You bring your own ElevenLabs key — it stays in your browser and is sent only to ElevenLabs. This site has no backend and cannot see it.",
    "Voice cloning usually requires a paid ElevenLabs plan — the free tier (about 10,000 credits/month) may not include instant voice cloning.",
    "Browser calls are not officially documented by ElevenLabs (CORS unverified) — if your browser blocks the call you will see a clear error.",
    "Consent: only clone YOUR OWN voice or a voice you have explicit permission to clone. Misuse can violate the law.",
    "Usage bills YOUR ElevenLabs account in characters/credits.",
  ];
}
