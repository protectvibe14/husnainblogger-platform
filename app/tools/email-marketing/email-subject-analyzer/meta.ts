import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'subject',
    label: 'Email subject line',
    type: 'text',
    required: true,
    placeholder: 'e.g. How {{first_name}} finally doubled her open rates',
    validation: { max: 200 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'score', label: 'Subject score (0–100)', type: 'number' },
  { id: 'grade', label: 'Grade', type: 'text' },
  { id: 'factorResults', label: 'Per-factor results', type: 'list' },
  { id: 'counts', label: 'Counts and triggers', type: 'text' },
  { id: 'heuristicNote', label: 'Honesty note', type: 'text' },
];

const DESCRIPTION =
  'See your subject line like a spam filter does: paste it in for a 0-100 score, an Excellent-to-Poor grade, and per-factor fixes you can apply instantly.';

export const content: ToolContent = {
  title: 'Email Subject Line Analyzer',
  description: DESCRIPTION,
  howTo: [
    'Paste your email subject line into the field above.',
    'Run the analysis to get a 0–100 score and a grade from Excellent to Poor.',
    'Read the per-factor results: fix any FAIL items first (usually spam triggers or length).',
    'Aim for 30–50 characters, one clear benefit, and a personalization token like {{first_name}}.',
    'Test one change at a time and re-run to see the score move.',
  ],
  methodology:
    'Five fixed factors score out of 100: length — 30–50 characters is the widely cited sweet spot for full visibility on desktop and mobile (25 pts); spam triggers — each trigger (spammy phrases, ALL CAPS, 3+ exclamation marks, 2+ dollar signs) costs 8 pts from 25 (25 pts); personalization — a merge token like {{first_name}} or [Name] earns 15 pts (15 pts); curiosity vs clarity — 10 pts each for curiosity signals (question, how/why/secret) and clarity/benefit signals (guide, checklist, save) (20 pts); readability — 4–10 words scores full marks, emoji spam (>2) downgrades (15 pts). Grades: Excellent 85+, Good 70+, Needs work 50+, Poor below 50. The spam-phrase list comes from public spam-filter guides — no email provider publishes its real filter rules. No tool can predict open rates without your list\'s historical data; this scores observable best practices only.',
  examples: [
    {
      title: 'Strong subject line',
      inputs: { subject: 'How {{first_name}} finally doubled her open rates' },
      note: 'Scores 85+ (Excellent): ideal length, personalization token, curiosity + clarity signals, no spam triggers.',
    },
    {
      title: 'Spammy subject line',
      inputs: { subject: "CONGRATULATIONS!!! You've WON $$$ 100% FREE cash bonus ACT NOW!!!" },
      note: 'Scores below 50 (Poor): multiple spam triggers, ALL CAPS, excessive punctuation.',
    },
  ],
  faqs: [
    {
      question: 'What is a good email subject line length?',
      answer:
        'Aim for 30–50 characters. That range displays fully on most desktop clients and the majority of mobile clients without truncation.',
    },
    {
      question: 'What words trigger spam filters?',
      answer:
        'Common triggers include "free!", "$$$", "100% free", "act now", "congratulations", "winner", excessive ALL CAPS, and multiple exclamation marks. This analyzer checks your subject against a curated list from public spam-filter guides — no provider publishes its real rules.',
    },
    {
      question: 'Does personalization improve open rates?',
      answer:
        'Industry studies consistently show personalized subject lines (e.g. including the recipient\'s first name via a merge token like {{first_name}}) lift open rates versus generic ones. This checker awards 15 points for a detected token.',
    },
    {
      question: 'How does the email subject line analyzer work?',
      answer:
        'Enter your details using the inputs above and the email subject line analyzer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the email subject line analyzer free to use?',
      answer:
        'Yes - this email subject line analyzer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an email subject line analyzer?',
      answer:
        'An email subject line analyzer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the email subject line analyzer?',
      answer:
        'No account needed. Open the email subject line analyzer, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'The score is a heuristic — open rates depend on your list, sender reputation, and timing, which no tool can see.',
    'Spam-trigger phrases come from public spam-filter guides; they are not any provider\'s real (unpublished) filter rules.',
    'Personalization detection covers common token formats ({{name}}, [Name], %NAME%, {name}) — custom ESP syntax may not match.',
    'Curiosity/clarity word lists are heuristic and English-only.',
    'The tool never sends email or contacts any provider.',
  ],
  jsonLd: [
  ],
};
