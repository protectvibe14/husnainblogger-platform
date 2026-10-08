import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-caption-readability-checker/';

export const inputs: ToolInput[] = [
  {
    id: 'captionText',
    label: 'Your TikTok caption',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. Day one of learning to bake bread. It finally worked! #baking #day1',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'fleschScore',
    label: 'Flesch Reading Ease score',
    type: 'number',
    description: 'Free tiktok captions too fast 2026: 0–100 readability score from the public Flesch Reading Ease formula (higher = easier to. Fast, private, no signup - try it!',
  },
  {
    id: 'gradeLevel',
    label: 'Grade level',
    type: 'text',
    description: 'Flesch–Kincaid US school grade level for the caption, estimated from the same public formula.',
  },
  {
    id: 'longSentences',
    label: 'Flagged long sentences',
    type: 'list',
    description: 'Sentences over 20 words that are hard to read on a small screen.',
  },
  {
    id: 'suggestions',
    label: 'Rewrite suggestions',
    type: 'list',
    description: 'Concrete, rule-based fixes: split long sentences, simplify complex words, trim hashtags and all-caps.',
  },
  {
    id: 'notes',
    label: 'Notes',
    type: 'list',
    description: 'Honesty labels: English-model-only notice for non-English captions, and a warning if the caption exceeds TikTok\'s 2,200-character limit.',
  },
];

export const content: ToolContent = {
  title: 'Tiktok Captions Too Fast 2026 – Free Tool | HusnainBlogger',
  description:
    'Fix tiktok captions too fast with free Flesch scoring: Reading Ease score, grade level, flagged long sentences, rewrite tips. Paste a caption — try it now!',
  howTo: [
    'Paste your full TikTok caption into the "Your TikTok caption" box, hashtags included.',
    'Run the tool to get your Flesch Reading Ease score (0–100) and estimated US grade level.',
    'Read the "Flagged long sentences" list — anything over 20 words is hard to scan on mobile.',
    'Apply the "Rewrite suggestions": split long sentences, swap complex words, and keep 3–5 hashtags.',
    'Check "Notes" — captions over 2,200 characters get a limit warning, and non-English captions are labeled English-model only.',
  ],
  methodology:
    'Scores come from the public Flesch Reading Ease formula (206.835 − 1.015 × words/sentences − 84.6 × syllables/words) and the Flesch–Kincaid grade formula — both long-established standards, not TikTok data. Syllables are counted with a fixed English vowel-group heuristic, so scores are estimates and guidance, not predictions of views or engagement. Suggestions follow fixed rules (20-word sentence limit, complex-word naming, hashtag and all-caps flags). No AI is used.',
  examples: [
    {
      title: 'Simple baking caption',
      inputs: {
        captionText: 'Day one of learning to bake bread. It finally worked! #baking #day1',
      },
      note: 'Scores high on Reading Ease with no flagged sentences.',
    },
    {
      title: 'Dense corporate caption',
      inputs: {
        captionText: 'The unprecedented institutionalization of bureaucratization fundamentally characterizes contemporary administrative paradigms.',
      },
      note: 'Scores low, flags complex words by name, and suggests simpler alternatives.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok captions too fast?',
      answer:
        'The best tiktok captions too fast fix is shorter, simpler copy: captions that score high on Flesch Reading Ease — short sentences, plain words, and only a few hashtags — are scannable in the 1–2 seconds a viewer glances at them. This free checker scores any caption and flags the exact sentences to split.',
    },
    {
      question: 'Is there a free tiktok captions too fast?',
      answer:
        'Yes — this TikTok caption readability checker is completely free with no signup. Paste any caption and get a Flesch Reading Ease score, grade level, flagged long sentences, and rewrite suggestions, as many times as you like.',
    },
    {
      question: 'How to use tiktok captions too fast?',
      answer:
        'Paste your caption into the box and run the tool. If the Reading Ease score is low, split every flagged long sentence into two, replace the named complex words with simpler ones, and keep hashtags to 3–5. Re-run to confirm the score improved, then post.',
    },
    {
      question: 'How does the tiktok captions too fast work?',
      answer:
        'Enter your details using the inputs above and the tiktok captions too fast calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok captions too fast free to use?',
      answer:
        'Yes - this tiktok captions too fast is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok captions too fast?',
      answer:
        'A tiktok captions too fast is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the tiktok captions too fast?',
      answer:
        'No account needed. Open the tiktok captions too fast, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Flesch Reading Ease is a general English readability formula — it measures text complexity, not viewer behavior or views.',
    'Syllable counts come from a fixed heuristic, so scores are estimates; non-English captions are labeled English-model only.',
    'TikTok\'s 2,200-character caption limit is enforced as a warning, not a hard error, so you can still score drafts.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Tiktok Captions Too Fast 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free tiktok captions too fast 2026: 0–100 readability score from the public Flesch Reading Ease formula (higher = easier to. Fast, private, no signup - try it!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'TikTok Tools',
          item: 'https://husnainblogger.com/tools/tiktok/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'TikTok Caption Readability Checker',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
