import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'lyrics',
    label: 'Your lyrics',
    type: 'textarea',
    required: true,
    placeholder: 'One line per lyric line…',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'lines',
    label: 'Per-line analysis',
    type: 'list',
    description:
    'Free lyrics rhyme checker 2026: Each line with its syllable estimate, rhyme key and scheme letter. Get instant results. free now.',
  },
  {
    id: 'scheme',
    label: 'Rhyme scheme',
    type: 'text',
    description:
    'Scheme labels like A A B B, assigned in order of first appearance.',
  },
];

export const content: ToolContent = {
  title: 'Lyrics Rhyme & Syllable Checker',
  description:
    'Check your lyrics’ flow: per-line syllable estimates, rhyme detection and an AABB-style rhyme scheme. Honest heuristics, explained — free.',
  howTo: [
    'Paste your lyrics with one line per lyric line.',
    'Click Analyze to get syllable estimates and rhyme labels for every line.',
    'Read the scheme (A A B B…) to see which lines the checker hears as rhyming.',
    'Use the syllable range to spot lines that break your meter.',
    'Remember the method notes: counts are estimates — always verify by ear.',
  ],
  methodology:
    'Pure heuristics, run entirely in your browser. Syllables are estimated by counting vowel groups per word (with a silent-e correction), labeled as an estimate because English spelling is irregular. Rhyme is an approximation: the tool takes each line’s last word, normalizes inflections (-s, -es, -ed, -ing), then extracts the final vowel group through the end of the word ("fire"/"desire" → "ire") — handling a silent final e. Lines sharing a rhyme key share a scheme letter, assigned A, B, C… in order of first appearance. No AI model, no pronunciation dictionary.',
  examples: [
    {
      title: 'Rhyming quatrain',
      inputs: {
        lyrics: 'I walk alone in the fire\nnothing left but burning desire\nthe night is cold and dark\nI leave my lonely mark',
      },
      note: 'Detects the A A B B scheme (fire/desire, dark/mark) with per-line syllable counts.',
    },
    {
      title: 'Meter check',
      inputs: { lyrics: 'Twinkle twinkle little star\nHow I wonder what you are' },
      note: 'Shows matching syllable counts (6 and 6) — a sign the meter is consistent.',
    },
  ],
  faqs: [
    {
      question: 'How accurate are the syllable counts?',
      answer:
        'They are estimates from a vowel-group heuristic, and the tool labels them as such. They are right for most common words but English spelling is irregular ("choir", "business", "every" can all misfire). For final scansion, count tricky lines by ear.',
    },
    {
      question: 'What counts as a rhyme here?',
      answer:
        'Two lines "rhyme" when the final vowel group through the end of their last words matches — e.g. fire/desire. It is an approximation: true near-rhymes and multi-syllable rhymes are not reliably detected, and identical endings that sound different may over-match.',
    },
    {
      question: 'What do the scheme letters mean?',
      answer:
        'A A B B means lines 1–2 rhyme with each other and lines 3–4 rhyme with each other. Letters are assigned in order of first appearance, so the first unique rhyme is always A.',
    },
    {
      question: 'Can it check rap verses or poems?',
      answer:
        'Yes — any line-based text works the same way. For dense internal rhymes or multis, though, the end-of-line approximation will miss a lot; it is tuned for end rhymes.',
    },
    {
      question: 'How does the lyrics rhyme checker work?',
      answer:
        'Enter your details using the inputs above and the lyrics rhyme checker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the lyrics rhyme checker free to use?',
      answer:
        'Yes - this lyrics rhyme checker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a lyrics rhyme checker?',
      answer:
        'A lyrics rhyme checker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Syllable counts are heuristic estimates, not dictionary scansion — verify by ear.',
    'Rhyme detection is an end-of-line approximation; near-rhymes and internal rhymes are not reliably caught.',
    'English-only: the vowel-group rules do not apply to other languages.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Lyrics Rhyme & Syllable Checker 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/lyrics-rhyme-syllable-checker/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free lyrics rhyme checker 2026: Each line with its syllable estimate, rhyme key and scheme letter. Get instant results. free now.',
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
          name: 'AI Tools',
          item: 'https://husnainblogger.com/tools/ai-tools/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Lyrics Rhyme & Syllable Checker',
          item: 'https://husnainblogger.com/tools/ai-tools/lyrics-rhyme-syllable-checker/',
        },
      ],
    },
  ],
};
