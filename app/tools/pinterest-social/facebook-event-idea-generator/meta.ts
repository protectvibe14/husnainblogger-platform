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
    description: 'Free facebook event ideas 2026: 8 event ideas — title, online/in-person format, description seed, and cover note each. Fast, private, no signup - try it now!',
  },
  {
    id: 'coverGuidance',
    label: 'Cover-size guidance',
    type: 'text',
    description: 'Honest note on conflicting event cover-size sources.',
  },
];

export const content: ToolContent = {
  title: 'Facebook Event Ideas',
  description:
    'Get Facebook event ideas for your business type. Browse online and in-person event titles with description seeds and honest cover-size guidance. Start free!',
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
      question: 'How does the facebook event ideas work?',
      answer:
        'Enter your details using the inputs above and the facebook event ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the facebook event ideas free to use?',
      answer:
        'Yes - this facebook event ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a facebook event ideas?',
      answer:
        'A facebook event ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Ideas are fixed templates with your business type filled in — starting points, not AI-written event plans. Rewrite descriptions in your own voice.',
    'The cover note intentionally reports conflicting cover-size sources instead of claiming one verified size; verify against Facebook\u2019s current preview.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Facebook Event Ideas 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free facebook event ideas 2026: 8 event ideas — title, online/in-person format, description seed, and cover note each. Fast, private, no signup - try it now!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Pinterest & Social Tools',
          item: 'https://husnainblogger.com/tools/pinterest-social/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Facebook Event Idea Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
