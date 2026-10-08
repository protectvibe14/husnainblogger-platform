/**
 * Talk to PDF Chatbot (tool-552) — pure request/response logic (Lane D).
 *
 * Zero imports: no DOM, no network, no fetch. Request shapes and JSON
 * parsing are unit-tested here with mocked payloads.
 *
 * Provider: gemini only (documented PDF support). OpenRouter PDF support
 * could not be verified against its docs (2026-10-01 search returned
 * nothing usable), so it is deliberately excluded — see disclosures.
 *
 * Request: POST https://generativelanguage.googleapis.com/v1beta/models/
 *   gemini-2.5-flash:generateContent?key=<KEY>   (Google's documented key
 *   pattern; the key travels in the URL, so this tool runs only over HTTPS)
 * Body:
 *   {
 *     system_instruction: { parts: [{ text: 'Answer using ONLY the
 *       attached PDF. If the answer is not in it, say so.' }] },
 *     contents: [
 *       { role: 'user', parts: [
 *           { text: 'PDF attached. ' + firstQuestion },
 *           { inline_data: { mime_type: 'application/pdf', data: <base64> } } ] },
 *       ...history  // alternating user/model turns (text only)
 *     ]
 *   }
 */

export type PdfChatProviderId = "gemini";

export function getProviders(): PdfChatProviderId[] {
  return ["gemini"];
}

export const PDF_MIME = "application/pdf";
/** 15 MB upload cap (labeled in the client). */
export const PDF_MAX_BYTES = 15 * 1024 * 1024;
export const QUESTION_MIN = 2;
export const QUESTION_MAX = 2000;
export const HISTORY_MAX_TURNS = 20;

export const PDF_SYSTEM_PROMPT =
  "Answer using ONLY the attached PDF. If the answer is not in the PDF, say so clearly and do not invent it.";

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

export interface ChatTurn {
  role: "user" | "model";
  text: string;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validatePdfFile(input: { mimeType?: string; sizeBytes?: number }): ValidationResult {
  const errors: string[] = [];
  if (input.mimeType !== PDF_MIME) {
    errors.push("Upload a real PDF file (.pdf) — other file types are not supported.");
  }
  if (typeof input.sizeBytes === "number" && input.sizeBytes > PDF_MAX_BYTES) {
    errors.push(`That PDF is over ${PDF_MAX_BYTES / 1024 / 1024} MB — upload a smaller file.`);
  }
  return { ok: errors.length === 0, errors };
}

export function validateQuestion(input: { question?: string; pdfBase64?: string }): ValidationResult {
  const errors: string[] = [];
  const q = (input.question ?? "").trim();
  if (q.length < QUESTION_MIN) errors.push("Type a question about the PDF.");
  if (q.length > QUESTION_MAX) errors.push(`Keep the question under ${QUESTION_MAX} characters.`);
  if (!input.pdfBase64) errors.push("Upload a PDF first — the model has nothing to read yet.");
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

/** Gemini error shape: {"error": {"code": 400, "message": "...", "status": "..."}} */
export function providerErrorMessage(json: unknown): string | null {
  if (!json || typeof json !== "object") return null;
  const j = json as Record<string, unknown>;
  const err = j["error"];
  if (err && typeof err === "object") {
    const msg = (err as Record<string, unknown>)["message"];
    if (typeof msg === "string" && msg.trim()) return msg.slice(0, 300);
  }
  if (typeof err === "string" && err.trim()) return err.slice(0, 300);
  const msg = j["message"];
  if (typeof msg === "string" && msg.trim()) return msg.slice(0, 300);
  return null;
}

// ---------------------------------------------------------------------------
// Gemini chat request
// ---------------------------------------------------------------------------

export function buildChatRequest(args: {
  key: string;
  pdfBase64: string;
  question: string;
  history: ChatTurn[];
}): BuiltRequest {
  const contents: unknown[] = [];
  // First turn: question + the PDF. Later turns carry history first.
  const prior: unknown[] = [];
  const trimmed = args.history.slice(-HISTORY_MAX_TURNS);
  for (const t of trimmed) {
    prior.push({ role: t.role, parts: [{ text: t.text }] });
  }
  if (prior.length === 0) {
    contents.push({
      role: "user",
      parts: [
        { text: "PDF attached. " + args.question },
        { inline_data: { mime_type: PDF_MIME, data: args.pdfBase64 } },
      ],
    });
  } else {
    for (const p of prior) contents.push(p);
    contents.push({ role: "user", parts: [{ text: args.question }] });
  }
  return {
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(args.key)}`,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      system_instruction: { parts: [{ text: PDF_SYSTEM_PROMPT }] },
      contents,
    },
  };
}

/** Extract the model's text answer (or the provider's error). */
export function parseChatResponse(status: number, json: unknown): CallOutcome {
  const kind = mapHttpStatus(status);
  if (kind) {
    return {
      ok: false,
      kind,
      message: providerErrorMessage(json) ?? `Gemini rejected the request (HTTP ${status}).`,
    };
  }
  const j = (json ?? {}) as Record<string, unknown>;
  const candidates = j["candidates"];
  if (Array.isArray(candidates) && candidates.length > 0) {
    const first = candidates[0] as Record<string, unknown>;
    const content = (first["content"] ?? {}) as Record<string, unknown>;
    const parts = content["parts"];
    if (Array.isArray(parts)) {
      const text = parts
        .map((p) => (typeof (p as Record<string, unknown>)["text"] === "string" ? ((p as Record<string, unknown>)["text"] as string) : ""))
        .join("")
        .trim();
      if (text) return { ok: true, data: { answer: text, provider: "gemini" as const } };
    }
  }
  const feedback = (j["promptFeedback"] ?? {}) as Record<string, unknown>;
  if (feedback["blockReason"]) {
    return {
      ok: false,
      kind: "bad-request",
      message: `Gemini blocked this request (${String(feedback["blockReason"])}). Try rephrasing.`,
    };
  }
  return {
    ok: false,
    kind: "unknown",
    message: "Gemini returned no answer. Please retry.",
  };
}

// ---------------------------------------------------------------------------
// Disclosures
// ---------------------------------------------------------------------------

export function getDisclosures(): string[] {
  return [
    "OpenRouter PDF support could not be verified in its docs — so this tool is Gemini-only. If you know of a verified PDF-capable OpenRouter model, check its docs yourself.",
    "You bring your own Gemini key (free tier available at Google AI Studio) — it stays in your browser and is sent only to Google. This site has no backend and cannot see it.",
    "The key travels in the request URL, which is Google's own documented pattern for the Gemini API — use this tool only over HTTPS.",
    "Your PDF is uploaded to Google's servers as part of the request. Do not upload documents you must keep private.",
    "Answers are grounded in the PDF by the system prompt, but the model can still be wrong — verify important facts against the document itself.",
  ];
}
