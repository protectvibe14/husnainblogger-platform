import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'piecesPerBatch',
    label: 'Pieces per batch',
    type: 'number',
    required: true,
    placeholder: 'e.g. 8',
    validation: { min: 1, max: 50 },
  },
  {
    id: 'batchDay',
    label: 'Batch day',
    type: 'select',
    required: true,
    options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
  {
    id: 'platforms',
    label: 'Platforms',
    type: 'text',
    required: true,
    placeholder: 'e.g. Blog, Instagram, YouTube',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'batchCalendar',
    label: 'Your batch calendar grid',
    type: 'table',
    description: 'Free content batching template 2026: Per-piece task slots: outline, draft, edit, visuals, captions/SEO, and publish - each. Fast, private, no signup - try it!',
  },
  {
    id: 'planSummary',
    label: 'Batch day summary',
    type: 'text',
    description: 'Total task blocks, estimated focused work time, and your platform rotation.',
  },
];

export const content: ToolContent = {
  title: 'Content Batching Template',
  description:
    'Plan a content batch day in minutes: choose 1-50 pieces, your batch day, and platforms, then get a task-by-task calendar grid. Free, no signup - try it now!',
  howTo: [
    'Enter how many pieces you want to batch (from 1 to 50) in Pieces per batch.',
    'Pick your batch day from the Batch day dropdown.',
    'List your platforms in the Platforms field, separated by commas (for example, "Blog, Instagram, YouTube").',
    'Click run to build your batch calendar grid.',
    'Work through each 30-minute task block - outline, draft, edit, visuals, captions and SEO, then schedule and publish.',
    'Use the summary line to see your total task blocks and estimated work time.',
  ],
  methodology:
    'This tool schedules your batch into a fixed task grid: every piece gets the same 6 tasks (outline, draft, edit, visuals, captions/SEO, publish), each a fixed 30-minute block starting 9:00 AM on your chosen batch day. Pieces rotate across your platforms in order. No content is produced - you bring the topics, the tool brings the schedule.',
  examples: [
    {
      title: 'Weekly blog + social batch',
      inputs: { piecesPerBatch: 6, batchDay: 'Saturday', platforms: 'Blog, Instagram, YouTube' },
      note: 'Gets 36 task blocks (6 per piece) spread across the batch day, rotating through 3 platforms.',
    },
    {
      title: 'Solo blogger batch',
      inputs: { piecesPerBatch: 2, batchDay: 'Sunday', platforms: 'Blog' },
      note: 'A focused 2-piece day: 12 task blocks, about 6 hours of scheduled work.',
    },
  ],
  faqs: [
    {
      question: 'What is the best content batching template?',
      answer:
        'The best one turns a batch day into concrete work blocks: each piece broken into outline, draft, edit, visuals, captions, and publish steps with time slots. This planner builds that exact grid from your piece count, batch day, and platforms.',
    },
    {
      question: 'Is there a free content batching template?',
      answer:
        'Yes - this Content Batching Planner is completely free with no signup. Enter your piece count, batch day, and platforms to get a task-by-task batch calendar instantly.',
    },
    {
      question: 'How do you use content batching?',
      answer:
        'Pick one day, decide how many pieces you will create, and work through every piece in the same production steps: outline, draft, edit, visuals, captions, then publish. Batching cuts context-switching because similar tasks stay grouped together.',
    },
    {
      question: 'How does a content batching template work?',
      answer:
        'You enter your batch size, batch day, and platforms; the template expands each piece into 6 ordered tasks with 30-minute time slots starting 9:00 AM and rotates pieces across your platforms. You follow the grid and do the creating yourself.',
    },
    {
      question: 'How does the content batching template work?',
      answer:
        'Enter your details using the inputs above and the content batching template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the content batching template free to use?',
      answer:
        'Yes - this content batching template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a content batching template?',
      answer:
        'A content batching template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'This is a scheduling template - the tool does not write or produce any content for you.',
    'Each task block is a fixed 30-minute estimate; real work times will vary by piece and format.',
    'Large batches can total more hours than fit in one day - the summary shows the full estimate so you can split it.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Content Batching Template 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-workflows/content-batching-planner/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free content batching template 2026: Per-piece task slots: outline, draft, edit, visuals, captions/SEO, and publish - each. Fast, private, no signup - try it!',
    },
    {
      '@context': 'https://schema.org',
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
          name: 'Content Batching Planner',
          item: 'https://husnainblogger.com/tools/ai-workflows/content-batching-planner/',
        },
      ],
    },
  ],
};
