/**
 * Cross-Model Prompt Converter — pure logic (tool-534), zero imports, zero
 * network, zero DOM.
 *
 * HONESTY CONTRACT: best-effort SYNTAX mapping between image-model prompt
 * dialects. It strips or translates parameter syntax (--ar, --v, --no, ::)
 * with fixed rules and surfaces what it could not carry over. It is NOT a
 * semantic rewrite and it does not "understand" your prompt — always review
 * the converted prompt before generating.
 */

export type ModelId =
  | "midjourney"
  | "flux"
  | "sdxl"
  | "dalle3"
  | "ideogram";

export const MODEL_LABELS: Record<ModelId, string> = {
  midjourney: "Midjourney",
  flux: "Flux",
  sdxl: "SDXL",
  dalle3: "DALL-E 3",
  ideogram: "Ideogram",
};

/** UI select labels -> internal ids. */
export const MODEL_LABEL_TO_ID: Record<string, ModelId> = {
  Midjourney: "midjourney",
  Flux: "flux",
  SDXL: "sdxl",
  "DALL-E 3": "dalle3",
  Ideogram: "ideogram",
};

export interface DroppedParam {
  param: string;
  reason: string;
}

export interface ConvertResult {
  convertedPrompt: string;
  /** Parameters found in the source prompt. */
  extractedParams: string[];
  /** Params that could not be carried over, with reasons. */
  droppedParams: DroppedParam[];
  /** Suggested additions for the target model. */
  suggestions: string[];
}

/** Aspect keywords detected in plain prose -> MJ --ar suggestion. */
const ASPECT_HINTS: { match: RegExp; ar: string; label: string }[] = [
  { match: /\b16:9\b|wide|panoramic|landscape orientation/i, ar: "16:9", label: "wide / 16:9" },
  { match: /\b9:16\b|vertical|portrait orientation|tall|phone wallpaper/i, ar: "9:16", label: "vertical / 9:16" },
  { match: /\bsquare\b|\b1:1\b|profile picture|avatar/i, ar: "1:1", label: "square / 1:1" },
  { match: /\b4:3\b|classic/i, ar: "4:3", label: "4:3" },
  { match: /\b3:2\b|photograph/i, ar: "3:2", label: "3:2" },
];

/** Words that read like negative-prompt material when targeting Midjourney. */
const NEGATIVE_WORDS = [
  "blurry",
  "low quality",
  "watermark",
  "text",
  "deformed",
  "extra fingers",
  "bad anatomy",
];

/**
 * Split a prompt into prose and Midjourney-style --params.
 * Returns [prose, params[]] where each param is the full "--name value" token.
 */
export function splitMjParams(prompt: string): [string, string[]] {
  const params: string[] = [];
  const prose = prompt
    .replace(/--([a-zA-Z]+)(?:\s+(?!--)([^\s]+))?/g, (_m, name: string, value?: string) => {
      params.push(value ? `--${name} ${value}` : `--${name}`);
      return " ";
    })
    .replace(/\s+/g, " ")
    .trim();
  return [prose, params];
}

/** Translate one MJ param for a non-MJ target. Returns [proseAdd, dropReason|null]. */
function translateMjParam(param: string): [string, string | null] {
  const m = param.match(/^--([a-zA-Z]+)(?:\s+(.+))?$/);
  if (!m) return ["", `Unrecognized parameter "${param}" — dropped.`];
  const name = m[1].toLowerCase();
  const value = (m[2] ?? "").trim();

  switch (name) {
    case "ar":
      return value
        ? [`wide aspect ratio ${value}`, null]
        : ["", `"--ar" without a value — dropped.`];
    case "v":
      return ["", `--v ${value} selects a Midjourney model version — dropped (no equivalent).`];
    case "niji":
      return ["anime style", `--niji converted to the words "anime style" (approximate).`];
    case "style":
      return value.toLowerCase() === "raw"
        ? ["", `"--style raw" means less beautification — rephrase as "unstyled, plain photographic".`]
        : ["", `--style ${value} is Midjourney-specific — dropped.`];
    case "chaos":
    case "weird":
      return ["", `--${name} ${value} has no equivalent outside Midjourney — dropped.`];
    case "tile":
      return ["seamless tileable pattern", `"--tile" converted to the words "seamless tileable pattern".`];
    case "no":
      return ["", `"--no ${value}" is a negative prompt — paste it into the target's negative prompt field instead.`];
    case "q":
      return ["", `"--q" (quality) is deprecated/ignored even in Midjourney — dropped.`];
    case "stylize":
    case "s":
      return ["", `--stylize ${value} is Midjourney-specific — dropped.`];
    case "seed":
      return ["", `"--seed ${value}" is not portable across models — dropped.`];
    case "iw":
      return ["", `--iw ${value} weights an image prompt — dropped (no image attached here).`];
    default:
      return ["", `--${name} is not recognized — dropped.`];
  }
}

/** Suggest MJ --ar from prose aspect hints. */
function suggestAspectForMj(prose: string, suggestions: string[]): string {
  for (const hint of ASPECT_HINTS) {
    if (hint.match.test(prose)) {
      suggestions.push(
        `Detected ${hint.label} framing — consider appending "--ar ${hint.ar}".`,
      );
      return `--ar ${hint.ar}`;
    }
  }
  return "";
}

/**
 * Convert a prompt from one model dialect to another.
 * Pure rule-based string transforms; deterministic.
 */
export function convertPrompt(
  prompt: string,
  from: ModelId,
  to: ModelId,
): ConvertResult {
  const [prose, params] = splitMjParams(prompt);
  const droppedParams: DroppedParam[] = [];
  const suggestions: string[] = [];
  const proseAdds: string[] = [];

  if (from === "midjourney" && to !== "midjourney") {
    for (const p of params) {
      const [add, reason] = translateMjParam(p);
      if (add) proseAdds.push(add);
      if (reason) droppedParams.push({ param: p, reason });
    }
    const converted = [prose, ...proseAdds].filter(Boolean).join(", ");
    if (to === "flux") {
      suggestions.push(
        "Flux reads plain natural language — parameters were stripped; rewrite the prompt as a flowing description for best results.",
      );
    } else if (to === "dalle3") {
      suggestions.push(
        "DALL-E 3 accepts natural language only — all parameter syntax was removed.",
      );
    } else if (to === "sdxl") {
      suggestions.push(
        "SDXL likes comma-separated descriptive tags; negative material (--no) belongs in the negative prompt field.",
      );
    } else if (to === "ideogram") {
      suggestions.push(
        'Ideogram renders text well — keep any quoted words exactly as written (e.g. a sign saying "OPEN").',
      );
    }
    return {
      convertedPrompt: converted,
      extractedParams: params,
      droppedParams,
      suggestions,
    };
  }

  if (to === "midjourney") {
    const clean = prose.replace(/\s*::\s*\d+(\.\d+)?/g, "");
    const aspect = suggestAspectForMj(clean, suggestions);
    const foundNegative = NEGATIVE_WORDS.filter((w) =>
      new RegExp(`\\b${w.replace(/ /g, "\\s+")}\\b`, "i").test(clean),
    );
    if (foundNegative.length > 0) {
      suggestions.push(
        `These read like negative-prompt terms — consider moving them to "--no ${foundNegative.join(", ")}" and removing them from the main prompt.`,
      );
    }
    if (/\b(photorealistic|ultra detailed|8k|sharp focus)\b/i.test(clean)) {
      suggestions.push(
        'Quality tags like "8k" or "ultra detailed" are mostly ignored by Midjourney v6+ — they do no harm but add little.',
      );
    }
    const converted = aspect ? `${clean} ${aspect}` : clean;
    return {
      convertedPrompt: converted,
      extractedParams: params,
      droppedParams: params.map((p) => ({
        param: p,
        reason: `"${p}" was already plain prose or an unrecognized token — kept as-is.`,
      })),
      suggestions,
    };
  }

  // Non-MJ -> non-MJ: strip any stray MJ params, keep prose, add target notes.
  for (const p of params) {
    droppedParams.push({ param: p, reason: `"${p}" looks like Midjourney syntax — removed.` });
  }
  if (to === "dalle3") {
    suggestions.push("DALL-E 3 works best with plain descriptive sentences — no parameter syntax needed.");
  } else if (to === "flux") {
    suggestions.push("Flux prefers natural-language descriptions over tag lists.");
  } else if (to === "sdxl") {
    suggestions.push("For SDXL, move anything you want to avoid into the negative prompt field.");
  } else if (to === "ideogram") {
    suggestions.push("Quote any text that must appear in the image, e.g. a poster reading \"SALE\".");
  }
  return {
    convertedPrompt: prose,
    extractedParams: params,
    droppedParams,
    suggestions,
  };
}

export function resolveModelId(labelOrId: string): ModelId | null {
  if (labelOrId in MODEL_LABEL_TO_ID) return MODEL_LABEL_TO_ID[labelOrId];
  const ids: ModelId[] = ["midjourney", "flux", "sdxl", "dalle3", "ideogram"];
  return ids.includes(labelOrId as ModelId) ? (labelOrId as ModelId) : null;
}

export const HONESTY_NOTE =
  "Best-effort syntax mapping, not a semantic rewrite — review the converted prompt before generating.";

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.prompt: string, required, 1..2000 chars.
 * values.fromModel / values.toModel: select labels (or ids).
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const raw = values["prompt"];
  if (raw === undefined || raw === null || raw === "") {
    return { ok: false, error: "Please paste the prompt you want to convert." };
  }
  if (typeof raw !== "string") {
    return { ok: false, error: "Prompt must be text." };
  }
  const prompt = raw.replace(/\s+/g, " ").trim();
  if (prompt.length < 3) {
    return { ok: false, error: "Prompt is too short to convert." };
  }
  if (prompt.length > 2000) {
    return { ok: false, error: "Prompt must be 2,000 characters or fewer." };
  }

  const from =
    typeof values["fromModel"] === "string"
      ? resolveModelId(values["fromModel"])
      : null;
  const to =
    typeof values["toModel"] === "string"
      ? resolveModelId(values["toModel"])
      : null;
  if (!from || !to) {
    return { ok: false, error: "Please choose both the source and target model." };
  }
  if (from === to) {
    return {
      ok: false,
      error: "Source and target are the same — nothing to convert.",
    };
  }

  const result = convertPrompt(prompt, from, to);
  return {
    ok: true,
    values: {
      convertedPrompt: result.convertedPrompt,
      extractedParams: result.extractedParams,
      droppedParams: result.droppedParams,
      suggestions: result.suggestions,
      fromModel: MODEL_LABELS[from],
      toModel: MODEL_LABELS[to],
      honestyNote: HONESTY_NOTE,
    },
  };
}
