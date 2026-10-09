import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/email-marketing/blog-to-newsletter-converter/';

export const inputs: ToolInput[] = [
  {
    id: 'blogContent',
    label: 'Blog post text',
    type: 'textarea',
    required: true,
    placeholder: 'Paste your full blog post text here (not a URL — browsers block fetching arbitrary URLs).',
  },
  {
    id: 'excerptWords',
    label: 'Words per section excerpt',
    type: 'number',
    required: false,
    placeholder: '150',
    validation: { min: 20, max: 500 },
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['playful', 'professional', 'witty', 'minimal', 'bold'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'subjectOptions',
    label: 'Subject-line options',
    type: 'list',
    description:
    'Free repurpose blog post into newsletter 2026: Five subject lines built from your post’s title. Get instant results. free now.',
  },
  {
    id: 'introParagraph',
    label: 'Intro paragraph',
    type: 'text',
    description:
    'Newsletter intro in your chosen tone.',
  },
  {
    id: 'sections',
    label: 'Sections',
    type: 'table',
    description:
    'Each heading with a verbatim excerpt of its body.',
  },
  {
    id: 'ctaBlock',
    label: 'CTA block (copy)',
    type: 'copy',
    description:
    'Closing call-to-action with a link placeholder.',
  },
  {
    id: 'notices',
    label: 'Notes',
    type: 'list',
    description:
    'Truncation or section-cap notes.',
  },
];

export const content: ToolContent = {
  title: 'Repurpose Blog Post Into Newsletter',
  description:
    'Turn a blog post into a newsletter — paste your text to get subject lines, an intro, excerpts, and a CTA block. Pasted text only Convert now.',
  howTo: [
    'Copy your blog post text and paste it into the "Blog post text" box (URL fetching is blocked by browsers — paste text only).',
    'Set how many words each section excerpt should use (default 150).',
    'Pick a tone for the intro and subject lines.',
    'Run the tool to get subject options, an intro, section excerpts, and a CTA block.',
    'Replace the [PASTE YOUR POST URL] placeholder in the CTA with your real link before sending.',
  ],
  methodology:
    'The tool splits your pasted text into sections by detecting headings (markdown headers, short single lines ending with ":", numbered or all-caps lines); body text before the first heading becomes the Introduction. Each section’s excerpt is the first N words of its body (N = your excerpt-words setting), sections are capped at 8, and duplicate headings get a "(continued)" label. Subject lines and the intro come from fixed templates using your post’s title — no AI is involved. The tool works on pasted text only: browsers block client-side fetching of arbitrary URLs (CORS), so it rejects URL input and asks you to paste text instead.',
  examples: [
    {
      title: 'How-to post',
      inputs: {
        blogContent: '# How I Plan My Week\n\nI plan my week every Sunday with a simple three-step system that takes twenty minutes.\n\n## Step 1: Brain dump\n\nWrite everything down on paper or in your notes app.',
        excerptWords: 50,
        tone: 'playful',
      },
      note: 'Headings become sections with 50-word verbatim excerpts.',
    },
    {
      title: 'Default excerpt length',
      inputs: {
        blogContent: 'Why Morning Pages Work\n\nMorning pages clear mental clutter and make space for creative thinking before the day begins in earnest.',
        tone: 'minimal',
      },
      note: 'Excerpt words defaults to 150 when left blank.',
    },
  ],
  faqs: [
    {
      question: 'What is the best repurpose blog post into newsletter?',
      answer:
        'The best blog-to-newsletter converter preserves your post’s structure — headings become sections, excerpts stay true to your words — and gives you subject lines and a CTA to finish the issue. This tool does that from pasted text, with no signup.',
    },
    {
      question: 'Is there a free repurpose blog post into newsletter?',
      answer:
        'Yes — this converter is free with no signup. Paste any blog post and get subject options, an intro, section excerpts, and a CTA block.',
    },
    {
      question: 'How to use repurpose blog post into newsletter?',
      answer:
        'Copy your blog post text, paste it into the tool, set your excerpt length and tone, and run it. Copy the parts into your email platform and replace the [PASTE YOUR POST URL] placeholder with your real link.',
    },
    {
      question: 'How does a repurpose blog post into newsletter work?',
      answer:
        'It detects your post’s headings, splits the text into sections, and takes the first N words of each as excerpts. Subject lines and the intro are built from fixed templates using your post’s title — your words are never rewritten by AI.',
    },
    {
      question: 'How does the repurpose blog post into newsletter work?',
      answer:
        'Enter your details using the inputs above and the repurpose blog post into newsletter calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the repurpose blog post into newsletter free to use?',
      answer:
        'Yes - this repurpose blog post into newsletter is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a repurpose blog post into newsletter?',
      answer:
        'A repurpose blog post into newsletter is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Pasted text only — the tool rejects URLs because browsers block client-side fetching of arbitrary URLs (CORS).',
    'Posts under 30 words are rejected; content over 20,000 characters is truncated with a notice.',
    'Section detection is heuristic (headings, short lines, numbered lines) — check the output against your post.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Repurpose Blog Post Into Newsletter 2026 | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free repurpose blog post into newsletter 2026: Five subject lines built from your post’s title. Get instant results. free now.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Email Marketing Tools',
          item: 'https://husnainblogger.com/tools/email-marketing/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Blog-to-Newsletter Converter',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
