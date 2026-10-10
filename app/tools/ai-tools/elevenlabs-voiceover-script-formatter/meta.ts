import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'rawScript',
    label: 'Raw script text',
    type: 'textarea',
    required: true,
    placeholder: 'Paste your voiceover script here\u2026',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'formattedScript',
    label: 'Formatted script',
    type: 'copy',
    description:
    'Free elevenlabs script formatter 2026: Your script with suggested break tags for ElevenLabs. free.',
  },
  {
    id: 'flags',
    label: 'Words to review',
    type: 'list',
    description:
    'ALL-CAPS words and abbreviations to check before generating audio.',
  },
  {
    id: 'pronunciationHints',
    label: 'Pronunciation hints',
    type: 'list',
    description:
    'Suggested spoken forms for common abbreviations.',
  },
  {
    id: 'estimatedDuration',
    label: 'Estimated duration',
    type: 'text',
    description:
    'Rough duration estimate at ~850 characters per minute.',
  },
];

export const content: ToolContent = {
  title: 'ElevenLabs Script Formatter',
  description:
    'Format your script for ElevenLabs free — get suggested break tags and voiceover-ready formatting instantly. Format yours now!',
  howTo: [
    'Paste your raw voiceover script into the text field.',
    'Click Format script to add suggested pause tags and scan the text.',
    'Copy the formatted script into ElevenLabs.',
    'Review the flagged ALL-CAPS words and abbreviations before generating audio.',
    'Apply the pronunciation hints (e.g. "CEO" spoken as "C. E. O.") where they sound right.',
  ],
  methodology:
    'This tool applies fixed text rules, all in your browser: sentences of 180+ characters get a suggested <break time="0.5s"/> tag, paragraph boundaries get a <break time="1.0s"/> tag, ALL-CAPS words (2+ letters) are flagged for review, and a fixed 15-entry abbreviation map suggests spoken forms like "C. E. O.". Duration is estimated at ~850 characters per minute and is labeled an estimate. It does not synthesize speech, does not call ElevenLabs, and no AI model is involved.',
  examples: [
    {
      title: 'YouTube narration',
      inputs: { rawScript: 'Welcome back to the channel. Today our CEO breaks down the new API pricing.' },
      note: 'Adds pause suggestions and flags CEO and API with "C. E. O." / "A. P. I." hints.',
    },
    {
      title: 'Podcast intro',
      inputs: { rawScript: 'In this episode we cover SEO basics for beginners.\n\nLet\u2019s dive in.' },
      note: 'Adds a paragraph pause between the intro and the dive-in line, plus an SEO pronunciation hint.',
    },
  ],
  faqs: [
    {
      question: 'Does this tool generate voiceover audio?',
      answer:
        'No. It prepares and annotates your script text — break tags, flags and hints — which you then paste into ElevenLabs to generate the audio. Nothing here synthesizes speech.',
    },
    {
      question: 'Are the break tags required by ElevenLabs?',
      answer:
        'No — they are suggestions based on fixed rules (long sentences, paragraph ends). You can keep, move or delete them; ElevenLabs accepts its standard break-tag syntax.',
    },
    {
      question: 'How accurate is the duration estimate?',
      answer:
        'It is a rough estimate: characters divided by ~850 per minute. Real pacing depends on the voice, speed settings and pauses, so treat it as a ballpark, not a guarantee.',
    },
    {
      question: 'Why flag ALL-CAPS words?',
      answer:
        'Text-to-speech engines often misread ALL-CAPS — "CEO" may be read as "see-oh" instead of spelled out. Flagging them lets you decide the spoken form before you generate audio.',
    },
    {
      question: 'Is the formatter free?',
      answer:
        'Yes — completely free, no signup. It runs in your browser using fixed rules.',
    },
      {
      question: 'How do I use this elevenlabs script formatter tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
    {
      question: 'Is this elevenlabs script formatter tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
  ],
  assumptions: [
    'Break tags and duration are estimates from fixed rules — actual TTS pacing depends on the voice and settings you choose.',
    'The abbreviation hint map covers 15 common terms; anything else is flagged for your manual review.',
  ],
  jsonLd: [],
};
