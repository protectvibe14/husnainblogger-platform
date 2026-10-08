/**
 * UGC Pitch Template Generator — pure logic.
 *
 * WHAT IT HONESTLY DOES:
 * Slot-fills a UGC outreach pitch template with the user's brand name,
 * niche, content type, and optional rate. Deliverables come from a FIXED
 * per-content-type bank, and a fixed follow-up template is included.
 *
 * It is a client-side TEMPLATE ENGINE. It does NOT contact brands, does
 * not personalize beyond the slots you fill, and cannot promise replies or
 * deals. It is NOT AI.
 *
 * FIXED DATA (documented):
 * - CONTENT_TYPES: 5 selectable content types.
 * - DELIVERABLES_BANK: fixed deliverables list per content type
 *   (5 types x 4 items each = 20 items).
 * - PITCH_TEMPLATE: one fixed pitch body with {brand}, {niche},
 *   {contentType}, {rateLine} slots.
 * - FOLLOWUP_TEMPLATE: one fixed follow-up message with {brand},
 *   {niche}, {contentType} slots.
 *
 * Deterministic: same inputs -> identical pitch, always.
 * Zero imports, zero DOM, zero network, zero Math.random.
 */

export const MAX_TEXT_LENGTH = 120;

/** The 5 selectable content types. */
export const CONTENT_TYPES: ReadonlyArray<string> = [
  "Product unboxing video",
  "Testimonial-style review",
  "Day-in-my-life integration",
  "Before/after transformation",
  "Photo carousel post",
];

/**
 * Fixed deliverables per content type.
 * Bank size: 5 types x 4 items = 20 items.
 */
export const DELIVERABLES_BANK: Readonly<Record<string, ReadonlyArray<string>>> = {
  "Product unboxing video": [
    "1 vertical unboxing video (30-60 seconds)",
    "3 high-resolution product photos",
    "1 round of revisions",
    "Usage rights for 3 months of paid ads (negotiable)",
  ],
  "Testimonial-style review": [
    "1 talking-head testimonial video (30-90 seconds)",
    "Written testimonial (50-100 words)",
    "2 lifestyle photos featuring the product",
    "1 round of revisions",
  ],
  "Day-in-my-life integration": [
    "1 day-in-my-life video with natural product integration",
    "3 behind-the-scenes photos",
    "1 round of revisions",
    "Organic posting rights for my feed and stories",
  ],
  "Before/after transformation": [
    "1 before/after transformation video",
    "Side-by-side comparison photos",
    "1 round of revisions",
    "Usage rights for 3 months of paid ads (negotiable)",
  ],
  "Photo carousel post": [
    "1 photo carousel (5-8 slides) featuring the product",
    "Caption written in my brand voice",
    "1 round of revisions",
    "Stories repost of the carousel",
  ],
};

const PITCH_TEMPLATE =
  "Hi {brand} team,\n" +
  "\n" +
  "I create {niche} content on Instagram, and I'd love to collaborate on a {contentType} featuring {brand}.\n" +
  "\n" +
  "Here's what I'd deliver:\n" +
  "{deliverables}\n" +
  "\n" +
  "{rateLine}\n" +
  "\n" +
  "Happy to share my media kit and past work. Would you be open to a quick chat this week?\n" +
  "\n" +
  "Thanks,\n" +
  "[Your Name]";

const FOLLOWUP_TEMPLATE =
  "Hi {brand} team — just following up on my message about a {contentType} collaboration. " +
  "I have a couple of ideas specifically for {niche} audiences that I think you'd like. " +
  "Still interested in chatting this week?";

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** Validate one required text field. Returns trimmed value or an error. */
function readText(
  values: Record<string, unknown>,
  id: string,
  label: string,
): { value: string } | { error: string } {
  const raw = values[id];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return { error: `Please enter the ${label} (for example, "GlowLab").` };
  }
  const value = raw.trim();
  if (value.length > MAX_TEXT_LENGTH) {
    return { error: `The ${label} must be ${MAX_TEXT_LENGTH} characters or fewer.` };
  }
  return { value };
}

/** Build the pitch, deliverables, and follow-up. Exported for tests. */
export function buildPitch(
  brand: string,
  niche: string,
  contentType: string,
  rate: string,
): { pitch: string; deliverables: string[]; followUp: string } {
  const deliverables = [...DELIVERABLES_BANK[contentType]];
  const rateLine =
    rate.length > 0
      ? `My rate for this package is ${rate}.`
      : "My rates are flexible — happy to discuss what works for your budget.";
  const pitch = PITCH_TEMPLATE.replace("{brand}", brand)
    .replace("{niche}", niche)
    .replace("{contentType}", lowerFirst(contentType))
    .replace("{brand}", brand)
    .replace(
      "{deliverables}",
      deliverables.map((d) => `- ${d}`).join("\n"),
    )
    .replace("{rateLine}", rateLine);
  const followUp = FOLLOWUP_TEMPLATE.replace("{brand}", brand)
    .replace("{contentType}", lowerFirst(contentType))
    .replace("{niche}", niche);
  return { pitch, deliverables, followUp };
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const brand = readText(values, "brand", "brand name");
  if ("error" in brand) return { ok: false, error: brand.error };

  const niche = readText(values, "niche", "niche");
  if ("error" in niche) return { ok: false, error: niche.error };

  const rawType = values["contentType"];
  if (typeof rawType !== "string" || rawType.trim().length === 0) {
    return { ok: false, error: "Please choose a content type for the pitch." };
  }
  const contentType = rawType.trim();
  if (!CONTENT_TYPES.includes(contentType)) {
    return { ok: false, error: `"${rawType}" is not a valid content type. Please choose one of the listed options.` };
  }

  let rate = "";
  const rawRate = values["rate"];
  if (typeof rawRate === "string" && rawRate.trim().length > 0) {
    rate = rawRate.trim();
    if (rate.length > MAX_TEXT_LENGTH) {
      return { ok: false, error: `The rate must be ${MAX_TEXT_LENGTH} characters or fewer.` };
    }
  }

  const { pitch, deliverables, followUp } = buildPitch(brand.value, niche.value, contentType, rate);
  return {
    ok: true,
    values: {
      pitch,
      deliverablesList: deliverables,
      followUpTemplate: followUp,
    },
  };
}
