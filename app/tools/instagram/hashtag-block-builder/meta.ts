import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/hashtag-block-builder/';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'niche',
    label: 'Niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. fitness, fashion, food',
  },
  {
    id: 'postType',
    label: 'Post type',
    type: 'text',
    required: true,
    placeholder: 'reel, carousel, photo or story',
  },
  {
    id: 'blockSize',
    label: 'Tags per block (1-5)',
    type: 'text',
    required: true,
    placeholder: 'e.g. 5',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'lines',
    label: 'Hashtag blocks',
    type: 'list',
    description:
    'Free instagram hashtag sets copy paste 2026: One ready-to-paste hashtag block per item (up to 5 tags each). Fast, private now.',
  },
  {
    id: 'alternates',
    label: 'Alternate blocks',
    type: 'list',
    description:
    'Two alternate blocks per item for variety across posts.',
  },
  {
    id: 'warnings',
    label: 'Build warnings',
    type: 'list',
    description:
    'Notes such as block sizes clamped to the 5-tag max.',
  },
  {
    id: 'count',
    label: 'Blocks built',
    type: 'number',
    description:
    'How many hashtag blocks were built.',
  },
];

export const content: ToolContent = {
  title: 'Instagram Hashtag Sets Copy Paste',
  description:
    'Build copy-paste Instagram hashtag sets for free: add your niche, post type and block size to get a main block plus 2 alternates. Build yours now.',
  howTo: [
    'Add one item per post and type your Niche (fitness, fashion, food and 13 more).',
    'Type the Post Type: reel, carousel, photo or story — it prepends format-specific tags.',
    'Enter Tags Per Block as a number from 1 to 5 (larger requests are clamped to 5).',
    'Click Build to get one ready-to-paste block plus 2 alternates per item.',
    'Copy the block into your caption — remember the tags are curated suggestions, not live trend data.',
  ],
  methodology:
    'Blocks are assembled from bundled pools: 16 niches x 24 hand-picked tags (384) plus 4 post types x 8 format tags (32), 416 tags total. The main block is the first N tags of the de-duplicated pool (post-type tags first), alternates are the next slices cycling through the pool — deterministic, no AI, no live volume or trend data.',
  faqs: [
    {
      question: 'What is the best instagram hashtag sets copy paste?',
      answer:
        'There is no verified “best” — tag performance depends on your niche, content and audience. This free builder gives you curated, ready-to-paste sets (main block + 2 alternates) from fixed tag pools, and it is honest about what it cannot do: it has no live data on which tags are trending.',
    },
    {
      question: 'Is there a free instagram hashtag sets copy paste?',
      answer:
        'Yes — this builder is completely free with no signup. Add items with your niche, post type and block size (1–5 tags), and it returns a main block plus two alternates per item, ready to paste into your caption.',
    },
    {
      question: 'How to use instagram hashtag sets copy paste?',
      answer:
        'Add one item per post, type your niche and post type (reel, carousel, photo or story), set the block size from 1–5, and click Build. Copy the main block into your caption, or rotate in the alternates for variety across posts.',
    },
    {
      question: 'How does an instagram hashtag sets copy paste work?',
      answer:
        'This one slices fixed bundled tag pools — 384 niche tags and 32 post-type tags — into blocks of your chosen size, deterministically. It does not check live tag volume or trends; blocks are intentionally small (1–5 tags), well under Instagram’s per-post cap.',
    },
    {
      question: 'How does the instagram hashtag sets copy paste work?',
      answer:
        'Enter your details using the inputs above and the instagram hashtag sets copy paste calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the instagram hashtag sets copy paste free to use?',
      answer:
        'Yes - this instagram hashtag sets copy paste is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an instagram hashtag sets copy paste?',
      answer:
        'An instagram hashtag sets copy paste is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Hashtags come from fixed bundled pools (384 niche tags + 32 post-type tags) — no live data on tag volume, reach, or what is trending.',
    'Blocks are intentionally small (1–5 tags) and well under Instagram’s per-post tag cap; the tool does not look up the platform’s current limit.',
    'A block never guarantees reach — tag choice is a small factor compared to content quality and audience fit.',
    'Supported niches are limited to the 16 bundled ones; anything else is rejected with the full list shown.',
  ],
  jsonLd: [
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Hashtag Block Builder',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
