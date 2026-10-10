import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'videoType',
    label: 'Video type',
    type: 'select',
    required: true,
    options: ['tutorial', 'review', 'vlog', 'commentary', 'unboxing'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'template', label: 'Script prompt template', type: 'copy' },
];

export const content: ToolContent = {
  title: 'AI Prompts for YouTube Scripts',
  description:
    'Get free AI prompts for YouTube scripts: pick tutorial, review, vlog, commentary, or unboxing and copy a human-written script prompt template. Free.',
  howTo: [
    'Choose your video type: tutorial, review, vlog, commentary, or unboxing.',
    'The matching human-written script prompt template appears instantly.',
    'Replace the [PLACEHOLDERS] with your topic, audience, length, and tone.',
    'Copy the finished prompt and paste it into your own AI tool.',
    'Use the generated outline as a starting point — always add your own voice before filming.',
  ],
  methodology:
    'This is a fixed pack of 5 human-written script-prompt templates, one per video type. Nothing is generated at runtime — the page returns the pre-written template for the video type you pick, and you run it in your own AI tool.',
  faqs: [
    {
      question: 'What is the best AI prompts for YouTube scripts?',
      answer:
        'The best prompts spell out the structure you want: hook, sections, on-screen cues, and CTA. This free pack gives you 5 human-written templates (tutorial, review, vlog, commentary, unboxing) with exactly that structure built in.',
    },
    {
      question: 'Is there a free AI prompts for YouTube scripts?',
      answer:
        'Yes — all 5 script prompt templates in this pack are free to view and copy, no signup needed. You run them in your own AI tool.',
    },
    {
      question: 'How to use AI prompts for YouTube?',
      answer:
        'Pick the template for your video type, fill in the placeholders (topic, audience, length, tone), paste it into your AI tool, then rewrite the output in your own voice before filming. AI outlines save time but should never be read verbatim.',
    },
    {
      question: 'How does an AI prompts for YouTube scripts work?',
      answer:
        'A script prompt tells an AI tool what video to outline and how to structure it. This page does not run any AI itself — it hands you a ready-made prompt template that you copy into tools like ChatGPT, Claude, or Gemini.',
    },
    {
      question: 'How does the ai prompts for youtube scripts work?',
      answer:
        'Enter your details using the inputs above and the ai prompts for youtube scripts calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai prompts for youtube scripts free to use?',
      answer:
        'Yes - this ai prompts for youtube scripts is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an ai prompts for youtube scripts?',
      answer:
        'An ai prompts for youtube scripts is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Fixed pack of 5 human-written templates — nothing is generated or personalized at runtime.',
    'Video type must be one of: tutorial, review, vlog, commentary, unboxing.',
    'You need your own AI tool account to turn the template into a script.',
    'Templates are starting points — adapt the structure to your channel and audience.',
  ],
  jsonLd: [
    {
      '@type': 'WebPage',
      name: 'AI Prompts for YouTube Scripts 2026 – Free',
      url: 'https://husnainblogger.com/tools/ai-workflows/youtube-script-prompt-pack/',
      description:
    'Get free AI prompts for YouTube scripts: pick tutorial, review, vlog, commentary, or unboxing and copy a human-written script prompt template. Free.',
    },
  ],
};
