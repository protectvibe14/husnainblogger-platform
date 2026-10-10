import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/email-marketing/email-signup-copy-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'incentive',
    label: 'Incentive',
    type: 'text',
    required: true,
    placeholder: 'e.g. free SEO checklist',
  },
  {
    id: 'placement',
    label: 'Placement',
    type: 'select',
    required: true,
    options: ['popup', 'inline', 'landing', 'sidebar'],
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['friendly', 'professional', 'playful', 'urgent'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'headlines',
    label: 'Headline options',
    type: 'list',
    description:
    'Free email signup copy generator 2026: 4 signup-form headline options assembled from fixed templates. Get instant results. free now.',
  },
  {
    id: 'subtexts',
    label: 'Subtext options',
    type: 'list',
    description:
    '3 supporting subtext options assembled from fixed templates.',
  },
  {
    id: 'buttons',
    label: 'Button text options',
    type: 'list',
    description:
    '5 call-to-action button text options assembled from fixed templates.',
  },
  {
    id: 'notices',
    label: 'Notices',
    type: 'list',
    description:
    'Notices about input adjustments such as truncation.',
  },
];

export const content: ToolContent = {
  title: 'Email Signup Copy Generator',
  description:
    'Grow your list faster with better opt-in copy: enter your freebie, placement, and tone for headlines and button text that converts. Try it now!',
  howTo: [
    'Enter your incentive — the freebie people get for signing up (e.g. free SEO checklist).',
    'Pick the placement: popup, inline form, landing page, or sidebar.',
    'Pick a tone: friendly, professional, playful, or urgent.',
    'Run the tool to get 4 headline options, 3 subtext options, and 5 button texts — all assembled from fixed templates.',
    'Pick one from each list, paste them into your form, and test them against your current copy.',
  ],
  methodology:
    'Copy is assembled from fixed banks (20 headline patterns, 14 subtext patterns, 16 button texts) filled with your incentive — no AI, no guessing. Selection is a deterministic hash of incentive, placement, and tone, so the same inputs always produce the same options. Nothing here measures or predicts conversion.',
  examples: [
    {
      title: 'Popup copy for a free checklist',
      inputs: { incentive: 'free SEO checklist', placement: 'popup', tone: 'friendly' },
      note: 'Friendly headline, subtext, and button options for a popup offer.',
    },
    {
      title: 'Sidebar copy for a template pack',
      inputs: { incentive: 'blog post template pack', placement: 'sidebar', tone: 'professional' },
      note: 'Professional-tone options sized for a sidebar form.',
    },
  ],
  faqs: [
    {
      question: 'What is the best email signup copy generator?',
      answer:
        'The best one matches the copy to your offer, placement, and tone: this free generator combines your incentive with 50 fixed copy templates and returns 4 headlines, 3 subtexts, and 5 button texts per run. Every option is assembled from templates — nothing is written by AI.',
    },
    {
      question: 'Is there a free email signup copy generator?',
      answer:
        'Yes — this email signup copy generator is completely free with no signup. Each run gives you headline, subtext, and button text options for popups, inline forms, landing pages, and sidebars.',
    },
    {
      question: 'How to generate email signup?',
      answer:
        'Name the incentive clearly, place the form where intent is highest, and keep the ask to one field where possible. Use this tool to draft the headline, subtext, and button text, then A/B test the winner against your current copy.',
    },
    {
      question: 'How does an email signup copy generator work?',
      answer:
        'It fills fixed copy patterns with your incentive — headline, subtext, and button templates — and deterministically picks a set of options based on your placement and tone. The output is assembled from a bundled template library, with no network calls or AI.',
    },
    {
      question: 'What is an email signup copy generator?',
      answer:
        'An email signup copy generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I create email signup copy generator?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
    {
      question: 'Can I customize the generated email signup copy generator?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
  ],
  assumptions: [
    'Copy is template-based and generic — it knows nothing about your brand, audience, or data, and makes no performance claims.',
    '50 total patterns (20 headlines, 14 subtexts, 16 button texts); options may feel formulaic by design.',
    'Template copy is a starting point — always proofread and adapt it to your brand voice before publishing.',
  ],
  jsonLd: [],
};
