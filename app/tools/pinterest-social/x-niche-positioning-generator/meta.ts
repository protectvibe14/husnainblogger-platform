import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/x-niche-positioning-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. email marketing',
    validation: { min: 2, max: 80 },
  },
  {
    id: 'audience',
    label: 'Your audience',
    type: 'text',
    required: true,
    placeholder: 'e.g. busy founders',
    validation: { min: 2, max: 80 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'positioningStatements',
    label: 'Positioning statements',
    type: 'list',
    description:
    'Free twitter niche statement 2026: 5 bio-ready positioning lines, each 160 characters or fewer. Get instant results. free now.',
  },
];

export const content: ToolContent = {
  title: 'Twitter Niche Statement',
  description:
    'Write a twitter niche statement fast: enter your niche and audience to get 5 bio-ready positioning lines under 160 characters. Position yourself now.',
  howTo: [
    'Type your niche in the "Your niche" field (e.g. "email marketing").',
    'Describe your audience in the "Your audience" field (e.g. "busy founders").',
    'Click Generate to get 5 positioning statements from the fixed frame bank.',
    'Read the "Positioning statements" list — every line fits X\'s 160-character bio limit.',
    'Pick the one that sounds most like you and paste it into your X bio.',
    'Re-run with a sharper audience description if none of the 5 feel specific enough.',
  ],
  methodology:
    'The generator fills 10 fixed positioning frames (each stating one clear promise) with your niche and audience text, then picks 5 consecutive frames from a deterministic offset based on your inputs — identical inputs always give identical statements. Any statement over 160 characters is trimmed at a word boundary with an ellipsis. No AI — fixed frames and documented rules.',
  examples: [
    {
      title: 'Marketer targeting founders',
      inputs: { niche: 'email marketing', audience: 'busy founders' },
      note: 'Gets 5 lines like "I help busy founders win at email marketing — no fluff, just what works."',
    },
    {
      title: 'Coach targeting beginners',
      inputs: { niche: 'home workouts', audience: 'total beginners' },
      note: 'Gets 5 beginner-focused positioning lines, all bio-ready at 160 characters or fewer.',
    },
  ],
  faqs: [
    {
      question: 'What is the best twitter niche statement?',
      answer:
        'The best niche statement names your audience, your topic, and one clear promise in under 160 characters. This free generator gives you 5 bio-ready options from fixed frames — pick the one that sounds most like you and test it against your actual profile visits.',
    },
    {
      question: 'Is there a free twitter niche statement?',
      answer:
        'Yes — this generator is completely free with no signup. Enter your niche and audience to get 5 positioning statements, each guaranteed to fit X\'s 160-character bio limit.',
    },
    {
      question: 'How to use twitter niche statement?',
      answer:
        'Enter your niche and audience, pick one of the 5 generated lines, and paste it into your X profile bio (or the first line of your pinned post). A clear statement tells profile visitors exactly who you help and why they should follow.',
    },
    {
      question: 'How does a twitter niche statement work?',
      answer:
        'The tool fills 10 fixed one-promise frames with your niche and audience, deterministically selects 5, and enforces the 160-character bio limit by trimming at a word boundary. No AI is involved — it is template assembly from a documented frame bank.',
    },
    {
      question: 'What is a twitter niche statement?',
      answer:
        'A twitter niche statement is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Can I customize the generated twitter niche statement?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
    {
      question: 'How do I create twitter niche statement?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
  ],
  assumptions: [
    'The 10 frames are generic one-promise templates — sharpen the audience input for more specific-sounding output.',
    'Statements over 160 characters are trimmed at a word boundary with an ellipsis, which only triggers with unusually long niche/audience text.',
    'A generated line is a starting point, not a tested bio — validate with real profile-visit and follow data on X.',
  ],
  jsonLd: [],
};
