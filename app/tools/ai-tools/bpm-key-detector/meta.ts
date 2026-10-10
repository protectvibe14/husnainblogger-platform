import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getDisclosures, HEADLINE } from './logic.ts';

export const aiConfig: AiToolConfig = {
  lane: 'A',
  headline: HEADLINE,
  models: [],
  disclosures: getDisclosures(),
};

export const inputs: ToolInput[] = [
  {
    id: 'audio',
    label: 'Audio file',
    type: 'file',
    required: true,
    accept: 'audio/*',
    mediaKind: 'audio',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'bpm',
    label: 'Tempo (BPM)',
    type: 'text',
    description:
    'Free bpm detector online 2026: Estimated tempo in beats per minute (±3%). free.',
  },
  {
    id: 'key',
    label: 'Musical key',
    type: 'text',
    description:
    'Best-guess key from chroma analysis (e.g. C major).',
  },
  {
    id: 'honestyNote',
    label: 'About this result',
    type: 'text',
    description:
    'What this DSP analysis can and cannot do.',
  },
];

export const content: ToolContent = {
  title: 'BPM & Key Detector: Free Online',
  description:
    'This free online BPM and key detector finds any track tempo and musical key in your browser — on-device audio analysis, no uploads. Start now!',
  howTo: [
    'Upload an audio file (MP3, WAV, OGG — under 50 MB).',
    'The tool decodes it locally and analyzes up to 2 minutes.',
    'Read the BPM estimate (±3%) and the key best-guess.',
    'Best on music with a clear, steady beat; verify by ear for anything critical.',
  ],
  methodology:
    'No AI model — classic signal processing with the Web Audio API, all on your device. The track is downmixed to mono and resampled; an onset envelope is built from spectral flux between STFT frames; tempo comes from autocorrelation of that envelope (60–200 BPM search with parabolic peak refinement, labeled ±3%); key comes from averaging a 12-bin chromagram and correlating it against Krumhansl major/minor profiles across all tonics. Nothing is uploaded; the page is explicit that BPM is an estimate and key is a best guess.',
  examples: [
    {
      title: 'Dance track',
      inputs: { audio: '(an uploaded 128 BPM house track)' },
      note: 'Returns ~128 BPM with high confidence and the track’s key best-guess.',
    },
    {
      title: 'Lo-fi beat',
      inputs: { audio: '(an uploaded mellow instrumental)' },
      note: 'Returns the laid-back tempo estimate; swung or rubato timing may read less confidently.',
    },
  ],
  faqs: [
    {
      question: 'Does this use AI?',
      answer:
        'No — and the tool says so. Tempo and key are estimated with classic digital signal processing (onset autocorrelation and Krumhansl chroma correlation) running entirely in your browser.',
    },
    {
      question: 'How accurate is the BPM?',
      answer:
        'About ±3% on music with a clear, steady beat. Half-time feels, breakdowns, tempo changes and rubato timing can fool it — always verify by ear for DJ or production use.',
    },
    {
      question: 'How accurate is the key?',
      answer:
        'It is a best guess: the chromagram is correlated against standard major/minor profiles, so enharmonic equivalents (e.g. F# vs Gb) and modal ambiguity are normal. Use it as a starting point, not a verdict.',
    },
    {
      question: 'Is my audio uploaded?',
      answer:
        'No. The file is decoded with the Web Audio API on your device and never leaves your browser.',
    },
    {
      question: 'What is a bpm detector online?',
      answer:
        'A bpm detector online is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'No AI model — Web Audio DSP only; BPM labeled ±3% estimate, key labeled best guess.',
    'Analyzes up to 2 minutes of audio; longer files are truncated.',
    'Best on music with a clear, steady beat; complex or rubato material degrades results.',
  ],
  jsonLd: [],
};
