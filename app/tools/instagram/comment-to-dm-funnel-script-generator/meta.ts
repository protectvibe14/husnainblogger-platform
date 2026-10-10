import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/comment-to-dm-funnel-script-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'leadMagnet',
    label: 'Lead magnet (your freebie)',
    type: 'text',
    required: true,
    placeholder: 'e.g. Free Reels Hooks PDF',
    validation: { max: 80 },
  },
  {
    id: 'keyword',
    label: 'Trigger keyword',
    type: 'text',
    required: true,
    placeholder: 'e.g. HOOKS',
    validation: { max: 30 },
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: false,
    options: ['friendly', 'professional', 'playful', 'direct'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'commentReply',
    label: 'Public comment reply',
    type: 'text',
    description:
    'Free comment dm automation script 2026: What to reply publicly when someone comments your trigger keyword. Fast, private now.',
  },
  {
    id: 'dmScript',
    label: 'DM message sequence',
    type: 'list',
    description:
    'Three DM messages in order: delivery, engagement question, soft CTA — with a link slot you fill in.',
  },
  {
    id: 'followUp',
    label: 'Follow-up messages',
    type: 'list',
    description:
    'Two follow-up DMs to send 1 day and 3 days later to non-responders.',
  },
  {
    id: 'setupChecklist',
    label: 'Funnel setup checklist',
    type: 'list',
    description:
    'Six setup steps for the post, keyword, notifications, and manual sending.',
  },
];

export const content: ToolContent = {
  title: 'Comment DM Automation Script',
  description:
    'Build a DM funnel with this free comment dm automation script tool. Enter your lead magnet and keyword for reply, DM and follow-up scripts.',
  howTo: [
    'Enter your lead magnet — the freebie people get (up to 80 characters).',
    'Enter your trigger keyword — the word followers comment to start the funnel (single word works best).',
    'Pick a tone: friendly, professional, playful, or direct.',
    'Run the tool to get your public comment reply, 3-message DM sequence, 2 follow-ups, and setup checklist.',
    'Replace [paste your link here] with your real link and send every message manually — never use auto-send bots.',
  ],
  methodology:
    'The tool assembles scripts from a fixed bank of 24 hand-written scripts (4 tones x 6: one comment reply, three DM messages, two follow-ups) plus 6 fixed setup steps — no AI and no automation. It fills your lead magnet name and trigger keyword into the placeholders and leaves a link slot for you to fill before sending.',
  examples: [
    {
      title: 'Reels hooks PDF funnel',
      inputs: { leadMagnet: 'Free Reels Hooks PDF', keyword: 'HOOKS', tone: 'friendly' },
      note: 'Warm funnel for a creator audience.',
    },
    {
      title: 'Consulting lead magnet, direct tone',
      inputs: { leadMagnet: 'Free Audit Checklist', keyword: 'AUDIT', tone: 'direct' },
      note: 'No-fluff funnel for a B2B audience.',
    },
    {
      title: 'Fitness freebie, playful tone',
      inputs: { leadMagnet: '7-Day Meal Plan', keyword: 'MEALS', tone: 'playful' },
      note: 'Playful funnel for a lifestyle audience.',
    },
  ],
  faqs: [
    {
      question: 'What is the best comment dm automation script?',
      answer:
        'The best funnel has three parts: a public comment reply that confirms the DM is coming, a short DM sequence (deliver the freebie, ask one engaging question, soft CTA), and one or two follow-ups. This free tool writes all three for your lead magnet and keyword.',
    },
    {
      question: 'Is there a free comment dm automation script?',
      answer:
        'Yes — this comment-to-DM script generator is completely free with no signup. You get the comment reply, a 3-message DM sequence, 2 follow-ups, and a setup checklist in four tones.',
    },
    {
      question: 'How to use comment dm automation?',
      answer:
        'Pick a trigger keyword, publish a post offering your lead magnet, then reply to keyword comments and DM the freebie. This tool gives you the scripts and a setup checklist — but you send every message manually; Instagram does not allow automated messaging.',
    },
    {
      question: 'How does a comment dm automation script work?',
      answer:
        'A follower comments your keyword, you reply publicly, then you send them the lead magnet in DMs followed by one engaging question and a soft CTA, with follow-ups for non-responders. This tool writes the scripts; you run the funnel by hand.',
    },
    {
      question: 'What is a comment dm automation script?',
      answer:
        'A comment dm automation script is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Scripts only — the tool does not send messages automatically. Instagram forbids automated messaging; every DM is sent manually by you.',
    'Single-word keywords work best as triggers; multi-word keywords are accepted but harder for followers to type correctly.',
  ],
  jsonLd: [],
};
