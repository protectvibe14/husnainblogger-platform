/**
 * TikTok Unboxing Flow Planner (tool-169) — pure template planner.
 *
 * Honesty: this is NOT AI. It assembles a shot-by-shot unboxing plan from
 * FIXED shot-list templates, picking reaction lines deterministically from
 * the user's inputs. It cannot film, listen to, or review the product.
 *
 * Fixed banks (sizes documented for QA):
 * - TEASERS: 8 teaser hook lines
 * - SHOT_BEATS: 7 fixed shot beats { shot, action } (order never changes)
 * - REACTIONS: 10 reaction lines ("Say:" lines)
 * - SOUND_CUES: 8 ASMR sound-cue lines (added only for ASMR-style)
 * - REVEAL_CTAS: 6 reveal + CTA closing lines
 *
 * ASMR-style rule: if the niche is "ASMR / Sensory" OR the product name
 * contains "asmr" (case-insensitive), every beat gains a sound-cue line
 * and the style is reported as "ASMR-style".
 *
 * Zero imports, zero network, zero DOM, no randomness. Same inputs always
 * produce the same plan (djb2 hash seed).
 */

export type UnboxingResult =
  | { ok: true; values: Record<string, string | string[]> }
  | { ok: false; error: string };

export const NICHE_OPTIONS: string[] = [
  "Beauty / Skincare",
  "Tech / Gadgets",
  "Fashion / Clothing",
  "Food / Snacks",
  "Toys / Collectibles",
  "ASMR / Sensory",
  "Other",
];

const TEASERS: string[] = [
  "You are not ready for what is inside this box. {product} unboxing starts now.",
  "I finally got the {product} — let us open it together.",
  "POV: the {product} you ordered weeks ago finally arrives.",
  "Unboxing the {product} — first impressions only, no script.",
  "This {product} has been all over my feed. Time to see why.",
  "Brand new {product}, sealed box, zero expectations. Let us open it.",
  "I ordered the {product} so you do not have to — full unboxing.",
  "The {product} is here. Opening it on camera, unfiltered.",
];

const SHOT_BEATS: { shot: string; action: string }[] = [
  { shot: "Box teaser", action: "Hold the sealed box close to camera and shake it lightly" },
  { shot: "The opening", action: "Cut or peel the seal slowly — this is the satisfying part" },
  { shot: "First look", action: "Lift the lid or flap and pause on your genuine reaction" },
  { shot: "Layer by layer", action: "Remove packaging layers one at a time, showing each" },
  { shot: "The reveal", action: "Lift the product out and hold it up to the camera" },
  { shot: "Detail scan", action: "Slow close-up pan across the product from every angle" },
  { shot: "First touch", action: "Touch, press, or try the product for the first time on camera" },
];

const REACTIONS: string[] = [
  "Okay, this packaging is actually nice.",
  "Wait — it comes with this too?",
  "First impression: better than the photos.",
  "I did not expect it to feel like this.",
  "The smell / texture is giving premium.",
  "This is bigger than I thought.",
  "Okay, I am officially excited now.",
  "They really thought about the details here.",
  "This is the moment I have been waiting for.",
  "Genuinely surprised — in a good way.",
];

const SOUND_CUES: string[] = [
  "Tap the box twice before opening — let the cardboard sound land.",
  "Peel the tape slowly, close to the mic.",
  "Crinkle the wrapping paper right next to the microphone.",
  "Pop the seal and pause — let the click breathe.",
  "Slide the product out with a soft scrape on the table.",
  "Knock on the product surface twice for the hollow sound.",
  "Unwrap the protective film in one slow pull.",
  "Set the product down gently — catch the soft thud.",
];

const REVEAL_CTAS: string[] = [
  "And there it is — the {product}. Comment what I should test first.",
  "Full reveal done. Follow for the honest review after one week of use.",
  "That is the unboxing — save this if you are thinking of buying the {product}.",
  "Reveal complete! Duet this with your own unboxing.",
  "Unboxed and first-touched. Like if you want the full review next.",
  "There it is, in all its glory. What should I unbox next?",
];

/** Deterministic 32-bit hash of a string (djb2). */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function fill(template: string, product: string): string {
  return template.split("{product}").join(product);
}

export function runTool(values: Record<string, unknown>): UnboxingResult {
  const productRaw = values.productName;
  if (typeof productRaw !== "string" || productRaw.trim().length === 0) {
    return { ok: false, error: "Enter a product name (e.g. 'Aurora Vitamin C Serum')." };
  }
  const product = productRaw.trim();
  if (product.length > 150) {
    return { ok: false, error: "Product name must be 150 characters or fewer." };
  }

  const nicheRaw = values.niche;
  if (typeof nicheRaw !== "string" || nicheRaw.trim().length === 0) {
    return { ok: false, error: "Pick a niche so the plan fits the product type." };
  }
  if (!NICHE_OPTIONS.includes(nicheRaw)) {
    return { ok: false, error: "Pick a niche from the list." };
  }
  const niche = nicheRaw;

  const asmr = niche === "ASMR / Sensory" || /asmr/i.test(product);
  const seed = hashString(`${product}|${niche}`);

  const beats: string[] = [];
  const reactionOffset = seed % REACTIONS.length;
  const cueOffset = (seed >>> 6) % SOUND_CUES.length;
  SHOT_BEATS.forEach((beat, i) => {
    const reaction = REACTIONS[(reactionOffset + i) % REACTIONS.length];
    let line = `Shot ${i + 1} — ${beat.shot}: ${beat.action}. Say: "${reaction}"`;
    if (asmr) {
      line += ` Sound cue: ${SOUND_CUES[(cueOffset + i) % SOUND_CUES.length]}`;
    }
    beats.push(line);
  });

  return {
    ok: true,
    values: {
      teaser: fill(TEASERS[seed % TEASERS.length], product),
      style: asmr ? "ASMR-style" : "Standard",
      beats,
      revealCta: fill(REVEAL_CTAS[(seed >>> 3) % REVEAL_CTAS.length], product),
    },
  };
}
