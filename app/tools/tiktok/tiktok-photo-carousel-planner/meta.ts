import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-photo-carousel-planner/';

export const inputs: ToolInput[] = [
  {
    id: 'carouselTopic',
    label: 'Carousel topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. beginner meal prep, home workouts, study tips',
  },
  {
    id: 'slideCount',
    label: 'Number of slides',
    type: 'number',
    required: true,
    validation: { min: 2, max: 35 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'slidePlan',
    label: 'Slide-by-slide plan',
    type: 'list',
    description:
    'Free tiktok photo carousel ideas 2026: One plan line per slide: cover hook slide, value slides, and a CTA slide. Fast, private now.',
  },
  {
    id: 'guidance',
    label: 'Text-per-slide guidance',
    type: 'text',
    description:
    'Word-limit and readability guidance for every slide role (cover ≤ 12 words, value slides ≤ 50 words).',
  },
  {
    id: 'planNote',
    label: 'Plan note',
    type: 'text',
    description:
    "Confirms the slide breakdown — and states it plainly if your request was clamped to TikTok's 35-slide cap.",
  },
];

export const content: ToolContent = {
  title: 'TikTok Photo Carousel Ideas',
  description:
    'Plan tiktok photo carousel ideas slide by slide: cover hook, value slides with text guidance, and a CTA slide. Enter your topic — try it free now.',
  howTo: [
    'Type your "Carousel topic" (e.g. beginner meal prep) and enter a "Number of slides" from 2 to 35.',
    'Run the tool: Slide 1 becomes your cover hook, the last slide becomes your CTA, and the middle slides are value slides.',
    'Read the "Text-per-slide guidance" — keep covers under 12 words and value slides under 50 words, one idea per slide.',
    'Check the "Plan note": if you asked for more than 35 slides, it says so — TikTok Photo Mode caps at 35.',
    'Pair each plan line with a clean photo or graphic, then build the carousel in the TikTok app.',
  ],
  methodology:
    'The planner uses fixed templates, not AI: Slide 1 is always the cover hook, the final slide is always the CTA, and middle slides cycle through 8 fixed angle templates (mistake, tip, myth vs fact, step, proof, warning, shortcut, reminder). Slide counts are validated as whole numbers from 2 to 35; requests above 35 are clamped to 35 with an honest note. Same inputs always produce the same plan.',
  examples: [
    {
      title: '5-slide meal prep carousel',
      inputs: { carouselTopic: 'beginner meal prep', slideCount: 5 },
      note: 'Cover hook, 3 value slides (mistake, tip, myth vs fact), and a CTA slide with word guidance.',
    },
    {
      title: '40 slides requested',
      inputs: { carouselTopic: 'travel hacks', slideCount: 40 },
      note: 'Clamped to 35 slides with a plan note saying exactly that — TikTok Photo Mode\'s cap.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok photo carousel ideas?',
      answer:
        'The best tiktok photo carousel ideas follow a fixed structure: a hook cover under 12 words, value slides with one idea each under 50 words, and a single clear CTA on the last slide. This free planner builds that structure for any topic and any slide count from 2 to 35.',
    },
    {
      question: 'Is there a free tiktok photo carousel ideas?',
      answer:
        'Yes — this TikTok photo carousel planner is completely free with no signup. Enter your topic and slide count, and get a slide-by-slide plan with text guidance, as many times as you like.',
    },
    {
      question: 'How to use tiktok photo carousel?',
      answer:
        'In the TikTok app, tap the + button, choose Photo, and select up to 35 photos — TikTok stitches them into a swipeable carousel. Use this planner first: paste your topic and slide count, write each slide\'s text under the word limits, then upload matching photos in order.',
    },
    {
      question: 'How does a tiktok photo carousel ideas work?',
      answer:
        'You enter a topic and a slide count (2–35). The planner assigns Slide 1 as the cover hook and the last slide as the CTA, then fills the middle with value slides cycling through 8 fixed templates. Requests above 35 slides are clamped to TikTok\'s Photo Mode cap with an honest note. It produces a text plan — you supply the photos.',
    },
    {
      question: 'How does the tiktok photo carousel ideas work?',
      answer:
        'Enter your details using the inputs above and the tiktok photo carousel ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok photo carousel ideas free to use?',
      answer:
        'Yes - this tiktok photo carousel ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok photo carousel ideas?',
      answer:
        'A tiktok photo carousel ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'This tool produces a text plan only — it does not create images or post carousels.',
    'Slide plans come from fixed templates, not AI; quality comes from the topic you enter.',
    'The 35-slide cap follows TikTok\'s Photo Mode rule; requests above it are clamped, never silently accepted.',
  ],
  jsonLd: [
  ],
};
