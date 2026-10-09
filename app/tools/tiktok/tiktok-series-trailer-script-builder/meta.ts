import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent, BuilderField } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'seriesTitle',
    label: 'Series title',
    type: 'text',
    required: true,
    placeholder: 'e.g. Tiny Kitchen Wins',
  },
  {
    id: 'episodeTopic',
    label: 'Episode topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. 5-minute mug cake',
  },
  {
    id: 'allowSpoilers',
    label: 'Spoiler style (optional)',
    type: 'text',
    required: false,
    placeholder: "type 'yes' for payoff-promise teases — leave blank for spoiler-free",
  },
];

export const outputs: ToolOutput[] = [
  { id: 'trailerScript', label: 'Trailer script', type: 'copy' },
  { id: 'teaseBeats', label: 'Tease beats per episode', type: 'list' },
  { id: 'montageCues', label: 'Montage direction cues', type: 'list' },
  { id: 'subscribeCta', label: 'Subscribe call to action', type: 'text' },
  { id: 'episodeCount', label: 'Episodes covered', type: 'number' },
];

const DESCRIPTION =
  'Write a TikTok series trailer script from your episode list — tease beats per episode, montage cues, and a subscribe CTA. Free. Build your trailer now.';

export const content: ToolContent = {
  title: 'TikTok Series Trailer Script',
  description: DESCRIPTION,
  howTo: [
    'Add one item per episode (2 to 20) — each with your series title and that episode\'s topic.',
    'Optional: type "yes" in the spoiler-style field for payoff-promise teases, or leave it blank for spoiler-free mystery teases.',
    'Run the builder to get a full trailer script: hook, one tease beat per episode, montage direction cues, and a subscribe CTA.',
    'Read the teases out loud and rewrite any line that reveals more than you want to give away.',
  ],
  methodology:
    'The builder takes 2 to 20 episode items and assembles a trailer script from fixed templates: a hook line, one tease beat per episode (drawn deterministically from a 6-template mystery bank, or a 6-template payoff bank when you opt into the spoiler style), 6 fixed montage direction cues, and a fixed subscribe CTA. Spoiler control is built in: teases cover episode topics only and never reveal outcomes, because the tool cannot know them. There is no AI — it is a static template engine.',
  faqs: [
    {
      question: 'what is the best tiktok series trailer script?',
      answer:
        'The best series trailer opens with a hook about the series, teases each episode without spoiling outcomes, flashes a fast montage, and ends with a subscribe CTA. This free builder assembles exactly that structure from your episode list — hook, per-episode tease beats, 6 montage cues, and a follow-worthy closing line.',
    },
    {
      question: 'is there a free tiktok series trailer script?',
      answer:
        'Yes — this series trailer script builder is completely free with no signup. It builds the script from fixed templates in your browser, so there is no usage limit.',
    },
    {
      question: 'how to use tiktok series trailer?',
      answer:
        'Add one item per episode (2 to 20) with your series title and each episode\'s topic, optionally choose a spoiler style, and run the builder. Film the hook, deliver one tease beat per episode over quick cuts, follow the montage cues, and close with the subscribe CTA.',
    },
    {
      question: 'how does a tiktok series trailer script work?',
      answer:
        'You list your episodes; the tool writes one tease beat per episode (spoiler-free mystery teases by default, payoff-promise teases if you opt in), adds 6 fixed montage direction cues and a subscribe CTA, and stitches everything into a copy-ready script. Same items always produce the same script.',
    },
    {
      question: 'How does the tiktok series trailer script work?',
      answer:
        'Enter your details using the inputs above and the tiktok series trailer script calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok series trailer script free to use?',
      answer:
        'Yes - this tiktok series trailer script is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok series trailer script?',
      answer:
        'A tiktok series trailer script is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'This is a static template builder — it never invents episode outcomes or series details beyond what you type.',
    'Spoiler control covers wording only: teases address episode topics, never outcomes, because the tool cannot know them.',
    'Trailers are capped at 20 episodes per script; longer series should be split into multiple trailers.',
    'The montage cues are filming directions, not an editing timeline — adapt them to your actual footage.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'TikTok Series Trailer Script 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/tiktok/tiktok-series-trailer-script-builder/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: DESCRIPTION,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/tiktok/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'TikTok Tools',
          item: 'https://husnainblogger.com/tools/tiktok/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'TikTok Series Trailer Script Builder',
          item: 'https://husnainblogger.com/tools/tiktok/tiktok-series-trailer-script-builder/',
        },
      ],
    },
  ],
};
