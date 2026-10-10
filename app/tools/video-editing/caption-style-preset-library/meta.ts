import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'vibe',
    label: 'Caption vibe',
    type: 'select',
    required: true,
    options: ['bold', 'minimal', 'hormozi', 'karaoke', 'neon'],
  },
  {
    id: 'platform',
    label: 'Platform',
    type: 'select',
    required: true,
    options: ['tiktok', 'reels', 'shorts'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'preset', label: 'Caption style preset (JSON config)', type: 'copy' },
  { id: 'capcutSteps', label: 'CapCut setup steps', type: 'list' },
];

export const content: ToolContent = {
  title: 'CapCut Caption Style Presets',
  description:
    'Steal pro caption styles in one click: pick a vibe and platform for a full CapCut config - font, colors, stroke, animation, and rebuild steps.',
  howTo: [
    'Pick a caption vibe: bold, minimal, hormozi, karaoke, or neon.',
    'Choose your platform — TikTok, Reels, or Shorts — for safe-zone placement guidance.',
    'Copy the preset config: font, fallback fonts, size, stroke, shadow, colors, and animation.',
    'In CapCut, generate captions with Auto captions, then apply the font, colors, and animation step by step.',
    'If the suggested font is missing on your device, use the listed fallback fonts in order.',
    'Preview on your phone — captions must stay readable over bright footage.',
  ],
  methodology:
    'Static curated content bank, never AI: the tool returns one of 5 hand-written caption presets (bold, minimal, hormozi, karaoke, neon), each with a real free font suggestion, ordered fallback fonts, size guidance, stroke/shadow/background specs, colors, and a word-by-word animation recipe. The platform only changes placement and safe-zone guidance. An unknown vibe defaults to "bold" with a note.',
  examples: [
    {
      title: 'Hormozi-style business captions',
      inputs: { vibe: 'hormozi', platform: 'tiktok' },
      note: 'White Archivo Black text with yellow keyword boxes — the classic high-energy short-form look.',
    },
    {
      title: 'Minimal explainer captions',
      inputs: { vibe: 'minimal', platform: 'shorts' },
      note: 'Calm Inter text on a subtle dark box — readable without shouting over the footage.',
    },
    {
      title: 'Karaoke word-highlight captions',
      inputs: { vibe: 'karaoke', platform: 'reels' },
      note: 'Active word turns cyan and pops — needs word-level timing from CapCut Auto captions.',
    },
  ],
  faqs: [
    {
      question: 'What is the best capcut caption style presets?',
      answer:
        'The best library gives you the full recipe, not just a screenshot. This free set covers five vibes — bold, minimal, hormozi, karaoke, neon — each with a real free font, ordered fallback fonts, size guidance, stroke and shadow specs, colors, a word animation recipe, and platform-specific CapCut setup steps.',
    },
    {
      question: 'Is there a free capcut caption style presets?',
      answer:
        'Yes — this library is completely free with no signup. Pick a vibe (bold, minimal, hormozi, karaoke, or neon) and a platform (TikTok, Reels, or Shorts) to get the full preset config plus step-by-step CapCut instructions instantly.',
    },
    {
      question: 'How to use capcut caption style presets?',
      answer:
        'Generate your preset, then in CapCut use Auto captions to time your lines. Apply the suggested font (or the first available fallback), then set size, stroke, shadow, colors, and the word animation exactly as listed. Finish with the platform placement step so captions stay inside the safe zone.',
    },
    {
      question: 'How does a capcut caption style presets work?',
      answer:
        'It is a curated content bank, not AI: each vibe maps to a hand-written preset with fixed font, fallback fonts, size, stroke, shadow, background, colors, and animation. The platform input only changes placement and safe-zone guidance. An unknown vibe defaults to "bold" with a clear note.',
    },
    {
      question: 'How does the capcut caption style presets work?',
      answer:
        'Enter your details using the inputs above and the capcut caption style presets calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the capcut caption style presets free to use?',
      answer:
        'Yes - this capcut caption style presets is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a capcut caption style presets?',
      answer:
        'A capcut caption style presets is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'A curated static bank of 5 presets — styles are hand-written, not computed or AI-generated.',
    'Suggested fonts are real free Google Fonts; CapCut may not ship them, so ordered fallbacks are included.',
    'The platform input only affects placement and safe-zone guidance, not the core style.',
    'Unknown vibes default to "bold" with a note rather than failing.',
    'CapCut instructions are manual steps — presets are not importable files.',
  ],
  jsonLd: [],
};
