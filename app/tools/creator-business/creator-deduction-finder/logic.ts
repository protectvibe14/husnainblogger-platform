/**
 * Creator Deduction Finder — pure logic (tool-470), zero imports,
 * zero network, zero DOM.
 *
 * HONESTY CONTRACT: rule-based matcher over a CURATED general-information
 * list of 18 common expense categories. The tool NEVER determines that an
 * item is deductible for the user — every result is labeled "general
 * information" and carries a "confirm with a tax professional" note.
 * Country-specific rules are not encoded anywhere.
 *
 * Fixed data (documented sizes):
 *  - DEDUCTION_CATEGORIES: 18 entries (name + general description + aliases)
 *  - CREATOR_TYPE_RELEVANCE: 5 creator types -> category ids commonly
 *    tracked by that type (suggestions, not determinations)
 *  - RECORD_KEEPING_TIPS: 6 fixed tips
 *  - QUESTIONS_FOR_TAX_PRO: 5 fixed questions
 * Deterministic: same inputs -> same outputs, always.
 */

export interface DeductionCategory {
  id: string;
  name: string;
  covers: string;
  aliases: string[];
}

/** 18 curated general-information expense categories. */
export const DEDUCTION_CATEGORIES: DeductionCategory[] = [
  { id: "cameras-gear", name: "Cameras & filming gear", covers: "Cameras, lenses, tripods, gimbals, and related filming equipment.", aliases: ["camera", "cameras", "filming gear", "lens", "lenses", "tripod", "gimbal", "dslr", "mirrorless", "camcorder"] },
  { id: "audio-gear", name: "Audio equipment", covers: "Microphones, recorders, headphones, and audio interfaces.", aliases: ["mic", "mics", "microphone", "microphones", "audio", "headphones", "recorder", "audio interface"] },
  { id: "lighting", name: "Lighting equipment", covers: "Studio lights, softboxes, LED panels, and modifiers.", aliases: ["lighting", "lights", "softbox", "led", "ring light", "studio light"] },
  { id: "editing-software", name: "Editing software & apps", covers: "Video, photo, and audio editing software and mobile apps.", aliases: ["software", "apps", "editing software", "premiere", "final cut", "davinci", "photoshop", "lightroom", "capcut", "audition", "logic pro"] },
  { id: "computer-storage", name: "Computer & storage", covers: "Computers, monitors, hard drives, and memory cards used for content work.", aliases: ["computer", "laptop", "pc", "macbook", "monitor", "hard drive", "ssd", "storage", "memory card", "tablet"] },
  { id: "internet-phone", name: "Internet & phone", covers: "Internet service and mobile phone costs, for the business portion of use.", aliases: ["internet", "wifi", "phone", "mobile", "broadband", "cell phone"] },
  { id: "home-office", name: "Home office", covers: "A dedicated workspace at home; the rules for claiming it vary widely by country.", aliases: ["home office", "office", "workspace", "studio rent at home"] },
  { id: "vehicle-mileage", name: "Vehicle & mileage", covers: "Business driving: mileage logs or actual vehicle costs.", aliases: ["vehicle", "car", "mileage", "miles", "gas", "fuel", "driving", "uber for business"] },
  { id: "travel", name: "Travel", covers: "Flights, hotels, and meals tied to business trips and shoots.", aliases: ["travel", "flights", "flight", "hotel", "hotels", "airbnb", "business trip", "shoot travel"] },
  { id: "advertising", name: "Advertising & promotion", covers: "Paid ads, boosted posts, and promotion spend for your content or services.", aliases: ["advertising", "ads", "promotion", "marketing", "boosted posts", "facebook ads", "google ads"] },
  { id: "website-hosting", name: "Website & hosting", covers: "Domain names, hosting, and website builders for your creator site.", aliases: ["website", "hosting", "domain", "wordpress", "squarespace", "wix", "webflow"] },
  { id: "professional-services", name: "Professional services", covers: "Accountants, tax preparers, lawyers, and business consultants.", aliases: ["accountant", "accounting", "lawyer", "legal", "consultant", "bookkeeper", "tax preparer"] },
  { id: "education", name: "Education & courses", covers: "Courses, workshops, and books that maintain or improve your creator skills.", aliases: ["course", "courses", "education", "training", "workshop", "ebook", "books", "masterclass"] },
  { id: "subscriptions-stock", name: "Subscriptions & stock assets", covers: "Stock footage, music licensing, fonts, and creator-tool subscriptions.", aliases: ["subscription", "subscriptions", "stock", "stock footage", "music licensing", "fonts", "templates", "artlist", "epidemic sound"] },
  { id: "props-materials", name: "Props, materials & wardrobe", covers: "Props, set materials, and wardrobe bought specifically for content.", aliases: ["props", "prop", "wardrobe", "costume", "set design", "materials", "backdrop"] },
  { id: "contractors", name: "Contractors & freelancers", covers: "Editors, designers, virtual assistants, and other contractors you pay.", aliases: ["contractor", "contractors", "freelancer", "freelancers", "editor", "designer", "virtual assistant", "va", "thumbnail designer"] },
  { id: "payment-fees", name: "Payment processing fees", covers: "Platform and payment-processor fees on money you receive.", aliases: ["fees", "paypal fees", "stripe", "processing fees", "transaction fees", "platform fees"] },
  { id: "insurance", name: "Insurance", covers: "Business, equipment, or liability insurance for your creator work.", aliases: ["insurance", "liability", "equipment insurance"] },
];

export const CREATOR_TYPES = ["video", "photo", "audio", "writer", "streamer"] as const;
export type CreatorType = (typeof CREATOR_TYPES)[number];

/** Category ids commonly tracked by each creator type (suggestions only). */
const CREATOR_TYPE_RELEVANCE: Record<CreatorType, string[]> = {
  video: ["cameras-gear", "audio-gear", "lighting", "editing-software", "computer-storage", "subscriptions-stock", "props-materials"],
  photo: ["cameras-gear", "lighting", "editing-software", "computer-storage", "props-materials", "website-hosting"],
  audio: ["audio-gear", "editing-software", "computer-storage", "subscriptions-stock", "home-office"],
  writer: ["computer-storage", "internet-phone", "subscriptions-stock", "education", "website-hosting", "home-office"],
  streamer: ["computer-storage", "audio-gear", "cameras-gear", "internet-phone", "editing-software", "subscriptions-stock"],
};

/** 6 fixed record-keeping tips (general information). */
export const RECORD_KEEPING_TIPS: string[] = [
  "Keep business and personal spending separate — a dedicated account or card makes records far easier to maintain.",
  "Save every receipt digitally on the day you spend, with a short note about what the purchase was for.",
  "Log business mileage on the day you drive it, including the trip purpose.",
  "Track the business-use percentage of mixed items (phone, internet) instead of guessing at year end.",
  "Back up invoices, contracts, and payment confirmations somewhere you can find them later.",
  "Review this list with your tax professional before filing — rules change and vary by country.",
];

/** 5 fixed questions to ask a tax professional. */
export const QUESTIONS_FOR_TAX_PRO: string[] = [
  "Which of these expense categories apply to my situation in my country?",
  "Do I qualify for home-office rules where I live, and how are they calculated?",
  "How should I document vehicle use — a mileage log or actual costs?",
  "What records do I need to keep, and for how long?",
  "Are there filing thresholds or registration steps I should know about as a creator?",
];

export const CONFIRM_NOTE = "general information — confirm with a tax professional";

export interface DeductionFinderInput {
  creatorType?: unknown;
  expenseChecklist?: unknown;
  homeOffice?: unknown;
  vehicleUse?: unknown;
}

export interface RunResult {
  ok: boolean;
  values?: {
    matchedDeductionCategories: string[];
    recordKeepingTips: string[];
    questionsForTaxPro: string[];
  };
  error?: string;
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

/** Parse the checklist textarea into normalized non-empty entries. */
export function parseChecklist(value: unknown): string[] {
  if (typeof value !== "string") return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of value.split(/[\r\n,;]+/)) {
    const n = normalize(raw);
    if (n !== "" && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out;
}

/** Parse a boolean-ish input. */
export function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "true" || v === "1" || v === "yes";
  }
  return false;
}

/** Normalize creatorType; "" -> null (not selected); invalid -> error string. */
export function normalizeCreatorType(value: unknown): { type: CreatorType | null; error: string | null } {
  if (value === undefined || value === null) return { type: null, error: null };
  const v = normalize(String(value));
  if (v === "") return { type: null, error: null };
  const found = (CREATOR_TYPES as readonly string[]).find((t) => t === v);
  if (!found) {
    return { type: null, error: `Unknown creator type "${String(value)}". Choose one of: ${CREATOR_TYPES.join(", ")}.` };
  }
  return { type: found as CreatorType, error: null };
}

/**
 * Match checklist entries against the curated categories (exact name or
 * alias match, normalized). Returns matched ids and unmatched raw entries.
 */
export function matchCategories(entries: string[]): { matchedIds: string[]; unmatched: string[] } {
  const matchedIds: string[] = [];
  const unmatched: string[] = [];
  for (const entry of entries) {
    const hit = DEDUCTION_CATEGORIES.find(
      (c) => normalize(c.name) === entry || c.aliases.some((a) => normalize(a) === entry),
    );
    if (hit && !matchedIds.includes(hit.id)) {
      matchedIds.push(hit.id);
    } else if (!hit) {
      unmatched.push(entry);
    }
  }
  return { matchedIds, unmatched };
}

function categoryLine(c: DeductionCategory, context: string): string {
  return `${c.name} — ${c.covers} (${context}; ${CONFIRM_NOTE}).`;
}

/** Tool entry point. */
export function runTool(values: Record<string, unknown>): RunResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Select a creator type or enter at least one expense." };
  }
  const v = values as DeductionFinderInput;

  const creator = normalizeCreatorType(v.creatorType);
  if (creator.error) return { ok: false, error: creator.error };

  const entries = parseChecklist(v.expenseChecklist);
  const homeOffice = parseBoolean(v.homeOffice);
  const vehicleUse = parseBoolean(v.vehicleUse);

  if (creator.type === null && entries.length === 0 && !homeOffice && !vehicleUse) {
    return {
      ok: false,
      error: "Select a creator type, enter at least one expense category, or tick home office / vehicle use.",
    };
  }

  const { matchedIds, unmatched } = matchCategories(entries);
  const byId = new Map(DEDUCTION_CATEGORIES.map((c) => [c.id, c]));
  const lines: string[] = [];

  for (const id of matchedIds) {
    const c = byId.get(id);
    if (c) lines.push(categoryLine(c, "matched from your checklist"));
  }
  if (homeOffice && !matchedIds.includes("home-office")) {
    const c = byId.get("home-office");
    if (c) lines.push(categoryLine(c, "you indicated home-office use"));
  }
  if (vehicleUse && !matchedIds.includes("vehicle-mileage")) {
    const c = byId.get("vehicle-mileage");
    if (c) lines.push(categoryLine(c, "you indicated business vehicle use"));
  }
  if (creator.type) {
    const relevant = CREATOR_TYPE_RELEVANCE[creator.type].filter((id) => !matchedIds.includes(id));
    for (const id of relevant) {
      const c = byId.get(id);
      if (c) lines.push(categoryLine(c, `commonly tracked by ${creator.type} creators`));
    }
  }
  if (unmatched.length > 0) {
    lines.push(
      `Not on our general list — ask your tax pro about: ${unmatched.join(", ")}.`,
    );
  }

  return {
    ok: true,
    values: {
      matchedDeductionCategories: lines,
      recordKeepingTips: [...RECORD_KEEPING_TIPS],
      questionsForTaxPro: [...QUESTIONS_FOR_TAX_PRO],
    },
  };
}
