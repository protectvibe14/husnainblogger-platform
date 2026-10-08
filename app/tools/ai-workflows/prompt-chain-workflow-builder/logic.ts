/**
 * Prompt Chain Workflow Builder (tool-332) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * HONESTY: this is a CHAIN ASSEMBLER, not an AI writer. It orders YOUR
 * steps, wires {variable} handoffs between them, and wraps each step in a
 * FIXED prompt template that you edit — no step prompt is written by AI.
 *
 * Builder contract: runTool({ items }) -> { ok, values, error }.
 * `values.chain` is the ordered chain (Markdown, copy-ready) and
 * `values.warnings` lists undefined/malformed variables (spec edge case:
 * "undefined variables listed in a warnings panel"). Output ids match
 * meta.ts outputs ('chain', 'warnings').
 *
 * Item shape (one repeatable row in the UI, in execution order):
 *   - chainGoal   (optional; fill on the first row — the chain's goal)
 *   - stepName    (required; e.g. "Outline", "Draft", "Edit")
 *   - stepPrompt  (optional; your prompt template for the step — may use
 *                  {variables}; when blank a fixed template is used)
 *
 * Variable rules:
 *   - `{goal}` is always defined (the chain's goal line).
 *   - Each step defines one output variable: {snake_case_step_name_output}.
 *   - Step 1 uses `{goal}`; step N uses step N-1's output variable.
 *   - Any other {variable} found in a step prompt that is NOT defined is
 *     reported in `warnings` — the chain never invents its meaning.
 *
 * Edge cases from the spec:
 *   - at least 2 steps are required
 *   - steps capped at 12
 *   - duplicate step names get disambiguated variable names
 */

export interface ChainStepItem {
  chainGoal?: string;
  stepName?: string;
  stepPrompt?: string;
}

export interface ChainValues {
  /** The ordered prompt chain (Markdown, copy-ready). */
  chain: string;
  /** Warnings about undefined or malformed variables (empty when clean). */
  warnings: string[];
}

export interface ChainResult {
  ok: boolean;
  values?: ChainValues;
  error?: string;
}

/** Spec: at least 2 steps; cap at 12. */
export const MIN_STEPS = 2;
export const MAX_STEPS = 12;

/** The chain's always-defined variable. */
export const GOAL_VARIABLE = "{goal}";

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** "Write outline" -> "write_outline". Non-latin chars become underscores. */
function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return slug || "step";
}

/**
 * Fixed step-prompt template used when the user leaves stepPrompt blank.
 * It is a generic scaffold — the user edits it, no AI writing involved.
 */
export function defaultStepTemplate(stepName: string): string {
  return (
    `Complete the step "${stepName}". Use the inputs listed above. ` +
    `Return only this step's result, so the next step can use it. ` +
    `(Edit this template with your own instructions.)`
  );
}

interface Step {
  name: string;
  outputVar: string;
  uses: string[];
  prompt: string;
}

/**
 * Order the user's steps and wire {variable} handoffs. Undefined
 * variables are reported as warnings, never silently resolved.
 */
export function runTool(args: { items: Record<string, unknown>[] }): ChainResult {
  const items = args?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Add at least two steps to build a prompt chain." };
  }
  if (items.length < MIN_STEPS) {
    return {
      ok: false,
      error: `A chain needs at least ${MIN_STEPS} steps — you added ${items.length}.`,
    };
  }
  if (items.length > MAX_STEPS) {
    return {
      ok: false,
      error: `Too many steps: the builder accepts at most ${MAX_STEPS} steps per chain.`,
    };
  }

  let goal = "";
  const rawSteps: Array<{ name: string; prompt: string }> = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i] as ChainStepItem;
    const n = i + 1;
    const stepName = clean(item.stepName);
    if (!stepName) {
      return { ok: false, error: `Item ${n}: step name is required.` };
    }
    if (!goal) {
      goal = clean(item.chainGoal);
    }
    rawSteps.push({ name: stepName, prompt: clean(item.stepPrompt) });
  }

  const goalLine = goal || "Untitled chain — fill in your goal above.";

  // Assign output variables, disambiguating duplicate step names.
  const usedSlugs: Record<string, number> = {};
  const outputVars: string[] = rawSteps.map((s) => {
    const base = slugify(s.name);
    const count = (usedSlugs[base] || 0) + 1;
    usedSlugs[base] = count;
    return count === 1 ? `{${base}_output}` : `{${base}_output_${count}}`;
  });

  const defined = new Set<string>(["goal", ...outputVars.map((v) => v.slice(1, -1))]);
  const warnings: string[] = [];

  const steps: Step[] = rawSteps.map((s, i) => {
    const prevVar = i === 0 ? GOAL_VARIABLE : outputVars[i - 1];
    const prompt = s.prompt || defaultStepTemplate(s.name);

    // Collect variables the user referenced inside this step's prompt.
    const tokens = prompt.match(/\{([^{}]+)\}/g) || [];
    const referenced: string[] = [];
    for (const token of tokens) {
      const name = token.slice(1, -1);
      if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)) {
        warnings.push(
          `Step ${i + 1} ("${s.name}"): "${token}" is not a valid variable name — use letters, numbers, and underscores, e.g. {topic}.`
        );
        continue;
      }
      if (!referenced.includes(name)) {
        referenced.push(name);
      }
      if (!defined.has(name)) {
        warnings.push(
          `Step ${i + 1} ("${s.name}"): variable {${name}} is not defined by this chain. Define it as a step output or include it in the goal line.`
        );
      }
    }

    const uses = [prevVar.slice(1, -1)];
    for (const r of referenced) {
      if (!uses.includes(r)) {
        uses.push(r);
      }
    }

    return {
      name: s.name,
      outputVar: outputVars[i],
      uses: uses.map((u) => `{${u}}`),
      prompt,
    };
  });

  const lines: string[] = [];
  lines.push("# Prompt Chain");
  lines.push("");
  lines.push(`Goal: ${goalLine}`);
  lines.push("");
  lines.push(
    `This chain has ${steps.length} steps. Each step's prompt is a template you edit — no step is AI-written.`
  );
  lines.push("");

  steps.forEach((s, i) => {
    lines.push(`## Step ${i + 1} — ${s.name}`);
    lines.push(`- Uses: ${s.uses.join(", ")}`);
    lines.push(`- Produces: ${s.outputVar}`);
    lines.push(`- Prompt template:`);
    lines.push(`  ${s.prompt}`);
    lines.push("");
  });

  if (warnings.length > 0) {
    lines.push("## Warnings");
    for (const w of warnings) {
      lines.push(`- ${w}`);
    }
    lines.push("");
  }

  return {
    ok: true,
    values: { chain: lines.join("\n").trimEnd(), warnings },
  };
}
