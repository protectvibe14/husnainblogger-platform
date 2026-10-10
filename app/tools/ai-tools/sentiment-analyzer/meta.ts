import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';
import { getModelConfig, getDisclosures, HEADLINE } from './logic.ts';

const model = getModelConfig();

export const aiConfig: AiToolConfig = {
  lane: 'A',
  headline: HEADLINE,
  models: [model],
  disclosures: getDisclosures(),
};

export const inputs: ToolInput[] = [
  {
    id: 'text',
    label: 'Text to analyze',
    type: 'textarea',
    required: true,
    placeholder: 'Paste a review, comment or message…',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'sentiment',
    label: 'Sentiment',
    type: 'text',
    description:
    'Free sentiment analyzer 2026: POSITIVE or NEGATIVE with confidence scores for both. free.',
  },
  {
    id: 'honestyNote',
    label: 'About this result',
    type: 'text',
    description:
    'What this binary classifier can and cannot do.',
  },
];

export const content: ToolContent = {
  title: 'Sentiment Analyzer: Free Online',
  description:
    'Analyze text sentiment free with an on-device classifier: positive or negative verdicts with confidence bars. No uploads and no API key required.',
  howTo: [
    'Paste the text to analyze — a review, comment or message (up to 5,000 characters).',
    'Wait for the on-device model to download (~67 MB, once).',
    'Read the verdict: POSITIVE or NEGATIVE with confidence bars.',
    'Use it as a first-pass signal, not a final judgment — especially for sarcasm.',
  ],
  methodology:
    'Runs the Xenova/distilbert-base-uncased-finetuned-sst-2-english text-classification model (Apache-2.0, ~67 MB) directly in your browser via Transformers.js: a DistilBERT encoder fine-tuned on English movie-review sentiment outputs POSITIVE/NEGATIVE probabilities, shown as two confidence bars. Nothing is uploaded; the page is explicit that this is binary sentiment on English short texts — no neutral class, no emotion or sarcasm detection.',
  examples: [
    {
      title: 'Product review',
      inputs: { text: 'Absolutely love this — battery lasts two days and setup took minutes.' },
      note: 'Returns POSITIVE with a high confidence score.',
    },
    {
      title: 'Support comment',
      inputs: { text: 'Terrible experience, the app crashed three times and support never replied.' },
      note: 'Returns NEGATIVE with a high confidence score.',
    },
  ],
  faqs: [
    {
      question: 'Is my text uploaded anywhere?',
      answer:
        'No. The classifier downloads once to your browser and runs entirely on your device. Your text never leaves your computer or phone.',
    },
    {
      question: 'Can it detect sarcasm or mixed feelings?',
      answer:
        'No — and the tool says so. It outputs only POSITIVE or NEGATIVE. Sarcasm, irony, mixed reviews and subtle emotions are frequently misclassified.',
    },
    {
      question: 'What languages does it handle?',
      answer:
        'English. It was fine-tuned on English review-style text; other languages, heavy slang and emoji-only messages degrade results.',
    },
    {
      question: 'Why is the first run slow?',
      answer:
        'The browser downloads ~67 MB of model weights the first time. After that the model is cached and later runs start much faster, even offline.',
    },
    {
      question: 'How does the sentiment analyzer work?',
      answer:
        'Enter your details using the inputs above and the sentiment analyzer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the sentiment analyzer free to use?',
      answer:
        'Yes - this sentiment analyzer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a sentiment analyzer?',
      answer:
        'A sentiment analyzer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Binary sentiment only (POSITIVE / NEGATIVE) — no neutral, emotions or sarcasm detection.',
    'English short texts; other languages and long documents are out of scope.',
    'A first-pass signal for triage, not a definitive judgment of tone.',
  ],
  jsonLd: [],
};
