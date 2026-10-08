import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/giveaway-winner-picker/';

export const inputs: ToolInput[] = [
  {
    id: 'entries',
    label: 'Entries (one per line)',
    type: 'textarea',
    required: true,
    placeholder: 'Paste each entry on its own line',
  },
  {
    id: 'winnerCount',
    label: 'Number of winners',
    type: 'number',
    required: false,
    placeholder: '1',
    validation: { min: 1 },
  },
  {
    id: 'dedupe',
    label: 'Remove duplicate entries',
    type: 'boolean',
    required: false,
  },
  {
    id: 'seed',
    label: 'Draw seed (optional)',
    type: 'text',
    required: false,
    placeholder: 'Any text, e.g. episode-42 — same seed = same draw',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'winners',
    label: 'Winners',
    type: 'list',
    description: 'Free youtube giveaway winner picker 2026: The drawn winner(s) in draw order. Instant, private, and mobile-friendly. No signup - try it free!',
  },
  {
    id: 'audit',
    label: 'Entry audit list',
    type: 'list',
    description: 'Every entry that was considered in the draw.',
  },
  {
    id: 'compliance',
    label: 'Contest-policy reminders',
    type: 'list',
    description: 'YouTube contest policy reminders — the tool alone does not make a giveaway compliant.',
  },
  {
    id: 'summary',
    label: 'Draw summary',
    type: 'text',
    description: 'Winner count, entry count, dedupe setting and the seed used.',
  },
];

export const content: ToolContent = {
  title: 'YouTube Giveaway Winner Picker 2026 – Free | HusnainBlogger',
  description:
    'Pick YouTube giveaway winners free: paste your entries, set the winner count, and draw fair seeded random winners with an audit list. Run a draw now!',
  howTo: [
    'Paste your Entries, one per line — this tool cannot pull comments from YouTube, so entry is manual.',
    'Set the Number of Winners (default 1; cannot exceed your entry count).',
    'Keep Remove Duplicate Entries on (recommended) to count each person once.',
    'Optionally type a Draw Seed (any text): the same seed always reproduces the same draw.',
    'Click Draw to get the winners, the full entry audit list, and contest-policy reminders.',
  ],
  methodology:
    'The draw is a fair, uniform shuffle of your entered entries using a seeded mulberry32 PRNG (seeded from your seed text, or derived from the entries if left blank) — no Math.random, no server, fully deterministic and reproducible. It never contacts YouTube: entries are pasted manually, which is why the draw stays free and private. A contest-policy compliance checklist is included in every result, but it does not make your giveaway compliant — you remain responsible for official rules and local laws.',
  examples: [
    {
      title: 'Pick 1 winner from 6 entries',
      inputs: { entries: 'alice\nbob\ncarol\ndave\neve\nfrank', winnerCount: 1, dedupe: true, seed: 'episode-42' },
      note: 'Draws 1 winner deterministically; re-running with seed "episode-42" gives the same winner.',
    },
    {
      title: 'Pick 3 winners without a seed',
      inputs: { entries: 'alice\nbob\ncarol\ndave\neve\nfrank', winnerCount: 3, dedupe: true },
      note: 'The seed is auto-derived from the entries, so the draw is still reproducible.',
    },
  ],
  faqs: [
    {
      question: 'What is the best youtube giveaway winner picker?',
      answer:
        'There is no verified "best" — for a casual giveaway you need a fair, auditable draw. This free picker shuffles your manually pasted entries with a seeded random draw, shows the full entry audit list, and includes YouTube contest-policy reminders. It cannot pull comments from YouTube itself.',
    },
    {
      question: 'Is there a free youtube giveaway winner picker?',
      answer:
        'Yes — this picker is completely free with no signup. Paste entries one per line, set the winner count, optionally add a seed for a reproducible draw, and get winners plus an audit list.',
    },
    {
      question: 'How to pick youtube giveaway winner?',
      answer:
        'Collect your entries (for example, export or copy comment usernames), paste them one per line into the picker, set how many winners you want, and run the draw. Re-enter the same seed to reproduce the exact same result for transparency, and publish official rules as YouTube requires.',
    },
    {
      question: 'How does a youtube giveaway winner picker work?',
      answer:
        'This picker performs a seeded random shuffle of the entries you paste in — every entry has an equal chance, duplicates can be removed, and the draw is deterministic so anyone can verify it with the same seed. It does not connect to YouTube; it is a casual-draw tool, not suitable for regulated lotteries.',
    },
    {
      question: 'How does the youtube giveaway winner picker work?',
      answer:
        'Enter your details using the inputs above and the youtube giveaway winner picker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube giveaway winner picker free to use?',
      answer:
        'Yes - this youtube giveaway winner picker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube giveaway winner picker?',
      answer:
        'A youtube giveaway winner picker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Entries are pasted manually — the tool cannot read YouTube comments, videos, or subscriber lists.',
    'The draw is client-side and seeded: fair for casual giveaways, not suitable for regulated lotteries.',
    'The included contest-policy reminders are general guidance, not legal advice; you are responsible for compliance.',
    'Winner identity is whatever text you paste per line — the tool does not verify that entries are real viewers.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'YouTube Giveaway Winner Picker 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free youtube giveaway winner picker 2026: The drawn winner(s) in draw order. Instant, private, and mobile-friendly. No signup - try it free!',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'YouTube Tools',
          item: 'https://husnainblogger.com/tools/youtube/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Giveaway Winner Picker',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
