import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

// tool-219 — Collab Post Caption Generator (generator).

export const inputs: ToolInput[] = [
  {
    id: 'partnerHandle',
    label: "Partner's Instagram handle",
    type: 'text',
    required: true,
    placeholder: 'e.g. @brandname',
  },
  {
    id: 'campaign',
    label: 'Campaign name',
    type: 'text',
    required: true,
    placeholder: 'e.g. summer skincare launch',
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['friendly', 'professional', 'playful', 'bold'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'captions', label: 'Caption options', type: 'list' },
  { id: 'disclosureReminder', label: 'Disclosure reminder', type: 'text' },
];

export const content: ToolContent = {
  title: 'Instagram Collab Post Caption',
  description:
    'Write the perfect collaboration caption with this free instagram collab post caption tool: add your partner handle, campaign, and tone for options.',
  howTo: [
    "Enter your partner's Instagram handle (the @ is added automatically).",
    'Describe the campaign — e.g. "summer skincare launch".',
    'Pick a tone: friendly, professional, playful, or bold.',
    'Generate to get three caption options with your partner tagged and a disclosure label.',
    'Review the disclosure reminder and keep #ad near the start when the collab is paid.',
  ],
  methodology:
    'Captions are assembled from 6 fixed formulas and 4 tone phrase banks (3 phrases each), selected by a fixed rule from your inputs — fully client-side, never AI-written. Every caption slots in your partner handle and campaign, and a fixed disclosure reminder about #ad labeling and paid-partnership tagging is always attached.',
  examples: [
    {
      title: 'Skincare collab, friendly tone',
      inputs: { partnerHandle: '@brandname', campaign: 'summer skincare launch', tone: 'friendly' },
      note: 'Three friendly captions tagging @brandname with #ad near the start.',
    },
    {
      title: 'Product drop, bold tone',
      inputs: { partnerHandle: 'sneakerco', campaign: 'limited streetwear drop', tone: 'bold' },
      note: 'Handle normalized to @sneakerco; three bold-toned options.',
    },
  ],
  faqs: [
    {
      question: 'What is the best instagram collab post caption?',
      answer:
        'This free tool builds collaboration captions from fixed templates using your partner handle, campaign name, and tone — it is template-based, not AI-written, and every caption includes a disclosure label plus a reminder about #ad rules.',
    },
    {
      question: 'Is there a free instagram collab post caption?',
      answer:
        'Yes — this tool is free and runs entirely in your browser. Enter a handle, a campaign, and a tone to get three ready-to-post caption options with a disclosure reminder.',
    },
    {
      question: 'How to use instagram collab post?',
      answer:
        'Generate a caption, keep the #ad or #paidpartnership label near the start, tag your partner with the Collab invite feature in Instagram so the post shows on both profiles, and tag the paid partnership in Advanced settings when it is paid.',
    },
    {
      question: 'How does the instagram collab post caption work?',
      answer:
        'Enter your details using the inputs above and the instagram collab post caption calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the instagram collab post caption free to use?',
      answer:
        'Yes - this instagram collab post caption is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an instagram collab post caption?',
      answer:
        'An instagram collab post caption is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the instagram collab post caption?',
      answer:
        'No account needed. Open the instagram collab post caption, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Template-based captions (6 formulas × 4 tone banks) — not AI-written.',
    'Every output includes a disclosure reminder; disclosure rules vary by country.',
    'Handle validation is format-only — it does not check whether the account exists.',
  ],
  jsonLd: [],
};
