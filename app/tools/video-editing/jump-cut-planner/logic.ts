/**
 * logic.ts — Jump Cut Planner (tool-284)
 *
 * Pure, deterministic engine. ZERO imports.
 *
 * What this honestly is: pure timestamp arithmetic over transcript
 * segments. The tool finds two kinds of cuts:
 *
 *   1. Whole-segment filler cuts — a segment whose text is made entirely of
 *      filler words ("um", "uh", "like", ...) is cut whole. Detection is
 *      TEXT-PATTERN matching only, not speech analysis: the tool never
 *      listens to audio and cannot see where inside a segment a filler
 *      word falls, so it only cuts segments that are entirely filler.
 *   2. Pause cuts — the silent gap between two segments. If the gap exceeds
 *      the aggressiveness threshold, the excess is cut, keeping a short
 *      keep-margin so speech does not feel clipped.
 *
 * Aggressiveness thresholds (fixed rules):
 *   light  — filler set: um/uh/hmm/er/ah/oh/mmm;  pause > 2000ms, keep 400ms margin
 *   medium — adds like/well/so/right/okay/basically/actually/...; pause > 1200ms, keep 300ms
 *   tight  — adds phrases ("you know", "i mean") + repeated words; pause > 700ms, keep 200ms
 *
 * If cuts would remove more than 60% of the total duration, a warning is
 * emitted — that usually means the transcript (or thresholds) is wrong.
 *
 * Output is deterministic: same inputs always produce the same cut plan.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

interface Seg { text: string; startMs: number; endMs: number; }

const LIGHT_FILLERS = ["um", "uh", "hmm", "er", "ah", "oh", "mmm"];
const MEDIUM_EXTRA = ["like", "well", "so", "right", "okay", "yeah", "yep", "nope",
  "basically", "actually", "literally", "seriously", "honestly", "whatever", "anyways", "huh", "uh-huh"];
const TIGHT_PHRASES = ["you know", "i mean", "kind of", "sort of", "if you will", "let me see"];

const AGGRO: Record<string, { fillers: string[]; phrases: string[]; pauseMs: number; keepMargin: number; repeats: boolean }> = {
  light: { fillers: LIGHT_FILLERS, phrases: [], pauseMs: 2000, keepMargin: 400, repeats: false },
  medium: { fillers: LIGHT_FILLERS.concat(MEDIUM_EXTRA), phrases: [], pauseMs: 1200, keepMargin: 300, repeats: false },
  tight: { fillers: LIGHT_FILLERS.concat(MEDIUM_EXTRA), phrases: TIGHT_PHRASES, pauseMs: 700, keepMargin: 200, repeats: true },
};

function parseTranscript(v: unknown): Seg[] | string {
  let raw: unknown = v;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return "Could not read the transcript — the textarea must contain a JSON array like [{\"text\":\"hello\",\"startMs\":0,\"endMs\":900}].";
    }
  }
  if (!Array.isArray(raw) || raw.length === 0) {
    return "Add at least 1 transcript segment: {\"text\":\"...\",\"startMs\":0,\"endMs\":900}.";
  }
  const segs: Seg[] = [];
  for (let i = 0; i < raw.length; i++) {
    const s = raw[i] as Record<string, unknown>;
    const text = typeof s.text === "string" ? s.text.trim() : "";
    const startMs = Number(s.startMs);
    const endMs = Number(s.endMs);
    if (!text) return `Segment ${i + 1}: text must be non-empty.`;
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs < 0 || endMs <= startMs) {
      return `Segment ${i + 1}: need startMs >= 0 and endMs > startMs.`;
    }
    segs.push({ text, startMs, endMs });
  }
  for (let i = 1; i < segs.length; i++) {
    if (segs[i].startMs < segs[i - 1].startMs) {
      return `Segments must be in ascending order — segment ${i + 1} starts before segment ${i}.`;
    }
  }
  return segs;
}

function isPureFiller(text: string, cfg: (typeof AGGRO)["light"]): boolean {
  let clean = text.toLowerCase().replace(/[.,!?;:"()—–-]/g, " ");
  for (const p of cfg.phrases) clean = clean.split(p).join(" ");
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  return words.every((w) => cfg.fillers.includes(w));
}

function hasRepeatedWord(text: string): boolean {
  return /(\b\w+\b)\s+\1/i.test(text);
}

export function runTool(values: Record<string, unknown>): RunResult {
  const parsed = parseTranscript(values.transcriptWithTimestamps);
  if (typeof parsed === "string") return { ok: false, error: parsed };
  const segs = parsed;
  const aggressiveness = typeof values.aggressiveness === "string" ? values.aggressiveness.trim().toLowerCase() : "";
  const cfg = AGGRO[aggressiveness];
  if (!cfg) return { ok: false, error: "Aggressiveness must be \"light\", \"medium\", or \"tight\"." };

  const cutSegments: { startMs: number; endMs: number; reason: string }[] = [];

  for (const s of segs) {
    if (isPureFiller(s.text, cfg)) {
      cutSegments.push({
        startMs: s.startMs,
        endMs: s.endMs,
        reason: "filler words — text-pattern match only (the tool cannot hear audio); verify by listening",
      });
    } else if (cfg.repeats && hasRepeatedWord(s.text)) {
      cutSegments.push({
        startMs: s.startMs,
        endMs: s.endMs,
        reason: "repeated word — text-pattern match only; verify by listening",
      });
    }
  }

  for (let i = 1; i < segs.length; i++) {
    const prev = segs[i - 1];
    const curr = segs[i];
    const gap = curr.startMs - prev.endMs;
    if (gap > cfg.pauseMs) {
      const half = cfg.keepMargin / 2;
      cutSegments.push({
        startMs: prev.endMs + half,
        endMs: curr.startMs - half,
        reason: `pause of ${Math.round(gap)}ms (threshold ${cfg.pauseMs}ms for ${aggressiveness})`,
      });
    }
  }

  cutSegments.sort((a, b) => a.startMs - b.startMs);

  // keepSegments = complement of cutSegments over [first.startMs, last.endMs].
  const keepSegments: { startMs: number; endMs: number }[] = [];
  let cursor = segs[0].startMs;
  for (const c of cutSegments) {
    if (c.startMs > cursor) keepSegments.push({ startMs: cursor, endMs: c.startMs });
    cursor = Math.max(cursor, c.endMs);
  }
  if (cursor < segs[segs.length - 1].endMs) {
    keepSegments.push({ startMs: cursor, endMs: segs[segs.length - 1].endMs });
  }

  const totalMs = segs[segs.length - 1].endMs - segs[0].startMs;
  const cutMs = cutSegments.reduce((s, c) => s + (c.endMs - c.startMs), 0);
  const newDurationSec = Math.round(((totalMs - cutMs) / 1000) * 100) / 100;
  const cutCount = cutSegments.length;
  const cutPct = totalMs > 0 ? (cutMs / totalMs) * 100 : 0;

  const warnings: string[] = [];
  if (cutPct > 60) {
    warnings.push(
      `This plan removes ${Math.round(cutPct)}% of the footage (over the 60% safety line). That usually means the transcript has too many filler-only segments or the timestamps are wrong — switch to a lighter aggressiveness or verify the transcript.`
    );
  }

  return { ok: true, values: { keepSegments, cutSegments, newDurationSec, cutCount, warnings } };
}
