import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/anchor-text-diversity-analyzer/';

export const inputs: ToolInput[] = [
  {
    id: 'anchors',
    label: 'Anchors (one per line)',
    type: 'textarea',
    required: true,
    placeholder: 'best running shoes | https://example.com/shoes\nclick here | https://example.com/more',
    validation: { max: 300000 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'exactMatchRatio',
    label: 'Exact-match ratio (%)',
    type: 'percent',
    description:
    'Share of anchors using the single most-used anchor text (0–100).',
  keywords: ['anchor text and linking checker', 'anchor text code', 'anchor text distribution checker', 'anchor text example', 'anchor text ratio checker'],
  },
  {
    id: 'entropy',
    label: 'Shannon entropy (bits)',
    type: 'number',
    description:
    'Diversity of anchor texts in bits — higher means more varied anchors.',
  },
  {
    id: 'distribution',
    label: 'Anchor distribution',
    type: 'table',
    description:
    'Every unique anchor text with its type (exact-match, naked-url, generic, partial), count, and share.',
  },
  {
    id: 'riskFlags',
    label: 'Risk flags',
    type: 'list',
    description:
    'Editorial warnings when concentration, entropy, or naked/generic shares cross our thresholds.',
  },
];

export const content: ToolContent = {
  title: 'Anchor Text Checker',
  description:
    'Free anchor text checker 2026: measure exact-match ratio, Shannon entropy and anchor-type mix with risk flags. — paste anchors, get your report.',
  howTo: [
    'Paste your anchors into the box — one per line, in the format: anchor text | https://example.com/page',
    'Include up to 2,000 anchors; blank lines are ignored.',
    'Run the tool to see the exact-match ratio, Shannon entropy, and the full distribution table.',
    'Review the type column: exact-match, naked-url, generic, or partial — and fix whatever the risk flags call out.',
    'Diversify flagged anchors (rewrite repeats as descriptive variations) and re-run to confirm the ratio dropped.',
  ],
  methodology:
    'Anchor texts are normalized (lowercased, whitespace collapsed) and grouped. Exact-match ratio is the largest group\'s share; entropy is Shannon entropy in bits over the groups. Type labels are our own editorial heuristics, not Google-published rules: naked-url (the text is a URL), generic (one of 28 fixed English phrases like "click here"), exact-match (the most-used text, used 2+ times), partial (everything else). Risk thresholds are editorial: ≥50% concentration, entropy under 1.0 bit, naked-URL or generic share over 30%.',
  examples: [
    {
      title: 'Diverse natural profile',
      inputs: {
        anchors:
          'best running shoes | https://example.com/shoes\ntop trail runners 2026 | https://example.com/trail\nmarathon shoe guide | https://example.com/marathon\nclick here | https://example.com/more',
      },
      note: 'Four unique anchors — high entropy, no risk flags.',
    },
    {
      title: 'Over-optimized profile',
      inputs: {
        anchors:
          'best shoes | https://example.com/\nbest shoes | https://example.com/page2\nbest shoes | https://example.com/page3\nshoe buying guide | https://example.com/guide',
      },
      note: '75% exact-match ratio — triggers the over-concentration flag.',
    },
  ],
  faqs: [
    {
      question: 'What is the best anchor text checker?',
      answer:
        'The best checker quantifies diversity instead of guessing: this free tool reports the exact-match ratio, Shannon entropy in bits, and a per-anchor distribution table with type labels, then flags over-concentration with editorial thresholds it states openly.',
    },
    {
      question: 'Is there a free anchor text checker?',
      answer:
        'Yes — this anchor text checker is completely free with no signup. Paste up to 2,000 anchors as "text | URL" lines and get the ratio, entropy, distribution, and risk flags instantly.',
    },
    {
      question: 'How to check anchor text?',
      answer:
        'List every anchor pointing at your page as "anchor text | URL" lines, paste them into the tool, and read the exact-match ratio and entropy. If one phrase dominates (the tool flags ≥50%), rewrite some anchors as descriptive variations and re-check.',
    },
    {
      question: 'How does an anchor text checker work?',
      answer:
        'It groups your anchors by normalized text, measures the largest group\'s share (exact-match ratio) and the Shannon entropy across groups, classifies each anchor as naked-url, generic, exact-match, or partial, and raises flags when editorial thresholds are crossed. No Google data is involved — the thresholds are stated heuristics.',
    },
    {
      question: 'What is a good anchor text ratio?',
      answer:
        'There is no Google-published ideal ratio. This tool flags a concentration of 50% or more on a single anchor, entropy under 1.0 bit, and naked-URL or generic shares over 30% — these are editorial thresholds, not Google rules. A natural-looking profile mixes branded, naked-URL, generic and partial anchors.',
    },
    {
      question: 'What is anchor text entropy?',
      answer:
        'Anchor text entropy is the Shannon entropy, measured in bits, across your normalized anchor-text groups — a higher number means a more varied anchor mix. If your entropy falls under 1.0 bit, the tool raises a risk flag suggesting you diversify with descriptive variations.',
    },
    {
      question: 'What do the anchor type labels mean?',
      answer:
        'The tool labels each anchor using fixed heuristics: naked-url means the anchor text is itself a URL, generic means it matches one of 28 fixed English phrases like "click here", exact-match means it is the most-used text appearing 2 or more times, and partial covers everything else.',
    },
  ],
  assumptions: [
    'Type labels and risk thresholds are our own editorial heuristics — they are not Google-published rules and must not be read as SEO advice from Google.',
    '"Exact-match" here means the single most-used anchor text in your list; the tool has no target-keyword input, so it cannot know your intended keyword.',
    'The generic-phrase bank is English-only (28 phrases); non-English generic anchors will be labeled partial.',
  ],
  jsonLd: [],
};
