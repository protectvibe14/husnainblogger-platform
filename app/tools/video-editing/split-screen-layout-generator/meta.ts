import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: "panes",
    label: "Number of panes",
    type: "number",
    required: true,
    placeholder: "2",
    validation: { min: 2, max: 4 },
  },
  {
    id: "arrangement",
    label: "Arrangement",
    type: "select",
    required: true,
    options: ["side-by-side", "stacked", "grid", "pip"],
  },
  {
    id: "canvasAspect",
    label: "Canvas aspect ratio",
    type: "select",
    required: true,
    options: ["16:9", "9:16", "1:1", "4:3"],
  },
  {
    id: "gapPx",
    label: "Gap between panes (px)",
    type: "number",
    required: false,
    placeholder: "8",
    validation: { min: 0 },
  },
];

export const outputs: ToolOutput[] = [
  { id: "paneList", label: "Pane rectangles", type: "list" },
  { id: "cssGridSnippet", label: "CSS grid snippet", type: "copy" },
  { id: "svgPreview", label: "SVG preview parameters", type: "text" },
  { id: "warnings", label: "Warnings", type: "list" },
];

const DESCRIPTION =
  "Build split-screen layouts for duets and comparisons: set your panes, arrangement, and aspect ratio for exact coordinates and copy-ready CSS.";

export const content: ToolContent = {
  title: "Split Screen Video Layout",
  description: DESCRIPTION,
  howTo: [
    "Choose the Number of panes (2–4) for your split screen.",
    "Pick an Arrangement: side-by-side, stacked, grid, or pip (picture-in-picture).",
    "Select the Canvas aspect ratio: 16:9, 9:16, 1:1, or 4:3.",
    "Set the Gap between panes in pixels (0 or more; default 0).",
    "Read each pane's exact x, y, width, and height in the Pane rectangles list.",
    "Copy the CSS grid snippet into your editor, and check Warnings for panes that come out tiny.",
  ],
  methodology:
    "Pure rectangle math: the fixed canvas preset is subdivided into columns " +
    "(side-by-side), rows (stacked), a fixed 2/3/4-pane grid rule, or a " +
    "full-bleed main pane with stacked PiP overlays. Pixel remainders go to " +
    "the last pane so the canvas tiles exactly. Nothing is rendered here — " +
    "the preview is drawn by the UI from the SVG parameters.",
  examples: [
    {
      title: "YouTube duet (2 panes)",
      inputs: { panes: 2, arrangement: "side-by-side", canvasAspect: "16:9", gapPx: 8 },
      note: "Two 956×1080 columns — copy the CSS grid snippet straight into your editor.",
    },
    {
      title: "Vertical 3-way comparison",
      inputs: { panes: 3, arrangement: "grid", canvasAspect: "9:16", gapPx: 16 },
      note: "Top row of 2 panes plus a full-width bottom pane; warns if panes get tiny.",
    },
    {
      title: "Reaction video PiP",
      inputs: { panes: 2, arrangement: "pip", canvasAspect: "16:9", gapPx: 16 },
      note: "Full-canvas main video with a 28%-width overlay — keep faces clear of the corner.",
    },
  ],
  faqs: [
    {
      question: "What is the best split screen video layout?",
      answer:
        "For duets and reactions, side-by-side on 16:9 or picture-in-picture keeps both subjects readable. For 3-way comparisons on vertical video, the grid (2 on top, 1 wide below) works well. This tool computes the exact coordinates for all four arrangements.",
    },
    {
      question: "Is there a free split screen video layout?",
      answer:
        "Yes — this page is completely free with no sign-up. Pick your panes, arrangement, and aspect ratio, then copy the CSS grid snippet or use the coordinates in CapCut, Premiere, or any editor.",
    },
    {
      question: "How to create split screen video?",
      answer:
        "Decide how many panes you need and how they should sit (side-by-side, stacked, grid, or PiP), generate the layout here, then place each clip at the given x/y/width/height in your editor. Keep captions and faces away from PiP overlay corners.",
    },
    {
      question: "How does a split screen video layout work?",
      answer:
        "The canvas is divided into integer-pixel rectangles with a fixed gap between them; this tool lists every pane's coordinates, gives you a copy-paste CSS grid snippet, and warns when a pane comes out too narrow to read on a phone.",
    },
    {
      question: 'What is a split screen video layout?',
      answer:
        'A split screen video layout is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    "Pure geometry — the tool computes coordinates; rendering/preview is the UI's job.",
    "Canvas sizes are fixed presets per aspect ratio (16:9 → 1920×1080, 9:16 → 1080×1920, 1:1 → 1080×1080, 4:3 → 1600×1200).",
    "PiP overlays render above the main pane (higher z-order) — keep important content clear of that corner.",
  ],
  jsonLd: [],
};
