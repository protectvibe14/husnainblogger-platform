/**
 * Lead Magnet Checklist Builder — pure logic (tool-429).
 *
 * BUILDER: runTool({ items }) validates every item, then assembles a
 * checklist and a printable plain-text version. No AI — steps come from
 * the user's own entries, or from a FIXED bank of 12 suggested framework
 * steps when a step field is left blank.
 *
 * Bank sizes (documented for the honesty contract):
 * - SUGGESTED_STEPS: 12 generic lead-magnet build steps with one-line
 *   details. Placeholder: {magnetTopic}.
 *
 * Honesty notes:
 * - Suggested steps are general best-practice frameworks, not advice
 *   tailored to a specific topic or business.
 * - "done" state and persistence live in the UI (localStorage); this
 *   logic only builds the checklist content and printable text.
 *
 * Edge-case handling:
 * - Lengths measured in Unicode code points ([...s].length): emoji / CJK /
 *   RTL count as one character each.
 * - Over-long text inputs are TRUNCATED with a visible warning — never
 *   silently dropped.
 * - Output is plain text: user input is HTML-escaped so no markup renders.
 *
 * Builder shape: runTool({ items }) validates items first; the first
 * invalid item fails the whole run with "Item N: <reason>". Item 1 must
 * carry the lead magnet topic; later rows may leave it blank to reuse it.
 * Any row with a blank step is auto-filled from SUGGESTED_STEPS.
 */

export const MIN_ITEMS = 1;
export const MAX_ITEMS = 30;

/** Documented input length caps (Unicode code points). */
export const MAX_TOPIC_CHARS = 100;
export const MAX_STEP_CHARS = 140;
export const MAX_DETAIL_CHARS = 280;

export interface SuggestedStep {
  step: string;
  detail: string;
}

/**
 * 12 fixed suggested framework steps, used for any row whose step is left
 * blank. Placeholder: {magnetTopic}.
 */
export const SUGGESTED_STEPS: readonly SuggestedStep[] = [
  {
    step: "Name the one win the {magnetTopic} delivers",
    detail: "Write the outcome in one sentence a 12-year-old understands — this becomes your headline promise.",
  },
  {
    step: "Outline the {magnetTopic} in 5–7 bite-size parts",
    detail: "Each part is one page or one checklist item; cut anything that doesn't serve the win.",
  },
  {
    step: "Draft the content fast, edit later",
    detail: "Get a rough version down in one sitting; clarity beats polish at this stage.",
  },
  {
    step: "Add one proof element per claim",
    detail: "Screenshots, numbers, or short examples make the {magnetTopic} believable.",
  },
  {
    step: "Design for skimming",
    detail: "Headings, bold key lines, and whitespace — most readers scan before they read.",
  },
  {
    step: "Write the title and subtitle",
    detail: "Title = outcome + audience; subtitle = format + time to complete.",
  },
  {
    step: "Build the delivery email",
    detail: "First email delivers the {magnetTopic} link plus one quick-start tip.",
  },
  {
    step: "Create the opt-in form copy",
    detail: "Headline, 2-line benefit, button text — match the promise exactly.",
  },
  {
    step: "Set up the thank-you page",
    detail: "Confirm delivery, set expectations, and suggest one next step.",
  },
  {
    step: "Test the full signup flow",
    detail: "Opt in with a fresh email; check delivery, links, and mobile layout.",
  },
  {
    step: "Publish and link it everywhere relevant",
    detail: "Blog posts, bio links, and email signatures that match the topic.",
  },
  {
    step: "Track downloads and follow-ups",
    detail: "Watch download rate and first-email opens; improve the weakest step.",
  },
];

/** Table columns for the `checklist` output. */
export const CHECKLIST_COLUMNS: readonly string[] = ["#", "Step", "Detail"];

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

// ---------------------------------------------------------------------------
// Helpers (all local — logic.ts has zero imports by contract)
// ---------------------------------------------------------------------------

/** Length in Unicode code points (emoji / CJK / RTL count as one each). */
function codePoints(s: string): number {
  return [...s].length;
}

/** Escape HTML so user input stays plain text in the output. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Fill {token} placeholders from a map. */
function fill(template: string, map: Record<string, string>): string {
  return template.replace(/\{([a-zA-Z]+)\}/g, (m, key: string) =>
    Object.prototype.hasOwnProperty.call(map, key) ? map[key] : m,
  );
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

interface Cleaned {
  value: string;
  notice?: string;
}

/** Trim; reject empty; truncate overlong text with a notice. */
function cleanField(
  raw: string,
  label: string,
  maxChars: number,
  itemNo: number,
  notices: string[],
): Cleaned | { error: string } {
  if (raw === "") {
    return { error: `Item ${itemNo}: ${label} is required.` };
  }
  let value = raw;
  if (codePoints(raw) > maxChars) {
    value = [...raw].slice(0, maxChars).join("");
    notices.push(
      `Item ${itemNo}: ${label} was shortened from ${codePoints(raw)} to ${maxChars} characters.`,
    );
  }
  return { value };
}

// ---------------------------------------------------------------------------
// runTool
// ---------------------------------------------------------------------------

/**
 * Build a lead-magnet checklist from item rows.
 *
 * args.items: [{ magnetTopic, step?, detail? }]. Item 1 must carry a
 * non-empty magnetTopic. Rows with a blank step are auto-filled from
 * SUGGESTED_STEPS (in order, cycling).
 *
 * Outputs (values): checklist ({ columns, rows }) and printable (copy).
 */
export function runTool(args: { items: Record<string, unknown>[] }): RunToolResult {
  if (!args || typeof args !== "object" || !Array.isArray(args.items)) {
    return { ok: false, error: "No items to build." };
  }
  if (args.items.length < MIN_ITEMS) {
    return { ok: false, error: "Add at least one checklist row to build." };
  }
  if (args.items.length > MAX_ITEMS) {
    return {
      ok: false,
      error: `Too many rows — this builder supports up to ${MAX_ITEMS} checklist steps.`,
    };
  }

  const notices: string[] = [];

  // Topic comes from the first row that provides one; Item 1 must have it.
  const first = args.items[0];
  if (!first || typeof first !== "object") {
    return { ok: false, error: "Item 1: not a valid row." };
  }
  const firstTopic = clean((first as Record<string, unknown>).magnetTopic);
  if (firstTopic === "") {
    return {
      ok: false,
      error:
        "Item 1: Lead magnet topic is required — enter the topic of your lead magnet on the first row.",
    };
  }
  const topicRead = cleanField(firstTopic, "Lead magnet topic", MAX_TOPIC_CHARS, 1, notices);
  if ("error" in topicRead) return { ok: false, error: topicRead.error };

  interface BuiltItem {
    step: string;
    detail: string;
  }
  const built: BuiltItem[] = [];

  for (let i = 0; i < args.items.length; i++) {
    const itemNo = i + 1;
    const raw = args.items[i];
    if (!raw || typeof raw !== "object") {
      return { ok: false, error: `Item ${itemNo}: not a valid row.` };
    }
    const item = raw as Record<string, unknown>;

    // Later rows may reuse the topic; only Item 1 must provide it.
    if (itemNo > 1) {
      const t = clean(item.magnetTopic);
      if (t !== "") {
        const tr = cleanField(t, "Lead magnet topic", MAX_TOPIC_CHARS, itemNo, notices);
        if ("error" in tr) return { ok: false, error: tr.error };
        topicRead.value = tr.value;
      }
    }

    let stepRaw = clean(item.step);
    let detailRaw = clean(item.detail);

    if (stepRaw === "") {
      // Auto-suggest from the fixed framework bank (cycles if needed).
      const suggestion = SUGGESTED_STEPS[i % SUGGESTED_STEPS.length];
      stepRaw = fill(suggestion.step, { magnetTopic: topicRead.value });
      if (detailRaw === "") {
        detailRaw = fill(suggestion.detail, { magnetTopic: topicRead.value });
      }
      notices.push(`Item ${itemNo}: step was auto-suggested from the framework.`);
    }

    const stepRead = cleanField(stepRaw, "Step", MAX_STEP_CHARS, itemNo, notices);
    if ("error" in stepRead) return { ok: false, error: stepRead.error };
    let detail = "";
    if (detailRaw !== "") {
      const detailRead = cleanField(detailRaw, "Detail", MAX_DETAIL_CHARS, itemNo, notices);
      if ("error" in detailRead) return { ok: false, error: detailRead.error };
      detail = detailRead.value;
    }

    // Keep raw (unescaped) for printable; escape only for the table output.
    built.push({ step: stepRead.value, detail });
  }

  const rows: string[][] = built.map((b, i) => [
    String(i + 1),
    escapeHtml(b.step),
    escapeHtml(b.detail),
  ]);

  const printableLines: string[] = [
    `Lead Magnet Checklist: ${topicRead.value}`,
    `(${built.length} steps)`,
    "",
  ];
  built.forEach((b, i) => {
    printableLines.push(`${i + 1}. ${b.step}`);
    if (b.detail !== "") {
      printableLines.push(`   ${b.detail}`);
    }
  });
  if (notices.length > 0) {
    printableLines.push("");
    printableLines.push(`Notes: ${notices.join(" ")}`);
    rows.push(["", `Note: ${notices.join(" ")}`, ""]);
  }

  return {
    ok: true,
    values: {
      checklist: { columns: [...CHECKLIST_COLUMNS], rows },
      printable: printableLines.join("\n"),
    },
  };
}
