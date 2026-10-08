import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'text',
    label: 'Text to analyze',
    type: 'textarea',
    required: true,
    placeholder: 'Paste an article, caption or product description…',
  },
  {
    id: 'topN',
    label: 'How many keywords (5–50)',
    type: 'number',
    required: false,
    placeholder: '15',
  },
  {
    id: 'includeHashtags',
    label: 'Include hashtag variants',
    type: 'boolean',
    required: false,
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'keywords',
    label: 'Top keywords',
    type: 'list',
    description: 'Free keyword extractor 2026: Keywords and key phrases ranked by in-document frequency. Instant, private, and mobile-friendly. No signup - try it free!',
  },
  {
    id: 'hashtags',
    label: 'Hashtag variants',
    type: 'copy',
    description: 'CamelCase hashtag versions of the top keywords, ready to paste.',
  },
];

export const content: ToolContent = {
  title: 'Keyword & Tag Extractor 2026 – Free Tool | HusnainBlogger',
  description:
    'Extract keywords and hashtags from any text: frequency-based ranking with stopword removal and key-phrase detection. Free, runs in your browser.',
  howTo: [
    'Paste the text you want to analyze — an article, caption or description.',
    'Choose how many keywords to extract (5–50, default 15).',
    'Click Extract to see ranked keywords, key phrases and hashtag variants.',
    'Copy the hashtags for social posts, or use the keyword list to check topical focus.',
    'Remember: scores measure in-text prominence, not search demand.',
  ],
  methodology:
    'Pure frequency algorithm, run entirely in your browser. Text is lowercased and tokenized; a fixed 150-word English stopword list and tokens under 3 characters are removed; remaining words are scored by occurrence count. Adjacent word pairs (bigrams) appearing at least twice get a fixed 1.5x phrase bonus; ties break alphabetically for determinism. Hashtags are CamelCase joins of the keywords. Because there is no background corpus there is no true IDF — the method is labeled frequency-based, and scores measure in-document prominence, not search volume or SEO value.',
  examples: [
    {
      title: 'Blog paragraph',
      inputs: {
        text: 'Email marketing is powerful. Email marketing drives sales. Good email marketing needs great subject lines.',
        topN: 10,
        includeHashtags: true,
      },
      note: 'Ranks "email marketing" (phrase, 1.5x bonus) above "email", and produces #EmailMarketing.',
    },
    {
      title: 'Caption tags',
      inputs: {
        text: 'Morning coffee ritual: slow brews, fresh beans, and quiet cafes. Coffee culture at its best.',
        topN: 8,
        includeHashtags: true,
      },
      note: 'Surfaces "coffee" as the top keyword with #Coffee-style hashtag variants for the caption.',
    },
  ],
  faqs: [
    {
      question: 'Is this real TF-IDF?',
      answer:
        'Not exactly — and the tool says so. True TF-IDF needs a background corpus for the IDF part; with a single document there is no corpus, so this tool ranks by in-document frequency with a phrase bonus. It is labeled frequency-based, not TF-IDF.',
    },
    {
      question: 'Do the scores show search demand?',
      answer:
        'No. Scores measure how prominent a word is inside your text, not how many people search for it. For search demand you need a keyword research tool with real volume data.',
    },
    {
      question: 'Why are some obvious words missing?',
      answer:
        'Common English stopwords (the, and, with…) and words under 3 characters are removed by design — they add noise, not signal. Very rare words also rank low because the method is frequency-based.',
    },
    {
      question: 'How are the hashtags formed?',
      answer:
        'Each keyword is joined into CamelCase with a # prefix — "email marketing" becomes #EmailMarketing. Non-alphanumeric characters are stripped.',
    },
    {
      question: 'How does the keyword extractor work?',
      answer:
        'Enter your details using the inputs above and the keyword extractor calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the keyword extractor free to use?',
      answer:
        'Yes - this keyword extractor is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a keyword extractor?',
      answer:
        'A keyword extractor is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Frequency-based ranking on your text alone — scores are in-document prominence, not search demand or SEO value.',
    'Fixed English stopword list; other languages will extract poorly.',
    'Bigrams need at least 2 occurrences to qualify for the 1.5x phrase bonus.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Keyword & Tag Extractor 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/keyword-tag-extractor/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free keyword extractor 2026: Keywords and key phrases ranked by in-document frequency. Instant, private, and mobile-friendly. No signup - try it free!',
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
          name: 'Keyword & Tag Extractor',
          item: 'https://husnainblogger.com/tools/ai-tools/keyword-tag-extractor/',
        },
      ],
    },
  ],
};
