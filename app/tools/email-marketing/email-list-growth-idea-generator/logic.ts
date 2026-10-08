/**
 * Email List Growth Idea Generator — pure logic (tool-448).
 *
 * Deterministic idea list assembled from a fixed idea bank — NOT AI.
 * No network, no backend, no randomness.
 *
 * BANK SIZES (documented for honesty):
 * - 30 ideas total: 15 FREE ideas and 15 PAID ideas.
 * - Each idea carries a qualitative effort level (low / medium / high) and
 *   a qualitative cost tier (Free / Low budget / Medium budget / High budget).
 * - The tool filters the bank by the chosen budget lane, then serves ideas
 *   in fixed bank order (count 1-20, max 20 < 30, so no repeats per run).
 * - Idea text contains a {niche} slot filled with the user's niche.
 *
 * ASSUMPTIONS / HONESTY:
 * - Idea list only; the tool does not predict signup rates, costs, or
 *   results. Cost tiers are qualitative labels, not prices.
 * - Every run returns a consent reminder: only grow a list with permission;
 *   never use purchased lists. This tool is idea output, not legal advice.
 * - The optional currentListSize only selects a descriptive stage label
 *   ("just starting", "growing", "established") — it changes no idea content.
 * - Zero imports, zero DOM, zero randomness. Fully deterministic.
 */

export const MAX_IDEAS = 20;
export const MIN_IDEAS = 1;
export const MAX_NICHE_CHARS = 120;
export const MAX_LIST_SIZE = 100_000_000;

export const BUDGETS = ["free", "paid", "both"] as const;
export type BudgetLane = (typeof BUDGETS)[number];

export interface GrowthIdea {
  /** Idea text; may contain a {niche} slot. */
  tactic: string;
  /** Which budget lane this idea belongs to. */
  lane: "free" | "paid";
  /** Qualitative effort level. */
  effort: "low" | "medium" | "high";
  /** Qualitative cost label (not a price). */
  costLabel: string;
}

/** 30 ideas: 15 free + 15 paid, in fixed display order per lane. */
export const IDEA_BANK: readonly GrowthIdea[] = [
  // --- FREE (15) ---
  { tactic: "Add a lead-magnet signup form to your {niche} blog sidebar", lane: "free", effort: "low", costLabel: "Free" },
  { tactic: "Offer a content-upgrade PDF on your most-read {niche} posts", lane: "free", effort: "medium", costLabel: "Free" },
  { tactic: "Build a free {niche} quiz and gate the results behind signup", lane: "free", effort: "medium", costLabel: "Free" },
  { tactic: "Add an exit-intent popup offering a {niche} checklist", lane: "free", effort: "low", costLabel: "Free" },
  { tactic: "Launch a weekly {niche} newsletter and promote it in every bio", lane: "free", effort: "medium", costLabel: "Free" },
  { tactic: "Comment thoughtfully on {niche} blogs with your newsletter in the name field", lane: "free", effort: "low", costLabel: "Free" },
  { tactic: "Run a free {niche} webinar and gate the replay with email signup", lane: "free", effort: "high", costLabel: "Free" },
  { tactic: "Guest-post on {niche} blogs with a signup link in your author bio", lane: "free", effort: "medium", costLabel: "Free" },
  { tactic: "Publish Pinterest pins that link to a {niche} lead-magnet landing page", lane: "free", effort: "medium", costLabel: "Free" },
  { tactic: "Answer {niche} questions on Quora or Reddit with a free resource link", lane: "free", effort: "medium", costLabel: "Free" },
  { tactic: "Create a \"best of {niche}\" roundup series subscribers want to forward", lane: "free", effort: "medium", costLabel: "Free" },
  { tactic: "Ask new subscribers to forward one {niche} issue to a friend", lane: "free", effort: "low", costLabel: "Free" },
  { tactic: "Offer a free 5-day {niche} email course as a signup incentive", lane: "free", effort: "high", costLabel: "Free" },
  { tactic: "Co-create a freebie with a {niche} creator and share each other's lists", lane: "free", effort: "medium", costLabel: "Free" },
  { tactic: "Turn top {niche} threads into a gated \"playbook\" PDF", lane: "free", effort: "medium", costLabel: "Free" },
  // --- PAID (15) ---
  { tactic: "Run lead ads targeting {niche} interests with a free-guide offer", lane: "paid", effort: "medium", costLabel: "Low budget" },
  { tactic: "Buy a solo-ad slot in an established {niche} newsletter", lane: "paid", effort: "low", costLabel: "Medium budget" },
  { tactic: "Sponsor a {niche} podcast episode with a signup call to action", lane: "paid", effort: "medium", costLabel: "Medium budget" },
  { tactic: "Run a {niche} giveaway with co-sponsors (entry requires an email)", lane: "paid", effort: "high", costLabel: "Medium budget" },
  { tactic: "Boost your best-performing {niche} lead-magnet post", lane: "paid", effort: "low", costLabel: "Low budget" },
  { tactic: "Run retargeting ads to {niche} blog visitors who did not subscribe", lane: "paid", effort: "medium", costLabel: "Medium budget" },
  { tactic: "Buy a classified ad in a popular {niche} newsletter", lane: "paid", effort: "low", costLabel: "Low budget" },
  { tactic: "Run YouTube ads promoting your free {niche} guide", lane: "paid", effort: "medium", costLabel: "Medium budget" },
  { tactic: "Run Instagram Story ads driving to your {niche} checklist", lane: "paid", effort: "low", costLabel: "Low budget" },
  { tactic: "Sponsor a placement in a {niche} community newsletter", lane: "paid", effort: "low", costLabel: "Low budget" },
  { tactic: "Co-host a paid webinar with a {niche} partner and split the leads", lane: "paid", effort: "high", costLabel: "Medium budget" },
  { tactic: "Run Pinterest ads to a {niche} quiz landing page", lane: "paid", effort: "medium", costLabel: "Medium budget" },
  { tactic: "Buy placement in a \"best {niche} resources\" roundup", lane: "paid", effort: "low", costLabel: "Low budget" },
  { tactic: "Boost short {niche} tip videos with paid reach to a signup page", lane: "paid", effort: "medium", costLabel: "High budget" },
  { tactic: "Use lead-gen forms to reach {niche} professionals at scale", lane: "paid", effort: "high", costLabel: "High budget" },
];

function codePoints(s: string): number {
  return [...s].length;
}

/** Strip HTML tags, collapse whitespace, collapse adjacent duplicate words. */
function sanitize(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .replace(/\b(\w+)( \1\b)+/gi, "$1")
    .trim();
}

function stageLabel(listSize: number): string {
  if (listSize < 100) return "just starting out";
  if (listSize < 5000) return "growing";
  return "established";
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please enter your niche and budget first." };
  }

  const nicheRaw = values["niche"];
  if (typeof nicheRaw !== "string" || sanitize(nicheRaw).length === 0) {
    return { ok: false, error: "Enter your niche (e.g. fitness coaching)." };
  }

  const budgetRaw = values["budget"];
  if (
    typeof budgetRaw !== "string" ||
    !(BUDGETS as readonly string[]).includes(budgetRaw)
  ) {
    return {
      ok: false,
      error: "Choose a budget: free, paid, or both.",
    };
  }
  const budget = budgetRaw as BudgetLane;

  const countRaw = values["count"];
  const countNum = typeof countRaw === "number" ? countRaw : Number(countRaw);
  if (typeof countRaw === "undefined" || countRaw === null || countRaw === "") {
    return { ok: false, error: "Enter how many ideas you want (1-20)." };
  }
  if (
    !Number.isFinite(countNum) ||
    !Number.isInteger(countNum) ||
    countNum < MIN_IDEAS ||
    countNum > MAX_IDEAS
  ) {
    return {
      ok: false,
      error: `Count must be a whole number from ${MIN_IDEAS} to ${MAX_IDEAS}.`,
    };
  }

  let listSize: number | null = null;
  const sizeRaw = values["currentListSize"];
  if (sizeRaw !== undefined && sizeRaw !== null && sizeRaw !== "") {
    const n = typeof sizeRaw === "number" ? sizeRaw : Number(sizeRaw);
    if (!Number.isFinite(n) || n < 0) {
      return { ok: false, error: "Current list size must be a number of 0 or more." };
    }
    if (!Number.isInteger(n)) {
      return { ok: false, error: "Current list size must be a whole number." };
    }
    if (n > MAX_LIST_SIZE) {
      return {
        ok: false,
        error: `Current list size looks unrealistic (max ${MAX_LIST_SIZE.toLocaleString("en-US")}).`,
      };
    }
    listSize = n;
  }

  let niche = sanitize(nicheRaw);
  const notices: string[] = [];
  if (codePoints(niche) > MAX_NICHE_CHARS) {
    niche = [...niche].slice(0, MAX_NICHE_CHARS).join("").trim();
    notices.push(`Niche was shortened to ${MAX_NICHE_CHARS} characters.`);
  }

  const filtered = IDEA_BANK.filter((idea) =>
    budget === "both" ? true : idea.lane === budget,
  );
  const picked = filtered.slice(0, countNum);
  const ideas = picked.map((idea) => ({
    tactic: idea.tactic.split("{niche}").join(niche),
    effort: idea.effort,
    cost: idea.costLabel,
  }));

  const consentReminder =
    "Consent reminder: only add people who opted in — never buy or scrape email lists. This tool lists ideas only; it is not legal advice.";
  const stageNote =
    listSize !== null
      ? ` Your list is ${stageLabel(listSize)} (${listSize.toLocaleString("en-US")} subscribers), so start with the lowest-effort ideas first.`
      : "";
  notices.push(consentReminder + stageNote);

  return {
    ok: true,
    values: {
      ideas: {
        columns: ["Idea", "Effort", "Cost"],
        rows: ideas.map((i) => [i.tactic, i.effort, i.cost]),
      },
      notice: notices.join(" "),
    },
  };
}
