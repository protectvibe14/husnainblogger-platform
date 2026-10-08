/**
 * Creator Pitch Deck Outline Generator — tool-503 pure logic.
 * Zero imports. Zero network. Zero DOM. No Math.random. Deterministic:
 * identical inputs always produce the identical outline.
 *
 * ENGINE (honest): fixed-template assembly — NOT AI-generated.
 * FIXED OUTLINE BANK (documented; 8 fixed sections, 3 guidance bullets
 * each = 24 bullets total):
 *   1. Cover slide
 *   2. About me
 *   3. Audience snapshot
 *   4. Content & niches
 *   5. Past brand work
 *   6. Services & packages
 *   7. Why work with me
 *   8. Contact & next steps
 * The user's niche is injected into the cover, content, and "why me"
 * sections; the optional audienceSize is injected into the audience
 * snapshot. Everywhere else the outline keeps honest [bracketed]
 * placeholders the creator fills in with their real numbers — the tool
 * never invents follower counts, rates, or results.
 */

export interface PitchDeckInput {
  niche: unknown;
  audienceSize?: unknown;
}

export interface PitchDeckResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const MAX_NICHE = 60;
const MAX_AUDIENCE = 60;

interface Section {
  title: string;
  bullets: string[];
}

export function runTool(values: Record<string, unknown>): PitchDeckResult {
  const nicheRaw = values["niche"];
  if (typeof nicheRaw !== "string" || nicheRaw.trim().length === 0) {
    return { ok: false, error: "Enter your niche to generate the pitch deck outline." };
  }
  const niche = nicheRaw.trim();
  if (niche.length > MAX_NICHE) {
    return {
      ok: false,
      error: `Niche must be ${MAX_NICHE} characters or fewer.`,
    };
  }

  let audienceSize: string | null = null;
  const audienceRaw = values["audienceSize"];
  if (audienceRaw !== undefined && audienceRaw !== null && String(audienceRaw).trim().length > 0) {
    if (typeof audienceRaw !== "string") {
      return { ok: false, error: "Audience size must be text." };
    }
    const trimmed = audienceRaw.trim();
    if (trimmed.length > MAX_AUDIENCE) {
      return {
        ok: false,
        error: `Audience size must be ${MAX_AUDIENCE} characters or fewer.`,
      };
    }
    audienceSize = trimmed;
  }

  const audienceLine = audienceSize ?? "[Your total followers / subscribers]";

  const sections: Section[] = [
    {
      title: "1. Cover slide",
      bullets: [
        `Your name + tagline: "[Your Name] — ${niche} creator"`,
        "One standout stat or result (only if you can prove it)",
        "Your photo and contact handle",
      ],
    },
    {
      title: "2. About me",
      bullets: [
        "2–3 sentences: who you are and what you create",
        "How long you have been creating content",
        "What makes your perspective different",
      ],
    },
    {
      title: "3. Audience snapshot",
      bullets: [
        `Audience size: ${audienceLine}`,
        "Top 2–3 platforms and where your audience is most engaged",
        "Audience demographics you actually know (age, location, interests)",
      ],
    },
    {
      title: "4. Content & niches",
      bullets: [
        `Your core ${niche} content pillars (list 3–4)`,
        "Your best-performing formats (reels, long-form, shorts, lives)",
        "Link 2–3 representative posts the brand can watch",
      ],
    },
    {
      title: "5. Past brand work",
      bullets: [
        "Brand names you have worked with (with permission)",
        "One-line result per collaboration — real numbers only",
        "Screenshots of standout posts or comments",
      ],
    },
    {
      title: "6. Services & packages",
      bullets: [
        "List what you sell: sponsored post, UGC bundle, whitelisting, ambassadorship",
        "What each package includes (deliverables, revisions, usage rights)",
        "Your rates or a note that rates are shared on request",
      ],
    },
    {
      title: "7. Why work with me",
      bullets: [
        `Why your ${niche} audience trusts your recommendations`,
        "Your average engagement rate (real, from your analytics)",
        "What the brand gets that a generic ad cannot deliver",
      ],
    },
    {
      title: "8. Contact & next steps",
      bullets: [
        "Your email and preferred contact method",
        "Your media kit or rate card link",
        "One clear call to action: \"Reply to discuss a collaboration\"",
      ],
    },
  ];

  const lines: string[] = [`# Creator Pitch Deck Outline — ${niche}`, ""];
  for (const section of sections) {
    lines.push(`## ${section.title}`, "");
    for (const bullet of section.bullets) {
      lines.push(`- ${bullet}`);
    }
    lines.push("");
  }
  lines.push(
    "_Tip: this is a fixed template outline, not AI-written copy. Replace every [bracketed] placeholder with your real numbers before sending._"
  );

  return { ok: true, values: { deckOutline: lines.join("\n").trimEnd() } };
}
