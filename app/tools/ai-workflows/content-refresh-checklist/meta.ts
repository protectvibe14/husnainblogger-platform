import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";

export const inputs: ToolInput[] = [
  {
    id: "contentType",
    label: "Content type",
    type: "select",
    required: true,
    options: ["post", "video", "page"],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: "checklist",
    label: "Refresh checklist",
    type: "list",
    description: "The fixed decision-tree checklist for your content type.",
  },
];

const DESCRIPTION =
  "Pick a content type and get a fixed content refresh checklist with keep, update, merge, or delete guidance for old posts, videos, and pages. Free, no signup.";

export const content: ToolContent = {
  title: "Content Refresh Checklist",
  description: DESCRIPTION,
  howTo: [
    "Choose the type of content you are refreshing: post, video, or page.",
    "Click Run to get the fixed checklist for that type.",
    "Work through each step — traffic, accuracy, and intent checks come first.",
    "Finish with the final step: decide KEEP, UPDATE, MERGE, or DELETE.",
  ],
  methodology:
    "A fixed decision tree: your content type selects one of three human-written checklists " +
    "(post: 12 steps, video: 11 steps, page: 10 steps). Nothing is generated at runtime — the same " +
    "type always returns the same checklist.",
  faqs: [
    {
      question: "What is the best content refresh checklist?",
      answer:
        "The best content refresh checklist starts with traffic, accuracy, and intent checks, then ends with a clear decision: keep, update, merge, or delete. This tool gives you that flow for posts, videos, and pages.",
    },
    {
      question: "Is there a free content refresh checklist?",
      answer: "Yes — this checklist is free with no signup. Pick a content type and work the fixed list.",
    },
    {
      question: "How to use content refresh?",
      answer:
        "Pick whether you are refreshing a post, video, or page, then work the fixed checklist top to bottom and make the final keep, update, merge, or delete call.",
    },
    {
      question: "How does a content refresh checklist work?",
      answer:
        "You select a content type; the tool returns the matching fixed checklist branch. No content is generated — the checklist is the same every time for the same type.",
    },
    {
      question: 'How does the content refresh checklist work?',
      answer:
        'Enter your details using the inputs above and the content refresh checklist calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the content refresh checklist free to use?',
      answer:
        'Yes - this content refresh checklist is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a content refresh checklist?',
      answer:
        'A content refresh checklist is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    "A fixed checklist, not an AI audit — it cannot look at your analytics or your content.",
    "Traffic checks assume you can verify visits yourself (for example Search Console or YouTube Studio).",
  ],
  jsonLd: [
    {
      "@type": "SoftwareApplication",
      name: "Content Refresh Checklist 2026 – Free Tool | HusnainBlogger",
      url: "https://husnainblogger.com/tools/ai-workflows/content-refresh-checklist/",
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
          name: "Content Refresh Checklist",
          item: "https://husnainblogger.com/tools/ai-workflows/content-refresh-checklist/",
        },
      ],
    },
  ],
};
