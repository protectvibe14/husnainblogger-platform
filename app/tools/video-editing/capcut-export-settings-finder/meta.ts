import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'targetPlatform',
    label: 'Target platform',
    type: 'select',
    required: true,
    options: ['TikTok', 'YouTube', 'Shorts', 'Instagram Reels', 'Facebook', 'desktop'],
  },
  {
    id: 'sourceResolution',
    label: 'Source footage resolution',
    type: 'select',
    required: true,
    options: ['480p', '720p', '1080p', '1440p', '2160p (4K)', '4320p (8K)'],
  },
  {
    id: 'sourceFps',
    label: 'Source frame rate (fps)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 30',
  },
  {
    id: 'priority',
    label: 'Export priority',
    type: 'select',
    required: true,
    options: ['quality', 'fileSize', 'uploadSpeed'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'resolution', label: 'Recommended resolution', type: 'text' },
  { id: 'frameRate', label: 'Recommended frame rate (fps)', type: 'number' },
  { id: 'codec', label: 'Codec', type: 'text' },
  { id: 'format', label: 'Container format', type: 'text' },
  { id: 'bitrateTier', label: 'Bitrate tier (estimate)', type: 'text' },
  { id: 'aspectRatio', label: 'Aspect ratio', type: 'text' },
  { id: 'rationale', label: 'Why these settings', type: 'list' },
];

export const content: ToolContent = {
  title: 'Best CapCut Export Settings',
  description:
    'Find the best CapCut export settings for TikTok, YouTube, Reels, or desktop — resolution, frame rate, and codec picks from fixed rules. Try it free.',
  howTo: [
    'Pick your target platform: TikTok, YouTube, Shorts, Instagram Reels, Facebook, or desktop.',
    'Select your source footage resolution (480p up to 4320p / 8K).',
    'Enter your source frame rate in fps (1-240).',
    'Choose an export priority: quality, fileSize, or uploadSpeed.',
    'Run the finder to get resolution, frame rate, codec, format, bitrate tier, aspect ratio, and the reasoning behind each pick.',
  ],
  methodology:
    'Fixed rule-table lookup, never AI and never live platform data: 6 platform rules (aspect ratio + native export height; YouTube rises to 4K on 4K+ sources, desktop matches source up to 4K), source resolution is never upscaled (low-res sources export at source resolution with a warning), frame rate matches the source when it is a standard rate (24/25/30/50/60) and otherwise rounds to the nearest standard rate or caps at 60, codec is always H.264 in MP4 for universal playback, and the bitrate tier comes from a 5-row x 3-priority table of typical H.264 rule-of-thumb ranges. Unknown platforms fall back to safe H.264 / 1080p / 30 defaults with a warning.',
  examples: [
    {
      title: 'TikTok vertical video',
      inputs: { targetPlatform: 'TikTok', sourceResolution: '1080p', sourceFps: 30, priority: 'quality' },
      note: 'Recommends 1080p (1080x1920), 30 fps, H.264/MP4, 9:16, with the High bitrate tier.',
    },
    {
      title: 'YouTube 4K upload',
      inputs: { targetPlatform: 'YouTube', sourceResolution: '2160p (4K)', sourceFps: 24, priority: 'uploadSpeed' },
      note: 'Recommends a 2160p (3840x2160) export at 24 fps with the Balanced bitrate tier.',
    },
    {
      title: 'Low-res source stays low-res',
      inputs: { targetPlatform: 'Instagram Reels', sourceResolution: '480p', sourceFps: 30, priority: 'fileSize' },
      note: 'Exports at 480p with an explicit warning against upscaling, plus the Low bitrate tier.',
    },
  ],
  faqs: [
    {
      question: 'What is the best best CapCut export settings?',
      answer:
        'There is no single best setting — it depends on platform, source footage, and priority. This free finder applies fixed platform rules: vertical platforms (TikTok, Shorts, Reels) get 1080x1920 at 9:16, YouTube gets up to 4K on 4K sources, frame rate matches your source when standard, and everything exports as H.264 in MP4 with a bitrate tier matched to your priority (quality, fileSize, or uploadSpeed).',
    },
    {
      question: 'Is there a free best CapCut export settings?',
      answer:
        'Yes — this finder is completely free with no signup. Pick your platform, source resolution, frame rate, and priority to get resolution, frame rate, codec, format, bitrate tier, aspect ratio, and the reasoning behind each pick.',
    },
    {
      question: 'How to use best CapCut export settings?',
      answer:
        'Select your target platform and source resolution, enter your source frame rate (1-240 fps), and choose a priority. The finder returns the recommended export settings plus a rationale list explaining each choice — for example, why a 480p source is not upscaled, or why a 120 fps source is capped at 60.',
    },
    {
      question: 'How does a best CapCut export settings work?',
      answer:
        'It is a deterministic rule lookup, not AI: fixed tables map your platform to an aspect ratio and native resolution, your source resolution caps the export (never upscales), your frame rate is matched or rounded to a standard rate, and your priority selects a bitrate tier from typical H.264 ranges. The same inputs always produce the same picks.',
    },
    {
      question: 'How does the best capcut export settings work?',
      answer:
        'Enter your details using the inputs above and the best capcut export settings calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the best capcut export settings free to use?',
      answer:
        'Yes - this best capcut export settings is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a best capcut export settings?',
      answer:
        'A best capcut export settings is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Bitrate tiers are typical H.264 rule-of-thumb ranges, not exact platform requirements — treat them as estimates.',
    'Platform rules are fixed and may drift from actual platform recommendations over time; verify against the platform uploader for critical deliveries.',
    'The tool never upscales: a source below the platform native resolution exports at source resolution.',
    'Frame rates above 60 fps are capped at 60 for broad player compatibility.',
    'An unrecognized platform falls back to safe H.264 / 1080p / 30 defaults with a warning rather than erroring.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Best CapCut Export Settings 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/video-editing/capcut-export-settings-finder/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Find the best CapCut export settings for TikTok, YouTube, Reels, or desktop — resolution, frame rate, and codec picks from fixed rules. Try it free.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'CapCut & Video Editing',
          item: 'https://husnainblogger.com/tools/video-editing/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'CapCut Export Settings Finder',
          item: 'https://husnainblogger.com/tools/video-editing/capcut-export-settings-finder/',
        },
      ],
    },
  ],
};
