import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";

export const inputs: ToolInput[] = [
  {
    id: "sourceFormat",
    label: "Source format",
    type: "select",
    required: true,
    options: [
      "blog-post",
      "video",
      "podcast",
      "newsletter",
      "webinar",
      "ebook",
      "thread",
      "short-video",
    ],
  },
  {
    id: "targetFormats",
    label: "Target formats",
    type: "text",
    required: true,
    placeholder: "e.g. newsletter, short-video, thread (comma-separated)",
  },
];

export const outputs: ToolOutput[] = [
  {
    id: "stages",
    label: "Stage pipeline",
    type: "table",
    description:
    "Ordered per-format task list with order numbers and dependencies.",
  },
  {
    id: "overview",
    label: "Plan overview",
    type: "copy",
    description:
    "A one-paragraph summary of the repurposing pipeline, ready to copy.",
  },
];

const DESCRIPTION =
  "Plan your content repurposing workflow in minutes. Choose a source and target formats to get an ordered task pipeline with dependencies. Start free.";

export const content: ToolContent = {
  title: "Content Repurposing Workflow",
  description: DESCRIPTION,
  howTo: [
    "Choose the format you already have (source format).",
    "Enter the formats you want to create, comma-separated (target formats).",
    "The source format cannot also be a target — pick different ones.",
    "Review the stage pipeline: prep tasks, one repurpose stage per format, then wrap-up.",
    "Follow the tasks in order — each lists what it depends on.",
  ],
  methodology:
    "The tool maps your formats onto a fixed pipeline template: 3 prep tasks (audit, brief, angles), " +
    "4 tasks per target format (extract, adapt, hook + CTA, publish), and 3 wrap-up tasks " +
    "(cross-link, format-fit review, learnings). Dependencies are derived from fixed rules. " +
    "No content transformation is performed — you do the adapting.",
  examples: [
    {
      title: "Blog post to newsletter and shorts",
      inputs: { sourceFormat: "blog-post", targetFormats: "newsletter, short-video" },
      note: "Get a 14-task pipeline with per-format stages.",
    },
    {
      title: "Video to thread",
      inputs: { sourceFormat: "video", targetFormats: "thread" },
      note: "Get a 10-task pipeline for one target format.",
    },
  ],
  faqs: [
    {
      question: "What is the best content repurposing workflow?",
      answer:
        "The best content repurposing workflow breaks the job into ordered stages: prep, one repurpose stage per target format, and wrap-up. This tool builds that pipeline for your exact source and target formats — free.",
    },
    {
      question: "Is there a free content repurposing workflow?",
      answer:
        "Yes — this tool is free with no signup. Pick a source format and target formats to get an ordered task table with dependencies.",
    },
    {
      question: "How to use content repurposing workflow?",
      answer:
        "Choose the content format you already have, list the formats you want to create, and the tool outputs an ordered pipeline: what to do first, per-format task lists, and what each task depends on.",
    },
    {
      question: "How does a content repurposing workflow work?",
      answer:
        "Your formats are mapped onto a fixed pipeline template — prep tasks, then 4 tasks per target format (extract, adapt, hook + CTA, publish), then wrap-up. The tool plans the work; it does not transform any content itself.",
    },
    {
      question: 'How does the content repurposing workflow work?',
      answer:
        'Enter your details using the inputs above and the content repurposing workflow calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the content repurposing workflow free to use?',
      answer:
        'Yes - this content repurposing workflow is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a content repurposing workflow?',
      answer:
        'A content repurposing workflow is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    "The pipeline is a fixed template — it maps formats to tasks but never transforms your content.",
    "Task ordering assumes you complete each task before starting its dependents.",
    "Supported formats are fixed to the 8 listed; the tool adds no platform-specific rules.",
  ],
  jsonLd: [
    {
      "@type": "SoftwareApplication",
      name: "Content Repurposing Workflow 2026 – Free | HusnainBlogger",
      url: "https://husnainblogger.com/tools/ai-workflows/content-repurposing-workflow-planner/",
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
          name: "Content Repurposing Workflow Planner",
          item: "https://husnainblogger.com/tools/ai-workflows/content-repurposing-workflow-planner/",
        },
      ],
    },
  ],
};
