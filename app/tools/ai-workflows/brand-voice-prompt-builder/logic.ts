/**
 * Brand Voice Prompt Builder — pure logic (zero imports, zero network, zero DOM).
 *
 * Assembles a system prompt FROM the user's inputs: comma-separated
 * adjectives, do-list, don't-list, and an optional voice sample. It does NOT
 * invent a brand voice for the user — every voice-specific word in the
 * output comes from the user's own adjectives, do/don't lines, or sample
 * text. Nothing is AI-generated.
 *
 * Fixed phrase bank (documented per the BATCH-1 honesty contract):
 * ~10 fixed sentence templates form the prompt's skeleton:
 *   - intro sentence ("You are a writing assistant that always writes...")
 *   - "BRAND VOICE" heading + voice sentence ("Write in a way that is X, Y, and Z.")
 *   - "DO" heading + bullet rendering of the user's do-list (empty list omitted)
 *   - "DON'T" heading + bullet rendering of the user's don't-list (empty list omitted)
 *   - "VOICE EXAMPLE" heading + quoted sample + "Match the rhythm..." sentence (sample only)
 *   - "RULES" heading + 2 fixed rule sentences
 * All adjectives/do/don't/sample content is user-supplied; the bank only
 * supplies the fixed connecting sentences.
 */

export const MIN_ADJECTIVES = 2;
export const MAX_ADJECTIVE_CHARS = 40;

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Split a comma-separated line into trimmed, non-empty entries. */
function splitList(v: unknown): string[] {
  const raw = clean(v);
  if (raw.length === 0) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function joinNatural(parts: string[]): string {
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

/**
 * Assemble the brand-voice system prompt from user inputs.
 * Exported for tests. Empty do/don't lists are omitted (spec edge case).
 */
export function assemblePrompt(
  adjectives: string[],
  doList: string[],
  dontList: string[],
  sampleText: string
): string {
  const lines: string[] = [
    "You are a writing assistant that always writes in the brand voice described below.",
    "",
    "BRAND VOICE",
    `Write in a way that is ${joinNatural(adjectives)}.`,
  ];

  if (doList.length > 0) {
    lines.push("", "DO");
    for (const item of doList) lines.push(`- ${item}`);
  }

  if (dontList.length > 0) {
    lines.push("", "DON'T");
    for (const item of dontList) lines.push(`- ${item}`);
  }

  if (sampleText.length > 0) {
    lines.push("", "VOICE EXAMPLE", `"${sampleText}"`);
    lines.push("Match the rhythm and word choice of the example above.");
  }

  lines.push(
    "",
    "RULES",
    "- Never break character: every response must sound like this brand.",
    "- If a request conflicts with the voice, keep the voice and decline politely."
  );

  return lines.join("\n");
}

/**
 * Tool logic slot (builder). BuilderTemplate calls runTool({ items }).
 * Each item: adjectives (comma-separated text, required), doList, dontList,
 * sampleText (all optional text). Returns values.prompts (list).
 */
export function runTool(args: { items: Record<string, unknown>[] }): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!args || typeof args !== "object" || !Array.isArray(args.items)) {
    return { ok: false, error: "Add at least one brand voice entry to build a prompt." };
  }
  if (args.items.length === 0) {
    return { ok: false, error: "Add at least one brand voice entry to build a prompt." };
  }

  const prompts: string[] = [];

  for (let i = 0; i < args.items.length; i++) {
    const item = args.items[i];
    const label = `Item ${i + 1}`;
    if (!item || typeof item !== "object") {
      return { ok: false, error: `${label}: not a valid entry.` };
    }

    const adjectives = splitList(item["adjectives"]);
    if (adjectives.length < MIN_ADJECTIVES) {
      return {
        ok: false,
        error: `${label}: add at least ${MIN_ADJECTIVES} adjectives, separated by commas.`,
      };
    }
    const tooLong = adjectives.find((a) => a.length > MAX_ADJECTIVE_CHARS);
    if (tooLong) {
      return {
        ok: false,
        error: `${label}: adjective "${tooLong.slice(0, 30)}" is too long (max ${MAX_ADJECTIVE_CHARS} chars).`,
      };
    }

    const doList = splitList(item["doList"]);
    const dontList = splitList(item["dontList"]);
    const sampleText = clean(item["sampleText"]);

    prompts.push(assemblePrompt(adjectives, doList, dontList, sampleText));
  }

  return { ok: true, values: { prompts } };
}
