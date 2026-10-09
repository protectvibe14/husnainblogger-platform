import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'cta',
    label: 'CTA text',
    type: 'text',
    required: true,
    placeholder: 'e.g. Get your free template now',
    validation: { max: 200 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'score', label: 'CTA score (0–100)', type: 'number' },
  { id: 'grade', label: 'Grade', type: 'text' },
  { id: 'factorResults', label: 'Per-factor results', type: 'list' },
  { id: 'summary', label: 'Quick summary', type: 'text' },
  { id: 'heuristicNote', label: 'Honesty note', type: 'text' },
];

const DESCRIPTION =
  'Free cta strength analyzer 2026: get instant results in your browser. Instant, private, and mobile-friendly. No signup - try it free!';

export const content: ToolContent = {
  title: 'CTA Strength Analyzer',
  description: DESCRIPTION,
  howTo: [
    'Paste your CTA text — usually the exact button or link label.',
    'Run the analysis to get a 0–100 score and a grade from Excellent to Poor.',
    'Fix FAIL items first: add a strong action verb, cut to 8 words or fewer, name the benefit.',
    'Replace weak patterns ("click here", "submit", "learn more") with verb + benefit + urgency.',
    'Re-run after rewriting until weak patterns are gone.',
  ],
  methodology:
    'Five fixed factors score out of 100: action verb — the CTA contains a strong verb (get, start, download, try, join…) matched as a whole word (25 pts); clarity — 8 or fewer words scores full marks, 9–12 partial, 13+ low (20 pts); urgency — contains urgency words (now, today, limited, last chance) for 15 pts, with a note that false urgency hurts trust (15 pts); benefit mention — contains a benefit word (free, save, bonus, exclusive…) for 20 pts (20 pts); weak-CTA penalty — starts at 20, minus 10 per weak pattern ("click here", "submit", "learn more"/"read more" alone, trailing ellipsis, no verb at all), floor 0 (20 pts). Grades: Excellent 85+, Good 70+, Needs work 50+, Poor below 50. CTA effectiveness also depends on audience, placement, and offer — which no text-only tool can see — so this scores observable copy best practices only.',
  examples: [
    {
      title: 'Strong CTA',
      inputs: { cta: 'Get your free template now' },
      note: 'Scores 85+ (Excellent): action verb "get", 5 words, urgency "now", benefit "free", no weak patterns.',
    },
    {
      title: 'Weak CTA',
      inputs: { cta: 'Click here' },
      note: 'Scores below 50 (Poor): no action verb, "click here" weak pattern, no benefit or urgency.',
    },
  ],
  faqs: [
    {
      question: 'What makes a strong CTA?',
      answer:
        'A strong CTA has a clear action verb (get, start, download), stays under 8 words, names the benefit (free, save, bonus), and adds honest urgency when the offer is time-bound. Vague labels like "click here" or "submit" consistently underperform.',
    },
    {
      question: 'How long should CTA button text be?',
      answer:
        'Aim for 8 words or fewer — ideally 2–5. Button CTAs must be scannable at a glance; longer explanations belong in the surrounding copy, not the button.',
    },
    {
      question: 'Is "click here" bad for a CTA?',
      answer:
        'Yes — it describes the mechanics (clicking) instead of the outcome (what the reader gets). Replace it with verb + benefit, e.g. "Get your free template" instead of "Click here".',
    },
    {
      question: 'How does the cta strength analyzer work?',
      answer:
        'Enter your details using the inputs above and the cta strength analyzer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the cta strength analyzer free to use?',
      answer:
        'Yes - this cta strength analyzer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a cta strength analyzer?',
      answer:
        'A cta strength analyzer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the cta strength analyzer?',
      answer:
        'No account needed. Open the cta strength analyzer, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The score is a heuristic — actual conversion depends on audience, placement, design, and offer, which no text-only tool can see.',
    'Verb, urgency, and benefit word lists are heuristic and English-only.',
    'Verb matching is whole-word, so "forget" does not match the verb "get".',
    'Urgency is rewarded as a copy signal — but false urgency ("ending soon" on a permanent offer) damages trust; the output says so.',
    'The tool analyzes text only; it cannot see your button design or page context.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'CTA Strength Analyzer 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/creator-business/cta-strength-analyzer/',
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
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Creator Business Tools',
          item: 'https://husnainblogger.com/tools/creator-business/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'CTA Strength Analyzer',
          item: 'https://husnainblogger.com/tools/creator-business/cta-strength-analyzer/',
        },
      ],
    },
  ],
};
