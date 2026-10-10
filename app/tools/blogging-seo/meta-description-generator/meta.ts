import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/meta-description-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. email marketing for beginners',
    validation: { min: 2, max: 200 },
  },
  {
    id: 'targetKeyword',
    label: 'Target keyword (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. email marketing tips',
    validation: { max: 100 },
  },
  {
    id: 'draft',
    label: 'Your draft (optional — analyzed for length)',
    type: 'textarea',
    required: false,
    placeholder: 'Paste a draft meta description to check its length and keyword use.',
    validation: { max: 500 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'suggestions',
    label: 'Description suggestions',
    type: 'list',
    description:
    'Free meta description generator 2026: Five description suggestions built from fixed templates using your topic and keyword. Fast, private.',
  keywords: ['meta description generator ahrefs', 'meta description generator ai', 'meta description generator free', 'meta description generator free online', 'meta description generator from url'],
  },
  {
    id: 'lengthAnalysis',
    label: 'Length analysis',
    type: 'text',
    description:
    'Character count and status against the 140–160 character SERP display convention.',
  },
  {
    id: 'keywordPresent',
    label: 'Keyword present',
    type: 'text',
    description:
    'Whether your target keyword appears in the analyzed text.',
  },
];

export const content: ToolContent = {
  title: 'Meta Description Generator',
  description:
    'Write better snippets with this free meta description generator: get template-based suggestions, check length, and confirm keyword use. Start now.',
  howTo: [
    'Enter your page topic (2–200 characters) — what the page is about.',
    'Optionally add the target keyword you want in the description.',
    'Optionally paste a draft meta description to have it analyzed instead of a suggestion.',
    'Run the tool to get five template-based suggestions with a length analysis.',
    'Pick a suggestion in the 140–160 character range that includes your keyword, then rewrite it in your own voice.',
  ],
  methodology:
    'Suggestions are assembled from a fixed bank of 5 templates with your topic and keyword filled in — nothing is written by AI. The length analysis counts characters (unicode-safe) and compares against the widely published 140–160 character SERP display convention, labeled as a convention, not a guarantee: Google often truncates or rewrites meta descriptions. Keyword presence is a simple case-insensitive text match. Nothing here predicts or promises rankings.',
  examples: [
    {
      title: 'Blog post description',
      inputs: {
        topic: 'email marketing for beginners',
        targetKeyword: 'email marketing tips',
      },
      note: 'Generates five suggestion options built around the keyword.',
    },
    {
      title: 'Draft length check',
      inputs: {
        topic: 'sourdough baking',
        draft: 'Learn how to bake crusty sourdough bread at home with this step-by-step beginner guide and simple schedule.',
      },
      note: 'Analyzes your own draft for length and keyword presence.',
    },
  ],
  faqs: [
    {
      question: 'what is the best meta description generator?',
      answer:
        'The best meta description generator combines ready-made suggestions with an honest length check against the 140–160 character convention and a keyword-presence check. This free tool does that from a fixed template bank, with no signup.',
    },
    {
      question: 'is there a free meta description generator?',
      answer:
        'Yes — this meta description generator is completely free with no signup. Enter a topic, optionally add a keyword or your own draft, and get five suggestions plus a length analysis instantly.',
    },
    {
      question: 'how to generate meta description?',
      answer:
        'Enter your topic and target keyword, then review the five template-based suggestions. Choose one within 140–160 characters that includes your keyword naturally, and rewrite it in your own voice before publishing.',
    },
    {
      question: 'how does a meta description generator work?',
      answer:
        'This one fills your topic and keyword into a fixed bank of five proven description templates — no AI writing involved. It then analyzes character length (unicode-safe) against the widely published 140–160 character SERP convention and checks whether your keyword appears. Note: Google may rewrite descriptions itself, so treat the convention as guidance, not a guarantee.',
    },
    {
      question: 'What is a meta description generator?',
      answer:
        'A meta description generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Can I customize the generated meta description generator?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
    {
      question: 'What makes a good meta description generator?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
  ],
  assumptions: [
    'Suggestions are starting templates assembled from a fixed bank — rewrite them for your SERP; they are not optimized copy.',
    'The 140–160 character range is a widely published display convention, not a guarantee; Google truncates and rewrites descriptions on its own.',
    'No rankings are promised or implied — meta descriptions are not a direct ranking factor.',
  ],
  jsonLd: [],
};
