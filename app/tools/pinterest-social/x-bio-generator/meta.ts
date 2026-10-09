import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/x-bio-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'whoYouAre',
    label: 'Who you are',
    type: 'text',
    required: true,
    placeholder: 'e.g. fitness coach for busy moms',
    validation: { max: 160 },
  },
  {
    id: 'whatYouDo',
    label: 'What you do',
    type: 'text',
    required: true,
    placeholder: 'e.g. 20-minute home workouts, no gym needed',
    validation: { max: 160 },
  },
  {
    id: 'cta',
    label: 'Call to action (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. DM me START for a free plan',
    validation: { max: 160 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'bioVariants',
    label: 'Bio variants',
    type: 'list',
    description: 'Free twitter bio generator 2026: 8 bio options, each within the 160-character bio limit. Instant, private, and mobile-friendly. No signup - try it free!',
  },
  {
    id: 'notes',
    label: 'Notes',
    type: 'list',
    description: 'Compression warnings and the link-field reminder.',
  },
];

export const content: ToolContent = {
  title: 'Twitter Bio Generator',
  description:
    'Generate Twitter bio ideas fast: enter who you are and what you do to get 160-character X bio variants with a CTA. Free, instant — write yours now!',
  howTo: [
    'Type who you are in the first field (for example, "fitness coach for busy moms").',
    'Type what you do in the second field (for example, "20-minute home workouts, no gym needed").',
    'Optionally add a call to action (for example, "DM me START for a free plan").',
    'Click run to get 8 bio variants — every one is checked to fit the 160-character bio limit.',
    'Pick your favorite, paste it into your X profile, and put your actual link in the profile website field, not the bio.',
  ],
  methodology:
    'This tool is a client-side template engine, not AI. It fills 12 fixed bio templates (pipe-separated, sentence-style, emoji-lead, and multi-line) with your inputs and returns a deterministic rotated slice of 8 variants — the rotation comes from a hash of your inputs, so the same inputs always give the same bios. Every variant is enforced to 160 characters or fewer: if your inputs are long, the CTA is dropped first, then the longest field is cut at a word boundary with an ellipsis.',
  examples: [
    {
      title: 'Fitness coach',
      inputs: {
        whoYouAre: 'fitness coach for busy moms',
        whatYouDo: '20-minute home workouts, no gym needed',
        cta: 'DM me START for a free plan',
      },
      note: 'Gets 8 bio variants mixing pipe, sentence, and emoji-lead styles.',
    },
    {
      title: 'Freelance designer',
      inputs: {
        whoYouAre: 'brand designer',
        whatYouDo: 'logos and visual identities for startups',
      },
      note: 'Gets 8 variants without a CTA — separators are cleaned up automatically.',
    },
  ],
  faqs: [
    {
      question: 'What is the best twitter bio generator?',
      answer:
        'The best generator gives you options you can actually use: multiple styles, every variant within the 160-character limit, and no signup. This tool returns 8 bio variants in pipe, sentence, emoji-lead, and multi-line styles from 12 fixed templates, so you can compare and pick.',
    },
    {
      question: 'Is there a free twitter bio generator?',
      answer:
        'Yes — this X Bio Generator is completely free with no signup. Enter who you are, what you do, and an optional call to action, and get 8 bio variants instantly in your browser.',
    },
    {
      question: 'How to generate twitter bio ideas?',
      answer:
        'Start with the two things a bio must say: who you are and what you do, then add one call to action. Run this tool to see those three pieces arranged in 8 different styles, pick the one that reads best, and keep your link in the profile website field instead of the bio text.',
    },
    {
      question: 'How does a twitter bio generator work?',
      answer:
        'You enter who you are, what you do, and an optional call to action. The tool fills 12 fixed bio templates with your words, picks a deterministic set of 8 variants, checks each against the 160-character limit (compressing long inputs first), and shows you the list. Everything runs in your browser — no AI, no accounts.',
    },
    {
      question: 'How does the twitter bio generator work?',
      answer:
        'Enter your details using the inputs above and the twitter bio generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the twitter bio generator free to use?',
      answer:
        'Yes - this twitter bio generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a twitter bio generator?',
      answer:
        'A twitter bio generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Bios are assembled from 12 fixed templates — the tool does not write original copy and cannot learn your voice.',
    'The 160-character cap is enforced by this tool as a conservative limit; very long inputs are compressed with a warning.',
    'Bios are plain text on X, so URLs belong in the profile website field, not in the bio.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Twitter Bio Generator 2026 – Free Generator | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free twitter bio generator 2026: 8 bio options, each within the 160-character bio limit. Instant, private, and mobile-friendly. No signup - try it free!',
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
          name: 'Pinterest & Social Tools',
          item: 'https://husnainblogger.com/tools/pinterest-social/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'X Bio Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
