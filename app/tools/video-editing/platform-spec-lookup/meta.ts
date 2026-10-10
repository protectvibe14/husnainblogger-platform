import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'platform',
    label: 'Platform',
    type: 'select',
    required: true,
    options: ['tiktok', 'youtube', 'youtube-shorts', 'instagram-reels', 'facebook', 'x', 'pinterest'],
  },
  {
    id: 'specType',
    label: 'Spec type',
    type: 'select',
    required: true,
    options: ['video', 'image', 'all'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'specs', label: 'Spec sheet', type: 'table' },
  { id: 'lastVerifiedDate', label: 'Last verified date', type: 'text' },
  { id: 'freshnessNote', label: 'Freshness note', type: 'text' },
];

export const content: ToolContent = {
  title: 'Video Specs by Platform',
  description:
    'Look up video specs by platform in seconds: aspect ratios, resolutions, max durations, and file limits for TikTok, YouTube, Reels, and more. Find yours now!',
  howTo: [
    'Pick the platform: TikTok, YouTube, YouTube Shorts, Instagram Reels, Facebook, X, or Pinterest.',
    'Pick the spec type: video, image, or all.',
    'Run the lookup to get the spec sheet with aspect ratios, resolutions, max duration, file size, and codecs.',
    'Check the last-verified date and freshness note on every lookup.',
    'Verify the numbers against the platform\'s current docs before you export — specs change often.',
  ],
  methodology:
    'Static rule-table lookup, never live data (no AI): a fixed table of 7 platforms x 2 spec types (14 entries) returns aspect ratios, recommended resolutions, max duration, max file size, codecs, and notes. Every changeable value is labeled an estimate as of the last-verified date (2026-10-01, next review 2027-01-01). Unknown platforms return an error instead of a guess. Spec values are individually estimated baselines, not current platform API data.',
  examples: [
    {
      title: 'TikTok video specs',
      inputs: { platform: 'tiktok', specType: 'video' },
      note: 'Returns the 9:16-first spec sheet with estimated duration, file size, and codec baselines.',
    },
    {
      title: 'Pinterest everything',
      inputs: { platform: 'pinterest', specType: 'all' },
      note: 'Returns video and image sections in one table, each row carrying its estimate label.',
    },
  ],
  faqs: [
    {
      question: 'What is the best video specs by platform 2026?',
      answer:
        'The best one tells you when its numbers were checked. This free lookup returns aspect ratios, resolutions, max duration, file size, and codecs for TikTok, YouTube, Shorts, Reels, Facebook, X, and Pinterest — every changeable value labeled as an estimate as of 2026-10-01, with a reminder to verify current platform docs.',
    },
    {
      question: 'Is there a free video specs by platform 2026?',
      answer:
        'Yes — this spec lookup is completely free with no signup. Pick a platform and spec type (video, image, or all) to get the full spec sheet, the last-verified date, and a freshness note instantly.',
    },
    {
      question: 'How to use video specs by platform 2026?',
      answer:
        'Select the platform and whether you need video or image specs. The lookup returns the recommended aspect ratio and resolution, max duration and file size estimates, and codec baselines — then double-check anything time-sensitive against the platform\'s current documentation, because specs change often.',
    },
    {
      question: 'How does a video specs by platform 2026 work?',
      answer:
        'It is a fixed rule table (7 platforms x 2 spec types, last verified 2026-10-01), not a live feed: the tool matches your platform and spec type and returns the stored spec sheet. Because platforms change specs frequently, every value is labeled an estimate and unknown platforms return an error rather than a guess.',
    },
    {
      question: 'What is a video specs by platform 2026?',
      answer:
        'A video specs by platform 2026 is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Specs are estimates as of 2026-10-01 (next review 2027-01-01) — never presented as live platform data.',
    'Platforms change specs often: verify against the platform\'s current documentation before you export.',
    'Unknown platforms return an error, never a guessed spec sheet.',
    'Codec and file-size rows are baselines; exact limits vary by account, region, and upload method.',
  ],
  jsonLd: [],
};
