/**
 * 90-Day Blog Launch Planner — pure logic.
 *
 * WHAT IT HONESTLY DOES:
 * Maps a FIXED blog-launch milestone template onto YOUR launch date.
 * The 12 milestones (6 pre-launch, 1 launch day, 5 post-launch) are a fixed
 * checklist; only the calendar dates shift to fit your chosen launch date.
 * The milestones are NOT generated advice for your niche — your niche only
 * appears in the summary line for context.
 *
 * FIXED WORD BANKS (documented):
 * - MILESTONES: 12 entries, each { offsetDays, phase, title, detail }.
 *   Offsets are fixed: -60, -45, -30, -21, -14, -7 (pre-launch), 0 (launch),
 *   +7, +14, +21, +30, +45 (post-launch).
 * - Date math is pure: launchDate (UTC midnight) + offsetDays * 86400000,
 *   formatted back as YYYY-MM-DD via Date.UTC getters (timezone-independent,
 *   deterministic in every runtime).
 * - Past-date rule: if launchDate < today (UTC day), the plan still builds
 *   but planSummary leads with a past-date notice.
 *
 * Deterministic: same (launchDate, niche) on the same day -> identical
 * output, always. Zero imports, zero DOM, zero network, zero Math.random.
 */

interface Milestone {
  offsetDays: number;
  phase: "Pre-launch" | "Launch day" | "Post-launch";
  title: string;
  detail: string;
}

/** Fixed launch milestone template (size: 12). */
export const MILESTONES: ReadonlyArray<Milestone> = [
  { offsetDays: -60, phase: "Pre-launch", title: "Lock in your niche and blog name", detail: "Write your one-sentence blog promise and pick a memorable, niche-clear name." },
  { offsetDays: -45, phase: "Pre-launch", title: "Set up hosting, domain, and theme", detail: "Get your site live on a private URL and install a fast, mobile-friendly theme." },
  { offsetDays: -30, phase: "Pre-launch", title: "Write your first 5 cornerstone posts", detail: "Draft the in-depth posts that will define your blog at launch." },
  { offsetDays: -21, phase: "Pre-launch", title: "Create social profiles and a lead magnet", detail: "Claim matching handles and build one freebie worth an email signup." },
  { offsetDays: -14, phase: "Pre-launch", title: "Set up your email list and welcome sequence", detail: "Connect your signup form and write a 3-email welcome series." },
  { offsetDays: -7, phase: "Pre-launch", title: "Final review and pre-launch polish", detail: "Proofread everything, test forms and links, and schedule your launch post." },
  { offsetDays: 0, phase: "Launch day", title: "Publish and announce your blog", detail: "Publish your launch post and announce it on every channel you own." },
  { offsetDays: 7, phase: "Post-launch", title: "First-week content and outreach", detail: "Publish 2 new posts and share them in 3 communities where your readers gather." },
  { offsetDays: 14, phase: "Post-launch", title: "Send your first newsletter issue", detail: "Recap launch week for subscribers and review your first analytics." },
  { offsetDays: 21, phase: "Post-launch", title: "Repurpose and expand reach", detail: "Turn your best post into 3 short-form pieces for your top platforms." },
  { offsetDays: 30, phase: "Post-launch", title: "30-day review and next sprint", detail: "Publish 2 more posts, fix what analytics flagged, and plan the next 90 days." },
  { offsetDays: 45, phase: "Post-launch", title: "Build the habit", detail: "Settle into your weekly publishing rhythm and keep your email list growing." },
];

export const MAX_NICHE_LENGTH = 120;

export interface MilestoneGrid {
  columns: string[];
  rows: string[][];
}

interface ParsedInputs {
  launchDay: number; // UTC midnight timestamp
  launchIso: string;
  niche: string;
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse "YYYY-MM-DD" strictly; returns UTC-midnight timestamp or undefined. */
function parseIsoDate(raw: unknown): { ts: number; iso: string } | undefined {
  if (typeof raw !== "string") return undefined;
  const m = DATE_PATTERN.exec(raw.trim());
  if (!m) return undefined;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return undefined;
  const ts = Date.UTC(y, mo - 1, d);
  // Reject impossible dates like 2026-02-30 (Date.UTC rolls them over).
  const check = new Date(ts);
  if (
    check.getUTCFullYear() !== y ||
    check.getUTCMonth() !== mo - 1 ||
    check.getUTCDate() !== d
  ) {
    return undefined;
  }
  const iso = `${m[1]}-${m[2]}-${m[3]}`;
  return { ts, iso };
}

/** Format a UTC timestamp back as YYYY-MM-DD. */
function formatIsoDate(ts: number): string {
  const d = new Date(ts);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

/** Today's date at UTC midnight. */
function todayUtcTs(): number {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

/** Human label for an offset: "60 days before launch" / "Launch day" / "7 days after launch". */
function offsetLabel(offsetDays: number): string {
  if (offsetDays === 0) return "Launch day";
  const n = Math.abs(offsetDays);
  const unit = n === 1 ? "day" : "days";
  return offsetDays < 0 ? `${n} ${unit} before launch` : `${n} ${unit} after launch`;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const parsedDate = parseIsoDate(values["launchDate"]);
  if (!parsedDate) {
    return {
      ok: false,
      error: "Please enter a valid launch date in YYYY-MM-DD format (for example, 2027-01-15).",
    };
  }

  const rawNiche = values["niche"];
  if (typeof rawNiche !== "string" || rawNiche.trim().length === 0) {
    return { ok: false, error: "Please enter your niche (for example, \"sourdough baking\")." };
  }
  const niche = rawNiche.replace(/\s+/g, " ").trim();
  if (niche.length > MAX_NICHE_LENGTH) {
    return { ok: false, error: `Niche must be ${MAX_NICHE_LENGTH} characters or fewer.` };
  }

  const { ts: launchTs, iso: launchIso } = parsedDate;
  const isPast = launchTs < todayUtcTs();

  const columns = ["Phase", "Date", "Timing", "Milestone", "What to do"];
  const rows: string[][] = MILESTONES.map((ms) => {
    const dateTs = launchTs + ms.offsetDays * 86400000;
    return [ms.phase, formatIsoDate(dateTs), offsetLabel(ms.offsetDays), ms.title, ms.detail];
  });

  const summaryParts: string[] = [];
  if (isPast) {
    summaryParts.push(
      `Note: your launch date (${launchIso}) is in the past, so this plan maps onto historical dates. ` +
        "Enter a future date to plan a real upcoming launch."
    );
  }
  summaryParts.push(
    `Your 90-day blog launch plan for a "${niche}" blog: ${MILESTONES.length} fixed milestones ` +
      `mapped around launch date ${launchIso}. Pre-launch starts ${formatIsoDate(launchTs - 60 * 86400000)} ` +
      `and the plan runs through ${formatIsoDate(launchTs + 45 * 86400000)}. ` +
      "Milestones come from a fixed launch checklist - the dates are yours, the checklist is standard."
  );

  return {
    ok: true,
    values: {
      milestoneGrid: { columns, rows } as MilestoneGrid,
      planSummary: summaryParts.join(" "),
    },
  };
}
