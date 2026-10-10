import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'context',
    label: "What you're quoting",
    type: 'text',
    required: true,
    placeholder: 'e.g. AI will replace junior developers',
    validation: { max: 220 },
  },
  {
    id: 'stance',
    label: 'Your stance',
    type: 'select',
    required: false,
    options: ['agree', 'add-nuance', 'disagree'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'quoteComments',
    label: 'Quote comment drafts',
    type: 'list',
    description:
    'Free quote tweet ideas 2026: 5 comment drafts in your chosen tone — each within 280 weighted chars (the quoted post. Fast, private now.',
  },
];

export const content: ToolContent = {
  title: 'Quote Tweet Ideas',
  description:
    'Quote tweet with the right take: describe the post you are quoting, pick agree, nuance, or disagree, and get 5 ready drafts within the 280-character limit.',
  howTo: [
    'Describe what you\'re quoting in the What you\'re quoting field (the post\'s main point).',
    'Pick your stance: Agree, Add nuance, or Disagree — nuance is the default.',
    'Click run to get 5 comment drafts in that tone.',
    'Choose the draft you like and fill in any [BRACKETED] placeholders with your own take.',
    'Post it as a quote tweet — the quoted post itself costs 0 characters.',
  ],
  methodology:
    'This tool is a template library, not AI: 5 hand-written comment drafts per stance (15 total), with your context inserted and tone matched to the stance — agree endorses, add-nuance adds a caveat slot, disagree offers respectful pushback with a counterpoint slot. Drafts never invent your opinion: placeholders mark exactly what you add. The quoted post costs 0 characters on X, so only the comment is budgeted against the 280-character weighted limit (URL = 23 chars, emoji/CJK = 2 chars); long contexts are shortened with an ellipsis to fit. The same inputs always return the same 5 drafts.',
  examples: [
    {
      title: 'Endorsing a hot take',
      inputs: { context: 'posting daily beats posting perfect', stance: 'agree' },
      note: 'Gets 5 endorsing drafts that amplify the original post.',
    },
    {
      title: 'Adding perspective',
      inputs: { context: 'AI will replace junior developers' },
      note: 'Defaults to add-nuance: 5 drafts with slots for your caveat or footnote.',
    },
    {
      title: 'Respectful disagreement',
      inputs: { context: 'cold outreach is dead', stance: 'disagree' },
      note: 'Gets 5 pushback drafts with counterpoint slots — never rude, always substantive.',
    },
  ],
  faqs: [
    {
      question: 'What is the best quote tweet ideas?',
      answer:
        'The best quote tweet adds something the original lacked: endorsement with a reason, a nuance or caveat, or a respectful counterpoint. This tool drafts all three tones — pick the stance that fits your real view.',
    },
    {
      question: 'Is there a free quote tweet ideas?',
      answer:
        'Yes — this Quote Tweet Ideas tool is completely free with no signup. Describe the post, pick a stance, and get 5 comment drafts instantly.',
    },
    {
      question: 'How to use quote tweet?',
      answer:
        'On X, tap repost on any post and choose "Quote". Paste your comment — only your comment counts toward the 280-character limit; the quoted post costs 0 characters. This tool prepares 5 such comments for you.',
    },
    {
      question: 'Do quote tweets perform better than replies?',
      answer:
        'It depends on your goal: quote tweets put your take in front of your own followers, while replies live under the original post. This tool only drafts the comment text — it cannot predict reach, so test both formats with your audience.',
    },
    {
      question: 'How does the quote tweet ideas work?',
      answer:
        'Enter your details using the inputs above and the quote tweet ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the quote tweet ideas free to use?',
      answer:
        'Yes - this quote tweet ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a quote tweet ideas?',
      answer:
        'A quote tweet ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Drafts are templates with your context inserted — your actual opinion goes in the [BRACKETED] slots.',
    'The "quoted post costs 0 characters" rule is X’s published counting behavior; only comments are budgeted.',
    'Weighted character counting (URL = 23, emoji/CJK = 2) is an approximation of X’s proprietary counting.',
    'Same context + stance always returns the same 5 drafts; no reach or virality is predicted.',
  ],
  jsonLd: [],
};
