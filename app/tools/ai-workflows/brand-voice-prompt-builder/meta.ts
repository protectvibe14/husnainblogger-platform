import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/ai-workflows/brand-voice-prompt-builder/';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'adjectives',
    label: 'Voice adjectives (comma-separated, at least 2)',
    type: 'text',
    required: true,
    placeholder: 'e.g. friendly, bold, curious',
  },
  {
    id: 'doList',
    label: "Do's (comma-separated, optional)",
    type: 'text',
    required: false,
    placeholder: 'e.g. use short sentences, ask questions',
  },
  {
    id: 'dontList',
    label: "Don'ts (comma-separated, optional)",
    type: 'text',
    required: false,
    placeholder: 'e.g. use jargon, sound corporate',
  },
  {
    id: 'sampleText',
    label: 'Sample text in your voice (optional)',
    type: 'text',
    required: false,
    placeholder: 'Paste a sentence that sounds like your brand',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'prompts',
    label: 'Brand voice system prompts',
    type: 'list',
    description:
    'Free brand voice prompt 2026: One assembled system prompt per entry — copy it into your AI tool of choice. Fast, private now.',
  },
];

export const content: ToolContent = {
  title: 'Brand Voice Prompt',
  description:
    "Assemble a custom brand voice prompt from your own words. Add adjectives, do's and don\'ts, and an optional sample for a reusable system prompt. Build yours now!",
  howTo: [
    'Add one entry per brand voice. Enter at least 2 adjectives, comma-separated (required).',
    'Add optional do\'s and don\'ts as comma-separated lists — empty lists are left out.',
    'Optionally paste a sample sentence written in your voice.',
    'Run the tool to assemble your system prompt from your inputs.',
    'Copy the prompt and paste it as a system prompt in ChatGPT, Claude, or any AI writer.',
  ],
  methodology:
    'The tool assembles a system prompt from your inputs using about 10 fixed sentence templates (intro, voice sentence, do/don\'t bullets, optional voice-example section, and 2 fixed rules). Every voice-specific word comes from your adjectives, lists, and sample — the tool never invents a brand voice for you and nothing is AI-generated.',
  faqs: [
    {
      question: 'What is the best brand voice prompt?',
      answer:
        'The best brand voice prompt is built from your own words: adjectives that describe the voice, concrete do\'s and don\'ts, and a sample in your style. This free builder assembles exactly that into a system prompt you can reuse in any AI tool.',
    },
    {
      question: 'Is there a free brand voice prompt?',
      answer:
        'Yes — this brand voice prompt builder is completely free with no signup. Build as many voice prompts as you like, one entry per voice, and copy each assembled system prompt.',
    },
    {
      question: 'How to use brand voice prompt?',
      answer:
        'Enter at least 2 adjectives plus optional do\'s, don\'ts, and a voice sample, then run the tool. Copy the assembled prompt and paste it as the system prompt (or custom instructions) in your AI writing tool so every output matches your voice.',
    },
    {
      question: 'How does a brand voice prompt work?',
      answer:
        'It turns your inputs into a structured system prompt: a voice sentence from your adjectives, do/don\'t rules from your lists, an optional example section, and 2 fixed behavior rules. The tool only assembles what you supplied — it does not invent voice traits.',
    },
    {
      question: 'How does the brand voice prompt work?',
      answer:
        'Enter your details using the inputs above and the brand voice prompt calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the brand voice prompt free to use?',
      answer:
        'Yes - this brand voice prompt is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a brand voice prompt?',
      answer:
        'A brand voice prompt is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The tool assembles a prompt from your inputs only — it does not invent a brand voice for you. A vague input (e.g. only 2 generic adjectives) produces a vague prompt.',
    'An AI model follows the prompt to varying degrees; check important outputs and refine your adjectives and do/don\'t lists over time.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Brand Voice Prompt 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free brand voice prompt 2026: One assembled system prompt per entry — copy it into your AI tool of choice. Fast, private now.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'AI Workflow Tools',
          item: 'https://husnainblogger.com/tools/ai-workflows/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Brand Voice Prompt Builder',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
