import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent, BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/upload-streak-tracker/';

const DESCRIPTION =
  'Stay consistent with this YouTube upload streak tracker — log every upload, watch your streak grow, and never break the chain again. Build the habit.';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  { id: 'date', label: 'Upload date', type: 'date', required: true },
];

export const trackerMode: 'log' = 'log';

export const outputs: ToolOutput[] = [
  { id: 'currentStreak', label: 'Current streak', type: 'number' },
  { id: 'longestStreak', label: 'Longest streak', type: 'number' },
  { id: 'totalUploads', label: 'Total uploads logged', type: 'number' },
  { id: 'weeklyRate', label: 'Uploads per week', type: 'number' },
  { id: 'missedSlots', label: 'Missed slots', type: 'number' },
  { id: 'summary', label: 'Plain-English summary', type: 'text' },
  { id: 'guidance', label: 'What the numbers mean', type: 'list' },
];

export const content: ToolContent = {
  title: 'Youtube Upload Streak Tracker',
  description: DESCRIPTION,
  howTo: [
    'Log each upload date manually (YYYY-MM-DD) — one entry per upload; same-day uploads are merged automatically.',
    'Pick your cadence: daily streaks count consecutive upload days, weekly streaks count consecutive weeks with at least one upload.',
    'Run the tracker to get your current streak, longest streak, uploads per week, and missed slots since your first logged upload.',
    'Your streak stays alive through today if your last upload was yesterday (daily) or last week (weekly) — older than that, it resets.',
    'Keep the log current: dates are stored in your browser, and future dates are rejected.',
  ],
  methodology:
    'Pure client-side date math on the upload dates you log: current and longest streaks count consecutive days (or ISO weeks) with at least one upload, uploads-per-week is total uploads divided by the span in 7-day windows, and missed slots are scheduled days/weeks between your first upload and the analysis date with no logged upload. Dates are compared as UTC calendar days (timezone-safe); there is no YouTube API connection and YouTube has no official upload-streak rule — consistency is a planning habit, not a platform requirement.',
  faqs: [
    {
      question: 'what is the best youtube upload streak tracker?',
      answer:
        'The best one tracks both current and longest streaks, your real uploads-per-week rate, and missed slots — for daily and weekly cadences. This free tool does exactly that from a manual date log you keep: enter each upload date and it computes the rest.',
    },
    {
      question: 'is there a free youtube upload streak tracker?',
      answer:
        'Yes — this tool is completely free with no signup. Log your upload dates manually, choose daily or weekly cadence, and get current/longest streaks, uploads per week, and missed slots. Dates are stored in your browser, never on a server.',
    },
    {
      question: 'how to track youtube upload streak?',
      answer:
        'Record every upload date, then count consecutive days (or weeks) with at least one upload — that is your streak. This tool does the counting: log the dates, pick daily or weekly cadence, and it reports current streak, longest streak, weekly rate, and missed slots.',
    },
    {
      question: 'how does a youtube upload streak tracker work?',
      answer:
        'You log each upload date; the tracker counts consecutive upload days (or ISO weeks) for the current and longest streaks, divides total uploads by the time span for a weekly rate, and counts scheduled slots with no upload as missed. This one is manual — no YouTube API — so it only ever describes the dates you entered.',
    },
    {
      question: 'How does the youtube upload streak tracker work?',
      answer:
        'Enter your details using the inputs above and the youtube upload streak tracker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube upload streak tracker free to use?',
      answer:
        'Yes - this youtube upload streak tracker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube upload streak tracker?',
      answer:
        'A youtube upload streak tracker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Manual date entry only: the tool cannot read your YouTube upload history (that needs API access); stats describe the logged dates.',
    'Dates are compared as UTC calendar days; two uploads on the same day count once, and future dates are rejected.',
    'YouTube has no official upload-streak rule — streaks are a personal consistency habit, not a platform requirement.',
  ],
  jsonLd: [
  ],
};
