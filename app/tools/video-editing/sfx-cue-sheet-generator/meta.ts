import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/video-editing/sfx-cue-sheet-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'timelineBeats',
    label: 'Timeline beats (JSON)',
    type: 'textarea',
    required: true,
    placeholder: '[{"timeMs": 3000, "action": "door slams"}, {"timeMs": 9000, "action": "phone rings"}]',
  },
  {
    id: 'mood',
    label: 'Mood',
    type: 'text',
    required: false,
    placeholder: 'e.g. energetic, calm, funny, cinematic',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'cues',
    label: 'SFX cues',
    type: 'list',
    description:
    'Free sound effect cue sheet 2026: One cue per beat: time, sound type, search terms, and mixing volume in dB. Fast, private now.',
  },
  {
    id: 'cueSheetText',
    label: 'Printable cue sheet (copy)',
    type: 'copy',
    description:
    'The full cue sheet as plain text — copy it into your notes or editor.',
  },
  {
    id: 'warnings',
    label: 'Mix warnings',
    type: 'list',
    description:
    'Timing warnings (beats too close together) and unmatched beats.',
  },
];

export const content: ToolContent = {
  title: 'Sound Effect Cue Sheet',
  description:
    'Build a sound effect cue sheet for your video: enter timeline beats to get matched SFX, search terms, volumes, and timing warnings. Plan your mix now.',
  howTo: [
    'List your timeline beats as JSON: each beat needs timeMs (milliseconds) and action (what happens).',
    'Add a mood word like energetic, calm, funny, or cinematic (optional) to tune the picks.',
    'Run the tool to get one SFX cue per beat with search terms and a mixing volume.',
    'Read the mix warnings — beats closer than 300ms apart will sound muddy.',
    'Use the search terms to find each sound in a free SFX library (Pixabay, Mixkit, YouTube Audio Library) and place them at the timecodes.',
  ],
  methodology:
    'Each beat action is keyword-matched against a fixed bank of 24 sound types, and each gets a rule-based mixing volume (-30 to 0 dB, impacts loud, ambience quiet). The mood word shifts volumes and prefers matching sound families via plain string matching. Beats closer than 300ms are flagged as "mud" risk. The tool makes no audio — it produces a plan plus search terms for finding real sounds in libraries. No AI is involved.',
  examples: [
    {
      title: 'Product reveal beats',
      inputs: {
        timelineBeats: '[{"timeMs":2000,"action":"door slams shut"},{"timeMs":8000,"action":"phone rings"},{"timeMs":15000,"action":"crowd cheers"}]',
        mood: 'energetic',
      },
      note: 'Door, Phone Ring, and Crowd Cheer cues with volumes.',
    },
    {
      title: 'Calm intro beats',
      inputs: { timelineBeats: '[{"timeMs":1000,"action":"soft footsteps"},{"timeMs":6000,"action":"room tone"}]', mood: 'calm' },
      note: 'Volumes drop 6 dB and ambient types are preferred.',
    },
  ],
  faqs: [
    {
      question: 'What is the best sound effect cue sheet?',
      answer:
        'The best cue sheet lists every sound moment with an exact timecode, the sound type, and a mixing volume — plus warnings where sounds are too close together. This free tool generates exactly that from your timeline beats.',
    },
    {
      question: 'Is there a free sound effect cue sheet?',
      answer:
        'Yes — this sound effect cue sheet generator is completely free with no signup. Enter your timeline beats as JSON, pick a mood, and get a printable cue sheet with search terms and volumes instantly.',
    },
    {
      question: 'How to use sound effect cue?',
      answer:
        'Take each cue\'s timecode and search terms, find the sound in a free library like Pixabay, Mixkit, or the YouTube Audio Library, drop it on your timeline at the timecode, and set the suggested volume as your starting point.',
    },
    {
      question: 'What is a sound effect cue sheet?',
      answer:
        'A sound effect cue sheet is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the sound effect cue sheet?',
      answer:
        'No account needed. Open the sound effect cue sheet, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'Can I customize the generated sound effect cue sheet?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
    {
      question: 'How do I create sound effect cue sheet?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
  ],
  assumptions: [
    'The tool generates a plan and search terms only — it provides no audio files; you must source the actual sounds from an SFX library.',
    'Volumes are mixing-guidance estimates, not measured loudness; adjust by ear against your music and dialogue.',
    'Sound matching is fixed keyword matching on your action text, not audio analysis — concrete descriptions ("door slams") beat vague ones ("scene 3").',
  ],
  jsonLd: [],
};
