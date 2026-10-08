/**
 * System Prompt Builder — pure logic (tool-528), zero imports, zero network,
 * zero DOM.
 *
 * HONESTY CONTRACT: this assembles PROMPT TEXT from a fixed template. It
 * does NOT call any AI model and no model is involved in the output — you
 * paste the result into the AI tool of your choice. Bullet lists come from
 * your own words, one item per line.
 *
 * Fixed template structure (documented):
 *  1. "You are {role}." line
 *  2. Audience line
 *  3. Tone line (from TONES bank)
 *  4. "Do:" bullet list from your do-list
 *  5. "Do not:" bullet list from your don't-list
 *  6. "Constraints:" bullet list from your constraints
 */

export const TONES: Record<string, string> = {
  professional: "Use a professional, polished tone.",
  friendly: "Use a friendly, warm tone.",
  casual: "Use a casual, conversational tone.",
  formal: "Use a formal, precise tone.",
  playful: "Use a playful, lighthearted tone.",
  direct: "Use a direct, no-fluff tone.",
  empathetic: "Use an empathetic, supportive tone.",
  authoritative: "Use an authoritative, expert tone.",
};

export const MAX_FIELD_LENGTH = 500;

export interface SystemPromptResult {
  role: string;
  audience: string;
  tone: string;
  systemPrompt: string;
}

export function cleanField(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Split a textarea into bullet items (one per non-empty line). */
export function splitBullets(raw: string): string[] {
  return raw
    .replace(/<[^>]*>/g, "")
    .split("\n")
    .map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter((l) => l.length > 0);
}

export function validateTone(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const key = raw.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(TONES, key) ? key : null;
}

export function buildSystemPrompt(
  role: string,
  audience: string,
  toneKey: string,
  dos: string[],
  donts: string[],
  constraints: string[],
): SystemPromptResult {
  const lines: string[] = [
    `You are ${role}.`,
    `Your audience is ${audience}.`,
    TONES[toneKey],
  ];
  if (dos.length > 0) {
    lines.push("", "Do:", ...dos.map((d) => `- ${d}`));
  }
  if (donts.length > 0) {
    lines.push("", "Do not:", ...donts.map((d) => `- ${d}`));
  }
  if (constraints.length > 0) {
    lines.push("", "Constraints:", ...constraints.map((c) => `- ${c}`));
  }
  return {
    role,
    audience,
    tone: toneKey,
    systemPrompt: lines.join("\n"),
  };
}

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.role / values.audience: strings, required, 2-500 chars.
 * values.tone: one of TONES keys. values.doList / dontList / constraints:
 * optional multiline text (at least one of the three required).
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawRole = values["role"];
  if (typeof rawRole !== "string" || cleanField(rawRole).length < 2) {
    return { ok: false, error: "Please enter the assistant role (2+ characters)." };
  }
  const rawAudience = values["audience"];
  if (typeof rawAudience !== "string" || cleanField(rawAudience).length < 2) {
    return { ok: false, error: "Please enter the audience (2+ characters)." };
  }
  const role = cleanField(rawRole);
  const audience = cleanField(rawAudience);
  if (role.length > MAX_FIELD_LENGTH || audience.length > MAX_FIELD_LENGTH) {
    return {
      ok: false,
      error: `Role and audience must each be ${MAX_FIELD_LENGTH} characters or fewer.`,
    };
  }

  const tone = validateTone(values["tone"]);
  if (!tone) {
    return {
      ok: false,
      error: `Tone must be one of: ${Object.keys(TONES).join(", ")}.`,
    };
  }

  const dos = typeof values["doList"] === "string" ? splitBullets(values["doList"]) : [];
  const donts = typeof values["dontList"] === "string" ? splitBullets(values["dontList"]) : [];
  const constraints =
    typeof values["constraints"] === "string" ? splitBullets(values["constraints"]) : [];

  if (dos.length + donts.length + constraints.length === 0) {
    return {
      ok: false,
      error: "Add at least one item to the Do, Do-not, or Constraints list.",
    };
  }

  const r = buildSystemPrompt(role, audience, tone, dos, donts, constraints);
  return {
    ok: true,
    values: {
      systemPrompt: r.systemPrompt,
      role: r.role,
      audience: r.audience,
      tone: r.tone,
      itemCount: dos.length + donts.length + constraints.length,
    },
  };
}
