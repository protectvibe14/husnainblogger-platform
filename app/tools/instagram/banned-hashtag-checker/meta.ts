import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'captionText',
    label: 'Caption or comment text',
    type: 'textarea',
    required: true,
    placeholder: 'Paste your Instagram caption or comment here — e.g. "New recipe up! #foodie #recipe #fitness"',
    validation: { max: 20000 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'perTagResults', label: 'Per-hashtag results', type: 'list' },
  { id: 'summary', label: 'Summary', type: 'text' },
  { id: 'disclaimer', label: 'Honesty disclaimer', type: 'text' },
];

const DESCRIPTION =
  'Screen captions with this free instagram banned hashtags checker — a curated sample flags risky tags fast. Verify flagged tags inside Instagram before posting.';

export const content: ToolContent = {
  title: 'Instagram Banned Hashtags Checker',
  description: DESCRIPTION,
  howTo: [
    'Paste your full caption or comment into the text box above.',
    'Run the check — every hashtag in your text is extracted (unicode-aware) and compared against the bundled curated banned sample.',
    'Read the per-hashtag list: FLAGGED tags matched the sample; clear tags did not.',
    'Remove or replace flagged tags, then re-run to confirm a clean verdict.',
    'Always double-check any flagged tag inside the Instagram app — search the tag; a "recent posts hidden" warning means it is restricted.',
  ],
  methodology:
    'The tool extracts hashtags with a unicode-aware regex (# followed by letters in any script, numbers, or underscores), normalizes them to lowercase, deduplicates case-insensitively, and looks each one up in a bundled curated list of 99 sample tags compiled from public 2026 guides. There is no live Instagram lookup — the result is a pre-screen against a fixed sample, not official or complete Instagram data.',
  examples: [
    {
      title: 'Travel caption',
      inputs: { captionText: 'Sunset in Santorini! #travel #wanderlust #beach #sunset' },
      note: 'Each tag is reported as flagged or clear against the curated sample list.',
    },
    {
      title: 'Caption with duplicates',
      inputs: { captionText: '#fitness #Fitness #FITNESS time to grind' },
      note: 'The same tag typed three ways is reported once, with an occurrence count of 3.',
    },
  ],
  faqs: [
    {
      question: 'What is the best instagram banned hashtags checker?',
      answer:
        'The most reliable check is manual: search the tag inside the Instagram app — if recent posts are hidden, the tag is restricted. This free tool pre-screens your caption against a bundled curated sample of 99 commonly-restricted tags so you can spot obvious problems before posting.',
    },
    {
      question: 'Is there a free instagram banned hashtags checker?',
      answer:
        'Yes — this checker is completely free with no signup. It compares your hashtags against a curated bundled list; remember it cannot query live Instagram data, so verify any flagged tag in the app.',
    },
    {
      question: 'How to check instagram banned hashtags?',
      answer:
        'Paste your caption into the tool above to screen it against the bundled sample list, then verify any flagged tag by searching it in the Instagram app. Only Instagram can tell you the current live status of a hashtag.',
    },
    {
      question: 'How does an instagram banned hashtags checker work?',
      answer:
        'This one extracts hashtags from your text with a unicode-aware pattern, normalizes each tag to lowercase, and looks it up in a fixed curated list of 99 sample tags. Matches are flagged; everything else is reported clear. It is a pre-screen, not an official Instagram result.',
    },
    {
      question: 'What happens if I post with a banned hashtag?',
      answer:
        'Your post gets excluded from that hashtag search page, so nobody browsing the tag will find you — and stacking several restricted tags can throttle the whole post\'s reach. If you suspect a tag hurt a post, search the tag inside the Instagram app: hidden recent posts mean the tag is restricted. Only live data inside the Instagram app can confirm whether a tag is currently restricted.',
    },
    {
      question: 'Why does the list only have 99 tags?',
      answer:
        'Because Instagram restricts far more tags than any static list can hold, and the list changes constantly. The bundled 99 are a curated sample of commonly-restricted tags for a quick pre-post screen — it will not catch every risky tag. Treat a clean result as \'no obvious problems found\', and verify any tag you depend on by searching it in the app.',
    },
    {
      question: 'Can this check tags in other languages or with emoji?',
      answer:
        'The tool extracts hashtags with a unicode-aware pattern and normalizes each tag to lowercase before looking it up, so non-English tags and emoji-containing tags are handled the same way as English ones. What it cannot do is query live Instagram data — it only screens against the bundled sample list.',
    },
  ],
  assumptions: [
    'Bundled list is a curated SAMPLE of 99 tags from public 2026 guides — not official, not live, and not complete. Instagram publishes no official restricted-hashtag list.',
    'A tag not in the sample is NOT proven safe; a tag in the sample may have been unrestricted since.',
    'Only a manual search inside the Instagram app can confirm a tag\'s current status.',
    'Hashtag extraction recognizes # followed by unicode letters, numbers, and underscores.',
  ],
  jsonLd: [],
};
