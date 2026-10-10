import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'monthlyBudget',
    label: 'Monthly budget (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 50',
    validation: { min: 0 },
  },
  {
    id: 'useCases',
    label: 'Your use cases',
    type: 'text',
    required: true,
    placeholder: 'e.g. blog writing, thumbnails, scheduling',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'toolTable',
    label: 'Your AI tool stack table',
    type: 'table',
    description:
    'Free ai tools stack for creators 2026: One recommended tool per matched category with its default monthly price and a free-plan. Fast, private - try.',
  },
  {
    id: 'budgetSummary',
    label: 'Budget summary',
    type: 'text',
    description:
    'Estimated monthly total vs your budget, over-budget flags, and a note that prices are defaults.',
  },
];

export const content: ToolContent = {
  title: 'AI Tools Stack for Creators',
  description:
    'Build your AI stack: enter your monthly budget and use cases, then get one recommended tool per category with default pricing. Free - plan your stack now.',
  howTo: [
    'Enter your monthly budget in USD in the Monthly budget field (0 works too).',
    'List your use cases in the Your use cases field, separated by commas (for example, "blog writing, thumbnails, scheduling").',
    'Click run to get your tool stack table, one tool per category.',
    'Check the Budget status column - picks above your budget are flagged.',
    'Verify each tool\'s current price on its vendor site before buying anything.',
  ],
  methodology:
    'This tool matches your use cases to six fixed categories (writing, images, video, voice and audio, SEO and research, scheduling) using a fixed keyword list. For each matched category it picks the cheapest tool in a curated 12-tool database whose default price fits your budget, or the cheapest tool flagged as over budget. Prices are editable defaults, never live vendor data.',
  examples: [
    {
      title: 'Blogging creator on $50/month',
      inputs: { monthlyBudget: 50, useCases: 'blog writing, thumbnails, scheduling' },
      note: 'Gets three picks (writing, images, scheduling) totaling $36 in default prices, all within budget.',
    },
    {
      title: 'Zero-budget video creator',
      inputs: { monthlyBudget: 0, useCases: 'video, voice' },
      note: 'Gets the $0 CapCut pick within budget and flags the voice pick as over budget.',
    },
  ],
  faqs: [
    {
      question: 'What is the best AI tools stack for creators?',
      answer:
        'The best stack covers only the categories you actually use - writing, images, video, voice, SEO, and scheduling - with one tool per category that fits your budget. This planner builds exactly that stack from your use cases.',
    },
    {
      question: 'Is there a free AI tools stack for creators?',
      answer:
        'Yes - this planner is free, and it works with a $0 budget too: it flags free tools and free plans in the table so you can build a stack without spending anything.',
    },
    {
      question: 'How do you use an AI tools stack planner?',
      answer:
        'Enter your monthly budget and list what you need tools for - writing, thumbnails, video editing, and so on. The planner matches each use case to a category and recommends one tool per category with its default price.',
    },
    {
      question: 'How does an AI tools stack planner work?',
      answer:
        'It matches your use cases against a fixed keyword list to find your categories, then picks the cheapest tool in a curated 12-tool database that fits your budget for each category. Prices shown are defaults - always check the vendor site for current pricing.',
    },
    {
      question: 'What is an ai tools stack for creators?',
      answer:
        'An ai tools stack for creators is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I plan ais stack for creators?',
      answer: 'Start by entering your goals and constraints above. The planner organizes everything into a step-by-step plan you can follow or share with your team.',
    },
    {
      question: 'What should I include in my ais stack for creators plan?',
      answer: 'Cover your objectives, timeline, resources needed, and success metrics. This tool prompts you for each element so nothing gets missed.',
    },
  ],
  assumptions: [
    'Recommendations come from a fixed 12-tool database via keyword matching - not from live reviews or testing of the tools.',
    'Prices are default estimates, not live vendor pricing; verify current prices and free plans before buying.',
  ],
  jsonLd: [],
};
