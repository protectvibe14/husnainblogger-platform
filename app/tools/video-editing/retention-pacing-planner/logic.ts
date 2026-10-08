/**
 * Retention Pacing Planner (tool-279) — pure logic, zero imports, zero
 * network, zero DOM. Deterministic: same inputs always produce the same plan.
 *
 * Honesty: heuristic planning only — segment templates are hand-written
 * fractions inspired by commonly published retention-pattern advice (hook
 * early, change the pattern, end with a CTA). pacingScore is a RULE-BASED
 * heuristic guidance score (0-100). It is NOT a predicted retention
 * percentage and must never be presented as one.
 *
 * Pacing-score heuristic (fixed, documented):
 *   start at 55
 *   +8  if the hook segment is <= 5000 ms (fast hook)
 *   +8  if patternChangeCount >= 4 (enough pattern changes)
 *   +8  if the final segment is a CTA (ends with a next step)
 *   +7  if the average segment is <= 30000 ms (tight pacing)
 *   -10 if the micro pattern was used (under 15 s, one idea only)
 *   clamped to 0-100 and rounded.
 *
 * Micro rule: totalDurationSec < 15 uses a compact 3-segment pattern with a
 * note, instead of stretching a full template.
 */

export interface PacingSegment {
  startMs: number;
  endMs: number;
  purpose: string;
  beatType: string;
}

export interface PacingResult {
  segments: PacingSegment[];
  patternChangeCount: number;
  pacingScore: number;
  guidanceNotes: string[];
}

interface TemplateSegment {
  f0: number;
  f1: number;
  purpose: string; // "{n}" = niche slot
  beatType: string;
}

const HOOK_LOOP: TemplateSegment[] = [
  { f0: 0.0, f1: 0.08, purpose: "Hook — state the payoff of this {n} video in the first seconds.", beatType: "hook" },
  { f0: 0.08, f1: 0.25, purpose: "Open loop — promise what is coming next.", beatType: "open-loop" },
  { f0: 0.25, f1: 0.5, purpose: "Payoff 1 — deliver the first concrete win.", beatType: "payoff" },
  { f0: 0.5, f1: 0.58, purpose: "Re-hook — restate the next loop before attention dips.", beatType: "re-hook" },
  { f0: 0.58, f1: 0.9, purpose: "Payoff 2 — deliver the deeper {n} value.", beatType: "payoff" },
  { f0: 0.9, f1: 1.0, purpose: "CTA — one clear next step for the viewer.", beatType: "cta" },
];

const STORY_ARC: TemplateSegment[] = [
  { f0: 0.0, f1: 0.12, purpose: "Setup — introduce the world of this {n} story.", beatType: "setup" },
  { f0: 0.12, f1: 0.4, purpose: "Rising action — build tension step by step.", beatType: "rising" },
  { f0: 0.4, f1: 0.6, purpose: "Twist — the unexpected turn that resets attention.", beatType: "twist" },
  { f0: 0.6, f1: 0.85, purpose: "Climax — the peak {n} moment.", beatType: "climax" },
  { f0: 0.85, f1: 1.0, purpose: "Resolution + CTA — land the ending and convert.", beatType: "cta" },
];

const MICRO: TemplateSegment[] = [
  { f0: 0.0, f1: 0.2, purpose: "Hook — the single promise of this {n} clip.", beatType: "hook" },
  { f0: 0.2, f1: 0.85, purpose: "The one idea — deliver it with zero filler.", beatType: "payoff" },
  { f0: 0.85, f1: 1.0, purpose: "CTA — one next step.", beatType: "cta" },
];

function listicleTemplate(durationSec: number): TemplateSegment[] {
  const itemCount = Math.min(8, Math.max(3, Math.round(durationSec / 25)));
  const segs: TemplateSegment[] = [
    { f0: 0.0, f1: 0.06, purpose: "Hook — promise N takeaways from this {n} list.", beatType: "hook" },
  ];
  const span = 0.8 - 0.06;
  for (let i = 0; i < itemCount; i++) {
    segs.push({
      f0: 0.06 + (span * i) / itemCount,
      f1: 0.06 + (span * (i + 1)) / itemCount,
      purpose: `Item ${i + 1} of ${itemCount} — one {n} point, one mini-payoff.`,
      beatType: "item",
    });
  }
  segs.push(
    { f0: 0.8, f1: 0.92, purpose: "Recap — the fastest summary of the list.", beatType: "recap" },
    { f0: 0.92, f1: 1.0, purpose: "CTA — one clear next step for the viewer.", beatType: "cta" }
  );
  return segs;
}

const PATTERNS = ["hook-loop", "story-arc", "listicle"] as const;

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawDur = values["totalDurationSec"];
  const totalSec = typeof rawDur === "number" ? rawDur : Number(rawDur);
  if (!Number.isFinite(totalSec) || totalSec < 5 || totalSec > 3600) {
    return { ok: false, error: "Duration must be between 5 seconds and 3600 seconds (1 hour)." };
  }

  const pattern = typeof values["pattern"] === "string" ? values["pattern"].trim().toLowerCase() : "";
  if (!(PATTERNS as readonly string[]).includes(pattern)) {
    return { ok: false, error: "Pick a pattern: hook-loop, story-arc, or listicle." };
  }

  const rawNiche = values["niche"];
  const niche = typeof rawNiche === "string" && rawNiche.trim() ? rawNiche.trim() : "your topic";

  const guidanceNotes: string[] = [];
  let template: TemplateSegment[];
  if (totalSec < 15) {
    template = MICRO;
    guidanceNotes.push(
      "Under 15 seconds: the compact micro-pattern is used — one hook, one idea, one CTA. Do not stretch a full template into a short."
    );
  } else if (pattern === "hook-loop") {
    template = HOOK_LOOP;
    guidanceNotes.push("Hook-loop works best when every payoff teases the next loop — never fully close a loop until the end.");
  } else if (pattern === "story-arc") {
    template = STORY_ARC;
    guidanceNotes.push("Story-arc needs a real twist around the 40-60% mark — without it the middle sags.");
  } else {
    template = listicleTemplate(totalSec);
    guidanceNotes.push("Listicle items should shrink slightly as the list goes on — save a strong item for last.");
  }
  guidanceNotes.push(
    "pacingScore is a heuristic guidance score (0-100), not a predicted retention percentage."
  );

  const totalMs = Math.round(totalSec * 1000);
  const bounds = template.map((s) => Math.round(s.f0 * totalMs));
  bounds.push(totalMs);

  const segments: PacingSegment[] = template.map((s, i) => ({
    startMs: bounds[i],
    endMs: bounds[i + 1],
    purpose: s.purpose.split("{n}").join(niche),
    beatType: s.beatType,
  }));

  const patternChangeCount = segments.length - 1;

  // Heuristic pacing score (documented above).
  let score = 55;
  if (segments[0].endMs - segments[0].startMs <= 5000) score += 8;
  if (patternChangeCount >= 4) score += 8;
  if (segments[segments.length - 1].beatType === "cta") score += 8;
  if (totalMs / segments.length <= 30000) score += 7;
  if (template === MICRO) score -= 10;
  const pacingScore = Math.min(100, Math.max(0, Math.round(score)));

  const result: PacingResult = { segments, patternChangeCount, pacingScore, guidanceNotes };
  return { ok: true, values: result as unknown as Record<string, unknown> };
}
