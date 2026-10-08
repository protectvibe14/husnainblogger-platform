/**
 * Script Outline Builder — pure logic (tool-112).
 *
 * Builder tool: runTool({ items }).
 * - Item 1 is the VIDEO SETUP item: topic (required), targetMinutes
 *   (default 10), format (tutorial | review | vlog | essay, default tutorial).
 * - Items 2+ are SECTION items: sectionTitle (required), sectionType
 *   (hook | setup | value | payoff | cta), talkingPoints (optional notes).
 * - If no section items are given, the tool emits the fixed scaffold for the
 *   chosen format instead.
 *
 * ASSUMPTIONS (documented for honesty):
 * - Zero imports, no DOM, no network, no Date.now(), no Math.random.
 *   Deterministic: same items -> same outline.
 * - This is a TEMPLATE SCAFFOLD. Beats are slots (titles + slot guidance),
 *   NOT generated prose — the tool never writes your script for you and
 *   nothing here is AI-generated.
 * - Section word budgets use the fixed 150 wpm narration convention
 *   (an estimate) from tool-111, and fixed per-type shares
 *   (hook 5% / setup 10% / value 60% / payoff 15% / cta 10%), split evenly
 *   when several sections share a type.
 * - MAX_ITEMS = 30 (1 setup + 29 sections).
 */

/** Fixed narration convention for word budgets (estimate, not a rule). */
export const WPM = 150;
/** 1 setup item + up to 29 section items. */
export const MAX_ITEMS = 30;
/** Max characters for a talking-points field. */
export const MAX_TALKING_POINTS = 500;

export const FORMATS = ["tutorial", "review", "vlog", "essay"] as const;
export type OutlineFormat = (typeof FORMATS)[number];

export const SECTION_TYPES = ["hook", "setup", "value", "payoff", "cta"] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

/** Fixed share of total words per section type (planning convention). */
export const TYPE_SHARES: Record<SectionType, number> = {
  hook: 0.05,
  setup: 0.1,
  value: 0.6,
  payoff: 0.15,
  cta: 0.1,
};

interface ScaffoldSection {
  type: SectionType;
  title: string;
  slot: string;
}

/** Fixed scaffolds: slots, not prose. One per supported format. */
export const FORMAT_SCAFFOLDS: Record<OutlineFormat, ScaffoldSection[]> = {
  tutorial: [
    { type: "hook", title: "Cold-open hook", slot: "State the end result the viewer will get — no greeting, no intro." },
    { type: "setup", title: "Quick intro + roadmap", slot: "Who this is for, and the 3 steps you will cover." },
    { type: "value", title: "Step 1", slot: "One concrete step: what to do, where to click, what good looks like." },
    { type: "value", title: "Step 2", slot: "One concrete step: what to do, where to click, what good looks like." },
    { type: "value", title: "Step 3", slot: "One concrete step: what to do, where to click, what good looks like." },
    { type: "payoff", title: "Recap the result", slot: "Show the finished outcome again so viewers leave with it." },
    { type: "cta", title: "Call to action", slot: "One ask: subscribe, watch the next video, or click the link." },
  ],
  review: [
    { type: "hook", title: "Cold-open hook", slot: "Your verdict up front in one sentence — earn the click." },
    { type: "setup", title: "What you are reviewing", slot: "The product, price, and who it is (and is not) for." },
    { type: "value", title: "Key features", slot: "The 2-3 features that actually matter, shown on camera or screen." },
    { type: "value", title: "Pros", slot: "Genuine strengths from your own testing." },
    { type: "value", title: "Cons", slot: "Honest weaknesses — this is what makes a review trustworthy." },
    { type: "value", title: "Who should buy / skip", slot: "Match the product to viewer types, not everyone." },
    { type: "payoff", title: "Final verdict", slot: "Buy, skip, or wait — restated with the one reason why." },
    { type: "cta", title: "Call to action", slot: "One ask: subscribe, comparison video, or the link below." },
  ],
  vlog: [
    { type: "hook", title: "Cold-open hook", slot: "The most interesting moment of the day, first — tease it." },
    { type: "setup", title: "Where you are + plan", slot: "Location, context, and what today is about in 2 sentences." },
    { type: "value", title: "Beat 1", slot: "First story beat: what happens, who is there, why it matters." },
    { type: "value", title: "Beat 2", slot: "Second story beat: raise the stakes or change the scene." },
    { type: "value", title: "Beat 3", slot: "Third story beat: the peak moment of the day." },
    { type: "payoff", title: "Reflection", slot: "What changed or what you learned — the point of the day." },
    { type: "cta", title: "Call to action", slot: "One ask: subscribe, comment your take, or tomorrow's vlog." },
  ],
  essay: [
    { type: "hook", title: "Cold-open hook", slot: "The provocative claim or question the essay will defend." },
    { type: "setup", title: "Thesis statement", slot: "Your position in one clear sentence, plus the roadmap." },
    { type: "value", title: "Argument 1", slot: "First supporting argument with your best example or evidence." },
    { type: "value", title: "Argument 2", slot: "Second supporting argument — different angle, same thesis." },
    { type: "value", title: "Counterpoint", slot: "The strongest objection, fairly stated, then answered." },
    { type: "payoff", title: "Conclusion", slot: "Restate the thesis with the weight of the arguments behind it." },
    { type: "cta", title: "Call to action", slot: "One ask: subscribe, the debate in the comments, or further watching." },
  ],
};

export interface BuilderResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

interface BuiltSection {
  type: SectionType;
  title: string;
  slot: string;
  words: number;
}

/**
 * Build a sectioned script outline with per-section word budgets.
 * args: { items } — item 1 = setup, items 2+ = sections (or none -> scaffold).
 */
export function runTool(args: { items: Record<string, unknown>[] }): BuilderResult {
  if (!args || !Array.isArray(args.items)) return { ok: false, error: "No items were provided." };
  if (args.items.length === 0) return { ok: false, error: "Add at least one item: the video setup (topic, duration, format)." };
  if (args.items.length > MAX_ITEMS) return { ok: false, error: `Too many items (max ${MAX_ITEMS}).` };

  // --- Item 1: video setup ---
  const setup = args.items[0];
  const topic = str(setup["topic"]);
  if (topic === "") return { ok: false, error: "Item 1: topic is required." };

  const rawMinutes = setup["targetMinutes"];
  const minutesMissing =
    rawMinutes === undefined || rawMinutes === null || (typeof rawMinutes === "string" && rawMinutes.trim() === "");
  let targetMinutes: number;
  if (minutesMissing) {
    targetMinutes = 10;
  } else {
    const n = typeof rawMinutes === "number" ? rawMinutes : Number(String(rawMinutes).trim());
    if (!Number.isFinite(n) || n <= 0) {
      return { ok: false, error: "Item 1: targetMinutes must be a positive number." };
    }
    targetMinutes = n;
  }

  const formatRaw = str(setup["format"]).toLowerCase();
  const format: OutlineFormat = formatRaw === "" ? "tutorial" : (formatRaw as OutlineFormat);
  if (!(FORMATS as readonly string[]).includes(format)) {
    return { ok: false, error: `Item 1: format must be one of: ${FORMATS.join(", ")}.` };
  }

  // --- Items 2+: sections (or the fixed scaffold) ---
  let sections: BuiltSection[] | null = null;
  if (args.items.length > 1) {
    const built: BuiltSection[] = [];
    for (let i = 1; i < args.items.length; i++) {
      const item = args.items[i];
      const n = i + 1;
      const sectionTitle = str(item["sectionTitle"]);
      if (sectionTitle === "") return { ok: false, error: `Item ${n}: sectionTitle is required.` };
      const typeRaw = str(item["sectionType"]).toLowerCase();
      if (!(SECTION_TYPES as readonly string[]).includes(typeRaw)) {
        return { ok: false, error: `Item ${n}: sectionType must be one of: ${SECTION_TYPES.join(", ")}.` };
      }
      const talkingPoints = str(item["talkingPoints"]);
      if (talkingPoints.length > MAX_TALKING_POINTS) {
        return { ok: false, error: `Item ${n}: talkingPoints must be ${MAX_TALKING_POINTS} characters or fewer.` };
      }
      built.push({
        type: typeRaw as SectionType,
        title: sectionTitle,
        slot: talkingPoints === "" ? "Your notes for this section — fill this slot with your own points." : talkingPoints,
        words: 0,
      });
    }
    sections = built;
  } else {
    sections = FORMAT_SCAFFOLDS[format].map((s) => ({ ...s, words: 0 }));
  }

  // --- Word budgets: total * type share, split evenly across same-type sections ---
  const totalWords = Math.round(targetMinutes * WPM);
  const counts: Record<string, number> = {};
  for (const s of sections) counts[s.type] = (counts[s.type] ?? 0) + 1;
  for (const s of sections) {
    s.words = Math.round((totalWords * TYPE_SHARES[s.type]) / (counts[s.type] ?? 1));
  }

  const outline: string[] = sections.map(
    (s, i) => `${i + 1}. [${s.type.toUpperCase()}] ${s.title} (~${s.words.toLocaleString("en-US")} words) — ${s.slot}`,
  );

  const copyBlocks =
    `SCRIPT OUTLINE — "${topic}" (${format}, ~${targetMinutes} min, ~${totalWords.toLocaleString("en-US")} words at ${WPM} wpm)\n` +
    outline.map((line, i) => `${line}`).join("\n");

  return {
    ok: true,
    values: {
      outline,
      totalWords,
      sectionCount: sections.length,
      copyBlocks,
      summary: `${format[0].toUpperCase() + format.slice(1)} outline for "${topic}": ${sections.length} sections, ~${totalWords.toLocaleString("en-US")} words for ~${targetMinutes} minutes.`,
      honestyNotes: [
        "Template scaffold: sections are slots (titles + guidance) for you to fill — this tool never writes your script and nothing is AI-generated.",
        `Word budgets use the ${WPM} wpm narration convention (an estimate); adjust pacing with the Script Length Planner.`,
        "Pauses, B-roll and demos add unscripted time beyond the word math.",
      ],
    },
  };
}
