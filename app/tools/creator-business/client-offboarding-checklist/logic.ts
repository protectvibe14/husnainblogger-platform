/**
 * Client Offboarding Checklist — tool-499 pure logic.
 * Zero imports. Zero network. Zero DOM. No Math.random. Deterministic:
 * identical inputs always produce the identical checklist.
 *
 * ENGINE (honest): rule-based conditional checklist assembly — NOT AI.
 * The checklist is assembled from FIXED banks documented below:
 *   - BASE_SECTIONS: 5 sections x fixed items = 14 base items total
 *     (final files, credentials & access, final invoice & payment,
 *      testimonial & referral, archive & records)
 *   - PROJECT_EXTRAS: 5 project types x 3 extra items each = 15 items
 *   - CONDITIONAL_ITEMS: 4 toggle-driven items (2 booleans x 2 branches)
 * The two booleans pick which branch of each conditional pair appears:
 *   - deliverablesHandover=false -> "complete the handover" item
 *     deliverablesHandover=true  -> "get written receipt confirmation" item
 *   - finalInvoiceSent=false -> "send the final invoice" item
 *     finalInvoiceSent=true  -> "verify the final invoice is paid" item
 * This tool gives general operational guidance only — not legal,
 * financial, or tax advice.
 */

export interface OffboardingChecklistInput {
  projectType: unknown;
  deliverablesHandover?: unknown;
  finalInvoiceSent?: unknown;
}

export interface OffboardingChecklistResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Project types the checklist knows about (fixed bank: 5). */
export const PROJECT_TYPES = [
  "design",
  "writing",
  "video",
  "development",
  "coaching",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  design: "Design",
  writing: "Writing / content",
  video: "Video / media",
  development: "Development",
  coaching: "Coaching / consulting",
};

/** Fixed base sections (5 sections, 14 items total). */
const BASE_SECTIONS: { section: string; items: string[] }[] = [
  {
    section: "Final files",
    items: [
      "Deliver final files in the formats agreed in the contract",
      "Include editable source files only if your contract requires it",
      "Confirm the client can open and use every file you send",
    ],
  },
  {
    section: "Credentials & access",
    items: [
      "Revoke the client's access to your accounts (docs, drives, tools)",
      "Ask the client to remove you from their accounts where your work is done",
      "Reset any shared passwords you reused anywhere else",
    ],
  },
  {
    section: "Final invoice & payment",
    items: [
      "Confirm the final payment has cleared in your account",
      "Reconcile expenses and attach receipts to your records",
    ],
  },
  {
    section: "Testimonial & referral",
    items: [
      "Ask for a testimonial while the result is still fresh",
      "Ask for a referral or a warm introduction",
      "Get written permission to show the work in your portfolio",
    ],
  },
  {
    section: "Archive & records",
    items: [
      "Archive the final files, contract, and invoice together",
      "Save key messages and approvals with the project record",
      "Mark the project closed in your tracker or CRM",
    ],
  },
];

/** Fixed extras per project type (5 types x 3 items = 15 items). */
const PROJECT_EXTRAS: Record<ProjectType, string[]> = {
  design: [
    "Hand over brand asset files and note any licensed fonts",
    "Share a short usage guide for the deliverables",
    "Transfer design-tool files if the contract requires it",
  ],
  writing: [
    "Deliver documents in an editable format",
    "Hand over publishing access, or revoke your own access",
    "Note where the published content is archived",
  ],
  video: [
    "Deliver master files plus web-ready exports",
    "Confirm music and footage licensing is documented",
    "Hand over project files if the contract requires it",
  ],
  development: [
    "Transfer repository access and credentials",
    "Provide a short deployment and maintenance runbook",
    "Document known issues and handover notes",
  ],
  coaching: [
    "Deliver the final report and session recordings",
    "Summarize the action plan in writing",
    "Note the agreed follow-up window",
  ],
};

function conditionalItems(
  deliverablesHandover: boolean,
  finalInvoiceSent: boolean
): { section: string; item: string }[] {
  return [
    deliverablesHandover
      ? {
          section: "Handover",
          item: "Get written confirmation that the client received the handover",
        }
      : {
          section: "Handover",
          item: "Complete the deliverables handover: files, access, and docs",
        },
    finalInvoiceSent
      ? {
          section: "Invoicing",
          item: "Verify the final invoice is paid in full",
        }
      : {
          section: "Invoicing",
          item: "Send the final invoice now",
        },
  ];
}

function isProjectType(value: string): value is ProjectType {
  return (PROJECT_TYPES as readonly string[]).includes(value);
}

function parseBooleanField(
  value: unknown,
  fieldName: string
): { ok: true; value: boolean } | { ok: false; error: string } {
  if (value === undefined || value === null) return { ok: true, value: false };
  if (typeof value === "boolean") return { ok: true, value };
  return {
    ok: false,
    error: `${fieldName} must be true or false.`,
  };
}

export function runTool(
  values: Record<string, unknown>
): OffboardingChecklistResult {
  const rawType = values["projectType"];

  if (rawType === undefined || rawType === null || rawType === "") {
    return { ok: false, error: "Select a project type to build the checklist." };
  }
  if (typeof rawType !== "string") {
    return { ok: false, error: "Project type must be one of the listed options." };
  }
  const normalized = rawType.trim().toLowerCase();
  if (!isProjectType(normalized)) {
    return {
      ok: false,
      error: `Unknown project type. Choose one of: ${PROJECT_TYPES.join(", ")}.`,
    };
  }

  const handover = parseBooleanField(values["deliverablesHandover"], "deliverablesHandover");
  if (!handover.ok) return { ok: false, error: handover.error };
  const invoice = parseBooleanField(values["finalInvoiceSent"], "finalInvoiceSent");
  if (!invoice.ok) return { ok: false, error: invoice.error };

  const lines: string[] = [];
  for (const section of BASE_SECTIONS) {
    for (const item of section.items) {
      lines.push(`${section.section}: ${item}`);
    }
  }
  for (const item of PROJECT_EXTRAS[normalized]) {
    lines.push(`${PROJECT_TYPE_LABELS[normalized]} extras: ${item}`);
  }
  for (const cond of conditionalItems(handover.value, invoice.value)) {
    lines.push(`${cond.section}: ${cond.item}`);
  }

  return { ok: true, values: { offboardingChecklist: lines } };
}
