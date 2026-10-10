import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'name',
    label: 'Your name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Ayesha Khan',
  },
  {
    id: 'role',
    label: 'Your role',
    type: 'text',
    required: true,
    placeholder: 'e.g. email marketing consultant',
  },
  {
    id: 'credentials',
    label: 'Credentials (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. certified email marketer, 8 years of experience',
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['professional', 'friendly', 'bold', 'playful'],
  },
  {
    id: 'length',
    label: 'Length',
    type: 'select',
    required: true,
    options: ['short', 'medium', 'long'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'aboutCopy', label: 'About page copy', type: 'text' },
  { id: 'headlineOptions', label: 'Headline options', type: 'list' },
];

const DESCRIPTION =
  'Write an about page that actually connects: enter your name, role, and credentials, and get polished copy in friendly, professional, or bold tones.';

export const content: ToolContent = {
  title: 'About Page Copy Generator',
  description: DESCRIPTION,
  howTo: [
    'Enter your name exactly as you want it shown on the about page.',
    'Add your role — for example, “email marketing consultant”.',
    'Optionally add credentials such as certifications or years of experience.',
    'Pick a tone: professional, friendly, bold, or playful.',
    'Choose a length — short, medium, or long — then generate.',
    'Copy the about-page draft and pick one of the 8 headline options.',
  ],
  methodology:
    'Copy is assembled deterministically from a fixed library of 12 hand-written templates (4 tones × 3 lengths) with your name, role, and credentials inserted into the slots — no AI, no network, and the same inputs always produce the same draft. Headlines come from a separate fixed bank of 10 patterns; 8 are returned per run, rotated from a deterministic start index. Overlong inputs are trimmed with a visible notice, and HTML is stripped from inputs before assembly.',
  examples: [
    {
      title: 'Professional about page for an email consultant',
      inputs: { name: 'Ayesha Khan', role: 'email marketing consultant', credentials: 'a certified email marketer with 8 years of experience', tone: 'professional', length: 'medium' },
      note: 'A polished two-paragraph draft plus 8 headline options to choose from.',
    },
    {
      title: 'Playful short about page for a food blogger',
      inputs: { name: 'Danish Ali', role: 'food blogger', credentials: '', tone: 'playful', length: 'short' },
      note: 'A fun short intro with a per-tone fallback where credentials were skipped.',
    },
  ],
  faqs: [
    {
      question: 'What is the best about page copy generator?',
      answer:
        'The best one gives you a structured, editable draft in your own tone — not generic filler. This free generator produces a full about-page draft in professional, friendly, bold, or playful tones, plus 8 headline options, from a fixed template library.',
    },
    {
      question: 'Is there a free about page copy generator?',
      answer:
        'Yes — this about page copy generator is completely free with no signup. Enter your name, role, tone, and length to get a full draft plus 8 headline options instantly.',
    },
    {
      question: 'How to generate about?',
      answer:
        'Enter your name and role, optionally add credentials, pick a tone and length, and generate. Review the draft, edit it in your own voice, and publish it alongside one of the 8 headline options.',
    },
    {
      question: 'Does this about page copy generator use AI?',
      answer:
        'No. It assembles your draft from a fixed library of 12 hand-written templates (4 tones × 3 lengths) and 10 headline patterns. That makes it deterministic — the same inputs always produce the same draft — but it cannot write original prose like a human copywriter.',
    },
    {
      question: 'How does the about page copy generator work?',
      answer:
        'Enter your details using the inputs above and the about page copy generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the about page copy generator free to use?',
      answer:
        'Yes - this about page copy generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an about page copy generator?',
      answer:
        'An about page copy generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Copy comes from a fixed 12-template library, not AI — it is a first draft, not a finished page; always edit before publishing.',
    'It cannot verify credentials or claims you enter; you are responsible for the accuracy of everything on your about page.',
    'Inputs longer than 300 characters are trimmed with a visible notice.',
  ],
  jsonLd: [],
};
