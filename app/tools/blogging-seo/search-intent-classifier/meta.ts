import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'keyword',
    label: 'Keyword',
    type: 'text',
    required: true,
    placeholder: 'e.g. best laptop for students',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'intent',
    label: 'Predicted intent',
    type: 'text',
    description:
    'Free search intent checker 2026: informational, navigational, commercial, transactional or unknown. Get instant results. free now.',
  },
  {
    id: 'confidence',
    label: 'Confidence (0-1)',
    type: 'number',
    description:
    'Share of matched signal weight captured by the winning intent.',
  },
  {
    id: 'matchedSignals',
    label: 'Matched signals',
    type: 'list',
    description:
    'Cue words found, shown as "intent:cue".',
  },
  {
    id: 'isHeuristic',
    label: 'Method',
    type: 'text',
    description:
    'Always heuristic — word-bank rules, not AI or live SERP data.',
  },
];

export const content: ToolContent = {
  title: 'Search Intent Checker',
  description:
    'Check search intent in seconds: informational, commercial, transactional or navigational. Free search intent checker — classify your keyword now.',
  howTo: [
    'Type the keyword you want to check into the Keyword field (up to 150 characters).',
    'Click Classify to run the heuristic word-bank rules.',
    'Read the predicted intent and confidence score.',
    'Expand the matched signals list to see which cue words triggered the result.',
    'Confirm against the actual Google results before planning content around it.',
  ],
  methodology:
    'The classifier lowercases your keyword and matches it against four hand-built English cue-word banks: transactional ("buy", "price", "discount"...), commercial ("best", "review", "vs"...), navigational ("login", "official", "near me"...) and informational ("how", "what", "guide"...). The bucket with the most matches wins; ties resolve toward stronger purchase intent (transactional > commercial > navigational > informational). Confidence is the winning bucket\'s share of total matches (0-1). Keywords with no Latin-script content return "unknown". No AI model and no live search data are used.',
  examples: [
    {
      title: 'Buying keyword',
      inputs: { keyword: 'buy running shoes online' },
      note: 'Classifies as transactional — matches cues like "buy".',
    },
    {
      title: 'Comparison keyword',
      inputs: { keyword: 'best laptop for students review' },
      note: 'Classifies as commercial — matches cues like "best" and "review".',
    },
    {
      title: 'Learning keyword',
      inputs: { keyword: 'how to bake sourdough bread' },
      note: 'Classifies as informational — matches the cue "how".',
    },
  ],
  faqs: [
    {
      question: 'What is the best search intent checker?',
      answer:
        'No independent test crowns one checker "the best" — accuracy claims without published methodology should be treated with skepticism. This free checker publishes its full word-bank rules so you can see exactly why it classified a keyword the way it did.',
    },
    {
      question: 'Is there a free search intent checker?',
      answer:
        'Yes — this tool is completely free with no signup. It uses transparent heuristic rules in your browser. It does not analyze live search results, which is what paid SERP-based tools offer.',
    },
    {
      question: 'How to check search intent?',
      answer:
        'Look for intent cues in the keyword: "buy", "price" and "discount" suggest transactional intent; "best", "vs" and "review" suggest commercial; "how", "what" and "guide" suggest informational. Enter your keyword above and the tool applies these rules automatically — then verify against the real results page.',
    },
    {
      question: 'How does a search intent checker work?',
      answer:
        'This one matches your keyword against four hand-built cue-word banks (transactional, commercial, navigational, informational) and picks the bucket with the most matches. It is a heuristic, not AI, and it never looks at live search results — treat the output as a planning starting point.',
    },
    {
      question: 'How does the search intent checker work?',
      answer:
        'Enter your details using the inputs above and the search intent checker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the search intent checker free to use?',
      answer:
        'Yes - this search intent checker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a search intent checker?',
      answer:
        'A search intent checker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Heuristic word-bank classification — not AI and not based on live SERP data; verify against actual search results.',
    'Cue banks are English-only; non-English keywords without Latin script return "unknown".',
    'Keywords with no matching cues default to informational with confidence 0.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Search Intent Checker 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/blogging-seo/search-intent-classifier/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free search intent checker 2026: informational, navigational, commercial, transactional or unknown. Get instant results. free now.',
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
          name: 'Blogging SEO & Content Tools',
          item: 'https://husnainblogger.com/tools/blogging-seo/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Search Intent Classifier',
          item: 'https://husnainblogger.com/tools/blogging-seo/search-intent-classifier/',
        },
      ],
    },
  ],
};
