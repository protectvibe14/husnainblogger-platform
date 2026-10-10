import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/serp-snippet-preview-tool/';

export const inputs: ToolInput[] = [
  {
    id: 'title',
    label: 'Page title',
    type: 'text',
    required: true,
    placeholder: 'e.g. How to Start a Blog in 2026: 12 Proven Steps',
    validation: { max: 200 },
  },
  {
    id: 'url',
    label: 'Page URL',
    type: 'url',
    required: true,
    placeholder: 'https://example.com/your-post/',
  },
  {
    id: 'description',
    label: 'Meta description (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'e.g. Learn how to start a blog step by step, from setup to your first 1,000 readers.',
    validation: { max: 500 },
  },
  {
    id: 'date',
    label: 'Display date (optional)',
    type: 'date',
    required: false,
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'previewHtml',
    label: 'Snippet mockup HTML',
    type: 'copy',
    description:
    'Free google snippet preview tool 2026: Google-style search result mockup (favicon, URL breadcrumb, title, description) as. Fast, private.',
  },
  {
    id: 'titleWidthPxEstimate',
    label: 'Title width estimate (px)',
    type: 'number',
    description:
    'Estimated rendered pixel width of the title using a per-character width table.',
  },
  {
    id: 'truncationWarning',
    label: 'Truncation warning',
    type: 'text',
    description:
    "Whether the title is likely to be cut off at Google's ~600 px desktop cutoff.",
  },
];

export const content: ToolContent = {
  title: 'Google Snippet Preview Tool',
  description:
    'Preview your Google search result with this free google snippet preview tool. Check title width, spot truncation, and see a realistic mockup. Try it.',
  howTo: [
    'Enter your page title (1–200 characters) — the exact title tag you plan to use.',
    'Enter the page URL starting with http:// or https://.',
    'Optionally add your meta description (up to 500 characters) and a display date.',
    'Run the tool to see a Google-style snippet mockup, the estimated title width in pixels, and a truncation warning.',
    'If the title is flagged as too wide, shorten it or move your keyword closer to the start.',
  ],
  methodology:
    'This is a static mockup, not live Google data. The title width is estimated with a fixed per-character pixel-width table (95 ASCII chars mapped, emoji counted wide, unknown characters defaulted) and compared against the widely published ~600 px Google desktop truncation cutoff. The breadcrumb truncates very long URLs in the middle, keeping the host and final path segment.',
  examples: [
    {
      title: 'Blog post snippet check',
      inputs: {
        title: 'How to Start a Blog in : 12 Proven Steps',
        url: 'https://example.com/how-to-start-a-blog/',
        description:
    'Learn how to start a blog step by step, from setup to your first 1,000 readers.',
        date: '2026-01-05',
      },
      note: 'Checks whether a typical long title fits Google\'s width cutoff.',
    },
    {
      title: 'Emoji title check',
      inputs: {
        title: 'Best Meal Prep Ideas 🥗 for Busy Weeks',
        url: 'https://example.com/meal-prep-ideas/',
      },
      note: 'Emoji render wide — this checks how much width they cost.',
    },
    {
      title: 'Title only, no description',
      inputs: {
        title: 'Sourdough Starter Guide',
        url: 'https://example.com/sourdough-starter/',
      },
      note: 'Shows the honest placeholder used when no meta description is entered.',
    },
  ],
  faqs: [
    {
      question: 'What is the best google snippet preview tool?',
      answer:
        'The best one shows you what matters before you publish: a realistic mockup of the title, URL, and description, plus an honest width check against Google\'s truncation cutoff. This free tool does both and flags titles that will likely be cut off.',
    },
    {
      question: 'Is there a free google snippet preview tool?',
      answer:
        'Yes — this google snippet preview tool is completely free with no signup. Enter a title, URL, and optional description and you get the mockup, pixel-width estimate, and truncation warning instantly.',
    },
    {
      question: 'How to use google snippet?',
      answer:
        'Enter the page title and URL you plan to publish, add your meta description, and review the mockup. If the title is flagged as wider than ~600 px, shorten it or move the keyword earlier so the important words survive truncation.',
    },
    {
      question: 'How does a google snippet preview tool work?',
      answer:
        'It renders your title, URL breadcrumb, and description in a Google-style layout and estimates the title\'s pixel width with a per-character width table. Important: it is a static mockup and an estimate — it does not fetch live Google data, and Google sometimes rewrites titles and descriptions on its own.',
    },
    {
      question: 'What is a google snippet preview tool?',
      answer:
        'A google snippet preview tool is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'This is a static mockup, not live Google data — real snippets vary by device, query, country, and Google\'s own title/description rewriting.',
    'Pixel widths are estimates from a fixed character table; Google\'s actual rendering can differ slightly.',
    'The ~600 px truncation cutoff is a widely published estimate for desktop, not an official Google number.',
  ],
  jsonLd: [],
};
