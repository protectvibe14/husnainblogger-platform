import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/content-audit-decision-tool/';

export const inputs: ToolInput[] = [
  {
    id: 'pages',
    label: 'Pages (JSON)',
    type: 'textarea',
    required: true,
    placeholder:
      '[{"url":"https://yoursite.com/post","trafficTrend":7,"conversions":5,"quality":8,"cannibalizationRisk":3}]',
  },
  {
    id: 'weights',
    label: 'Weights (optional JSON)',
    type: 'text',
    required: false,
    placeholder: 'e.g. {"quality": 2} — leave blank for equal weights',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'decisions',
    label: 'Decisions',
    type: 'table',
    description:
    'One row per page: URL, 0-10 score, keep/update/merge/delete recommendation and the reason.',
  keywords: ['content analysis tool', 'content analysis tool for research', 'content analysis tool free', 'content assessment tool sas', 'content audit template'],
  },
  {
    id: 'summary',
    label: 'Audit summary',
    type: 'text',
    description:
    'Totals per decision and the average score across all audited pages.',
  },
];

export const content: ToolContent = {
  title: 'Content Audit Tool',
  description:
    'Free content audit tool 2026: turn your own page ratings into keep, update, merge or delete decisions with a transparent decision tree. Start now.',
  howTo: [
    'Rate each page 0–10 on four metrics: traffic trend, conversions, quality, and cannibalization risk.',
    'Paste your pages into the Pages box as a JSON array (see the placeholder example).',
    'Optionally set custom weights, e.g. {"quality": 2} — leave blank for equal weights.',
    'Run the tool to get a keep / update / merge / delete recommendation and reason per page.',
    'Sanity-check every "delete" (look at backlinks and external links) before acting.',
  ],
  methodology:
    'The tool applies a fixed, published decision tree to YOUR ratings — it connects to no analytics and measures no real traffic. Score = (wT×trafficTrend + wC×conversions + wQ×quality + wK×(10 − cannibalizationRisk)) / total weight, 0–10. Rules, first match wins: (1) delete when quality ≤3 AND trafficTrend ≤2 AND conversions ≤2; (2) keep when score ≥ 7.5; (3) merge when cannibalizationRisk ≥ 7; (4) update when score ≥ 3; (5) otherwise delete. Decisions are recommendations, not diagnoses; nothing is fetched or verified.',
  examples: [
    {
      title: 'One strong and one weak post',
      inputs: {
        pages:
          '[{"url":"https://example.com/winner","trafficTrend":9,"conversions":8,"quality":9,"cannibalizationRisk":2},{"url":"https://example.com/dud","trafficTrend":1,"conversions":1,"quality":2,"cannibalizationRisk":4}]',
      },
      note: 'Winner → KEEP (score 8.5); dud → DELETE (thin, declining, non-converting).',
    },
    {
      title: 'Overlapping posts',
      inputs: {
        pages:
          '[{"url":"https://example.com/seo-tips","trafficTrend":7,"conversions":6,"quality":8,"cannibalizationRisk":8}]',
      },
      note: 'High overlap risk → MERGE into the strongest page on the topic, then redirect.',
    },
  ],
  faqs: [
    {
      question: 'What is the best content audit tool?',
      answer:
        'No independent test crowns one tool "the best" — audit decisions ultimately rest on your data and judgment. This free tool stands out by publishing its entire decision tree, so you can see exactly why each page got keep, update, merge or delete.',
    },
    {
      question: 'Is there a free content audit tool?',
      answer:
        'Yes — this tool is completely free with no signup. It works in your browser and never connects to your analytics, so you rate pages from your own Google Analytics / Search Console data and it applies a transparent decision tree.',
    },
    {
      question: 'How to use content audit results?',
      answer:
        'Start with the deletes (verify backlinks first), then merges (fold weak pages into the strongest one and redirect), then updates (refresh data, examples and on-page SEO). Keep pages are healthy — leave them alone and spend the effort elsewhere.',
    },
    {
      question: 'What is a content audit in SEO?',
      answer:
        'A content audit reviews every page on your site and decides whether to keep, update, merge, or delete it. This tool applies a published decision tree to your 0–10 ratings for traffic trend, conversions, quality, and cannibalization risk, giving each URL a scored recommendation.',
    },
    {
      question: 'Does this tool connect to Google Analytics?',
      answer:
        'No — it never connects to analytics and measures no real traffic. You rate each page from your own Google Analytics and Search Console data, paste the pages as a JSON array, and the tool applies its fixed rules to your ratings.',
    },
    {
      question: 'How often should you do a content audit?',
      answer:
        'Most blogs audit yearly, or sooner when traffic drops or sections start overlapping. Because this tool works from your ratings and applies its decision tree instantly, you can re-run it any time your data changes without starting over.',
    },
    {
      question: 'Should I delete low-traffic content?',
      answer:
        'Not always — the tool only recommends delete when quality, traffic trend, and conversions are all low. Always check backlinks and external links before deleting, and consider merging weak pages into the strongest one on the topic with a redirect instead.',
    },
  ],
  assumptions: [
    'Recommendations come from your own 0–10 ratings — the tool has no analytics connection and measures no real traffic.',
    'Ratings are your judgments; the tool cannot tell whether they match your real data.',
    'URL check is format-only (must start with http:// or https://); nothing is fetched or verified.',
    'Decisions are recommendations from a fixed rule set, not guarantees — editorial judgment still applies, especially for "delete".',
  ],
  jsonLd: [],
};
