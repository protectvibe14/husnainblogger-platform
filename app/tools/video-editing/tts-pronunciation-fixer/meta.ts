import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'problemWord',
    label: 'Word your TTS voice says wrong',
    type: 'text',
    required: true,
    placeholder: 'e.g. quinoa',
  },
  {
    id: 'targetTtsEngine',
    label: 'TTS engine',
    type: 'select',
    required: true,
    options: ['elevenlabs', 'capcut', 'tiktok', 'generic'],
  },
  {
    id: 'contextSentence',
    label: 'Sentence it appears in (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'e.g. I cooked quinoa for dinner tonight.',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'phoneticSpellings', label: 'Phonetic spellings to test', type: 'list' },
  { id: 'ipaHint', label: 'Simplified stress hint', type: 'text' },
  { id: 'testSentence', label: 'Test sentence', type: 'text' },
  { id: 'engineNotes', label: 'Engine-specific notes', type: 'text' },
];

export const content: ToolContent = {
  title: 'AI Voice Pronunciation Fixer',
  description:
    'Free ai voice pronunciation fixer 2026: Fix AI voice pronunciation fast: enter the misread word, pick your TTS engine, get. Fast, private, no signup - try it!',
  howTo: [
    'Enter the single word (or short phrase, up to 4 words) your AI voice mispronounces.',
    'Pick your TTS engine: elevenlabs, capcut, tiktok, or generic.',
    'Optionally paste the sentence the word appears in to get a ready-made test sentence.',
    'Run the fixer to get phonetic respellings, a simplified stress hint, and engine-specific notes.',
    'Preview each spelling with a short TTS test before rendering the full video — the tool suggests, your ears decide.',
  ],
  methodology:
    'Pure string heuristics, never AI and never verified audio: a fixed bank of 24 commonly misread words (e.g. quinoa -> KEEN-wah) is checked first; other words go through a deterministic syllable-splitting heuristic (V-CV / VC-CV boundaries, 12 consonant digraphs kept together) with first- and last-syllable stress variants, since stress placement is unknowable without listening. Already-phonetic input is returned unchanged, non-Latin scripts are marked unsupported with an explanation, and each of the 4 engines gets fixed guidance notes. Nothing here can hear your TTS output — every suggestion must be tested with a short preview.',
  examples: [
    {
      title: 'Quinoa on ElevenLabs',
      inputs: { problemWord: 'quinoa', targetTtsEngine: 'elevenlabs', contextSentence: 'I cooked quinoa for dinner.' },
      note: 'Returns KEEN-wah plus a spaced variant, a stress hint, and a test sentence with the word replaced.',
    },
    {
      title: 'Made-up brand name on TikTok',
      inputs: { problemWord: 'Zyxel', targetTtsEngine: 'tiktok', contextSentence: '' },
      note: 'Falls back to syllable-split variants with a proper-noun note and TikTok-specific guidance.',
    },
  ],
  faqs: [
    {
      question: 'What is the best ai voice pronunciation fixer?',
      answer:
        'The best fixer gives you spellings to test, not promises. This free tool checks a fixed bank of 24 commonly misread words, otherwise splits your word into syllables with stress variants, and adds engine-specific notes (ElevenLabs even supports a custom pronunciation dictionary). You preview each spelling and keep the one your engine reads correctly.',
    },
    {
      question: 'Is there a free ai voice pronunciation fixer?',
      answer:
        'Yes — this pronunciation fixer is completely free with no signup. Enter the misread word, pick elevenlabs, capcut, tiktok, or generic, and get phonetic respellings, a simplified stress hint, and a test sentence instantly.',
    },
    {
      question: 'How to use ai voice pronunciation fixer?',
      answer:
        'Enter the single word your TTS voice says wrong, choose your engine, and optionally add the sentence it appears in. The tool returns phonetic respellings ranked best-first — paste the top spelling into your script, run a short TTS preview, and keep the variant your engine reads correctly.',
    },
    {
      question: 'How does an ai voice pronunciation fixer work?',
      answer:
        'It uses fixed string rules, not AI: known tricky words map to proven respellings from a 24-word bank, and unknown words are split into syllables by a deterministic heuristic with stress variants. A simplified stress hint (CAPS = stressed syllable, not true IPA) guides you. It cannot hear or verify your TTS output — every suggestion must be tested with a short preview.',
    },
    {
      question: 'How does the ai voice pronunciation fixer work?',
      answer:
        'Enter your details using the inputs above and the ai voice pronunciation fixer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai voice pronunciation fixer free to use?',
      answer:
        'Yes - this ai voice pronunciation fixer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an ai voice pronunciation fixer?',
      answer:
        'An ai voice pronunciation fixer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Suggestions are heuristics to test — the tool cannot hear or verify actual TTS output, and no spelling is guaranteed.',
    'Stress placement on generated variants is a guess; first- and last-syllable stress variants are both offered.',
    'The 24-word bank covers common English misreads only; proper nouns fall back to syllable splitting.',
    'Non-Latin scripts are marked unsupported — the tool does not romanize other scripts.',
    'Engine notes are fixed guidance, not live documentation — engine features may change.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'AI Voice Pronunciation Fixer 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/video-editing/tts-pronunciation-fixer/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free ai voice pronunciation fixer 2026: Fix AI voice pronunciation fast: enter the misread word, pick your TTS engine, get. Fast, private, no signup - try it!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'CapCut & Video Editing',
          item: 'https://husnainblogger.com/tools/video-editing/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'TTS Pronunciation Fixer',
          item: 'https://husnainblogger.com/tools/video-editing/tts-pronunciation-fixer/',
        },
      ],
    },
  ],
};
