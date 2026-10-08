/**
 * Slideshow Timing Planner (tool-265) — pure logic, zero imports,
 * zero network, zero DOM. Deterministic: same inputs always yield the
 * same timeline.
 *
 * Honesty: this is pure ARITHMETIC timeline allocation, not a rendered
 * slideshow. It divides the total duration into per-slide holds plus
 * transitions (non-overlapping model: sum(holds) + transitions = total).
 * Integer milliseconds are distributed with the largest-remainder method
 * so the plan always sums to the total exactly. It never renders media
 * and the holds exclude export/render time.
 *
 * holdStyle "weightedByText" allocates hold time proportional to each
 * slide's character count (min weight 10 so empty slides still get a
 * beat); it requires the textLengths input (comma-separated character
 * counts, one per slide).
 */

const HOLD_STYLES: string[] = ["equal", "weightedByText"];

function toNumber(raw: unknown): number {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string" && raw.trim() !== "") return Number(raw.trim());
  return NaN;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

interface TimelineRow {
  slide: number;
  startMs: number;
  endMs: number;
  transitionMs: number;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const slideCount = toNumber(values["slideCount"]);
  if (!Number.isFinite(slideCount) || Math.floor(slideCount) !== slideCount) {
    return { ok: false, error: "Slide count must be a whole number of 1 or more." };
  }
  if (slideCount < 1) {
    return { ok: false, error: "Slide count must be at least 1." };
  }

  const totalDurationSec = toNumber(values["totalDurationSec"]);
  if (!Number.isFinite(totalDurationSec)) {
    return { ok: false, error: "Enter the total duration in seconds (a number above 0)." };
  }
  if (totalDurationSec <= 0) {
    return { ok: false, error: `Total duration must be above 0 seconds — got ${totalDurationSec}.` };
  }
  const totalMs = Math.round(totalDurationSec * 1000);

  const rawTransition = values["transitionMs"];
  const transitionMs =
    rawTransition === undefined || rawTransition === null || rawTransition === ""
      ? 500
      : toNumber(rawTransition);
  if (!Number.isFinite(transitionMs)) {
    return { ok: false, error: "Transition must be a number of milliseconds (0 or more)." };
  }
  if (transitionMs < 0) {
    return { ok: false, error: `Transition cannot be negative — got ${transitionMs}.` };
  }

  const rawStyle = values["holdStyle"];
  const holdStyle =
    typeof rawStyle === "string" ? rawStyle.trim() : "";
  if (!HOLD_STYLES.includes(holdStyle)) {
    return {
      ok: false,
      error: `Unknown hold style "${typeof rawStyle === "string" ? rawStyle : ""}". Pick one of: ${HOLD_STYLES.join(", ")}.`,
    };
  }

  const transitionsTotal = Math.round(transitionMs) * (slideCount - 1);
  if (transitionsTotal >= totalMs) {
    return {
      ok: false,
      error:
        `Transitions eat the whole duration: ${slideCount - 1} transitions x ${Math.round(transitionMs)}ms = ` +
        `${fmt(transitionsTotal)}ms, but the total is only ${fmt(totalMs)}ms. Shorten the transitions or lengthen the total.`,
    };
  }
  const avail = totalMs - transitionsTotal;

  // Per-slide holds (integer ms, largest-remainder so the sum is exact).
  const holds: number[] = new Array(slideCount).fill(0);
  let holdLabel: string;
  if (holdStyle === "equal") {
    const perHold = avail / slideCount;
    if (Math.round(transitionMs) >= perHold) {
      return {
        ok: false,
        error:
          `Transition (${Math.round(transitionMs)}ms) must be shorter than each slide's hold ` +
          `(${fmt(Math.floor(perHold))}ms) — shorten it or lengthen the total.`,
      };
    }
    const base = Math.floor(perHold);
    let remainder = avail - base * slideCount;
    for (let i = 0; i < slideCount; i++) {
      holds[i] = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
    }
    holdLabel = `equal holds of ~${fmt(base)}ms each`;
  } else {
    const rawLengths = values["textLengths"];
    if (typeof rawLengths !== "string" || rawLengths.trim() === "") {
      return {
        ok: false,
        error: "Weighted-by-text needs per-slide text lengths: enter comma-separated character counts (one per slide).",
      };
    }
    const parts = rawLengths.split(/[,\n;]+/).map((p) => p.trim()).filter((p) => p !== "");
    if (parts.length !== slideCount) {
      return {
        ok: false,
        error: `Got ${parts.length} text length(s) but ${slideCount} slide(s) — provide exactly one character count per slide.`,
      };
    }
    const lengths: number[] = [];
    for (const p of parts) {
      const n = Number(p);
      if (!Number.isFinite(n) || n < 0) {
        return {
          ok: false,
          error: `Text lengths must be character counts (0 or more) — got "${p}".`,
        };
      }
      lengths.push(Math.max(n, 10)); // min weight so empty slides still get a beat
    }
    const weightSum = lengths.reduce((a, b) => a + b, 0);
    const exact = lengths.map((w) => (avail * w) / weightSum);
    for (let i = 0; i < slideCount; i++) {
      if (Math.round(transitionMs) >= exact[i]) {
        return {
          ok: false,
          error:
            `Transition (${Math.round(transitionMs)}ms) must be shorter than each slide's hold — ` +
            `slide ${i + 1} would only get ${fmt(Math.floor(exact[i] as number))}ms. Shorten the transition or lengthen the total.`,
        };
      }
    }
    const base = exact.map((e) => Math.floor(e));
    let remainder = avail - base.reduce((a, b) => a + b, 0);
    const order = exact
      .map((e, i) => ({ i, frac: e - Math.floor(e) }))
      .sort((a, b) => b.frac - a.frac || a.i - b.i);
    for (const o of order) {
      if (remainder <= 0) break;
      base[o.i] = (base[o.i] as number) + 1;
      remainder--;
    }
    for (let i = 0; i < slideCount; i++) holds[i] = base[i] as number;
    holdLabel = `weighted-by-text holds (${lengths.map((l) => fmt(l)).join(", ")} chars)`;
  }

  const timeline: TimelineRow[] = [];
  let cursor = 0;
  for (let i = 0; i < slideCount; i++) {
    const hold = holds[i] as number;
    const end = cursor + hold;
    timeline.push({
      slide: i + 1,
      startMs: cursor,
      endMs: end,
      transitionMs: i < slideCount - 1 ? Math.round(transitionMs) : 0,
    });
    cursor = end + (i < slideCount - 1 ? Math.round(transitionMs) : 0);
  }

  const notes: string[] = [];
  if (slideCount === 1) {
    notes.push("Single slide — the transition is skipped.");
  }
  const shortHolds = timeline.filter((r) => r.endMs - r.startMs < 1500).length;
  if (shortHolds > 0) {
    notes.push(
      `${shortHolds} slide(s) hold under 1.5s — viewers may not finish reading the slide text.`,
    );
  }

  const holdsSum = holds.reduce((a, b) => a + b, 0);
  const totalCheck =
    `Plan: ${slideCount} slide(s) over ${fmt(totalMs)}ms total. ` +
    `Holds: ${holdLabel}. ` +
    `Transitions: ${slideCount - 1} x ${Math.round(transitionMs)}ms. ` +
    `Check: ${fmt(holdsSum)}ms holds + ${fmt(transitionsTotal)}ms transitions = ${fmt(totalMs)}ms total.` +
    (notes.length > 0 ? ` Notes: ${notes.join(" ")}` : "");

  return {
    ok: true,
    values: { timeline, totalCheck },
  };
}
