import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'q1',
    label: 'The topic you could talk about for an hour without notes',
    type: 'select',
    required: true,
    options: [
      'Fitness and healthy living',
      'Money, business, and side hustles',
      'Fashion and beauty',
      'Food and cooking',
      'Travel and adventure',
      'Parenting and family',
      'Tech, AI, and gadgets',
      'Personal growth and mindset',
    ],
  },
  {
    id: 'q2',
    label: 'Your experience level in that topic',
    type: 'select',
    required: true,
    options: [
      "I'm a professional or expert",
      "I'm learning and sharing the journey",
      "I'm a curious beginner",
    ],
  },
  {
    id: 'q3',
    label: 'Who you most want to help or entertain',
    type: 'select',
    required: true,
    options: [
      'People like me',
      'Total beginners',
      'Busy people who want quick wins',
      'Ambitious people chasing bigger goals',
    ],
  },
  {
    id: 'q4',
    label: 'The format that fits your personality best',
    type: 'select',
    required: true,
    options: [
      'Talking to camera',
      'Voiceover with visuals',
      'Designed slides or text posts',
      'Filming my everyday life',
    ],
  },
  {
    id: 'q5',
    label: 'What success looks like to you',
    type: 'select',
    required: true,
    options: [
      'Growing a large following',
      'Deep engagement (comments, DMs)',
      'Earning money (sales, brand deals)',
      'Loving the process itself',
    ],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'topNiches',
    label: 'Your top 3 niche matches',
    type: 'list',
    description:
    'Free how to find my niche instagram 2026: Ranked niche profiles with positioning angle and match score. Get instant results. free now.',
  },
  {
    id: 'clarityScore',
    label: 'Niche clarity score',
    type: 'percent',
    description:
    'How strongly your answers point at one niche (0-100).',
  },
  {
    id: 'validationSteps',
    label: 'How to validate your niche',
    type: 'list',
    description:
    'Five practical steps to test the niche before committing.',
  },
];

export const content: ToolContent = {
  title: 'Instagram Niche Finder',
  description:
    'Find your Instagram niche with this Instagram niche finder quiz — ranked niche profiles with positioning angle and match score. Try it now!',
  howTo: [
    'Pick the topic you could talk about for an hour without notes.',
    'Choose your experience level in that topic and who you want to help.',
    'Select the format that fits your personality and what success looks like to you.',
    'Click run to get your 3 ranked niche matches with a clarity score.',
    'Work through the 5 validation steps to test your top niche before committing.',
  ],
  methodology:
    'Your answers are scored against a fixed bank of 16 niche profiles (2 per topic) with fixed weights: 40 points for the topic match, 15 each for matching experience, audience, format, and goal — 100 maximum. The three highest-scoring profiles are shown, and the top score becomes your clarity score; a low score means your answers sent mixed signals. Nothing is AI-generated and no account data is read.',
  examples: [
    {
      title: 'Aspiring food creator',
      inputs: {
        q1: 'Food and cooking',
        q2: "I'm learning and sharing the journey",
        q3: 'Total beginners',
        q4: 'Filming my everyday life',
        q5: 'Growing a large following',
      },
      note: 'Gets ranked matches like "15-minute weeknight recipes" with a clarity score and validation steps.',
    },
    {
      title: 'Expert in AI tools',
      inputs: {
        q1: 'Tech, AI, and gadgets',
        q2: "I'm a professional or expert",
        q3: 'Busy people who want quick wins',
        q4: 'Voiceover with visuals',
        q5: 'Earning money (sales, brand deals)',
      },
      note: 'Gets ranked matches like "AI tools for everyday life" positioned as the expert.',
    },
  ],
  faqs: [
    {
      question: 'What is the best how to find my niche instagram?',
      answer:
        'Start from what you can talk about for an hour, match it to an audience you understand, and pick a format that fits your personality. This quiz walks you through exactly those five questions and returns three ranked niche matches with a clarity score so you can choose with more confidence.',
    },
    {
      question: 'Is there a free how to find my niche instagram?',
      answer:
        'Yes — this Niche Clarity Quiz is completely free with no signup. Answer 5 questions and instantly get your top 3 niche matches, a clarity score, and five steps to validate the niche before you commit.',
    },
    {
      question: 'How to use how to find my niche instagram?',
      answer:
        'Answer the five quiz questions about your topic, experience, audience, format, and goal. The tool scores your answers against 16 fixed niche profiles, shows your top 3 matches with a clarity score, and gives you five validation steps to test the winner in the real world.',
    },
    {
      question: 'What is a how to find my niche instagram?',
      answer:
        'A how to find my niche instagram is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the how to find my niche instagram?',
      answer:
        'No account needed. Open the how to find my niche instagram, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The niche bank has 16 fixed profiles — if your topic is unusual, the closest match is shown, not a custom analysis.',
    'The clarity score measures how consistent your answers are, not market demand or competition in the niche.',
    'This quiz cannot predict income, growth speed, or brand-deal potential.',
  ],
  jsonLd: [],
};
