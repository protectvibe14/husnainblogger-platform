import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/seo-title-tag-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. email marketing for beginners',
    validation: { min: 2, max: 200 },
  },
  {
    id: 'targetKeyword',
    label: 'Target keyword',
    type: 'text',
    required: true,
    placeholder: 'e.g. email marketing tips',
    validation: { max: 100 },
  },
  {
    id: 'brand',
    label: 'Brand name (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. HusnainBlog',
    validation: { max: 40 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'titles',
    label: 'Title suggestions',
    type: 'list',
    description:
    'Six title-tag suggestions built from fixed templates with your keyword front-loaded.',
  },
  {
    id: 'lengthAnalysis',
    label: 'Length analysis',
    type: 'text',
    description:
    'Per-title character counts and pixel-width estimates against the 60-char / 600 px conventions.',
  },
  {
    id: 'pixelWidthEstimate',
    label: 'Pixel width estimate (first title)',
    type: 'number',
    description:
    'Estimated rendered pixel width of the primary title using a fixed character-width table.',
  },
];

export const content: ToolContent = {
  title: 'SEO Title Tag Generator',
  description:
    'Free SEO title tag generator 2026: get six keyword-optimized title suggestions with 60-char length checks and pixel-width estimates.',
  howTo: [
    'Enter your page topic (2–200 characters) and the target keyword (required).',
    'Optionally add your brand name — it appears in the last template.',
    'Run the tool to get six title suggestions with the keyword front-loaded in the primary title.',
    'Review the per-title analysis: anything over 60 characters or ~600 px is flagged.',
    'Pick a title within the conventions, rewrite it in your own voice, and confirm it reads naturally.',
  ],
  methodology:
    'Titles are assembled from a fixed bank of 6 templates with your keyword, topic, and brand filled in — nothing is written by AI. Length analysis counts characters (unicode-safe) against the widely published 50–60 character SERP convention. Pixel width is estimated with a fixed per-character width table and compared to the widely published ~600 px Google desktop truncation cutoff. Both are labeled as conventions, not guarantees: Google rewrites titles on its own. Nothing here predicts or promises rankings.',
  examples: [
    {
      title: 'Blog post title options',
      inputs: {
        topic: 'email marketing for beginners',
        targetKeyword: 'email marketing tips',
        brand: 'HusnainBlog',
      },
      note: 'Six suggestions with the keyword front-loaded and the brand in the last title.',
    },
    {
      title: 'No brand provided',
      inputs: {
        topic: 'sourdough baking',
        targetKeyword: 'sourdough starter guide',
      },
      note: 'Works without a brand — the last template uses a neutral placeholder.',
    },
  ],
  faqs: [
    {
      question: 'What is the best SEO title tag generator?',
      answer:
        'The best SEO title tag generator front-loads your keyword, flags titles over the 60-character convention, and estimates pixel width against the ~600 px truncation cutoff. This free tool does all three from a fixed template bank, with no signup.',
    },
    {
      question: 'Is there a free SEO title tag generator?',
      answer:
        'Yes — this SEO title tag generator is completely free with no signup. Enter a topic and target keyword, optionally add your brand, and get six analyzed title suggestions instantly.',
    },
    {
      question: 'How to generate an SEO title tag?',
      answer:
        'Enter your topic and target keyword (plus an optional brand), then review the six suggestions. Choose one within 50–60 characters and under ~600 px wide that includes your keyword near the start, and rewrite it in your own voice before publishing.',
    },
    {
      question: 'How does an SEO title tag generator work?',
      answer:
        'This one fills your keyword, topic, and brand into a fixed bank of six proven title templates — no AI writing involved. It then checks each title against the widely published 50–60 character convention and estimates its pixel width with a fixed character-width table. Note: Google may rewrite titles itself, so treat these as guidance, not guarantees.',
    },
    {
      question: 'What is the ideal title tag length?',
      answer:
        'The widely published convention is 50–60 characters and under ~600 pixels on desktop — titles past that risk truncation in Google\'s results. This tool counts characters and estimates pixel width for every suggestion, flagging anything over 60 characters or the ~600 px cutoff.',
    },
    {
      question: 'Should my keyword go first in the title tag?',
      answer:
        'Yes — placing your keyword near the start makes its relevance clear in the SERP. This generator front-loads your target keyword in the primary template and gives you five more variations to choose from before you rewrite it in your own voice.',
    },
    {
      question: 'How do I add my brand name to the title tag?',
      answer:
        'Enter it in the optional "Brand name" field and it appears in the last of the six title templates. If you leave it blank, the last template uses a neutral placeholder instead, so you still get all six suggestions.',
    },
  ],
  assumptions: [
    'Suggestions are starting templates assembled from a fixed bank — rewrite them for your SERP; they are not optimized copy.',
    'The 50–60 character range and ~600 px cutoff are widely published display conventions, not guarantees; Google rewrites titles on its own.',
    'No rankings are promised or implied — title tags are one small on-page factor among many.',
  ],
  jsonLd: [
  ],
};
