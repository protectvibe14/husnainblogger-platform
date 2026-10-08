/**
 * Subject Line Character Checker — pure logic (tool-406).
 *
 * WHAT THIS IS (honesty, enforced):
 * - Pure counting + truncation simulation against DOCUMENTED display
 *   thresholds (CLIENT_THRESHOLDS below). These thresholds are
 *   commonly-cited guidance from email-client UI testing lore — they are
 *   NOT guarantees from any client vendor. Mailbox apps change rendering
 *   constantly; this tool cannot verify what any specific device shows.
 * - Length is measured in Unicode code points ([...s].length), so emoji and
 *   CJK characters count as one character each (not UTF-16 code units).
 *
 * CLIENT THRESHOLDS (approximate visible characters, commonly cited):
 *   Gmail app (Android) 40 | iPhone Mail (iOS) 41 | Apple Mail (macOS) 50
 *   Outlook desktop 60 | Gmail desktop 70 | Yahoo Mail desktop 46
 * 6 clients x 1 threshold = 6 documented guidance thresholds. None are
 * client guarantees; all are approximations that shift by device and font.
 *
 * Overlong input: subjects longer than MAX_ANALYZED_CHARS code points are
 * previewed from the first MAX_ANALYZED_CHARS characters; every per-client
 * preview row shows an ellipsis marker so the truncation is visible, never
 * silent. Counts (charCount) are computed on the full input.
 */

export interface ClientThreshold {
  /** Client name shown to the user. */
  client: string;
  /** Approximate visible characters (commonly-cited guidance, NOT guaranteed). */
  visibleChars: number;
  /** Whether the client is a phone/mobile client. */
  mobile: boolean;
}

export interface PerClientRow {
  client: string;
  visibleChars: number;
  truncated: boolean;
  /** Preview of the subject as it would render, with ellipsis if cut. */
  preview: string;
}

export interface CheckerResult {
  /** Full subject as provided (possibly longer than the analyzed preview). */
  subject: string;
  /** Character count in Unicode code points. */
  charCount: number;
  wordCount: number;
  perClient: PerClientRow[];
  /** True when the subject fits every listed MOBILE client threshold. */
  fitsAllMobile: boolean;
  /** True when the input exceeded MAX_ANALYZED_CHARS and was preview-trimmed. */
  inputTrimmed: boolean;
}

/**
 * Commonly-cited visible-character display thresholds per client.
 * GUIDANCE ONLY — not vendor guarantees. Mobile set = Android Gmail app,
 * iPhone Mail (the two rows used for fitsAllMobile).
 */
export const CLIENT_THRESHOLDS: readonly ClientThreshold[] = [
  { client: "Gmail app (Android)", visibleChars: 40, mobile: true },
  { client: "iPhone Mail (iOS)", visibleChars: 41, mobile: true },
  { client: "Yahoo Mail (desktop)", visibleChars: 46, mobile: false },
  { client: "Apple Mail (macOS)", visibleChars: 50, mobile: false },
  { client: "Outlook (desktop)", visibleChars: 60, mobile: false },
  { client: "Gmail (desktop)", visibleChars: 70, mobile: false },
];

/** Max code points analyzed for per-client preview rows. */
export const MAX_ANALYZED_CHARS = 500;

/** Count Unicode code points (emoji/CJK-safe), not UTF-16 units. */
export function codePointLength(s: string): number {
  return [...s].length;
}

function takeCodePoints(s: string, n: number): string {
  return [...s].slice(0, n).join("");
}

/**
 * Check a subject line: counts + per-client truncation simulation.
 * Throws on invalid input; the mountToolUI wrapper converts to { ok: false }.
 */
export function checkSubjectLine(subject: string): CheckerResult {
  if (typeof subject !== "string") {
    throw new TypeError("subjectLine must be a string.");
  }
  const trimmed = subject.trim();
  if (trimmed.length === 0) {
    throw new RangeError("subjectLine must not be empty or whitespace-only.");
  }

  const charCount = codePointLength(subject);
  const wordCount = trimmed.split(/\s+/).filter((w) => w.length > 0).length;
  const inputTrimmed = charCount > MAX_ANALYZED_CHARS;
  const analyzable = inputTrimmed ? takeCodePoints(subject, MAX_ANALYZED_CHARS) : subject;

  const perClient: PerClientRow[] = CLIENT_THRESHOLDS.map((c) => {
    const truncated = charCount > c.visibleChars;
    const preview = truncated
      ? takeCodePoints(analyzable, c.visibleChars - 1) + "…"
      : analyzable;
    return {
      client: c.client,
      visibleChars: c.visibleChars,
      truncated,
      preview,
    };
  });

  const fitsAllMobile = CLIENT_THRESHOLDS.filter((c) => c.mobile).every(
    (c) => charCount <= c.visibleChars,
  );

  return {
    subject,
    charCount,
    wordCount,
    perClient,
    fitsAllMobile,
    inputTrimmed,
  };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * mountToolUI contract: runTool(values) -> { ok, values?, error? }.
 * values in:  { subjectLine }
 * values out: { charCount, wordCount, perClient, fitsAllMobile }
 * perClient is a table { columns, rows } for the template; fitsAllMobile a boolean.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const subjectLine = values["subjectLine"];
  if (typeof subjectLine !== "string" || subjectLine.trim().length === 0) {
    return {
      ok: false,
      error: "Please enter a subject line to check (empty input is not allowed).",
    };
  }

  let result: CheckerResult;
  try {
    result = checkSubjectLine(subjectLine);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not check the subject line.",
    };
  }

  const rows: string[][] = result.perClient.map((r) => [
    r.client,
    String(r.visibleChars),
    r.truncated ? "Yes — truncated" : "No",
    // Visible notice when the input was preview-trimmed: the ellipsis ("…")
    // always shows, plus an explicit marker, so nothing is dropped silently.
    result.inputTrimmed ? `${r.preview} … (input trimmed to 500 chars for preview)` : r.preview,
  ]);

  const fitsAllMobile = result.fitsAllMobile
    ? "Yes — the full subject shows on all listed mobile clients."
    : "No — the subject is truncated on at least one mobile client.";

  return {
    ok: true,
    values: {
      charCount: result.charCount,
      wordCount: result.wordCount,
      perClient: {
        columns: ["Email client", "Visible chars (approx.)", "Truncated?", "Preview"],
        rows,
      },
      fitsAllMobile,
    },
  };
}
