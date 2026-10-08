/**
 * Caption Readability (CPS) Checker (tool-258) — pure logic, zero imports,
 * zero network, zero DOM. Deterministic: the same cues, audience, and
 * script always yield the same verdicts.
 *
 * Honesty: CPS (characters per second) is pure arithmetic. The LIMITS below
 * are published industry standards, not measured on your video:
 *
 * === PUBLISHED THRESHOLDS ===
 *  Latin adult:   20 CPS (Netflix Timed Text Style Guide)
 *  Latin children: 17 CPS (Netflix Timed Text Style Guide)
 *  CJK:            9 CPS (Simplified Chinese guideline per the tool spec) —
 *                  the Latin 20 CPS limit is NEVER applied to CJK text.
 *  BBC's 160-180 wpm guidance is documented as context (~14-16 CPS); it is
 *  not used as a pass/fail limit here.
 *  No social short-form platform publishes an official CPS standard, so this
 *  tool offers none — any short-form figure would be invented, not a standard.
 *
 * Character counting follows the Netflix counting rule: every character
 * counts, including spaces and punctuation (multi-line cues are joined with
 * a single space, so a line break counts like a space).
 *
 * Exactly at the limit passes, noted as "pass (at limit)".
 * A cue with zero/negative duration or empty text is an input error and
 * fails the whole run (reported with the cue index).
 */

export interface CpsCueResult {
  cueIndex: number;
  cps: number;
  limit: number;
  verdict: "pass" | "pass (at limit)" | "fail (over limit)";
}

const MAX_INPUT_CHARS = 2_000_000;
const CPS_LATIN_ADULT = 20;
const CPS_LATIN_CHILDREN = 17;
const CPS_CJK = 9;
const EPS = 1e-9;

const TIMESTAMP_RE = /^(\d{1,3}):([0-5]\d):([0-5]\d)[,.](\d{1,3})$/;

function parseTimestampMs(raw: string): number | null {
  const m = TIMESTAMP_RE.exec(raw.trim());
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  const seconds = Number(m[3]);
  const millis = Number(m[4].padEnd(3, "0"));
  return ((hours * 60 + minutes) * 60 + seconds) * 1000 + millis;
}

interface ParsedCue {
  cueIndex: number;
  startMs: number;
  endMs: number;
  text: string;
}

function parseSubtitleText(raw: string): ParsedCue[] {
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  let body = normalized;
  if (/^WEBVTT[^\n]*\n/.test(body)) {
    body = body.replace(/^WEBVTT[^\n]*(\n[^\n]*)*\n\n/, "");
    if (body === normalized) body = normalized.replace(/^WEBVTT[^\n]*\n/, "");
  }
  const cues: ParsedCue[] = [];
  let cueIndex = 0;
  for (const block of body.split(/\n{2,}/)) {
    const lines = block.split("\n").map((l) => l.replace(/[ \t]+$/, ""));
    while (lines.length > 0 && lines[0].trim() === "") lines.shift();
    while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
    if (lines.length === 0) continue;
    let cursor = 0;
    if (/^\d+$/.test(lines[0].trim()) && lines[1] && lines[1].includes("-->")) {
      cursor = 1;
    } else if (lines[0].includes("-->")) {
      cursor = 0;
    } else {
      continue;
    }
    const arrow = lines[cursor].split("-->");
    if (arrow.length !== 2) continue;
    const startMs = parseTimestampMs(arrow[0]);
    const endMs = parseTimestampMs(arrow[1]);
    if (startMs === null || endMs === null) continue;
    const text = lines
      .slice(cursor + 1)
      .filter((l) => l.trim() !== "")
      .join(" ")
      .trim();
    cueIndex += 1;
    cues.push({ cueIndex, startMs, endMs, text });
  }
  return cues;
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

  const audience = typeof values["audience"] === "string" ? values["audience"] : "adult";
  if (audience !== "adult" && audience !== "children") {
    return {
      ok: false,
      error: 'Audience must be "adult" or "children".',
    };
  }
  const script = typeof values["script"] === "string" ? values["script"] : "latin";
  if (script !== "latin" && script !== "cjk") {
    return {
      ok: false,
      error: 'Script must be "latin" or "cjk".',
    };
  }

  const cues = parseSubtitleText(text);
  if (cues.length === 0) {
    return {
      ok: false,
      error: "No subtitle cues found — check the file is SRT or WebVTT with timing lines.",
    };
  }

  const limit =
    script === "cjk"
      ? CPS_CJK
      : audience === "children"
        ? CPS_LATIN_CHILDREN
        : CPS_LATIN_ADULT;

  const perCue: CpsCueResult[] = [];
  for (const cue of cues) {
    const durationSec = (cue.endMs - cue.startMs) / 1000;
    if (!(durationSec > 0)) {
      return {
        ok: false,
        error: `Cue ${cue.cueIndex} has zero or negative duration — fix its timestamps first.`,
      };
    }
    const chars = cue.text.length; // spaces + punctuation included (Netflix counting rule)
    if (chars === 0) {
      return {
        ok: false,
        error: `Cue ${cue.cueIndex} has no text — remove it or add text first.`,
      };
    }
    const cps = chars / durationSec;
    const rounded = Math.round(cps * 100) / 100;
    const verdict =
      rounded > limit + EPS
        ? "fail (over limit)"
        : Math.abs(rounded - limit) < EPS
          ? "pass (at limit)"
          : "pass";
    perCue.push({ cueIndex: cue.cueIndex, cps: rounded, limit, verdict });
  }

  const failing = perCue.filter((c) => c.verdict === "fail (over limit)");
  const overallVerdict =
    failing.length === 0
      ? `Pass — all ${perCue.length} cues are at or under ${limit} CPS.`
      : `Fail — ${failing.length} of ${perCue.length} cues are over the ${limit} CPS limit.`;

  const worstCues = [...failing]
    .sort((a, b) => b.cps - a.cps || a.cueIndex - b.cueIndex)
    .slice(0, 3)
    .map(
      (c) =>
        `Cue ${c.cueIndex}: ${c.cps.toFixed(2)} CPS — ${c.limit} limit (shorten the text or lengthen the cue).`,
    );

  return {
    ok: true,
    values: { perCue, overallVerdict, worstCues },
  };
}
