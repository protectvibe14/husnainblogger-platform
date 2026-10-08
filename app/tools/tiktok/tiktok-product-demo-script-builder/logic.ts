/**
 * TikTok Product Demo Script Builder (tool-168) — pure template builder.
 *
 * Honesty: this is NOT AI. It assembles a product demo script from FIXED
 * template banks, picking entries deterministically per product. It cannot
 * test the product, verify claims, or read live TikTok data. Any product
 * claims must be true and verifiable by the creator.
 *
 * FTC DISCLOSURE: when an item is marked as sponsored/affiliate, a
 * disclosure line ("#ad") is inserted into the script. This is a template
 * reminder, not legal advice — the creator is responsible for complying
 * with FTC and local disclosure rules.
 *
 * Fixed banks (sizes documented for QA):
 * - HOOKS: 8 opening hook lines
 * - DEMO_ACTIONS: 8 feature-demonstration action lines
 * - PROOF_LINES: 6 proof-moment lines
 * - CTAS: 6 closing CTA lines
 * - SHOP_CTAS: 4 optional TikTok Shop CTA lines
 * - DISCLOSURE_LINE: 1 fixed disclosure line (used only for paid demos)
 *
 * Builder contract: runTool({ items }) where each item has:
 *   productName (required, non-empty), keyFeatures (required, comma-separated,
 *   max 5), isSponsored (optional text; "yes"/"affiliate"/etc. = paid demo).
 *
 * Zero imports, zero network, zero DOM, no randomness.
 */

export type DemoResult =
  | { ok: true; values: { script: string; beats: string[] } }
  | { ok: false; error: string };

const MAX_FEATURES = 5;

const HOOKS: string[] = [
  'Stop scrolling — this {product} just changed my routine.',
  'I finally tried the {product} everyone is talking about.',
  'POV: you find a product that actually does what it promises. Meet {product}.',
  'This {product} has 30 seconds to impress me. Timer starts now.',
  'Nobody believes this {product} works until they see this.',
  'I was skeptical about {product} — then I tested it live.',
  'Watch the {product} do the thing no other product does.',
  'Unfiltered demo: {product}, no edits, no filters.',
];

const DEMO_ACTIONS: string[] = [
  "show it working live on camera with zero cuts",
  "zoom in close so viewers see the detail",
  "test it side-by-side against what you used before",
  "use it in real time and narrate what is happening",
  "hand it to someone off-camera for an honest reaction",
  "show the before state, then apply it on one half only",
  "stress-test it the way a real buyer would",
  "show the result from three angles in good light",
];

const PROOF_LINES: string[] = [
  "Here is the proof: hold the result up to the camera and let it speak for itself.",
  "No filter, no edit — this is the real result, and you can see every detail.",
  "Compare the two sides one more time. The difference is not subtle.",
  "Proof moment: show the timestamp or the untouched footage so skeptics believe it.",
  "This is take one, unedited — what you see is what buyers get.",
  "Final proof: let a friend try it on camera with no coaching.",
];

const CTAS: string[] = [
  "Would you try it? Comment YES or NO and tell me why.",
  "Follow for the 7-day update — I will show how it holds up.",
  "Save this video before you buy anything like it.",
  "Drop your questions about it below and I will answer every one.",
  "Duet this with your own demo — let us compare results.",
  "Link is below if you want the exact one I tested.",
];

const SHOP_CTAS: string[] = [
  "Tap the shop icon below to get the exact {product} I demoed.",
  "The {product} is linked in the TikTok Shop below this video.",
  "Shop the {product} through the link — same one, no substitutes.",
  "Grab the {product} from the shop link before it sells out.",
];

const DISCLOSURE_LINE =
  "DISCLOSURE: This is a paid or affiliate demo — #ad. Opinions are my own.";

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

function parseFeatures(raw: unknown, itemIndex: number): string[] | string {
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return `Item ${itemIndex}: list at least one key feature (comma-separated, max ${MAX_FEATURES}).`;
  }
  const features = raw
    .split(",")
    .map((f) => f.trim())
    .filter((f) => f.length > 0);
  if (features.length === 0) {
    return `Item ${itemIndex}: list at least one key feature (comma-separated, max ${MAX_FEATURES}).`;
  }
  if (features.length > MAX_FEATURES) {
    return `Item ${itemIndex}: max ${MAX_FEATURES} features (one demo beat each) — you listed ${features.length}.`;
  }
  return features;
}

function isSponsoredFlag(raw: unknown): boolean {
  if (typeof raw !== "string") return false;
  return /^(yes|y|true|1|sponsored|affiliate|paid)$/i.test(raw.trim());
}

function buildItemScript(
  name: string,
  features: string[],
  sponsored: boolean
): { script: string; beats: string[] } {
  const seed = hashString(name);
  const hook = fill(HOOKS[seed % HOOKS.length], name);
  const actionOffset = (seed >>> 4) % DEMO_ACTIONS.length;
  const beats: string[] = [`HOOK: ${hook}`];
  features.forEach((feature, i) => {
    beats.push(
      `BEAT ${i + 1} — ${feature}: ${DEMO_ACTIONS[(actionOffset + i) % DEMO_ACTIONS.length]}.`
    );
  });
  beats.push(`PROOF MOMENT: ${PROOF_LINES[(seed >>> 8) % PROOF_LINES.length]}`);
  if (sponsored) {
    beats.push(DISCLOSURE_LINE);
  }
  beats.push(`CTA: ${CTAS[(seed >>> 12) % CTAS.length]}`);
  beats.push(`SHOP CTA: ${fill(SHOP_CTAS[(seed >>> 16) % SHOP_CTAS.length], name)}`);

  const script = [`Product: ${name}`, "", ...beats].join("\n");
  return { script, beats };
}

export function runTool(args: { items: Record<string, unknown>[] }): DemoResult {
  const items = args.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Add at least one product to build a demo script." };
  }

  const allBeats: string[] = [];
  const scripts: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const itemIndex = i + 1;
    const item = items[i];
    if (item === null || typeof item !== "object") {
      return { ok: false, error: `Item ${itemIndex}: invalid item.` };
    }
    const nameRaw = item.productName;
    if (typeof nameRaw !== "string" || nameRaw.trim().length === 0) {
      return { ok: false, error: `Item ${itemIndex}: productName is required.` };
    }
    const name = nameRaw.trim();
    if (name.length > 150) {
      return { ok: false, error: `Item ${itemIndex}: productName must be 150 characters or fewer.` };
    }

    const parsed = parseFeatures(item.keyFeatures, itemIndex);
    if (typeof parsed === "string") {
      return { ok: false, error: parsed };
    }

    const sponsored = isSponsoredFlag(item.isSponsored);
    const { script, beats } = buildItemScript(name, parsed, sponsored);
    scripts.push(script);
    allBeats.push(...beats);
  }

  return {
    ok: true,
    values: {
      script: scripts.join("\n\n---\n\n"),
      beats: allBeats,
    },
  };
}
