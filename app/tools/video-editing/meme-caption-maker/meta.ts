import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent, BuilderField } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: "template",
    label: "Meme template",
    type: "text",
    required: true,
    placeholder: "classic-top-bottom | modern-minimal | top-only | bottom-only | demotivator | split-caption",
  },
  {
    id: "topText",
    label: "Top text",
    type: "text",
    required: false,
    placeholder: "WHEN THE RENDER FINISHES",
  },
  {
    id: "bottomText",
    label: "Bottom text",
    type: "text",
    required: false,
    placeholder: "ON THE FIRST TRY",
  },
  {
    id: "style",
    label: "Style",
    type: "text",
    required: false,
    placeholder: "classic | modern",
  },
];

export const outputs: ToolOutput[] = [
  { id: "summary", label: "Build summary", type: "text" },
  { id: "memeSpecs", label: "Meme specs", type: "list" },
  { id: "svgParams", label: "SVG preview parameters", type: "copy" },
  { id: "exportJson", label: "Export specs (JSON)", type: "download" },
];

const DESCRIPTION =
  "Make highly shareable memes in seconds: pick from 6 classic meme templates, add your top and bottom text, and get a ready-to-render caption spec.";

export const content: ToolContent = {
  title: "Meme Text Generator",
  description: DESCRIPTION,
  howTo: [
    "Add one item per meme you want to build.",
    "Pick a Meme template: classic-top-bottom, modern-minimal, top-only, bottom-only, demotivator, or split-caption.",
    "Type your Top text and Bottom text (120 characters max each; at least one caption is required).",
    "Choose a Style: classic (Impact with black stroke) or modern (clean bold sans).",
    "Read each Meme spec: template, layout, font, and size — long captions auto-shrink with a note.",
    "Copy the SVG preview parameters into the page preview, or Export specs as JSON for your editor.",
  ],
  methodology:
    "A template engine matches each entry against a fixed bank of 6 meme " +
    "templates, assigns the template's font, colors, and text layout, and " +
    "auto-shrinks captions over 60 characters proportionally (floor 24px). " +
    "The logic emits a render spec only — the actual image is drawn by the " +
    "page's canvas preview, not by this tool. No AI involved.",
  faqs: [
    {
      question: "What is the best meme text generator?",
      answer:
        "The best one gives you the classic Impact top/bottom look plus a few modern styles without watermarks. This tool builds the full spec — template, font, size, and layout — for 6 classic formats, and the preview on this page renders it.",
    },
    {
      question: "Is there a free meme text generator?",
      answer:
        "Yes — this page is completely free with no sign-up. Add your captions, pick a template, and use the preview or export the spec JSON to render it in your own editor.",
    },
    {
      question: "How to generate meme text ideas?",
      answer:
        "Start with a relatable setup on top and a punchline on the bottom — the split-caption template is built for exactly that. Keep each line under 60 characters so it stays large and readable; longer lines auto-shrink.",
    },
    {
      question: "How does a meme text generator work?",
      answer:
        "You choose a template and type top and bottom captions; the tool assigns the template's font, colors, and text positions and computes the font size, shrinking long captions to fit. The spec is then rendered as an image by the page preview — the logic itself never draws pixels.",
    },
    {
      question: 'How does the meme text generator work?',
      answer:
        'Enter your details using the inputs above and the meme text generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the meme text generator free to use?',
      answer:
        'Yes - this meme text generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a meme text generator?',
      answer:
        'A meme text generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    "The logic produces a render spec, not an image — actual rasterization is the page's canvas preview.",
    "Fixed bank of 6 templates — template-based, not AI-generated.",
    "Captions are limited to 120 characters each; text over 60 characters auto-shrinks (minimum 24px).",
  ],
  jsonLd: [
    {
      "@type": "SoftwareApplication",
      name: "Meme Text Generator 2026 – Free Tool | HusnainBlogger",
      url: "https://husnainblogger.com/tools/video-editing/meme-caption-maker/",
      applicationCategory: "Utilities",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: DESCRIPTION,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://husnainblogger.com/" },
        { "@type": "ListItem", position: 2, name: "Tools", item: "https://husnainblogger.com/tools/" },
        { "@type": "ListItem", position: 3, name: "Video Editing Tools", item: "https://husnainblogger.com/tools/video-editing/" },
        { "@type": "ListItem", position: 4, name: "Meme Caption Maker", item: "https://husnainblogger.com/tools/video-editing/meme-caption-maker/" },
      ],
    },
  ],
};
