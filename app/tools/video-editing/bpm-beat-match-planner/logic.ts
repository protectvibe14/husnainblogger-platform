/**
 * BPM Beat-Match Planner (tool-268) — pure logic, zero imports, zero
 * network, zero DOM. Deterministic: same inputs always yield the same
 * markers.
 *
 * Honesty: PURE MATH — beatIntervalMs = 60000 / BPM. Cut points are
 * ARITHMETIC MARKERS, not detected beats: no audio is analyzed, so tempo
 * drift, swing, or live-timing wobble in the real track will not be
 * reflected. The UI must say the markers assume a constant tempo.
 *
 * === PUBLISHED FORMULAS ===
 *  beatIntervalMs = 60000 / bpm (rounded to 2 decimals).
 *  Beat k lands at introOffsetMs + k * beatIntervalMs, for k = 0.. while the
 *   beat stays within the track duration (inclusive of the final ms).
 *  totalBeats = number of such beats.
 *  Cut points = beats whose 0-based index is a multiple of cutEveryNBeats
 *   (beat 0 — the first beat after the intro offset — counts as cut 1).
 *  bpm > 200 -> warning note: cuts this frequent can feel frantic.
 */

interface TimelineMarker {
  marker: string;
  timeMs: number;
  beatNumber: number;
  note: string;
}

function toFiniteNumber(raw: unknown): number {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string" && raw.trim() !== "") return Number(raw.trim());
  return NaN;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const bpm = toFiniteNumber(values["bpm"]);
  if (!Number.isFinite(bpm) || bpm < 30 || bpm > 300) {
    return { ok: false, error: "BPM must be a number between 30 and 300." };
  }

  const durationSec = toFiniteNumber(values["trackDurationSec"]);
  if (!Number.isFinite(durationSec) || durationSec <= 0) {
    return { ok: false, error: "Track duration must be a positive number of seconds." };
  }
  if (durationSec > 3600) {
    return { ok: false, error: "Track duration is capped at 3600 seconds (1 hour) to keep the marker list usable." };
  }

  const rawOffset = values["introOffsetSec"];
  const introOffsetSec =
    rawOffset === undefined || rawOffset === null || rawOffset === ""
      ? 0
      : toFiniteNumber(rawOffset);
  if (!Number.isFinite(introOffsetSec) || introOffsetSec < 0) {
    return { ok: false, error: "Intro offset must be 0 or a positive number of seconds." };
  }
  if (introOffsetSec >= durationSec) {
    return {
      ok: false,
      error: `Intro offset (${introOffsetSec} s) is beyond the track duration (${durationSec} s) — there are no beats left to mark.`,
    };
  }

  const rawCut = values["cutEveryNBeats"];
  const cutEveryNBeats =
    rawCut === undefined || rawCut === null || rawCut === ""
      ? 4
      : toFiniteNumber(rawCut);
  if (!Number.isFinite(cutEveryNBeats) || !Number.isInteger(cutEveryNBeats) || cutEveryNBeats < 1) {
    return { ok: false, error: "Cut every N beats must be a whole number of 1 or more." };
  }

  const beatIntervalMs = Math.round((60000 / bpm) * 100) / 100;
  const offsetMs = introOffsetSec * 1000;
  const durationMs = durationSec * 1000;

  // Beat k (0-based) at offsetMs + k * beatIntervalMs, while <= durationMs.
  const beatTimesMs: number[] = [];
  let k = 0;
  for (;;) {
    const t = offsetMs + k * beatIntervalMs;
    if (t > durationMs + 0.5) break;
    beatTimesMs.push(t);
    k += 1;
  }
  const totalBeats = beatTimesMs.length;

  const cutPointsMs: number[] = [];
  const timelineMarkers: TimelineMarker[] = [];
  let cutIndex = 0;
  for (let i = 0; i < beatTimesMs.length; i += 1) {
    if (i % cutEveryNBeats !== 0) continue;
    const timeMs = Math.round(beatTimesMs[i]);
    cutIndex += 1;
    cutPointsMs.push(timeMs);
    timelineMarkers.push({
      marker: `Cut ${cutIndex}`,
      timeMs,
      beatNumber: i,
      note:
        cutIndex === 1 && bpm > 200
          ? "BPM over 200 — cuts this frequent can feel frantic; try cutting every 8 beats instead."
          : "",
    });
  }

  return {
    ok: true,
    values: {
      beatIntervalMs,
      cutPointsMs,
      totalBeats,
      timelineMarkers,
    },
  };
}
