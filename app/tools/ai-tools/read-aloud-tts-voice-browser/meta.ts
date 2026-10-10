/**
 * meta.ts — Read-Aloud TTS (tool-512), Lane A.
 *
 * SEO + content contract for the AiToolTemplate. Never imports client.ts.
 * Note: this tool uses the browser's built-in speech engine — no AI model.
 */
import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'text',
    label: 'Text to read aloud',
    type: 'textarea',
    required: true,
    placeholder: 'Paste the text you want to hear — up to 5,000 characters…',
  },
  {
    id: 'voice',
    label: 'Voice',
    type: 'select',
    required: false,
    options: [],
    placeholder: 'Voices load from your device — pick one after the list appears',
  },
  {
    id: 'rate',
    label: 'Rate',
    type: 'number',
    required: false,
    placeholder: '0.5 (slow) to 2 (fast) — default 1',
  },
  {
    id: 'pitch',
    label: 'Pitch',
    type: 'number',
    required: false,
    placeholder: '0 (low) to 2 (high) — default 1',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'speech',
    label: 'Spoken audio',
    type: 'text',
    description:
    'Free read aloud text to speech 2026: Your text read aloud through your device\\u2019s speakers (playback only — no file export). Fast, private - try.',
  },
];

export const content: ToolContent = {
  title: 'Free Text-to-Speech Reader',
  description:
    'Read text aloud free in your browser — pick a device voice, adjust rate and pitch Uses your browser\u2019s built-in speech engine, nothing to download.',
  howTo: [
    'Paste up to 5,000 characters of text into the box.',
    'Pick a voice from the list (loaded from your device), or leave the default.',
    'Adjust rate (0.5–2) and pitch (0–2) with the sliders.',
    'Click Speak — your device reads the text aloud through its speakers.',
    'Click Stop any time to end playback.',
  ],
  methodology:
    'This tool uses the Web Speech API (window.speechSynthesis) built into your browser — there is no AI model and nothing to download. Your text is passed to the device\u2019s local speech engine, which renders it with the voices installed on your operating system. Everything happens locally: no audio is generated on a server and no text is uploaded.',
  examples: [
    {
      title: 'Proofread an article',
      inputs: { rate: 1, pitch: 1 },
      note: 'Paste your draft and listen — hearing it catches typos your eyes miss.',
    },
    {
      title: 'Slow down for study',
      inputs: { rate: 0.7, pitch: 1 },
      note: 'Paste study notes at rate 0.7 to absorb them at a comfortable pace.',
    },
  ],
  faqs: [
    {
      question: 'Is this text-to-speech really free?',
      answer:
        'Yes — it uses the speech engine already built into your browser and operating system, so there is nothing to pay for and no account needed.',
    },
    {
      question: 'Why does the voice list look different on my phone and laptop?',
      answer:
        'Voices are installed by your operating system, not by this site — Windows, macOS, Android and iOS each ship different voices, so the list varies by device and browser.',
    },
    {
      question: 'Does it work offline?',
      answer:
        'Once this page has loaded, yes — speech is generated on your device with no internet needed (some browsers may fetch a voice on first use).',
    },
    {
      question: 'Can I download the audio as an MP3?',
      answer:
        'No — the browser\u2019s speech API plays audio directly and does not expose a recording. If you need downloadable AI voiceover, try the Neural TTS Studio tool instead, which exports WAV.',
    },
    {
      question: 'Why does long text stop halfway?',
      answer:
        'Some browsers cap a single utterance\u2019s length. Split long text into a few paragraphs and read them one at a time.',
    },
    {
      question: 'How does the read aloud text to speech work?',
      answer:
        'Enter your details using the inputs above and the read aloud text to speech calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the read aloud text to speech free to use?',
      answer:
        'Yes - this read aloud text to speech is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'Voice quality and availability depend entirely on the visitor\u2019s device and browser.',
    'Playback only — no audio file export (browser API limitation).',
    'Very long single utterances may be cut off by some browsers.',
  ],
  jsonLd: [
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Free Text-to-Speech Reader',
          item: 'https://husnainblogger.com/tools/ai-tools/read-aloud-tts-voice-browser/',
        },
      ],
    },
  ],
};

export const aiConfig: AiToolConfig = {
  lane: 'A',
  headline: 'Hear any text read aloud — free, instant, using the voices already on your device.',
  models: [
    {
      id: 'browser-native:speechSynthesis',
      task: 'text-to-speech',
      sizeMb: 0,
      license: 'Device voices (provided by the visitor\u2019s OS/browser)',
      notes: 'No model — the browser\u2019s built-in speech engine; nothing to download.',
    },
  ],
  disclosures: [
    'Voices come from your device and browser — the list varies by operating system and browser, and quality differs.',
    'No model downloads and no internet is needed once the page loads; nothing is uploaded.',
    'Some browsers limit long utterances; very long text may pause or stop — split it into parts.',
  ],
};
