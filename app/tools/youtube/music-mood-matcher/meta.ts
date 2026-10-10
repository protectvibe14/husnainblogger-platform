import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'mood',
    label: 'Mood',
    type: 'select',
    required: true,
    placeholder: 'What should the music feel like?',
    options: [
      'energetic',
      'calm',
      'dramatic',
      'uplifting',
      'suspenseful',
      'funny',
      'emotional',
      'inspirational',
      'chill',
      'intense',
    ],
  },
  {
    id: 'segment',
    label: 'Video segment',
    type: 'select',
    required: true,
    placeholder: 'Where in the video will the music play?',
    options: ['intro', 'main-content', 'transition', 'b-roll', 'explainer', 'outro'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'musicBrief', label: 'Music brief', type: 'text' },
  { id: 'searchTerms', label: 'Royalty-free library search terms', type: 'list' },
  { id: 'copyrightReminder', label: 'Copyright-safe sourcing reminder', type: 'text' },
];

const DESCRIPTION =
  'Find the right soundtrack with this background music for YouTube videos finder — match mood, tempo, and energy to your video\'s tone and pacing.';

export const content: ToolContent = {
  title: 'Background Music for Youtube Videos Finder',
  description: DESCRIPTION,
  howTo: [
    'Pick the mood your scene needs from the Mood dropdown (e.g. energetic, calm, dramatic).',
    'Pick the video segment the music will play under (intro, b-roll, outro, and more).',
    'Run the tool to get your music brief: tempo range, genre directions, and instrumentation to look for.',
    'Copy any of the royalty-free search terms into a music library like the YouTube Audio Library to find actual tracks.',
    'Read the copyright reminder — only use tracks you have licensed or that are explicitly royalty-free.',
  ],
  methodology:
    'The tool looks up your mood in a fixed mapping table of 10 moods, each with a documented tempo range, 3 genre descriptors, 3 instrumentation descriptors, 5 library search terms, and a usage tip. Your video segment adds fixed placement notes (6 segments). There is no AI and no audio — the output is descriptor text and search terms only.',
  examples: [
    {
      title: 'Energetic intro',
      inputs: { mood: 'energetic', segment: 'intro' },
      note: 'Get an upbeat 120–140 BPM brief with punchy-drums search terms for a fast hook.',
    },
    {
      title: 'Calm outro',
      inputs: { mood: 'calm', segment: 'outro' },
      note: 'Get a slow, spacious ambient brief suited to a call-to-action ending.',
    },
    {
      title: 'Dramatic b-roll',
      inputs: { mood: 'dramatic', segment: 'b-roll' },
      note: 'Get cinematic orchestral descriptors and tension-music search terms for a montage.',
    },
  ],
  faqs: [
    {
      question: 'what is the best background music for youtube videos finder?',
      answer:
        'The best approach is matching music to your mood and segment — this free finder maps 10 moods (energetic, calm, dramatic, and more) to tempo ranges, genre directions, and search terms you can paste into royalty-free libraries. For actual tracks, the YouTube Audio Library is the safest free source.',
    },
    {
      question: 'is there a free background music for youtube videos finder?',
      answer:
        'Yes — this finder is completely free with no signup. It gives you music briefs and royalty-free search terms instantly; you then grab actual free tracks from libraries like the YouTube Audio Library.',
    },
    {
      question: 'how to find background music for youtube videos?',
      answer:
        'First decide the mood and where the music sits in your video, then use this finder to get the right tempo, genre, and search terms. Paste those terms into the YouTube Audio Library or another royalty-free library, preview tracks, and pick one that fits your voiceover.',
    },
    {
      question: 'how does a background music for youtube videos finder work?',
      answer:
        'This one is a static mapping table, not a music player: you pick a mood and video segment, and it returns a written music brief (tempo, genres, instrumentation) plus ready-to-paste search terms for royalty-free libraries. It provides descriptors and search terms only — never audio files or licenses.',
    },
    {
      question: 'How does the background music for youtube videos finder work?',
      answer:
        'Enter your details using the inputs above and the background music for youtube videos finder calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the background music for youtube videos finder free to use?',
      answer:
        'Yes - this background music for youtube videos finder is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a background music for youtube videos finder?',
      answer:
        'A background music for youtube videos finder is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Static mapping of 10 moods and 6 video segments — it suggests music categories and search terms, not actual tracks.',
    'BPM ranges are guidance for describing tracks, not rules; a great track slightly outside the range still works.',
    'Only use tracks you have licensed or that are explicitly royalty-free — never commercial songs without permission.',
    'Taste is yours: the brief narrows the search, but you still need to preview and judge each track yourself.',
  ],
  jsonLd: [],
};
