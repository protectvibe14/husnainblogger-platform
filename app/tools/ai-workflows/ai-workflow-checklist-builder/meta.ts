import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";
import type { BuilderField } from "../../../src/templates/types.ts";

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [
  {
    id: "lines",
    label: "Checklist lines",
    type: "list",
    description: "The assembled checklist: title plus one checkbox line per stage.",
  },
  {
    id: "markdown",
    label: "Checklist (Markdown)",
    type: "copy",
    description: "The same checklist as Markdown for reuse in your docs or project tool.",
  },
];

export const itemFields: BuilderField[] = [
  { id: "workflowName", label: "Workflow name", type: "text", placeholder: "Blog post pipeline (fill once)" },
  { id: "stageName", label: "Stage name", type: "text", required: true, placeholder: "Draft outline" },
  { id: "owner", label: "Responsible role", type: "text", placeholder: "Writer" },
];

const DESCRIPTION =
  "Turn your stage list into a reusable ai content workflow checklist with owners and progress tracking — structure your pipeline step by step. Free, no signup.";

export const content: ToolContent = {
  title: "AI Content Workflow Checklist 2026 – Free | HusnainBlogger",
  description: DESCRIPTION,
  howTo: [
    "Add one row per workflow stage.",
    "Enter each stage's name and the role responsible for it.",
    "Enter your workflow name once on the first row — it becomes the checklist title.",
    "Click Build to assemble the reusable checklist.",
    "Copy the Markdown version into your docs or project tool and check stages off as you go.",
  ],
  methodology:
    "Your stages are assembled into a fixed checklist layout: a title, numbered checkbox lines, and owners. " +
    "Nothing is reordered, added, or advised — the stages, their order, and their owners are entirely yours. " +
    "The tool adds no AI and no workflow logic.",
  faqs: [
    {
      question: "What is the best ai content workflow checklist?",
      answer:
        "The best ai content workflow checklist covers your full pipeline — drafting, editing, publishing — with a named owner per stage. This tool turns your own stage list into exactly that structure.",
    },
    {
      question: "Is there a free ai content workflow checklist?",
      answer:
        "Yes — this tool is free with no signup and builds a reusable checklist from the stages you enter, in plain text and Markdown.",
    },
    {
      question: "How to use ai content workflow?",
      answer:
        "List your stages, assign a responsible role to each, then work the list top to bottom for every piece of content. Reuse the same checklist each time so nothing gets skipped.",
    },
    {
      question: "How does an ai content workflow checklist work?",
      answer:
        "You enter your workflow stages with owners; the tool formats them into a numbered checklist in plain text and Markdown. It adds no workflow logic of its own.",
    },
    {
      question: 'How does the ai content workflow checklist work?',
      answer:
        'Enter your details using the inputs above and the ai content workflow checklist calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai content workflow checklist free to use?',
      answer:
        'Yes - this ai content workflow checklist is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an ai content workflow checklist?',
      answer:
        'An ai content workflow checklist is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    "The tool structures your stage list only — it adds no AI, workflow logic, or advice.",
    "Stages are capped at 25 per checklist; order is preserved exactly as you entered it.",
  ],
  jsonLd: [
    {
      "@type": "SoftwareApplication",
      name: "AI Content Workflow Checklist 2026 – Free | HusnainBlogger",
      url: "https://husnainblogger.com/tools/ai-workflows/ai-workflow-checklist-builder/",
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
        { "@type": "ListItem", position: 3, name: "AI Workflow Tools", item: "https://husnainblogger.com/tools/ai-workflows/" },
        {
          "@type": "ListItem",
          position: 4,
          name: "AI Workflow Checklist Builder",
          item: "https://husnainblogger.com/tools/ai-workflows/ai-workflow-checklist-builder/",
        },
      ],
    },
  ],
};
