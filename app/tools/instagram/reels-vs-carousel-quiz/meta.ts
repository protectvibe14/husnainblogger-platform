import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'q1',
    label: 'Your main goal right now',
    type: 'select',
    required: true,
    options: [
      'Grow new followers fast',
      'Build deeper trust with my audience',
      'Drive sales or signups',
      'Get more saves and shares',
    ],
  },
  {
    id: 'q2',
    label: 'How do you feel about being on camera',
    type: 'select',
    required: true,
    options: [
      'I film myself happily',
      'Only for short, casual clips',
      'I prefer staying behind the camera',
    ],
  },
  {
    id: 'q3',
    label: 'Time you can spend creating one post',
    type: 'select',
    required: true,
    options: [
      'Under 15 minutes',
      '15 to 30 minutes',
      '30 to 60 minutes',
      'Over an hour',
    ],
  },
  {
    id: 'q4',
    label: 'What do you enjoy making most',
    type: 'select',
    required: true,
    options: [
      'Talking-head or voiceover videos',
      'Designed slides or graphics',
      'A mix of both',
    ],
  },
  {
    id: 'q5',
    label: 'How often can you post each week',
    type: 'select',
    required: true,
    options: [
      '1 to 2 times',
      '3 to 4 times',
      '5 or more times',
    ],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'recommendation',
    label: 'Your format recommendation',
    type: 'text',
    description:
    'Free reels vs carousel which is better 2026: Reels, carousels, or both — with the percentage score behind it. Fast, private now.',
  },
  {
    id: 'reasoning',
    label: 'Why this fits you',
    type: 'list',
    description:
    'The top 3 answers that tipped the result toward the recommendation.',
  },
  {
    id: 'nextSteps',
    label: 'Your next steps',
    type: 'list',
    description:
    'Five concrete actions matched to your recommended format.',
  },
];

export const content: ToolContent = {
  title: 'Reels vs Carousel Which Is Better',
  description:
    'Answer 5 quick questions to settle reels vs carousel which is better for your goals and style. Free quiz — get your format verdict and next steps now.',
  howTo: [
    'Pick your main goal in the "Your main goal right now" question.',
    'Answer how you feel about being on camera.',
    'Choose the time you can realistically spend creating one post.',
    'Select what you enjoy making most and how often you can post each week.',
    'Click run to get your Reels-or-carousel recommendation, the reasoning behind it, and your next steps.',
  ],
  methodology:
    'Each answer carries fixed point weights toward Reels or carousels (5 questions, 3-4 choices each, maximum 14 points per side). The weights are summed, converted to percentages, and a 15-percentage-point lead decides the winner; anything closer recommends both formats. Nothing is AI-generated and no Instagram data is read — it is a client-side scoring heuristic.',
  examples: [
    {
      title: 'On-camera fitness coach',
      inputs: {
        q1: 'Grow new followers fast',
        q2: 'I film myself happily',
        q3: 'Under 15 minutes',
        q4: 'Talking-head or voiceover videos',
        q5: '5 or more times',
      },
      note: 'Gets a Reels recommendation with the three deciding reasons and five Reels next steps.',
    },
    {
      title: 'Design-led lifestyle blogger',
      inputs: {
        q1: 'Get more saves and shares',
        q2: 'I prefer staying behind the camera',
        q3: 'Over an hour',
        q4: 'Designed slides or graphics',
        q5: '1 to 2 times',
      },
      note: 'Gets a carousel recommendation with reasons and five carousel next steps.',
    },
  ],
  faqs: [
    {
      question: 'What is the best reels vs carousel which is better?',
      answer:
        'There is no universal winner — it depends on your goal, camera comfort, time budget, and posting rhythm. Broadly, Reels favor fast reach while carousels favor saves and depth. This quiz weighs your answers on those factors and recommends the format that fits your situation.',
    },
    {
      question: 'Is there a free reels vs carousel which is better?',
      answer:
        'Yes — this Reels vs Carousel Quiz is completely free with no signup. Answer the 5 questions and get your format recommendation, the reasoning behind it, and next steps instantly.',
    },
    {
      question: 'How to use reels vs carousel which is better?',
      answer:
        'Answer all 5 questions about your goal, camera comfort, available time, content style, and weekly posting frequency. The tool scores your answers with a weighted heuristic and returns a Reels, carousel, or both-formats recommendation with reasons and five concrete next steps.',
    },
    {
      question: 'What is a reels vs carousel which is better?',
      answer:
        'A reels vs carousel which is better is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the reels vs carousel which is better?',
      answer:
        'No account needed. Open the reels vs carousel which is better, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'How do I use this reels vs carousel which is better tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
    {
      question: 'Is this reels vs carousel which is better tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
  ],
  assumptions: [
    'The recommendation is a heuristic from fixed answer weights — it cannot guarantee reach, engagement, or follower growth.',
    'The quiz does not read your Instagram analytics; a tool with access to your real account data could give a more precise answer.',
    'Weights reflect general traits of each format, not current Instagram algorithm behavior, which changes over time.',
  ],
  jsonLd: [],
};
