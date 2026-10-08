/**
 * TikTok Live Shopping Script Planner (tool-200) — template run-of-show planner.
 * Zero imports, zero network, zero DOM, no Math.random.
 *
 * HONESTY: builds a live-shopping script from FIXED segment templates and
 * fixed CTA banks — templated, not AI-written, with NO TikTok Shop
 * integration (honest gap: the user must add and verify product links
 * manually). Makes no sales guarantees — price-drop lines are clearly
 * labeled SAMPLES the user replaces with real prices. Always includes a
 * "check TikTok Shop policies for your region" note.
 *
 * WORD BANKS (all fixed; sizes documented):
 *   PRODUCT_SEGMENTS   6 product-segment templates ({name}/{price} slots)
 *   URGENCY_CTAS        6 fixed urgency call-to-action lines
 *   INTRO / FLASH-DEAL / CLOSE: fixed script rows
 *   TOTAL: 15 fixed bank entries.
 *
 * Determinism: FNV-1a seed from the product list; same inputs -> same
 * outputs. Minutes are distributed proportionally by segment weight and
 * always sum exactly to liveDurationMin.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MIN_DURATION = 10;
const MAX_DURATION = 240;
const MAX_PRODUCTS = 12;
const MAX_PRODUCT_LEN = 100;

/** FNV-1a 32-bit hash — deterministic bank seeding, no Math.random. */
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

interface Product {
  name: string;
  price: string;
}

interface Segment {
  name: string;
  detail: string;
  weight: number;
}

/** Parse one textarea line: "Product name" or "Product name | $19.99". */
function parseProduct(line: string): Product {
  const parts = line.split("|").map((p) => p.trim());
  return { name: parts[0], price: parts.length > 1 ? parts[1] : "" };
}

const PRODUCT_SEGMENTS: readonly Segment[] = [
  {
    name: "Product spotlight: {name}",
    detail: "Hold {name} up, name 3 benefits in 30 seconds{priceLine}, then demo it live.",
    weight: 3,
  },
  {
    name: "{name} live demo",
    detail: "Demo {name} on camera — narrate each step{priceLine} and show the result up close.",
    weight: 3,
  },
  {
    name: "{name}: questions + objections",
    detail: "Answer the top chat questions about {name}; address the biggest objection before anyone asks.",
    weight: 2,
  },
  {
    name: "{name} social proof",
    detail: "Read one real review or show one real result for {name} — specifics sell, adjectives don't.",
    weight: 2,
  },
  {
    name: "{name} vs alternatives",
    detail: "Compare {name} to the usual alternative in one honest minute — price, quality, one clear winner.",
    weight: 2,
  },
  {
    name: "{name} rapid recap",
    detail: "60-second recap of {name}: what it is, who it's for, and the live-only reason to grab it now.",
    weight: 1,
  },
];

const URGENCY_CTAS: readonly string[] = [
  "Tap the product link below — this live price ends when the stream ends.",
  "Only a few left at this live price — check the pin before it unpins.",
  "Buying during the LIVE gets you the deal on screen — it won't be there after.",
  "Comment 'MINE' and tap the link — the cart is right under this video.",
  "This flash deal runs for the next few minutes only — set a timer and tap the link.",
  "If you're watching the replay, the next LIVE brings the next deal — follow so you don't miss it.",
];

function fillProduct(template: string, p: Product): string {
  const priceLine = p.price.length > 0 ? ` (${p.price})` : "";
  return template
    .split("{name}").join(p.name)
    .split("{priceLine}").join(priceLine)
    .split("{price}").join(p.price.length > 0 ? p.price : "today's live price");
}

/** Distribute `total` minutes across weights; result sums exactly to total. */
function distribute(total: number, weights: number[]): number[] {
  const wSum = weights.reduce((a, b) => a + b, 0);
  const mins = weights.map((w) => Math.floor((total * w) / wSum));
  let remainder = total - mins.reduce((a, b) => a + b, 0);
  let i = 0;
  while (remainder > 0) {
    mins[i % mins.length] += 1;
    remainder--;
    i++;
  }
  return mins;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const rawProducts = values["products"];
  let lines: string[];
  if (Array.isArray(rawProducts)) {
    lines = rawProducts.map((p) => String(p));
  } else if (typeof rawProducts === "string") {
    lines = rawProducts.split("\n");
  } else if (rawProducts === undefined || rawProducts === null) {
    return {
      ok: false,
      error: 'Please list your products — one per line, for example "Silk pillowcase | $24.99" — so the script has something to sell.',
    };
  } else {
    return { ok: false, error: "Products must be a list — one product per line." };
  }
  const products: Product[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;
    if (trimmed.length > MAX_PRODUCT_LEN) {
      return { ok: false, error: `Product "${trimmed.slice(0, 30)}..." is too long — keep each product under ${MAX_PRODUCT_LEN} characters.` };
    }
    products.push(parseProduct(trimmed));
  }
  if (products.length === 0) {
    return {
      ok: false,
      error: 'Please list at least one product — one per line, for example "Silk pillowcase | $24.99".',
    };
  }
  if (products.length > MAX_PRODUCTS) {
    return {
      ok: false,
      error: `A single live session covers at most ${MAX_PRODUCTS} products — you listed ${products.length}. Split the rest into a second session.`,
    };
  }

  const rawDur = values["liveDurationMin"];
  if (typeof rawDur !== "number" || !Number.isFinite(rawDur)) {
    return { ok: false, error: "Please enter your planned live duration in minutes (a whole number from 10 to 240)." };
  }
  if (!Number.isInteger(rawDur)) {
    return { ok: false, error: "Duration must be a whole number of minutes between 10 and 240." };
  }
  if (rawDur < MIN_DURATION || rawDur > MAX_DURATION) {
    return { ok: false, error: `Duration must be between ${MIN_DURATION} and ${MAX_DURATION} minutes.` };
  }
  const duration = rawDur;

  const seed = hashString(products.map((p) => p.name.toLowerCase()).join("|"));

  // ---- build segments: intro, one block per product, flash deal, Q&A, close ----
  const segments: Segment[] = [
    {
      name: "Intro + today's lineup",
      detail: `Welcome viewers, name the ${products.length} product${products.length === 1 ? "" : "s"} on today's list, and promise one live-only deal — no greetings longer than 60 seconds.`,
      weight: 1,
    },
  ];
  for (let i = 0; i < products.length; i++) {
    const t = PRODUCT_SEGMENTS[(seed + i) % PRODUCT_SEGMENTS.length];
    segments.push({
      name: fillProduct(t.name, products[i]),
      detail: fillProduct(t.detail, products[i]),
      weight: t.weight,
    });
  }
  if (duration >= 30) {
    segments.push({
      name: "Flash-deal moment",
      detail: "Announce one time-boxed deal on your hero product (SAMPLE script below — replace with your real price), pin it, and count down the last 2 minutes on camera.",
      weight: 1,
    });
  }
  segments.push(
    {
      name: "Buyer Q&A",
      detail: "Slow down and answer purchase questions from the chat — sizing, shipping, returns. Say each buyer's name.",
      weight: 1.5,
    },
    {
      name: "Close + final CTA",
      detail: `Recap the ${products.length === 1 ? "product" : "products"} in one line each, repeat the live-only deal, and sign off: "Tap the links below before they reset."`,
      weight: 1,
    },
  );

  const mins = distribute(duration, segments.map((s) => s.weight));
  const rows: string[][] = [];
  let cursor = 0;
  for (let i = 0; i < segments.length; i++) {
    const start = cursor;
    const end = cursor + mins[i];
    cursor = end;
    rows.push([`${start}–${end} min`, segments[i].name, segments[i].detail]);
  }

  const productSegments = products.map((p, i) => {
    const label = p.price.length > 0 ? `${p.name} — ${p.price}` : p.name;
    return `Segment ${i + 2}: ${label}. Demo it live, answer objections, then move to the price-drop line below.`;
  });

  const priceDropMoments = products.map((p) => {
    const priceBit = p.price.length > 0 ? `at ${p.price}` : "at the live-only price";
    return `SAMPLE price-drop line for "${p.name}": "For the next 5 minutes only, ${p.name} is ${priceBit} — tap the product link pinned below. (Sample script — set your real price and deal in TikTok Shop before going live.)"`;
  });

  const pinProductCues = products.map(
    (p, i) =>
      `Pin "${p.name}" in the product tray right as segment ${i + 2} starts, and unpin it when the segment ends so the next product gets the spotlight.`,
  );

  const urgencyCtas = URGENCY_CTAS.map((c) => c);

  const shopPolicyNote =
    "Honest gap + policy note: this planner is a static template and does NOT connect to TikTok Shop — add your " +
    "products and verify every product link manually before going live. Check TikTok Shop's policies for your " +
    "region (age gates, restricted categories, disclosure rules) as they change over time. No sales outcomes are " +
    "promised; results depend on your audience, pricing, and presentation.";

  return {
    ok: true,
    values: {
      runOfShow: { columns: ["Time", "Segment", "Script"], rows },
      productSegments,
      priceDropMoments,
      pinProductCues,
      urgencyCtas,
      shopPolicyNote,
    },
  };
}
