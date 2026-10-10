import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'title',
    label: 'Page title (title tag)',
    type: 'text',
    required: true,
    placeholder: 'e.g. Best Sourdough Bread Recipe for Beginners at Home',
  },
  {
    id: 'description',
    label: 'Meta description',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. Learn how to bake the best sourdough bread with this step-by-step beginner guide…',
    validation: { max: 500 },
  },
  {
    id: 'keyword',
    label: 'Primary keyword',
    type: 'text',
    required: false,
    placeholder: 'e.g. sourdough bread recipe',
  },
  {
    id: 'ogTitle',
    label: 'og:title tag present',
    type: 'boolean',
    required: false,
  },
  {
    id: 'ogDescription',
    label: 'og:description tag present',
    type: 'boolean',
    required: false,
  },
  {
    id: 'ogImage',
    label: 'og:image tag present',
    type: 'boolean',
    required: false,
  },
];

export const outputs: ToolOutput[] = [
  { id: 'score', label: 'SEO meta score (0–100)', type: 'number' },
  { id: 'grade', label: 'Grade', type: 'text' },
  { id: 'checkResults', label: 'Per-check results', type: 'list' },
  { id: 'lengths', label: 'Character counts vs ideals', type: 'text' },
  { id: 'heuristicNote', label: 'Honesty note', type: 'text' },
];

const DESCRIPTION =
  'Audit your pages with this SEO meta tag analyzer — title, description, and Open Graph tags checked against best practices. Fix ranking issues. Try it now!';

export const content: ToolContent = {
  title: 'SEO Meta Tag Analyzer',
  description: DESCRIPTION,
  howTo: [
    'Paste your page title (the <title> tag) into the title field.',
    'Paste your meta description into the description field — leave it empty to see how a missing description scores.',
    'Enter your primary keyword to check placement in the title and description.',
    'Tick the Open Graph checkboxes for the tags your page actually has (check your page source).',
    'Run the analysis to get a 0–100 score, per-check pass/warn/fail verdicts, and exact character counts.',
  ],
  methodology:
    'Six fixed checks score out of 100: title length — 50–60 characters is the display sweet spot before Google truncates (20 pts); meta description length — 140–155 characters fits the typical desktop snippet (20 pts); primary keyword in the title (15 pts); primary keyword in the description (15 pts); Open Graph tags — 5 pts each for og:title, og:description, og:image, self-reported via checkboxes (15 pts); uniqueness signals — title differs from description, keyword appears at most 3 times total (no stuffing), title is not mostly ALL CAPS (15 pts). Grades: Excellent 85+, Good 70+, Needs work 50+, Poor below 50. The character ranges are display guidelines from SEO industry consensus, not ranking factors published by Google — the tool labels them as such.',
  examples: [
    {
      title: 'Well-optimized meta tags',
      inputs: {
        title: 'Best Sourdough Bread Recipe for Beginners at Home Today',
        description:
    'Analyze your meta tags free — check title length, description quality, and missing tags. Get specific fixes to improve click-through rates. Try it now!',
        keyword: 'sourdough bread recipe',
        ogTitle: true,
        ogDescription: true,
        ogImage: true,
      },
      note: 'Scores 85+ (Excellent): title and description inside ideal lengths, keyword in both, all OG tags present.',
    },
    {
      title: 'Missing description, no OG tags',
      inputs: {
        title: 'My Awesome Blog Post About Stuff',
        description:
    '',
        keyword: 'blogging tips',
        ogTitle: false,
        ogDescription: false,
        ogImage: false,
      },
      note: 'Scores poorly: missing description, keyword absent, no Open Graph tags.',
    },
  ],
  faqs: [
    {
      question: 'What is the ideal title tag length for SEO?',
      answer:
        'Aim for 50–60 characters. Google typically truncates titles past about 60 characters in search results, so the 50–60 range keeps your full title visible. This analyzer scores your title against that range.',
    },
    {
      question: 'What is the ideal meta description length?',
      answer:
        'Aim for 140–155 characters, which fits the typical desktop snippet. Longer descriptions get truncated. Note this is a display guideline — Google sometimes rewrites descriptions regardless of length.',
    },
    {
      question: 'Do meta descriptions affect Google rankings?',
      answer:
        'Google has stated meta descriptions are not a direct ranking factor, but they strongly affect click-through rate from search results. A clear, keyword-relevant description inside 140–155 characters earns more clicks.',
    },
    {
      question: 'What is a seo meta tag analyzer?',
      answer:
        'A seo meta tag analyzer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the seo meta tag analyzer?',
      answer:
        'No account needed. Open the seo meta tag analyzer, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'How do I analyze seo meta tag analyzer?',
      answer: 'Enter your content or URL above. The analyzer breaks down the key factors and shows you a clear score with specific improvement suggestions.',
    },
    {
      question: 'What should I look for in the results?',
      answer: 'Focus on the lowest-scoring areas first — those are your quickest wins. The analyzer prioritizes issues by impact so you know where to start.',
    },
  ],
  assumptions: [
    'The 50–60 / 140–155 character ranges are display guidelines from SEO industry consensus, not ranking factors published by Google.',
    'Open Graph tag presence is self-reported via checkboxes — the tool cannot fetch your page.',
    'Keyword matching is case-insensitive substring matching; no stemming or semantic analysis.',
    'Mobile snippets show fewer characters than desktop — the ranges target desktop display.',
    'The tool never contacts Google or your site; it cannot see actual search performance.',
  ],
  jsonLd: [],
};
