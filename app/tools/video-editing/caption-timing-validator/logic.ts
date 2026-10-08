/**
 * Caption Timing Validator (tool-257) — pure logic, zero imports, zero
 * network, zero DOM. Deterministic: the same subtitle text always yields
 * the same issues in the same order.
 *
 * Honesty: this is a RULE ENGINE over a cue list, not a sync analyzer. It
 * never listens to audio and never claims the cues are in sync with the
 * video — it only checks cue-to-cue timing rules.
 *
 * === PUBLISHED RULES + THRESHOLDS ===
 * Thresholds come from the Netflix Timed Text Style Guide, as verified in
 * the tool spec (2026-10-01). The BBC's 160-180 wpm guidance is used as the
 * basis for the read-rate estimate in related tools; no social short-form
 * platform publishes an official timing standard, so none is claimed here.
 *
 *  MIN_GAP_MS = 83   — warning when the gap between two cues is under
 *                      2 frames at 24 fps (Netflix 2-frame gap rule).
 *  MIN_DURATION_MS = 833 — warning when a cue is shorter than ~20 frames
 *                      at 24 fps (flash risk — hard to read).
 *  MAX_DURATION_MS = 7000 — warning when a cue exceeds 7 seconds on
 *                      screen (viewers re-read it; split it).
 *  overlap (start < previous end) -> ERROR (cues must not collide).
 *  duration <= 0 (end at or before start) -> ERROR.
 *  empty cue text -> ERROR.
 *  unparseable timing line -> the block is skipped and reported as an
 *                      ERROR on the whole run (cueIndex 0).
 *  Single-cue inputs skip gap checks (nothing to compare against).
 *
 * passFail = "pass" when there are zero ERROR issues, else "fail".
 */

export interface ParsedCue {
  cueIndex: number; // 1-based, in source order
  startMs: number;
  endMs: number;
  text: string;
}

export interface TimingIssue {
  cueIndex: number;
  rule: string;
  severity: "error" | "warning";
  message: string;
}

export interface TimingSummary {
  errors: number;
  warnings: number;
}

const MIN_GAP_MS = 83;
const MIN_DURATION_MS = 833;
const MAX_DURATION_MS = 7000;
const MAX_INPUT_CHARS = 2_000_000;

const TIMESTAMP_RE =
  /^(\d{1,3}):([0-5]\d):([0-5]\d)[,.](\d{1,3})$/;

function parseTimestampMs(raw: string): number | null {
  const m = TIMESTAMP_RE.exec(raw.trim());
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  const seconds = Number(m[3]);
  const millis = Number(m[4].padEnd(3, "0"));
  return ((hours * 60 + minutes) * 60 + seconds) * 1000 + millis;
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function parseSubtitleText(
  raw: string,
): { cues: ParsedCue[]; parseErrors: TimingIssue[] } {
  const parseErrors: TimingIssue[] = [];
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  let body = normalized;
  // Strip a WebVTT header if present (WEBVTT + optional header text, one block).
  if (/^WEBVTT[^\n]*\n/.test(body)) {
    body = body.replace(/^WEBVTT[^\n]*(\n[^\n]*)*\n\n/, "");
    if (body === normalized) body = normalized.replace(/^WEBVTT[^\n]*\n/, "");
  }
  const blocks = body.split(/\n{2,}/);
  const cues: ParsedCue[] = [];
  let cueIndex = 0;
  blocks.forEach((block, bi) => {
    const lines = block
      .split("\n")
      .map((l) => l.replace(/[ \t]+$/, ""));
    while (lines.length > 0 && lines[0].trim() === "") lines.shift();
    while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
    if (lines.length === 0) return;
    let cursor = 0;
    if (/^\d+$/.test(lines[0].trim()) && lines[1] && lines[1].includes("-->")) {
      cursor = 1; // SRT-style sequence number line
    } else if (lines[0].includes("-->")) {
      cursor = 0; // VTT-style cue line
    } else {
      return; // not a cue block (e.g. stray header text)
    }
    const arrow = lines[cursor].split("-->");
    if (arrow.length !== 2) return;
    const startMs = parseTimestampMs(arrow[0]);
    const endMs = parseTimestampMs(arrow[1]);
    if (!isFiniteNumber(startMs) || !isFiniteNumber(endMs)) {
      parseErrors.push({
        cueIndex: 0,
        rule: "unparseable-timing",
        severity: "error",
        message: `Block ${bi + 1} has an unreadable timing line and was skipped: "${lines[cursor].trim()}".`,
      });
      return;
    }
    const text = lines
      .slice(cursor + 1)
      .filter((l) => l.trim() !== "")
      .join(" ")
      .trim();
    cueIndex += 1;
    cues.push({ cueIndex, startMs, endMs, text });
  });
  return { cues, parseErrors };
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const raw = values["subtitleText"];
  const text = typeof raw === "string" ? raw : "";
  if (text.trim() === "") {
    return {
      ok: false,
      error: "Paste your subtitle text (SRT or VTT) first — the input is empty.",
    };
  }
  if (text.length > MAX_INPUT_CHARS) {
    return {
      ok: false,
      error: "That subtitle file is too large — paste a file under 2,000,000 characters.",
    };
  }

  const { cues, parseErrors } = parseSubtitleText(text);
  if (cues.length === 0) {
    return {
      ok: false,
      error: "No subtitle cues found — check the file is SRT or WebVTT with timing lines.",
    };
  }

  const issues: TimingIssue[] = [...parseErrors];
  cues.forEach((cue, i) => {
    const duration = cue.endMs - cue.startMs;

    if (!isFiniteNumber(cue.startMs) || !isFiniteNumber(cue.endMs)) {
      issues.push({
        cueIndex: cue.cueIndex,
        rule: "non-numeric-timestamp",
        severity: "error",
        message: `Cue ${cue.cueIndex} has a non-numeric timestamp.`,
      });
      return;
    }
    if (duration <= 0) {
      issues.push({
        cueIndex: cue.cueIndex,
        rule: "zero-duration",
        severity: "error",
        message: `Cue ${cue.cueIndex} ends at or before it starts — fix the timestamps.`,
      });
      return;
    }
    if (cue.text === "") {
      issues.push({
        cueIndex: cue.cueIndex,
        rule: "empty-text",
        severity: "error",
        message: `Cue ${cue.cueIndex} has a timing line but no text.`,
      });
    }
    if (duration < MIN_DURATION_MS) {
      issues.push({
        cueIndex: cue.cueIndex,
        rule: "flash-risk",
        severity: "warning",
        message: `Cue ${cue.cueIndex} lasts ${duration}ms — under ${MIN_DURATION_MS}ms viewers may not finish reading it.`,
      });
    }
    if (duration > MAX_DURATION_MS) {
      issues.push({
        cueIndex: cue.cueIndex,
        rule: "excessive-duration",
        severity: "warning",
        message: `Cue ${cue.cueIndex} lasts ${duration}ms — over ${MAX_DURATION_MS}ms; consider splitting it.`,
      });
    }
    // Gap checks are skipped for single-cue inputs (nothing to compare).
    if (i > 0 && cues.length > 1) {
      const prev = cues[i - 1];
      const gap = cue.startMs - prev.endMs;
      if (gap < 0) {
        issues.push({
          cueIndex: cue.cueIndex,
          rule: "overlap",
          severity: "error",
          message: `Cue ${cue.cueIndex} starts before cue ${prev.cueIndex} ends — the cues overlap.`,
        });
      } else if (gap < MIN_GAP_MS) {
        issues.push({
          cueIndex: cue.cueIndex,
          rule: "min-gap",
          severity: "warning",
          message: `Cue ${cue.cueIndex} starts only ${gap}ms after cue ${prev.cueIndex} — under the ${MIN_GAP_MS}ms minimum gap (Netflix 2-frame rule).`,
        });
      }
    }
  });

  const summary: TimingSummary = {
    errors: issues.filter((i) => i.severity === "error").length,
    warnings: issues.filter((i) => i.severity === "warning").length,
  };
  const passFail = summary.errors === 0 ? "pass" : "fail";

  return {
    ok: true,
    values: { issues, summary, passFail },
  };
}
