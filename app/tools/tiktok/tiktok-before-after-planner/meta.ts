import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-before-after-planner/';

export const inputs: ToolInput[] = [
  {
    id: 'transformationTopic',
    label: 'Transformation topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. my messy desk setup',
    validation: { max: 150 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'shotList', label: 'Shot list', type: 'list' },
  { id: 'transitionPoint', label: 'Transition idea', type: 'text' },
  { id: 'caption', label: 'Caption', type: 'copy' },
  { id: 'cta', label: 'Call to action', type: 'text' },
  { id: 'honestyNote', label: 'Honesty reminder', type: 'text' },
];

export const content: ToolContent = {
  title: 'Before and After TikTok Ideas',
  description:
    'Plan before and after tiktok ideas: 7-shot list, transition point, caption, and CTA from one topic. Includes an honesty note against fake results. Try it free!',
  howTo: [
    'Enter your transformationTopic — one clear transformation, e.g. "my messy desk setup".',
    'Run the tool to get a fixed 7-shot plan: before, process shots, halfway tease, transition, reveal, close-up, and CTA frame.',
    'Pick up the suggested transitionPoint (e.g. a hand-swipe cut) for the before-to-after moment.',
    'Copy the generated caption and adapt it with your real details before posting.',
    'Deliver the suggested cta line on camera with the after result on screen.',
    'Read the honestyNote every time: film your own before and after in the same light and angle — never fake it.',
  ],
  methodology:
    'This is a fixed template planner, not AI: one 7-beat shot plan is fixed for every topic, and the transition, caption, and CTA are picked from fixed banks (8 transitions, 6 captions, 6 CTAs) by a deterministic hash of the topic, so the same topic always yields the same plan. Every run also emits the same fixed honesty reminder against doctored or AI-generated before/afters.',
  examples: [
    {
      title: 'Desk glow-up',
      inputs: { transformationTopic: 'my messy desk setup' },
      note: 'A 7-shot plan with a hand-swipe transition, caption, and follow CTA.',
    },
    {
      title: 'Balcony garden',
      inputs: { transformationTopic: 'my tiny balcony garden' },
      note: 'Same structure — topic-specific shots, caption, and transition pick.',
    },
  ],
  faqs: [
    {
      question: 'What is the best before and after tiktok ideas?',
      answer:
        'The best before/after videos film a real transformation: an honest before shot, process footage, a tease before the reveal, and the after in the same light and angle. This planner gives you that 7-shot structure from one topic — the transformation itself is yours to film.',
    },
    {
      question: 'Is there a free before and after tiktok ideas?',
      answer:
        'Yes — this planner is free and runs entirely in your browser. Enter one transformation topic and get a shot list, transition idea, caption, and CTA with no signup.',
    },
    {
      question: 'How to use before and after tiktok?',
      answer:
        'Enter your transformation topic, then film the 7 shots in order — especially the before shot in the same light and angle as the planned after shot. Use the suggested transition at the reveal moment and post with the generated caption.',
    },
    {
      question: 'How does a before and after tiktok ideas work?',
      answer:
        'It works on contrast and curiosity: viewers watch the process to earn the reveal. The planner structures that arc with templates; what makes it land is real footage — faked before/afters break trust, which is why every plan includes an honesty reminder.',
    },
    {
      question: 'How does the before and after tiktok ideas work?',
      answer:
        'Enter your details using the inputs above and the before and after tiktok ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the before and after tiktok ideas free to use?',
      answer:
        'Yes - this before and after tiktok ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a before and after tiktok ideas?',
      answer:
        'A before and after tiktok ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Template-based, not AI: the tool plans the video structure — it cannot film, verify, or invent your transformation.',
    'The honesty reminder is fixed text; following it is your responsibility when you post.',
    'One topic per run, max 150 characters; the same topic always produces the same plan.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Before and After TikTok Ideas 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Plan before and after tiktok ideas: 7-shot list, transition point, caption, and CTA from one topic. Includes an honesty note against fake results. Try it free!',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'TikTok Tools',
          item: 'https://husnainblogger.com/tools/tiktok/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'TikTok Before/After Planner',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
