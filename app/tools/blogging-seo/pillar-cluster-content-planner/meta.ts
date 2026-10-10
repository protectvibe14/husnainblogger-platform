import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'pillarTopic',
    label: 'Pillar topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. content marketing',
    validation: { min: 2, max: 120 },
  },
  {
    id: 'clusterCount',
    label: 'Number of cluster topics',
    type: 'number',
    required: false,
    placeholder: '8',
    validation: { min: 3, max: 20 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'plan',
    label: 'Topic cluster plan',
    type: 'text',
    description:
    'Free topic cluster planner 2026: Pillar page suggestion, cluster topics with slugs, linking guidance and assumptions. Fast, private now.',
  },
  {
    id: 'clusterTopics',
    label: 'Cluster topics',
    type: 'list',
    description:
    'The planned cluster-topic titles.',
  },
];

export const content: ToolContent = {
  title: 'Topic Cluster Planner',
  description:
    'Plan a pillar-and-cluster content hub in seconds: one pillar page plus 3-20 cluster topics with slugs and linking notes. Free — plan your hub now.',
  howTo: [
    'Type your broad pillar topic into the Pillar Topic field (2-120 characters).',
    'Optionally set how many cluster topics you want (3-20, default 8).',
    'Click Generate to assemble the plan from fixed topic templates.',
    'Review the pillar title suggestion, cluster titles, suggested slugs and linking note.',
    'Validate every cluster topic with a keyword tool before writing — this planner does no keyword research.',
  ],
  methodology:
    'The planner fills a fixed bank of 24 cluster-topic templates with your pillar topic and takes the first N in bank order (N = your cluster count, default 8) — no randomness, no AI. Slugs are built by lowercasing, stripping diacritics from Latin script, and hyphenating; collisions get a numeric suffix. The linking note is a standard pillar<->cluster structural convention. Nothing is fetched from the web and no search data is consulted.',
  examples: [
    {
      title: 'Default 8-cluster plan',
      inputs: { pillarTopic: 'content marketing' },
      note: 'Produces a pillar page suggestion plus 8 cluster topics like "What is content marketing? A beginner\'s overview".',
    },
    {
      title: 'Small focused hub',
      inputs: { pillarTopic: 'email newsletters', clusterCount: 5 },
      note: 'Produces 5 cluster topics with unique slugs and a linking note.',
    },
    {
      title: 'Large hub',
      inputs: { pillarTopic: 'home gardening', clusterCount: 20 },
      note: 'Uses the full 24-template bank capacity for a 20-topic cluster plan.',
    },
  ],
  faqs: [
    {
      question: 'What is the best topic cluster planner?',
      answer:
        'There is no independently verified "best" — judge them on honesty. This free planner is explicit about what it does: it fills fixed templates with your pillar topic to sketch a hub structure. It does not do keyword research, search-volume checks or SERP analysis, which is what paid SEO suites add.',
    },
    {
      question: 'Is there a free topic cluster planner?',
      answer:
        'Yes — this one is completely free with no signup. It generates 3-20 cluster topics around your pillar, with suggested slugs and linking guidance, in your browser. Validate the topics with a keyword tool before writing, since the planner uses no search data.',
    },
    {
      question: 'How to plan topic cluster?',
      answer:
        'Pick one broad pillar topic, list 5-15 narrower subtopics that each deserve their own post, and plan to link every cluster post to the pillar and back. Enter your pillar above and the tool drafts the cluster list, suggested slugs and the linking structure for you.',
    },
    {
      question: 'How does a topic cluster planner work?',
      answer:
        'This one fills a fixed bank of 24 cluster-topic templates (e.g. "What is {pillar}?", "{pillar} vs. alternatives") with your pillar topic and returns the first N in order, plus suggested slugs and a pillar<->cluster linking note. It is template assembly, not AI and not keyword research.',
    },
    {
      question: 'How does the topic cluster planner work?',
      answer:
        'Enter your details using the inputs above and the topic cluster planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the topic cluster planner free to use?',
      answer:
        'Yes - this topic cluster planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a topic cluster planner?',
      answer:
        'A topic cluster planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Cluster topics come from a fixed bank of 24 templates — planning starting points, not keyword research.',
    'The tool does not check search volume, keyword difficulty, or SERPs; validate every topic with a keyword tool.',
    'Suggested slugs and titles are starting templates — verify against the site\'s CMS and URL conventions before publishing.',
    'The linking note is a structural convention, not a ranking guarantee.',
  ],
  jsonLd: [
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Pillar-Cluster Content Planner',
          item: 'https://husnainblogger.com/tools/blogging-seo/pillar-cluster-content-planner/',
        },
      ],
    },
  ],
};
