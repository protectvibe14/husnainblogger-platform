import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'samples',
    label: 'Voice samples',
    type: 'file',
    required: true,
    accept: 'audio/*',
    mediaKind: 'audio',
    maxFileMB: 50,
  },
  {
    id: 'voiceName',
    label: 'Voice name',
    type: 'text',
    required: true,
    placeholder: 'e.g. My Narration Voice',
  },
  {
    id: 'script',
    label: 'Text to speak',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. Welcome to my channel — today we are talking about…',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'voiceId',
    label: 'Cloned voice id',
    type: 'copy',
    description: 'Free ai voice cloning 2026: The ElevenLabs voice id created from your samples — reusable for future generations. Fast, private, no signup - try it now!',
  },
  {
    id: 'audio',
    label: 'Generated speech',
    type: 'download',
    description: 'MP3 audio of your cloned voice speaking your text, playable on the page with a download button.',
  },
];

export const content: ToolContent = {
  title: 'Ai Voice Cloning',
  description:
    'Clone your voice with your own ElevenLabs key — upload a minute of speech, create the voice, then type any text and download the audio. No signup.',
  howTo: [
    'Save your ElevenLabs API key in the key vault above (use Test key to verify it works).',
    'Upload one or more audio samples — a minute or more of clear speech works best.',
    'Name your voice and press Create voice. ElevenLabs builds the clone from your samples.',
    'Type the text you want spoken (up to 2,500 characters) and press Speak.',
    'Play the result and download the MP3. Clone only YOUR OWN voice or one you have permission to use.',
  ],
  methodology:
    'Your browser calls YOUR ElevenLabs key directly: POST /v1/voices/add (multipart: name + audio files) creates the voice and returns a voice_id; POST /v1/text-to-speech/{voice_id} with model elevenlabs_multilingual_v2 returns MP3 audio bytes, converted locally to a playable file. GET /v1/user powers the Test key button. HusnainBlogger has no backend — keys never leave your browser, and generation only works after you save a key.',
  examples: [
    {
      title: 'Narration voice',
      inputs: { voiceName: 'My Narration Voice', script: 'Welcome back to the channel — here is today\'s breakdown.' },
      note: 'Upload a clear recording of yourself reading, then generate consistent narration for every video.',
    },
    {
      title: 'Podcast intro',
      inputs: { voiceName: 'Podcast Host', script: 'You are listening to the Morning Brief — your five-minute news roundup.' },
      note: 'A reusable host voice that reads a fresh intro script every episode.',
    },
  ],
  faqs: [
    {
      question: 'Is my API key safe?',
      answer:
        'Yes. Your key is stored only in your browser\'s localStorage and is sent directly to ElevenLabs. HusnainBlogger is a static site with no backend — we cannot see, log, or store your key.',
    },
    {
      question: 'Is voice cloning free?',
      answer:
        'The tool itself is free, but cloning and speech bill YOUR ElevenLabs account in credits. Instant voice cloning usually requires a paid plan — the free tier (about 10,000 credits/month) may not include it. Use the Test key button to check your plan and balance.',
    },
    {
      question: 'Can I clone someone else\'s voice?',
      answer:
        'No — only clone your own voice or a voice you have explicit permission to clone. Cloning someone without consent can violate the law and ElevenLabs\' terms.',
    },
    {
      question: 'Why did the call fail with a network error?',
      answer:
        'ElevenLabs does not officially document browser support (CORS unverified), so some browsers may block the direct call. If that happens you will see a clear error — try a different browser, or run the same request from your own computer with the same key.',
    },
    {
      question: 'How good do the samples need to be?',
      answer:
        'A minute or more of clear, single-speaker speech with minimal background noise. Phone recordings work — just avoid music, echo, and other voices in the sample.',
    },
    {
      question: 'How does the ai voice cloning work?',
      answer:
        'Enter your details using the inputs above and the ai voice cloning calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai voice cloning free to use?',
      answer:
        'Yes - this ai voice cloning is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'No key = no generation. Every call needs your own ElevenLabs key saved first.',
    'Voice cloning availability depends on your ElevenLabs plan — the tool reports the provider\'s error if your plan excludes it.',
    'ElevenLabs browser calls are not officially documented; CORS blocking is a known possibility, not a bug in this tool.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Ai Voice Cloning 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/ai-voice-cloning-studio/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free Ai Voice Cloning 2026 – Free Tool - no signup required.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ai Voice Cloning 2026 – Free Tool | HusnainBlogger', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'AI Tools',
          item: 'https://husnainblogger.com/tools/ai-tools/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'AI Voice Cloning Studio',
          item: 'https://husnainblogger.com/tools/ai-tools/ai-voice-cloning-studio/',
        },
      ],
    },
  ],
};

export const aiConfig: AiToolConfig = {
  lane: 'D',
  headline: 'Clone your voice with YOUR ElevenLabs key — samples in, MP3 out.',
  providers: ['elevenlabs'],
  disclosures: [
    'Bring-your-own-key: cloning and speech bill YOUR ElevenLabs account. No key = no generation.',
    'Voice cloning usually requires a paid ElevenLabs plan — free tier may not include it.',
    'Browser calls are not officially documented by ElevenLabs (CORS unverified) — the tool degrades gracefully.',
    'Consent required: only clone YOUR OWN voice or one you have explicit permission to clone.',
  ],
  noKeyHeadline: 'Save your ElevenLabs key to unlock voice cloning',
  noKeyBody:
    'This tool is fully built — the only missing piece is your key. Get an ElevenLabs key (link above), paste it into the key vault, press Save (then Test key to verify), and the full flow works immediately: upload samples → Create voice → type text → Speak → download MP3.',
};
