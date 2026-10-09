import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/profile-audit-scorecard/';

const ANSWER_OPTIONS = ['Yes', 'Partially', 'No', 'N/A'];

const CRITERION_LABELS: Array<[string, string]> = [
  ['name-keyword', 'Name field contains a searchable keyword (who you help)'],
  ['profile-photo', 'Profile photo is clear and recognizable'],
  ['bio-who-help', 'Bio says who you help and what you do'],
  ['bio-niche', 'Bio focuses on one clear niche, not generic claims'],
  ['bio-readable', 'Bio is readable (line breaks, no clutter)'],
  ['bio-link-cta', 'Bio has one link and a clear next step'],
  ['grid-recent', 'Posted in the last 14 days'],
  ['grid-consistent', 'Grid looks consistent and on-brand'],
  ['grid-pinned', 'Pinned posts used strategically (start-here, proof, offer)'],
  ['hl-covers', 'Highlights have clean, consistent covers'],
  ['hl-organized', 'Highlights organized by topic (services, reviews, FAQ)'],
  ['hl-fresh', 'Highlights updated in the last 60 days'],
  ['cta-clear', 'Profile has one clear call to action'],
  ['cta-contact', 'Contact method visible (DM prompt, email, or action buttons)'],
  ['cta-single-link', 'One focused link in bio, not a cluttered list'],
];

export const inputs: ToolInput[] = CRITERION_LABELS.map(([id, label]) => ({
  id,
  label,
  type: 'select' as const,
  required: true,
  options: ANSWER_OPTIONS,
}));

export const outputs: ToolOutput[] = [
  {
    id: 'totalScore',
    label: 'Profile score',
    type: 'number',
    description: 'Free instagram profile audit 2026: Your audit score, 0–100. A manual self-audit estimate. Instant, private, and mobile-friendly. No signup - try it free!',
  },
  {
    id: 'grade',
    label: 'Grade',
    type: 'text',
    description: 'Profile-Ready (85+), Solid (70–84), Needs work (50–69), or Rebuild (below 50).',
  },
  {
    id: 'perSectionBreakdown',
    label: 'Section breakdown',
    type: 'table',
    description: 'Points earned per section: Name & identity, Bio, Grid, Highlights, CTA.',
  },
  {
    id: 'prioritizedFixes',
    label: 'Prioritized fixes',
    type: 'list',
    description: 'What to fix first, ordered by impact — with concrete tips.',
  },
];

export const content: ToolContent = {
  title: 'Instagram Profile Audit',
  description:
    'Run a free instagram profile audit: score your bio, name, grid, highlights, and CTA on a published rubric, get a 0–100 score and prioritized fixes. Try it now!',
  howTo: [
    'Open your Instagram profile in another tab so you can answer honestly.',
    'Work through the 15 checklist questions — pick "Yes", "Partially", "No", or "N/A" for anything that does not apply to you.',
    'Run the tool to get your 0–100 score, your grade (Profile-Ready, Solid, Needs work, or Rebuild), and the per-section breakdown.',
    'Start with the first item in "Prioritized fixes" — the list is ordered by impact, so fix from the top down.',
    'Re-audit after making changes to watch your score rise.',
  ],
  methodology:
    'This is a transparent, fully client-side rubric scorer — not an AI judge and not connected to Instagram: it cannot fetch your profile; you answer 15 fixed checklist questions across five sections (Name & identity, Bio, Grid, Highlights, CTA). Each criterion has a weight of 1 or 2 (total weight 21, max 42 points): Yes = 2 points, Partially = 1, No = 0, and N/A excludes the item from the denominator (the count is reported). The score is round(earned / possible × 100). Bands: 85–100 Profile-Ready, 70–84 Solid, 50–69 Needs work, 0–49 Rebuild. Fix tips are fixed, rule-based suggestions attached to each criterion — never generated.',
  examples: [
    {
      title: 'Strong profile',
      inputs: {
        'name-keyword': 'Yes',
        'profile-photo': 'Yes',
        'bio-who-help': 'Yes',
        'bio-niche': 'Yes',
        'bio-readable': 'Yes',
        'bio-link-cta': 'Yes',
        'grid-recent': 'Yes',
        'grid-consistent': 'Yes',
        'grid-pinned': 'Yes',
        'hl-covers': 'Yes',
        'hl-organized': 'Yes',
        'hl-fresh': 'Yes',
        'cta-clear': 'Yes',
        'cta-contact': 'Yes',
        'cta-single-link': 'Yes',
      },
      note: 'A fully optimized profile scoring 100 — Profile-Ready.',
    },
    {
      title: 'New account, mostly No',
      inputs: {
        'name-keyword': 'No',
        'profile-photo': 'Yes',
        'bio-who-help': 'No',
        'bio-niche': 'No',
        'bio-readable': 'Partially',
        'bio-link-cta': 'No',
        'grid-recent': 'No',
        'grid-consistent': 'No',
        'grid-pinned': 'No',
        'hl-covers': 'No',
        'hl-organized': 'No',
        'hl-fresh': 'N/A',
        'cta-clear': 'No',
        'cta-contact': 'No',
        'cta-single-link': 'Yes',
      },
      note: 'A low score with a prioritized fix list — start at the top.',
    },
  ],
  faqs: [
    {
      question: 'What is the best instagram profile audit?',
      answer:
        'The best audit is a transparent one: it shows exactly what it measures. This instagram profile audit scores 15 fixed criteria across your name, bio, grid, highlights, and call to action with a published rubric, and tells you exactly which fix to make first.',
    },
    {
      question: 'Is there a free instagram profile audit?',
      answer:
        'Yes — this Profile Audit Scorecard is completely free with no signup. Answer the 15 checklist questions and get a 0–100 score, a grade, a section breakdown, and prioritized fixes instantly.',
    },
    {
      question: 'How to use instagram profile?',
      answer:
        'Open your profile alongside the tool, answer each of the 15 questions honestly (Yes, Partially, No, or N/A), then run the audit. Work through the prioritized fixes from the top down — they are ordered by impact — and re-audit after each round of changes.',
    },
    {
      question: 'How does the instagram profile audit work?',
      answer:
        'Enter your details using the inputs above and the instagram profile audit calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the instagram profile audit free to use?',
      answer:
        'Yes - this instagram profile audit is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an instagram profile audit?',
      answer:
        'An instagram profile audit is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the instagram profile audit?',
      answer:
        'No account needed. Open the instagram profile audit, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'A manual self-audit: the tool cannot fetch or read your real Instagram profile — answers are your own judgment, so answer honestly.',
    'The score is a checklist-based estimate of profile completeness, not a guarantee of growth or followers.',
    'Timeliness criteria ("posted in the last 14 days", "highlights updated in 60 days") rely on your memory, not live data.',
    'The rubric is fixed and English-focused; platform rules (like the 150-character bio limit) may change over time.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Instagram Profile Audit 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free instagram profile audit 2026: Your audit score, 0–100. A manual self-audit estimate. Instant, private, and mobile-friendly. No signup - try it free!',
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
          name: 'Instagram Tools',
          item: 'https://husnainblogger.com/tools/instagram/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Profile Audit Scorecard',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
