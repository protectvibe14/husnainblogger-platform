import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/case-study-template-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'clientName',
    label: 'Client name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Bloom & Co.',
  },
  {
    id: 'industry',
    label: 'Industry (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. florist e-commerce',
  },
  {
    id: 'challenge',
    label: 'The challenge',
    type: 'textarea',
    required: true,
    placeholder: 'What problem did the client have when they came to you?',
  },
  {
    id: 'solution',
    label: 'The solution',
    type: 'textarea',
    required: true,
    placeholder: 'What did you actually do for them, step by step?',
  },
  {
    id: 'results',
    label: 'Results — your own metrics (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'e.g. Online orders up 40% in 3 months (use only real numbers you can back up)',
  },
  {
    id: 'quote',
    label: 'Client quote (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'A short quote from the client, with their permission',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'caseStudy',
    label: 'Case study document (copy)',
    type: 'copy',
    description: 'Free freelance case study template 2026: The full sectioned case study: overview, challenge, solution, results, quote. Fast, private, no signup - try it now!',
  },
];

export const content: ToolContent = {
  title: 'Freelance Case Study Template 2026 – Free | HusnainBlogger',
  description:
    'Build a freelance case study template from your project details: enter the challenge, solution, and real results to get a sectioned document for clients. Free.',
  howTo: [
    'Enter the client name, plus their industry if you want it in the title.',
    'Describe the challenge the client had when they came to you.',
    'Describe the solution — what you actually did, step by step.',
    'Add results using only real metrics you can back up (they are labeled user-provided).',
    'Optionally add a client quote, then copy the finished sectioned document.',
  ],
  methodology:
    'This is template assembly, not writing: your client name, industry, challenge, solution, results, and quote are placed into a fixed sectioned document (overview, challenge, solution, results, optional quote, about-this-case-study note). Nothing is reworded, embellished, or researched — results are echoed back labeled as user-provided and not independently verified.',
  examples: [
    {
      title: 'Florist e-commerce redesign',
      inputs: {
        clientName: 'Bloom & Co.',
        industry: 'florist e-commerce',
        challenge: 'Mobile checkout took 6 steps and most visitors dropped off before paying.',
        solution: 'Rebuilt the checkout as a single page, rewrote the delivery options, and added order tracking.',
        results: 'Checkout completion rose from 31% to 52% in 3 months (client-reported).',
        quote: 'She made ordering flowers feel effortless.',
      },
      note: 'Results appear verbatim, labeled as client-reported and unverified.',
    },
    {
      title: 'SaaS onboarding emails, no quote',
      inputs: {
        clientName: 'Northbeam',
        challenge: 'Trial users rarely reached the "aha" moment in their first week.',
        solution: 'Wrote a 7-email onboarding sequence triggered by in-app behavior.',
        results: 'Trial-to-paid conversion moved from 8% to 11% (client-reported).',
      },
      note: 'Quote omitted, so the client-quote section is skipped automatically.',
    },
  ],
  faqs: [
    {
      question: 'What is the best freelance case study template?',
      answer:
        'The best one follows the structure clients actually read: challenge, solution, results — with real, attributable numbers. This free generator assembles exactly that document from your details, with your results clearly labeled as user-provided.',
    },
    {
      question: 'Is there a free freelance case study template?',
      answer:
        'Yes — this generator is completely free with no signup. Enter the challenge, solution, and your real results to get a sectioned, client-ready case study instantly.',
    },
    {
      question: 'How to use freelance case study?',
      answer:
        'Fill in the client name, the challenge they had, and the solution you delivered. Add results using only numbers you can genuinely back up — they will be labeled as user-provided, not verified.',
    },
    {
      question: 'How does a freelance case study template work?',
      answer:
        'It does not write or research anything. It places your inputs into a fixed sectioned template and echoes your results back with an explicit "user-provided, not independently verified" label. Always get the client\'s written permission before publishing their name or metrics.',
    },
    {
      question: 'How does the freelance case study template work?',
      answer:
        'Enter your details using the inputs above and the freelance case study template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the freelance case study template free to use?',
      answer:
        'Yes - this freelance case study template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a freelance case study template?',
      answer:
        'A freelance case study template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Results are echoed as user-provided and labeled as not independently verified.',
    'The tool rewords nothing — quality depends entirely on what you write.',
    'Get the client\'s written permission before publishing their name, metrics, or quote.',
    'Sections you leave empty (industry, quote) are omitted or marked as placeholders.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Freelance Case Study Template 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free freelance case study template 2026: The full sectioned case study: overview, challenge, solution, results, quote. Fast, private, no signup - try it now!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Creator Business Tools',
          item: 'https://husnainblogger.com/tools/creator-business/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Case Study Template Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
