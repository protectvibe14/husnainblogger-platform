/**
 * TikTok Affiliate Review Script — pure logic (tool-193).
 * Zero imports, zero network, zero DOM, fully deterministic.
 *
 * HONESTY: scripts are assembled from FIXED templates — no AI, no invented
 * experience. The script NEVER claims the user tested the product unless the
 * user says they did:
 *   - triedProduct=true + notes  -> "tested review": pros come ONLY from the
 *     user's own experienceNotes lines; cons are a labeled placeholder the
 *     user must fill from real use.
 *   - triedProduct=true, no notes -> "tested review" with labeled placeholders
 *     for pros/cons the user must write from real use.
 *   - triedProduct=false         -> "first-impressions / unboxing" frame:
 *     explicitly states the product is NOT fully tested yet and makes no
 *     durability/results claims; promises a part-2 after real testing.
 * Every script includes an affiliate disclosure (#ad) in the CTA.
 * Bank sizes:
 *   - TESTED_HOOKS: 6 (opening lines for tested reviews, {P} = product name)
 *   - FIRST_IMPRESSION_HOOKS: 4 (opening lines for untested products)
 *   - DEMO_SHOTS: 5 (fixed demo shot list)
 * Determinism: same inputs -> same outputs (hook chosen by input hash).
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MAX_NAME_LEN = 150;
const MAX_NOTES_LEN = 2000;

/** 6 fixed hooks for products the user has personally tried. */
export const TESTED_HOOKS: readonly string[] = [
  "I finally tried the {P} — here is my honest take.",
  "Is the {P} actually worth it? I tested it so you do not have to.",
  "Stop scrolling — my real results with the {P}.",
  "I used the {P} for a full week. Here is what happened.",
  "Nobody talks about this part of the {P}...",
  "My honest {P} review — the good and the bad.",
];

/** 4 fixed hooks for products the user has NOT fully tested yet. */
export const FIRST_IMPRESSION_HOOKS: readonly string[] = [
  "Unboxing the {P} — first impressions, no filter.",
  "I just got the {P}. Let us open it together.",
  "First look at the {P} — is it worth the hype?",
  "POV: the {P} finally arrived.",
];

/** 5 fixed demo shots every review script includes. */
export const DEMO_SHOTS: readonly string[] = [
  "Unboxing: hands-only close-up as you open the package.",
  "Detail shot: hold the product close to the camera, show texture and build.",
  "In-use demo: film yourself actually using it (no stock footage).",
  "Comparison or before/after: show the difference it makes.",
  "Talking head: your verdict plus the affiliate call to action.",
];

const DISCLOSURE_LINE =
  "If you want to try it, my affiliate link is in my bio — I may earn a commission at no extra cost to you. #ad #affiliate";

/** FNV-1a 32-bit hash — deterministic bank seeding, no Math.random. */
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function fill(template: string, productName: string): string {
  return template.split("{P}").join(productName);
}

function err(error: string): RunResult {
  return { ok: false, error };
}

function buildTestedScript(productName: string, notes: string[], hook: string): string {
  const liked =
    notes.length > 0
      ? notes.map((n) => `• ${n}`).join("\n")
      : "• [Write 2-3 things you genuinely liked from actually using it — your words only.]";
  return (
    `HOOK (say in the first 3 seconds):\n${hook}\n\n` +
    `INTRO\n` +
    `I picked up the ${productName} and put it through real use. Here is what I actually found — the good and the not-so-good.\n\n` +
    `WHAT I LIKED (from my own use):\n${liked}\n\n` +
    `ONE HONEST DOWNSIDE (fill in from real use — viewers trust balanced reviews):\n` +
    `• [Write one real downside you noticed. Every product has one. Delete this line and write yours.]\n\n` +
    `DEMO SHOTS (film these):\n${DEMO_SHOTS.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n` +
    `OUTRO + CTA\n` +
    `${DISCLOSURE_LINE}`
  );
}

function buildFirstImpressionsScript(productName: string, hook: string): string {
  return (
    `HOOK (say in the first 3 seconds):\n${hook}\n\n` +
    `WHAT THIS VIDEO IS\n` +
    `A first look and unboxing of the ${productName}. I have NOT fully tested it yet — so no claims about long-term results today.\n\n` +
    `FIRST IMPRESSIONS (film and narrate what you actually see):\n` +
    `• Packaging and first feel: [describe it in your own words on camera]\n` +
    `• What I am excited to test: [say it in your own words]\n\n` +
    `WHAT I WILL NOT CLAIM TODAY\n` +
    `No durability claims, no "best ever", no results promises — those come only after real testing in part 2.\n\n` +
    `DEMO SHOTS (film these):\n${DEMO_SHOTS.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n` +
    `OUTRO + CTA\n` +
    `Follow for part 2 — the real test after I have actually used it. ${DISCLOSURE_LINE}`
  );
}

export function runTool(values: Record<string, unknown>): RunResult {
  const rawName = values["productName"];
  if (typeof rawName !== "string" || rawName.trim().length === 0) {
    return err(
      'Please enter the product name — for example "mini portable blender" — so the script fits your review.',
    );
  }
  const productName = rawName.trim().replace(/\s+/g, " ");
  if (productName.length > MAX_NAME_LEN) {
    return err(
      `Product name must be ${MAX_NAME_LEN} characters or fewer — shorten it and try again.`,
    );
  }

  const tried = values["triedProduct"];
  if (typeof tried !== "boolean") {
    return err(
      "Tell us whether you have personally tried the product — this decides if the script uses a tested-review or a first-impressions frame.",
    );
  }

  let notes: string[] = [];
  const rawNotes = values["experienceNotes"];
  if (rawNotes !== undefined && rawNotes !== null && String(rawNotes).trim().length > 0) {
    const text = String(rawNotes).trim();
    if (text.length > MAX_NOTES_LEN) {
      return err(
        `Experience notes must be ${MAX_NOTES_LEN} characters or fewer — trim them and try again.`,
      );
    }
    notes = text
      .split(/[\n;]+/)
      .map((n) => n.trim().replace(/\s+/g, " "))
      .filter((n) => n.length > 0);
  }

  let script: string;
  if (tried) {
    const hook = fill(
      TESTED_HOOKS[hashString("tested|" + productName.toLowerCase()) % TESTED_HOOKS.length],
      productName,
    );
    script = buildTestedScript(productName, notes, hook);
  } else {
    const hook = fill(
      FIRST_IMPRESSION_HOOKS[
        hashString("first|" + productName.toLowerCase()) % FIRST_IMPRESSION_HOOKS.length
      ],
      productName,
    );
    script = buildFirstImpressionsScript(productName, hook);
  }

  const disclosure =
    "Affiliate honesty rules used in this script: #ad is included in the call to action, " +
    "and the script never invents experience claims — products you have not tried get a " +
    "first-impressions frame only, with no durability or results promises. US FTC guidance " +
    "requires clear, conspicuous disclosure of affiliate relationships. " +
    "This is general information, not legal advice.";

  return { ok: true, values: { reviewScript: script, disclosure } };
}
