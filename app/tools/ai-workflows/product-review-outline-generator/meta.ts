import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";

const TOOL_URL = "https://husnainblogger.com/tools/ai-workflows/product-review-outline-generator/";

export const inputs: ToolInput[] = [
  {
    id: "productName",
    label: "Product name",
    type: "text",
    required: true,
    placeholder: "e.g. Sonos Era 100",
  },
  {
    id: "reviewType",
    label: "Review type",
    type: "select",
    required: true,
    options: ["hands-on", "comparison", "roundup"],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: "outline",
    label: "Review outline (copy)",
    type: "copy",
    description:
    "The full 10-section outline with your product filled in — copy it whole.",
  },
  {
    id: "sections",
    label: "Section headings",
    type: "list",
    description:
    "Numbered list of the 10 section headings for quick reference.",
  },
];

const DESCRIPTION =
  'Review products readers trust with this product review template — criteria, pros, cons, and verdict in a proven structure. Write reviews that rank.';

export const content: ToolContent = {
  title: "Product Review Template",
  description: DESCRIPTION,
  howTo: [
    "Enter your product name (required).",
    "Choose the review type: hands-on, comparison, or roundup.",
    "Run the tool to get a fixed 10-section review structure with your product filled in.",
    "Follow each section's write prompt to draft your own review — the tool writes no opinions.",
    "Fill every testing-note slot with what you actually tested before publishing.",
    "Copy the full outline and work through it top to bottom.",
  ],
  methodology:
    "The tool fills a fixed 10-section structure (3 types x 10 section templates = 30 fixed templates) with your " +
    "product name. Each section carries a fixed write prompt and a testing-note slot where you record what you " +
    "actually tested. No review opinions, scores, or verdicts are written or invented — the outline is a structure, " +
    "not a finished review.",
  examples: [
    {
      title: "Speaker review",
      inputs: { productName: "Sonos Era 100", reviewType: "hands-on" },
      note: "Single-product hands-on structure with testing notes.",
    },
    {
      title: "Head-to-head",
      inputs: { productName: "Kindle Paperwhite", reviewType: "comparison" },
      note: "Comparison structure — name the rival in the [COMPETITOR] slots.",
    },
    {
      title: "Category roundup",
      inputs: { productName: "Dyson V15", reviewType: "roundup" },
      note: "Roundup structure with your product as the anchor pick.",
    },
  ],
  faqs: [
    {
      question: "What is the best product review template?",
      answer:
        "The best product review template pairs a clear structure — verdict, what you tested, strengths, drawbacks, value — with slots for real testing notes. This free tool generates that 10-section structure for hands-on, comparison, and roundup reviews.",
    },
    {
      question: "Is there a free product review template?",
      answer:
        "Yes — this product review outline generator is completely free with no signup. Enter your product name, pick a review type, and get the full 10-section outline with testing-note slots instantly.",
    },
    {
      question: "How to use product review?",
      answer:
        "Pick your review type, then write one section at a time following each section's write prompt. Fill every testing-note slot with what you actually tested — readers trust specifics over adjectives, and invented results will cost you that trust.",
    },
    {
      question: "How does a product review template work?",
      answer:
        "You enter your product name and review type; the tool assembles a fixed 10-section outline with write prompts and testing-note slots. It writes no opinions for you — the review's credibility comes from your real testing.",
    },
    {
      question: 'What is a product review template?',
      answer:
        'A product review template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'What makes a product review trustworthy?',
      answer: 'Hands-on testing, specific measurements, honest cons alongside pros, and comparison to alternatives. Readers can tell when you haven\'t actually used the product.',
    },
    {
      question: 'How should I structure my review?',
      answer: 'Start with a verdict summary, then cover design/build, performance testing, pros and cons, comparison to competitors, and who should/shouldn\'t buy it.',
    },
    {
      question: 'Should I include a rating score?',
      answer: 'Scores help skimmers but can oversimplify. If you use them, explain your scoring criteria so readers understand what the number means.',
    },
    {
      question: 'How do I handle negative aspects honestly?',
      answer: 'Be specific about drawbacks and who they\'d affect. \'Battery lasts 6 hours, which is short for travelers but fine for desk use\' is more helpful than just \'bad battery.\'',
    },
  ],
  assumptions: [
    "The tool provides structure only — no review opinions, scores, or verdicts are written or invented.",
    "Comparison reviews use a [COMPETITOR] placeholder you fill in yourself; roundups anchor on your product.",
    "Every outline ships with testing-note slots; publish only after real testing or hands-on research.",
  ],
  jsonLd: [],
};
