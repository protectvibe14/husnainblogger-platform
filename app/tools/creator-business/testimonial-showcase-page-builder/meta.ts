import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/testimonial-showcase-page-builder/';

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [
  {
    id: 'showcasePageHTML',
    label: 'Showcase page HTML (copy)',
    type: 'copy',
    description:
    'Free testimonial showcase page 2026: A complete, styled HTML page with your testimonials — host it yourself. Fast, private now.',
  },
  {
    id: 'embedSnippet',
    label: 'Embed snippet (copy)',
    type: 'copy',
    description:
    'A smaller section block to paste into an existing page.',
  },
];

export const itemFields: BuilderField[] = [
  {
    id: 'pageTitle',
    label: 'Page title (fill once)',
    type: 'text',
    placeholder: 'e.g. What My Clients Say',
  },
  {
    id: 'brandColor',
    label: 'Brand color hex (fill once)',
    type: 'text',
    placeholder: '#4F46E5',
  },
  {
    id: 'quote',
    label: 'Testimonial quote',
    type: 'text',
    required: true,
    placeholder: 'e.g. Working with her doubled our launch-week sales.',
  },
  {
    id: 'clientName',
    label: 'Client name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Sarah Ahmed',
  },
  {
    id: 'role',
    label: 'Client role / company',
    type: 'text',
    placeholder: 'e.g. Founder, Bloom & Co.',
  },
  {
    id: 'photoUrl',
    label: 'Client photo URL',
    type: 'url',
    placeholder: 'https://example.com/photo.jpg',
  },
];

export const content: ToolContent = {
  title: 'Testimonial Showcase Page',
  description:
    'Build a testimonial showcase page free — a complete, styled HTML page displaying your testimonials online. Build yours today!',
  howTo: [
    'Add one row per testimonial: paste the quote and the client name (both required).',
    'Optionally add each client\'s role or company and a photo URL.',
    'Set the page title and your brand color hex once on the first row.',
    'Build to get a complete HTML page and a smaller embed snippet.',
    'Host the page yourself or paste the snippet into your site — the tool adds no verification badge.',
  ],
  methodology:
    'The builder takes your testimonial rows and assembles them into static HTML with inline styles: a responsive card grid, your brand color as an accent, and an initial-letter avatar when no photo URL is given. All text is HTML-escaped. No verification is performed and no badge is added — the quotes are yours.',
  faqs: [
    {
      question: 'What is the best testimonial showcase page?',
      answer:
        'The best one is simple, fast, and honest: real quotes with real client names. This free builder turns your testimonials into a styled, responsive HTML page you host yourself — no platform lock-in, no fake review widgets.',
    },
    {
      question: 'Is there a free testimonial showcase page?',
      answer:
        'Yes — this builder is completely free with no signup. Add your testimonials, pick a brand color, and copy the HTML page and embed snippet instantly.',
    },
    {
      question: 'How to use testimonial showcase?',
      answer:
        'Add a row for each testimonial with the quote and client name, plus an optional role and photo URL. Set your page title and brand color once, then build: you get a full page to host plus a section snippet for an existing page.',
    },
    {
      question: 'How does a testimonial showcase page work?',
      answer:
        'It assembles your rows into static HTML — a card grid with your brand color as the accent — with all text HTML-escaped for safety. You host the result yourself. It verifies nothing: testimonials are user-provided, so always use quotes you have genuine permission to publish.',
    },
    {
      question: 'What is a testimonial showcase page?',
      answer:
        'A testimonial showcase page is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Testimonials are user-provided — the tool verifies nothing and adds no verification badge.',
    'Output is static HTML for you to host; the tool provides no hosting or URL.',
    'Photo URLs must be publicly reachable http(s) links you have rights to use.',
    'Only publish testimonials you have genuine permission to share.',
  ],
  jsonLd: [],
};
