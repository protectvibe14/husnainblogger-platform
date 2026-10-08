/**
 * tool-220 — Giveaway Rules Generator (generator).
 *
 * HONESTY: Fully client-side template engine — it fills a fixed rules
 * template with the user's inputs. The compliance notes are GENERAL
 * GUIDANCE, not legal advice: the output and the assumptions both state
 * "Template only — not legal advice; check Instagram's promotion guidelines
 * and your local laws."
 *
 * Word banks (documented sizes):
 *   ENTRY_STEPS — 4 entry methods × 4 steps each (16 fixed steps)
 *
 * Pure TypeScript: zero imports, no DOM, no network, no Math.random.
 * Deterministic: same inputs -> same outputs, always.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const ENTRY_METHODS = ["Like + comment", "Follow both accounts", "Tag a friend", "Share to your story"] as const;
type EntryMethod = (typeof ENTRY_METHODS)[number];

const ENTRY_STEPS: Readonly<Record<EntryMethod, ReadonlyArray<string>>> = {
  "Like + comment": [
    "Like the giveaway post.",
    "Comment on the post with the entry keyword or your answer.",
    "Follow the host account so the winner can be contacted by DM.",
    "One comment counts as one entry — duplicate comments do not increase entries.",
  ],
  "Follow both accounts": [
    "Follow the host account and the partner account.",
    "Like the giveaway post.",
    "Comment once to confirm your entry.",
    "Keep following until the winner is announced — unfollowing disqualifies the entry.",
  ],
  "Tag a friend": [
    "Follow the host account.",
    "Tag one friend per comment on the giveaway post.",
    "Each comment with a unique tagged friend counts as one entry.",
    "No duplicate tags, no tagging celebrities or fake accounts.",
  ],
  "Share to your story": [
    "Share the giveaway post to your story and keep it up for 24 hours.",
    "Tag the host account in the story.",
    "Follow the host account so the winner can be contacted by DM.",
    "One story share counts as one entry; screenshots must show the full 24-hour window.",
  ],
};

const COMPLIANCE_CHECKLIST: ReadonlyArray<string> = [
  "No purchase necessary to enter or win — state this clearly in your post.",
  "Add: 'This promotion is in no way sponsored, endorsed or administered by, or associated with Instagram.'",
  "Publish a clear end date with timezone, and say when and where the winner will be announced.",
  "Choose the winner by the method you promised (e.g. random draw) and keep a record of the draw.",
  "Template only — not legal advice; check Instagram's promotion guidelines and your local laws before publishing.",
];

const LEGAL_DISCLAIMER =
  "Template only — not legal advice; check Instagram's promotion guidelines and your local laws.";

function formatDate(iso: string): string {
  const parts = iso.split("-");
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (y > 0 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
    return `${months[m - 1]} ${d}, ${y}`;
  }
  return iso;
}

function buildRulesText(prize: string, method: EntryMethod, endDate: string, region: string): string {
  const steps = ENTRY_STEPS[method];
  const stepLines = steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
  const eligibility =
    region === "" ? "Open to participants aged 18+ where lawful." : `Open to residents of ${region} aged 18+.`;
  const lines = [
    `${prize.toUpperCase()} GIVEAWAY — OFFICIAL RULES (TEMPLATE)`,
    "",
    `1. Prize: ${prize}.`,
    `2. How to enter (${method}):`,
    stepLines,
    `3. Entry period: entries close on ${formatDate(endDate)}.`,
    `4. Eligibility: ${eligibility} No purchase necessary.`,
    "5. Winner selection: the winner is chosen as described in the entry method above and announced on the host's profile.",
    "6. This promotion is in no way sponsored, endorsed or administered by, or associated with Instagram.",
    "",
    LEGAL_DISCLAIMER,
  ];
  return lines.join("\n");
}

export function runTool(values: Record<string, unknown>): RunResult {
  const prize = String(values.prize ?? "").trim();
  if (prize === "") {
    return { ok: false, error: "Describe the prize (e.g. \"a $100 gift card\")." };
  }

  const entryMethodRaw = String(values.entryMethod ?? "").trim();
  const entryMethod = (ENTRY_METHODS as ReadonlyArray<string>).includes(entryMethodRaw)
    ? (entryMethodRaw as EntryMethod)
    : null;
  if (entryMethod === null) {
    return {
      ok: false,
      error: `Choose an entry method: ${ENTRY_METHODS.join(", ")}.`,
    };
  }

  const endDate = String(values.endDate ?? "").trim();
  if (endDate === "") {
    return { ok: false, error: "Enter the giveaway end date." };
  }
  const parsed = Date.parse(endDate);
  if (!Number.isFinite(parsed)) {
    return { ok: false, error: `End date "${endDate}" is not a valid date.` };
  }
  if (parsed <= Date.now()) {
    return { ok: false, error: "The end date must be in the future." };
  }

  const region = String(values.region ?? "").trim();

  return {
    ok: true,
    values: {
      rulesText: buildRulesText(prize, entryMethod, endDate, region),
      entrySteps: [...ENTRY_STEPS[entryMethod]],
      complianceChecklist: [...COMPLIANCE_CHECKLIST],
    },
  };
}
