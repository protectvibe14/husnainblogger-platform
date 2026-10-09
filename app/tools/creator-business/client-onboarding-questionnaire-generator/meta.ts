import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL =
  'https://husnainblogger.com/tools/creator-business/client-onboarding-questionnaire-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'serviceType',
    label: 'Service type',
    type: 'select',
    required: true,
    options: [
      'design',
      'writing',
      'marketing',
      'development',
      'video',
      'social-media',
      'other',
    ],
  },
  {
    id: 'includeSections',
    label: 'Sections to include (comma-separated)',
    type: 'textarea',
    required: true,
    placeholder: 'goals, brand, audience, logistics, budget',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'questionnaireDocument',
    label: 'Questionnaire (copy)',
    type: 'copy',
    description:
    'Free client onboarding questionnaire template 2026: Grouped onboarding questions for your service type — copy and send to the client. Fast, private.',
  },
];

export const content: ToolContent = {
  title: 'Client Onboarding Questionnaire Template',
  description:
    'Build a client onboarding questionnaire in seconds: pick your service type and sections for grouped intake questions. Copy, send, start right. Try it free.',
  howTo: [
    'Select your "Service type" — design, writing, marketing, development, video, social media, or other.',
    'List the "Sections to include" (comma-separated): goals, brand, audience, logistics, budget.',
    'Run the tool to assemble the grouped questionnaire with your service-specific questions.',
    'Copy the "Questionnaire" and send it to your client before the project starts.',
  ],
  methodology:
    'The tool filters a fixed 43-question bank by your selections: 5 sections × 5 questions (goals, brand, audience, logistics, budget) plus 3 service-specific questions for each of 6 service types. Choosing "other" yields the generic sections only. Nothing is written by AI — the output contains only the curated questions matching your choices.',
  examples: [
    {
      title: 'Design project intake',
      inputs: {
        serviceType: 'design',
        includeSections: 'goals, brand, audience',
      },
      note: '15 section questions plus 3 design-specific questions (file formats, design system, specs) — 18 total.',
    },
    {
      title: 'Video project, all sections',
      inputs: {
        serviceType: 'video',
        includeSections: 'goals, brand, audience, logistics, budget',
      },
      note: '25 section questions plus 3 video-specific questions (runtime, versions, footage) — 28 total.',
    },
    {
      title: 'Generic intake for an unusual service',
      inputs: {
        serviceType: 'other',
        includeSections: 'goals, logistics',
      },
      note: '10 generic questions only — no service-specific block for "other".',
    },
  ],
  faqs: [
    {
      question: 'What is the best client onboarding questionnaire template?',
      answer:
        'The best client onboarding questionnaire covers goals, brand, audience, logistics, and budget, plus questions specific to your service. This generator assembles all of that from a curated question bank — pick your service type and sections, then copy the result.',
    },
    {
      question: 'Is there a free client onboarding questionnaire template?',
      answer:
        'Yes — this questionnaire generator is completely free with no signup. Select your service type and sections to build a grouped intake questionnaire you can copy and send to any client.',
    },
    {
      question: 'How to use client onboarding questionnaire?',
      answer:
        'Choose your service type, include the sections you need, and copy the generated questionnaire. Send it to the client before the project starts — their answers become the brief you work from.',
    },
    {
      question: 'How does a client onboarding questionnaire template work?',
      answer:
        'It filters a fixed bank of 43 onboarding questions down to the sections and service-specific questions you select. Nothing is written by AI; the tool only groups and numbers the curated questions for you.',
    },
    {
      question: 'How does the client onboarding questionnaire template work?',
      answer:
        'Enter your details using the inputs above and the client onboarding questionnaire template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the client onboarding questionnaire template free to use?',
      answer:
        'Yes - this client onboarding questionnaire template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a client onboarding questionnaire template?',
      answer:
        'A client onboarding questionnaire template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Questions are a curated fixed bank, not personalized advice — edit or add questions for unusual projects.',
    'The "other" service type intentionally adds no service-specific questions; it yields generic sections only.',
    'Answers are collected by you outside the tool — this generates the questionnaire, not a form backend.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Client Onboarding Questionnaire Template | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free client onboarding questionnaire template 2026: Grouped onboarding questions for your service type — copy and send to the client. Fast, private.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Creator Business',
          item: 'https://husnainblogger.com/tools/creator-business/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Client Onboarding Questionnaire Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
