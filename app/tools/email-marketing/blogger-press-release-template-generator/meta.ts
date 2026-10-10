import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'announcement',
    label: 'Your announcement',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. we are launching a free 7-day email course for new bloggers next month…',
  },
  {
    id: 'brand',
    label: 'Brand / blog name',
    type: 'text',
    required: true,
    placeholder: 'e.g. HusnainBlogger',
  },
  {
    id: 'quotes',
    label: 'Quote (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'e.g. We built this because readers kept asking for it…',
  },
  {
    id: 'contactInfo',
    label: 'Media contact info',
    type: 'text',
    required: true,
    placeholder: 'e.g. Ayesha Khan, press@husnainblogger.com, +1-555-0100',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'pressRelease', label: 'Press release', type: 'text' },
];

const DESCRIPTION =
  'Announce your news like a publisher: describe the announcement, add your brand and a quote, and get a clean press release template ready to send.';

export const content: ToolContent = {
  title: 'Blogger Press Release Template',
  description: DESCRIPTION,
  howTo: [
    'Describe your announcement in plain language.',
    'Enter your brand or blog name.',
    'Optionally add a quote to include in the release.',
    'Enter media contact info — a name, email, and phone number.',
    'Generate to get a formatted press release from the fixed 3-structure library.',
    'Review, personalize, and send it to your media list.',
  ],
  methodology:
    'Your inputs are formatted deterministically into one of 3 fixed hand-written press-release structures (headline, FOR IMMEDIATE RELEASE, lead, optional quote, body, boilerplate, media contact) — no AI, no network, and the same inputs always produce the same release. The structure is picked by hashing your brand and announcement. The tool invents no facts, dates, or details: the boilerplate and contact sections reuse only what you provided.',
  examples: [
    {
      title: 'Press release for a free email course launch',
      inputs: { announcement: 'we are launching a free 7-day email course for new bloggers next month', brand: 'HusnainBlogger', quotes: 'We built this because readers kept asking for it.', contactInfo: 'Ayesha Khan, press@example.com' },
      note: 'A full release with the quote included and the brand in the headline.',
    },
    {
      title: 'Press release for a milestone without a quote',
      inputs: { announcement: 'our newsletter just passed 10,000 subscribers', brand: 'HusnainBlogger', quotes: '', contactInfo: 'Ayesha Khan, press@example.com' },
      note: 'The quote paragraph is omitted entirely when no quote is provided.',
    },
  ],
  faqs: [
    {
      question: 'What is the best blogger press release template?',
      answer:
        'The best one follows the standard structure: headline, FOR IMMEDIATE RELEASE, lead paragraph, quote, body, boilerplate, and media contact. This free generator formats your announcement into exactly that structure using 3 fixed templates.',
    },
    {
      question: 'Is there a free blogger press release template?',
      answer:
        'Yes — this blogger press release template generator is completely free with no signup. Enter your brand, announcement, and contact info to get a formatted release instantly.',
    },
    {
      question: 'How to use blogger press release?',
      answer:
        'Describe your announcement, add your brand and media contact, optionally include a quote, then generate. Review the release, personalize it, and send it to journalists and bloggers in your niche.',
    },
    {
      question: 'Does this press release generator use AI?',
      answer:
        'No. It formats your own words into one of 3 fixed hand-written press-release structures. It is deterministic and free, but it cannot invent quotes, dates, or facts — everything substantive must come from you.',
    },
    {
      question: 'How does the blogger press release template work?',
      answer:
        'Enter your details using the inputs above and the blogger press release template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the blogger press release template free to use?',
      answer:
        'Yes - this blogger press release template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a blogger press release template?',
      answer:
        'A blogger press release template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The release comes from a fixed 3-structure library, not AI — always review and personalize before sending.',
    'The tool invents no facts, dates, locations, or quotes; accuracy of the announcement is your responsibility.',
    'Inputs are trimmed to documented limits with a visible notice when overlong.',
  ],
  jsonLd: [
  ],
};
