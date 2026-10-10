import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'launchDate',
    label: 'Launch date',
    type: 'date',
    required: true,
    placeholder: 'YYYY-MM-DD',
  },
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. sourdough baking',
    validation: { max: 120 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'milestoneGrid',
    label: 'Your 90-day milestone grid',
    type: 'table',
    description:
    'Free blog launch checklist 2026: 12 fixed launch milestones mapped onto your dates: 6 pre-launch, launch day, and 5. Fast, private now.',
  },
  {
    id: 'planSummary',
    label: 'Plan summary',
    type: 'text',
    description:
    'Your niche, launch date, and plan span - with a notice if the date is in the past.',
  },
];

export const content: ToolContent = {
  title: 'Blog Launch Checklist',
  description:
    'Launch your blog with confidence: enter your launch date and niche, then get a 90-day milestone grid for pre-launch, launch, and post-launch. Plan free.',
  howTo: [
    'Enter your launch date in the Launch date field (YYYY-MM-DD).',
    'Type your niche in the Your niche field (for example, "sourdough baking").',
    'Click run to map the 12-milestone launch checklist onto your dates.',
    'Work the pre-launch milestones from 60 days out down to launch day.',
    'Follow the post-launch milestones through day 45 to build your publishing habit.',
  ],
  methodology:
    'This tool maps a fixed 12-milestone launch checklist onto your launch date using simple date arithmetic: pre-launch milestones sit 60 to 7 days before, launch day is day 0, and post-launch milestones run 7 to 45 days after. The milestones are a standard template, not personalized advice - only the dates are yours.',
  examples: [
    {
      title: 'Food blog launching March 1',
      inputs: { launchDate: '2027-03-01', niche: 'sourdough baking' },
      note: 'Gets all 12 milestones dated from December 31, 2026 (60 days out) through April 15, 2027 (day 45).',
    },
    {
      title: 'Travel blog launch',
      inputs: { launchDate: '2027-09-15', niche: 'budget travel' },
      note: 'Same fixed checklist, shifted so launch day lands on September 15, 2027.',
    },
  ],
  faqs: [
    {
      question: 'What is the best blog launch checklist?',
      answer:
        'The best one covers all three phases: pre-launch setup (niche, hosting, first posts, email list), a launch-day announcement plan, and post-launch milestones through day 45. This tool lays that full checklist out on your calendar.',
    },
    {
      question: 'Is there a free blog launch checklist?',
      answer:
        'Yes - this 90-Day Blog Launch Planner is completely free with no signup. Enter your launch date and niche to get the dated 12-milestone grid instantly.',
    },
    {
      question: 'How do you use a blog launch checklist?',
      answer:
        'Start with the earliest pre-launch milestone (60 days out) and work forward in date order, completing each milestone before launch day. After launch, keep following the post-launch milestones to build a steady publishing rhythm.',
    },
    {
      question: 'How does a blog launch checklist work?',
      answer:
        'It maps fixed launch milestones - like setting up hosting, writing cornerstone posts, and sending your first newsletter - onto your actual launch date using date arithmetic. You get a dated action plan instead of a generic to-do list.',
    },
    {
      question: 'How does the blog launch checklist work?',
      answer:
        'Enter your details using the inputs above and the blog launch checklist calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the blog launch checklist free to use?',
      answer:
        'Yes - this blog launch checklist is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a blog launch checklist?',
      answer:
        'A blog launch checklist is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Milestones come from a fixed template - they are not personalized advice for your niche or market.',
    'Past launch dates are flagged in the summary; enter a future date to plan a real upcoming launch.',
  ],
  jsonLd: [
        {
          '@type': 'ListItem',
          position: 4,
          name: '90-Day Blog Launch Planner',
          item: 'https://husnainblogger.com/tools/ai-workflows/90-day-blog-launch-planner/',
        },
      ],
    },
  ],
};
