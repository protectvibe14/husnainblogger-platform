/**
 * SRT → WebVTT converter — pure logic module (zero dependencies).
 *
 * Parses SubRip (.srt) subtitle text, validates structure, and converts to
 * WebVTT (.vtt) per the W3C WebVTT spec (file starts with `WEBVTT`,
 * timestamps use `HH:MM:SS.mmm` with dot decimals).
 *
 * SubRip is a de-facto format (no formal spec); validation below follows the
 * widely-observed convention: numeric sequence, `HH:MM:SS,mmm --> HH:MM:SS,mmm`
 * timing line (comma decimals), one or more text lines, blocks separated by
 * blank lines.
 *
 * @module srt-to-vtt-converter/logic
 */

/** Severity of a conversion issue. */
export type IssueSeverity = "error" | "warning";

/** One problem found while parsing/converting. */
export interface SrtIssue {
  /** "error" = cue dropped or conversion impossible; "warning" = recovered. */
  severity: IssueSeverity;
  /** 1-based source block number the issue belongs to (0 = whole-file). */
  block: number;
  /** Stable machine-readable code, e.g. "MALFORMED_TIMESTAMP". */
  code: string;
  /** Human-readable explanation. */
  message: string;
}

/** A successfully parsed subtitle cue. */
export interface SrtCue {
  /** Sequence number (as written, or assigned in source order when missing). */
  sequence: number;
  /** Cue start in milliseconds. */
  startMs: number;
  /** Cue end in milliseconds. */
  endMs: number;
  /** Cue text lines, in order. */
  text: string[];
}

/** Result of parsing an SRT document. */
export interface SrtParseResult {
  cues: SrtCue[];
  errors: SrtIssue[];
  warnings: SrtIssue[];
}

/** Result of the full SRT → WebVTT conversion. */
export interface SrtToVttResult {
  /** Complete WebVTT document text. Always starts with `WEBVTT`. */
  vtt: string;
  /** Number of cues in `vtt`. */
  cueCount: number;
  errors: SrtIssue[];
  warnings: SrtIssue[];
}

/** Hard cap on input size to protect the browser main thread. */
export const MAX_INPUT_CHARS = 2_000_000;

/**
 * Regex for an SRT/VTT timestamp. SRT uses a comma decimal separator;
 * a dot is accepted leniently (with a warning). Hours may be 1-3 digits;
 * minutes/seconds must be 00-59; milliseconds 1-3 digits.
 */
const TIMESTAMP_RE =
  /^(\d{1,3}):([0-5]\d):([0-5]\d)[,.](\d{1,3})$/;

/**
 * Parse a timestamp string into milliseconds.
 * @returns milliseconds, or null when the format is invalid.
 */
export function parseTimestamp(raw: string): number | null {
  const m = TIMESTAMP_RE.exec(raw.trim());
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  const seconds = Number(m[3]);
  const millis = Number(m[4].padEnd(3, "0"));
  return ((hours * 60 + minutes) * 60 + seconds) * 1000 + millis;
}

/**
 * Format milliseconds as a WebVTT timestamp (`HH:MM:SS.mmm`).
 */
export function msToVttTimestamp(ms: number): string {
  const total = Math.max(0, Math.floor(ms));
  const millis = total % 1000;
  const seconds = Math.floor(total / 1000) % 60;
  const minutes = Math.floor(total / 60000) % 60;
  const hours = Math.floor(total / 3600000);
  const pad = (n: number, w: number): string => String(n).padStart(w, "0");
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(millis, 3)}`;
}

function issue(
  severity: IssueSeverity,
  block: number,
  code: string,
  message: string,
): SrtIssue {
  return { severity, block, code, message };
}

/**
 * Parse SRT text into cues, collecting errors and warnings.
 * Never throws on malformed input — problems are reported in the result.
 */
export function parseSrt(input: string): SrtParseResult {
  const errors: SrtIssue[] = [];
  const warnings: SrtIssue[] = [];
  const cues: SrtCue[] = [];

  if (typeof input !== "string") {
    errors.push(issue("error", 0, "NOT_A_STRING", "Input must be a string."));
    return { cues, errors, warnings };
  }
  if (input.length > MAX_INPUT_CHARS) {
    errors.push(
      issue(
        "error",
        0,
        "INPUT_TOO_LARGE",
        `Input exceeds the ${MAX_INPUT_CHARS.toLocaleString()}-character limit.`,
      ),
    );
    return { cues, errors, warnings };
  }

  // Normalize line endings: CRLF and lone CR → LF. Unicode text is preserved as-is.
  const normalized = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  if (normalized.trim() === "") {
    errors.push(issue("error", 0, "EMPTY_INPUT", "Input is empty — nothing to convert."));
    return { cues, errors, warnings };
  }

  const blocks = normalized.split(/\n{2,}/);
  let expectedSequence = 1;
  let prevStartMs = -1;
  let prevEndMs = -1;

  blocks.forEach((rawBlock, idx) => {
    const blockNo = idx + 1;
    const lines = rawBlock.split("\n");
    // Drop leading/trailing blank lines inside the block (block split may leave them).
    while (lines.length > 0 && lines[0].trim() === "") lines.shift();
    while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();
    if (lines.length === 0) return;

    let cursor = 0;
    let sequence: number;

    // Line 1: sequence number — or, leniently, a timestamp line when numbering is absent.
    const firstLine = lines[0].trim();
    if (/^\d+$/.test(firstLine)) {
      sequence = Number(firstLine);
      cursor = 1;
      if (sequence !== expectedSequence) {
        warnings.push(
          issue(
            "warning",
            blockNo,
            "NON_SEQUENTIAL_NUMBERING",
            `Sequence number ${sequence} is not the expected ${expectedSequence}; numbering may be duplicated or have gaps.`,
          ),
        );
      }
    } else if (firstLine.includes("-->")) {
      sequence = expectedSequence;
      warnings.push(
        issue(
          "warning",
          blockNo,
          "MISSING_SEQUENCE_NUMBER",
          `Block has no sequence number; assigned ${sequence} from source order.`,
        ),
      );
    } else {
      errors.push(
        issue(
          "error",
          blockNo,
          "MALFORMED_BLOCK",
          `Block does not start with a sequence number or a timing line; block skipped.`,
        ),
      );
      return;
    }

    // Timing line.
    const timingLine = (lines[cursor] ?? "").trim();
    const arrowParts = timingLine.split("-->");
    if (arrowParts.length !== 2) {
      errors.push(
        issue(
          "error",
          blockNo,
          "MISSING_TIMING_LINE",
          `Expected a timing line like "00:00:01,000 --> 00:00:04,000"; block skipped.`,
        ),
      );
      return;
    }
    const [rawStart, rawEnd] = arrowParts.map((p) => p.trim());
    if (rawStart.includes(".") || rawEnd.includes(".")) {
      warnings.push(
        issue(
          "warning",
          blockNo,
          "DOT_DECIMAL_SEPARATOR",
          `Timing uses dot decimals (WebVTT style); SRT convention is a comma. Accepted and converted.`,
        ),
      );
    }
    const startMs = parseTimestamp(rawStart);
    const endMs = parseTimestamp(rawEnd);
    if (startMs === null || endMs === null) {
      errors.push(
        issue(
          "error",
          blockNo,
          "MALFORMED_TIMESTAMP",
          `Timing "${timingLine}" is not valid HH:MM:SS,mmm; block skipped.`,
        ),
      );
      return;
    }
    if (endMs <= startMs) {
      errors.push(
        issue(
          "error",
          blockNo,
          "NON_POSITIVE_DURATION",
          `End time is not after start time; cue skipped.`,
        ),
      );
      return;
    }
    if (prevEndMs >= 0 && startMs < prevEndMs) {
      warnings.push(
        issue(
          "warning",
          blockNo,
          "OVERLAPPING_CUES",
          `Cue starts (${msToVttTimestamp(startMs)}) before the previous cue ends (${msToVttTimestamp(prevEndMs)}).`,
        ),
      );
    }
    if (prevStartMs >= 0 && startMs < prevStartMs) {
      warnings.push(
        issue(
          "warning",
          blockNo,
          "OUT_OF_ORDER",
          `Cue starts before the previous cue's start; cues may be out of order.`,
        ),
      );
    }

    // Text lines (may be multiple). Trailing whitespace per line is trimmed;
    // interior spacing and all unicode are preserved byte-identical.
    const text = lines
      .slice(cursor + 1)
      .map((l) => l.replace(/[ \t]+$/, ""))
      .filter((l, i, arr) => !(l === "" && i === arr.length - 1));
    if (text.length === 0 || text.every((l) => l === "")) {
      warnings.push(
        issue("warning", blockNo, "EMPTY_CUE_TEXT", `Cue has a timing line but no text.`),
      );
    }

    cues.push({ sequence, startMs, endMs, text });
    expectedSequence = sequence + 1;
    prevStartMs = startMs;
    prevEndMs = endMs;
  });

  if (cues.length === 0 && errors.length === 0) {
    errors.push(
      issue("error", 0, "NO_VALID_CUES", "No valid subtitle cues were found in the input."),
    );
  }

  return { cues, errors, warnings };
}

/**
 * Convert SRT text to a WebVTT document.
 * @returns `{ vtt, cueCount, errors, warnings }`. `vtt` always begins with
 * the `WEBVTT` header, even when errors left zero cues.
 */
export function convertSrtToVtt(input: string): SrtToVttResult {
  const { cues, errors, warnings } = parseSrt(input);
  const parts: string[] = ["WEBVTT", ""];
  for (const cue of cues) {
    parts.push(
      `${msToVttTimestamp(cue.startMs)} --> ${msToVttTimestamp(cue.endMs)}`,
      ...cue.text,
      "",
    );
  }
  return { vtt: parts.join("\n"), cueCount: cues.length, errors, warnings };
}

/**
 * Contract adapter for the tool runtime. Reads `values.srtText` (required),
 * converts it, and returns the contract shape. Never throws.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const raw = values["srtText"];
  if (typeof raw !== "string" || raw.trim() === "") {
    return {
      ok: false,
      error: "Paste your SRT subtitle text first — the input is empty.",
    };
  }
  const result = convertSrtToVtt(raw);
  return {
    ok: true,
    values: {
      vtt: result.vtt,
      cueCount: result.cueCount,
      errors: result.errors,
      warnings: result.warnings,
    },
  };
}
