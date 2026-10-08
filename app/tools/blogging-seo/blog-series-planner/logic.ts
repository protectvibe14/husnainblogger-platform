/**
 * Blog Series Planner — pure logic (tool-036).
 *
 * Zero imports, zero network, zero DOM. Given a series topic and a part
 * count (2-12), it builds a structured multi-part plan: one series title
 * and one part entry per installment with a suggested title, slug, the
 * narrative "arc role" that installment plays, and internal-linking notes.
 *
 * This is a PLANNING AID, not an SEO guarantee: it does not check SERPs,
 * search volume, or keyword difficulty. Suggested titles and slugs are
 * fixed English templates — rewrite them for the target SERP before
 * publishing.
 *
 * HONESTY / METHODOLOGY (also in meta.ts content.methodology):
 * - Parts are assembled from a FIXED bank of 12 part-role templates
 *   (PART_ROLES below). Nothing is "AI-generated"; the engine selects a
 *   deterministic subset of the bank and fills the topic into templates.
 * - Arc selection: for N parts the bank indices are spread evenly,
 *   index_i = round(i * 11 / (N - 1)) for i = 0..N-1, so part 1 is always
 *   the overview and the last part is always the conclusion.
 * - Internal-link notes are fixed structural guidance (prev/next part +
 *   part 1 as the hub), not measured linking data.
 *
 * ASSUMPTIONS:
 * - seriesTopic must be a non-empty string of 2-120 characters.
 * - partCount must be an integer between 2 and 12 (inclusive).
 * - Slugs are ASCII-friendly; non-Latin scripts pass through untouched.
 * - Estimated read time assumes ~200 words/minute on the part's target
 *   word count — a rough planning figure, not a measurement.
 */

/** Fixed bank of 12 part-role templates: {topic} is filled with the series topic. */
export const PART_ROLES: ReadonlyArray<{
  role: string;
  titleTemplate: string;
  angle: string;
  targetWords: number;
}> = [
  {
    role: "Overview",
    titleTemplate: "What {topic} Is and Why It Matters (Start Here)",
    angle:
      "Hook the reader: define the topic in plain language, show the payoff, and map out the whole series.",
    targetWords: 1200,
  },
  {
    role: "Foundations",
    titleTemplate: "The Basics of {topic} Every Beginner Must Know",
    angle:
      "Lay the groundwork: core terms and concepts, explained simply, with zero assumed knowledge.",
    targetWords: 1500,
  },
  {
    role: "Deep dive",
    titleTemplate: "Going Deeper: {topic} Concepts Explained Simply",
    angle:
      "Move past the basics into how things really work — the details that separate dabblers from practitioners.",
    targetWords: 1800,
  },
  {
    role: "Process",
    titleTemplate: "How {topic} Works: A Step-by-Step Walkthrough",
    angle:
      "A practical, ordered process the reader can follow end to end, with examples at each step.",
    targetWords: 2000,
  },
  {
    role: "Mistakes",
    titleTemplate: "7 {topic} Mistakes Most People Make (and How to Fix Them)",
    angle:
      "Build trust by naming the common pitfalls, why they happen, and exactly how to avoid each one.",
    targetWords: 1600,
  },
  {
    role: "Tools",
    titleTemplate: "The Best Tools and Resources for {topic}",
    angle:
      "Curate the tools, templates, and references that make the topic easier — with honest trade-offs.",
    targetWords: 1400,
  },
  {
    role: "Case study",
    titleTemplate: "{topic} in Action: A Real-World Example",
    angle:
      "Prove it works: walk through one concrete example with real numbers, decisions, and lessons.",
    targetWords: 1800,
  },
  {
    role: "Advanced",
    titleTemplate: "Advanced {topic} Tactics for Experienced Readers",
    angle:
      "Reward loyal readers: techniques that only make sense once the foundations are solid.",
    targetWords: 1700,
  },
  {
    role: "Comparison",
    titleTemplate: "{topic} Compared: Which Approach Is Right for You?",
    angle:
      "Help the reader decide: compare the main approaches side by side with clear pros and cons.",
    targetWords: 1500,
  },
  {
    role: "Checklist",
    titleTemplate: "Your {topic} Action Checklist",
    angle:
      "Make it actionable: a printable-style checklist that turns the whole series into next steps.",
    targetWords: 900,
  },
  {
    role: "FAQ",
    titleTemplate: "{topic} Questions Answered: Reader FAQ",
    angle:
      "Handle objections and edge cases: answer the questions readers asked across the whole series.",
    targetWords: 1200,
  },
  {
    role: "Conclusion",
    titleTemplate: "Putting {topic} Into Practice: Your Next Steps",
    angle:
      "Close the loop: recap the journey, set the reader's 30-day action plan, and point to what's next.",
    targetWords: 1000,
  },
];

/** Maximum characters accepted for the series topic. */
export const MAX_TOPIC_LENGTH = 120;

/** Minimum characters required for the series topic. */
export const MIN_TOPIC_LENGTH = 2;

/** Fewest installments in a series. */
export const MIN_PARTS = 2;

/** Most installments in a series. */
export const MAX_PARTS = 12;

/** Fallback slug when slugify() has nothing usable to work with. */
export const FALLBACK_SLUG = "untitled";

/** Rough words-per-minute used for the read-time planning estimate. */
export const WORDS_PER_MINUTE = 200;

export interface SeriesPart {
  /** 1-based part number. */
  partNumber: number;
  /** Narrative role this installment plays (e.g. "Overview", "Case study"). */
  role: string;
  /** Suggested post title (template — rewrite before publishing). */
  suggestedTitle: string;
  /** Suggested URL slug, unique within the series. */
  suggestedSlug: string;
  /** What this installment should cover and why. */
  angle: string;
  /** Rough planning figure for this part's length (words). */
  targetWords: number;
  /** Rough read-time estimate (minutes, rounded up). */
  estimatedReadMinutes: number;
  /** Fixed structural internal-linking guidance for this part. */
  internalLinkNote: string;
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Build a URL-friendly slug from free text.
 *
 * - Lowercases, NFKD-normalizes and strips diacritics from Latin script only
 *   (café -> cafe); non-Latin scripts are left untouched.
 * - Any run of non-letter/non-number characters becomes a single hyphen;
 *   leading/trailing hyphens are trimmed.
 * - Returns FALLBACK_SLUG when nothing usable remains.
 */
export function slugify(text: string): string {
  if (typeof text !== "string") {
    throw new TypeError("slugify expects a string.");
  }
  const ascii = [...text]
    .map((ch) =>
      /[\p{Script=Latin}]/u.test(ch)
        ? ch.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
        : ch,
    )
    .join("");
  const slug = ascii
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length === 0 ? FALLBACK_SLUG : slug;
}

/**
 * Pick part-role bank indices for an N-part series: spread evenly across
 * the 12-role bank so part 1 is always the Overview and the last part is
 * always the Conclusion. Deterministic.
 */
export function pickRoleIndices(partCount: number): number[] {
  const last = PART_ROLES.length - 1; // 11
  const indices: number[] = [];
  for (let i = 0; i < partCount; i += 1) {
    indices.push(Math.round((i * last) / (partCount - 1)));
  }
  return indices;
}

/**
 * Build the fixed internal-linking note for part `partNumber` of `total`.
 * Structural guidance only — not measured linking data.
 */
export function buildLinkNote(partNumber: number, total: number): string {
  if (total <= 1) return "Publish as a standalone post.";
  const bits: string[] = [];
  if (partNumber > 1) bits.push(`link back to Part ${partNumber - 1}`);
  if (partNumber < total) bits.push(`link forward to Part ${partNumber + 1}`);
  if (partNumber === 1) {
    bits.push(
      `as the hub, link to every other part and add a series index box`,
    );
  }
  return `Internal links: ${bits.join("; ")}.`;
}

export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please enter a series topic and part count." };
  }

  const topicRaw = values["seriesTopic"];
  const topic = typeof topicRaw === "string" ? topicRaw.trim() : "";
  if (topic.length === 0) {
    return { ok: false, error: "Please enter the series topic." };
  }
  if (topic.length < MIN_TOPIC_LENGTH || topic.length > MAX_TOPIC_LENGTH) {
    return {
      ok: false,
      error: `Series topic must be ${MIN_TOPIC_LENGTH}-${MAX_TOPIC_LENGTH} characters (got ${topic.length}).`,
    };
  }

  const countRaw = values["partCount"];
  const count =
    typeof countRaw === "string" && countRaw.trim() !== ""
      ? Number(countRaw)
      : countRaw;
  if (typeof count !== "number" || !Number.isFinite(count)) {
    return { ok: false, error: "Please enter how many parts the series has." };
  }
  if (!Number.isInteger(count) || count < MIN_PARTS || count > MAX_PARTS) {
    return {
      ok: false,
      error: `Part count must be a whole number from ${MIN_PARTS} to ${MAX_PARTS} (got ${String(countRaw)}).`,
    };
  }

  const seriesTitle = `${topic}: A ${count}-Part Series`;
  const topicSlug = slugify(topic);
  const indices = pickRoleIndices(count);

  const parts: SeriesPart[] = indices.map((bankIdx, i) => {
    const role = PART_ROLES[bankIdx];
    const partNumber = i + 1;
    return {
      partNumber,
      role: role.role,
      suggestedTitle: role.titleTemplate.replace("{topic}", topic),
      suggestedSlug: `${topicSlug}-part-${partNumber}`,
      angle: role.angle,
      targetWords: role.targetWords,
      estimatedReadMinutes: Math.max(
        1,
        Math.ceil(role.targetWords / WORDS_PER_MINUTE),
      ),
      internalLinkNote: buildLinkNote(partNumber, count),
    };
  });

  const columns = [
    "#",
    "Role",
    "Suggested title",
    "Suggested slug",
    "Target words",
    "Est. read (min)",
    "Angle",
    "Internal links",
  ];
  const rows: string[][] = parts.map((p) => [
    String(p.partNumber),
    p.role,
    p.suggestedTitle,
    p.suggestedSlug,
    String(p.targetWords),
    String(p.estimatedReadMinutes),
    p.angle,
    p.internalLinkNote,
  ]);

  return {
    ok: true,
    values: {
      seriesTitle,
      parts: { columns, rows },
    },
  };
}
