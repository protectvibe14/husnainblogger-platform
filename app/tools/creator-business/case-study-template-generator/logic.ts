/**
 * Case Study Template Generator (tool-488) — pure engine.
 * Zero imports, zero network, zero DOM, zero randomness.
 *
 * HONESTY: this is TEMPLATE ASSEMBLY. The user supplies the client name,
 * industry, challenge, solution, results, and optional quote; the tool
 * drops them into a fixed sectioned document (Challenge / Solution /
 * Results). It writes nothing new: results are echoed back labeled as
 * user-provided and not independently verified. No AI, no research, no
 * external data.
 *
 * Fixed template: 6 sections (title, overview, challenge, solution,
 * results, optional client quote, about-this-case-study note).
 */

export interface CaseStudyResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export const MAX_FIELD_LENGTH = 5000;

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function requireNonEmpty(value: unknown, fieldLabel: string): string | { ok: false; error: string } {
  const text = clean(value);
  if (!text) {
    return { ok: false, error: `${fieldLabel} is required — describe it in your own words.` };
  }
  if (text.length > MAX_FIELD_LENGTH) {
    return {
      ok: false,
      error: `${fieldLabel} is too long (${text.length} characters). Keep it under ${MAX_FIELD_LENGTH} characters.`,
    };
  }
  return text;
}

function buildCaseStudy(fields: {
  clientName: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string;
  quote: string;
}): string {
  const { clientName, industry, challenge, solution, results, quote } = fields;
  const industryLine = industry ? ` (${industry})` : "";
  const sections: string[] = [];

  sections.push(`# Case Study: ${clientName}${industryLine}`);
  sections.push("");
  sections.push("## Overview");
  sections.push(
    `This case study documents work delivered for ${clientName}${industry ? `, a business in ${industry}` : ""}. ` +
      "The sections below come from information entered by the case study author into a fixed template.",
  );
  sections.push("");
  sections.push("## The Challenge");
  sections.push(challenge);
  sections.push("");
  sections.push("## The Solution");
  sections.push(solution);
  sections.push("");
  sections.push("## The Results");
  if (results) {
    sections.push(results);
    sections.push("");
    sections.push("*Results above are user-provided and were not independently verified.*");
  } else {
    sections.push("[Add the client's results here — e.g. traffic gained, revenue added, time saved.]");
    sections.push("");
    sections.push("*Results not provided for this case study.*");
  }
  if (quote) {
    sections.push("");
    sections.push("## Client Quote");
    sections.push(`> ${quote}`);
    sections.push(`> — ${clientName}`);
  }
  sections.push("");
  sections.push("## About This Case Study");
  sections.push(
    "This document was assembled from information you entered into a fixed template. " +
      "It is not an audit, a guarantee, or an independently verified claim. " +
      "Get the client's written permission before publishing their name, metrics, or quote.",
  );

  return sections.join("\n");
}

/**
 * Generator entry point. Inputs: clientName (required), industry
 * (optional), challenge (required), solution (required), results
 * (optional, echoed as user-provided), quote (optional).
 * Output ids: caseStudy.
 */
export function runTool(values: Record<string, unknown>): CaseStudyResult {
  const clientName = requireNonEmpty(values["clientName"], "Client name");
  if (typeof clientName !== "string") return clientName;
  const challenge = requireNonEmpty(values["challenge"], "Challenge");
  if (typeof challenge !== "string") return challenge;
  const solution = requireNonEmpty(values["solution"], "Solution");
  if (typeof solution !== "string") return solution;

  const industry = clean(values["industry"]);
  if (industry.length > MAX_FIELD_LENGTH) {
    return {
      ok: false,
      error: `Industry is too long (${industry.length} characters). Keep it under ${MAX_FIELD_LENGTH} characters.`,
    };
  }
  const results = clean(values["results"]);
  if (results.length > MAX_FIELD_LENGTH) {
    return {
      ok: false,
      error: `Results are too long (${results.length} characters). Keep them under ${MAX_FIELD_LENGTH} characters.`,
    };
  }
  const quote = clean(values["quote"]);
  if (quote.length > MAX_FIELD_LENGTH) {
    return {
      ok: false,
      error: `Quote is too long (${quote.length} characters). Keep it under ${MAX_FIELD_LENGTH} characters.`,
    };
  }

  return {
    ok: true,
    values: {
      caseStudy: buildCaseStudy({ clientName, industry, challenge, solution, results, quote }),
    },
  };
}
