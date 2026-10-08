/**
 * Creator Product Idea Matcher (tool-132) — pure logic, zero imports.
 *
 * ENGINE: fixed mapping table. 12 niche tables x 6 product ideas each
 * (= 72 fixed ideas). Each idea carries: product name, kind
 * (digital | physical | service), effort level (1=low, 2=medium, 3=high),
 * a fixed fit score (1-5, opinionated, not data-backed), and a 1-sentence
 * "why it fits" rationale.
 *
 * RANKING (deterministic, labeled heuristic):
 *   1. Filter: only ideas with effort <= effortTolerance are kept
 *      (low=1, medium=2, high=3).
 *   2. Score: fitScore + audienceBoost, where audienceBoost is:
 *        +0.5 to digital products when audienceBand is "under-1k" or
 *          "1k-10k"  (digital scales without inventory at small audiences),
 *        +0.5 to service products when audienceBand is "10k-100k" or
 *          "over-100k" (services convert better with a larger warm audience).
 *      Ties keep the table's original order (stable sort).
 *   3. Ideas are returned ranked; the summary names the top pick.
 *
 * HONESTY: this is a brainstorm aid, not market research. The fit scores
 * and boost rules are the author's opinion; there is no sales data, no
 * trend data, and no guarantee any idea will sell. Never claim AI.
 */

export type ProductKind = "digital" | "physical" | "service";
export type AudienceBand = "under-1k" | "1k-10k" | "10k-100k" | "over-100k";
export type EffortTolerance = "low" | "medium" | "high";

export interface ProductIdea {
  product: string;
  kind: ProductKind;
  effort: 1 | 2 | 3;
  effortLabel: string;
  fitScore: 1 | 2 | 3 | 4 | 5;
  why: string;
}

export interface NicheEntry {
  nicheId: string;
  nicheLabel: string;
  ideas: ProductIdea[];
}

export const AUDIENCE_BANDS: Record<AudienceBand, string> = {
  "under-1k": "Under 1K subscribers",
  "1k-10k": "1K – 10K subscribers",
  "10k-100k": "10K – 100K subscribers",
  "over-100k": "Over 100K subscribers",
};

export const EFFORT_TOLERANCE_LEVELS: Record<EffortTolerance, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

/**
 * NICHE_IDEAS: 12 niche tables x 6 ideas = 72 fixed product ideas.
 * fitScore is opinionated (1=stretch, 5=natural fit) — not data-backed.
 */
export const NICHE_IDEAS: NicheEntry[] = [
  {
    nicheId: "gaming",
    nicheLabel: "Gaming",
    ideas: [
      { product: "Custom keybind & settings pack", kind: "digital", effort: 1, effortLabel: "low", fitScore: 5, why: "Viewers buy your exact setup so they can play like you." },
      { product: "Aim-training routine PDF", kind: "digital", effort: 1, effortLabel: "low", fitScore: 4, why: "Competitive viewers want structured practice, not just gameplay." },
      { product: "1:1 coaching sessions", kind: "service", effort: 2, effortLabel: "medium", fitScore: 5, why: "High perceived value; your rank/skill is the credential." },
      { product: "Private Discord community", kind: "service", effort: 2, effortLabel: "medium", fitScore: 4, why: "Recurring revenue from fans who want to play together." },
      { product: "Game-themed sticker pack", kind: "physical", effort: 2, effortLabel: "medium", fitScore: 3, why: "Cheap to produce and ship; fans love desk-setup stickers." },
      { product: "Subscriber highlight-reel editing", kind: "service", effort: 3, effortLabel: "high", fitScore: 3, why: "Gamers pay to look good in their own clips." },
    ],
  },
  {
    nicheId: "personal-finance",
    nicheLabel: "Personal finance",
    ideas: [
      { product: "Budget spreadsheet template", kind: "digital", effort: 1, effortLabel: "low", fitScore: 5, why: "Your audience already trusts your system — sell the system itself." },
      { product: "Debt payoff planner", kind: "digital", effort: 1, effortLabel: "low", fitScore: 4, why: "A focused tool beats a generic budget sheet for this audience." },
      { product: "Net-worth tracker dashboard", kind: "digital", effort: 1, effortLabel: "low", fitScore: 4, why: "Finance viewers love tracking progress visually." },
      { product: "1:1 money review call", kind: "service", effort: 2, effortLabel: "medium", fitScore: 5, why: "Personalized advice converts when trust is already built." },
      { product: "Frugal living recipe book", kind: "digital", effort: 2, effortLabel: "medium", fitScore: 3, why: "A natural extension if you cover saving on food costs." },
      { product: "Beginner investing course", kind: "digital", effort: 3, effortLabel: "high", fitScore: 5, why: "The most-asked topic in finance comments becomes the product." },
    ],
  },
  {
    nicheId: "cooking-food",
    nicheLabel: "Cooking & food",
    ideas: [
      { product: "Recipe e-book", kind: "digital", effort: 2, effortLabel: "medium", fitScore: 5, why: "Your most-requested recipes, organized — the classic creator product." },
      { product: "Weekly meal-plan subscription", kind: "service", effort: 2, effortLabel: "medium", fitScore: 5, why: "Recurring revenue; viewers pay to stop deciding what to cook." },
      { product: "Meal planner printable", kind: "digital", effort: 1, effortLabel: "low", fitScore: 4, why: "Low effort to make, genuinely useful every week." },
      { product: "1:1 virtual cooking lesson", kind: "service", effort: 2, effortLabel: "medium", fitScore: 3, why: "Premium pricing for fans who want hands-on help." },
      { product: "Branded apron & utensil set", kind: "physical", effort: 3, effortLabel: "high", fitScore: 3, why: "Merch that fits the niche — print-on-demand keeps risk low." },
      { product: "Signature spice blend", kind: "physical", effort: 3, effortLabel: "high", fitScore: 4, why: "Food channels sell flavor best; start with one blend." },
    ],
  },
  {
    nicheId: "fitness-health",
    nicheLabel: "Fitness & health",
    ideas: [
      { product: "Workout program PDF", kind: "digital", effort: 2, effortLabel: "medium", fitScore: 5, why: "The #1 request on fitness channels: 'give me the exact plan'." },
      { product: "Nutrition meal template", kind: "digital", effort: 1, effortLabel: "low", fitScore: 4, why: "Pairs with any program; easy to make, easy to sell." },
      { product: "Form-check video reviews", kind: "service", effort: 1, effortLabel: "low", fitScore: 5, why: "Low effort for you, high value for lifters worried about injury." },
      { product: "1:1 online coaching", kind: "service", effort: 2, effortLabel: "medium", fitScore: 5, why: "Accountability is what viewers actually pay for." },
      { product: "Mobility course", kind: "digital", effort: 3, effortLabel: "high", fitScore: 4, why: "An underserved angle that complements strength content." },
      { product: "Branded resistance bands", kind: "physical", effort: 3, effortLabel: "high", fitScore: 3, why: "Useful gear fans will actually keep using." },
    ],
  },
  {
    nicheId: "tech-reviews",
    nicheLabel: "Tech reviews",
    ideas: [
      { product: "Notion gear tracker template", kind: "digital", effort: 1, effortLabel: "low", fitScore: 4, why: "Your audience organizes obsessively — sell the organization." },
      { product: "Desk setup wallpaper pack", kind: "digital", effort: 1, effortLabel: "low", fitScore: 3, why: "Cheap impulse buy for setup-obsessed viewers." },
      { product: "Buyer's guide e-book", kind: "digital", effort: 2, effortLabel: "medium", fitScore: 5, why: "Turns your comparison videos into a decision-making tool." },
      { product: "1:1 tech consultation", kind: "service", effort: 2, effortLabel: "medium", fitScore: 4, why: "Viewers pay to avoid buying the wrong gear." },
      { product: "Branded desk mat", kind: "physical", effort: 2, effortLabel: "medium", fitScore: 3, why: "Setup-channel merch that shows up on camera." },
      { product: "Custom PC build service", kind: "service", effort: 3, effortLabel: "high", fitScore: 4, why: "High-ticket service if you review components." },
    ],
  },
  {
    nicheId: "beauty-style",
    nicheLabel: "Beauty & style",
    ideas: [
      { product: "Skincare routine planner", kind: "digital", effort: 1, effortLabel: "low", fitScore: 4, why: "Routine-building is the top struggle your viewers mention." },
      { product: "Capsule wardrobe guide", kind: "digital", effort: 2, effortLabel: "medium", fitScore: 5, why: "Style viewers want a system, not more hauls." },
      { product: "1:1 style consultation", kind: "service", effort: 2, effortLabel: "medium", fitScore: 4, why: "Premium, personalized — your taste is the product." },
      { product: "Color palette analysis", kind: "service", effort: 2, effortLabel: "medium", fitScore: 4, why: "Highly shareable results drive word of mouth." },
      { product: "Makeup tutorial course", kind: "digital", effort: 3, effortLabel: "high", fitScore: 5, why: "Structured learning beats scattered video tutorials." },
      { product: "Branded beauty bag", kind: "physical", effort: 2, effortLabel: "medium", fitScore: 3, why: "Simple merch that matches the niche aesthetic." },
    ],
  },
  {
    nicheId: "education",
    nicheLabel: "Education",
    ideas: [
      { product: "Study notes bundle", kind: "digital", effort: 1, effortLabel: "low", fitScore: 5, why: "Students pay to skip the note-taking and get to revising." },
      { product: "Flashcard deck", kind: "digital", effort: 1, effortLabel: "low", fitScore: 4, why: "Quick to produce from your existing video scripts." },
      { product: "Printable study planner", kind: "digital", effort: 1, effortLabel: "low", fitScore: 4, why: "Low price, high volume — students buy planners repeatedly." },
      { product: "1:1 tutoring", kind: "service", effort: 2, effortLabel: "medium", fitScore: 5, why: "Your teaching ability is proven on camera; charge for it live." },
      { product: "Essay review service", kind: "service", effort: 2, effortLabel: "medium", fitScore: 4, why: "Async and scalable — review on your own schedule." },
      { product: "Exam prep course", kind: "digital", effort: 3, effortLabel: "high", fitScore: 5, why: "The highest-value product an education channel can sell." },
    ],
  },
  {
    nicheId: "travel",
    nicheLabel: "Travel",
    ideas: [
      { product: "Itinerary templates", kind: "digital", effort: 1, effortLabel: "low", fitScore: 5, why: "'Where exactly did you go?' becomes a sellable template." },
      { product: "Packing checklist bundle", kind: "digital", effort: 1, effortLabel: "low", fitScore: 3, why: "Small product, but every traveler needs one." },
      { product: "Lightroom preset pack", kind: "digital", effort: 1, effortLabel: "low", fitScore: 4, why: "Viewers want their photos to look like yours." },
      { product: "City guide e-book", kind: "digital", effort: 2, effortLabel: "medium", fitScore: 5, why: "Deep dives into your most popular destinations." },
      { product: "Travel planning service", kind: "service", effort: 2, effortLabel: "medium", fitScore: 4, why: "Busy followers pay for a done-for-you itinerary." },
      { product: "Guided group trip", kind: "service", effort: 3, effortLabel: "high", fitScore: 4, why: "High-ticket and memorable — but operationally heavy." },
    ],
  },
  {
    nicheId: "music",
    nicheLabel: "Music",
    ideas: [
      { product: "Chord progression MIDI pack", kind: "digital", effort: 1, effortLabel: "low", fitScore: 4, why: "Producers buy starting points, not finished songs." },
      { product: "Sample & loop pack", kind: "digital", effort: 2, effortLabel: "medium", fitScore: 5, why: "Your sound, packaged — the classic producer product." },
      { product: "1:1 music lesson", kind: "service", effort: 2, effortLabel: "medium", fitScore: 5, why: "Aspiring musicians pay for direct feedback." },
      { product: "Songwriting course", kind: "digital", effort: 3, effortLabel: "high", fitScore: 5, why: "Turns casual viewers into committed students." },
      { product: "Mixing & mastering service", kind: "service", effort: 3, effortLabel: "high", fitScore: 4, why: "High-ticket service if you demonstrate mixes on channel." },
      { product: "Vinyl / merch drop", kind: "physical", effort: 2, effortLabel: "medium", fitScore: 3, why: "Fans collect physical music products." },
    ],
  },
  {
    nicheId: "entertainment-comedy",
    nicheLabel: "Entertainment & comedy",
    ideas: [
      { product: "Meme caption pack", kind: "digital", effort: 1, effortLabel: "low", fitScore: 3, why: "Low price, fun impulse buy for engaged fans." },
      { product: "Reaction template pack", kind: "digital", effort: 1, effortLabel: "low", fitScore: 3, why: "Fans who make their own videos copy your format." },
      { product: "Cameo-style shoutouts", kind: "service", effort: 1, effortLabel: "low", fitScore: 4, why: "Personalized video = premium fan moment." },
      { product: "Comedy writing workshop", kind: "service", effort: 2, effortLabel: "medium", fitScore: 4, why: "Teach the skill behind the laughs." },
      { product: "Sticker & merch drop", kind: "physical", effort: 2, effortLabel: "medium", fitScore: 5, why: "Comedy catchphrases sell as wearable merch." },
      { product: "Live show tickets", kind: "service", effort: 3, effortLabel: "high", fitScore: 4, why: "The ultimate monetization once the audience is big enough." },
    ],
  },
  {
    nicheId: "diy-crafts",
    nicheLabel: "DIY & crafts",
    ideas: [
      { product: "Project plan PDFs", kind: "digital", effort: 1, effortLabel: "low", fitScore: 5, why: "Viewers want the exact measurements you used." },
      { product: "Material cut-list templates", kind: "digital", effort: 1, effortLabel: "low", fitScore: 4, why: "Saves your viewers a hardware-store headache." },
      { product: "Pattern bundle", kind: "digital", effort: 2, effortLabel: "medium", fitScore: 5, why: "Crafters happily pay for tested, ready-to-use patterns." },
      { product: "Tool basics course", kind: "digital", effort: 2, effortLabel: "medium", fitScore: 4, why: "Beginners are your fastest-growing viewer segment." },
      { product: "1:1 project consultation", kind: "service", effort: 2, effortLabel: "medium", fitScore: 3, why: "Help viewers plan their build before they buy materials." },
      { product: "Handmade product line", kind: "physical", effort: 3, effortLabel: "high", fitScore: 4, why: "Sell the actual things you make on camera." },
    ],
  },
  {
    nicheId: "parenting-family",
    nicheLabel: "Parenting & family",
    ideas: [
      { product: "Routine chart printables", kind: "digital", effort: 1, effortLabel: "low", fitScore: 5, why: "Parents print these and use them daily — high perceived value." },
      { product: "Meal-planning for families", kind: "digital", effort: 1, effortLabel: "low", fitScore: 4, why: "The #2 pain point after sleep: what to cook tonight." },
      { product: "Activity book for kids", kind: "digital", effort: 2, effortLabel: "medium", fitScore: 4, why: "Screen-free activities are gold for this audience." },
      { product: "Sleep training guide", kind: "digital", effort: 2, effortLabel: "medium", fitScore: 5, why: "Sleep-deprived parents pay for anything that works." },
      { product: "Printable chore system", kind: "digital", effort: 1, effortLabel: "low", fitScore: 3, why: "Simple, but families use it every single day." },
      { product: "1:1 parenting coaching", kind: "service", effort: 2, effortLabel: "medium", fitScore: 4, why: "Personalized support for high-stress parenting moments." },
    ],
  },
];

export interface RankedIdea {
  rank: number;
  product: string;
  kind: ProductKind;
  effortLabel: string;
  matchScore: number;
  why: string;
}

export interface MatcherResult {
  ok: true;
  values: {
    rankedIdeas: string[];
    summary: string;
    honestyNote: string;
  };
}

export interface MatcherError {
  ok: false;
  error: string;
}

/** Audience boost rule (opinionated heuristic, documented in file header). */
function audienceBoost(kind: ProductKind, band: AudienceBand): number {
  if (kind === "digital" && (band === "under-1k" || band === "1k-10k")) return 0.5;
  if (kind === "service" && (band === "10k-100k" || band === "over-100k")) return 0.5;
  return 0;
}

export function runTool(values: Record<string, unknown>): MatcherResult | MatcherError {
  const niche = values["niche"];
  const audienceBand = values["audienceBand"];
  const effortTolerance = values["effortTolerance"];

  if (typeof niche !== "string" || niche.trim() === "") {
    return { ok: false, error: "Select your niche to match product ideas." };
  }
  if (typeof audienceBand !== "string" || audienceBand.trim() === "") {
    return { ok: false, error: "Select your audience size band." };
  }
  if (typeof effortTolerance !== "string" || effortTolerance.trim() === "") {
    return { ok: false, error: "Select how much effort you can put in." };
  }

  const entry = NICHE_IDEAS.find((n) => n.nicheId === niche);
  if (!entry) {
    return { ok: false, error: `Unknown niche "${niche}". Pick one from the list.` };
  }
  if (!(audienceBand in AUDIENCE_BANDS)) {
    return { ok: false, error: `Unknown audience size "${audienceBand}".` };
  }
  if (!(effortTolerance in EFFORT_TOLERANCE_LEVELS)) {
    return { ok: false, error: `Unknown effort level "${effortTolerance}".` };
  }

  const maxEffort = EFFORT_TOLERANCE_LEVELS[effortTolerance as EffortTolerance];
  const band = audienceBand as AudienceBand;

  const scored = entry.ideas
    .filter((idea) => idea.effort <= maxEffort)
    .map((idea, index) => ({
      idea,
      index,
      matchScore: idea.fitScore + audienceBoost(idea.kind, band),
    }))
    // Stable: higher score first; ties keep table order.
    .sort((a, b) => b.matchScore - a.matchScore || a.index - b.index);

  if (scored.length === 0) {
    return { ok: false, error: "No ideas match that effort level. Try a higher effort tolerance." };
  }

  const ranked: RankedIdea[] = scored.map((s, i) => ({
    rank: i + 1,
    product: s.idea.product,
    kind: s.idea.kind,
    effortLabel: s.idea.effortLabel,
    matchScore: Math.round(s.matchScore * 10) / 10,
    why: s.idea.why,
  }));

  const lines = ranked.map(
    (r) => `${r.rank}. ${r.product} (${r.kind}, ${r.effortLabel} effort) — ${r.why}`,
  );

  const top = ranked[0];
  const summary =
    `Top match for a ${entry.nicheLabel} channel (${AUDIENCE_BANDS[band]}, ${effortTolerance} effort): ` +
    `"${top.product}" — ${top.why} ` +
    `${ranked.length} idea(s) fit your effort level, ranked best-first.`;

  return {
    ok: true,
    values: {
      rankedIdeas: lines,
      summary,
      honestyNote:
        "Heuristic brainstorm aid: ideas come from a fixed 72-item table with opinionated fit scores — no market or sales data. Validate demand with your own audience before building.",
    },
  };
}
