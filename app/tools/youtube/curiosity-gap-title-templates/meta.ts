import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/curiosity-gap-title-templates/';

const DESCRIPTION =
  'Write click-worthy titles with these YouTube title templates — curiosity-gap formulas proven to lift CTR without resorting to clickbait. Customize.';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Topic / keyword',
    type: 'text',
    required: true,
    placeholder: 'e.g. sourdough baking',
  },
  {
    id: 'category',
    label: 'Template category',
    type: 'select',
    required: true,
    options: ['curiosity', 'how-to', 'mistake', 'secret', 'number'],
  },
  {
    id: 'count',
    label: 'How many titles (1–50)',
    type: 'number',
    required: false,
    placeholder: '10',
    validation: { min: 1, max: 50 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'titles', label: 'Title suggestions', type: 'list' },
  { id: 'count', label: 'Titles generated', type: 'number' },
  { id: 'note', label: 'Template bank note', type: 'text' },
];

export const content: ToolContent = {
  title: 'Youtube Title Templates',
  description: DESCRIPTION,
  howTo: [
    'Type your video topic or keyword into the "Topic / keyword" box.',
    'Pick a template category: curiosity, how-to, mistake, secret, or number.',
    'Choose how many titles you want (1–50; the default is 10).',
    'Run the tool — each suggestion shows the fixed template formula that produced it, and any over-long title is trimmed to YouTube\'s 100-character limit.',
    'Pick your favorites, tweak the wording in your own voice, and paste them into YouTube Studio.',
  ],
  methodology:
    'This tool is a transparent formula library, not AI: 60 fixed title patterns (12 per category — curiosity, how-to, mistake, secret, number) with a {topic} slot. Your topic is substituted into the chosen category\'s formulas in fixed bank order, and each output names the exact template that produced it. Instantiated titles are truncated to 100 graphemes so they always fit YouTube\'s hard title limit. Same inputs always produce the same titles.',
  examples: [
    {
      title: 'Curiosity formulas for a baking topic',
      inputs: { topic: 'sourdough baking', category: 'curiosity', count: 3 },
      note: 'Produces formulas like "Why sourdough baking Will Change Everything You Know" (template: curiosity-1).',
    },
    {
      title: 'Mistake formulas for a fitness topic',
      inputs: { topic: 'home workouts', category: 'mistake', count: 3 },
      note: 'Produces formulas like "5 home workouts Mistakes Beginners Always Make" (template: mistake-1).',
    },
    {
      title: 'Number formulas for a tech topic',
      inputs: { topic: 'AI tools', category: 'number', count: 2 },
      note: 'Produces formulas like "10 AI tools Tips That Actually Work" (template: number-1).',
    },
  ],
  faqs: [
    {
      question: 'what is the best youtube title templates?',
      answer:
        'The best templates are proven formulas you adapt to your own topic — curiosity gaps, how-to promises, mistake warnings, insider secrets, and numbered lists. This free tool gives you 60 such formulas across 5 categories and shows which formula produced each suggestion, so you learn the pattern instead of copying blindly.',
    },
    {
      question: 'is there a free youtube title templates?',
      answer:
        'Yes — this tool is free with no signup. Enter your topic, pick a category (curiosity, how-to, mistake, secret, or number), and get up to 50 template-based title ideas instantly, all processed in your browser.',
    },
    {
      question: 'how to use youtube title templates?',
      answer:
        'Enter your topic and pick a category, then review the generated suggestions — each names its template so you can see the formula. Rewrite the winner in your own voice rather than publishing it word-for-word, and keep it under 100 characters so it fits YouTube\'s title limit.',
    },
    {
      question: 'how does a youtube title templates work?',
      answer:
        'It substitutes your topic into fixed title formulas — for example the curiosity formula "Why {topic} Will Change Everything You Know" becomes "Why sourdough baking Will Change Everything You Know". This tool uses a fixed 60-template bank, never AI generation, and labels every output with the template that produced it.',
    },
    {
      question: 'How does the youtube title templates work?',
      answer:
        'Enter your details using the inputs above and the youtube title templates calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube title templates free to use?',
      answer:
        'Yes - this youtube title templates is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube title templates?',
      answer:
        'A youtube title templates is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'All 60 formulas are a fixed template bank — this tool does not generate titles with AI and copy never claims otherwise.',
    'Each category holds 12 templates; asking for more than 12 returns all 12 with a note, not duplicates.',
    'Suggestions are starting points: the formulas insert your topic verbatim, so light editing for grammar and your own voice is expected.',
    'Instantiated titles are truncated to 100 graphemes to fit YouTube\'s hard title limit; very long topics may produce trimmed titles.',
  ],
  jsonLd: [],
};
