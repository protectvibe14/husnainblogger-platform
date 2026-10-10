import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'lyricLines',
    label: 'Lyric lines (one per line)',
    type: 'textarea',
    required: true,
    placeholder: 'e.g.\nHello, it\'s me\nI was wondering if after all these years\n',
  },
  {
    id: 'totalDurationSec',
    label: 'Total duration (seconds)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 30',
    validation: { min: 0.5, unit: 'seconds' },
  },
  {
    id: 'beatsPerMinute',
    label: 'Beats per minute (optional)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 120',
    validation: { min: 30, max: 240 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'grid', label: 'Line timing grid', type: 'table' },
  { id: 'suggestedWordTimings', label: 'Suggested word-level timings', type: 'table' },
];

export const content: ToolContent = {
  title: 'Karaoke Caption Planner',
  description:
    'Plan word-by-word karaoke captions with ease: paste your lyric lines, set the total duration in seconds, and get a timing grid for every word.',
  howTo: [
    'Paste your lyric lines — one line per line, up to 500 lines.',
    'Enter the total duration of the section in seconds.',
    'Optionally enter the song BPM (30-240) so line boundaries snap to beats.',
    'Run the planner to get the line grid: start/end milliseconds and words-per-second per line.',
    'Use the suggested word timings as starting points, then fine-tune each highlight against the actual audio in your editor.',
  ],
  methodology:
    'Pure proportional allocation math, never AI and never audio analysis: each line reserves a minimum of 833ms on screen (karaoke readability floor), and the remaining duration is shared by character weight — longer lines get proportionally more time, not an equal split. If the lines need more time than you gave, the run fails and suggests fewer lines or a longer duration. Given a BPM, interior line boundaries snap to the nearest beat (60000 / BPM ms); word timings distribute each line\'s span by word length and are labeled estimates for manual sync, not measured timings.',
  examples: [
    {
      title: 'Three-line chorus',
      inputs: { lyricLines: 'Hello world\nThis is line two\nShort', totalDurationSec: 12 },
      note: 'Grid of 3 lines over 12s; the longest line gets the largest share of time.',
    },
    {
      title: 'Chorus snapped to 120 BPM',
      inputs: { lyricLines: 'Hello world\nThis is line two\nShort', totalDurationSec: 12, beatsPerMinute: 120 },
      note: 'Same grid, but line boundaries snap to the 500ms beat grid.',
    },
  ],
  faqs: [
    {
      question: 'What is the best karaoke caption planner?',
      answer:
        'The best one is honest about what it does: it plans, not syncs. This free planner allocates screen time per lyric line by character weight (833ms minimum per line), optionally snaps boundaries to your song\'s BPM, and gives word-level start points — all as starting points for manual sync in your editor.',
    },
    {
      question: 'Is there a free karaoke caption planner?',
      answer:
        'Yes — this planner is completely free with no signup. Paste up to 500 lyric lines, set the duration and optional BPM, and get a full timing grid instantly.',
    },
    {
      question: 'How to plan karaoke?',
      answer:
        'List one lyric line per line, enter the total seconds the section runs, and optionally the BPM. The planner gives each line proportional time (longer lines get more), snaps starts to beats when you give a BPM, and suggests per-word timings — then you fine-tune each word highlight against the audio in your editor.',
    },
    {
      question: 'How does a karaoke caption planner work?',
      answer:
        'Pure math, not AI: it reserves 833ms per line, shares the leftover time in proportion to each line\'s character length, snaps boundaries to the nearest beat when a BPM is set, and splits each line\'s span across its words by word length. It never analyzes audio, so word timings are estimates for manual sync — never measured sync points.',
    },
    {
      question: 'What is a karaoke caption planner?',
      answer:
        'A karaoke caption planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'What should I include in my karaoke caption planner plan?',
      answer: 'Cover your objectives, timeline, resources needed, and success metrics. This tool prompts you for each element so nothing gets missed.',
    },
    {
      question: 'How do I plan karaoke caption planner?',
      answer: 'Start by entering your goals and constraints above. The planner organizes everything into a step-by-step plan you can follow or share with your team.',
    },
  ],
  assumptions: [
    'The planner never hears the song: word timings are estimates as starting points for manual sync, not measured timings.',
    'The 833ms minimum per line is a karaoke readability floor, not a broadcast standard.',
    'Beat snapping aligns to a perfect metronome grid (60000 / BPM ms) — live-tempo drift still needs manual adjustment.',
    'Character weight is a proxy for sung length; melisma or held notes will still need hand-tuning.',
  ],
  jsonLd: [],
};
