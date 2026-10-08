/**
 * Storyboard Planner (tool-277) — pure logic, zero imports, zero network,
 * zero DOM. Deterministic: same inputs always produce the same plan.
 *
 * Honesty: pure planning/allocation logic — no AI, no generated visuals.
 * It divides the total duration across script beats (one or more frames per
 * beat), cycles a fixed 6-entry camera-setup bank, and flags beats that lack
 * a visual description as TBD for the creator to fill in. This is a visual
 * frame plan per beat; the general camera shot list is tool-278's job.
 *
 * Rules (fixed):
 *  - Beats come from a textarea, one per line. An optional visual hint can
 *    follow " | ", e.g. "Intro hook | close-up of the product".
 *  - MIN_FRAME_MS = 1000 (1 second): a storyboard frame shorter than 1 s is
 *    not plannable, so beats x framesPerBeat x 1000 ms must fit the total.
 *  - Time is split evenly; leftover milliseconds are dealt out 1 ms at a
 *    time to the first frames so the plan always sums exactly to the total.
 *  - Camera setups cycle through a fixed bank of 6 in order.
 */

export interface StoryboardFrame {
  beat: string;
  visualDescription: string;
  camera: string;
  durationMs: number;
  caption: string;
}

export interface StoryboardResult {
  frames: StoryboardFrame[];
  totalCheck: string;
}

const MIN_FRAME_MS = 1000;

// Fixed camera-setup bank, 6 entries — cycled in order, never random.
const CAMERA_BANK: string[] = [
  "Wide establishing",
  "Medium shot",
  "Close-up",
  "Over-the-shoulder",
  "Point-of-view",
  "Top-down",
];

const MAX_CAPTION_CHARS = 60;

function parseBeats(raw: unknown): { text: string; hint: string }[] {
  if (typeof raw !== "string") return [];
  const beats: { text: string; hint: string }[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const sep = trimmed.indexOf(" | ");
    if (sep === -1) {
      beats.push({ text: trimmed, hint: "" });
    } else {
      beats.push({
        text: trimmed.slice(0, sep).trim(),
        hint: trimmed.slice(sep + 3).trim(),
      });
    }
  }
  return beats.filter((b) => b.text.length > 0);
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const beats = parseBeats(values["scriptBeats"]);
  if (beats.length === 0) {
    return { ok: false, error: "Add at least one script beat — one beat per line." };
  }

  const rawDur = values["totalDurationSec"];
  const totalSec = typeof rawDur === "number" ? rawDur : Number(rawDur);
  if (!Number.isFinite(totalSec) || totalSec <= 0) {
    return { ok: false, error: "Total duration must be more than 0 seconds." };
  }

  let framesPerBeat = 1; // default
  const rawFpb = values["framesPerBeat"];
  if (rawFpb !== undefined && rawFpb !== null && rawFpb !== "") {
    const n = typeof rawFpb === "number" ? rawFpb : Number(rawFpb);
    if (!Number.isFinite(n) || Math.floor(n) !== n || n < 1 || n > 5) {
      return { ok: false, error: "Frames per beat must be a whole number from 1 to 5." };
    }
    framesPerBeat = n;
  }

  const totalMs = Math.round(totalSec * 1000);
  const totalFrames = beats.length * framesPerBeat;

  if (totalFrames * MIN_FRAME_MS > totalMs) {
    return {
      ok: false,
      error:
        `Too many frames (${totalFrames}) for ${totalSec}s: the minimum frame is 1 second. ` +
        `Merge beats or lower frames per beat.`,
    };
  }

  const base = Math.floor(totalMs / totalFrames);
  const remainder = totalMs % totalFrames;

  const frames: StoryboardFrame[] = [];
  for (let b = 0; b < beats.length; b++) {
    for (let f = 0; f < framesPerBeat; f++) {
      const idx = b * framesPerBeat + f;
      const durationMs = base + (idx < remainder ? 1 : 0);
      const hint =
        beats[b].hint ||
        "TBD — describe the visual for this beat";
      frames.push({
        beat: beats[b].text,
        visualDescription:
          framesPerBeat > 1 && f > 0
            ? `${hint} (alternate angle, frame ${f + 1} of ${framesPerBeat})`
            : hint,
        camera: CAMERA_BANK[(b + f) % CAMERA_BANK.length],
        durationMs,
        caption:
          beats[b].text.length > MAX_CAPTION_CHARS
            ? beats[b].text.slice(0, MAX_CAPTION_CHARS).trimEnd() + "…"
            : beats[b].text,
      });
    }
  }

  const result: StoryboardResult = {
    frames,
    totalCheck: `${totalFrames} frame${totalFrames === 1 ? "" : "s"} planned across ${totalMs} ms — fits the ${totalSec}s total exactly.`,
  };
  return { ok: true, values: result as unknown as Record<string, unknown> };
}
