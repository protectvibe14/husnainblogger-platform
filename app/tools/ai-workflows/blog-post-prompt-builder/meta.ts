import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent, BuilderField } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [
  { id: 'lines', label: 'Assembled prompts', type: 'list' },
];

export const itemFields: BuilderField[] = [
  { id: 'topic', label: 'Blog post topic', type: 'text', required: true, placeholder: 'e.g. sourdough bread for beginners' },
  {
    id: 'postType',
    label: 'Post type',
    type: 'text',
    placeholder: 'how-to | listicle | review | opinion | tutorial (default: how-to)',
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'text',
    placeholder: 'e.g. friendly, professional, witty (default: neutral)',
  },
  {
    id: 'targetKeyword',
    label: 'Target keyword (optional)',
    type: 'text',
    placeholder: 'e.g. sourdough starter recipe',
  },
  {
    id: 'targetWordCount',
    label: 'Target word count (optional)',
    type: 'text',
    placeholder: '300–5000 (default: 1200)',
  },
];

export const content: ToolContent = {
  title: 'Blog Prompt Generator 2026 – Free Tool | HusnainBlogger',
  description:
    'Build a blog prompt generator template from your topic, post type, tone, keyword, and word count — get a copy-paste AI writing prompt. Free, no signup.',
  howTo: [
    'Enter your blog post topic (required) — the more specific, the better.',
    'Type a post type: how-to, listicle, review, opinion, or tutorial (defaults to how-to).',
    'Add a tone, target keyword, and target word count (300–5000); anything you skip gets a sensible default.',
    'Click build to assemble your prompt — one per item if you added several.',
    'Copy the result and paste it into your own AI tool (ChatGPT, Claude, Gemini, etc.).',
  ],
  methodology:
    'This tool fills your inputs into a fixed, human-written prompt template. It assembles text only — it generates no blog content itself and runs no AI model. The output is a prompt you paste into your own AI tool.',
  faqs: [
    {
      question: 'What is the best blog prompt generator?',
      answer:
        'The best one captures your topic, post type, tone, keyword, and length in a single clear instruction. This free builder assembles exactly that from your inputs — the quality of the result still depends on the AI tool you paste it into and the editing you do after.',
    },
    {
      question: 'Is there a free blog prompt generator?',
      answer:
        'Yes — this builder is completely free with no signup. You can build as many prompts as you like and use them in any AI writing tool.',
    },
    {
      question: 'How to generate blog prompt ideas?',
      answer:
        'Enter a specific topic, pick one of the five post types (how-to, listicle, review, opinion, tutorial), add your tone and target keyword, and the builder assembles a complete, copy-paste-ready prompt for you.',
    },
    {
      question: 'How does a blog prompt generator work?',
      answer:
        'It takes your topic, post type, tone, keyword, and word count and fills them into a proven prompt template. This site does not write anything for you — you copy the assembled prompt into your own AI tool, which does the writing.',
    },
    {
      question: 'How does the blog prompt generator work?',
      answer:
        'Enter your details using the inputs above and the blog prompt generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the blog prompt generator free to use?',
      answer:
        'Yes - this blog prompt generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a blog prompt generator?',
      answer:
        'A blog prompt generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Output is a prompt template filled with your inputs — not a finished blog post.',
    'The tool runs no AI model; you need your own AI tool to use the assembled prompt.',
    'Post type must be one of: how-to, listicle, review, opinion, tutorial.',
    'Word count must be between 300 and 5000 (defaults to 1200 when left blank).',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Blog Prompt Generator 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-workflows/blog-post-prompt-builder/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Build a blog prompt generator template from your topic, post type, tone, keyword, and word count — get a copy-paste AI writing prompt. Free, no signup.',
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
          name: 'Blog Post Prompt Builder',
          item: 'https://husnainblogger.com/tools/ai-workflows/blog-post-prompt-builder/',
        },
      ],
    },
  ],
};
