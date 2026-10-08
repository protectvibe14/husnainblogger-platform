/**
 * Pillar-Cluster Content Planner — pure logic (tool-033).
 *
 * Zero imports, zero network, zero DOM. Given a pillar topic and a desired
 * cluster count, generates a topic-cluster plan from a FIXED bank of 24
 * cluster-topic templates (never AI-generated, no keyword data):
 *
 *   - CLUSTER_BANK: 24 templates with a {pillar} placeholder, used in bank
 *     order (first N win). Sizes documented below.
 *
 * Deterministic: same inputs always produce the same plan.
 *
 * ASSUMPTIONS (also surfaced in the returned assumptions[] array):
 * - Cluster topics are generic template titles filled with your pillar —
 *   they are planning starting points, not keyword research.
 * - The tool does not check search volume, keyword difficulty, or SERPs;
 *   validate every cluster topic with a keyword tool before writing.
 * - Slugs are suggestions — verify against the site's CMS/URL conventions.
 * - The linking note is a structural convention (pillar<->cluster), not a
 *   ranking guarantee.
 */

/** Fixed cluster-topic template bank: 24 entries. */
export const CLUSTER_BANK: readonly string[] = [
  "What is {pillar}? A beginner's overview",
  "How to get started with {pillar}",
  "Common {pillar} mistakes (and how to fix them)",
  "{pillar} for beginners: the essentials",
  "Advanced {pillar} strategies",
  "Best {pillar} tools and resources",
  "{pillar} vs. alternatives: which is right for you?",
  "{pillar} case study: real results",
  "{pillar} FAQ: your questions answered",
  "{pillar} trends to watch this year",
  "How much does {pillar} cost?",
  "{pillar} checklist: a step-by-step action plan",
  "{pillar} for small businesses",
  "{pillar} for enterprises",
  "How to measure {pillar} success",
  "{pillar} best practices from the pros",
  "{pillar} templates you can copy",
  "{pillar} statistics and benchmarks",
  "The history of {pillar}",
  "{pillar} glossary: key terms explained",
  "How to hire {pillar} help",
  "{pillar} in 30 days: a quick-start plan",
  "{pillar} myths debunked",
  "The future of {pillar}",
];

/** Number of cluster-topic templates in the fixed bank. */
export const CLUSTER_BANK_SIZE = CLUSTER_BANK.length; // 24

/** Pillar-topic length bounds. */
export const MIN_PILLAR_LENGTH = 2;
export const MAX_PILLAR_LENGTH = 120;

/** Cluster-count bounds and default. */
export const MIN_CLUSTERS = 3;
export const MAX_CLUSTERS = 20;
export const DEFAULT_CLUSTERS = 8;

/** Fallback slug when slugify() has nothing usable to work with. */
export const FALLBACK_SLUG = "untitled";

export interface ClusterTopic {
  /** Cluster title with the pillar filled in. */
  title: string;
  /** Suggested URL slug (unique within the plan). */
  slug: string;
}

export interface TopicClusterPlan {
  /** The pillar topic as entered (trimmed). */
  pillarTopic: string;
  /** Suggested pillar page title (template — rewrite before publishing). */
  pillarTitleSuggestion: string;
  /** Suggested pillar page slug. */
  pillarSlug: string;
  /** Number of cluster topics requested. */
  clusterCount: number;
  /** The planned cluster topics. */
  clusters: ClusterTopic[];
  /** Structural linking guidance (convention, not a ranking guarantee). */
  linkingNote: string;
  /** Assumption/limitation notes surfaced to the UI. */
  assumptions: string[];
}

function fillPillar(template: string, pillar: string): string {
  return template.replace(/\{pillar\}/g, pillar);
}

/**
 * Build a URL-friendly slug from free text.
 * Lowercases, strips diacritics from Latin script, keeps other Unicode
 * letters/numbers, collapses other runs to single hyphens.
 */
export function slugify(text: string): string {
  if (typeof text !== "string") throw new TypeError("slugify expects a string.");
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
 * Build the plan. Throws TypeError/RangeError on invalid input; runTool()
 * converts those into { ok: false }.
 */
export function buildPlan(pillarTopic: string, clusterCount: number): TopicClusterPlan {
  if (typeof pillarTopic !== "string" || pillarTopic.trim().length < MIN_PILLAR_LENGTH) {
    throw new TypeError(
      `Pillar topic is required (${MIN_PILLAR_LENGTH}-${MAX_PILLAR_LENGTH} characters).`,
    );
  }
  if (pillarTopic.trim().length > MAX_PILLAR_LENGTH) {
    throw new RangeError(
      `Pillar topic must be ${MAX_PILLAR_LENGTH} characters or fewer.`,
    );
  }
  if (
    typeof clusterCount !== "number" ||
    !Number.isInteger(clusterCount) ||
    clusterCount < MIN_CLUSTERS ||
    clusterCount > MAX_CLUSTERS
  ) {
    throw new RangeError(
      `Cluster count must be a whole number between ${MIN_CLUSTERS} and ${MAX_CLUSTERS}.`,
    );
  }

  const pillar = pillarTopic.trim();
  const pillarSlug = slugify(pillar);

  const usedSlugs = new Set<string>([pillarSlug]);
  const clusters: ClusterTopic[] = [];
  for (let i = 0; i < clusterCount; i += 1) {
    const title = fillPillar(CLUSTER_BANK[i], pillar);
    const base = slugify(title);
    let slug = base;
    let n = 2;
    while (usedSlugs.has(slug)) {
      slug = `${base}-${n}`;
      n += 1;
    }
    usedSlugs.add(slug);
    clusters.push({ title, slug });
  }

  return {
    pillarTopic: pillar,
    pillarTitleSuggestion: `${pillar}: The Complete Guide`,
    pillarSlug,
    clusterCount,
    clusters,
    linkingNote:
      "Link every cluster page back to the pillar page, and link the pillar page to every cluster page. " +
      "Link clusters to each other only where the topics genuinely overlap.",
    assumptions: [
      "Planning aid only — cluster topics are filled from a fixed bank of 24 templates; this is not keyword research.",
      "The tool does not check search volume, keyword difficulty, or SERPs — validate every topic with a keyword tool.",
      "Suggested slugs and titles are starting templates — verify against the site's CMS and URL conventions before publishing.",
      "The linking note is a structural convention, not a ranking guarantee; editorial review is recommended.",
    ],
  };
}

/**
 * runTool entry point (planner template contract).
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawPillar = values["pillarTopic"];
  const rawCount = values["clusterCount"];

  let clusterCount = DEFAULT_CLUSTERS;
  if (rawCount !== undefined) {
    if (
      typeof rawCount !== "number" ||
      !Number.isInteger(rawCount) ||
      rawCount < MIN_CLUSTERS ||
      rawCount > MAX_CLUSTERS
    ) {
      return {
        ok: false,
        error: `Cluster count must be a whole number between ${MIN_CLUSTERS} and ${MAX_CLUSTERS}.`,
      };
    }
    clusterCount = rawCount;
  }

  try {
    const plan = buildPlan(rawPillar as string, clusterCount);
    return {
      ok: true,
      values: {
        plan: {
          pillarTopic: plan.pillarTopic,
          pillarTitleSuggestion: plan.pillarTitleSuggestion,
          pillarSlug: plan.pillarSlug,
          clusterCount: plan.clusterCount,
          clusters: plan.clusters,
          linkingNote: plan.linkingNote,
          assumptions: plan.assumptions,
        },
        clusterTopics: plan.clusters.map((c) => c.title),
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Invalid input.",
    };
  }
}
