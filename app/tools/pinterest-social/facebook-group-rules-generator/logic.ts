/**
 * Facebook Group Rules Generator — pure logic (tool-389). Zero imports, zero
 * network, zero DOM.
 *
 * TEMPLATE BANK, NOT AI: assembles a group-rules set from hand-written
 * rules. Every rule has a plain-language rule text plus a "why" line so
 * members understand the reasoning.
 *
 * Rule bank: 5 categories x 3 strictness levels x 2 variants = 30 rules.
 *   Categories: spam, self-promo, respect, off-topic, moderation.
 *   Strictness: relaxed, moderate, strict.
 * Nothing is written by AI. Per run the engine picks variant
 * (seed % 2) for each category at the chosen strictness — deterministic
 * for the same inputs.
 *
 * Honesty: there is no verified platform cap on rule text, so no hard
 * cap is applied (per spec edge case). Compliance with Facebook's
 * Community Standards stays the admin's job — the output carries a
 * disclaimer, repeated in meta.ts assumptions.
 *
 * Deterministic: same inputs -> same outputs (variant index = char-code
 * sum of inputs, modulo 2).
 */

export type Strictness = "relaxed" | "moderate" | "strict";

/** Supported strictness levels, in canonical order. */
export const STRICTNESS_LEVELS: Strictness[] = ["relaxed", "moderate", "strict"];

/** Rule categories, in the order they appear in the output. */
export const RULE_CATEGORIES = ["spam", "self-promo", "respect", "off-topic", "moderation"] as const;

export type RuleCategory = (typeof RULE_CATEGORIES)[number];

/** Input bounds. */
export const MAX_PURPOSE_LENGTH = 120;

export interface GroupRule {
  category: RuleCategory;
  rule: string;
  why: string;
}

/**
 * RULE BANK — 30 hand-written rules (5 categories x 3 strictness x 2
 * variants). All plain-language and enforceable; nothing facilitates
 * illegal content.
 */
export const RULE_BANK: Record<Strictness, Record<RuleCategory, [GroupRule, GroupRule]>> = {
  relaxed: {
    spam: [
      {
        category: "spam",
        rule: "No spam — keep posts relevant to the group.",
        why: "Keeps the feed useful so members keep coming back.",
      },
      {
        category: "spam",
        rule: "Spam gets removed. Share things members will actually enjoy.",
        why: "Protects the group's signal-to-noise ratio.",
      },
    ],
    "self-promo": [
      {
        category: "self-promo",
        rule: "Self-promotion is welcome on Fridays — share your work in the weekly thread.",
        why: "Gives creators a home without flooding the feed.",
      },
      {
        category: "self-promo",
        rule: "You may share your own projects once a week, with context on why it helps members.",
        why: "Balances promotion with genuine value.",
      },
    ],
    respect: [
      {
        category: "respect",
        rule: "Be kind — disagree with ideas, not people.",
        why: "A friendly tone keeps conversations productive.",
      },
      {
        category: "respect",
        rule: "Treat fellow members the way you'd want to be treated.",
        why: "One simple rule with a big effect on group culture.",
      },
    ],
    "off-topic": [
      {
        category: "off-topic",
        rule: "Off-topic posts are fine in moderation — tag them #offtopic.",
        why: "Lets personality in without derailing the group.",
      },
      {
        category: "off-topic",
        rule: "Keep posts roughly on-topic; wild tangents belong in the lounge thread.",
        why: "Keeps the feed relevant while giving members a pressure valve.",
      },
    ],
    moderation: [
      {
        category: "moderation",
        rule: "Admins may tidy up duplicate or misplaced posts.",
        why: "Keeps things organized without heavy policing.",
      },
      {
        category: "moderation",
        rule: "If your post is removed, you'll get a friendly note explaining why.",
        why: "Transparency builds trust in light-touch moderation.",
      },
    ],
  },
  moderate: {
    spam: [
      {
        category: "spam",
        rule: "No spam, mass-tagging, or repetitive posting. First offense: warning; repeat: removal.",
        why: "Keeps discussion quality high and deters drive-by posters.",
      },
      {
        category: "spam",
        rule: "Do not post the same link or message more than once per week.",
        why: "Prevents the feed from being flooded by one voice.",
      },
    ],
    "self-promo": [
      {
        category: "self-promo",
        rule: "No unsolicited self-promotion. Promote only in the weekly promo thread.",
        why: "Keeps the feed member-first while giving sellers one fair slot.",
      },
      {
        category: "self-promo",
        rule: "Affiliate links and sales posts need prior admin approval.",
        why: "Stops the group quietly turning into a marketplace.",
      },
    ],
    respect: [
      {
        category: "respect",
        rule: "No harassment, hate speech, or personal attacks. Report issues to admins instead of retaliating.",
        why: "Keeps the group safe and gives admins a clear enforcement path.",
      },
      {
        category: "respect",
        rule: "Debate is welcome; insults are not. Repeat offenders are removed.",
        why: "Draws the line between discussion and abuse.",
      },
    ],
    "off-topic": [
      {
        category: "off-topic",
        rule: "Stay on topic. Off-topic posts may be removed with a note from the admin.",
        why: "Keeps the group's purpose clear for new members.",
      },
      {
        category: "off-topic",
        rule: "Memes and jokes are fine only if related to the group's topic.",
        why: "Fun is welcome when it serves the group's theme.",
      },
    ],
    moderation: [
      {
        category: "moderation",
        rule: "Admins may remove posts or comments that break these rules; repeat violations lead to removal from the group.",
        why: "Gives admins clear, graduated enforcement powers.",
      },
      {
        category: "moderation",
        rule: "Decisions by admins are final — appeal once via DM, not in public.",
        why: "Prevents moderation debates from hijacking threads.",
      },
    ],
  },
  strict: {
    spam: [
      {
        category: "spam",
        rule: "Zero tolerance for spam: no link-dropping, mass tags, or duplicate posts. Violations are removed immediately.",
        why: "A strict rule keeps the group clean without debate.",
      },
      {
        category: "spam",
        rule: "All links require admin approval before posting.",
        why: "Prevents link spam at the source.",
      },
    ],
    "self-promo": [
      {
        category: "self-promo",
        rule: "No self-promotion of any kind, including in comments and DMs to members.",
        why: "Protects members from being treated as leads.",
      },
      {
        category: "self-promo",
        rule: "Promotional content of any form results in an immediate ban.",
        why: "Leaves no gray area for advertisers.",
      },
    ],
    respect: [
      {
        category: "respect",
        rule: "Zero tolerance for harassment, hate speech, discrimination, or threats — immediate permanent ban.",
        why: "Member safety comes before second chances.",
      },
      {
        category: "respect",
        rule: "Screenshots of private conversations to shame members are banned.",
        why: "Protects member privacy and trust.",
      },
    ],
    "off-topic": [
      {
        category: "off-topic",
        rule: "Off-topic posts are removed without warning. This group stays strictly on-theme.",
        why: "A focused feed is the group's core promise.",
      },
      {
        category: "off-topic",
        rule: "No memes, jokes, or viral content unless directly about the group's topic.",
        why: "Prevents theme drift.",
      },
    ],
    moderation: [
      {
        category: "moderation",
        rule: "Admins enforce these rules strictly. Three strikes: warning, mute, permanent ban.",
        why: "A clear ladder makes enforcement predictable.",
      },
      {
        category: "moderation",
        rule: "Admin decisions are final and not open to public debate.",
        why: "Keeps authority clear in a large group.",
      },
    ],
  },
};

export interface RulesResultValues {
  ok: boolean;
  values?: {
    intro: string;
    rules: string[];
    copyAll: string;
    disclaimer: string;
  };
  error?: string;
}

function sumChars(s: string): number {
  let total = 0;
  for (let i = 0; i < s.length; i++) total += s.charCodeAt(i);
  return total;
}

/** Render one rule as two lines: "Rule: …" / "Why: …". */
export function formatRule(r: GroupRule): string {
  return `Rule: ${r.rule}\nWhy: ${r.why}`;
}

export function runTool(values: Record<string, unknown>): RulesResultValues {
  const purposeRaw = values["groupPurpose"];
  if (typeof purposeRaw !== "string" || purposeRaw.trim().length === 0) {
    return { ok: false, error: "Please describe your group's purpose (e.g. a support community for new parents)." };
  }
  const purpose = purposeRaw.trim();

  if (purpose.length > MAX_PURPOSE_LENGTH) {
    return { ok: false, error: `Keep your group purpose under ${MAX_PURPOSE_LENGTH} characters (yours is ${purpose.length}).` };
  }

  let strictness: Strictness = "moderate"; // default per spec
  const strictRaw = values["strictness"];
  if (typeof strictRaw === "string" && strictRaw.trim().length > 0) {
    const s = strictRaw.trim().toLowerCase();
    if (s === "relaxed" || s === "moderate" || s === "strict") {
      strictness = s;
    } else {
      return { ok: false, error: "Strictness must be 'relaxed', 'moderate', or 'strict'." };
    }
  }

  const seed = sumChars(purpose + "|" + strictness);
  const level = RULE_BANK[strictness];

  const picked: GroupRule[] = RULE_CATEGORIES.map((cat, i) => level[cat][(seed + i) % 2]);
  const rules = picked.map(formatRule);
  const intro = `Group rules for "${purpose}" (${strictness} mode) — ${picked.length} rules covering spam, self-promotion, respect, off-topic posts, and moderation.`;

  return {
    ok: true,
    values: {
      intro,
      rules,
      copyAll: `${intro}\n\n${rules.map((r, i) => `${i + 1}. ${r}`).join("\n\n")}`,
      disclaimer:
        "These rules are a starting template, not legal advice. You are responsible for enforcing them and for following Facebook's Community Standards and Terms — adjust the wording before publishing.",
    },
  };
}
