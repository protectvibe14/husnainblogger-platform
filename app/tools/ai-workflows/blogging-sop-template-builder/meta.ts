import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";
import type { BuilderField } from "../../../src/templates/types.ts";

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [
  {
    id: "sopDocument",
    label: "SOP document",
    type: "copy",
    description:
    "The full standard operating procedure in Markdown, ready to copy.",
  },
  {
    id: "stepChecklist",
    label: "Step checklist",
    type: "list",
    description:
    "One summary line per step with its owner and frequency.",
  },
];

export const itemFields: BuilderField[] = [
  { id: "processName", label: "Process name", type: "text", required: true, placeholder: "e.g. Publishing a blog post (same for every step)" },
  { id: "stepTitle", label: "Step title", type: "text", required: true, placeholder: "e.g. Draft the post" },
  { id: "owner", label: "Owner (optional)", type: "text", placeholder: "Who does this step" },
  { id: "frequency", label: "Frequency (optional)", type: "text", placeholder: "e.g. Weekly, per post" },
  { id: "details", label: "Details (optional)", type: "text", placeholder: "How this step is done" },
];

const DESCRIPTION =
  "Free blogging sop template 2026: The full standard operating procedure in Markdown, ready to copy. Get instant results. No signup - try it free now!";

export const content: ToolContent = {
  title: "Blogging SOP Template",
  description: DESCRIPTION,
  howTo: [
    "Enter the process name — use the same name on every step row.",
    "Add one row per step (up to 30) with the step title.",
    "Optionally add the owner, frequency, and details for each step — blanks become labeled fill-in slots.",
    "Click Build to format everything into an SOP document.",
    "Copy the document, fill in the placeholders, and share it with your team.",
  ],
  methodology:
    "The tool formats your own steps into a fixed SOP structure: title, purpose placeholder, numbered steps " +
    "each with owner, frequency, QA checkpoint, and details slots, plus a revision log. No process " +
    "knowledge is added — every step and assignment comes from you.",
  faqs: [
    {
      question: "What is the best blogging sop template?",
      answer:
        "The best blogging sop template turns your process into clear steps with an owner, frequency, and QA checkpoint per step. This tool formats your own steps into exactly that document — free.",
    },
    {
      question: "Is there a free blogging sop template?",
      answer:
        "Yes — this tool is free with no signup. You get a full SOP document plus a step checklist, built from your own steps.",
    },
    {
      question: "How to use blogging sop?",
      answer:
        "Add each step of your process with its owner and frequency, then the tool formats them into a standard operating procedure document. Fill in the labeled placeholders before sharing it with your team.",
    },
    {
      question: "How does a blogging sop template work?",
      answer:
        "It formats your steps — it never invents them. Each step gets owner, frequency, and QA checkpoint slots; anything you leave blank becomes a clearly-labeled fill-in slot so nothing reads as a real assignment by accident.",
    },
    {
      question: 'How does the blogging sop template work?',
      answer:
        'Enter your details using the inputs above and the blogging sop template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the blogging sop template free to use?',
      answer:
        'Yes - this blogging sop template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a blogging sop template?',
      answer:
        'A blogging sop template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    "The tool adds no process knowledge — every step, owner, and frequency comes from you.",
    "Blank fields become labeled placeholders; replace them before publishing the SOP.",
    "All steps in one run must share the same process name; steps are capped at 30.",
  ],
  jsonLd: [
    {
      "@type": "SoftwareApplication",
      name: "Blogging SOP Template 2026 – Free Tool | HusnainBlogger",
      url: "https://husnainblogger.com/tools/ai-workflows/blogging-sop-template-builder/",
      applicationCategory: "Utilities",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: DESCRIPTION,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://husnainblogger.com/tools/" },
        { "@type": "ListItem", position: 2, name: "Tools", item: "https://husnainblogger.com/tools/" },
        { "@type": "ListItem", position: 3, name: "AI Workflow Tools", item: "https://husnainblogger.com/tools/ai-workflows/" },
        {
          "@type": "ListItem",
          position: 4,
          name: "Blogging SOP Template Builder",
          item: "https://husnainblogger.com/tools/ai-workflows/blogging-sop-template-builder/",
        },
      ],
    },
  ],
};
