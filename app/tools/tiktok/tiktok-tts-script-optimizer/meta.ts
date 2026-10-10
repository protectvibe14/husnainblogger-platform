import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-tts-script-optimizer/';

export const inputs: ToolInput[] = [
  {
    id: 'scriptText',
    label: 'Your script text',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. This DIY hack costs $50 and saves 25% of your time. DM me ASAP for the 1st drop in 2026...',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'optimizedScript',
    label: 'TTS-optimized script',
    type: 'copy',
    description:
    'Free tiktok text to speech tips 2026: Your script with abbreviations expanded, numbers spelled out, and long sentences split. Fast, private.',
  },
  {
    id: 'readabilityScore',
    label: 'TTS readability score',
    type: 'number',
    description:
    '0–100 estimated score of how smoothly a text-to-speech voice can read the script (heuristic guidance, not a measurement).',
  },
  {
    id: 'changes',
    label: 'What changed',
    type: 'list',
    description:
    'Every rewrite the optimizer applied, with the original and replacement shown.',
  },
  {
    id: 'warnings',
    label: 'Things to check',
    type: 'list',
    description:
    "Punctuation or acronym issues to review in TikTok's voice preview — brand names are flagged, never auto-pronounced.",
  },
];

export const content: ToolContent = {
  title: 'TikTok TTS Script Optimizer',
  description:
    'Optimize a tiktok tts script optimizer draft for natural voiceover: abbreviations expanded, numbers spelled, sentences split. Paste it free —.',
  howTo: [
    'Paste your raw script into the "Your script text" box — any length, any topic.',
    'Run the tool: abbreviations (DIY, ASAP, etc.) expand to full words and numbers like $50 or 25% are spelled out.',
    'Copy the "TTS-optimized script" and paste it into TikTok\'s text-to-speech box.',
    'Review the "Things to check" list for unknown acronyms or brand names — always confirm those in the voice preview.',
    'Check your 0–100 TTS readability score; 85+ means your script should read smoothly.',
  ],
  methodology:
    'The optimizer applies fixed text rules — no AI, no audio. A fixed 47-entry abbreviation map expands short forms to spoken words, and fixed English rules spell out integers, ordinals, decimals, percents, currency, and years (1000–2099). Sentences over 25 words are split at commas or conjunctions for natural pauses. The 0–100 score is an estimated heuristic (long sentences −2, abbreviations −1, numbers −1, punctuation issues −3); it is guidance, not a measurement of any TTS voice.',
  examples: [
    {
      title: 'Product pitch with numbers',
      inputs: {
        scriptText: 'This DIY hack costs $50 and saves 25% of your time. DM me ASAP for the 1st drop in 2026...',
      },
      note: 'Expands DIY/DM/ASAP, spells out $50, 25%, 1st, and 2026, and replaces the ellipsis — with a score and change list.',
    },
    {
      title: 'Clean script check',
      inputs: {
        scriptText: 'Short and sweet. Easy to say out loud.',
      },
      note: 'Needs no changes — the tool says so and scores it high.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok tts script optimizer?',
      answer:
        'The best tiktok tts script optimizer rewrites your script the way a voice actually reads it: expanding abbreviations like DIY, spelling out numbers like $50 or 2026, and splitting long sentences at natural pauses. This free tool does all three with fixed, transparent rules and scores the result out of 100.',
    },
    {
      question: 'Is there a free tiktok tts script optimizer?',
      answer:
        'Yes — this TikTok TTS script optimizer is completely free with no signup. Paste any script, copy the TTS-ready rewrite, and run it as many times as you like.',
    },
    {
      question: 'How to optimize tiktok tts?',
      answer:
        'Write your script, then expand every abbreviation and spell out every number the way it sounds — TTS voices read "$50" better as "fifty dollars." Split sentences over 25 words, remove ellipses and repeated punctuation, and always preview unknown brand names in TikTok\'s voice picker. This tool applies all of those rules automatically.',
    },
    {
      question: 'How does a tiktok tts script optimizer work?',
      answer:
        'It applies fixed text-rewrite rules, not AI: a 47-entry abbreviation map expands short forms, fixed English rules spell out integers, ordinals, decimals, percents, currency, and years, and sentences longer than 25 words are split at commas or conjunctions. Unknown acronyms are flagged for you to check in the voice preview instead of being auto-pronounced.',
    },
    {
      question: 'What is a tiktok text to speech tips?',
      answer:
        'A tiktok text to speech tips is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Is this tiktok tts script optimizer tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
    {
      question: 'How do I use this tiktok tts script optimizer tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
  ],
  assumptions: [
    'This tool rewrites text only — it does not perform text-to-speech or generate audio.',
    'Unknown acronyms and brand names are flagged, never given invented phonetic spellings.',
    'The 0–100 score uses estimated weights as guidance; it is not a measurement of any TikTok voice.',
  ],
  jsonLd: [],
};
