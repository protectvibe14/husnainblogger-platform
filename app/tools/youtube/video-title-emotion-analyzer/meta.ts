import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'videoTitle',
    label: 'Video title',
    type: 'text',
    required: true,
    placeholder: 'e.g. 7 Secrets I Wish I Knew Before Starting YouTube',
    validation: { max: 200 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'emotionProfile', label: 'Emotion profile (hits per category)', type: 'list' },
  { id: 'dominantEmotion', label: 'Dominant emotion', type: 'text' },
  { id: 'suggestions', label: 'Word-bank suggestions', type: 'list' },
  { id: 'note', label: 'Honesty note', type: 'text' },
];

const DESCRIPTION =
  'Score your title\'s emotional pull with this free youtube title emotion analyzer — a fixed 103-word lexicon rates curiosity, urgency, and more. Analyze now.';

export const content: ToolContent = {
  title: 'Youtube Title Emotion Analyzer 2026 – Free | HusnainBlogger',
  description: DESCRIPTION,
  howTo: [
    'Paste your video title into the text box above.',
    'Run the analysis — the tool matches your title against a fixed 103-word emotion lexicon.',
    'Read the emotion profile: hit counts for curiosity, power, urgency, fear, joy, and trust.',
    'Note the dominant emotion (or "neutral" if no emotion words matched).',
    'For weak profiles, use the word-bank suggestions to strengthen the title, then re-run.',
  ],
  methodology:
    'The tool lowercases your title and matches it against a fixed English lexicon of 103 words across 6 categories (curiosity: 21, power: 17, urgency: 15, fear: 18, joy: 16, trust: 16) using case-insensitive word-boundary matching. Longer entries consume their text first so "beginner-friendly" is not double-counted. Each word counts once per category; the dominant emotion is the highest hit count, ties broken toward curiosity, and zero hits yields a "neutral" verdict with suggestions drawn from the word bank. This is word-list matching, not AI sentiment analysis: it measures word presence, not emotional impact, and it never predicts viewer feelings or clicks.',
  examples: [
    {
      title: 'Curiosity-heavy title',
      inputs: { videoTitle: 'The secret truth behind my success' },
      note: 'Dominant emotion: curiosity (3 hits), with joy noted at 1 hit.',
    },
    {
      title: 'Neutral title',
      inputs: { videoTitle: 'My weekly vlog number twelve' },
      note: 'No emotion words matched, so the verdict is neutral with word-bank suggestions.',
    },
    {
      title: 'Urgency title',
      inputs: { videoTitle: "Don't miss this last chance today" },
      note: 'Dominant emotion: urgency, including the multi-word entries "don\'t miss" and "last chance".',
    },
  ],
  faqs: [
    {
      question: 'What is the best youtube title emotion analyzer?',
      answer:
        'An honest one is explicit about its method: this free analyzer matches your title against a fixed list of 103 emotion words across 6 categories and reports hit counts. It measures word presence — it does not predict how viewers will feel.',
    },
    {
      question: 'Is there a free youtube title emotion analyzer?',
      answer:
        'Yes — this analyzer is completely free with no signup. Paste a title to get its emotion profile, dominant emotion, and word-bank suggestions for weak profiles.',
    },
    {
      question: 'How to analyze youtube title emotion?',
      answer:
        'Paste your title above and run the analysis. You get per-emotion hit counts for curiosity, power, urgency, fear, joy, and trust, plus a dominant emotion. Titles with no matches get a neutral verdict with concrete word suggestions.',
    },
    {
      question: 'How does a youtube title emotion analyzer work?',
      answer:
        'This one uses lexicon matching, not AI: it compares your title word-by-word against a published 103-word list (sizes: curiosity 21, power 17, urgency 15, fear 18, joy 16, trust 16) and counts matches per category. The method is fully transparent — the word list is fixed and documented.',
    },
    {
      question: 'How does the youtube title emotion analyzer work?',
      answer:
        'Enter your details using the inputs above and the youtube title emotion analyzer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube title emotion analyzer free to use?',
      answer:
        'Yes - this youtube title emotion analyzer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube title emotion analyzer?',
      answer:
        'A youtube title emotion analyzer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Lexicon is a fixed English list of 103 words — non-English titles will mostly score neutral.',
    'Word presence is not proof of emotional impact; the tool never claims to predict viewer feelings or click-through rate.',
    'Matching is word-boundary based, so partial matches (e.g. "celebration" for "celebrate") do not count.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Youtube Title Emotion Analyzer 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/youtube/video-title-emotion-analyzer/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: DESCRIPTION,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'YouTube Tools',
          item: 'https://husnainblogger.com/tools/youtube/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Video Title Emotion Analyzer',
          item: 'https://husnainblogger.com/tools/youtube/video-title-emotion-analyzer/',
        },
      ],
    },
  ],
};
