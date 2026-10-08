/**
 * Sponsorship Negotiation Script Generator — tool-504 pure logic.
 * Zero imports. Zero network. Zero DOM. No Math.random. Deterministic:
 * identical inputs always produce the identical script pack.
 *
 * ENGINE (honest): fixed-template assembly — NOT AI, NOT legal advice,
 * NOT financial advice. The output is a pack of 3 fixed template
 * scripts (documented bank: 3 scripts), personalized only with the
 * user's brand name and ask amount:
 *   1. Counter-offer email (brand's offer is below your ask)
 *   2. Value-justification reply (anchor on deliverables and audience)
 *   3. Usage-rights & payment-terms follow-up
 * Every script ends with the same disclaimer line. Amounts are
 * formatted deterministically in USD (en-US grouping); when no amount
 * is given, an honest [your rate] placeholder is kept — the tool never
 * invents a rate for you.
 */

export interface NegotiationScriptInput {
  brandName: unknown;
  askAmount?: unknown;
}

export interface NegotiationScriptResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MAX_BRAND = 80;
const MAX_AMOUNT = 10_000_000;

const DISCLAIMER =
  "_Note: these are template scripts for guidance only — not legal or financial advice._";

function formatUsd(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return "$" + rounded.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function runTool(values: Record<string, unknown>): NegotiationScriptResult {
  const brandRaw = values["brandName"];
  if (typeof brandRaw !== "string" || brandRaw.trim().length === 0) {
    return { ok: false, error: "Enter the brand name to generate the negotiation scripts." };
  }
  const brandName = brandRaw.trim();
  if (brandName.length > MAX_BRAND) {
    return {
      ok: false,
      error: `Brand name must be ${MAX_BRAND} characters or fewer.`,
    };
  }

  let amountText = "[your rate]";
  const amountRaw = values["askAmount"];
  if (amountRaw !== undefined && amountRaw !== null && amountRaw !== "") {
    if (typeof amountRaw !== "number" || !Number.isFinite(amountRaw)) {
      return { ok: false, error: "Ask amount must be a number." };
    }
    if (amountRaw <= 0) {
      return { ok: false, error: "Ask amount must be greater than zero." };
    }
    if (amountRaw > MAX_AMOUNT) {
      return {
        ok: false,
        error: `Ask amount looks unrealistic — keep it under ${formatUsd(MAX_AMOUNT)}.`,
      };
    }
    amountText = formatUsd(amountRaw);
  }

  const scripts: { title: string; body: string[] }[] = [
    {
      title: "Script 1 — Counter-offer email",
      body: [
        `Subject: Re: collaboration with ${brandName}`,
        "",
        `Hi ${brandName} team,`,
        "",
        "Thanks for getting back to me — I'm excited about this collaboration.",
        `Based on the deliverables and usage you're asking for, my rate for this package is ${amountText}.`,
        "That covers the content, revisions we discussed, and the usage window.",
        "Happy to walk you through what's included so we can find a structure that works for both sides.",
        "",
        "Best,",
        "[Your Name]",
      ],
    },
    {
      title: "Script 2 — Value-justification reply",
      body: [
        `Hi ${brandName} team,`,
        "",
        "Totally understand budgets are real — here's what sits behind my rate:",
        "- The audience I bring: engaged followers in your exact buyer profile",
        "- The deliverables: [list them — e.g. 1 reel + 2 stories + 30-day usage]",
        "- The track record: [your last 1–2 results with real numbers]",
        `At ${amountText}, you're paying for [deliverable summary] — not just a post.`,
        "If the full package doesn't fit, I can also scope a smaller version. What matters most to you: reach, content volume, or usage rights?",
        "",
        "Best,",
        "[Your Name]",
      ],
    },
    {
      title: "Script 3 — Usage-rights & payment-terms follow-up",
      body: [
        `Hi ${brandName} team,`,
        "",
        `Before we lock in ${amountText}, two quick points so we're aligned:`,
        "1. Usage rights: my rate covers [e.g. 30 days organic + paid whitelisting for 90 days]. Extended or perpetual usage is priced separately.",
        "2. Payment terms: I work on 50% upfront and 50% on delivery, net-15 at the latest.",
        "If those terms work, I'll send the agreement and we can get started.",
        "",
        "Best,",
        "[Your Name]",
      ],
    },
  ];

  const lines: string[] = [`# Sponsorship Negotiation Scripts — ${brandName}`, ""];
  for (const script of scripts) {
    lines.push(`## ${script.title}`, "");
    lines.push(...script.body, "");
  }
  lines.push(DISCLAIMER);

  return { ok: true, values: { negotiationScript: lines.join("\n").trimEnd() } };
}
