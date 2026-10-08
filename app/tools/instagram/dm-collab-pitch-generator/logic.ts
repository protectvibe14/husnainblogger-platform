/**
 * DM Collab Pitch Generator — pure logic (tool-214), zero imports, zero
 * network, zero DOM.
 *
 * TEMPLATE ENGINE, NOT AI: a brand pitch DM is assembled from fixed
 * hand-written sections with slots for the user's brand, niche, deliverable,
 * and follower count.
 *
 * Pitch structure (fixed sections):
 *   1. opener      — greeting + niche hook
 *   2. intro       — who you are + follower-count line
 *   3. deliverable — what you propose (one line per deliverable type)
 *   4. value       — what the brand gets (fixed bullets)
 *   5. closer      — low-pressure call to action
 *
 * Follower-count phrasing: a count of 0 uses the "growing account" variant;
 * other counts are formatted compactly (12,500 → 12.5K). IMPORTANT: the
 * follower count is user-provided and never verified — the tool cannot check
 * anyone's real Instagram numbers. This is stated in ASSUMPTIONS and the UI.
 *
 * Deliverables (fixed list, 5): reel, carousel, story, ugc, review.
 * Subject lines: 6 fixed templates filled with {brand} and {niche}.
 */

export type Deliverable = "reel" | "carousel" | "story" | "ugc" | "review";

/** The five supported deliverables, in canonical order. */
export const DELIVERABLES: Deliverable[] = ["reel", "carousel", "story", "ugc", "review"];

export const DELIVERABLE_LABELS: Record<Deliverable, string> = {
  reel: "Instagram Reel",
  carousel: "Carousel post",
  story: "Story series",
  ugc: "UGC video",
  review: "Product review",
};

/** Deliverable-specific proposal line, with a {niche} slot. */
const DELIVERABLE_LINES: Record<Deliverable, string> = {
  reel: "I'd love to create a 30–45 second Reel featuring your product in a real {niche} use case — hook, demo, and honest take.",
  carousel: "I'd love to build a 5–7 slide carousel breaking down your product for my {niche} audience — educational, save-worthy, on-brand.",
  story: "I'd love to run a 3–5 frame Story series with your product — unboxing, first impressions, and a swipe-up/link sticker.",
  ugc: "I'd love to film raw, lo-fi UGC-style video content around your product that you can reuse in your own {niche} ads and socials.",
  review: "I'd love to do an honest, in-depth product review for my {niche} audience — what it does well, who it's for, and my verdict.",
};

/** Subject lines — 6 fixed templates with {brand} and {niche} slots. */
const SUBJECT_LINES: string[] = [
  "Collab idea for {brand} 🤝",
  "{niche} creator — quick pitch for {brand}",
  "Loved {brand}'s latest launch — collab?",
  "Content idea for {brand} x {niche}",
  "{brand} + {niche} audience = 🔥",
  "Quick question for the {brand} team",
];

/** Fixed value bullets (same for every pitch). */
const VALUE_BULLETS: string[] = [
  "Content tailored to a {niche} audience that already trusts my recommendations",
  "Full usage rights for your own ads and socials for 30 days",
  "Delivery within 7 days of receiving the product, with one free revision",
];

const CLOSER =
  "Would you be open to a quick chat this week? Happy to share past work and audience insights. Thanks for your time!";

export const BANK_SIZES = {
  subjectLines: SUBJECT_LINES.length,
  deliverables: DELIVERABLES.length,
  valueBullets: VALUE_BULLETS.length,
};

export const ASSUMPTIONS: string[] = [
  "Pitches are assembled from fixed hand-written sections and 6 subject-line templates — not AI generation.",
  "The follower count is user-provided and never verified; the tool cannot check real Instagram numbers.",
  "A count of 0 uses 'growing account' phrasing instead of a number.",
  "Personalize the pitch with a genuine compliment about the brand before sending.",
];

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function isDeliverable(s: string): s is Deliverable {
  return (DELIVERABLES as string[]).includes(s);
}

/**
 * Format a follower count compactly: 950 → "950", 12,500 → "12.5K",
 * 2,000,000 → "2M". Count 0 is handled by the caller ("growing account").
 */
export function formatFollowers(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${trimZeros(m)}M`;
  }
  if (n >= 1_000) {
    const k = n / 1_000;
    return `${trimZeros(k)}K`;
  }
  return String(Math.round(n));
}

function trimZeros(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return String(rounded).replace(/\.0$/, "");
}

function parseFollowerCount(raw: unknown): number | null {
  const n = typeof raw === "string" && raw.trim() !== "" ? Number(raw.trim()) : raw;
  if (typeof n !== "number" || Number.isNaN(n) || n < 0) return null;
  return n;
}

/**
 * Build the pitch. Throws for: empty brand, empty niche, followerCount
 * missing/negative/NaN, unknown deliverable.
 */
export function generatePitch(
  brand: string,
  niche: string,
  followerCount: unknown,
  deliverable: string
): { pitch: string; subjectLines: string[] } {
  if (typeof brand !== "string" || brand.trim().length === 0) {
    throw new Error("Brand is required — enter the brand you want to pitch.");
  }
  if (typeof niche !== "string" || niche.trim().length === 0) {
    throw new Error("Niche is required — enter your content niche.");
  }
  const count = parseFollowerCount(followerCount);
  if (count === null) {
    throw new Error("Follower count must be a number, 0 or higher (your own number — it is never verified).");
  }
  if (typeof deliverable !== "string" || !isDeliverable(deliverable)) {
    throw new Error(`Deliverable must be one of: ${DELIVERABLES.join(", ")}.`);
  }

  const cleanBrand = brand.trim();
  const cleanNiche = niche.trim();
  const audienceLine =
    count === 0
      ? `I'm building a growing account in the ${cleanNiche} niche, and your brand keeps coming up in my research.`
      : `I run an Instagram account in the ${cleanNiche} niche with ${formatFollowers(count)} followers.`;

  const fill = (t: string): string =>
    t.replaceAll("{brand}", cleanBrand).replaceAll("{niche}", cleanNiche);

  const lines: string[] = [
    `Hi ${cleanBrand} team,`,
    "",
    audienceLine,
    "",
    fill(DELIVERABLE_LINES[deliverable]),
    "",
    "Here's what you'd get:",
    ...VALUE_BULLETS.map((b) => `• ${fill(b)}`),
    "",
    CLOSER,
  ];

  return {
    pitch: lines.join("\n"),
    subjectLines: SUBJECT_LINES.map(fill),
  };
}

/**
 * Contract adapter for the mountToolUI generator template.
 * Values keys: pitch, subjectLines, copyAll (match meta.ts output ids).
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please enter the brand and your niche first." };
  }
  try {
    const result = generatePitch(
      values["brand"] as string,
      values["niche"] as string,
      values["followerCount"],
      values["deliverable"] as string
    );
    return {
      ok: true,
      values: {
        pitch: result.pitch,
        subjectLines: result.subjectLines,
        copyAll: `${result.pitch}\n\n---\nSubject line options:\n${result.subjectLines.join("\n")}`,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
