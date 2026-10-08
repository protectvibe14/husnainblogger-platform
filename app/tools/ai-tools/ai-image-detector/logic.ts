/**
 * AI Image Detector (tool-553) — pure logic (Lane D).
 *
 * Zero imports: no DOM, no network, no fetch. Two independent halves:
 *
 * (a) LOCAL BYTE FORENSICS — scanImageBytes(Uint8Array) walks JPEG APP
 *     segments, PNG chunks, and WebP RIFF chunks for metadata markers
 *     (EXIF, XMP, C2PA/JUMBF, Adobe 8BIM, PNG text chunks) plus a
 *     'no-metadata' signal when a JPEG carries no APP segments at all.
 *     Meanings ALWAYS say "signals, not proof" — this tool never emits a
 *     binary real/fake verdict.
 *
 * (b) OPTIONAL HIVE CLOUD CHECK — build/parse for the Hive dashboard API
 *     v2 sync task endpoint (multipart 'media' field name is UNVERIFIED —
 *     see disclosures; confirm in Hive's dashboard docs if rejected).
 *
 * Hive verification (2026-10-01):
 *  - docs.thehive.ai (Dashboard API Reference V2 — multi-model support):
 *    POST https://api.thehive.ai/api/v2/task/sync, header
 *    "authorization: token <KEY>" (lowercase per docs), multipart image.
 *  - github.com/asorakk/asora MODERATION_API_STATUS.md: same URL,
 *    auth header "authorization: token $HIVE_API_KEY", "API Keys are in
 *    Settings > API Keys".
 *  - github.com/metadist/synaplan planning doc: identical endpoint +
 *    header, model "ai_generated_detection" named as the Hive model for
 *    AI-generated-content detection.
 *  - Response: {output: [{classes: [{class: 'ai_generated', score},
 *    {class: 'not_ai_generated', score}]}]}.
 */

export type DetectorProviderId = "hive";

export function getProviders(): DetectorProviderId[] {
  return ["hive"];
}

export const HIVE_URL = "https://api.thehive.ai/api/v2/task/sync";
export const HIVE_MODEL = "ai_generated_detection";
/** Multipart field name NOT verified in Hive's docs — flagged in disclosures. */
export const HIVE_MEDIA_FIELD = "media";
export const IMAGE_MAX_BYTES = 10 * 1024 * 1024;

export type ImageFormat = "jpeg" | "png" | "webp" | "unknown";

export interface ImageSignal {
  id: string;
  label: string;
  /** Meaning — always phrased as a signal, never a verdict. */
  meaning: string;
}

export interface ScanResult {
  format: ImageFormat;
  signals: ImageSignal[];
}

// ---------------------------------------------------------------------------
// Byte helpers
// ---------------------------------------------------------------------------

function ascii(bytes: Uint8Array, start: number, length: number): string {
  let s = "";
  for (let i = 0; i < length; i++) {
    const b = bytes[start + i];
    if (b === undefined) break;
    s += String.fromCharCode(b);
  }
  return s;
}

function u16be(bytes: Uint8Array, at: number): number {
  return ((bytes[at] ?? 0) << 8) | (bytes[at + 1] ?? 0);
}

function u32be(bytes: Uint8Array, at: number): number {
  return (
    (((bytes[at] ?? 0) << 24) | ((bytes[at + 1] ?? 0) << 16) | ((bytes[at + 2] ?? 0) << 8) | (bytes[at + 3] ?? 0)) >>>
    0
  );
}

function u32le(bytes: Uint8Array, at: number): number {
  return (
    (((bytes[at + 3] ?? 0) << 24) |
      ((bytes[at + 2] ?? 0) << 16) |
      ((bytes[at + 1] ?? 0) << 8) |
      (bytes[at] ?? 0)) >>>
    0
  );
}

function containsBytes(haystack: Uint8Array, needle: string): boolean {
  if (needle.length === 0) return false;
  outer: for (let i = 0; i + needle.length <= haystack.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle.charCodeAt(j)) continue outer;
    }
    return true;
  }
  return false;
}

function startsWithBytes(bytes: Uint8Array, needle: string): boolean {
  if (bytes.length < needle.length) return false;
  for (let i = 0; i < needle.length; i++) {
    if (bytes[i] !== needle.charCodeAt(i)) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Signal catalog (meanings: signals, never verdicts)
// ---------------------------------------------------------------------------

const SIGNAL_EXIF: ImageSignal = {
  id: "exif",
  label: "EXIF metadata present",
  meaning:
    "The file carries EXIF camera/device metadata. AI generators sometimes add or strip it, and so do many exporters — a signal, not proof either way.",
};

const SIGNAL_XMP: ImageSignal = {
  id: "xmp",
  label: "XMP metadata present",
  meaning:
    "An XMP metadata block was found — photo editors commonly write this. A signal, not proof of origin.",
};

const SIGNAL_C2PA: ImageSignal = {
  id: "c2pa",
  label: "C2PA provenance marker present",
  meaning:
    "A C2PA/JUMBF content-credentials marker was found, indicating provenance metadata was embedded at some point. A signal, not proof — C2PA data can also be removed.",
};

const SIGNAL_ADOBE: ImageSignal = {
  id: "adobe",
  label: "Adobe metadata present",
  meaning:
    "Adobe (Photoshop/IRB) metadata was found — the file passed through Adobe software. A signal, not proof of anything about who made the image.",
};

const SIGNAL_PNG_TEXT: ImageSignal = {
  id: "png-text",
  label: "Embedded text chunks present",
  meaning:
    "PNG text chunks (tEXt/iTXt) with descriptive metadata were found. A signal, not proof — any tool can write or strip these.",
};

const SIGNAL_NO_METADATA: ImageSignal = {
  id: "no-metadata",
  label: "No metadata segments found",
  meaning:
    "This JPEG carries no APP metadata segments. AI generators often strip metadata, but so do many exporters, optimizers, and social platforms — absence is a weak signal, never proof.",
};

const SIGNAL_UNKNOWN: ImageSignal = {
  id: "unrecognized",
  label: "File not recognized",
  meaning:
    "Could not recognize this file as JPEG, PNG, or WebP — no forensic check is possible, so no signals can be reported. This is not a verdict about the image.",
};

// ---------------------------------------------------------------------------
// Format detection
// ---------------------------------------------------------------------------

export function detectFormat(bytes: Uint8Array): ImageFormat {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") {
    return "webp";
  }
  return "unknown";
}

// ---------------------------------------------------------------------------
// JPEG scan — walk segments, inspect APPn
// ---------------------------------------------------------------------------

function scanJpeg(bytes: Uint8Array): ImageSignal[] {
  const found: ImageSignal[] = [];
  const seen = new Set<string>();
  let hasApp = false;
  let offset = 2; // past SOI
  const push = (s: ImageSignal) => {
    if (!seen.has(s.id)) {
      seen.add(s.id);
      found.push(s);
    }
  };

  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1] ?? 0;
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue; // standalone markers, no length
    }
    const segLen = u16be(bytes, offset + 2);
    if (segLen < 2) break;
    const dataStart = offset + 4;
    const dataEnd = offset + 2 + segLen;
    if (dataEnd > bytes.length) break;
    const data = bytes.subarray(dataStart, dataEnd);

    if (marker >= 0xe0 && marker <= 0xef) {
      hasApp = true;
      if (marker === 0xe1) {
        if (startsWithBytes(data, "Exif\0\0")) push(SIGNAL_EXIF);
        if (containsBytes(data, "http://ns.adobe.com/xap/1.0/")) push(SIGNAL_XMP);
      }
      if (marker === 0xeb) {
        if (containsBytes(data, "JUMBF") || containsBytes(data, "jumb") || containsBytes(data, "c2pa")) {
          push(SIGNAL_C2PA);
        }
      }
      if (marker === 0xed) {
        if (startsWithBytes(data, "Photoshop 3.0\0")) push(SIGNAL_ADOBE);
      }
    }
    offset = dataEnd;
    if (marker === 0xda) break; // SOS — scan data follows
  }

  if (!hasApp) push(SIGNAL_NO_METADATA);
  return found;
}

// ---------------------------------------------------------------------------
// PNG scan — walk chunks
// ---------------------------------------------------------------------------

function scanPng(bytes: Uint8Array): ImageSignal[] {
  const found: ImageSignal[] = [];
  const seen = new Set<string>();
  const push = (s: ImageSignal) => {
    if (!seen.has(s.id)) {
      seen.add(s.id);
      found.push(s);
    }
  };
  let offset = 8; // past signature
  let guard = 0;
  while (offset + 12 <= bytes.length && guard < 1000) {
    guard++;
    const length = u32be(bytes, offset);
    const type = ascii(bytes, offset + 4, 4);
    const dataEnd = offset + 8 + length;
    if (dataEnd + 4 > bytes.length) break;
    if (type === "tEXt" || type === "iTXt") push(SIGNAL_PNG_TEXT);
    if (type === "eXIf") push(SIGNAL_EXIF);
    if (type === "c2pa") push(SIGNAL_C2PA);
    if (type === "IEND") break;
    offset = dataEnd + 4;
  }
  return found;
}

// ---------------------------------------------------------------------------
// WebP scan — walk RIFF chunks
// ---------------------------------------------------------------------------

function scanWebp(bytes: Uint8Array): ImageSignal[] {
  const found: ImageSignal[] = [];
  const seen = new Set<string>();
  const push = (s: ImageSignal) => {
    if (!seen.has(s.id)) {
      seen.add(s.id);
      found.push(s);
    }
  };
  let offset = 12; // past RIFF....WEBP
  let guard = 0;
  while (offset + 8 <= bytes.length && guard < 1000) {
    guard++;
    const fourcc = ascii(bytes, offset, 4);
    const size = u32le(bytes, offset + 4);
    if (fourcc === "EXIF") push(SIGNAL_EXIF);
    if (fourcc === "XMP ") push(SIGNAL_XMP);
    offset += 8 + size + (size % 2);
  }
  return found;
}

/** Local forensics — signals only, never a real/fake verdict. */
export function scanImageBytes(bytes: Uint8Array): ScanResult {
  const format = detectFormat(bytes);
  if (format === "jpeg") return { format, signals: scanJpeg(bytes) };
  if (format === "png") return { format, signals: scanPng(bytes) };
  if (format === "webp") return { format, signals: scanWebp(bytes) };
  return { format: "unknown", signals: [SIGNAL_UNKNOWN] };
}

// ---------------------------------------------------------------------------
// Hive cloud check (optional, multipart)
// ---------------------------------------------------------------------------

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
  /** Multipart field names (client builds FormData; includes 'model' text field). */
  formFields?: string[];
  body?: unknown;
}

export interface CallOutcome {
  ok: boolean;
  kind?: FetchErrorKind;
  message?: string;
  data?: Record<string, unknown>;
}

export function validateImageFile(input: { mimeType?: string; sizeBytes?: number }): ValidationResult {
  const errors: string[] = [];
  if (!input.mimeType || !/^image\//.test(input.mimeType)) {
    errors.push("Upload a real image file (JPEG, PNG, or WebP).");
  }
  if (typeof input.sizeBytes === "number" && input.sizeBytes > IMAGE_MAX_BYTES) {
    errors.push(`That image is over ${IMAGE_MAX_BYTES / 1024 / 1024} MB — upload a smaller file.`);
  }
  return { ok: errors.length === 0, errors };
}

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
  const msg = j["message"];
  if (typeof msg === "string" && msg.trim()) return msg.slice(0, 300);
  const err = j["error"];
  if (typeof err === "string" && err.trim()) return err.slice(0, 300);
  return null;
}

/**
 * Hive sync task request. Multipart: field HIVE_MEDIA_FIELD (file) plus a
 * 'model' text field. The header is lowercase "authorization: token <KEY>"
 * per Hive's docs. The 'media' field name is UNVERIFIED — see disclosures.
 */
export function buildHiveRequest(args: { key: string; model?: string }): BuiltRequest {
  return {
    url: HIVE_URL,
    method: "POST",
    headers: { authorization: "token " + args.key },
    formFields: [HIVE_MEDIA_FIELD, "model"],
    body: { model: args.model ?? HIVE_MODEL },
  };
}

export interface HiveScores {
  aiGenerated: number;
  notAiGenerated: number;
}

/** Extract ai_generated / not_ai_generated scores from output[0].classes. */
export function parseHiveResponse(status: number, json: unknown): CallOutcome {
  const kind = mapHttpStatus(status);
  if (kind) {
    return {
      ok: false,
      kind,
      message: providerErrorMessage(json) ?? `Hive rejected the check (HTTP ${status}).`,
    };
  }
  const j = (json ?? {}) as Record<string, unknown>;
  const output = j["output"];
  if (Array.isArray(output) && output.length > 0) {
    const classes = (output[0] as Record<string, unknown>)["classes"];
    if (Array.isArray(classes)) {
      let ai: number | null = null;
      let not: number | null = null;
      for (const c of classes) {
        const item = c as Record<string, unknown>;
        if (item["class"] === "ai_generated" && typeof item["score"] === "number") ai = item["score"];
        if (item["class"] === "not_ai_generated" && typeof item["score"] === "number") not = item["score"];
      }
      if (ai !== null && not !== null) {
        return {
          ok: true,
          data: {
            scores: { aiGenerated: ai, notAiGenerated: not } as HiveScores,
            provider: "hive" as const,
          },
        };
      }
    }
  }
  return {
    ok: false,
    kind: "unknown",
    message: "Hive answered without detection scores. Please retry.",
  };
}

// ---------------------------------------------------------------------------
// Disclosures
// ---------------------------------------------------------------------------

export function getDisclosures(): string[] {
  return [
    "Local forensics report SIGNALS, not proof — this tool never says an image is definitively AI-generated or real. Metadata is trivially stripped or faked.",
    "The Hive cloud check is optional and also not definitive — no detector is. Treat any score as one hint among many.",
    "The Hive multipart field name ('media') could not be verified in Hive's docs — if the check fails, confirm the field name in your Hive dashboard docs.",
    "You bring your own Hive key — it stays in your browser and is sent only to Hive's API. This site has no backend and cannot see it.",
    "Browser calls are not officially documented for Hive (CORS unverified) — if your browser blocks the call you will see a clear error.",
    "The Hive check uploads your image to Hive's servers; the local scan never leaves your browser.",
  ];
}
