import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/live-q-a-collector/';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'question',
    label: 'Question',
    type: 'text',
    required: true,
    placeholder: 'Paste the question from your live chat',
  },
  {
    id: 'asker',
    label: 'Asker name',
    type: 'text',
    required: false,
    placeholder: 'Viewer name (optional)',
  },
  {
    id: 'upvotes',
    label: 'Upvotes',
    type: 'text',
    required: false,
    placeholder: 'Number of votes, e.g. 12 (default 0)',
  },
  {
    id: 'status',
    label: 'Status',
    type: 'text',
    required: false,
    placeholder: 'new, answered or archived (default: new)',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'queue',
    label: 'Ranked question queue',
    type: 'list',
    description:
    'Free live stream q&a collector 2026: Open questions ranked by upvotes, highest first. free.',
  },
  {
    id: 'answered',
    label: 'Answered archive',
    type: 'list',
    description:
    'Questions marked as answered during the stream.',
  },
  {
    id: 'exportText',
    label: 'Queue export',
    type: 'copy',
    description:
    'Plain-text export of the ranked queue and answered list.',
  },
  {
    id: 'summary',
    label: 'Queue summary',
    type: 'text',
    description:
    'Counts of open, answered and archived questions.',
  },
];

export const content: ToolContent = {
  title: 'Live Stream Q&A Collector',
  description:
    'Collect and rank live stream questions manually: paste questions from your stream chat, upvote the popular ones, and export a ranked Q&A queue. Start.',
  howTo: [
    'Add one item per question and paste the Question text from your live chat.',
    'Type the Asker Name (optional) so you can credit the viewer on stream.',
    'Enter the Upvotes as a whole number to rank popular questions higher.',
    'Set the Status to new, answered or archived as you work through the queue.',
    'Click Build to get the ranked queue, the answered archive, and a copy-ready export.',
  ],
  methodology:
    'This is a manual queue manager, not a chat reader: it cannot access YouTube live chat (no YouTube API integration), so a moderator copies questions in by hand. Open questions are ranked by upvote count, highest first, with ties keeping their original entry order. Answered and archived items are excluded from the queue and listed separately. The result is fully deterministic: the same items always produce the same queue.',
  faqs: [
    {
      question: 'What is the best live stream q&a collector?',
      answer:
        'There is no independently verified "best" — it depends on your workflow. This free collector is a simple manual queue: you paste questions from your stream chat, upvote the popular ones, and get a ranked queue plus an answered archive, with no signup and no API access to your channel.',
    },
    {
      question: 'Is there a free live stream q&a collector?',
      answer:
        'Yes — this one is completely free with no signup. Add each question as an item with an optional asker name, upvotes and status, then build the ranked queue and copy the plain-text export into your streaming notes.',
    },
    {
      question: 'How to collect live stream q a?',
      answer:
        'During your stream, have a moderator watch the chat, paste each question into the collector as an item, and bump the upvote count when viewers repeat a question. Mark questions answered as you cover them, archive the rest, and export the queue for your records.',
    },
    {
      question: 'How does a live stream q&a collector work?',
      answer:
        'This collector ranks the questions you enter manually: open questions are sorted by upvote count, highest first, while answered and archived questions are kept in separate lists. It cannot read YouTube live chat itself — entry is manual, which keeps it free and private.',
    },
    {
      question: 'What is a live stream q&a collector?',
      answer:
        'A live stream q&a collector is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Is this live stream q&a collector tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
    {
      question: 'How do I use this live stream q&a collector tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
  ],
  assumptions: [
    'Manual entry only: the tool cannot read YouTube live chat or any stream platform chat — there is no YouTube API integration.',
    'Upvote counts are entered by hand and reflect whatever counting method your moderators use.',
    'Ranking is a simple votes-descending sort; it does not detect duplicates, spam, or question quality.',
    'Not affiliated with YouTube; the queue is a working aid, not an official moderation tool.',
  ],
  jsonLd: [],
};
