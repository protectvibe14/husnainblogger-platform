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
    id: 'noteTitle',
    label: 'Note title',
    type: 'text',
    required: false,
    placeholder: 'e.g. Meeting notes',
  },
  {
    id: 'noteText',
    label: 'Note text',
    type: 'textarea',
    required: true,
    placeholder: 'Write or paste a note, then save it…',
  },
  {
    id: 'query',
    label: 'Search query',
    type: 'text',
    required: true,
    placeholder: 'Describe what you are looking for…',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'matches',
    label: 'Matching notes',
    type: 'list',
    description: 'Free semantic search notes 2026: Your notes ranked by semantic similarity to the query. Instant, private, and mobile-friendly. No signup - try it free!',
  },
  {
    id: 'honestyNote',
    label: 'About this result',
    type: 'text',
    description: 'What embedding search can and cannot do.',
  },
];

export const content: ToolContent = {
  title: 'Semantic Note Search: Free 2026 – Free | HusnainBlogger',
  description:
    'Search your saved notes by meaning with free on-device embeddings. Notes stay in your browser — find ideas fast — absolutely nothing is uploaded.',
  howTo: [
    'Save notes with the form below — they are embedded on-device and kept in your browser (localStorage).',
    'Type a query describing what you are looking for, in your own words.',
    'Wait for the embedding model to download (~22 MB, once).',
    'Read your notes ranked by meaning-similarity, with scores.',
    'Best with English notes; skim the matched note — similarity is a statistical guess.',
  ],
  methodology:
    'Runs the Xenova/bge-small-en-v1.5 feature-extraction model (MIT, ~22 MB, 384 dimensions) directly in your browser via Transformers.js. Each saved note is embedded with mean pooling and L2 normalization and stored alongside the note in localStorage; the query is embedded with the model’s recommended retrieval prefix and ranked against notes by cosine similarity. Nothing is uploaded; the page is explicit that embeddings are English-optimized statistical similarity, not understanding.',
  examples: [
    {
      title: 'Finding a recipe note',
      inputs: { query: 'how to make pancakes fluffy' },
      note: 'A note titled "Breakfast ideas" containing a pancake recipe ranks at the top even without the word "fluffy".',
    },
    {
      title: 'Meeting follow-ups',
      inputs: { query: 'what did we decide about pricing' },
      note: 'Notes mentioning price decisions surface above unrelated meeting notes.',
    },
  ],
  faqs: [
    {
      question: 'Where are my notes stored?',
      answer:
        'In your browser’s localStorage on this device, together with their embeddings. They are never uploaded anywhere, and clearing site data deletes them.',
    },
    {
      question: 'Why does it need to download a model?',
      answer:
        'Semantic search needs embeddings — numeric meaning-vectors for your text. The ~22 MB BGE model downloads once, runs on your device, and is cached for later visits.',
    },
    {
      question: 'Does it work in other languages?',
      answer:
        'Poorly. The embedding model is English-optimized; queries and notes in other languages rank unreliably. The tool discloses this up front.',
    },
    {
      question: 'Is this as good as cloud AI search?',
      answer:
        'No. A 22 MB on-device model is a lightweight similarity engine, not a large language model. It finds related notes well; it does not understand, summarize or answer questions.',
    },
    {
      question: 'How does the semantic search notes work?',
      answer:
        'Enter your details using the inputs above and the semantic search notes calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the semantic search notes free to use?',
      answer:
        'Yes - this semantic search notes is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a semantic search notes?',
      answer:
        'A semantic search notes is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'English-optimized embeddings — other languages rank poorly.',
    'Notes and embeddings live in this browser’s localStorage (up to 200 notes).',
    'Similarity is a statistical guess — skim the matched note to confirm.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Semantic Note Search: Free 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/semantic-note-search/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free semantic search notes 2026: Your notes ranked by semantic similarity to the query. Instant, private, and mobile-friendly. No signup - try it free!',
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
          name: 'Semantic Note Search',
          item: 'https://husnainblogger.com/tools/ai-tools/semantic-note-search/',
        },
      ],
    },
  ],
};
