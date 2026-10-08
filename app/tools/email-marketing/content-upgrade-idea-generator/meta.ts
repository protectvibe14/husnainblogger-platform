import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/email-marketing/content-upgrade-idea-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'blogTopic',
    label: 'Blog topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. email marketing',
  },
  {
    id: 'audience',
    label: 'Audience',
    type: 'text',
    required: true,
    placeholder: 'e.g. beginner bloggers',
  },
  {
    id: 'count',
    label: 'Number of ideas',
    type: 'number',
    required: true,
    placeholder: 'e.g. 5',
    validation: { min: 1, max: 10 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'ideas',
    label: 'Content upgrade ideas',
    type: 'table',
    description:
      'Free content upgrade ideas generator 2026: Table of content upgrade ideas: number, the upgrade idea title, its format, and a. Fast, private, no signup - try it!',
  },
];

export const content: ToolContent = {
  title: 'Content Upgrade Ideas Generator 2026 – Free | HusnainBlogger',
  description:
    'Turn readers into subscribers with this free content upgrade ideas generator: get up to 10 bonus ideas with formats and placements for your topic. Try it now!',
  howTo: [
    'Enter your blog post topic (e.g. email marketing) and the audience the post serves (e.g. beginner bloggers).',
    'Choose how many ideas you want (1–10).',
    'Run the tool to get a table of upgrade ideas — each with a title, a format (checklist, worksheet, template pack, swipe file, bonus chapter, or resource list), and a suggested placement.',
    'Pick the idea that fits your post best, then build it as a downloadable bonus behind an opt-in form.',
    'For broader lead-magnet brainstorming, try the Lead Magnet Idea Generator next.',
  ],
  methodology:
    'Ideas are assembled from a fixed bank of 24 upgrade templates (4 per format) filled with your blog topic and audience — no AI, no guessing. Selection is a deterministic hash of your inputs, so the same inputs always produce the same list. Placement suggestions are general best-practice signup locations, not guarantees.',
  examples: [
    {
      title: 'Upgrade ideas for an email marketing post',
      inputs: { blogTopic: 'email marketing', audience: 'beginner bloggers', count: 4 },
      note: 'Four post-specific bonus ideas for an email marketing article.',
    },
    {
      title: 'Upgrade ideas for a fitness audience',
      inputs: { blogTopic: 'home workouts', audience: 'busy moms', count: 6 },
      note: 'Six upgrade ideas tailored to a home-workout post.',
    },
  ],
  faqs: [
    {
      question: 'What is a content upgrade?',
      answer:
        'A content upgrade is a bonus resource tied to a specific blog post — for example, a checklist that expands on a tutorial. It converts better than a generic lead magnet because it matches exactly what the reader is already reading. This generator brainstorms those post-specific bonuses.',
    },
    {
      question: 'What is the best content upgrade ideas generator?',
      answer:
        'The best one ties ideas to your actual post: this free generator fills 24 fixed upgrade templates with your blog topic and audience, and suggests a format and signup placement for each idea. Nothing here is written by AI — every idea comes from the template bank.',
    },
    {
      question: 'Is there a free content upgrade ideas generator?',
      answer:
        'Yes — this content upgrade ideas generator is completely free with no signup. You can generate 1–10 titled upgrade ideas per run, each with a format and a suggested placement.',
    },
    {
      question: 'How to generate content upgrade?',
      answer:
        'Start from a post that already gets traffic, identify the audience reading it, then offer a bonus that completes the post — a checklist, worksheet, or template pack. This tool does the brainstorming; you build the winning bonus and gate it behind an opt-in form.',
    },
    {
      question: 'How does the content upgrade ideas generator work?',
      answer:
        'Enter your details using the inputs above and the content upgrade ideas generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the content upgrade ideas generator free to use?',
      answer:
        'Yes - this content upgrade ideas generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a content upgrade ideas generator?',
      answer:
        'A content upgrade ideas generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Ideas are assembled from a fixed bank of 24 templates — no AI ideation; titles may feel formulaic by design.',
    'Placement suggestions are general best-practice signup locations, not predictions about your conversion rate.',
    'This tool covers post-specific content upgrades; standalone lead magnets are covered by the Lead Magnet Idea Generator and quiz formats by the Quiz Lead Magnet Idea Generator.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Content Upgrade Ideas Generator 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free content upgrade ideas generator 2026: Table of content upgrade ideas: number, the upgrade idea title, its format, and a. Fast, private, no signup - try it!',
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
          name: 'Content Upgrade Idea Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
