import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/local-keyword-modifier-expander/';

export const inputs: ToolInput[] = [
  {
    id: 'seedKeyword',
    label: 'Seed keyword',
    type: 'text',
    required: true,
    placeholder: 'e.g. plumber',
  },
  {
    id: 'locations',
    label: 'Locations (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'One place per line, e.g.\nAustin\nDenver\n— leave empty to use the built-in US/UK/CA/AU city list',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'expansions',
    label: 'Local keyword ideas',
    type: 'list',
    description: 'Free local keyword generator 2026: Geo-targeted keyword ideas combining your seed with location modifiers. Fast, private, no signup - try it now!',
  },
  {
    id: 'count',
    label: 'Idea count',
    type: 'number',
    description: 'How many keyword ideas were generated.',
  },
];

export const content: ToolContent = {
  title: 'Local Keyword Generator 2026 – Free Tool | HusnainBlogger',
  description:
    'Turn one seed into geo-targeted ideas with this free local keyword generator. Combine proven modifiers with US, UK, CA and AU cities. Start now!',
  howTo: [
    'Type your service or product keyword into the "Seed keyword" box, e.g. plumber.',
    'Optionally paste your own locations (one per line) — or leave it empty to use the built-in 24-city US/UK/CA/AU list.',
    'Run the tool to get every seed × location combination across 6 modifier templates.',
    'Copy the ideas into your keyword research tool to check real search volume before targeting them.',
  ],
  methodology:
    'This tool combines your seed with a fixed bank of 6 location-modifier templates ("{seed} in {loc}", "{loc} {seed}", "best {seed} in {loc}", "affordable {seed} in {loc}", "{seed} {loc} prices", "{seed} near {loc}") across either your custom locations (up to 50, deduped) or a built-in bank of 24 US/UK/CA/AU cities. It produces idea seeds only — no search volume, competition, or ranking data is included or implied. Nothing is written by AI; the same inputs always produce the same list.',
  examples: [
    {
      title: 'Plumber with default cities',
      inputs: { seedKeyword: 'plumber' },
      note: '144 ideas (24 cities x 6 templates), ready to check in a keyword tool.',
    },
    {
      title: 'Dentist in custom cities',
      inputs: { seedKeyword: 'dentist', locations: 'Austin\nDenver' },
      note: '12 ideas for two custom locations only.',
    },
  ],
  faqs: [
    {
      question: 'What is the best local keyword generator?',
      answer:
        'The best generator turns one service keyword into geo-targeted variations like "plumber in Austin" and "best plumber in Austin" so you can cover local searches. This tool does that for free across 6 proven modifier templates and 24 US/UK/CA/AU cities.',
    },
    {
      question: 'Is there a free local keyword generator?',
      answer:
        'Yes — this tool is completely free with no signup. Enter a seed keyword, optionally add your own locations, and get every combination as copyable keyword ideas.',
    },
    {
      question: 'How to generate local keyword ideas?',
      answer:
        'Take your service keyword and pair it with locations using modifiers people actually search: "in {city}", "{city} {service}", "best {service} in {city}", and "near me" style phrases. This tool generates all 6 modifier combinations per location automatically.',
    },
    {
      question: 'How does a local keyword generator work?',
      answer:
        'You provide a seed keyword and optional locations. The tool applies 6 fixed location-modifier templates to every location, producing ideas like "affordable dentist in Denver" or "dentist Denver prices". It does not show search volume — check ideas in a keyword research tool before building pages around them.',
    },
    {
      question: 'How does the local keyword generator work?',
      answer:
        'Enter your details using the inputs above and the local keyword generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the local keyword generator free to use?',
      answer:
        'Yes - this local keyword generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a local keyword generator?',
      answer:
        'A local keyword generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Idea seeds only: no local search volume, competition, or ranking data is included. Always verify ideas in a keyword research tool.',
    'The built-in city list covers 24 major US/UK/CA/AU cities; smaller towns and non-English markets need custom locations.',
    'Templates are fixed and generic — some combinations may sound unnatural for your niche and should be filtered by hand.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Local Keyword Generator 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free local keyword generator 2026: Geo-targeted keyword ideas combining your seed with location modifiers. Fast, private, no signup - try it now!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Blogging SEO & Content',
          item: 'https://husnainblogger.com/tools/blogging-seo/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Local Keyword Modifier Expander',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
