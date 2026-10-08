import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'newsletterName',
    label: 'Newsletter name',
    type: 'text',
    required: true,
    placeholder: 'e.g. The Freelance Brief',
  },
  {
    id: 'sections',
    label: 'Sections (one per line)',
    type: 'textarea',
    required: true,
    placeholder: 'Welcome intro\nMain feature\nQuick tips\nCurated links\nClosing PS',
  },
  {
    id: 'frequency',
    label: 'Publishing frequency',
    type: 'select',
    required: true,
    options: ['weekly', 'biweekly', 'monthly'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'issueTemplate',
    label: 'Issue template',
    type: 'table',
    description: 'Free newsletter content planner 2026: Named section slots with slot purposes and word-count targets. Get instant results. No signup - try it free now!',
  },
  {
    id: 'summary',
    label: 'Issue summary',
    type: 'text',
    description: 'Section count, words per issue, and issues per year.',
  },
];

export const content: ToolContent = {
  title: 'Newsletter Content Planner 2026 – Free | HusnainBlogger',
  description:
    'Plan each newsletter issue — arrange your sections into a fixed issue template with word-count targets. Free newsletter content planner. Plan your next issue!',
  howTo: [
    'Enter your newsletter\'s name.',
    'List your sections, one per line (duplicates are removed automatically).',
    'Choose your publishing frequency: weekly, biweekly, or monthly.',
    'Click generate to get an issue template with slot purposes and word-count targets.',
    'Fill each section with your own writing — the tool plans the layout, never the content.',
  ],
  methodology:
    'This is a template layout tool, not AI writing. Each section you name is matched by keyword against 6 fixed section presets (intro, feature, tips, news, promo, sign-off), each with a fixed word-count target and slot purpose; unmatched sections get a generic 125-word target. Frequency maps to issues per year (weekly 52, biweekly 26, monthly 12) and totals are simple sums.',
  examples: [
    {
      title: 'Weekly brief',
      inputs: {
        newsletterName: 'The Freelance Brief',
        sections: 'Welcome intro\nMain feature\nQuick tips\nCurated links\nClosing PS',
        frequency: 'weekly',
      },
      note: '5 sections, ≈900 words per issue, 52 issues a year.',
    },
    {
      title: 'Monthly digest',
      inputs: {
        newsletterName: 'Creator Digest',
        sections: 'Main feature\nRoundup\nOne offer',
        frequency: 'monthly',
      },
      note: '3 sections, ≈675 words per issue, 12 issues a year.',
    },
  ],
  faqs: [
    {
      question: 'What is the best newsletter content planner?',
      answer:
        'The best newsletter content planner is the one you actually use before every send: it fixes your sections, their order, and how much space each gets. This free tool does exactly that — it lays your chosen sections into an issue template with slot purposes and word-count targets. It will not write the content for you.',
    },
    {
      question: 'Is there a free newsletter content planner?',
      answer:
        'Yes — this one. It is free, runs entirely in your browser, and needs no sign-up. Name your newsletter, list your sections one per line, pick a frequency, and you get a structured issue template with word-count targets.',
    },
    {
      question: 'How do I plan newsletter content?',
      answer:
        'Fix a repeatable section order, assign each section a purpose and a rough word budget, then write to the template every issue. This tool generates that template from your sections: known section types get proven word targets, anything else gets a generic 125-word target, and your cadence sets the issues-per-year count.',
    },
    {
      question: 'How does a newsletter content planner work?',
      answer:
        'This one is template-based, not AI: your sections are matched by keyword to 6 fixed presets with set word targets and slot purposes, duplicates are removed, and your frequency maps to issues per year. No content is written for you — the same inputs always produce the same template.',
    },
    {
      question: 'How does the newsletter content planner work?',
      answer:
        'Enter your details using the inputs above and the newsletter content planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the newsletter content planner free to use?',
      answer:
        'Yes - this newsletter content planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a newsletter content planner?',
      answer:
        'A newsletter content planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Word-count targets are planning guides from a fixed map, not rules — adjust them to your style.',
    'Unrecognized sections get a generic 125-word target and a "fill with your own content" slot.',
    'Duplicate section names are removed (case-insensitive, first occurrence kept).',
    'The tool plans layout only; it never writes newsletter content.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Newsletter Content Planner 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-workflows/newsletter-issue-planner/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free newsletter content planner 2026: Named section slots with slot purposes and word-count targets. Get instant results. No signup - try it free now!',
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
          name: 'Newsletter Issue Planner',
          item: 'https://husnainblogger.com/tools/ai-workflows/newsletter-issue-planner/',
        },
      ],
    },
  ],
};
