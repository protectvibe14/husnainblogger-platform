/**
 * Topical Authority Map Builder (tool-050) — pure logic (zero imports,
 * zero network, zero DOM).
 *
 * HONESTY CONTRACT: this tool builds a topical-map STRUCTURE (pillar page,
 * cluster pages, article titles) from the topics YOU supply, using the
 * published transparent clustering rules below. It does NOT measure real
 * topical authority, search volume, competition, or rankings — it cannot
 * know what Google thinks of your site. Article titles are fixed
 * templates, not optimized copy; rewrite them before publishing.
 *
 * Fixed content banks (sizes documented):
 * - ANGLE_BANK: 10 supporting-article templates with a {subtopic} slot.
 * - FAQ_TEMPLATES: 3 FAQ-question templates with {title} / {coreTopic} slots.
 * - STARTER_CLUSTERS: 4 generic clusters (2 fixed article templates each)
 *   used when no subtopics are supplied.
 * - GAP_BANK: 10 content-gap angles, each with trigger words.
 *
 * Clustering rule (transparent, deterministic):
 * 1. Subtopics are cleaned: trimmed, blanks dropped, deduped
 *    case-insensitively (first-seen wins).
 * 2. Significant words = lowercase Unicode letter runs of length >= 4.
 * 3. Subtopics sharing at least one significant word join the same cluster
 *    (transitive union-find). Subtopics with no shared word become their
 *    own cluster.
 * 4. A cluster is named after its most frequent significant word
 *    (ties broken by first appearance).
 *
 * Depth rule: 1 = pillar + one guide per subtopic. 2 = depth 1 + 2
 * supporting articles per cluster (ANGLE_BANK rotated deterministically by
 * cluster index). 3 = depth 2 + 1 FAQ question per supporting article.
 *
 * Coverage gaps: a GAP_BANK angle is reported as a gap when none of your
 * subtopics shares a significant word with its trigger words.
 *
 * Builder shape: runTool({ items }) validates every item; the first
 * invalid item fails the run with "Item N: <reason>".
 *
 * Deterministic: same items -> same map, always.
 */

export const MIN_CORE_TOPIC_CHARS = 2;
export const MAX_CORE_TOPIC_CHARS = 120;
export const MAX_SUBTOPICS = 30;
export const ANGLE_BANK_SIZE = 10;
export const FAQ_TEMPLATE_COUNT = 3;
export const STARTER_CLUSTER_COUNT = 4;
export const GAP_BANK_SIZE = 10;

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export interface Article {
  title: string;
  type: "pillar" | "cluster guide" | "supporting" | "faq";
}

export interface Cluster {
  name: string;
  subtopics: string[];
  articles: Article[];
}

export interface TopicMap {
  coreTopic: string;
  subtopics: string[];
  pillar: { title: string; slug: string };
  clusters: Cluster[];
  totalArticles: number;
  coverageGaps: string[];
}

const ANGLE_BANK: string[] = [
  "How to {subtopic}: A Step-by-Step Tutorial",
  "{subtopic} for Beginners: Everything You Need to Know",
  "{subtopic} vs the Alternatives: An Honest Comparison",
  "7 Common {subtopic} Mistakes and How to Avoid Them",
  "Best {subtopic} Tools and Resources",
  "{subtopic} FAQ: Your Top Questions Answered",
  "{subtopic} Case Studies: Real Examples That Work",
  "Advanced {subtopic} Tactics for 2026",
  "{subtopic} Pros and Cons: Is It Worth It?",
  "{subtopic} Trends: What to Expect Next",
];

const FAQ_TEMPLATES: string[] = [
  "What is {title}?",
  "How do I get started with {title}?",
  "What are the biggest mistakes people make with {title}?",
];

const STARTER_CLUSTERS: Array<{ name: string; articles: string[] }> = [
  {
    name: "Foundations",
    articles: ["{coreTopic} 101: The Beginner's Guide", "{coreTopic} Basics: Key Terms Explained"],
  },
  {
    name: "How-To Guides",
    articles: ["How to Get Started with {coreTopic}: Step by Step", "{coreTopic} Tutorials for Beginners"],
  },
  {
    name: "Comparisons",
    articles: "{coreTopic} vs the Alternatives: Which Should You Choose?|{coreTopic} Options Compared: Pros and Cons".split("|"),
  },
  {
    name: "Mistakes & FAQs",
    articles: ["Common {coreTopic} Mistakes Beginners Make", "{coreTopic} FAQ: Your Top Questions Answered"],
  },
];

const GAP_BANK: Array<{ angle: string; triggers: string[] }> = [
  { angle: "beginner guides", triggers: ["beginner", "basics", "101", "introduction", "intro"] },
  { angle: "step-by-step tutorials", triggers: ["tutorial", "how", "step", "walkthrough"] },
  { angle: "comparison posts", triggers: ["comparison", "versus", "alternative", "vs"] },
  { angle: "pros and cons", triggers: ["pros", "cons", "review", "worth"] },
  { angle: "common mistakes", triggers: ["mistake", "avoid", "pitfall"] },
  { angle: "tools and resources", triggers: ["tool", "resource", "software", "app"] },
  { angle: "FAQs", triggers: ["faq", "question", "answer"] },
  { angle: "case studies", triggers: ["case", "study", "example"] },
  { angle: "expert interviews", triggers: ["interview", "expert", "opinion"] },
  { angle: "trend coverage", triggers: ["trend", "future", "2026", "prediction"] },
];

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "untitled";
}

/** Lowercase Unicode letter runs of length >= 4, deduped. */
export function significantWords(text: string): string[] {
  return [...new Set(text.toLowerCase().match(/[\p{L}]{4,}/gu) ?? [])];
}

/** Parse subtopics from a textarea string (comma/newline separated) or an array. */
export function parseSubtopics(raw: unknown): string[] {
  let parts: string[];
  if (Array.isArray(raw)) {
    parts = raw.map((p) => clean(p));
  } else if (typeof raw === "string") {
    parts = raw.split(/[\n,;]+/).map((p) => p.trim());
  } else if (raw === undefined || raw === null) {
    return [];
  } else {
    throw new TypeError("subtopics must be a string or an array of strings.");
  }
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    if (p.length === 0) continue;
    const key = p.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

function parseDepth(raw: unknown): number {
  if (raw === undefined || raw === null) return 2;
  let n: number;
  if (typeof raw === "number") {
    n = raw;
  } else {
    const s = clean(raw);
    if (s === "") return 2;
    n = Number(s);
  }
  if (!Number.isInteger(n) || n < 1 || n > 3) {
    throw new RangeError("depth must be 1, 2, or 3.");
  }
  return n;
}

/**
 * Group subtopic indexes into clusters: subtopics sharing at least one
 * significant word join the same cluster (transitive). Deterministic.
 */
export function clusterSubtopics(subtopics: string[]): string[][] {
  const parent = subtopics.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const union = (a: number, b: number): void => {
    parent[find(a)] = find(b);
  };
  const wordSets = subtopics.map(significantWords);
  for (let i = 0; i < subtopics.length; i += 1) {
    for (let j = i + 1; j < subtopics.length; j += 1) {
      if (wordSets[i].some((w) => wordSets[j].includes(w))) union(i, j);
    }
  }
  const groups = new Map<number, number[]>();
  subtopics.forEach((_, i) => {
    const root = find(i);
    const bucket = groups.get(root);
    if (bucket) bucket.push(i);
    else groups.set(root, [i]);
  });
  return [...groups.values()].map((idxs) => idxs.map((i) => subtopics[i]));
}

function clusterName(members: string[]): string {
  const freq = new Map<string, number>();
  const firstSeen: string[] = [];
  for (const m of members) {
    for (const w of significantWords(m)) {
      if (!freq.has(w)) {
        freq.set(w, 0);
        firstSeen.push(w);
      }
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }
  if (firstSeen.length === 0) return members[0];
  let top = firstSeen[0];
  for (const w of firstSeen) {
    if ((freq.get(w) ?? 0) > (freq.get(top) ?? 0)) top = w;
  }
  return top.charAt(0).toUpperCase() + top.slice(1);
}

function titleCaseWord(w: string): string {
  return w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w;
}

/** Build one TopicMap. Throws with a plain message; runTool prefixes "Item N: ". */
export function buildMap(coreTopic: string, subtopics: string[], depth: number): TopicMap {
  const pillar = { title: `${coreTopic}: The Complete Guide`, slug: slugify(coreTopic) };
  const clusters: Cluster[] = [];

  if (subtopics.length === 0) {
    // Starter mode: generic clusters from fixed templates.
    for (const s of STARTER_CLUSTERS) {
      const articles: Article[] = s.articles.map((t) => ({
        title: t.replaceAll("{coreTopic}", coreTopic),
        type: "supporting" as const,
      }));
      clusters.push({ name: s.name, subtopics: [], articles });
    }
  } else {
    const groups = clusterSubtopics(subtopics);
    groups.forEach((members, clusterIndex) => {
      const articles: Article[] = [];
      for (const m of members) {
        articles.push({ title: `${m}: The Complete Guide`, type: "cluster guide" });
      }
      if (depth >= 2) {
        for (let k = 0; k < 2; k += 1) {
          const template = ANGLE_BANK[(clusterIndex * 2 + k) % ANGLE_BANK.length];
          const title = template.replaceAll("{subtopic}", members[0]);
          articles.push({ title, type: "supporting" });
          if (depth >= 3) {
            const faqTemplate = FAQ_TEMPLATES[clusterIndex % FAQ_TEMPLATES.length];
            articles.push({ title: faqTemplate.replaceAll("{title}", title), type: "faq" });
          }
        }
      }
      clusters.push({ name: titleCaseWord(clusterName(members)), subtopics: members, articles });
    });
  }

  const coverageGaps = findCoverageGaps(subtopics);
  const totalArticles = 1 + clusters.reduce((n, c) => n + c.articles.length, 0);
  return { coreTopic, subtopics, pillar, clusters, totalArticles, coverageGaps };
}

export function findCoverageGaps(subtopics: string[]): string[] {
  const subWords = new Set<string>();
  for (const s of subtopics) {
    for (const w of significantWords(s)) subWords.add(w);
    for (const w of s.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []) {
      if (w.length >= 2) subWords.add(w);
    }
  }
  const gaps: string[] = [];
  for (const g of GAP_BANK) {
    if (!g.triggers.some((t) => subWords.has(t)) && subtopics.length > 0) {
      gaps.push(`Consider adding ${g.angle} content.`);
    }
  }
  return gaps;
}

export function mapToMarkdown(map: TopicMap): string {
  const lines: string[] = [`# Topical Map: ${map.coreTopic}`, ""];
  lines.push(`## Pillar`, `- ${map.pillar.title}`, "");
  map.clusters.forEach((c) => {
    lines.push(`## Cluster: ${c.name} (${c.articles.length} articles)`);
    for (const a of c.articles) {
      lines.push(`- [${a.type}] ${a.title}`);
    }
    lines.push("");
  });
  lines.push("## Coverage gaps");
  if (map.subtopics.length === 0) {
    lines.push("- Subtopics were auto-generated from starter angles — replace them with your own topics for a tailored gap check.");
  } else if (map.coverageGaps.length === 0) {
    lines.push("- Your subtopics already cover the common content angles.");
  } else {
    for (const g of map.coverageGaps) lines.push(`- ${g}`);
  }
  lines.push("", `Total articles planned: ${map.totalArticles}.`);
  lines.push(
    "Note: this is a structure planner — it does not measure real topical authority, search volume, or competition."
  );
  return lines.join("\n");
}

/**
 * Builder entry point. Each item: { coreTopic, subtopics?, depth? }.
 * subtopics may be a textarea string (comma/newline separated) or an array.
 */
export function runTool(args: { items: Record<string, unknown>[] }): RunToolResult {
  if (!args || typeof args !== "object" || !Array.isArray(args.items)) {
    return { ok: false, error: "No items to map." };
  }
  if (args.items.length === 0) {
    return { ok: false, error: "Add at least one core topic to map." };
  }
  try {
    const maps: TopicMap[] = args.items.map((raw, index) => {
      const label = `Item ${index + 1}`;
      if (!raw || typeof raw !== "object") throw new Error(`${label}: not an object.`);
      const coreTopic = clean((raw as Record<string, unknown>).coreTopic);
      if (coreTopic.length < MIN_CORE_TOPIC_CHARS) {
        throw new Error(`${label}: coreTopic is required (${MIN_CORE_TOPIC_CHARS}-${MAX_CORE_TOPIC_CHARS} characters).`);
      }
      if (coreTopic.length > MAX_CORE_TOPIC_CHARS) {
        throw new Error(`${label}: coreTopic must be ${MAX_CORE_TOPIC_CHARS} characters or fewer.`);
      }
      let subtopics: string[];
      let depth: number;
      try {
        subtopics = parseSubtopics((raw as Record<string, unknown>).subtopics);
      } catch {
        throw new Error(`${label}: subtopics must be text or a list of strings.`);
      }
      if (subtopics.length > MAX_SUBTOPICS) {
        throw new Error(`${label}: at most ${MAX_SUBTOPICS} subtopics.`);
      }
      try {
        depth = parseDepth((raw as Record<string, unknown>).depth);
      } catch {
        throw new Error(`${label}: depth must be 1, 2, or 3.`);
      }
      return buildMap(coreTopic, subtopics, depth);
    });

    const multi = maps.length > 1;
    const markdownParts = maps.map((m, i) => (multi ? `---\n\n## Map ${i + 1}\n\n${mapToMarkdown(m)}` : mapToMarkdown(m)));
    const clusters: string[] = [];
    maps.forEach((m, i) => {
      for (const c of m.clusters) {
        clusters.push(multi ? `Map ${i + 1} — ${c.name} (${c.articles.length} articles)` : `${c.name} (${c.articles.length} articles)`);
      }
    });
    const coverageGaps = [...new Set(maps.flatMap((m) => m.coverageGaps))];

    return {
      ok: true,
      values: {
        result: markdownParts.join("\n\n"),
        clusters,
        coverageGaps,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
