import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/sentence-length-analyzer/';

export const inputs: ToolInput[] = [
  {
    id: 'content',
    label: 'Text to analyze',
    type: 'textarea',
    required: true,
    placeholder: 'Paste your article, essay, or any text here…',
    validation: { max: 200000 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'avgSentenceLength',
    label: 'Average sentence length',
    type: 'number',
    description:
    'Free average sentence length checker 2026: Words per sentence, rounded to 2 decimals. free.',
  },
  {
    id: 'fleschReadingEase',
    label: 'Flesch Reading Ease',
    type: 'number',
    description:
    'Standard Flesch Reading Ease score (higher = easier to read).',
  },
  {
    id: 'fleschKincaidGrade',
    label: 'Flesch-Kincaid grade level',
    type: 'number',
    description:
    'US school grade level needed to understand the text.',
  },
  {
    id: 'gunningFog',
    label: 'Gunning Fog index',
    type: 'number',
    description:
    'Years of education needed to understand the text on first reading.',
  },
  {
    id: 'ari',
    label: 'Automated Readability Index (ARI)',
    type: 'number',
    description:
    'US grade level based on characters per word and words per sentence.',
  },
  {
    id: 'longSentences',
    label: 'Long sentences',
    type: 'table',
    description:
    'Sentences over 25 words with their word count and a preview (first 20).',
  },
];

export const content: ToolContent = {
  title: 'Average Sentence Length Checker',
  description:
    'Measure sentence length with this free average sentence length checker. Get Flesch, Flesch-Kincaid, Gunning Fog, and ARI scores plus long sentences.',
  howTo: [
    'Paste the text you want to analyze — an article, essay, or any passage.',
    'Run the tool to get average sentence length plus four standard readability scores.',
    'Open the long-sentences table to find every sentence over 25 words.',
    'Break flagged sentences in two and re-run to watch the scores move.',
    'Compare drafts: shorter, varied sentences generally score easier to read.',
  ],
  methodology:
    'All four scores use the standard published formulas, computed deterministically from your text: Flesch Reading Ease = 206.835 − 1.015·(words/sentences) − 84.6·(syllables/words); Flesch-Kincaid grade = 0.39·(words/sentences) + 11.8·(syllables/words) − 15.59; Gunning Fog = 0.4·(words/sentences + 100·complex/words); ARI = 4.71·(characters/words) + 0.5·(words/sentences) − 21.43. Syllables are counted with a deterministic vowel-group heuristic (silent-e rule, minimum 1); Gunning Fog is simplified (no proper-noun exclusion). "Long" means over 25 words — an editorial threshold.',
  examples: [
    {
      title: 'Simple passage',
      inputs: { content: 'The cat sat. The dog ran. The sun was warm and bright.' },
      note: 'Very short sentences — expect a high Reading Ease and low grade levels.',
    },
    {
      title: 'Dense academic-style sentence',
      inputs: {
        content:
          'The comprehensive internationalization of contemporary methodologies necessitates extraordinarily sophisticated conceptualizations of interdisciplinary phenomena.',
      },
      note: 'One long, heavy sentence — expect low Reading Ease and high grade levels, flagged in the long-sentences table.',
    },
  ],
  faqs: [
    {
      question: 'What is the best average sentence length checker?',
      answer:
        'The best one shows the standard formulas, not a black box: this free tool reports average sentence length plus Flesch Reading Ease, Flesch-Kincaid grade, Gunning Fog, and ARI — all computed with the published formulas — and lists every sentence over 25 words for you to fix.',
    },
    {
      question: 'Is there a free average sentence length checker?',
      answer:
        'Yes — this average sentence length checker is completely free with no signup. Paste up to 200,000 characters and get all five readability metrics plus the long-sentence table instantly.',
    },
    {
      question: 'How to check average sentence length?',
      answer:
        'Paste your text into the tool: it splits it into sentences (protecting abbreviations like e.g. and Mr.), counts the words, and reports the average along with four readability scores. Use the long-sentences table to find and split anything over 25 words.',
    },
    {
      question: 'How does an average sentence length checker work?',
      answer:
        'It splits text into sentences, counts words, syllables (via a deterministic vowel-group heuristic), and characters, then applies the published Flesch, Flesch-Kincaid, Gunning Fog, and ARI formulas. Scores are descriptive of the text — they are not claims about search rankings.',
    },
    {
      question: 'What is an average sentence length checker?',
      answer:
        'An average sentence length checker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I check average sentence length checker?',
      answer: 'Paste or enter your content above and the checker analyzes it instantly. Review the results and apply the suggested fixes.',
    },
    {
      question: 'What is a good average sentence length checker score?',
      answer: 'Aim for the top rating band shown in the results. If your score is low, the tool highlights exactly what to fix — usually small changes make a big difference.',
    },
  ],
  assumptions: [
    'Syllable counting uses a deterministic vowel-group heuristic (approximation); scores can differ slightly from tools using dictionary-based syllable counts.',
    'Gunning Fog is simplified: words with 3+ syllables count as complex with no proper-noun exclusion.',
    '"Long sentence" (over 25 words) is an editorial threshold, not a published standard.',
    'Readability scores describe the text only — they say nothing about search rankings.',
  ],
  jsonLd: [],
};
