import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Poll topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. morning routines',
    validation: { max: 200 },
  },
  {
    id: 'duration',
    label: 'Poll duration',
    type: 'select',
    required: false,
    options: ['5min', '1h', '24h', '7d'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'pollQuestion',
    label: 'Your poll question',
    type: 'text',
    description:
    'Free twitter poll ideas 2026: One engagement-ready poll question built from your topic (within 280 chars). Fast, private now.',
  },
  {
    id: 'options',
    label: 'Poll options',
    type: 'list',
    description:
    "4 answer options, each within X's 25-character option limit.",
  },
  {
    id: 'suggestedDuration',
    label: 'Suggested duration',
    type: 'text',
    description:
    "Your chosen duration, confirmed inside X's 5-minute to 7-day range.",
  },
];

export const content: ToolContent = {
  title: 'Twitter Poll Ideas',
  description:
    'Run X polls people actually vote on: enter any topic, pick a duration from 5 minutes to 7 days, for a sharp question plus 4 multiple-choice options.',
  howTo: [
    'Type your poll topic in the Poll topic field (for example, "morning routines").',
    'Choose a Poll duration — 5 minutes, 1 hour, 24 hours, or 7 days (24 hours is the default).',
    'Click run to get your poll question and 4 answer options.',
    'Check that the options fit your angle; swap any option text that misses the mark.',
    'Copy the question and options into a new X poll and post.',
  ],
  methodology:
    'This tool is a template library, not AI: it assembles each poll from 8 hand-written question templates and 8 hand-written option sets (32 options total). A deterministic hash of your topic picks the template and its paired option set, so the same topic always returns the same poll. Every option is written to fit X\'s 25-character option limit, polls always use 2–4 options, durations stay inside the 5-minute to 7-day range, and the question is kept within the 280-character weighted budget.',
  examples: [
    {
      title: 'Creator polling the audience',
      inputs: { topic: 'morning routines', duration: '24h' },
      note: 'Gets an engagement-style question with 4 ready-to-post options.',
    },
    {
      title: 'Quick flash poll',
      inputs: { topic: 'email marketing', duration: '1h' },
      note: 'A 1-hour poll for fast feedback on a hot topic.',
    },
  ],
  faqs: [
    {
      question: 'What is the best twitter poll ideas?',
      answer:
        'The best poll ideas pair a specific, opinion-splitting question with short, distinct options. This tool gives you exactly that: one question plus 4 options, all pre-checked against X\'s character and option limits.',
    },
    {
      question: 'Is there a free twitter poll ideas?',
      answer:
        'Yes — this Twitter Poll Ideas tool is completely free with no signup. Enter any topic, pick a duration, and get a ready-to-post poll instantly.',
    },
    {
      question: 'How to use twitter poll?',
      answer:
        'On X, tap the poll icon when composing a post, paste in your question, add 2–4 options (25 characters each), and set a duration between 5 minutes and 7 days. This tool prepares all of that for you — just copy it over.',
    },
    {
      question: 'How does a twitter poll ideas work?',
      answer:
        'You enter a topic and duration; the tool picks a matching question template and option set from its fixed library and checks everything against X\'s poll limits. Nothing is AI-generated — the ideas come from hand-written templates, so re-running the same topic gives the same result.',
    },
    {
      question: 'How does the twitter poll ideas work?',
      answer:
        'Enter your details using the inputs above and the twitter poll ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the twitter poll ideas free to use?',
      answer:
        'Yes - this twitter poll ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a twitter poll ideas?',
      answer:
        'A twitter poll ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Ideas come from a fixed library of 8 question templates and 8 option sets — not AI and not tailored to your audience.',
    'Same topic + duration always returns the same poll; variety comes from trying different topics.',
    'Duration and option limits reflect X\'s published poll rules; the tool cannot post the poll for you.',
  ],
  jsonLd: [],
};
