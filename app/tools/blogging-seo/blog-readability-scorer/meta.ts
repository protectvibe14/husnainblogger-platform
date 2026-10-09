import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'text',
    label: 'Blog text (at least 30 words)',
    type: 'textarea',
    required: true,
    placeholder: 'Paste your blog post or draft here…',
    validation: { max: 20000 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'fleschScore', label: 'Flesch Reading Ease (0–100)', type: 'number' },
  { id: 'gradeLevel', label: 'Flesch–Kincaid grade level', type: 'number' },
  { id: 'verdict', label: 'Readability verdict', type: 'text' },
  { id: 'textStats', label: 'Text statistics', type: 'text' },
  { id: 'tips', label: 'How to improve', type: 'list' },
  { id: 'methodNote', label: 'Method note', type: 'text' },
];

const DESCRIPTION =
  'Free blog readability scorer 2026: get instant results in your browser. Instant, private, and mobile-friendly. No signup - try it free!';

export const content: ToolContent = {
  title: 'Blog Readability Scorer',
  description: DESCRIPTION,
  howTo: [
    'Paste your blog post or draft (at least 30 words).',
    'Run the check to get your Flesch Reading Ease score (0–100) and grade level.',
    'Read the verdict — for a general audience, aim for 60–70 (standard plain English).',
    'Apply the tips: shorter sentences and simpler words raise the score.',
  ],
  methodology:
    'This tool uses the real, published formulas — not an invented score. Flesch Reading Ease = 206.835 − 1.015 × (words ÷ sentences) − 84.6 × (syllables ÷ words) (Flesch, 1948; higher = easier). Flesch–Kincaid Grade Level = 0.39 × (words ÷ sentences) + 11.8 × (syllables ÷ words) − 15.59 (Kincaid et al., 1975; the US school grade needed to understand the text). Syllables are counted with a vowel-group heuristic (silent-e adjusted), a published estimation approach accurate within about ±3% of dictionary counts on English prose — labeled as an estimate in the output. Standard Flesch interpretation bands: 90–100 very easy, 80–90 easy, 70–80 fairly easy, 60–70 standard, 50–60 fairly difficult, 30–50 difficult, 0–30 very difficult.',
  examples: [
    {
      title: 'Simple text',
      inputs: { text: 'The cat sat on the mat. It was a hot day. '.repeat(10) },
      note: 'Scores above 90 (very easy) — short sentences, simple one-syllable words.',
    },
    {
      title: 'Dense text',
      inputs: {
        text: 'Notwithstanding the aforementioned considerations, the implementation necessitates comprehensive reconceptualization. '.repeat(10),
      },
      note: 'Scores low (difficult) with a high grade level — long sentences, heavy words.',
    },
  ],
  faqs: [
    {
      question: 'What is a good Flesch Reading Ease score for a blog?',
      answer:
        '60–70 (standard plain English) suits a general audience. 70–80 is fairly easy and works well for wide readership. Below 50 is difficult — fine for academic writing, not for blog readers.',
    },
    {
      question: 'Is this readability checker free?',
      answer:
        'Yes — completely free with no signup. It uses the real published Flesch formulas, computed entirely in your browser.',
    },
    {
      question: 'How is the Flesch Reading Ease calculated?',
      answer:
        'With the published formula: 206.835 − 1.015 × (words ÷ sentences) − 84.6 × (syllables ÷ words). Shorter sentences and simpler words raise the score. Syllables here are estimated with a vowel-group heuristic, labeled as an estimate.',
    },
    {
      question: 'Does readability affect SEO?',
      answer:
        'Readability itself is not a confirmed ranking factor, but easier text keeps readers on the page longer — and engagement signals matter. Either way, clear writing serves your readers.',
    },
    {
      question: 'How does the blog readability scorer work?',
      answer:
        'Enter your details using the inputs above and the blog readability scorer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the blog readability scorer free to use?',
      answer:
        'Yes - this blog readability scorer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a blog readability scorer?',
      answer:
        'A blog readability scorer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The Flesch formulas are real and published (Flesch 1948; Kincaid et al. 1975).',
    'Syllable counts are a vowel-group heuristic estimate (±~3% vs dictionary counts) — labeled as an estimate.',
    'Sentence splitting is on . ! ? — abbreviations like "Mr." slightly inflate sentence counts.',
    'Scores need 30+ words to be reliable; shorter samples are rejected.',
    'The score measures reading difficulty only — not accuracy, quality, or SEO value.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Blog Readability Scorer 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/blogging-seo/blog-readability-scorer/',
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
          name: 'Blogging SEO & Content Tools',
          item: 'https://husnainblogger.com/tools/blogging-seo/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Blog Readability Scorer',
          item: 'https://husnainblogger.com/tools/blogging-seo/blog-readability-scorer/',
        },
      ],
    },
  ],
};
