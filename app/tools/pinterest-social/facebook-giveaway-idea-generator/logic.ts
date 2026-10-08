/**
 * Facebook Giveaway Idea Generator — pure logic (tool-397), zero imports,
 * zero network, zero DOM.
 *
 * FIXED FRAMEWORK LIBRARY, NOT AI: returns 4 hand-written giveaway concept
 * frameworks with the user's business and prize inserted. It cannot verify
 * policy compliance or predict virality — a fixed compliance checklist is
 * always included, and the tool never promises a guaranteed-viral mechanic.
 * Entry mechanics are deliberately spam-free: no "tag 50 friends" style
 * mechanics are suggested anywhere in this file.
 *
 * Library: 4 concept frameworks x (concept + entry mechanic + prize
 * suggestion) + 1 fixed 5-item compliance checklist.
 *
 * Deterministic: same inputs -> same outputs, always.
 */

export interface GiveawayConcept {
  title: string;
  concept: string;
  entryMechanic: string;
  prizeSuggestion: string;
}

/** The 4 fixed giveaway frameworks, in canonical order. */
export const CONCEPT_TEMPLATES: Omit<GiveawayConcept, "prizeSuggestion">[] = [
  {
    title: "Comment-to-Win",
    concept:
      "Ask your audience one fun, on-topic question about {business} — the best or most-liked answer wins. Simple to enter, easy to judge.",
    entryMechanic:
      "Enter by commenting your answer below. One entry per person; the winner is picked from the comments on the end date.",
  },
  {
    title: "Photo Showcase",
    concept:
      "Invite fans to show off how they use or enjoy {business} — a pet photo, a styled shelf, a finished recipe. Community-built content you can reshare.",
    entryMechanic:
      "Enter by posting a photo in the comments of the giveaway post. One entry per person; finalists are shortlisted by your team, the winner by public reaction count.",
  },
  {
    title: "Poll Vote + Comment",
    concept:
      "Run a Facebook poll with two {business} options (new flavor, new color, new class time) — voters enter by voting and commenting their pick.",
    entryMechanic:
      "Enter by voting in the poll and commenting your choice. One entry per person; the winner is drawn at random from voters on the end date.",
  },
  {
    title: "Caption This",
    concept:
      "Post a funny or striking photo from {business} and ask followers to write the caption. Low effort to enter, naturally shareable.",
    entryMechanic:
      "Enter by commenting your caption. One entry per person; the winner is the caption with the most reactions when the giveaway closes.",
  },
];

export const CONCEPT_COUNT = CONCEPT_TEMPLATES.length;

export const DEFAULT_PRIZE_TEMPLATE =
  "a best-seller or gift bundle from {business}";

/**
 * Fixed compliance checklist — the tool cannot verify compliance, so it
 * gives the checklist every time and tells the user to check Facebook's
 * current Page promotion policies and local laws themselves.
 */
export const COMPLIANCE_CHECKLIST: string[] = [
  "No purchase necessary: entry must be free — state this clearly in your rules.",
  "Post official rules on your Page or website: who can enter, start and end dates, and how the winner is chosen and notified.",
  "State clearly that Facebook does not sponsor, endorse, or administer the promotion.",
  "Do not require tagging friends or sharing on personal timelines as the entry mechanic — keep it comment, vote, or photo based.",
  "Check Facebook's current Page promotion policies and your local contest laws before launching — policies change.",
];

export interface GenerateGiveawayResult {
  concepts: GiveawayConcept[];
  checklist: string[];
}

function render(template: string, business: string, prize: string): string {
  return template.split("{business}").join(business).split("{prize}").join(prize);
}

/**
 * Generate giveaway concepts for a business. Throws on invalid input.
 * `prize` is optional; when omitted a generic prize suggestion is used.
 */
export function generateGiveaways(business: string, prize?: string): GenerateGiveawayResult {
  if (typeof business !== "string" || business.trim().length === 0) {
    throw new Error("Business is required — name the business running the giveaway.");
  }
  if (prize !== undefined && prize !== null && typeof prize !== "string") {
    throw new Error("Prize must be text — describe what the winner gets.");
  }

  const cleanBusiness = business.trim();
  const cleanPrize =
    typeof prize === "string" && prize.trim().length > 0
      ? prize.trim()
      : render(DEFAULT_PRIZE_TEMPLATE, cleanBusiness, "");

  const concepts = CONCEPT_TEMPLATES.map((t) => ({
    title: t.title,
    concept: render(t.concept, cleanBusiness, cleanPrize),
    entryMechanic: render(t.entryMechanic, cleanBusiness, cleanPrize),
    prizeSuggestion: cleanPrize,
  }));

  return { concepts, checklist: [...COMPLIANCE_CHECKLIST] };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * Platform entry point (generator). values: { business, prize? }.
 * The concept is joined into a readable list line per concept.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  try {
    const business = values["business"];
    if (typeof business !== "string" || business.trim().length === 0) {
      return { ok: false, error: "Business is required — name the business running the giveaway." };
    }
    const prize = values["prize"];
    if (prize !== undefined && prize !== null && prize !== "" && typeof prize !== "string") {
      return { ok: false, error: "Prize must be text — describe what the winner gets." };
    }

    const result = generateGiveaways(business, typeof prize === "string" ? prize : undefined);
    const lines = result.concepts.map(
      (c) =>
        `${c.title}\nConcept: ${c.concept}\nEntry: ${c.entryMechanic}\nPrize: ${c.prizeSuggestion}`
    );
    return {
      ok: true,
      values: {
        concepts: lines,
        checklist: result.checklist,
        count: result.concepts.length,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }
}
