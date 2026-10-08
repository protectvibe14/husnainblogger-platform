/**
 * Prompt Health Debugger — pure logic (tool-535), zero imports, zero
 * network, zero DOM.
 *
 * HONESTY CONTRACT: a transparent, fixed rubric — every check, its trigger
 * and its score deduction is documented in CHECKS. Nothing is AI-judged;
 * the score is arithmetic over keyword/string rules, and every issue ships
 * with a concrete fix suggestion.
 */

export type Severity = "error" | "warning" | "info";

export interface HealthIssue {
  /** Stable check id, e.g. "vague-words". */
  check: string;
  severity: Severity;
  /** What was found. */
  message: string;
  /** Concrete fix. */
  suggestion: string;
  /** Points deducted. */
  deduction: number;
}

export interface HealthResult {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  issues: HealthIssue[];
  checksRun: number;
  summary: string;
}

/**
 * The public rubric. Weights are fixed and documented — the score is
 * 100 minus the sum of deductions, floored at 0.
 */
export const RUBRIC: { check: string; deduction: string; trigger: string }[] = [
  { check: "length", deduction: "-20 / -10 / -5", trigger: "<15 chars: -20 · >800: -10 · 15–40: -5" },
  { check: "vague-words", deduction: "-5 each (max -15)", trigger: "each vague word from the fixed list" },
  { check: "conflicting-terms", deduction: "-8 each", trigger: "contradictory pairs both present" },
  { check: "missing-subject", deduction: "-15", trigger: "fewer than 8 words and no comma detail" },
  { check: "missing-style", deduction: "-10", trigger: "no style keyword from the fixed list" },
  { check: "missing-lighting", deduction: "-5", trigger: "no lighting keyword from the fixed list" },
  { check: "param-typos", deduction: "-5 each", trigger: "known Midjourney parameter typos" },
  { check: "comma-stuffing", deduction: "-8 / -12", trigger: ">12 commas: -8 · >20: -12" },
];

/** Fixed vague-word list (case-insensitive whole-word match). */
export const VAGUE_WORDS = [
  "beautiful",
  "nice",
  "good",
  "amazing",
  "cool",
  "pretty",
  "awesome",
  "stunning",
  "gorgeous",
  "lovely",
  "perfect",
  "fantastic",
  "incredible",
  "great",
  "wonderful",
  "breathtaking",
  "aesthetic",
];

/** Fixed contradictory pairs. */
export const CONFLICTING_PAIRS: [string, string][] = [
  ["dark", "bright"],
  ["colorful", "monochrome"],
  ["colorful", "black and white"],
  ["daylight", "night"],
  ["sunny", "rainy"],
  ["minimalist", "cluttered"],
  ["realistic", "cartoon"],
  ["sharp", "blurry"],
  ["warm", "cold"],
  ["indoor", "outdoor"],
];

/** Fixed style keywords — presence means "style specified". */
export const STYLE_KEYWORDS = [
  "photorealistic",
  "photograph",
  "oil painting",
  "digital art",
  "3d render",
  "anime",
  "cinematic",
  "watercolor",
  "cyberpunk",
  "illustration",
  "portrait photography",
  "pixel art",
  "pencil sketch",
  "vaporwave",
  "steampunk",
  "art deco",
  "ukiyo-e",
  "low poly",
  "hyperrealistic",
  "surreal",
];

/** Fixed lighting keywords — presence means "lighting specified". */
export const LIGHTING_KEYWORDS = [
  "soft light",
  "dramatic lighting",
  "golden hour",
  "studio lighting",
  "natural light",
  "rim light",
  "neon",
  "backlit",
  "moonlight",
  "candlelight",
  "volumetric",
  "chiaroscuro",
  "sunset light",
  "harsh light",
  "diffused light",
];

/** Known Midjourney parameter typos -> correction. */
export const PARAM_TYPOS: Record<string, string> = {
  "--aspec": "--ar",
  "--aratio": "--ar",
  "--vers": "--v",
  "--ver": "--v",
  "--styel": "--style",
  "--stylee": "--style",
  "--chao": "--chaos",
  "--wird": "--weird",
  "--weid": "--weird",
  "--qualty": "--q",
  "--noo": "--no",
  "--seedd": "--seed",
  "--stylise": "--stylize",
  "--tilee": "--tile",
};

export const MAX_PROMPT_CHARS = 2000;

function hasWord(haystack: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(haystack);
}

function gradeFor(score: number): HealthResult["grade"] {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

/**
 * Run the full rubric over a prompt. Deterministic: same prompt -> same result.
 */
export function debugPrompt(prompt: string): HealthResult {
  const issues: HealthIssue[] = [];
  const push = (
    check: string,
    severity: Severity,
    message: string,
    suggestion: string,
    deduction: number,
  ): void => {
    issues.push({ check, severity, message, suggestion, deduction });
  };

  const trimmed = prompt.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const commas = (trimmed.match(/,/g) ?? []).length;

  // 1. Length
  if (trimmed.length < 15) {
    push(
      "length",
      "error",
      `Prompt is only ${trimmed.length} characters — too short to guide a model.`,
      "Describe the subject, setting, style and lighting in at least one full sentence.",
      20,
    );
  } else if (trimmed.length <= 40) {
    push(
      "length",
      "warning",
      "Prompt is quite short — likely under-specified.",
      "Add the subject's key details, the scene setting, and a style keyword.",
      5,
    );
  }
  if (trimmed.length > 800) {
    push(
      "length",
      "warning",
      `Prompt is ${trimmed.length} characters — very long prompts get truncated or diluted.`,
      "Keep the essential subject + style + lighting; move the rest to a negative prompt or reference image.",
      10,
    );
  }

  // 2. Vague words
  const foundVague = VAGUE_WORDS.filter((w) => hasWord(trimmed, w));
  if (foundVague.length > 0) {
    const deduction = Math.min(15, foundVague.length * 5);
    push(
      "vague-words",
      "warning",
      `Vague word${foundVague.length > 1 ? "s" : ""} found: ${foundVague.join(", ")} — models cannot picture these.`,
      "Replace each with something concrete: instead of \"beautiful\" say what makes it so (symmetrical, glowing, intricate).",
      deduction,
    );
  }

  // 3. Conflicting terms
  for (const [a, b] of CONFLICTING_PAIRS) {
    if (hasWord(trimmed, a) && hasWord(trimmed, b)) {
      push(
        "conflicting-terms",
        "warning",
        `Conflicting terms: "${a}" and "${b}" both appear.`,
        `Pick one direction — decide whether the image should read as "${a}" or "${b}" and delete the other.`,
        8,
      );
    }
  }

  // 4. Missing subject/detail
  if (words.length < 8 && commas < 1) {
    push(
      "missing-subject",
      "error",
      "No clear subject detail — the prompt is too thin to anchor an image.",
      "Name the subject and give it 2–3 concrete attributes (what it is, what it is doing, where it is).",
      15,
    );
  }

  // 5. Missing style
  if (!STYLE_KEYWORDS.some((k) => hasWord(trimmed, k))) {
    push(
      "missing-style",
      "warning",
      "No style keyword detected (e.g. photorealistic, oil painting, anime, cinematic).",
      "Add one style keyword so the model does not pick a random look.",
      10,
    );
  }

  // 6. Missing lighting
  if (!LIGHTING_KEYWORDS.some((k) => hasWord(trimmed, k))) {
    push(
      "missing-lighting",
      "warning",
      "No lighting keyword detected (e.g. soft light, golden hour, studio lighting).",
      "Add one lighting phrase — lighting changes the mood more than almost any other word.",
      5,
    );
  }

  // 7. Parameter typos
  const lower = ` ${trimmed.toLowerCase()} `;
  for (const [typo, fix] of Object.entries(PARAM_TYPOS)) {
    if (lower.includes(` ${typo} `) || lower.includes(` ${typo}\t`)) {
      push(
        "param-typos",
        "error",
        `Likely parameter typo: "${typo}".`,
        `Change it to "${fix}" — unknown flags are silently ignored by Midjourney.`,
        5,
      );
    }
  }
  if (/[—–]\s*ar\b/i.test(trimmed)) {
    push(
      "param-typos",
      "error",
      "Em/en dash used instead of double hyphen before a parameter.",
      'Parameters need two ASCII hyphens, e.g. "--ar 16:9" — word processors often "fix" them.',
      5,
    );
  }

  // 8. Comma stuffing
  if (commas > 20) {
    push(
      "comma-stuffing",
      "warning",
      `${commas} commas — tag-stuffed prompts dilute what matters.`,
      "Keep the 5–8 most important tags; merge the rest into short phrases.",
      12,
    );
  } else if (commas > 12) {
    push(
      "comma-stuffing",
      "warning",
      `${commas} commas — approaching tag-stuffing territory.`,
      "Trim to the tags that actually change the image.",
      8,
    );
  }

  const score = Math.max(
    0,
    100 - issues.reduce((sum, i) => sum + i.deduction, 0),
  );
  const grade = gradeFor(score);
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const summary =
    issues.length === 0
      ? "Clean prompt — subject, style and lighting are specified with no typos or conflicts."
      : `${issues.length} issue${issues.length > 1 ? "s" : ""} found (${errors} error${errors === 1 ? "" : "s"}, ${warnings} warning${warnings === 1 ? "" : "s"}).`;

  return { score, grade, issues, checksRun: RUBRIC.length, summary };
}

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.promptText: string, required, 1..MAX_PROMPT_CHARS chars.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const raw = values["promptText"];
  if (raw === undefined || raw === null || raw === "") {
    return { ok: false, error: "Please paste the image prompt you want to debug." };
  }
  if (typeof raw !== "string") {
    return { ok: false, error: "Prompt must be text." };
  }
  const prompt = raw.trim();
  if (prompt.length === 0) {
    return { ok: false, error: "Please paste the image prompt you want to debug." };
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return {
      ok: false,
      error: `Prompt must be ${MAX_PROMPT_CHARS} characters or fewer.`,
    };
  }

  const result = debugPrompt(prompt);
  return {
    ok: true,
    values: {
      score: result.score,
      grade: result.grade,
      summary: result.summary,
      issues: result.issues,
      issueCount: result.issues.length,
      checksRun: result.checksRun,
      rubric: RUBRIC,
    },
  };
}
