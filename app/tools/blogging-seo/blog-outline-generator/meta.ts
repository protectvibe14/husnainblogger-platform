import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'title',
    label: 'Blog post title',
    type: 'text',
    required: true,
    placeholder: 'e.g. How to Start a Garden',
    validation: { min: 2, max: 150 },
  },
  {
    id: 'targetKeyword',
    label: 'Target keyword (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. start a garden',
    validation: { max: 100 },
  },
  {
    id: 'depth',
    label: 'Outline depth',
    type: 'select',
    required: false,
    options: [
      'basic',
      'standard',
      'deep',
    ],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'outlineMarkdown',
    label: 'Blog outline',
    type: 'copy',
    description:
    'Full H1/H2/H3 outline in Markdown, with a target-keyword line when provided.',
  },
  {
    id: 'headingCount',
    label: 'Heading count',
    type: 'number',
    description:
    'Total number of H2 + H3 headings in the outline.',
  },
];

export const content: ToolContent = {
  title: 'Blog Outline Generator',
  description:
    'Free blog outline generator 2026: build a clean H1/H2/H3 blog structure with intro, body sections and conclusion in Markdown. — start outlining now.',
  howTo: [
    'Type your blog post title into the Title field (2-150 characters).',
    'Optionally add a target keyword and pick a depth: Basic (10 headings), Standard (20) or Deep (42).',
    'Click Generate to assemble the outline from fixed heading templates.',
    'Review the H2 sections and H3 sub-points, then rewrite the headings for your keyword.',
    'Copy the Markdown outline and start drafting your article.',
  ],
  methodology:
    'The generator fills fixed heading-template banks with your title\'s topic phrase: 4 intro templates, 10 body-section templates and 3 conclusion templates, with H3 sub-points cycled from a bank of 6 generic writing prompts. Depth controls how many body sections (4, 6 or 10) and sub-points per section (1, 2 or 3) are used — always in bank order, never random. No AI model is used and no topic research is performed.',
  examples: [
    {
      title: 'Standard how-to outline',
      inputs: { title: 'How to Start a Garden' },
      note: 'Produces a 20-heading outline: intro, 6 body sections with 2 sub-points each, conclusion.',
    },
    {
      title: 'Deep outline with keyword',
      inputs: { title: 'The Ultimate Guide to SEO', targetKeyword: 'seo guide', depth: 'deep' },
      note: 'Produces a 42-heading outline with the keyword noted at the top.',
    },
    {
      title: 'Basic quick outline',
      inputs: { title: 'Sourdough for Beginners', depth: 'basic' },
      note: 'Produces a compact 10-heading outline for a short post.',
    },
  ],
  faqs: [
    {
      question: 'What is the best blog outline generator?',
      answer:
        'There is no independently verified "best" — pick one that is transparent. This free generator publishes its full method: fixed heading-template banks filled with your title, with 10, 20 or 42 headings depending on depth. No hidden AI, no signup.',
    },
    {
      question: 'Is there a free blog outline generator?',
      answer:
        'Yes — this one is completely free with no signup. It builds a clean H1/H2/H3 outline in Markdown from your title, at three depths. It does not do topic research or SERP analysis; the headings are starting templates you rewrite for your keyword.',
    },
    {
      question: 'How to generate blog?',
      answer:
        'Start from a working title, decide the depth you need, and generate an outline first — it keeps the draft focused. Enter your title above, pick Basic, Standard or Deep, and copy the Markdown outline to start writing.',
    },
    {
      question: 'How does a blog outline generator work?',
      answer:
        'This one takes your title, derives a short topic phrase from it, and fills fixed heading templates (intro, body sections, conclusion) plus generic H3 sub-point prompts. It is template assembly, not AI, so every outline for the same inputs is identical.',
    },
    {
      question: 'How long should a blog outline be?',
      answer:
        'It depends on the post: pick Basic for a compact 10-heading outline, Standard for a 20-heading structure, or Deep for a full 42-heading breakdown with more sub-points per section. Match the depth to your target article length, then rewrite the headings for your keyword.',
    },
    {
      question: 'Can AI write my blog outline?',
      answer:
        'This tool does not use AI at all — it assembles outlines from fixed heading-template banks, which means the same inputs always produce the same outline. That makes it predictable and free, but the headings are starting templates: rewrite them for your keyword and add your own research.',
    },
    {
      question: 'What should a blog outline include?',
      answer:
        'A solid outline has an intro, body sections with sub-points, and a conclusion. This generator builds exactly that in Markdown (H1/H2/H3) and adds your target-keyword line at the top when you provide one, so the draft stays focused.',
    },
  ],
  assumptions: [
    'Outlines are assembled from fixed heading banks — not AI-generated; headings are starting points, not optimized titles.',
    'H3 sub-points are generic writing prompts, not topic-specific research.',
    'The tool does not check SERPs, keyword difficulty, or search volume.',
  ],
  jsonLd: [
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Blog Outline Generator',
          item: 'https://husnainblogger.com/tools/blogging-seo/blog-outline-generator/',
        },
      ],
    },
  ],
};
