import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/video-length-sweet-spot-finder/';

const DESCRIPTION =
  'Find the best youtube video length for your format — estimated duration bands, retention guidance and rationale from third-party benchmarks. Plan smarter now.';

export const inputs: ToolInput[] = [
  {
    id: 'contentType',
    label: 'Content type',
    type: 'select',
    required: true,
    options: [
      'tutorial',
      'review',
      'vlog',
      'essay',
      'shorts',
    ],
  },
  {
    id: 'topicDepth',
    label: 'Topic depth',
    type: 'select',
    required: true,
    options: [
      'quick-answer',
      'deep-dive',
    ],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'durationRange', label: 'Suggested duration range', type: 'text' },
  { id: 'minMinutes', label: 'Min minutes', type: 'number' },
  { id: 'maxMinutes', label: 'Max minutes', type: 'number' },
  { id: 'rationale', label: 'Why this range', type: 'list' },
  { id: 'retentionEstimate', label: 'Retention estimate (labeled)', type: 'text' },
  { id: 'disclaimer', label: 'Honesty disclaimer', type: 'text' },
];

export const content: ToolContent = {
  title: 'Best Youtube Video Length | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Pick your content type: tutorial, review, vlog, video essay, or Shorts.',
    'Pick your topic depth: quick-answer for one-problem videos, deep-dive for thorough coverage.',
    'Run the finder to get your suggested duration band with a minimum and maximum.',
    'Read the rationale bullets to understand why that range fits your format.',
    'Treat the labeled retention estimate as a planning starting point — then verify against your own channel analytics.',
  ],
  methodology:
    'The tool looks up a fixed 10-entry guidance table (5 content types × 2 topic depths) written from publicly reported third-party creator retention benchmarks. It is a planning heuristic, not YouTube-published data: YouTube publishes no official optimal-video-length figures, and the tool has no access to your channel analytics, so no personalized recommendation is possible.',
  examples: [
    {
      title: 'Quick tutorial',
      inputs: { contentType: 'tutorial', topicDepth: 'quick-answer' },
      note: 'Single-problem tutorials get a 5–8 minute band — long enough to show steps, short enough to avoid padding.',
    },
    {
      title: 'Deep video essay',
      inputs: { contentType: 'essay', topicDepth: 'deep-dive' },
      note: 'Essays are the one format where length is a feature — the band stretches to 15–30 minutes with act-structure guidance.',
    },
    {
      title: 'Shorts',
      inputs: { contentType: 'shorts', topicDepth: 'quick-answer' },
      note: 'Shorts ignore depth — anything over 60 seconds is not a Short, so the band is 15–35 seconds regardless.',
    },
  ],
  faqs: [
    {
      question: 'what is the best best youtube video length?',
      answer:
        'There is no single best length — it depends on format and depth. As a starting band: quick tutorials 5–8 minutes, deep dives 10–20, reviews 6–18 depending on depth, essays up to 30. This free tool maps your content type and depth to an estimated band with rationale.',
    },
    {
      question: 'is there a free best youtube video length?',
      answer:
        'Yes — this finder is completely free with no signup. Choose your content type and topic depth to get a duration band, rationale bullets, and a labeled retention estimate.',
    },
    {
      question: 'how to use best youtube video length?',
      answer:
        'Pick your content type and topic depth in the tool, take the suggested duration band as your editing target, then check your own channel analytics — audience retention on your past videos is the only real answer for your audience.',
    },
    {
      question: 'How does the best youtube video length work?',
      answer:
        'Enter your details using the inputs above and the best youtube video length calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the best youtube video length free to use?',
      answer:
        'Yes - this best youtube video length is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a best youtube video length?',
      answer:
        'A best youtube video length is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the best youtube video length?',
      answer:
        'No account needed. Open the best youtube video length, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Bands are generic guidance from third-party benchmark estimates, not YouTube-published optima and not predictions of your video\'s performance.',
    'No personalized recommendation is possible without your channel analytics; treat output as a starting plan.',
    'Retention figures are estimates compiled from publicly reported creator benchmarks, labeled as such in every result.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Best Youtube Video Length 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
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
        { '@type': 'ListItem', position: 3, name: 'YouTube Tools', item: 'https://husnainblogger.com/tools/youtube/' },
        { '@type': 'ListItem', position: 4, name: 'Video Length Sweet-Spot Finder', item: TOOL_URL },
      ],
    },
  ],
};
