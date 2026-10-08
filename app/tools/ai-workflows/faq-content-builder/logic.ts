/**
 * FAQ Content Builder (tool-315) — pure logic, zero imports,
 * zero network, zero DOM.
 *
 * HONESTY: this is a MARKUP FORMATTER, not a writer. It formats the user's
 * OWN questions into FAQ markup: an HTML block, a Markdown block, and a
 * ready-to-paste FAQPage JSON-LD snippet. It does NOT write answers and
 * performs no AI Q&A. Blank answers become clearly-labeled fill-in slots
 * so placeholder text is never published as real content by accident.
 *
 * Builder contract: runTool({ items }) -> { ok, values, error }.
 * `values.lines` is a string[] (the JSON-LD snippet, one line per entry),
 * `values.html` is the FAQ HTML block, `values.markdown` is the FAQ
 * Markdown block. Output ids match meta.ts outputs
 * ('lines', 'html', 'markdown').
 *
 * Item shape (one repeatable row in the UI):
 *   - question (required)
 *   - answer (optional; write your own — the tool never fills it in)
 *
 * Edge cases from the spec:
 *   - at least 2 questions are required
 *   - questions are capped at 20
 */

export interface FaqItem {
  question?: string;
  answer?: string;
}

export interface FaqValues {
  /** FAQPage JSON-LD snippet, one line per entry. */
  lines: string[];
  /** FAQ HTML block. */
  html: string;
  /** FAQ Markdown block. */
  markdown: string;
}

export interface FaqResult {
  ok: boolean;
  values?: FaqValues;
  error?: string;
}

/** Spec edge cases: min 2 questions, max 20. */
export const MIN_QUESTIONS = 2;
export const MAX_QUESTIONS = 20;

export const ANSWER_PLACEHOLDER = "[Your answer goes here — write it yourself before publishing]";

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * Format the user's questions into FAQ markup. Questions are kept in the
 * user's order; blank answers become labeled fill-in slots.
 */
export function runTool(args: { items: Record<string, unknown>[] }): FaqResult {
  const items = args?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Add at least 2 questions to build the FAQ." };
  }
  if (items.length < MIN_QUESTIONS) {
    return {
      ok: false,
      error: `Add at least ${MIN_QUESTIONS} questions to build the FAQ (you have ${items.length}).`,
    };
  }
  if (items.length > MAX_QUESTIONS) {
    return {
      ok: false,
      error: `Too many questions: the builder accepts at most ${MAX_QUESTIONS} questions.`,
    };
  }

  const entries: FaqEntry[] = [];
  for (let i = 0; i < items.length; i++) {
    const row = items[i];
    const n = i + 1;
    if (typeof row !== "object" || row === null) {
      return { ok: false, error: `Item ${n}: each row must be a set of fields.` };
    }
    const item = row as FaqItem;
    const question = clean(item.question);
    if (!question) {
      return { ok: false, error: `Item ${n}: Question is required.` };
    }
    const answer = clean(item.answer);
    entries.push({ question, answer: answer || ANSWER_PLACEHOLDER });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: { "@type": "Answer", text: e.answer },
    })),
  };
  const jsonText = JSON.stringify(jsonLd, null, 2);
  const lines = jsonText.split("\n");

  const html = entries
    .map(
      (e) =>
        `<div class="faq">\n  <h3>${escapeHtml(e.question)}</h3>\n  <p>${escapeHtml(e.answer)}</p>\n</div>`,
    )
    .join("\n");

  const markdown = entries.map((e) => `### ${e.question}\n\n${e.answer}`).join("\n\n");

  return { ok: true, values: { lines, html, markdown } };
}
