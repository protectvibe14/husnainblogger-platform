import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/pinterest-social/facebook-story-idea-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'goal',
    label: 'Story goal',
    type: 'select',
    required: true,
    options: ['poll', 'qanda', 'behind-scenes', 'promo'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'storyIdeas',
    label: 'Story ideas',
    type: 'table',
    description:
    'Free facebook story ideas 2026: 8 story ideas for your goal — concept, 3–5 frame prompts, and a sticker suggestion each. Fast, private now.',
  },
  {
    id: 'canvasNote',
    label: '1080x1920 canvas note',
    type: 'text',
    description:
    'Vertical canvas framing guidance for Facebook Stories.',
  },
];

export const content: ToolContent = {
  title: 'Facebook Story Ideas',
  description:
    'Post Facebook Stories worth tapping through: pick poll, Q&A, behind the scenes, or promo for 8 ready-to-film ideas with frames and sticker suggestions.',
  howTo: [
    'Choose your story goal: poll, Q&A, behind the scenes, or promo.',
    'Run the tool to get 8 story ideas for that goal.',
    'Each idea shows a concept, 3–5 frame-by-frame prompts, and one interactive sticker suggestion.',
    'Film each frame vertical at 1080x1920, keep text in the center safe zone, and add the suggested sticker.',
  ],
  methodology:
    'Ideas come from a fixed bank of 32 hand-written story concepts — 8 per goal — each paired with 3–5 frame prompts and a native Facebook sticker suggestion (poll, question, or link). No AI is involved, and the same goal always returns the same 8 ideas.',
  examples: [
    {
      title: 'Small business poll stories',
      inputs: { goal: 'poll' },
      note: '8 poll-driven story ideas with frames and poll sticker prompts.',
    },
    {
      title: 'Creator Q&A stories',
      inputs: { goal: 'qanda' },
      note: '8 Q&A formats, each built around the question sticker.',
    },
  ],
  faqs: [
    {
      question: 'What is the best facebook story ideas?',
      answer:
        'The best Facebook story ideas pair a clear goal with interaction: polls for opinions, the question sticker for AMAs, behind-the-scenes frames for trust, and link stickers for promos. This free tool gives you 8 ready-to-film ideas per goal.',
    },
    {
      question: 'Is there a free facebook story ideas?',
      answer:
        'Yes — this Facebook story idea generator is completely free with no signup. Pick a goal and get 8 story concepts with frame-by-frame prompts and sticker suggestions.',
    },
    {
      question: 'How to use facebook story?',
      answer:
        'Choose your goal (poll, Q&A, behind the scenes, or promo), run the tool, and film the frames it suggests in vertical 1080x1920. Add the recommended interactive sticker before posting.',
    },
    {
      question: 'How does a facebook story ideas work?',
      answer:
        'You select a goal and the tool pulls 8 ideas from a fixed library for that goal — each with a concept, 3–5 frame prompts, and a matching sticker. No AI is used, so results are the same every time for the same goal.',
    },
    {
      question: 'How does the facebook story ideas work?',
      answer:
        'Enter your details using the inputs above and the facebook story ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the facebook story ideas free to use?',
      answer:
        'Yes - this facebook story ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a facebook story ideas?',
      answer:
        'A facebook story ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Ideas are fixed library entries, not AI-generated — adapt the wording to your brand voice before filming.',
    'Canvas guidance (1080x1920, center safe zone) is general best practice, not a verified platform spec.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Facebook Story Ideas 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free facebook story ideas 2026: 8 story ideas for your goal — concept, 3–5 frame prompts, and a sticker suggestion each. Fast, private now.',
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
          name: 'Facebook Story Idea Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
