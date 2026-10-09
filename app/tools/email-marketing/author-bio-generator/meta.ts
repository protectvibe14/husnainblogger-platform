import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'name',
    label: 'Author name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Ayesha Khan',
  },
  {
    id: 'expertise',
    label: 'Expertise',
    type: 'text',
    required: true,
    placeholder: 'e.g. email deliverability specialist',
  },
  {
    id: 'publications',
    label: 'Publications (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. featured in Blogging Weekly and The Newsletter Post',
  },
  {
    id: 'length',
    label: 'Length (words)',
    type: 'select',
    required: true,
    options: ['50', '100', '200'],
  },
  {
    id: 'pov',
    label: 'Point of view',
    type: 'select',
    required: true,
    options: ['first', 'third'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'bio', label: 'Author bio', type: 'text' },
  { id: 'wordCount', label: 'Word count', type: 'number' },
];

const DESCRIPTION =
  'Need a sharp author bio? Enter a name, expertise, and publications to get a polished short bio that fits your blog, guest post, or book jacket.';

export const content: ToolContent = {
  title: 'Author Bio Generator',
  description: DESCRIPTION,
  howTo: [
    'Enter the author’s name exactly as it should appear.',
    'Describe their expertise — for example, “email deliverability specialist”.',
    'Optionally list publications they have appeared in.',
    'Choose a target length: 50, 100, or 200 words.',
    'Pick first person (“I”) or third person (“they”).',
    'Generate, check the honest word count, and edit the bio in your own voice.',
  ],
  methodology:
    'The bio is assembled deterministically from a fixed library of 6 hand-written templates (3 target lengths × 2 points of view) with the name, expertise, and publications inserted into the slots — no AI, no network, and the same inputs always produce the same bio. The word count output is the actual count of the generated text, not a promise, because your inputs shift the total. Overlong inputs are trimmed with a visible notice, and HTML is stripped from inputs before assembly.',
  examples: [
    {
      title: 'Third-person 100-word bio for a deliverability specialist',
      inputs: { name: 'Ayesha Khan', expertise: 'email deliverability specialist', publications: 'Blogging Weekly', length: '100', pov: 'third' },
      note: 'A two-paragraph bio with the publication credit and an honest word count.',
    },
    {
      title: 'First-person 50-word bio for a new blogger',
      inputs: { name: 'Bilal Ahmed', expertise: 'beginner blogging coach', publications: '', length: '50', pov: 'first' },
      note: 'A compact bio with a generic fallback where publications were skipped.',
    },
  ],
  faqs: [
    {
      question: 'What is the best author bio generator?',
      answer:
        'The best one gives you a clean, editable draft at the length you need — not padded filler. This free generator produces 50-, 100-, or 200-word bios in first or third person from a fixed template library, with an honest word count of the result.',
    },
    {
      question: 'Is there a free author bio generator?',
      answer:
        'Yes — this author bio generator is completely free with no signup. Enter a name, expertise, length, and point of view to get a bio with its real word count instantly.',
    },
    {
      question: 'How to generate author bio ideas?',
      answer:
        'Start with the author’s name and one clear expertise phrase, add any real publications, pick a length and point of view, then generate. Edit the draft in the author’s real voice before publishing.',
    },
    {
      question: 'Does this author bio generator use AI?',
      answer:
        'No. It fills a fixed library of 6 hand-written templates (3 lengths × 2 points of view) with your details. It is deterministic and free, but it cannot write original prose — always review and personalize the draft.',
    },
    {
      question: 'How does the author bio generator work?',
      answer:
        'Enter your details using the inputs above and the author bio generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the author bio generator free to use?',
      answer:
        'Yes - this author bio generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an author bio generator?',
      answer:
        'An author bio generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Bios come from a fixed 6-template library, not AI — always review and personalize before publishing.',
    'The length label is a target; the word count output reports the actual count, which shifts with your inputs.',
    'It cannot verify publications or expertise claims; you are responsible for accuracy.',
    'Inputs longer than 300 characters are trimmed with a visible notice.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Author Bio Generator 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/email-marketing/author-bio-generator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: DESCRIPTION,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Email Marketing Tools',
          item: 'https://husnainblogger.com/tools/email-marketing/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Author Bio Generator',
          item: 'https://husnainblogger.com/tools/email-marketing/author-bio-generator/',
        },
      ],
    },
  ],
};
