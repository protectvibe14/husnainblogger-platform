import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/email-marketing/newsletter-sponsorship-pitch-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'newsletterName',
    label: "Newsletter name",
    type: 'text',
    required: true,
    placeholder: 'e.g. The Dev Brief',
  },
  {
    id: 'subscribers',
    label: 'Subscriber count',
    type: 'number',
    required: true,
    placeholder: 'e.g. 10000',
    validation: { min: 1 },
  },
  {
    id: 'openRate',
    label: 'Open rate (%) — optional',
    type: 'number',
    required: false,
    placeholder: 'e.g. 42',
    validation: { min: 0, max: 100 },
  },
  {
    id: 'audience',
    label: 'Audience description',
    type: 'text',
    required: true,
    placeholder: 'e.g. software developers interested in AI tooling',
  },
  {
    id: 'adFormats',
    label: 'Ad formats (comma-separated)',
    type: 'text',
    required: true,
    placeholder: 'e.g. Classified ad, Dedicated email, Sponsored section',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'pitchEmail',
    label: 'Pitch email (copy)',
    type: 'copy',
    description:
    'Free newsletter sponsorship pitch 2026: Ready-to-personalize outreach email to sponsors. free.',
  },
  {
    id: 'rateCardSnippet',
    label: 'Rate-card snippet (copy)',
    type: 'copy',
    description:
    'Ad-format list with [YOUR RATE] placeholders to fill in.',
  },
  {
    id: 'notices',
    label: 'Notes',
    type: 'list',
    description:
    'Truncation notes.',
  },
];

export const content: ToolContent = {
  title: 'Newsletter Sponsorship Pitch',
  description:
    'Write a newsletter sponsorship pitch fast — turn your stats and ad formats into an outreach email and a rate card. Free Create your pitch now.',
  howTo: [
    'Enter your newsletter’s name and describe its audience in one line.',
    'Add your subscriber count and, if you know it, your average open rate.',
    'List the ad formats you sell, comma-separated (Classified ad, Dedicated email, Sponsored section, Header banner, Footer banner, Primary sponsorship).',
    'Run the tool to get your outreach email and rate-card snippet.',
    'Replace the bracketed placeholders ([Brand], [First Name], [YOUR RATE]) with real details before sending.',
  ],
  methodology:
    'The pitch is assembled from one fixed email template and one fixed rate-card template filled with the stats you provide — no AI writing is involved. This tool pitches YOUR newsletter’s ad slots TO sponsors (outreach to sell your own inventory), which is different from a general sponsorship-ask email. Rate lines carry [YOUR RATE] placeholders for you to fill in; the tool never invents prices.',
  examples: [
    {
      title: '10k-subscriber tech newsletter',
      inputs: {
        newsletterName: 'The Dev Brief',
        subscribers: 10000,
        openRate: 42,
        audience: 'software developers interested in AI tooling',
        adFormats: 'Classified ad, Sponsored section',
      },
      note: 'Pitch email referencing a 42% open rate and two ad formats.',
    },
    {
      title: 'No open rate yet',
      inputs: {
        newsletterName: 'Slow Mornings',
        subscribers: 2500,
        audience: 'remote workers who love slow living',
        adFormats: 'Dedicated email',
      },
      note: 'Works without an open rate — that line is simply omitted.',
    },
  ],
  faqs: [
    {
      question: 'What is the best newsletter sponsorship pitch?',
      answer:
        'The best newsletter sponsorship pitch is short, specific, and led by your numbers — subscriber count, open rate, and a clear list of ad formats. This tool builds that structure for you from one fixed template; you add the personal details and rates.',
    },
    {
      question: 'Is there a free newsletter sponsorship pitch?',
      answer:
        'Yes — this newsletter sponsorship pitch generator is free with no signup. Generate the outreach email and rate-card snippet, then replace the bracketed placeholders before sending.',
    },
    {
      question: 'How to use newsletter sponsorship pitch?',
      answer:
        'Fill in your newsletter’s stats and ad formats, run the tool, and copy the pitch email. Personalize the bracketed placeholders — brand name, contact name, your rates — and send it to sponsors whose audience overlaps yours.',
    },
    {
      question: 'Can ecommerce newsletters use this pitch generator?',
      answer:
        'Yes — describe your buyer audience in the audience field and list the ad formats you sell. Sponsors care about who reads you, so the more specific your audience description, the stronger the pitch.',
    },
    {
      question: 'What is a newsletter sponsorship pitch?',
      answer:
        'A newsletter sponsorship pitch is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'What makes a good newsletter sponsorship pitch?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
    {
      question: 'Can I customize the generated newsletter sponsorship pitch?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
  ],
  assumptions: [
    'The tool never invents prices — [YOUR RATE] placeholders must be filled in by you.',
    'Open rate is optional; omit it rather than guessing a number you cannot back up.',
    'This pitches your newsletter’s ad slots to sponsors; for asking a brand to sponsor you in general, use a general sponsorship-ask template instead.',
  ],
  jsonLd: [],
};
