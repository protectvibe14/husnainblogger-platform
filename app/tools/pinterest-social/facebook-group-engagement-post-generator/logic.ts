/**
 * Facebook Group Engagement Post Generator — pure logic (tool-400), zero
 * imports, zero network, zero DOM.
 *
 * FIXED TEMPLATE LIBRARY, NOT AI: returns post drafts from a hand-written
 * template library. 4 post types x 3 drafts = 12 templates, each with a
 * fixed follow-up tip. If the user picks a post type, all 3 drafts of that
 * type are returned; otherwise one draft per type (4 archetypes) is
 * returned. Posting itself is manual — this tool generates text only, no
 * automation.
 *
 * Drafts are conversation-led, never spammy: no engagement-bait wording
 * ("comment YES", "type AMEN", "like if you agree") appears anywhere.
 *
 * Deterministic: same inputs -> same outputs, always.
 */

export const POST_TYPES = ["welcome", "question", "poll", "discussion"] as const;
export type PostType = (typeof POST_TYPES)[number];
export const DRAFTS_PER_TYPE = 3;

export interface PostTemplate {
  type: PostType;
  draft: string;
  followUpTip: string;
}

/** The 12 hand-written draft templates with {groupType} placeholders. */
const DRAFT_TEMPLATES: PostTemplate[] = [
  // welcome
  {
    type: "welcome",
    draft:
      "Welcome to the {groupType} family! Tell us in the comments: what made you join, and what do you hope to get out of this group?",
    followUpTip: "Reply to every intro in the first 24 hours — early replies set the group's tone.",
  },
  {
    type: "welcome",
    draft:
      "New members, introduce yourselves! Share one thing about your {groupType} journey and one thing you're hoping to learn here.",
    followUpTip: "Pin this post weekly so every new wave of members gets welcomed.",
  },
  {
    type: "welcome",
    draft:
      "It's welcome Wednesday in our {groupType} community — drop a hello below and one fun fact about yourself. No selling, just connecting!",
    followUpTip: "Repeat on a schedule (weekly/monthly) so intros become a group ritual.",
  },
  // question
  {
    type: "question",
    draft:
      "Quick question for the {groupType} crowd: what's the ONE thing you wish you'd known when you were starting out?",
    followUpTip: "Summarize the best answers in a follow-up post — it rewards contributors.",
  },
  {
    type: "question",
    draft:
      "{groupType} friends, I need your advice: what would you do if you had to start over from zero today?",
    followUpTip: "Add your own answer first — posts with an existing comment get more replies.",
  },
  {
    type: "question",
    draft:
      "Honest poll of opinions: what's your biggest current struggle with {groupType}? Drop it below — no judgment zone.",
    followUpTip: "Use the answers to plan your next value post or live session.",
  },
  // poll
  {
    type: "poll",
    draft:
      "POLL: Which {groupType} topic should we cover in next week's post — A) beginner basics, B) advanced tactics, C) tools & resources?",
    followUpTip: "Actually publish the winning topic — polls die when results are ignored.",
  },
  {
    type: "poll",
    draft:
      "POLL for our {groupType} members: how often do you want live sessions — weekly, bi-weekly, or monthly?",
    followUpTip: "Keep polls to 2-4 options so voting stays effortless.",
  },
  {
    type: "poll",
    draft:
      "POLL: What's your experience level with {groupType}? Beginner / Intermediate / Advanced — vote so we can tailor content to you.",
    followUpTip: "Save the results — segment future content by the winning level.",
  },
  // discussion
  {
    type: "discussion",
    draft:
      "Let's talk {groupType}: share one win from this week, big or small. Celebrating progress keeps this community alive.",
    followUpTip: "React to and comment on wins — recognition drives repeat participation.",
  },
  {
    type: "discussion",
    draft:
      "Discussion thread: what's one {groupType} myth you used to believe? Let's bust them together in the comments.",
    followUpTip: "Jump in with your own myth first to lower the barrier to reply.",
  },
  {
    type: "discussion",
    draft:
      "Open thread for {groupType} questions — stuck on something? Ask below and let's crowdsource the answer.",
    followUpTip: "Answer quickly yourself if nobody does — an empty thread kills future ones.",
  },
];

export const BANK_SIZES = {
  postTypes: POST_TYPES.length,
  draftsPerType: DRAFTS_PER_TYPE,
  total: POST_TYPES.length * DRAFTS_PER_TYPE,
};

function isPostType(s: string): s is PostType {
  return (POST_TYPES as readonly string[]).includes(s);
}

function render(template: string, groupType: string): string {
  return template.split("{groupType}").join(groupType);
}

export interface GeneratePostsResult {
  templates: PostTemplate[];
}

/**
 * Generate engagement post drafts. With a postType, returns that type's 3
 * drafts; without, returns one draft per type (4 archetypes). Throws on
 * invalid input.
 */
export function generatePosts(groupType: string, postType?: string): GeneratePostsResult {
  if (typeof groupType !== "string" || groupType.trim().length === 0) {
    throw new Error("Group type is required — e.g. fitness beginners, sourdough bakers.");
  }
  const cleanGroupType = groupType.trim();

  let selected: PostType[] = [...POST_TYPES];
  if (postType !== undefined && postType !== null && postType !== "") {
    if (typeof postType !== "string") {
      throw new Error(`Post type must be one of: ${POST_TYPES.join(", ")}.`);
    }
    const normalized = postType.trim().toLowerCase();
    if (!isPostType(normalized)) {
      throw new Error(`Post type must be one of: ${POST_TYPES.join(", ")}.`);
    }
    selected = [normalized];
  }

  const singleType = selected.length === 1;
  const templates: PostTemplate[] = [];
  for (const type of selected) {
    const bank = DRAFT_TEMPLATES.filter((t) => t.type === type);
    // With a chosen post type: all 3 drafts. Without: 1 draft per type (4 archetypes).
    const drafts = singleType ? bank : bank.slice(0, 1);
    for (const t of drafts) {
      templates.push({
        type,
        draft: render(t.draft, cleanGroupType),
        followUpTip: t.followUpTip,
      });
    }
  }
  return { templates };
}

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

/** Platform entry point (generator). values: { groupType, postType? }. */
export function runTool(values: Record<string, unknown>): RunToolResult {
  try {
    const groupType = values["groupType"];
    if (typeof groupType !== "string" || groupType.trim().length === 0) {
      return { ok: false, error: "Group type is required — e.g. fitness beginners, sourdough bakers." };
    }
    const postType = values["postType"];
    if (postType !== undefined && postType !== null && postType !== "" && typeof postType !== "string") {
      return { ok: false, error: `Post type must be one of: ${POST_TYPES.join(", ")}.` };
    }

    const result = generatePosts(groupType, typeof postType === "string" ? postType : undefined);
    const lines = result.templates.map(
      (t) => `Type: ${t.type}\nDraft: ${t.draft}\nFollow-up tip: ${t.followUpTip}`
    );
    return {
      ok: true,
      values: {
        templates: lines,
        count: result.templates.length,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }
}
