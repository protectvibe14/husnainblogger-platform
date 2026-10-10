import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/countdown-sticker-text-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'event',
    label: 'Event name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Summer Sale, Course Launch, Live Webinar',
  },
  {
    id: 'date',
    label: 'Event date',
    type: 'date',
    required: true,
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'texts',
    label: 'Countdown texts',
    type: 'table',
    description:
    'Free instagram countdown ideas 2026: Before / now / after variants matched to your event date. free.',
  },
  {
    id: 'copyAll',
    label: 'Copy all texts',
    type: 'copy',
    description:
    'All countdown texts as plain text, ready to paste.',
  },
  {
    id: 'daysLeft',
    label: 'Days until event',
    type: 'number',
    description:
    'Whole days from today to the event (negative = past).',
  },
  {
    id: 'phase',
    label: 'Phase',
    type: 'text',
    description:
    'Which set of texts was generated: before, now, or after.',
  },
];

export const content: ToolContent = {
  title: 'Instagram Countdown Ideas',
  description:
    'Get instagram countdown ideas for your launch or event: before, during, and after text variants. Enter your event and date, copy the texts — free.',
  howTo: [
    'Type your event name into the "Event name" box — e.g. "Summer Sale".',
    'Pick the event date with the "Event date" picker.',
    'Run the tool — it detects whether the event is upcoming, today, or past and shows the matching text set.',
    'Check "Days until event" to confirm the countdown math.',
    'Use "Copy all texts" and paste a line into the Countdown sticker on your Instagram story.',
  ],
  methodology:
    'This tool picks one of three fixed text sets (6 before-event, 3 happening-now, 3 post-event templates) based on the whole-day UTC difference between today and your event date, then inserts your event name and date verbatim. Nothing is written by AI, and the day count ignores time of day.',
  examples: [
    {
      title: 'Upcoming product launch',
      inputs: { event: 'Course Launch', date: '2026-12-01' },
      note: 'Six "before the event" countdown texts with the live day count.',
    },
    {
      title: 'Event happening today',
      inputs: { event: 'Live Webinar', date: '2026-10-01' },
      note: 'Three "happening now" texts for an event dated today.',
    },
    {
      title: 'Past event follow-up',
      inputs: { event: 'Spring Meetup', date: '2026-09-10' },
      note: 'Three "after the event" texts for a date in the past.',
    },
  ],
  faqs: [
    {
      question: 'What is the best instagram countdown ideas?',
      answer:
        'The best instagram countdown ideas match the moment: hype-building lines before the event ("3 days until X!"), urgent lines on the day ("LIVE NOW"), and thank-you or replay lines after. This tool writes all three sets for you — enter your event and date, and it shows the set that fits today.',
    },
    {
      question: 'Is there a free instagram countdown ideas?',
      answer:
        'Yes — this instagram countdown ideas generator is completely free with no signup. You get 12 hand-written countdown texts (6 before, 3 during, 3 after) for any event and date, and can reuse it for every launch.',
    },
    {
      question: 'How to use instagram countdown?',
      answer:
        'Enter your event name and date, then copy one of the generated texts. In the Instagram app, create a story, add the Countdown sticker, set the same event name and end date, and paste the text into your story caption or sticker area.',
    },
    {
      question: 'How does an instagram countdown ideas work?',
      answer:
        'You provide an event name and date; the tool computes whole days from today to the event (in UTC) and fills 12 fixed, hand-written templates with your event details. It shows the before, happening-now, or after set depending on whether the date is in the future, today, or past.',
    },
    {
      question: 'How does the instagram countdown ideas work?',
      answer:
        'Enter your details using the inputs above and the instagram countdown ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the instagram countdown ideas free to use?',
      answer:
        'Yes - this instagram countdown ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an instagram countdown ideas?',
      answer:
        'An instagram countdown ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Texts come from 12 fixed templates (6 before + 3 during + 3 after) — not AI generation.',
    'The phase is computed from whole UTC days between today and the event date; it ignores the event\u2019s time of day.',
    'This tool only writes the text — you still set the actual countdown end date inside Instagram\u2019s sticker.',
  ],
  jsonLd: [],
};
