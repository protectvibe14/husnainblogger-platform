import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'courseTopic',
    label: 'Course topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. Watercolor for Beginners',
  },
  {
    id: 'moduleCount',
    label: 'Number of modules',
    type: 'number',
    required: true,
    placeholder: '2 – 20',
    validation: { min: 2, max: 20 },
  },
  {
    id: 'lessonLengthMinutes',
    label: 'Lesson length (minutes)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 12',
    validation: { min: 1, max: 480 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'moduleGrid',
    label: 'Module grid',
    type: 'table',
    description: 'Free course outline generator 2026: Module slots with lesson-name templates and per-module duration estimates. Fast, private, no signup - try it now!',
  },
  {
    id: 'summary',
    label: 'Plan summary',
    type: 'text',
    description: 'Total modules, lessons, and estimated course duration.',
  },
];

export const content: ToolContent = {
  title: 'Course Outline Generator 2026 – Free Tool | HusnainBlogger',
  description:
    'Plan your online course fast — a module grid with lesson-name templates and duration estimates per module. Free course outline generator. Start building today!',
  howTo: [
    'Enter your course topic, exactly as students will see it.',
    'Choose how many modules the course has, from 2 to 20.',
    'Set the target lesson length in minutes (fractions are rounded up).',
    'Click generate to get a module grid with lesson-name templates and duration totals.',
    'Replace each lesson-name template with your real lesson titles and content.',
  ],
  methodology:
    'This is grid arithmetic, not AI curriculum design. Each module is assigned a fixed number of lesson slots (rotating 4-3-5) and a lesson-name template with placeholders. Per-module and total durations are simple multiplication of slots by your lesson length. You write the actual curriculum; the tool only arranges the grid.',
  examples: [
    {
      title: 'Watercolor course',
      inputs: {
        courseTopic: 'Watercolor for Beginners',
        moduleCount: 4,
        lessonLengthMinutes: 12,
      },
      note: '16 lesson slots across 4 modules, ≈192 minutes total.',
    },
    {
      title: 'Freelance bootcamp',
      inputs: {
        courseTopic: 'Freelance Client Bootcamp',
        moduleCount: 6,
        lessonLengthMinutes: 20,
      },
      note: '26 lesson slots with templates like "Hands-On: … in Action".',
    },
  ],
  faqs: [
    {
      question: 'What is the best course outline generator?',
      answer:
        'The best course outline generator for you depends on whether you need a quick structure or a full curriculum built with AI. This free tool does the quick structure: it arranges your topic into a module grid with lesson-name templates and duration estimates. It does not invent curriculum content — you bring the expertise.',
    },
    {
      question: 'Is there a free course outline generator?',
      answer:
        'Yes — this one. It is free, runs entirely in your browser, and needs no sign-up. Enter a course topic, pick 2–20 modules and a lesson length, and you get a module grid with lesson-name templates and total duration estimates.',
    },
    {
      question: 'How do I outline an online course?',
      answer:
        'Start with the course topic and the promise to the student, decide how many modules it needs, then sketch the lessons inside each module and estimate durations. This tool handles the middle steps: it generates the module grid, lesson-name templates, and totals — you then replace the templates with real lesson titles.',
    },
    {
      question: 'How does a course outline generator work?',
      answer:
        'This one works with fixed rules, not AI: modules rotate through a 4-3-5 lesson-slot pattern and three lesson-name templates, and durations are computed as slots × your lesson length. The same inputs always produce the same grid.',
    },
    {
      question: 'How does the course outline generator work?',
      answer:
        'Enter your details using the inputs above and the course outline generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the course outline generator free to use?',
      answer:
        'Yes - this course outline generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a course outline generator?',
      answer:
        'A course outline generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Lesson names are templates with placeholders — real lesson titles and content are yours to write.',
    'Lesson slots rotate through a fixed 4-3-5 pattern; fractional lesson minutes are rounded up.',
    'Duration estimates are simple arithmetic (slots × lesson length), not a pacing recommendation.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Course Outline Generator 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-workflows/online-course-module-planner/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free course outline generator 2026: Module slots with lesson-name templates and per-module duration estimates. Fast, private, no signup - try it now!',
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
          name: 'Online Course Module Planner',
          item: 'https://husnainblogger.com/tools/ai-workflows/online-course-module-planner/',
        },
      ],
    },
  ],
};
