import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";
import { TRACKER_ITEMS } from "./logic.ts";

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [];

export const trackerMode: "checklist" = "checklist";

export const trackerItems = TRACKER_ITEMS;

const DESCRIPTION =
  "Run this proven blog post publishing checklist before you hit publish — SEO, formatting, links, and QA checks with progress tracking. Free, no signup.";

export const content: ToolContent = {
  title: "Blog Post Publishing Checklist",
  description: DESCRIPTION,
  howTo: [
    "Open the checklist before you publish any post.",
    "Work through each item top to bottom, checking it off as you finish.",
    "Fix any item you cannot honestly check off, then re-check it.",
    "Watch the progress bar — publish only when it reads 100%.",
    "Your progress is saved in your browser automatically.",
  ],
  methodology:
    "A fixed, human-written list of 18 pre-publish checks covering SEO basics, formatting, images, links, and QA. " +
    "The tracker counts your checked items and shows your progress — nothing is generated, estimated, or personalized.",
  faqs: [
    {
      question: "What is the best blog post publishing checklist?",
      answer:
        "The best blog post publishing checklist covers the title tag, meta description, headings, images, internal and external links, and proofreading before every publish. This tool gives you exactly that as an interactive 18-item list.",
    },
    {
      question: "Is there a free blog post publishing checklist?",
      answer:
        "Yes — this interactive checklist is free with no signup, and your progress is saved in your browser as you check items off.",
    },
    {
      question: "How to use blog post publishing?",
      answer:
        "Open this checklist before publishing, check off each item as you complete it, and only publish when you reach 100%. Use it for every post so quality stays consistent.",
    },
    {
      question: "How does a blog post publishing checklist work?",
      answer:
        "You tick off each fixed checklist item; the tool tracks your progress and saves it in your browser's local storage. The list itself never changes.",
    },
    {
      question: 'How does the blog post publishing checklist work?',
      answer:
        'Enter your details using the inputs above and the blog post publishing checklist calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the blog post publishing checklist free to use?',
      answer:
        'Yes - this blog post publishing checklist is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a blog post publishing checklist?',
      answer:
        'A blog post publishing checklist is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    "A fixed, general-purpose list — it is not SEO advice tailored to your site or niche.",
    "Progress is stored in your browser only; clearing site data resets it.",
  ],
  jsonLd: [
    {
      "@type": "SoftwareApplication",
      name: "Blog Post Publishing Checklist 2026 – Free | HusnainBlogger",
      url: "https://husnainblogger.com/tools/ai-workflows/blog-publishing-checklist/",
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
          name: "Blog Publishing Checklist",
          item: "https://husnainblogger.com/tools/ai-workflows/blog-publishing-checklist/",
        },
      ],
    },
  ],
};
