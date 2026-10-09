import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/carousel-hook-slide-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Carousel topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. budget travel, sourdough baking, home workouts',
  },
  {
    id: 'angle',
    label: 'Hook angle',
    type: 'select',
    required: true,
    options: ['mistake', 'myth', 'steps', 'list', 'story'],
  },
  {
    id: 'count',
    label: 'Number of hooks',
    type: 'number',
    required: true,
    placeholder: '5',
    validation: { min: 1, max: 10 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'hooks',
    label: 'Hook options',
    type: 'list',
    description: 'Free carousel hook ideas 2026: First-slide hook texts for your chosen angle, each with a visual note. Get instant results. No signup - try it free now!',
  },
  {
    id: 'copyAll',
    label: 'Copy all hooks',
    type: 'copy',
    description: 'All hook options as plain text, ready to paste into your design tool.',
  },
];

export const content: ToolContent = {
  title: 'Carousel Hook Ideas',
  description:
    'Get free carousel hook ideas for your Instagram cover slide. Pick a topic and angle to get scroll-stopping hook options with visual notes. Try it now!',
  howTo: [
    'Type your carousel topic into the "Carousel topic" field (e.g. budget travel).',
    'Choose a hook angle: mistake, myth, steps, list, or story.',
    'Set "Number of hooks" between 1 and 10 and run the tool.',
    'Pick your favorite hook from the "Hook options" list and apply the visual note to your cover slide design.',
    'Use "Copy all hooks" to paste the full set into your content doc for later.',
  ],
  methodology:
    'This tool assembles hooks from a fixed bank of 25 hand-written hook templates (5 per angle: mistake, myth, steps, list, story) with your topic inserted — it cycles the bank in order when you ask for more than 5 hooks. Nothing is written by AI; every hook comes from the template bank and every visual note is fixed design guidance.',
  examples: [
    {
      title: 'Myth-angle hooks for email marketing',
      inputs: { topic: 'email marketing', angle: 'myth', count: 3 },
      note: 'Returns 3 first-slide myth-busting hooks with visual notes.',
    },
    {
      title: 'Steps-angle hooks for meal prep',
      inputs: { topic: 'meal prep', angle: 'steps', count: 5 },
      note: 'Returns all 5 steps-angle hook templates with your topic inserted.',
    },
    {
      title: 'Story-angle hooks for skincare',
      inputs: { topic: 'skincare', angle: 'story', count: 8 },
      note: 'Cycles the 5-template story bank to produce 8 options in bank order.',
    },
  ],
  faqs: [
    {
      question: 'What is the best carousel hook ideas?',
      answer:
        'The best carousel hook ideas stop the scroll in under 3 seconds with a bold, specific promise on slide 1 — mistake, myth, and story angles tend to earn the most saves. This free generator gives you up to 10 hook options per topic from a fixed template bank, each with a visual note for your cover slide.',
    },
    {
      question: 'Is there a free carousel hook ideas?',
      answer:
        'Yes — this carousel hook generator is completely free with no signup. You can generate up to 10 hook options per run, in any of the 5 angles, as many times as you like.',
    },
    {
      question: 'How to use carousel hook?',
      answer:
        'Enter your carousel topic, pick a hook angle, and choose how many hooks you want. Copy your favorite hook, place it as the headline on your carousel cover slide, and keep it under ~12 words in high contrast so it stops the scroll.',
    },
    {
      question: 'How does a carousel hook ideas work?',
      answer:
        'It takes your topic and angle, then fills hand-written hook templates from a fixed 25-template bank — cycling the bank in order if you request more than 5. No AI is involved; the output is template assembly with your topic inserted.',
    },
    {
      question: 'How does the carousel hook ideas work?',
      answer:
        'Enter your details using the inputs above and the carousel hook ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the carousel hook ideas free to use?',
      answer:
        'Yes - this carousel hook ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a carousel hook ideas?',
      answer:
        'A carousel hook ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Hooks come from a fixed bank of 25 templates (5 per angle) — options beyond 5 per angle repeat the bank in order.',
    'Visual notes are general design guidance, not guarantees of performance.',
    'Adapt the wording to your voice and audience before publishing.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Carousel Hook Ideas 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free carousel hook ideas 2026: First-slide hook texts for your chosen angle, each with a visual note. Get instant results. No signup - try it free now!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Instagram Tools',
          item: 'https://husnainblogger.com/tools/instagram/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Carousel Hook Slide Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
