import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

// tool-216 — Hashtag Performance Log. Builder tool: inputs: [] (uses itemFields).

export const inputs: ToolInput[] = [];

export const trackerMode: 'log' = 'log';

export const outputs: ToolOutput[] = [
  { id: 'totalReach', label: 'Total reach across logged sets', type: 'number' },
  { id: 'avgEngagementRate', label: 'Average engagement rate', type: 'percent' },
  { id: 'bestSetLabel', label: 'Best-performing set', type: 'text' },
  { id: 'setCount', label: 'Sets logged', type: 'number' },
];

export const itemFields: BuilderField[] = [
  { id: 'setLabel', label: 'Hashtag set label', type: 'text', required: true, placeholder: 'e.g. fitness-core-set' },
  { id: 'date', label: 'Date posted', type: 'text', required: true, placeholder: 'YYYY-MM-DD' },
  { id: 'reach', label: 'Reach (user-entered)', type: 'text', required: true, placeholder: 'e.g. 12000' },
  { id: 'likes', label: 'Likes (user-entered)', type: 'text', required: true, placeholder: 'e.g. 480' },
  { id: 'comments', label: 'Comments (user-entered)', type: 'text', required: true, placeholder: 'e.g. 96' },
  { id: 'posts', label: 'Posts that used this set (optional)', type: 'text', required: false, placeholder: 'e.g. 8' },
];

export const content: ToolContent = {
  title: 'Instagram Hashtag Tracker',
  description:
    'Track which hashtag sets drive your reach with this free instagram hashtag tracker manual log: enter reach, likes, and comments per set to compare. Try it now.',
  howTo: [
    'Add one log entry per hashtag set: give the set a label (e.g. "fitness-core-set").',
    'Enter the posting date and the reach, likes, and comments you recorded for that set.',
    'Optionally add how many posts used the set.',
    'Run the tool to see total reach, average engagement rate, and your best-performing set.',
    'Keep logging new sets over time — the more sets you enter, the fairer the comparison.',
  ],
  methodology:
    'Every number is entered by you — the tool cannot pull real hashtag reach from Instagram and performs no estimation. It sums your reach entries, computes engagement rate as (likes + comments) ÷ reach × 100 across all sets, and names the set with the highest per-set rate as the best performer.',
  faqs: [
    {
      question: 'What is the best instagram hashtag tracker?',
      answer:
        'This free tool is a manual log: you enter the reach, likes, and comments you see in Instagram Insights for each hashtag set, and it ranks your sets by engagement rate. It is honest about its limits — it cannot pull hashtag reach automatically from Instagram.',
    },
    {
      question: 'Is there a free instagram hashtag tracker?',
      answer:
        'Yes — this tool is free and runs entirely in your browser. You log each hashtag set manually with its reach, likes, and comments, and the tool compares sets by engagement rate.',
    },
    {
      question: 'How to track instagram hashtag?',
      answer:
        'Use one consistent set of hashtags per post for a while, note the reach in Instagram Insights, then log that set here with its likes and comments. Repeat for other sets; the tool totals reach and shows which set earned the highest engagement rate.',
    },
    {
      question: 'How does the instagram hashtag tracker work?',
      answer:
        'Enter your details using the inputs above and the instagram hashtag tracker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the instagram hashtag tracker free to use?',
      answer:
        'Yes - this instagram hashtag tracker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an instagram hashtag tracker?',
      answer:
        'An instagram hashtag tracker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the instagram hashtag tracker?',
      answer:
        'No account needed. Open the instagram hashtag tracker, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Manual entry only — this tool CANNOT pull real hashtag reach from Instagram; all metrics are entered by you.',
    'Engagement rate = (likes + comments) ÷ reach × 100, computed from your entered numbers only.',
    'Results compare only the sets you log; reach is also affected by content, timing, and followers.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Instagram Hashtag Tracker 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/instagram/hashtag-performance-log/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Track which hashtag sets drive your reach with this free instagram hashtag tracker manual log: enter reach, likes, and comments per set to compare. Try it now.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Instagram Tools',
          item: 'https://husnainblogger.com/tools/instagram/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Instagram Hashtag Tracker',
          item: 'https://husnainblogger.com/tools/instagram/hashtag-performance-log/',
        },
      ],
    },
  ],
};
