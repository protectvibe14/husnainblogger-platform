/**
 * Proposal Template Generator (tool-489) — pure engine.
 * Zero imports, zero network, zero DOM, zero randomness.
 *
 * HONESTY: this is TEMPLATE ASSEMBLY. The user supplies client name,
 * project title, approach, deliverables, timeline, investment, and terms;
 * the tool drops them into a fixed sectioned proposal document. It invents
 * no pricing, no scope, and no legal terms — every section the user leaves
 * empty gets a visible [placeholder] to fill in before sending. No AI, no
 * external data.
 *
 * Fixed template: 7 blocks (header, overview, deliverables, timeline,
 * investment, terms, next steps) plus a non-contract disclaimer.
 *
 * Distinct from tool-069 (Project Quote Generator): a quote is a price
 * document; a proposal is a scope-and-pitch document.
 */

export interface ProposalResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export const MAX_FIELD_LENGTH = 5000;
export const MAX_DELIVERABLES = 50;

/** Deterministic number formatting: integer grouping with commas, max 2 decimals. */
export function formatInvestment(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const [intPart, decPart] = String(rounded).split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart ? `${grouped}.${decPart}` : grouped;
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function requireNonEmpty(value: unknown, fieldLabel: string): string | { ok: false; error: string } {
  const text = clean(value);
  if (!text) {
    return { ok: false, error: `${fieldLabel} is required.` };
  }
  if (text.length > MAX_FIELD_LENGTH) {
    return {
      ok: false,
      error: `${fieldLabel} is too long (${text.length} characters). Keep it under ${MAX_FIELD_LENGTH} characters.`,
    };
  }
  return text;
}

function parseDeliverables(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter((line) => line.length > 0);
}

function buildProposal(fields: {
  clientName: string;
  projectTitle: string;
  approach: string;
  deliverables: string[];
  timeline: string;
  investment: number;
  termsSummary: string;
}): string {
  const { clientName, projectTitle, approach, deliverables, timeline, investment, termsSummary } = fields;
  const lines: string[] = [];

  lines.push(`# Project Proposal: ${projectTitle}`);
  lines.push("");
  lines.push(`**Prepared for:** ${clientName}`);
  lines.push("**Prepared by:** [Your name / business name]");
  lines.push("**Date:** [Add the date before sending]");
  lines.push("");
  lines.push("## 1. Project Overview");
  lines.push(approach || "[Describe your approach and why you are the right fit for this project.]");
  lines.push("");
  lines.push("## 2. Deliverables");
  if (deliverables.length > 0) {
    for (const item of deliverables) lines.push(`- ${item}`);
  } else {
    lines.push("[List each deliverable as its own bullet point.]");
  }
  lines.push("");
  lines.push("## 3. Timeline");
  lines.push(timeline || "[Add your timeline or milestones here.]");
  lines.push("");
  lines.push("## 4. Investment");
  lines.push(`**Total: ${formatInvestment(investment)} (your currency)**`);
  lines.push("");
  lines.push("*Add your currency and payment schedule (e.g. 50% deposit, 50% on delivery) before sending.*");
  lines.push("");
  lines.push("## 5. Terms");
  lines.push(termsSummary || "[Add payment terms, revision policy, and cancellation terms here.]");
  lines.push("");
  lines.push("## 6. Next Steps");
  lines.push("1. Review this proposal and reply with any questions.");
  lines.push("2. Once approved, I will send a written agreement covering these terms.");
  lines.push("3. A deposit of [X]% is due before work begins.");
  lines.push("");
  lines.push("---");
  lines.push(
    "*This proposal was assembled from a fixed template using information you entered. " +
      "It is not a contract and not legal advice — have a qualified professional review your agreements.*",
  );

  return lines.join("\n");
}

/**
 * Generator entry point. Inputs: clientName (required), projectTitle
 * (required), investment (required, number >= 0), approach (optional),
 * deliverables (optional, one per line), timeline (optional), termsSummary
 * (optional). Output ids: proposal.
 */
export function runTool(values: Record<string, unknown>): ProposalResult {
  const clientName = requireNonEmpty(values["clientName"], "Client name");
  if (typeof clientName !== "string") return clientName;
  const projectTitle = requireNonEmpty(values["projectTitle"], "Project title");
  if (typeof projectTitle !== "string") return projectTitle;

  const rawInvestment = values["investment"];
  const investment = typeof rawInvestment === "string" && rawInvestment.trim() !== ""
    ? Number(rawInvestment)
    : rawInvestment;
  if (typeof investment !== "number" || !Number.isFinite(investment)) {
    return { ok: false, error: "Investment must be a number (0 or more)." };
  }
  if (investment < 0) {
    return { ok: false, error: "Investment cannot be negative — enter 0 or more." };
  }
  if (investment > 1e12) {
    return { ok: false, error: "Investment looks unrealistically large — check the number and try again." };
  }

  const approach = clean(values["approach"]);
  if (approach.length > MAX_FIELD_LENGTH) {
    return {
      ok: false,
      error: `Approach is too long (${approach.length} characters). Keep it under ${MAX_FIELD_LENGTH} characters.`,
    };
  }
  const deliverables = parseDeliverables(values["deliverables"]);
  if (deliverables.length > MAX_DELIVERABLES) {
    return {
      ok: false,
      error: `Too many deliverables (${deliverables.length}). Keep the list to ${MAX_DELIVERABLES} items or fewer.`,
    };
  }
  const timeline = clean(values["timeline"]);
  if (timeline.length > MAX_FIELD_LENGTH) {
    return {
      ok: false,
      error: `Timeline is too long (${timeline.length} characters). Keep it under ${MAX_FIELD_LENGTH} characters.`,
    };
  }
  const termsSummary = clean(values["termsSummary"]);
  if (termsSummary.length > MAX_FIELD_LENGTH) {
    return {
      ok: false,
      error: `Terms summary is too long (${termsSummary.length} characters). Keep it under ${MAX_FIELD_LENGTH} characters.`,
    };
  }

  return {
    ok: true,
    values: {
      proposal: buildProposal({ clientName, projectTitle, approach, deliverables, timeline, investment, termsSummary }),
    },
  };
}
