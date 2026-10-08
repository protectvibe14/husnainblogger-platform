/**
 * Brand Deal Contract Generator — pure logic (tool-456).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Builds a structured contract
 *   OUTLINE (data only) — no document rendering.
 * - Every clause is a TEMPLATE with the user's values interpolated. This is
 *   NOT legal advice and creates no attorney-client relationship; the
 *   disclaimer is part of every result and must be shown by the UI.
 * - No legal citations, statutes, or case law are referenced anywhere — the
 *   text is plain-language template wording only.
 * - Deliverable types, usage-rights options, and payment terms come from
 *   fixed lists (enums). Unknown values are rejected.
 * - Dates are ISO YYYY-MM-DD, interpreted as UTC calendar dates.
 * - Money values round to the nearest cent (half-up); currency defaults to
 *   USD (3-letter code, no FX conversion).
 * - A fee of 0 is treated as a gifted / product-only collaboration and is
 *   flagged in warnings[].
 */

export const DELIVERABLE_TYPES = [
  "Instagram Reel",
  "TikTok Video",
  "YouTube Video",
  "YouTube Short",
  "Instagram Post",
  "Instagram Story",
  "X Post",
  "Blog Post",
  "Newsletter Feature",
  "Usage Rights Extension",
  "Other",
] as const;
export type DeliverableType = (typeof DELIVERABLE_TYPES)[number];

export const USAGE_RIGHTS_OPTIONS = [
  "Organic social only (30 days)",
  "Organic social only (perpetual)",
  "Paid whitelisting (30 days)",
  "Paid whitelisting (90 days)",
  "Full buyout (perpetual)",
] as const;
export type UsageRightsOption = (typeof USAGE_RIGHTS_OPTIONS)[number];

export const PAYMENT_TERMS_OPTIONS = [
  "50% upfront / 50% on delivery",
  "100% on delivery",
  "Net 30",
  "Net 15",
  "100% upfront",
] as const;
export type PaymentTermsOption = (typeof PAYMENT_TERMS_OPTIONS)[number];

export const DEFAULT_REVISION_ROUNDS = 2;
export const DEFAULT_CURRENCY = "USD";

/**
 * Template only — not legal advice. Consult a licensed attorney before
 * signing. Included in every generated outline.
 */
export const CONTRACT_DISCLAIMER =
  "Template only — not legal advice. Consult a licensed attorney before signing.";

/**
 * One deliverable in the deal.
 */
export interface ContractDeliverableInput {
  /** Must be one of DELIVERABLE_TYPES. */
  type: DeliverableType;
  /** Whole units. Integer >= 1. */
  quantity: number;
  /** Required when type is "Other"; optional detail otherwise. */
  notes?: string;
}

/**
 * Exclusivity clause input.
 */
export interface ExclusivityInput {
  /** Competing product category (e.g. "skincare"). Non-empty. */
  category: string;
  /** Exclusivity length in days. Integer > 0. */
  days: number;
}

/**
 * Input for generating the contract outline.
 */
export interface ContractInput {
  /** Creator's full name / channel name. Non-empty. */
  creatorName: string;
  /** Brand's legal or trading name. Non-empty. */
  brandName: string;
  /** At least one deliverable. */
  deliverables: ContractDeliverableInput[];
  /** Total compensation. >= 0 (0 = gifted / product-only). */
  feeAmount: number;
  /** 3-letter currency code. Defaults to "USD". */
  currency?: string;
  /** One of USAGE_RIGHTS_OPTIONS. */
  usageRights: UsageRightsOption;
  /** Delivery window start, ISO YYYY-MM-DD. */
  deliveryStartDate: string;
  /** Delivery window end, ISO YYYY-MM-DD, >= start. */
  deliveryEndDate: string;
  /** One of PAYMENT_TERMS_OPTIONS. */
  paymentTerms: PaymentTermsOption;
  /** Optional exclusivity clause. */
  exclusivity?: ExclusivityInput;
  /** Included revision rounds. Integer >= 0. Defaults to 2. */
  revisionRounds?: number;
}

/**
 * One section of the outline.
 */
export interface ContractSection {
  heading: string;
  clauses: string[];
}

/**
 * The generated contract outline (data only).
 */
export interface ContractOutline {
  title: string;
  parties: { creator: string; brand: string };
  /** One-line plain-English summary of the deal. */
  effectiveSummary: string;
  sections: ContractSection[];
  disclaimer: string;
  warnings: string[];
  /** Assumption/template notes surfaced to the UI. */
  assumptions: string[];
}

/** Round to the nearest cent, half-up. */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function assertFiniteNumber(name: string, value: unknown): asserts value is number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(`${name} must be a number (got ${String(value)}).`);
  }
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be finite (got ${String(value)}).`);
  }
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function assertNonEmpty(name: string, value: unknown): string {
  const s = cleanString(value);
  if (s.length === 0) {
    throw new RangeError(`${name} must be a non-empty string.`);
  }
  return s;
}

/**
 * Validate an ISO YYYY-MM-DD date and return it normalized.
 * @throws {TypeError} when the value is not a string.
 * @throws {RangeError} when it is not a real calendar date.
 */
function assertValidIsoDate(name: string, value: unknown): string {
  const s = cleanString(value);
  if (typeof value !== "string" || s.length === 0) {
    throw new TypeError(`${name} must be an ISO date string (YYYY-MM-DD).`);
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) {
    throw new RangeError(`${name} must be YYYY-MM-DD (got "${s}").`);
  }
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== mo - 1 ||
    dt.getUTCDate() !== d
  ) {
    throw new RangeError(`${name} is not a real calendar date (got "${s}").`);
  }
  return `${m[1]}-${m[2]}-${m[3]}`;
}

function money(currency: string, amount: number): string {
  return `${currency} ${amount.toFixed(2)}`;
}

/**
 * Template clause text for each usage-rights option.
 */
function usageRightsClause(option: UsageRightsOption, brand: string): string {
  switch (option) {
    case "Organic social only (30 days)":
      return (
        `${brand} may repost the Deliverables on its owned organic social ` +
        `channels for 30 days from first publication. No paid amplification, ` +
        `whitelisting, or use in ads is permitted.`
      );
    case "Organic social only (perpetual)":
      return (
        `${brand} may repost the Deliverables on its owned organic social ` +
        `channels in perpetuity. No paid amplification, whitelisting, or use ` +
        `in ads is permitted.`
      );
    case "Paid whitelisting (30 days)":
      return (
        `${brand} may run the Deliverables as whitelisted (creator-licensed) ` +
        `paid advertisements for 30 days from first publication, after which ` +
        `all paid use must stop.`
      );
    case "Paid whitelisting (90 days)":
      return (
        `${brand} may run the Deliverables as whitelisted (creator-licensed) ` +
        `paid advertisements for 90 days from first publication, after which ` +
        `all paid use must stop.`
      );
    case "Full buyout (perpetual)":
      return (
        `${brand} receives perpetual, worldwide rights to use the Deliverables ` +
        `across all media, including paid advertising, in perpetuity.`
      );
  }
}

/**
 * Generate a brand-deal contract outline from user input.
 *
 * @param input - parties, deliverables, fee, usage rights, timeline, terms.
 * @returns Structured outline (template text) with disclaimer + assumptions.
 * @throws {TypeError} for wrong types (non-numeric fee, unknown enum values,
 *   non-object input).
 * @throws {RangeError} for empty names/dates, empty deliverables, bad
 *   quantities, negative fees, or end date before start date.
 */
export function generateContractOutline(input: ContractInput): ContractOutline {
  if (!input || typeof input !== "object") {
    throw new TypeError("Input must be an object.");
  }

  const warnings: string[] = [];

  const creatorName = assertNonEmpty("creatorName", input.creatorName);
  const brandName = assertNonEmpty("brandName", input.brandName);

  if (!Array.isArray(input.deliverables) || input.deliverables.length === 0) {
    throw new RangeError("deliverables must be a non-empty array.");
  }
  const deliverables = input.deliverables.map((d, i) => {
    if (!d || typeof d !== "object") {
      throw new TypeError(`deliverables[${i}] must be an object.`);
    }
    if (!DELIVERABLE_TYPES.includes(d.type)) {
      throw new TypeError(
        `deliverables[${i}].type must be one of: ${DELIVERABLE_TYPES.join(", ")}.`,
      );
    }
    const type = d.type;
    const quantity = d.quantity;
    assertFiniteNumber(`deliverables[${i}].quantity`, quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new RangeError(`deliverables[${i}].quantity must be an integer >= 1.`);
    }
    const notes = cleanString(d.notes);
    if (type === "Other" && notes.length === 0) {
      throw new RangeError(
        `deliverables[${i}].notes is required when type is "Other".`,
      );
    }
    return { type, quantity, notes };
  });

  const feeRaw = input.feeAmount;
  assertFiniteNumber("feeAmount", feeRaw);
  if (feeRaw < 0) {
    throw new RangeError("feeAmount must be >= 0.");
  }
  const feeAmount = roundToCents(feeRaw);

  const currency = cleanString(input.currency ?? DEFAULT_CURRENCY).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new TypeError('currency must be a 3-letter code (e.g. "USD").');
  }

  if (!USAGE_RIGHTS_OPTIONS.includes(input.usageRights)) {
    throw new TypeError(
      `usageRights must be one of: ${USAGE_RIGHTS_OPTIONS.join(" | ")}.`,
    );
  }
  if (!PAYMENT_TERMS_OPTIONS.includes(input.paymentTerms)) {
    throw new TypeError(
      `paymentTerms must be one of: ${PAYMENT_TERMS_OPTIONS.join(" | ")}.`,
    );
  }

  const startDate = assertValidIsoDate("deliveryStartDate", input.deliveryStartDate);
  const endDate = assertValidIsoDate("deliveryEndDate", input.deliveryEndDate);
  if (endDate < startDate) {
    throw new RangeError("deliveryEndDate must be on or after deliveryStartDate.");
  }

  const revisionRounds = input.revisionRounds ?? DEFAULT_REVISION_ROUNDS;
  assertFiniteNumber("revisionRounds", revisionRounds);
  if (!Number.isInteger(revisionRounds) || revisionRounds < 0) {
    throw new RangeError("revisionRounds must be an integer >= 0.");
  }

  let exclusivity: { category: string; days: number } | undefined;
  const exclInput = input.exclusivity;
  if (exclInput !== undefined) {
    if (!exclInput || typeof exclInput !== "object") {
      throw new TypeError("exclusivity must be an object.");
    }
    const category = assertNonEmpty("exclusivity.category", exclInput.category);
    const days = exclInput.days;
    assertFiniteNumber("exclusivity.days", days);
    if (!Number.isInteger(days) || days <= 0) {
      throw new RangeError("exclusivity.days must be an integer > 0.");
    }
    exclusivity = { category, days };
    if (days > 180) {
      warnings.push(
        `Exclusivity of ${days} days is long — have an attorney review before agreeing.`,
      );
    }
  }

  if (feeAmount === 0) {
    warnings.push(
      "Fee is 0: this outline assumes a gifted / product-only collaboration. Confirm what the creator receives.",
    );
  }

  const sections: ContractSection[] = [];

  sections.push({
    heading: "Parties",
    clauses: [
      `This Brand Deal Agreement outline is between "${creatorName}" (Creator) and "${brandName}" (Brand).`,
      "Replace the names above with full legal names and addresses in the final agreement.",
    ],
  });

  sections.push({
    heading: "Scope of Work",
    clauses: deliverables.map(
      (d) =>
        `Creator will produce and publish ${d.quantity} × ${d.type}` +
        (d.notes ? ` (${d.notes})` : "") +
        `.`,
    ),
  });

  const compensationClauses =
    feeAmount === 0
      ? [
          "This is a gifted / product-only collaboration: no cash compensation is due.",
          `Payment terms reference: ${input.paymentTerms} (applies to any agreed expenses).`,
        ]
      : [
          `Brand will pay Creator a total fee of ${money(currency, feeAmount)}.`,
          `Payment schedule: ${input.paymentTerms}.`,
        ];
  sections.push({ heading: "Compensation", clauses: compensationClauses });

  sections.push({
    heading: "Usage Rights",
    clauses: [usageRightsClause(input.usageRights, brandName)],
  });

  sections.push({
    heading: "Timeline",
    clauses: [
      `Delivery window: ${startDate} to ${endDate}.`,
      "Late delivery or late payment should have a written cure period in the final agreement.",
    ],
  });

  sections.push({
    heading: "Revisions",
    clauses: [
      revisionRounds === 0
        ? "No revision rounds are included; additional revisions are billed separately by mutual agreement."
        : `${revisionRounds} round${revisionRounds === 1 ? "" : "s"} of reasonable revisions included; additional revisions are billed separately by mutual agreement.`,
    ],
  });

  if (exclusivity) {
    sections.push({
      heading: "Exclusivity",
      clauses: [
        `Creator will not promote competing ${exclusivity.category} brands for ${exclusivity.days} days from the effective date.`,
      ],
    });
  }

  sections.push({
    heading: "Disclosure",
    clauses: [
      "Creator will clearly and conspicuously disclose the paid partnership in each Deliverable (e.g. #ad or platform branded-content tools), per applicable advertising disclosure rules.",
    ],
  });

  sections.push({
    heading: "Termination",
    clauses: [
      "Either party may terminate with 14 days' written notice; Creator is paid pro-rata for work already delivered and approved.",
    ],
  });

  const deliverableSummary = deliverables
    .map((d) => `${d.quantity}× ${d.type}`)
    .join(", ");
  const effectiveSummary =
    `Brand Deal Agreement outline between ${creatorName} and ${brandName}: ` +
    `${deliverableSummary}; ${money(currency, feeAmount)}; ` +
    `${input.usageRights}; delivery ${startDate} → ${endDate}.`;

  const assumptions: string[] = [
    "Every clause above is TEMPLATE wording with your values filled in — not legal advice and not a complete contract.",
    "Fill in legal names, addresses, governing law, and signatures in the final agreement.",
    "Advertising disclosure rules vary by country — confirm the local requirements.",
    "Usage-rights pricing usually scales with the rights granted; this outline does not price the rights.",
  ];

  return {
    title: `Brand Deal Agreement Outline — ${creatorName} × ${brandName}`,
    parties: { creator: creatorName, brand: brandName },
    effectiveSummary,
    sections,
    disclaimer: CONTRACT_DISCLAIMER,
    warnings,
    assumptions,
  };
}

// ---------------------------------------------------------------------------
// Tool-logic-slot adapter for tool-456.
// ---------------------------------------------------------------------------

function readFlatString(name: string, value: unknown): string {
  const s = cleanString(value);
  if (s.length === 0) {
    throw new RangeError(`${name} is required.`);
  }
  return s;
}

/**
 * Parse the flat "deliverables" input: either an array of
 * { type, quantity, notes? } objects (passed straight through to
 * generateContractOutline) or a multiline string, one deliverable per line:
 *
 *   2 x Instagram Reel | launch teaser
 *   TikTok Video
 *
 * Quantity is optional (defaults to 1); notes are optional after "|".
 * Types are matched case-insensitively against DELIVERABLE_TYPES.
 */
function parseFlatDeliverables(
  value: unknown,
): ContractDeliverableInput[] {
  const lines: unknown[] =
    typeof value === "string"
      ? value
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0)
      : Array.isArray(value)
        ? value
        : [];
  if (lines.length === 0) {
    throw new RangeError(
      "deliverables is required — list at least one deliverable (e.g. \"2 x Instagram Reel\").",
    );
  }

  return lines.map((entry, i) => {
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      // Object form: { type, quantity, notes? } — validated downstream.
      const obj = entry as Record<string, unknown>;
      return {
        type: obj.type as DeliverableType,
        quantity: obj.quantity as number,
        notes: cleanString(obj.notes),
      };
    }
    if (typeof entry !== "string") {
      throw new TypeError(`deliverables[${i}] must be a string or an object.`);
    }
    const m = /^(?:(\d+)\s*[x×]\s*)?(.+?)(?:\s*(?:\||—|–| - )\s*(.+))?$/.exec(entry);
    if (!m) {
      throw new RangeError(`deliverables[${i}] could not be understood (got "${entry}").`);
    }
    const quantity = m[1] === undefined ? 1 : Number(m[1]);
    const typeRaw = m[2].trim();
    const matched = DELIVERABLE_TYPES.find(
      (t) => t.toLowerCase() === typeRaw.toLowerCase(),
    );
    if (!matched) {
      throw new TypeError(
        `deliverables[${i}]: "${typeRaw}" is not a supported type. Choose from: ${DELIVERABLE_TYPES.join(", ")}.`,
      );
    }
    return {
      type: matched,
      quantity,
      notes: (m[3] ?? "").trim(),
    };
  });
}

/**
 * Parse the flat "timelineDates" input: a string like
 * "2026-11-01 to 2026-12-15" (also accepts en/em dashes, "→", or a comma),
 * or an object { start, end }. Returns [start, end] ISO dates.
 */
function parseFlatTimeline(value: unknown): { start: string; end: string } {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    return {
      start: cleanString(obj.start ?? obj.from),
      end: cleanString(obj.end ?? obj.to),
    };
  }
  const s = cleanString(value);
  if (s.length === 0) {
    throw new RangeError("timelineDates is required (e.g. \"2026-11-01 to 2026-12-15\").");
  }
  const parts = s.split(/\s*(?:\bto\b|–|—|→|,)\s*/i);
  if (parts.length < 2 || parts[0].length === 0 || parts[1].length === 0) {
    throw new RangeError(
      `timelineDates must hold two dates, like "2026-11-01 to 2026-12-15" (got "${s}").`,
    );
  }
  return { start: parts[0], end: parts[1] };
}

/**
 * Parse the optional flat "exclusivityClause" input: a string like
 * "skincare, 90 days" / "skincare: 90 days", or an object { category, days }.
 * Returns undefined when the input is empty.
 */
function parseFlatExclusivity(value: unknown): ExclusivityInput | undefined {
  if (value === undefined || value === null || cleanString(value) === "") {
    return undefined;
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    return {
      category: cleanString(obj.category),
      days: obj.days as number,
    };
  }
  if (typeof value !== "string") {
    throw new TypeError('exclusivityClause must be a string like "skincare, 90 days".');
  }
  const m = /^(.+?)\s*(?:,|:)\s*(\d+)\s*days?$/.exec(value.trim());
  if (!m) {
    throw new RangeError(
      `exclusivityClause must look like "skincare, 90 days" (got "${value.trim()}").`,
    );
  }
  return { category: m[1].trim(), days: Number(m[2]) };
}

/**
 * Render the outline as copy-ready plain text. The legal disclaimer is
 * printed at the top AND the bottom — it is part of the output.
 */
function renderContractText(outline: ContractOutline): string {
  const lines: string[] = [];
  lines.push(outline.disclaimer);
  lines.push("");
  lines.push(outline.title);
  lines.push(outline.effectiveSummary);
  lines.push("");
  for (const section of outline.sections) {
    lines.push(`## ${section.heading}`);
    for (const clause of section.clauses) {
      lines.push(`- ${clause}`);
    }
    lines.push("");
  }
  if (outline.warnings.length > 0) {
    lines.push("## Review Flags");
    for (const w of outline.warnings) {
      lines.push(`- ${w}`);
    }
    lines.push("");
  }
  lines.push("---");
  lines.push(outline.disclaimer);
  return lines.join("\n");
}

/**
 * Tool-logic-slot adapter for tool-456.
 *
 * Maps the page's flat inputs — brandName, creatorName, deliverables,
 * feeAmount, paymentTerms, usageRightsSummary, exclusivityClause (optional),
 * timelineDates, revisionLimit (default 2), killFeePct (default 0) —
 * onto generateContractOutline(), then renders copy-ready contract text.
 *
 * Output keys: contractText, contractSummary, warnings.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  try {
    const brandName = readFlatString("brandName", values.brandName);
    const creatorName = readFlatString("creatorName", values.creatorName);
    const deliverables = parseFlatDeliverables(values.deliverables);

    const feeAmount = values.feeAmount;
    assertFiniteNumber("feeAmount", feeAmount);
    if (feeAmount < 0) {
      throw new RangeError("feeAmount must be >= 0.");
    }

    const paymentTerms = cleanString(values.paymentTerms);
    if (!PAYMENT_TERMS_OPTIONS.includes(paymentTerms as PaymentTermsOption)) {
      throw new TypeError(
        `paymentTerms must be one of: ${PAYMENT_TERMS_OPTIONS.join(" | ")}.`,
      );
    }

    const usageRights = cleanString(values.usageRightsSummary);
    if (!USAGE_RIGHTS_OPTIONS.includes(usageRights as UsageRightsOption)) {
      throw new TypeError(
        `usageRightsSummary must be one of: ${USAGE_RIGHTS_OPTIONS.join(" | ")}.`,
      );
    }

    const timeline = parseFlatTimeline(values.timelineDates);

    const revisionLimitRaw = values.revisionLimit ?? DEFAULT_REVISION_ROUNDS;
    const revisionLimit = revisionLimitRaw as number;
    assertFiniteNumber("revisionLimit", revisionLimit);
    if (!Number.isInteger(revisionLimit) || revisionLimit < 0) {
      throw new RangeError("revisionLimit must be an integer >= 0.");
    }

    const killFeePctRaw = values.killFeePct ?? 0;
    const killFeePct = killFeePctRaw as number;
    assertFiniteNumber("killFeePct", killFeePct);
    if (killFeePct < 0 || killFeePct > 100) {
      throw new RangeError("killFeePct must be between 0 and 100.");
    }

    const exclusivity = parseFlatExclusivity(values.exclusivityClause);

    const outline = generateContractOutline({
      creatorName,
      brandName,
      deliverables,
      feeAmount,
      currency: DEFAULT_CURRENCY,
      usageRights: usageRights as UsageRightsOption,
      deliveryStartDate: timeline.start,
      deliveryEndDate: timeline.end,
      paymentTerms: paymentTerms as PaymentTermsOption,
      exclusivity,
      revisionRounds: revisionLimit,
    });

    if (killFeePct > 0 && roundToCents(feeAmount) > 0) {
      const killFeeAmount = roundToCents(feeAmount * (killFeePct / 100));
      const comp = outline.sections.find((s) => s.heading === "Compensation");
      if (comp) {
        comp.clauses.push(
          `Kill fee: ${killFeePct}% of the total fee (${money(
            DEFAULT_CURRENCY,
            killFeeAmount,
          )}) is payable if the Brand cancels after work has begun. (Template wording — not legal advice.)`,
        );
      }
    }

    const contractText = renderContractText(outline);

    return {
      ok: true,
      values: {
        contractText,
        contractSummary: outline.effectiveSummary,
        warnings: outline.warnings,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid input." };
  }
}
