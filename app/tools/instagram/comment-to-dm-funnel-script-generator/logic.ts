/**
 * Comment-to-DM Funnel Script Generator — pure logic (zero imports, zero network, zero DOM).
 *
 * Writes the three parts of a manual comment-to-DM funnel — the public
 * comment reply, the DM message sequence, and the follow-ups — from FIXED
 * script banks. NO automation: every message is copied and sent by the user
 * by hand (Instagram forbids automated messaging; see honestyNote).
 *
 * Fixed content banks (documented per the builder honesty contract):
 * - TONES: 4 fixed tones (friendly | professional | playful | direct)
 * - Per tone: 1 comment-reply + 3 DM messages + 2 follow-up messages = 6 fixed scripts
 * - Total bank: 4 tones x 6 = 24 fixed scripts
 * - SETUP_CHECKLIST: 6 fixed setup steps (same for every tone)
 * {leadMagnet} and {keyword} are filled from the inputs; the link slot is
 * left as "[paste your link here]" for the user to fill per send.
 * Fully deterministic: same inputs -> identical outputs.
 */

export const TONES = ["friendly", "professional", "playful", "direct"] as const;
export type Tone = (typeof TONES)[number];

export const MAX_LEAD_MAGNET_LEN = 80;
export const MAX_KEYWORD_LEN = 30;
const LINK_SLOT = "[paste your link here]";

interface ToneScripts {
  commentReply: string;
  dmScript: string[];
  followUp: string[];
}

/** 4 tones x 6 fixed scripts = 24. */
const SCRIPTS: Record<Tone, ToneScripts> = {
  friendly: {
    commentReply:
      "Just sent it! Check your DMs 📩 (if you do not see it, look in message requests)",
    dmScript: [
      `Hey! You commented "{keyword}" — here is your {leadMagnet} 🎁 ${LINK_SLOT}`,
      "Quick question: what made you grab it? I might have a bonus resource for you.",
      "Loved chatting! Everything you need is inside the guide — and I am here if you get stuck.",
    ],
    followUp: [
      "Hey! Just checking in — did you get a chance to open the {leadMagnet}?",
      `Last nudge 💛 the {leadMagnet} is still here if you want it: ${LINK_SLOT}`,
    ],
  },
  professional: {
    commentReply:
      "Done — I have sent it to your DMs. Please check your message requests folder if it does not appear.",
    dmScript: [
      `Hello — as requested, here is your {leadMagnet}: ${LINK_SLOT}`,
      "May I ask what you are currently working on? I can point you to the most relevant section.",
      "Feel free to reply with any questions — I am happy to help.",
    ],
    followUp: [
      "Following up — were you able to access the {leadMagnet}?",
      `A final note: the {leadMagnet} remains available here: ${LINK_SLOT}`,
    ],
  },
  playful: {
    commentReply:
      "Your wish is my command 🪄 Check your DMs — it is waiting for you!",
    dmScript: [
      `You said "{keyword}", I deliver 📦 Your {leadMagnet} is here: ${LINK_SLOT}`,
      "Spill the tea ☕ what are you hoping to fix first? I have got ideas.",
      "Go enjoy your {leadMagnet}! Come back and tell me your favorite part 🎉",
    ],
    followUp: [
      "Psst… your {leadMagnet} is gathering dust 👀 open it!",
      `Okay, last one, I promise 😄 {leadMagnet} link, one more time: ${LINK_SLOT}`,
    ],
  },
  direct: {
    commentReply: "Sent. Check your DMs now.",
    dmScript: [
      `Here is your {leadMagnet}: ${LINK_SLOT}`,
      "What are you trying to achieve with it? I will point you to the right part.",
      "Questions? Ask. That is what I am here for.",
    ],
    followUp: [
      "Did you open the {leadMagnet}? Questions welcome.",
      `Final follow-up: {leadMagnet} — ${LINK_SLOT}`,
    ],
  },
};

/** 6 fixed setup steps. */
const SETUP_CHECKLIST: string[] = [
  "Publish the post or reel that offers your lead magnet, and state the keyword clearly in the caption or on-screen text.",
  "Pin a comment on that post explaining: comment the keyword to get the lead magnet in your DMs.",
  "Turn on Instagram message-request notifications so you notice new keyword comments quickly.",
  "Reply to each keyword comment publicly, then send the DM script manually — never use auto-send bots.",
  `Replace ${LINK_SLOT} with your real delivery link before sending.`,
  "Send the two follow-up messages 1 day and 3 days later, only to people who did not reply.",
];

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function isTone(value: unknown): value is Tone {
  return typeof value === "string" && (TONES as readonly string[]).includes(value);
}

function fill(template: string, leadMagnet: string, keyword: string): string {
  return template.split("{leadMagnet}").join(leadMagnet).split("{keyword}").join(keyword);
}

export function runTool(values: Record<string, unknown>): RunResult {
  const leadMagnetRaw = values["leadMagnet"];
  const keywordRaw = values["keyword"];
  const toneRaw = values["tone"];

  const leadMagnet = typeof leadMagnetRaw === "string" ? leadMagnetRaw.trim() : "";
  const keyword = typeof keywordRaw === "string" ? keywordRaw.trim() : "";

  if (!leadMagnet) {
    return { ok: false, error: "Please enter your lead magnet (the freebie you are giving away)." };
  }
  if (leadMagnet.length > MAX_LEAD_MAGNET_LEN) {
    return { ok: false, error: `Lead magnet name is too long (max ${MAX_LEAD_MAGNET_LEN} characters).` };
  }
  if (!keyword) {
    return { ok: false, error: "Please enter your trigger keyword." };
  }
  if (keyword.length > MAX_KEYWORD_LEN) {
    return { ok: false, error: `Keyword is too long (max ${MAX_KEYWORD_LEN} characters).` };
  }

  const tone: Tone = isTone(toneRaw) ? toneRaw : "friendly";
  const bank = SCRIPTS[tone];

  return {
    ok: true,
    values: {
      commentReply: fill(bank.commentReply, leadMagnet, keyword),
      dmScript: bank.dmScript.map((m) => fill(m, leadMagnet, keyword)),
      followUp: bank.followUp.map((m) => fill(m, leadMagnet, keyword)),
      setupChecklist: [...SETUP_CHECKLIST],
    },
  };
}
