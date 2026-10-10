import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/topical-authority-map-builder/';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'coreTopic',
    label: 'Core topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. email marketing',
  },
  {
    id: 'subtopics',
    label: 'Subtopics (optional)',
    type: 'text',
    required: false,
    placeholder: 'One per line or comma-separated, e.g.\nlist building\nemail copywriting\n\nLeave blank for auto-generated starter clusters.',
  },
  {
    id: 'depth',
    label: 'Depth (1-3, default 2)',
    type: 'text',
    required: false,
    placeholder: '2',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'result',
    label: 'Topical map (Markdown)',
    type: 'copy',
    description:
    'The full topical map — pillar, clusters, article titles, and gaps — as copyable Markdown.',
  keywords: ['topical authority map generator'],
  },
  {
    id: 'clusters',
    label: 'Clusters',
    type: 'list',
    description:
    'Cluster names with their article counts.',
  },
  {
    id: 'coverageGaps',
    label: 'Coverage gaps',
    type: 'list',
    description:
    'Common content angles none of your subtopics cover yet.',
  },
];

export const content: ToolContent = {
  title: 'Topical Authority Map',
  description:
    'Free topical authority map 2026: turn your core topic into a pillar page and article cluster plan with coverage gaps. Export as Markdown. Fast & free.',
  howTo: [
    'Add one item per core topic, e.g. email marketing (2–120 characters).',
    'Optionally list your subtopics — one per line or comma-separated, up to 30 — or leave blank for auto-generated starter clusters.',
    'Optionally set depth 1, 2, or 3 (default 2): deeper maps add supporting articles and FAQ questions.',
    'Run the tool to get the full map as copyable Markdown: pillar page, clusters, article titles, and coverage gaps.',
    'Treat the output as a planning structure — it does not measure real authority or competition.',
  ],
  methodology:
    'The tool cleans and dedupes your subtopics, then groups them into clusters with a transparent rule: subtopics sharing a significant word (4+ letters) join the same cluster, transitively. Article titles come from fixed banks — 10 supporting-angle templates, 3 FAQ templates, and 4 starter clusters for when no subtopics are given — nothing is written by AI. Coverage gaps are the fixed 10 content angles none of your subtopics mention. Honest limitation: this builds a planning structure only — it does not measure real topical authority, search volume, or competition.',
  faqs: [
    {
      question: 'what is the best topical authority map?',
      answer:
        'The best topical authority map shows a pillar page, grouped article clusters, and the gaps you have not covered yet — built with transparent rules. This free tool does that from your own topics with no signup.',
    },
    {
      question: 'is there a free topical authority map?',
      answer:
        'Yes — this topical authority map builder is completely free with no signup. Enter a core topic, optionally add subtopics and a depth level, and get a full map as copyable Markdown instantly.',
    },
    {
      question: 'how to use topical authority?',
      answer:
        'Start with one core topic, list the subtopics you want to cover, and generate the map. Use the cluster structure to plan pillar and supporting articles, then fill the reported coverage gaps — beginner guides, comparisons, FAQs — with genuinely useful content.',
    },
    {
      question: 'how does a topical authority map work?',
      answer:
        'This one groups your subtopics into clusters using a published rule — subtopics sharing a significant word join the same cluster — then attaches article titles from fixed template banks at your chosen depth. It is a planning structure, not a measurement: it cannot tell you how much authority your site actually has.',
    },
    {
      question: 'What is topical authority in SEO?',
      answer:
        'Topical authority means covering a subject so thoroughly that search engines trust your site on it — usually with a pillar page supported by interlinked cluster articles. This builder turns your core topic into that structure: a pillar, grouped subtopic clusters, and the angles you have not covered yet.',
    },
    {
      question: 'Does topical authority actually improve rankings?',
      answer:
        'There is no public metric proving a causal score, but sites that cover a topic comprehensively tend to earn stronger internal linking and broader keyword coverage. This tool builds the planning structure — the map only — so verify competition and search demand before writing.',
    },
    {
      question: 'How many articles do I need for a topical authority map?',
      answer:
        'It depends on the topic\'s breadth, which is why the tool lets you set depth 1–3: deeper maps attach more supporting articles and FAQ questions to each cluster. Start with depth 2, fill the reported coverage gaps first, and expand the clusters that earn traffic.',
    },
  ],
  assumptions: [
    'A planning structure only — it does not measure real topical authority, search volume, keyword difficulty, or competition.',
    'Article titles are fixed templates; rewrite them for your site and verify against your CMS conventions.',
    'Clustering uses simple shared-word overlap (words of 4+ letters, no stemming) and may split or merge topics an editor would handle differently.',
  ],
  jsonLd: [],
};
