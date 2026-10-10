import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/facebook-event-idea-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'businessType',
    label: 'Your business type',
    type: 'text',
    required: true,
    placeholder: 'e.g. coffee shop',
    validation: { max: 60 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'eventIdeas',
    label: 'Event ideas',
    type: 'table',
    description:
    'Free facebook event ideas 2026: 8 event ideas — title, online/in-person format, description seed, and cover note each. Fast, private now.',
  },
  {
    id: 'coverGuidance',
    label: 'Cover-size guidance',
    type: 'text',
    description:
    'Honest note on conflicting event cover-size sources.',
  },
];

export const content: ToolContent = {
  title: 'Facebook Event Ideas',
  description:
    'Fill your events calendar with ideas that draw crowds: enter your business type for 8 online and in-person events with title seeds. Start now!',
  howTo: [
    'Type your business type (up to 60 characters), e.g. "coffee shop".',
    'Run the tool to get 8 event ideas — titles, formats, and description seeds.',
    'Pick the ideas that fit your audience, then expand the short seed into a full event description.',
    'Read the cover note before uploading artwork: it flags the conflicting size sources honestly.',
  ],
  methodology:
    'Ideas are assembled from a fixed bank of 8 hand-written event templates with your business type slotted in — no AI is involved. Templates alternate online and in-person formats, and description seeds stay under 200 characters. The cover note deliberately does not claim one verified cover size because sources conflict; it advises centering key text and checking Facebook\u2019s live preview.',
  examples: [
    {
      title: 'Coffee shop events',
      inputs: { businessType: 'coffee shop' },
      note: '8 online and in-person event ideas with description seeds.',
    },
    {
      title: 'Fitness studio events',
      inputs: { businessType: 'fitness studio' },
      note: 'Workshops, open houses, and live Q&A formats.',
    },
  ],
  faqs: [
    {
      question: 'What is the best facebook event ideas?',
      answer:
        'The best Facebook event ideas match your business: open houses and workshops for local shops, live Q&As and demo days for online audiences. This free tool gives you 8 of both formats with description seeds for any business type.',
    },
    {
      question: 'Is there a free facebook event ideas?',
      answer:
        'Yes — this Facebook event idea generator is completely free with no signup. Enter your business type and get 8 event ideas with titles, formats, and description seeds.',
    },
    {
      question: 'How to use facebook event?',
      answer:
        'Enter your business type, pick an idea from the 8 generated, and expand its description seed into your full event description in Facebook. Read the cover note first — it warns that cover-size sources conflict.',
    },
    {
      question: 'How does a facebook event ideas work?',
      answer:
        'It slots your business type into a fixed bank of 8 event templates across online and in-person formats — no AI. The same business type always returns the same ideas, so results are fully predictable.',
    },
    {
      question: 'What is a facebook event ideas?',
      answer:
        'A facebook event ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I create facebook event ideas?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
    {
      question: 'Can I customize the generated facebook event ideas?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
  ],
  assumptions: [
    'Ideas are fixed templates with your business type filled in — starting points, not AI-written event plans. Rewrite descriptions in your own voice.',
    'The cover note intentionally reports conflicting cover-size sources instead of claiming one verified size; verify against Facebook\u2019s current preview.',
  ],
  jsonLd: [],
};
