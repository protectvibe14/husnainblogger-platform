/**
 * NDA Generator — pure logic (tool-463).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Deterministic template assembly.
 * - This builds a TEMPLATE document from fixed section templates with the
 *   user's values interpolated. It is NOT legal advice and creates no
 *   attorney-client relationship.
 * - The disclaimer "Template only — not legal advice. Consult a licensed
 *   attorney." is a required, non-removable part of every generated draft
 *   (both inside the document text and reported in the assumptions).
 * - Governing-law jurisdiction is free text: it is echoed back as
 *   USER-PROVIDED and never validated — flagged as such in the output.
 * - No electronic signature, no parties are validated as real, and no legal
 *   citations, statutes, or case law are referenced anywhere.
 * - Dates are ISO YYYY-MM-DD calendar dates.
 * - runTool validates every input and returns { ok:false, error } with a
 *   human-readable message on any invalid or missing input.
 */

export const NDA_DISCLAIMER =
  "Template only — not legal advice. Consult a licensed attorney.";

export const MIN_TERM_YEARS = 0;
export const MAX_TERM_YEARS = 50;

export interface NdaInputs {
  disclosingParty: string;
  receivingParty: string;
  effectiveDate: string;
  confidentialInfoDescription: string;
  termYears: number;
  mutual: boolean;
  governingLawJurisdiction: string;
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export function generateNdaDraft(input: NdaInputs): string {
  const {
    disclosingParty,
    receivingParty,
    effectiveDate,
    confidentialInfoDescription,
    termYears,
    mutual,
    governingLawJurisdiction,
  } = input;

  const partyRoles = mutual
    ? `This Agreement is MUTUAL: both ${disclosingParty} and ${receivingParty} may disclose Confidential Information, and each party is both a Disclosing Party and a Receiving Party for the information it receives.`
    : `This Agreement is ONE-WAY: ${disclosingParty} is the Disclosing Party and ${receivingParty} is the Receiving Party. Only the Receiving Party is bound by the obligations below.`;

  const yearWord = termYears === 1 ? "year" : "years";

  const sections = [
    "NON-DISCLOSURE AGREEMENT (TEMPLATE DRAFT)",
    "",
    "1. PARTIES AND EFFECTIVE DATE",
    `This Non-Disclosure Agreement is entered into as of ${effectiveDate} (the "Effective Date"), between ${disclosingParty} and ${receivingParty}.`,
    "",
    "2. ONE-WAY OR MUTUAL",
    partyRoles,
    "",
    "3. DEFINITION OF CONFIDENTIAL INFORMATION",
    `Confidential Information means: ${confidentialInfoDescription}. Confidential Information also includes any information a party should reasonably understand to be confidential given the nature of the information and the circumstances of disclosure.`,
    "",
    "4. OBLIGATIONS OF THE RECEIVING PARTY",
    "The Receiving Party agrees to: (a) keep the Confidential Information strictly confidential; (b) use it only for evaluating or performing the project or relationship described to the other party; (c) not disclose it to any third party without the prior written consent of the Disclosing Party; and (d) protect it with at least the same care it uses for its own confidential information. Confidential Information does not include information that is or becomes publicly known through no fault of the Receiving Party, was already known to the Receiving Party, is independently developed without use of the Confidential Information, or must be disclosed by law (in which case the Receiving Party will give prompt notice where legally permitted).",
    "",
    "5. TERM",
    `The obligations in this Agreement remain in effect for ${termYears} ${yearWord} from the Effective Date.`,
    "",
    "6. GOVERNING LAW",
    `This Agreement will be governed by the laws of ${governingLawJurisdiction}. (Jurisdiction provided by you — not verified by this tool.)`,
    "",
    "7. DRAFT STATUS",
    "This is a TEMPLATE DRAFT only. It is not signed, it creates no legal obligations on its own, and the parties have not agreed to electronic signature through this tool.",
    "",
    "8. DISCLAIMER",
    NDA_DISCLAIMER,
    " Enforceability of any NDA varies by jurisdiction and by the specific facts of your situation.",
    "",
    "[SIGNATURE BLOCKS — to be added when the parties sign a final version reviewed by counsel]",
    `Disclosing Party (${disclosingParty}): ____________________ Date: __________`,
    `Receiving Party (${receivingParty}): ____________________ Date: __________`,
  ];

  return sections.join("\n");
}

function coerceNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "string" ? Number(value.trim()) : Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

function coerceBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true" || v === "yes" || v === "1" || v === "mutual") return true;
    if (v === "false" || v === "no" || v === "0" || v === "one-way")
      return false;
  }
  return false;
}

function nonEmpty(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t === "" ? null : t;
}

export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  const disclosingParty = nonEmpty(values.disclosingParty);
  if (!disclosingParty) {
    return { ok: false, error: "Enter the name of the disclosing party." };
  }
  const receivingParty = nonEmpty(values.receivingParty);
  if (!receivingParty) {
    return { ok: false, error: "Enter the name of the receiving party." };
  }
  const effectiveDateRaw = nonEmpty(values.effectiveDate);
  if (!effectiveDateRaw || !isValidIsoDate(effectiveDateRaw)) {
    return {
      ok: false,
      error: "Enter a valid effective date in YYYY-MM-DD format.",
    };
  }
  const confidentialInfoDescription = nonEmpty(
    values.confidentialInfoDescription,
  );
  if (!confidentialInfoDescription) {
    return {
      ok: false,
      error: "Describe the confidential information this NDA covers.",
    };
  }
  const termYears = coerceNumber(values.termYears);
  if (
    termYears === null ||
    termYears <= 0 ||
    termYears > MAX_TERM_YEARS ||
    !Number.isInteger(termYears)
  ) {
    return {
      ok: false,
      error: `Enter a whole number of years for the term (1-${MAX_TERM_YEARS}).`,
    };
  }
  const mutual = coerceBoolean(values.mutual);
  const governingLawJurisdiction = nonEmpty(values.governingLawJurisdiction);
  if (!governingLawJurisdiction) {
    return {
      ok: false,
      error:
        "Enter a governing-law jurisdiction (free text — it is used as-is).",
    };
  }

  return {
    ok: true,
    values: {
      ndaDraftText: generateNdaDraft({
        disclosingParty,
        receivingParty,
        effectiveDate: effectiveDateRaw,
        confidentialInfoDescription,
        termYears,
        mutual,
        governingLawJurisdiction,
      }),
    },
  };
}
