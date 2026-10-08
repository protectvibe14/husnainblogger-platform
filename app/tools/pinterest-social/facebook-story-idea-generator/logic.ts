/**
 * facebook-story-idea-generator — logic.ts
 *
 * Fixed idea-library engine. NOT AI: story ideas are picked from a FIXED bank
 * of 32 hand-written story ideas — 8 per goal (poll, Q&A, behind the scenes,
 * promo) — each with 3–5 frame prompts and an interactive sticker suggestion.
 *
 * Fixed banks (documented for honesty):
 *   - IDEAS: 4 goals x 8 ideas = 32 ideas, each { concept, frames[3-5], sticker }.
 *   - Every run returns the same 8 ideas for the chosen goal (deterministic).
 *
 * Honesty: ideas are designed for the 1080x1920 vertical canvas and suggest
 * native Facebook stickers (poll, question, link) — canvas framing guidance
 * is generic best practice, not a verified spec claim.
 */

interface StoryIdea {
  concept: string;
  frames: string[];
  sticker: string;
}

const IDEAS: Record<string, StoryIdea[]> = {
  poll: [
    {
      concept: 'This-or-that product poll',
      frames: [
        'Intro: "Help me pick — vote now!"',
        'Frame for option A with a photo',
        'Frame for option B with a photo',
        'Next day: share the winning result',
      ],
      sticker: 'Poll sticker with your two options',
    },
    {
      concept: 'New drop vote',
      frames: [
        'Tease: "Something new is coming…"',
        'Show two color/style variants side by side',
        'Ask which one should launch first',
        'Thank-you frame announcing the winner',
      ],
      sticker: 'Poll sticker with variant names',
    },
    {
      concept: 'Best posting-time poll',
      frames: [
        '"When do you watch my stories?" intro',
        'Option 1: morning',
        'Option 2: evening',
        'Share results + promise to post at the winning time',
      ],
      sticker: 'Poll sticker with time options',
    },
    {
      concept: 'Weekend plans poll',
      frames: [
        'Friday intro: "What are you up to this weekend?"',
        'Option frames with fun emoji visuals',
        'Reply to voters with personal reactions',
        'Monday recap of the winning answer',
      ],
      sticker: 'Poll sticker with plan options',
    },
    {
      concept: 'Price-point poll',
      frames: [
        '"Quick question for shoppers" intro',
        'Show the product in use',
        'Two price frames: "fair price?" A vs B',
        'Reveal what you decided and why',
      ],
      sticker: 'Poll sticker with two price options',
    },
    {
      concept: 'Content vote poll',
      frames: [
        '"You pick my next story series"',
        'Topic A preview frame',
        'Topic B preview frame',
        'Announce the winner + start the series',
      ],
      sticker: 'Poll sticker with topic options',
    },
    {
      concept: 'Myth vs fact poll',
      frames: [
        'Statement frame: "True or false?"',
        'Give 10 seconds to vote',
        'Reveal the correct answer with a quick explanation',
        'Follow-up: "Want more of these?"',
      ],
      sticker: 'Poll sticker with "True" / "False"',
    },
    {
      concept: 'Launch-date poll',
      frames: [
        '"Pick our launch day" announcement',
        'Date option A frame',
        'Date option B frame',
        'Countdown frame for the winning date',
      ],
      sticker: 'Poll sticker with date options',
    },
  ],
  qanda: [
    {
      concept: 'Open AMA session',
      frames: [
        '"Ask me anything — answering all day"',
        'Share your face + a personal fact to warm up',
        'Answer questions in batches of 3–4',
        'Close: "Thanks for asking — more tomorrow?"',
      ],
      sticker: 'Question sticker with a prompt',
    },
    {
      concept: 'Myth-busting Q&A',
      frames: [
        '"What myth should I bust?"',
        'Collect questions overnight',
        'Answer 3 myths with quick demos',
        'Recap the biggest takeaway',
      ],
      sticker: 'Question sticker asking for myths',
    },
    {
      concept: 'Customer spotlight Q&A',
      frames: [
        'Intro the customer you will interview',
        'Ask followers to submit questions for them',
        'Film the customer answering on camera',
        'Thank-you frame tagging the customer',
      ],
      sticker: 'Question sticker for follower questions',
    },
    {
      concept: 'Expert mini-interview',
      frames: [
        'Tease the guest and their expertise',
        'Collect audience questions',
        'Post the guest answers across 3 frames',
        'CTA: follow the guest',
      ],
      sticker: 'Question sticker for audience questions',
    },
    {
      concept: 'Rapid-fire Q&A',
      frames: [
        '"60 seconds, as many answers as I can"',
        'Timer-style quick answers, one per frame',
        'Funny outtake frame',
        '"Drop more questions for part 2"',
      ],
      sticker: 'Question sticker collecting questions first',
    },
    {
      concept: 'Beginner questions answered',
      frames: [
        '"New here? Start with these"',
        'Answer the 3 most common beginner questions',
        'Point to a saved highlight for more',
        'Invite follows for weekly beginner tips',
      ],
      sticker: 'Question sticker: "What confuses you most?"',
    },
    {
      concept: 'Behind-the-decision Q&A',
      frames: [
        '"Why did we change X? Ask away"',
        'Share the backstory in one frame',
        'Answer the toughest questions honestly',
        'Close with what is changing next',
      ],
      sticker: 'Question sticker inviting tough questions',
    },
    {
      concept: 'Weekly FAQ roundup',
      frames: [
        '"Your top questions this week"',
        'Answer #3, #2, #1 across three frames',
        'Save frame: "All answers in highlights"',
      ],
      sticker: 'Question sticker for next week\u2019s questions',
    },
  ],
  'behind-scenes': [
    {
      concept: 'Day-in-the-life reel-style story',
      frames: [
        'Morning: desk/workspace setup',
        'Midday: the real work, unfiltered',
        'Afternoon: a small win or blooper',
        'Evening wrap-up + "see you tomorrow"',
      ],
      sticker: 'Question sticker: "What should I show next?"',
    },
    {
      concept: 'Packing / process story',
      frames: [
        'Start: "Packing today\u2019s orders with me"',
        'Close-ups of each step',
        'Finished package + thank-you note',
        'Drop-off or shipping frame',
      ],
      sticker: 'Poll sticker: "Want a part 2?"',
    },
    {
      concept: 'Workspace tour',
      frames: [
        '"Tour my setup in 4 frames"',
        'Desk close-up',
        'Favorite tool close-up',
        'The messy corner (be honest)',
        'Ask what to upgrade next',
      ],
      sticker: 'Poll sticker with upgrade options',
    },
    {
      concept: 'Before the launch',
      frames: [
        'Tease: "Launch day prep"',
        'Checklist frame of what is left',
        'Late-night work-in-progress shot',
        'Morning-of launch announcement',
      ],
      sticker: 'Question sticker: "Any guesses?"',
    },
    {
      concept: 'Team intro story',
      frames: [
        '"Meet the team" intro',
        'One frame per person: name + role + fun fact',
        'Group photo or candid shot',
        'Ask which teammate to interview next',
      ],
      sticker: 'Question sticker: "Questions for the team?"',
    },
    {
      concept: 'Ingredient / materials story',
      frames: [
        'Lay out your materials flat-lay style',
        'Name each one and why you chose it',
        'Show the transformation starting',
        'Reveal the finished piece',
      ],
      sticker: 'Poll sticker: "Which material next?"',
    },
    {
      concept: 'Mistake-and-fix story',
      frames: [
        '"This went wrong today…"',
        'Show the mistake honestly',
        'Show the fix step by step',
        'Lesson learned frame',
      ],
      sticker: 'Question sticker: "Ever had this happen?"',
    },
    {
      concept: 'Planning session story',
      frames: [
        'Whiteboard or notebook planning shot',
        'Talk through this week\u2019s plan',
        'Cross off one completed item',
        'Invite followers to hold you accountable',
      ],
      sticker: 'Poll sticker: "Should I post the results?"',
    },
  ],
  promo: [
    {
      concept: 'Flash sale countdown',
      frames: [
        '"24-hour sale starts now"',
        'Show the hero product in use',
        'Discount + code frame',
        'Last-call frame with link',
      ],
      sticker: 'Link sticker to the sale page',
    },
    {
      concept: 'New product reveal',
      frames: [
        'Teaser close-up (mystery crop)',
        'Full reveal frame',
        'Feature callouts across 2 frames',
        'Shop-now frame with link',
      ],
      sticker: 'Link sticker to the product page',
    },
    {
      concept: 'Testimonial promo',
      frames: [
        'Customer quote, big text',
        'Photo of the customer or their result',
        'Your short comment on the story',
        'Try-it-yourself frame with link',
      ],
      sticker: 'Link sticker to reviews or the product',
    },
    {
      concept: 'Bundle / limited offer',
      frames: [
        '"Only 20 bundles available"',
        'Show everything inside the bundle',
        'Price breakdown frame',
        'Claim-yours frame with link',
      ],
      sticker: 'Link sticker to the bundle page',
    },
    {
      concept: 'Freebie lead-in promo',
      frames: [
        'Offer a free sample/checklist/guide',
        'Show what is inside',
        'How to claim (one step)',
        'Link frame + "share with a friend"',
      ],
      sticker: 'Link sticker to the freebie',
    },
    {
      concept: 'Event ticket promo',
      frames: [
        'Event name + date, bold text',
        'What attendees get (3 bullets)',
        'Speaker/guest highlight frame',
        'Get-tickets frame with link',
      ],
      sticker: 'Link sticker to the ticket page',
    },
    {
      concept: 'Seasonal sale story',
      frames: [
        'Seasonal hook ("Fall refresh sale")',
        'Top 3 picks, one per frame',
        'Discount code reminder',
        'Swipe-up-style link frame',
      ],
      sticker: 'Link sticker to the collection',
    },
    {
      concept: 'Last-chance restock',
      frames: [
        '"Back in stock — almost gone"',
        'Show the product + stock count style',
        'Why people love it (one review)',
        'Buy-now frame with link',
      ],
      sticker: 'Link sticker to the product page',
    },
  ],
};

const CANVAS_NOTE =
  'Design every frame for the 1080x1920 vertical canvas: keep key text in the ' +
  'center safe zone (the top and bottom ~250px can be covered by Facebook\u2019s ' +
  'interface), use large readable type, and add one interactive sticker per ' +
  'story — poll, question, or link stickers lift taps and replies.';

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const goalRaw = values['goal'];
  const goal = typeof goalRaw === 'string' ? goalRaw.trim() : '';
  if (goal.length === 0) {
    return { ok: false, error: 'Pick a story goal — poll, Q&A, behind the scenes, or promo.' };
  }
  if (!(goal in IDEAS)) {
    return {
      ok: false,
      error: 'Unknown story goal. Choose one of: poll, Q&A, behind the scenes, promo.',
    };
  }

  const ideas = IDEAS[goal] as StoryIdea[];
  const rows: string[][] = ideas.map(function (idea) {
    const numbered = idea.frames
      .map(function (f, i) { return String(i + 1) + '. ' + f; })
      .join(' ');
    return [idea.concept, numbered, idea.sticker];
  });

  return {
    ok: true,
    values: {
      storyIdeas: {
        columns: ['Story concept', 'Frames (3–5 each)', 'Sticker suggestion'],
        rows: rows,
      },
      canvasNote: CANVAS_NOTE,
    },
  };
}
