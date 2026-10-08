/**
 * TikTok Stitch Prompt Generator — pure logic (tool-157).
 * Zero imports, zero network, zero DOM, fully deterministic.
 *
 * HONESTY: stitch prompts are assembled from FIXED template banks — this tool
 * CANNOT fetch videos from TikTok (a pasted video description is only quoted
 * back as text you supplied; nothing is retrieved). No AI. Bank sizes:
 *   - STANCES: 4 (agree | debunk | add-context | funny)
 *   - OPENERS: 6 per stance
 *   - ANGLES: 6 per stance (response angle following the opening line)
 *   - FILMING_TIPS: 3 per stance
 * Output count: exactly 5 prompts per run (PROMPT_COUNT).
 * Determinism: same inputs -> same outputs (bank index = hash of inputs).
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MAX_NICHE_LEN = 100;
const MAX_DESC_LEN = 500;
const PROMPT_COUNT = 5;

const STANCES = ["agree", "debunk", "add-context", "funny"] as const;
type Stance = (typeof STANCES)[number];

/** FNV-1a 32-bit hash — deterministic bank seeding, no Math.random. */
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(bank: readonly T[], seed: number, i: number): T {
  return bank[(seed + i) % bank.length];
}

function fill(template: string, niche: string): string {
  return template.split("{niche}").join(niche);
}

const OPENERS: Record<Stance, readonly string[]> = {
  agree: [
    "Okay, this is the best {niche} take I have heard all week —",
    "Finally someone said the truth about {niche} —",
    "I stitch this because I literally do this exact {niche} thing —",
    "This {niche} video deserves way more views, here is why —",
    "As someone deep in {niche}, I can confirm every word of this —",
    "Wait, pause this {niche} video — I need to add my own proof —",
  ],
  debunk: [
    "I wish this {niche} advice were true, but here is the problem —",
    "This {niche} tip sounds great until you actually try it —",
    "Stop. Before you save this {niche} video, hear me out —",
    "This is the {niche} myth I see go viral every single month —",
    "Half of this {niche} advice is solid. The other half will cost you —",
    "As a {niche} person, I have to respectfully disagree with this part —",
  ],
  "add-context": [
    "This {niche} video is missing one important piece of context —",
    "Great {niche} advice, but it only works IF you do this first —",
    "Here is the part of this {niche} story nobody is talking about —",
    "This {niche} clip is real, but there is a second half to it —",
    "Before you try this {niche} tip, you need this background —",
    "This works in {niche}, but only under one condition —",
  ],
  funny: [
    "POV: you just watched this {niche} video and now you are questioning everything —",
    "This {niche} video sent me — let me show you my version —",
    "The way I gasped at this {niche} take —",
    "Tag someone who does exactly what this {niche} video shows —",
    "This {niche} video is my villain origin story —",
    "Me watching this {niche} advice knowing I do the opposite —",
  ],
};

const ANGLES: Record<Stance, readonly string[]> = {
  agree: [
    "Back it up: show your own {niche} result on screen as living proof.",
    "Amplify: repeat their strongest point in your own words, then add one extra tip.",
    "Validate with specifics: name the exact detail that makes their advice correct.",
    "Show the before/after: your own {niche} transformation that proves their point.",
    "Add a pro nuance: agree, then share the advanced version for experienced viewers.",
    "Credit and extend: tag the creator's handle and build their idea into a mini-series.",
  ],
  debunk: [
    "Present one counterexample from your own {niche} experience, filmed clearly.",
    "Cite the common mistake their advice causes and what happens when people follow it.",
    "Offer the corrected version: 'instead of X, do Y because...' with a quick demo.",
    "Ask viewers to test both versions and report back — turn the debunk into an experiment.",
    "Explain who the original advice is actually for, and who it harms.",
    "Keep it kind: open by acknowledging what the creator got right before the correction.",
  ],
  "add-context": [
    "Fill the gap: state the missing fact in one sentence, then show why it matters.",
    "Add the exception: 'this works unless...' with a real example from your niche.",
    "Give the timeline: explain what happens step-by-step after the clip ends.",
    "Translate for beginners: restate the original point in simpler terms first.",
    "Add the cost angle: what this {niche} tip costs in time or money that the clip skipped.",
    "Add the safety angle: one precaution viewers should take before trying it.",
  ],
  funny: [
    "Exaggerate: act out the worst-case version of the original video for comedic effect.",
    "Relate: film your 'me doing this' version with deliberately chaotic energy.",
    "Roast yourself: show that you are guilty of the exact thing in the original video.",
    "Duet the duet: stitch with a deadpan face while the chaos plays out.",
    "Add a plot twist ending that reframes the whole original clip.",
    "Parody the format: copy their exact style but with a ridiculous {niche} example.",
  ],
};

const FILMING_TIPS: Record<Stance, readonly string[]> = {
  agree: [
    "Let the original clip play at least 3 seconds before you appear — viewers need the context.",
    "Keep your stitched part under 20 seconds; agreement stitches win on energy, not length.",
    "Film your proof with good lighting — agreement without evidence feels hollow.",
  ],
  debunk: [
    "Never insult the creator — debunk the claim, not the person, or comments turn on you.",
    "State your correction within the first 5 seconds of your part so viewers do not scroll.",
    "Pin a comment with your source or experience so the debunk holds up under scrutiny.",
  ],
  "add-context": [
    "Open with the words 'important context' so viewers know you are adding, not attacking.",
    "Use on-screen text for the key fact — context stitches get saved when they are quotable.",
    "Keep the original clip short (under 10 seconds) so your addition is the star.",
  ],
  funny: [
    "Commit to the bit — half-hearted comedy stitches fall flat; full energy wins.",
    "Time your punchline to land within the first 8 seconds of your segment.",
    "Use a trending sound in your part if the original clip's audio is not essential.",
  ],
};

export function runTool(values: Record<string, unknown>): RunResult {
  const rawNiche = values["niche"];
  if (typeof rawNiche !== "string" || rawNiche.trim().length === 0) {
    return {
      ok: false,
      error: 'Please enter your niche — for example "personal finance" — so the prompts fit your content.',
    };
  }
  const niche = rawNiche.trim();
  if (niche.length > MAX_NICHE_LEN) {
    return { ok: false, error: "Niche must be 100 characters or fewer — shorten it and try again." };
  }

  const rawStance = values["stance"];
  const stance = typeof rawStance === "string" ? rawStance.trim().toLowerCase() : "";
  if (!(STANCES as readonly string[]).includes(stance)) {
    return { ok: false, error: "Please choose a stance: agree, debunk, add-context, or funny." };
  }
  const s = stance as Stance;

  let descriptionTail = "";
  const rawDesc = values["videoDescription"];
  if (rawDesc !== undefined && rawDesc !== null && String(rawDesc).trim().length > 0) {
    const desc = String(rawDesc).trim();
    if (desc.length > MAX_DESC_LEN) {
      return {
        ok: false,
        error: "Video description must be 500 characters or fewer — paste a short summary instead.",
      };
    }
    // Quoted back verbatim: the tool never fetches anything from TikTok.
    descriptionTail = ` Tailor this to the video you described as: "${desc}".`;
  }

  const seed = hashString(niche.toLowerCase() + "|" + s);
  const openers = OPENERS[s];
  const angles = ANGLES[s];

  const stitchPrompts: string[] = [];
  for (let i = 0; i < PROMPT_COUNT; i++) {
    const opener = fill(pick(openers, seed, i), niche);
    const angle = fill(pick(angles, seed, i * 2), niche);
    stitchPrompts.push(`Prompt ${i + 1} — Opening line: "${opener}" Response angle: ${angle}.${descriptionTail}`);
  }

  const filmingTips = [...FILMING_TIPS[s]];

  return { ok: true, values: { stitchPrompts, filmingTips } };
}
