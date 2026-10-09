import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/broadcast-channel-idea-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. fitness coaching, skincare, personal finance',
  },
  {
    id: 'goal',
    label: 'Channel goal',
    type: 'select',
    required: true,
    options: ['Educate', 'Build community', 'Promote offers', 'Behind the scenes'],
  },
  {
    id: 'count',
    label: 'Number of ideas',
    type: 'number',
    required: true,
    placeholder: '1–10',
    validation: { min: 1, max: 10 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'ideas',
    label: 'Channel ideas',
    type: 'list',
    description:
    'Free instagram broadcast channel ideas 2026: Channel name, description, and three first-post ideas per concept. Fast, private now.',
  },
  {
    id: 'bankNote',
    label: 'About these ideas',
    type: 'text',
    description:
    'Which template banks the ideas were assembled from.',
  },
];

export const content: ToolContent = {
  title: 'Instagram Broadcast Channel Ideas – 100+ Id',
  description:
    'Launch your channel with free instagram broadcast channel ideas: channel names, descriptions, and first posts matched to your goal. Generate ideas now.',
  howTo: [
    'Type your "niche" — what the broadcast channel will be about.',
    'Pick a "Channel goal" (educate, build community, promote offers, or behind the scenes) so each idea gets the right call-to-action.',
    'Choose how many ideas you want (1–10) and run the tool.',
    'Review each concept: name, description, and three first-post ideas are included.',
    'Pick your favorite, rewrite it in your voice, and create the channel in Instagram.',
  ],
  methodology:
    'Ideas are assembled from fixed template banks — 8 channel-name formulas, 6 description templates, 8 first-post templates, and 4 goal-specific calls-to-action (26 templates in all). Each idea cycles the banks in order with your niche and goal spliced in, so output is deterministic and transparent. No AI, no trend data — the result is a starting pack you edit before publishing.',
  examples: [
    {
      title: 'Educational fitness channel',
      inputs: { niche: 'fitness coaching', goal: 'Educate', count: 2 },
      note: 'Two channel concepts with lesson-focused calls-to-action and teaching-style first posts.',
    },
    {
      title: 'Community skincare channel',
      inputs: { niche: 'skincare', goal: 'Build community', count: 3 },
      note: 'Three conversation-first concepts that invite replies from day one.',
    },
    {
      title: 'Behind-the-scenes finance channel',
      inputs: { niche: 'personal finance', goal: 'Behind the scenes', count: 1 },
      note: 'One unpolished, insider-style channel concept with matching first posts.',
    },
  ],
  faqs: [
    {
      question: 'what is the best instagram broadcast channel ideas?',
      answer:
        'The best instagram broadcast channel ideas pair a memorable name with a clear description and ready-to-post openers — all matched to what the channel is for. This free generator builds full concepts (name, description, three first posts) around your niche and one of four goals.',
    },
    {
      question: 'is there a free instagram broadcast channel ideas?',
      answer:
        'Yes — this Instagram broadcast channel ideas generator is completely free with no signup. Enter your niche, pick a goal, and get up to 10 complete channel concepts with first-post ideas.',
    },
    {
      question: 'how to use instagram broadcast channel?',
      answer:
        'Create a broadcast channel from your Instagram profile, give it a clear name and description, then post consistently — updates, polls, and behind-the-scenes drops work well. Use this tool to draft the name, description, and your first three posts before you launch.',
    },
    {
      question: 'How does the instagram broadcast channel ideas work?',
      answer:
        'Enter your details using the inputs above and the instagram broadcast channel ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the instagram broadcast channel ideas free to use?',
      answer:
        'Yes - this instagram broadcast channel ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an instagram broadcast channel ideas?',
      answer:
        'An instagram broadcast channel ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the instagram broadcast channel ideas?',
      answer:
        'No account needed. Open the instagram broadcast channel ideas, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Ideas come from 26 fixed templates, not AI — rewrite the winning concept in your own voice before creating the channel.',
    'The tool drafts concepts only; it cannot create the channel in Instagram or predict subscriber counts.',
    'Name availability is not checked — verify your chosen channel name in the Instagram app before launch.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Instagram Broadcast Channel Ideas – 100+ Id | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free instagram broadcast channel ideas 2026: Channel name, description, and three first-post ideas per concept. Fast, private now.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Instagram Tools',
          item: 'https://husnainblogger.com/tools/instagram/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Broadcast Channel Idea Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
