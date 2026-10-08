import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'clientType',
    label: 'Client type',
    type: 'text',
    required: true,
    placeholder: 'e.g. dental clinic, SaaS startup, real estate agency',
  },
  {
    id: 'industry',
    label: 'Industry (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. Healthcare, Home services',
  },
  {
    id: 'knownResult',
    label: 'Verified result (optional — real data only)',
    type: 'text',
    required: false,
    placeholder: 'e.g. 40 new patient calls in 60 days — only if you can prove it',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'outline',
    label: 'Case study outline',
    type: 'copy',
    description: 'The full outline text, ready to copy into your draft.',
  },
  {
    id: 'sections',
    label: 'Outline sections',
    type: 'list',
    description: 'The 9 sections of the case-study arc.',
  },
];

const DESCRIPTION =
  'Build a free case study template outline with verified-data placeholders — headline, challenge, solution, results, and quote sections. Create yours now.';

export const content: ToolContent = {
  title: 'Case Study Template 2026 – Free Tool | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Enter your client type — for example dental clinic, SaaS startup, or real estate agency.',
    'Optionally add the industry and any result you can actually prove (leave blank if none).',
    'Click Run to generate the 9-section outline with [PROOF NEEDED] placeholders.',
    'Copy the outline into your document and fill every placeholder with verified client data.',
    'Get the client to approve the draft and quote in writing before publishing.',
  ],
  methodology:
    'A fixed outline template: your client type deterministically selects one of 4 headline formulas, one of 3 challenge framings, and one of 3 CTA lines from fixed banks (no randomness, no AI). All metrics, quotes, and outcomes are emitted as [PROOF NEEDED] placeholders — the tool cannot and does not invent client results.',
  examples: [
    {
      title: 'Dental clinic',
      inputs: { clientType: 'dental clinic', industry: 'Healthcare' },
      note: 'Generates the full 9-section outline with [PROOF NEEDED] result placeholders.',
    },
    {
      title: 'SaaS startup',
      inputs: { clientType: 'SaaS startup' },
      note: 'Headline, challenge, solution, and results sections — metrics left as placeholders.',
    },
    {
      title: 'With a verified result',
      inputs: { clientType: 'plumbing company', knownResult: 'Booked 40 new jobs in 60 days' },
      note: 'Your own reported result is used verbatim; everything else stays a placeholder.',
    },
  ],
  faqs: [
    {
      question: 'What is the best case study template?',
      answer:
        'The best case study template covers headline, client snapshot, challenge, solution, implementation, verified results, client quote, and CTA. This free tool generates that 9-section outline with placeholders for the data only you can verify.',
    },
    {
      question: 'Is there a free case study template?',
      answer:
        'Yes — this case study outline generator is free with no signup. Enter your client type and copy the full outline.',
    },
    {
      question: 'How to use case study?',
      answer:
        'Generate the outline, fill every [PROOF NEEDED] placeholder with real verified data from your client, get written approval for the draft and quote, then publish. Never publish with invented numbers.',
    },
    {
      question: 'How does a case study template work?',
      answer:
        'You enter your client type; the tool assembles a fixed 9-section outline (headline, challenge, solution, results, quote, CTA). It never writes your client results — those stay as placeholders until you replace them with verified data.',
    },
    {
      question: 'How does the case study template work?',
      answer:
        'Enter your details using the inputs above and the case study template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the case study template free to use?',
      answer:
        'Yes - this case study template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a case study template?',
      answer:
        'A case study template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Template only — it assembles a fixed outline from fixed word banks (4 headlines, 3 challenge framings, 3 CTAs) and never invents client results or metrics.',
    'A knownResult you enter is your own data and is used verbatim; verify it before publishing.',
    'Not legal advice — get the client to approve the final draft and any quote in writing.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Case Study Template 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-workflows/case-study-outline-generator/',
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
          name: 'AI Workflow Tools',
          item: 'https://husnainblogger.com/tools/ai-workflows/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Case Study Outline Generator',
          item: 'https://husnainblogger.com/tools/ai-workflows/case-study-outline-generator/',
        },
      ],
    },
  ],
};
