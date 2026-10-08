/**
 * Email A/B Test Idea Generator — pure logic (tool-408).
 *
 * WHAT THIS IS (honesty, enforced):
 * - Generates TEST IDEAS only, from a fixed idea bank. It does NOT run
 *   tests, send emails, or analyze results. No network, no backend, no AI.
 * - Bank size: 6 test foci x 3 ideas = 18 test ideas. The email type
 *   adjusts the hypothesis wording by a fixed template; it does not invent
 *   audience behavior data.
 * - sampleSizeNote is a SIMPLIFIED RULE OF THUMB (audience floor per
 *   variant + minimum run time). It is explicitly NOT a statistical power
 *   calculation and must be labeled as such wherever shown.
 *
 * Edge-case handling (shared validation rules):
 * - listSize must be a finite number >= 0 when provided; non-finite values
 *   are rejected. Zero or tiny lists produce a "below the rule of thumb"
 *   note instead of pretending the test is fine.
 * - Test ideas cycle in fixed order — same inputs, same ideas, always.
 */

export type EmailType =
  | "welcome"
  | "newsletter"
  | "promotional"
  | "abandoned-cart"
  | "re-engagement";

export type TestFocus =
  | "subject"
  | "preheader"
  | "cta"
  | "sendTime"
  | "content"
  | "layout";

export const EMAIL_TYPES: readonly EmailType[] = [
  "welcome",
  "newsletter",
  "promotional",
  "abandoned-cart",
  "re-engagement",
];

export const TEST_FOCI: readonly TestFocus[] = [
  "subject",
  "preheader",
  "cta",
  "sendTime",
  "content",
  "layout",
];

export interface TestIdea {
  name: string;
  variable: string;
  variantA: string;
  variantB: string;
  /** Hypothesis template; {emailType} is filled from the selected email type. */
  hypothesisTemplate: string;
}

/**
 * Fixed test-idea bank: 6 foci x 3 ideas = 18 ideas. Hand-written;
 * NOT AI-generated, NOT derived from anyone's real test results.
 */
export const TEST_IDEAS: Record<TestFocus, readonly TestIdea[]> = {
  subject: [
    {
      name: "Curiosity vs. clarity",
      variable: "subject line style",
      variantA: "Curiosity-driven line: “The mistake costing you subscribers”",
      variantB: "Clear benefit line: “Cut your unsubscribe rate in 7 days”",
      hypothesisTemplate:
        "For {emailType} emails, a clear benefit subject will beat a curiosity subject on opens because the value is obvious in the inbox.",
    },
    {
      name: "Length test",
      variable: "subject line length",
      variantA: "Short (under 40 characters)",
      variantB: "Long (50–70 characters with detail)",
      hypothesisTemplate:
        "For {emailType} emails, the short subject will win on mobile opens since it never truncates.",
    },
    {
      name: "Personalization test",
      variable: "personalization token",
      variantA: "No personalization",
      variantB: "First-name token at the start",
      hypothesisTemplate:
        "For {emailType} emails, the personalized subject will lift opens by standing out in a crowded inbox.",
    },
  ],
  preheader: [
    {
      name: "Extension vs. new info",
      variable: "preheader content",
      variantA: "Preheader extends the subject line thought",
      variantB: "Preheader adds new, independent information",
      hypothesisTemplate:
        "For {emailType} emails, new information in the preheader will lift opens because it doubles the inbox real estate.",
    },
    {
      name: "CTA in preheader",
      variable: "call to action",
      variantA: "Preheader ends with a soft CTA (“see inside”)",
      variantB: "Preheader has no CTA",
      hypothesisTemplate:
        "For {emailType} emails, the soft CTA will nudge more opens from skimmers.",
    },
    {
      name: "Emoji in preheader",
      variable: "emoji usage",
      variantA: "One relevant emoji at the start",
      variantB: "No emoji",
      hypothesisTemplate:
        "For {emailType} emails, the emoji will win on opens by catching the eye in the inbox preview.",
    },
  ],
  cta: [
    {
      name: "Verb specificity",
      variable: "button text",
      variantA: "“Start my free trial”",
      variantB: "“Get started”",
      hypothesisTemplate:
        "For {emailType} emails, the specific verb will convert better because readers know exactly what happens next.",
    },
    {
      name: "Button vs. text link",
      variable: "CTA format",
      variantA: "Bold button",
      variantB: "In-text link",
      hypothesisTemplate:
        "For {emailType} emails, the button will win on clicks because it is easier to tap on mobile.",
    },
    {
      name: "One vs. multiple CTAs",
      variable: "number of CTAs",
      variantA: "Single primary CTA",
      variantB: "Primary CTA plus one secondary link",
      hypothesisTemplate:
        "For {emailType} emails, the single CTA will convert better by removing competing choices.",
    },
  ],
  sendTime: [
    {
      name: "Morning vs. evening",
      variable: "send time",
      variantA: "Send at 8:00 AM recipient-local",
      variantB: "Send at 6:00 PM recipient-local",
      hypothesisTemplate:
        "For {emailType} emails, the morning send will win on opens when readers plan their day.",
    },
    {
      name: "Weekday vs. weekend",
      variable: "send day",
      variantA: "Tuesday send",
      variantB: "Saturday send",
      hypothesisTemplate:
        "For {emailType} emails, the weekend send will win because the inbox is quieter.",
    },
    {
      name: "Consistent slot vs. test slot",
      variable: "send schedule",
      variantA: "Your usual send time",
      variantB: "One hour earlier than usual",
      hypothesisTemplate:
        "For {emailType} emails, arriving before the usual inbox rush will lift opens.",
    },
  ],
  content: [
    {
      name: "Story vs. pitch",
      variable: "email angle",
      variantA: "Opens with a short customer story",
      variantB: "Opens with the offer directly",
      hypothesisTemplate:
        "For {emailType} emails, the story will keep more readers scrolling to the CTA.",
    },
    {
      name: "Short vs. long copy",
      variable: "copy length",
      variantA: "Under 150 words",
      variantB: "400+ words with full detail",
      hypothesisTemplate:
        "For {emailType} emails, the short version will convert better because it asks for less time.",
    },
    {
      name: "Bullets vs. paragraphs",
      variable: "formatting",
      variantA: "Benefits as bullet list",
      variantB: "Benefits in prose paragraphs",
      hypothesisTemplate:
        "For {emailType} emails, bullets will win on clicks because skimmers can scan them.",
    },
  ],
  layout: [
    {
      name: "Single vs. two column",
      variable: "column layout",
      variantA: "Single-column layout",
      variantB: "Two-column layout",
      hypothesisTemplate:
        "For {emailType} emails, single-column will win on mobile clicks since stacking is natural.",
    },
    {
      name: "Hero image vs. no image",
      variable: "hero image",
      variantA: "Large hero image on top",
      variantB: "Text-first, no hero image",
      hypothesisTemplate:
        "For {emailType} emails, text-first will win when images are blocked by default.",
    },
    {
      name: "Zigzag vs. straight flow",
      variable: "content order",
      variantA: "Problem → solution → CTA",
      variantB: "CTA → proof → CTA",
      hypothesisTemplate:
        "For {emailType} emails, leading with the CTA will catch impulse readers before they bounce.",
    },
  ],
};

/** Rule-of-thumb floor: recipients per variant. A heuristic, not statistics. */
export const RULE_OF_THUMB_PER_VARIANT = 1000;
/** Rule-of-thumb minimum test run, in hours. */
export const RULE_OF_THUMB_MIN_HOURS = 24;

export interface GeneratedTestIdea {
  name: string;
  variable: string;
  variantA: string;
  variantB: string;
  hypothesis: string;
}

export interface AbTestResult {
  ideas: GeneratedTestIdea[];
  sampleSizeNote: string;
}

function emailTypeLabel(t: EmailType): string {
  return t.replace(/-/g, " ");
}

function buildSampleSizeNote(listSize: number | null): string {
  const base =
    "Simplified rule of thumb (NOT a statistical power calculation): aim for at least " +
    `${RULE_OF_THUMB_PER_VARIANT.toLocaleString("en-US")} recipients per variant and run the test ` +
    `at least ${RULE_OF_THUMB_MIN_HOURS}–48 hours. Test one variable at a time.`;
  if (listSize === null) return base + " Add your list size for a per-variant estimate.";
  const perVariant = Math.floor(listSize / 2);
  const sized =
    ` Your list of ${listSize.toLocaleString("en-US")} gives about ` +
    `${perVariant.toLocaleString("en-US")} recipients per variant.`;
  if (perVariant < RULE_OF_THUMB_PER_VARIANT) {
    return (
      base + sized +
      " That is below the 1,000-per-variant rule of thumb, so results will be noisy — " +
      "run longer, or treat the winner as directional only."
    );
  }
  return base + sized + " That meets the rule-of-thumb floor.";
}

/**
 * Generate A/B test ideas from the fixed bank.
 * Throws on invalid input; the mountToolUI wrapper converts to { ok: false }.
 */
export function generateAbTestIdeas(
  emailType: string,
  testFocus: string,
  listSize: unknown,
): AbTestResult {
  if (!EMAIL_TYPES.includes(emailType as EmailType)) {
    throw new RangeError(`emailType must be one of: ${EMAIL_TYPES.join(", ")}.`);
  }
  if (!TEST_FOCI.includes(testFocus as TestFocus)) {
    throw new RangeError(`testFocus must be one of: ${TEST_FOCI.join(", ")}.`);
  }

  let size: number | null = null;
  if (listSize !== undefined && listSize !== null && listSize !== "") {
    const n = typeof listSize === "number" ? listSize : Number(listSize);
    if (!Number.isFinite(n) || n < 0) {
      throw new RangeError("listSize must be a finite number of 0 or more.");
    }
    size = Math.floor(n);
  }

  const label = emailTypeLabel(emailType as EmailType);
  const ideas: GeneratedTestIdea[] = TEST_IDEAS[testFocus as TestFocus].map((i) => ({
    name: i.name,
    variable: i.variable,
    variantA: i.variantA,
    variantB: i.variantB,
    hypothesis: i.hypothesisTemplate.replaceAll("{emailType}", label),
  }));

  return { ideas, sampleSizeNote: buildSampleSizeNote(size) };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/**
 * mountToolUI contract: runTool(values) -> { ok, values?, error? }.
 * values in:  { emailType, testFocus, listSize? }
 * values out: { testIdeas, sampleSizeNote }
 * testIdeas is a table { columns, rows }; sampleSizeNote is plain text.
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  const { emailType, testFocus, listSize } = values;
  if (typeof emailType !== "string" || !EMAIL_TYPES.includes(emailType as EmailType)) {
    return {
      ok: false,
      error: `Please choose an email type: ${EMAIL_TYPES.join(", ")}.`,
    };
  }
  if (typeof testFocus !== "string" || !TEST_FOCI.includes(testFocus as TestFocus)) {
    return {
      ok: false,
      error: `Please choose what to test: ${TEST_FOCI.join(", ")}.`,
    };
  }
  if (
    listSize !== undefined &&
    listSize !== null &&
    listSize !== "" &&
    (typeof listSize !== "number" || !Number.isFinite(listSize) || listSize < 0)
  ) {
    return { ok: false, error: "List size must be a number of 0 or more." };
  }

  let result: AbTestResult;
  try {
    result = generateAbTestIdeas(emailType, testFocus, listSize);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not generate test ideas.",
    };
  }

  return {
    ok: true,
    values: {
      testIdeas: {
        columns: ["Test name", "Variable", "Variant A", "Variant B", "Hypothesis"],
        rows: result.ideas.map((i) => [
          i.name,
          i.variable,
          i.variantA,
          i.variantB,
          i.hypothesis,
        ]),
      },
      sampleSizeNote: result.sampleSizeNote,
    },
  };
}
