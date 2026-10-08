/**
 * Negative Prompt Library — pure logic (tool-533), zero imports, zero
 * network, zero DOM.
 *
 * HONESTY CONTRACT: a curated data bank of ~60 negative-prompt phrases.
 * Nothing here is AI-generated or model-specific "secret sauce" — these are
 * plain descriptive phrases photographers and prompt engineers commonly use
 * to steer image models away from artifacts. Filtering and combining is pure
 * string/list logic. Copy must never claim "AI-powered".
 */

export interface NegativePromptItem {
  /** Display phrase, e.g. "blurry". */
  phrase: string;
  /** Category id this phrase belongs to. */
  category: string;
}

export interface NegativePromptCategory {
  id: string;
  label: string;
  blurb: string;
}

/** 6 categories × 10 phrases = 60 curated negative-prompt phrases. */
export const NEGATIVE_CATEGORIES: NegativePromptCategory[] = [
  {
    id: "photorealism-artifacts",
    label: "Photorealism artifacts",
    blurb: "Compression, blur and watermark flaws that break realism.",
  },
  {
    id: "anatomy",
    label: "Anatomy",
    blurb: "Hands, faces and body-proportion glitches.",
  },
  {
    id: "text-typography",
    label: "Text & typography",
    blurb: "Unwanted words, captions and gibberish text in the image.",
  },
  {
    id: "cartoon-style",
    label: "Cartoon style",
    blurb: "Stylized looks to exclude when you want photographic output.",
  },
  {
    id: "lighting-exposure",
    label: "Lighting & exposure",
    blurb: "Flat, blown-out or muddy lighting problems.",
  },
  {
    id: "composition",
    label: "Composition",
    blurb: "Framing and layout mistakes.",
  },
];

/** Fixed data bank of exactly 60 phrases, 10 per category. */
export const NEGATIVE_PROMPTS: NegativePromptItem[] = [
  // photorealism-artifacts (10)
  { phrase: "blurry", category: "photorealism-artifacts" },
  { phrase: "low resolution", category: "photorealism-artifacts" },
  { phrase: "pixelated", category: "photorealism-artifacts" },
  { phrase: "jpeg artifacts", category: "photorealism-artifacts" },
  { phrase: "compression artifacts", category: "photorealism-artifacts" },
  { phrase: "watermark", category: "photorealism-artifacts" },
  { phrase: "signature", category: "photorealism-artifacts" },
  { phrase: "film grain", category: "photorealism-artifacts" },
  { phrase: "digital noise", category: "photorealism-artifacts" },
  { phrase: "motion blur", category: "photorealism-artifacts" },
  // anatomy (10)
  { phrase: "extra fingers", category: "anatomy" },
  { phrase: "extra limbs", category: "anatomy" },
  { phrase: "deformed hands", category: "anatomy" },
  { phrase: "mutated hands", category: "anatomy" },
  { phrase: "missing fingers", category: "anatomy" },
  { phrase: "fused fingers", category: "anatomy" },
  { phrase: "bad anatomy", category: "anatomy" },
  { phrase: "disfigured face", category: "anatomy" },
  { phrase: "asymmetric eyes", category: "anatomy" },
  { phrase: "too many teeth", category: "anatomy" },
  // text-typography (10)
  { phrase: "text", category: "text-typography" },
  { phrase: "words", category: "text-typography" },
  { phrase: "letters", category: "text-typography" },
  { phrase: "captions", category: "text-typography" },
  { phrase: "subtitles", category: "text-typography" },
  { phrase: "signage", category: "text-typography" },
  { phrase: "misspelled words", category: "text-typography" },
  { phrase: "gibberish text", category: "text-typography" },
  { phrase: "watermarked text", category: "text-typography" },
  { phrase: "logo text", category: "text-typography" },
  // cartoon-style (10)
  { phrase: "cartoon", category: "cartoon-style" },
  { phrase: "anime", category: "cartoon-style" },
  { phrase: "3d render", category: "cartoon-style" },
  { phrase: "plastic skin", category: "cartoon-style" },
  { phrase: "claymation", category: "cartoon-style" },
  { phrase: "comic book style", category: "cartoon-style" },
  { phrase: "low poly", category: "cartoon-style" },
  { phrase: "flat vector", category: "cartoon-style" },
  { phrase: "cel shaded", category: "cartoon-style" },
  { phrase: "doll-like", category: "cartoon-style" },
  // lighting-exposure (10)
  { phrase: "harsh shadows", category: "lighting-exposure" },
  { phrase: "blown highlights", category: "lighting-exposure" },
  { phrase: "flat lighting", category: "lighting-exposure" },
  { phrase: "lens flare", category: "lighting-exposure" },
  { phrase: "chromatic aberration", category: "lighting-exposure" },
  { phrase: "heavy vignette", category: "lighting-exposure" },
  { phrase: "underexposed", category: "lighting-exposure" },
  { phrase: "overexposed", category: "lighting-exposure" },
  { phrase: "dull colors", category: "lighting-exposure" },
  { phrase: "washed out", category: "lighting-exposure" },
  // composition (10)
  { phrase: "cropped head", category: "composition" },
  { phrase: "cut off limbs", category: "composition" },
  { phrase: "tilted horizon", category: "composition" },
  { phrase: "busy background", category: "composition" },
  { phrase: "cluttered", category: "composition" },
  { phrase: "off-center", category: "composition" },
  { phrase: "empty frame", category: "composition" },
  { phrase: "awkward framing", category: "composition" },
  { phrase: "camera tilt", category: "composition" },
  { phrase: "duplicate subject", category: "composition" },
];

export const EXPECTED_BANK_SIZE = 60;

/** Use-case presets -> category sets. Fixed mapping, pure data. */
export const USE_CASES: { id: string; label: string; categories: string[] }[] =
  [
    {
      id: "photorealism",
      label: "Photorealistic images",
      categories: [
        "photorealism-artifacts",
        "anatomy",
        "text-typography",
        "lighting-exposure",
      ],
    },
    {
      id: "portraits",
      label: "Portraits",
      categories: ["anatomy", "lighting-exposure", "composition"],
    },
    {
      id: "anime",
      label: "Anime / illustration",
      categories: ["text-typography", "composition", "lighting-exposure"],
    },
    {
      id: "product",
      label: "Product shots",
      categories: [
        "photorealism-artifacts",
        "text-typography",
        "composition",
        "lighting-exposure",
      ],
    },
    {
      id: "landscape",
      label: "Landscapes",
      categories: [
        "photorealism-artifacts",
        "lighting-exposure",
        "composition",
      ],
    },
    {
      id: "all",
      label: "All categories",
      categories: NEGATIVE_CATEGORIES.map((c) => c.id),
    },
  ];

/** Base openers prepended to every built negative prompt. */
const BASE_OPENERS = ["worst quality", "low quality", "ugly"];

/**
 * Filter the bank by category id ("all" returns everything).
 * Unknown ids return an empty list (caller validates).
 */
export function filterByCategory(categoryId: string): NegativePromptItem[] {
  if (categoryId === "all") return [...NEGATIVE_PROMPTS];
  return NEGATIVE_PROMPTS.filter((p) => p.category === categoryId);
}

/** Phrases recommended for a use case (deduped, category order). */
export function phrasesForUseCase(useCaseId: string): NegativePromptItem[] {
  const preset = USE_CASES.find((u) => u.id === useCaseId);
  if (!preset) return [];
  const out: NegativePromptItem[] = [];
  const seen = new Set<string>();
  for (const cat of preset.categories) {
    for (const p of filterByCategory(cat)) {
      if (!seen.has(p.phrase)) {
        seen.add(p.phrase);
        out.push(p);
      }
    }
  }
  return out;
}

/**
 * Combine base openers + library phrases + user custom phrases into one
 * comma-separated negative prompt. Dedupes case-insensitively.
 */
export function buildNegativePrompt(
  libraryPhrases: string[],
  customPhrases: string[],
): string {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (s: string): void => {
    const v = s.trim();
    if (v && !seen.has(v.toLowerCase())) {
      seen.add(v.toLowerCase());
      out.push(v);
    }
  };
  for (const b of BASE_OPENERS) push(b);
  for (const p of libraryPhrases) push(p);
  for (const c of customPhrases) push(c);
  return out.join(", ");
}

/** Dedupe a list case-insensitively, preserving first-seen order. */
function dedupe(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of list) {
    const key = s.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(s);
    }
  }
  return out;
}

/** Select-option labels (what the UI submits) -> internal ids. */
export const CATEGORY_LABEL_TO_ID: Record<string, string> = {
  "All categories (60 phrases)": "all",
  "Photorealism artifacts": "photorealism-artifacts",
  Anatomy: "anatomy",
  "Text & typography": "text-typography",
  "Cartoon style": "cartoon-style",
  "Lighting & exposure": "lighting-exposure",
  Composition: "composition",
};

export const USE_CASE_LABEL_TO_ID: Record<string, string> = {
  "No preset — use the category list": "",
  "Photorealistic images": "photorealism",
  Portraits: "portraits",
  "Anime / illustration": "anime",
  "Product shots": "product",
  Landscapes: "landscape",
  "Everything (all 60)": "all",
};

/** Resolve a UI select label (or raw id) to an internal category id. */
export function resolveCategoryId(labelOrId: string): string {
  return CATEGORY_LABEL_TO_ID[labelOrId] ?? labelOrId;
}

/** Resolve a UI select label (or raw id) to an internal use-case id. */
export function resolveUseCaseId(labelOrId: string): string {
  return USE_CASE_LABEL_TO_ID[labelOrId] ?? labelOrId;
}

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.categoryId: a category select label (or id); values.useCaseId: a
 * use-case select label (or id); values.customPhrases: optional
 * comma-separated extra phrases.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const categoryId =
    typeof values["categoryId"] === "string" && values["categoryId"] !== ""
      ? resolveCategoryId(values["categoryId"])
      : "all";
  const useCaseId =
    typeof values["useCaseId"] === "string"
      ? resolveUseCaseId(values["useCaseId"])
      : "";

  const validCategory =
    categoryId === "all" ||
    NEGATIVE_CATEGORIES.some((c) => c.id === categoryId);
  if (!validCategory) {
    return { ok: false, error: "Unknown category selected." };
  }
  if (useCaseId !== "" && !USE_CASES.some((u) => u.id === useCaseId)) {
    return { ok: false, error: "Unknown use case selected." };
  }

  const rawCustom = values["customPhrases"];
  if (
    rawCustom !== undefined &&
    rawCustom !== null &&
    rawCustom !== "" &&
    typeof rawCustom !== "string"
  ) {
    return { ok: false, error: "Custom phrases must be text." };
  }
  const customPhrases =
    typeof rawCustom === "string"
      ? dedupe(
          rawCustom
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0),
        )
      : [];

  const inCategory = filterByCategory(categoryId);
  const recommended =
    useCaseId === "" ? [] : phrasesForUseCase(useCaseId);
  const combined = buildNegativePrompt(
    inCategory.map((p) => p.phrase),
    customPhrases,
  );

  return {
    ok: true,
    values: {
      items: inCategory.map((p) => ({ phrase: p.phrase, category: p.category })),
      count: inCategory.length,
      useCase: useCaseId,
      useCaseRecommended: recommended.map((p) => p.phrase),
      combinedPrompt: combined,
      customAdded: customPhrases,
    },
  };
}
