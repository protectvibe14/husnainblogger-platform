import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  { id: 'photo', label: 'I have a clear profile photo or logo', type: 'boolean', required: false },
  { id: 'bio', label: 'My bio is descriptive and has niche keywords', type: 'boolean', required: false },
  { id: 'link', label: 'I have a link in bio (or link page)', type: 'boolean', required: false },
  { id: 'handle', label: 'My handle is consistent across platforms', type: 'boolean', required: false },
  { id: 'cta', label: 'My profile has a clear call-to-action', type: 'boolean', required: false },
  { id: 'pinned', label: 'I have pinned / featured content', type: 'boolean', required: false },
  { id: 'contact', label: 'Contact info or email is visible', type: 'boolean', required: false },
  { id: 'highlights', label: 'Highlights / banner are organized', type: 'boolean', required: false },
];

export const outputs: ToolOutput[] = [
  { id: 'score', label: 'Completeness score (0–100)', type: 'number' },
  { id: 'grade', label: 'Grade', type: 'text' },
  { id: 'itemStatus', label: 'Per-item status', type: 'list' },
  { id: 'priorities', label: 'Fix these first', type: 'list' },
  { id: 'heuristicNote', label: 'Honesty note', type: 'text' },
];

const DESCRIPTION =
  'Audit your presence with this social profile completeness checker — bio, links, and visuals scored across every platform. Fix gaps costing followers.';

export const content: ToolContent = {
  title: 'Social Profile Completeness Checker',
  description: DESCRIPTION,
  howTo: [
    'Pick the social profile you want to audit (Instagram, TikTok, YouTube, X — the checklist works for all).',
    'Tick every checkbox that is true for that profile — be honest, the tool can only score what you report.',
    'Run the check to get a 0–100 completeness score and a grade from Complete to Incomplete.',
    'Work through the "Fix these first" list in order — it is sorted by impact.',
    'Re-run after fixing items until you reach Complete.',
  ],
  methodology:
    'Eight checklist items are weighted by editorial judgment based on creator-growth guide consensus (not platform-published requirements): clear profile photo/logo (15 pts), descriptive bio with keywords (15), link in bio (15), consistent handle across platforms (15), clear call-to-action (10), pinned/featured content (10), visible contact info (10), organized highlights/banner (10). Score = sum of weights for checked items. Grades: Complete 90+, Strong 75+, Needs work 50+, Incomplete below 50. All inputs are self-reported — the tool cannot fetch your profiles.',
  examples: [
    {
      title: 'Complete creator profile',
      inputs: {
        photo: true, bio: true, link: true, handle: true,
        cta: true, pinned: true, contact: true, highlights: true,
      },
      note: 'Scores 100 (Complete): every checklist item covered.',
    },
    {
      title: 'New account, basics only',
      inputs: {
        photo: true, bio: false, link: false, handle: true,
        cta: false, pinned: false, contact: false, highlights: false,
      },
      note: 'Scores 30 (Incomplete): priorities list shows bio, link, and CTA as the highest-impact fixes.',
    },
  ],
  faqs: [
    {
      question: 'What makes a complete social media profile?',
      answer:
        'The essentials: a clear photo or logo, a keyword-rich bio, a link in bio, a consistent handle, a clear call-to-action, pinned best content, visible contact info, and organized highlights or a banner. This checker scores all eight.',
    },
    {
      question: 'Can this tool check my actual Instagram profile?',
      answer:
        'No — and no browser tool can. Instagram offers no public API for profile audits, and scraping violates their terms. This tool scores what you self-report via the checklist, which is the honest client-side approach.',
    },
    {
      question: 'Why does contact info matter on a creator profile?',
      answer:
        'Brands and sponsors need a way to reach you for paid deals. Creators without a visible business email routinely miss inbound partnership offers — it carries 10 of the 100 points here.',
    },
    {
      question: 'What is a social profile completeness checker?',
      answer:
        'A social profile completeness checker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the social profile completeness checker?',
      answer:
        'No account needed. Open the social profile completeness checker, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'Why does social profile completeness checker matter?',
      answer: 'It directly affects your visibility, credibility, and results. Poor scores mean missed opportunities; the checker shows you where you stand and how to improve.',
    },
    {
      question: 'How do I check social profile completeness checker?',
      answer: 'Paste or enter your content above and the checker analyzes it instantly. Review the results and apply the suggested fixes.',
    },
  ],
  assumptions: [
    'All inputs are self-reported — the tool cannot fetch or verify your actual profiles.',
    'Weights are editorial, based on creator-growth guide consensus — not requirements published by any platform.',
    'The same 8 items apply across Instagram, TikTok, YouTube, and X with minor interpretation differences (e.g. highlights vs banner).',
    'Completeness is not a growth guarantee — it measures first-impression readiness, not content quality or algorithm favor.',
  ],
  jsonLd: [],
};
