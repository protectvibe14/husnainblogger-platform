import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'yourAsset',
    label: 'Your asset',
    type: 'select',
    required: true,
    options: ['blog', 'podcast', 'event', 'newsletter'],
  },
  {
    id: 'sponsorType',
    label: 'Sponsor type',
    type: 'text',
    required: true,
    placeholder: 'e.g. meal-kit brands',
  },
  {
    id: 'ask',
    label: 'Your ask',
    type: 'text',
    required: true,
    placeholder: 'e.g. a 60-second mid-roll mention in 4 episodes',
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
  { id: 'subjectOptions', label: 'Subject line options', type: 'list' },
  { id: 'pitchEmail', label: 'Pitch email', type: 'copy' },
  { id: 'followUpNudge', label: 'Follow-up nudge', type: 'copy' },
];

const DESCRIPTION =
  'Pitch sponsors with a clear, confident ask: choose your asset - blog, podcast, event, or newsletter - name the sponsor type, and describe the deal.';

export const content: ToolContent = {
  title: 'Sponsorship Email Pitch Generator',
  description: DESCRIPTION,
  howTo: [
    'Choose your asset: blog, podcast, event, or newsletter.',
    'Enter the sponsor type you are targeting (e.g. “meal-kit brands”).',
    'Describe your ask (e.g. “a 60-second mid-roll mention in 4 episodes”).',
    'Pick a tone: friendly, professional, playful, or urgent.',
    'Generate to get 6 subject lines, a full pitch email, and a follow-up nudge — then personalize and send.',
  ],
  methodology:
    'Pitch copy is assembled deterministically from a fixed template bank of 6 hand-written subject lines, 8 pitch email templates (4 tones × 2), and 4 follow-up nudge templates, with your asset, sponsor type, and ask inserted into the slots. No AI and no network: the same inputs always produce the same pitch. No follower counts, rates, or performance stats are invented — the tool only uses what you typed.',
  examples: [
    {
      title: 'Friendly podcast sponsorship pitch',
      inputs: { yourAsset: 'podcast', sponsorType: 'meal-kit brands', ask: 'a 60-second mid-roll mention in 4 episodes', tone: 'friendly' },
      note: 'Warm ask email with a matching follow-up nudge.',
    },
    {
      title: 'Professional newsletter sponsorship pitch',
      inputs: { yourAsset: 'newsletter', sponsorType: 'fintech startups', ask: 'a dedicated sponsored edition', tone: 'professional' },
      note: 'Formal proposal email for a premium placement.',
    },
  ],
  faqs: [
    {
      question: 'What is the best sponsorship email pitch generator?',
      answer:
        'The best one covers the full outreach flow: subject lines, the pitch itself, and a follow-up. This free generator gives 6 subject options, a complete pitch email, and a follow-up nudge in friendly, professional, playful, or urgent tones.',
    },
    {
      question: 'Is there a free sponsorship email pitch generator?',
      answer:
        'Yes — this sponsorship email pitch generator is completely free with no signup. Describe your asset and ask to get your pitch email and follow-up instantly.',
    },
    {
      question: 'How to generate sponsorship email pitch?',
      answer:
        'Choose your asset type, enter the sponsor type and your ask, and pick a tone. The tool assembles subject lines, a pitch email, and a follow-up nudge from a fixed template bank — then you personalize it before sending.',
    },
    {
      question: 'What is a sponsorship email pitch generator?',
      answer:
        'A sponsorship email pitch generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the sponsorship email pitch generator?',
      answer:
        'No account needed. Open the sponsorship email pitch generator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'This is the sponsorship ASK (you seek a sponsor) — the opposite direction is the Newsletter Sponsorship Pitch Generator (tool-419).',
    'The tool never invents follower counts, rates, or stats — add your real numbers yourself.',
    'Copy comes from a fixed template bank, not AI; always personalize before sending.',
  ],
  jsonLd: [],
};
