import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-text-overlay-prompt-writer/';

export const inputs: ToolInput[] = [
  {
    id: 'sceneDescription',
    label: 'Scene description',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. I show three budget groceries swaps, one per beat, ending with the total saved',
  },
  {
    id: 'videoTopic',
    label: 'Video topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. budget groceries, home workouts, study tips',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'hookLine',
    label: 'Hook line',
    type: 'text',
    description: 'Free tiktok text overlay ideas 2026: The opening on-screen line, capped at 42 characters for mobile readability. Fast, private, no signup - try it now!',
  },
  {
    id: 'beatLines',
    label: 'Beat lines',
    type: 'list',
    description: 'One readable line per beat; long sentences are split with a [pause] marker.',
  },
  {
    id: 'copyAll',
    label: 'Copy all lines',
    type: 'copy',
    description: 'Hook, beat lines, and safe-zone guidance as plain text.',
  },
];

export const content: ToolContent = {
  title: 'TikTok Text Overlay Ideas',
  description:
    'Create free tiktok text overlay ideas from your scene: hook line plus beat lines, every line capped at 42 chars for mobile readability. Try it now!',
  howTo: [
    'Describe the scene in the "Scene description" box (what happens, beat by beat).',
    'Enter the "Video topic" so the output stays labelled and organized.',
    'Run the tool: your first sentence becomes the hook line, the rest become beat lines.',
    'Every line is wrapped to 42 characters or fewer for mobile readability.',
    'Use "Copy all lines" to paste the hook and beats into your editing notes.',
  ],
  methodology:
    'This tool splits your scene description into sentences with a fixed rule (sentence terminators only — no AI). The first sentence becomes the hook line; remaining sentences become beat lines. Lines are word-wrapped to a 42-character mobile-readability guideline, and any sentence that needs two lines gets a [pause] beat between the parts. It never renders anything on a video frame: safe-zone advice is guidance text only.',
  examples: [
    {
      title: 'Plant-care scene',
      inputs: {
        sceneDescription: 'Stop scrolling if your plants keep dying. This 2-minute trick saves them.',
        videoTopic: 'plant care',
      },
      note: 'Returns a hook line plus one beat line, both within 42 characters.',
    },
    {
      title: 'Long-sentence split with pause',
      inputs: {
        sceneDescription:
          'This sentence is deliberately much longer than forty two characters so it must be split into pieces.',
        videoTopic: 'testing',
      },
      note: 'The long sentence becomes two lines with a [pause] beat between them.',
    },
    {
      title: 'Multi-beat scene',
      inputs: {
        sceneDescription: 'Three grocery swaps that save real money. Swap one: store brand pasta. Swap two: frozen veggies.',
        videoTopic: 'budget groceries',
      },
      note: 'Returns a hook line and three beat lines in order.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok text overlay ideas?',
      answer:
        'The best tiktok text overlay ideas put the hook in the first line and keep every line short enough to read on a phone at a glance. This free writer turns your scene description into a hook line plus beat lines, each capped at 42 characters as a mobile readability guideline.',
    },
    {
      question: 'Is there a free tiktok text overlay ideas?',
      answer:
        'Yes — this TikTok text overlay writer is completely free with no signup. Paste any scene description and get a hook line plus beat lines, as many times as you like.',
    },
    {
      question: 'How to use tiktok text overlay?',
      answer:
        'Describe your scene beat by beat, then copy the generated hook line and beat lines into TikTok\'s text tool or your editor. Keep the text in the middle of the frame — the tool\'s copy-all output reminds you that TikTok\'s UI covers the top and bottom edges.',
    },
    {
      question: 'How does a tiktok text overlay ideas work?',
      answer:
        'It splits your scene description into sentences by fixed rules — the first sentence becomes the hook, the rest become beats — then word-wraps every line to 42 characters and inserts a [pause] beat wherever a sentence needs two lines. No AI is involved; it is template and rule-based text processing.',
    },
    {
      question: 'How does the tiktok text overlay ideas work?',
      answer:
        'Enter your details using the inputs above and the tiktok text overlay ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok text overlay ideas free to use?',
      answer:
        'Yes - this tiktok text overlay ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok text overlay ideas?',
      answer:
        'A tiktok text overlay ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The 42-character cap is a mobile readability guideline, not a TikTok rule.',
    'Safe-zone guidance is advisory text — this tool never renders anything on a video frame.',
    'Sentence splitting follows punctuation rules; unusual punctuation may split differently than you expect.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'TikTok Text Overlay Ideas 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free tiktok text overlay ideas 2026: The opening on-screen line, capped at 42 characters for mobile readability. Fast, private, no signup - try it now!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'TikTok Tools',
          item: 'https://husnainblogger.com/tools/tiktok/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'TikTok Text Overlay Prompt Writer',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
