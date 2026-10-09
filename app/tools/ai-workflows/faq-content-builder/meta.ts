import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";
import type { BuilderField } from "../../../src/templates/types.ts";

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [
  {
    id: "lines",
    label: "FAQPage JSON-LD snippet",
    type: "list",
    description:
    "The ready-to-paste FAQPage JSON-LD, one line per item.",
  },
  {
    id: "html",
    label: "FAQ HTML block",
    type: "copy",
    description:
    "Your questions and answers as an HTML block for your page.",
  },
  {
    id: "markdown",
    label: "FAQ Markdown block",
    type: "copy",
    description:
    "Your questions and answers as a Markdown block.",
  },
];

export const itemFields: BuilderField[] = [
  { id: "question", label: "Question", type: "text", required: true, placeholder: "What is\u2026?" },
  { id: "answer", label: "Answer (your own words)", type: "text", placeholder: "Write your answer — the tool never writes it for you" },
];

const DESCRIPTION =
  'Answer real questions with this FAQ generator for blogs — turn search queries into helpful Q&A sections readers actually love. Add Q&A readers love.';

export const content: ToolContent = {
  title: "FAQ Generator for Blog",
  description: DESCRIPTION,
  howTo: [
    "Add one row per question (at least 2, at most 20).",
    "Enter each question and write the answer in your own words.",
    "Leave an answer blank only if you plan to fill it in later — it becomes a labeled placeholder.",
    "Click Build to format everything into FAQ markup.",
    "Copy the JSON-LD snippet into your page to be eligible for FAQ rich results.",
  ],
  methodology:
    "Your questions and answers are assembled into three formats: an FAQ HTML block, a Markdown block, " +
    "and a FAQPage JSON-LD snippet built with JSON encoding so quotes and special characters stay valid. " +
    "The tool never writes answers for you and performs no AI Q&A.",
  faqs: [
    {
      question: "What is the best faq generator for blog?",
      answer:
        "The best faq generator for blog output gives you valid FAQPage schema you can paste straight into your page. This tool formats your own questions and answers into JSON-LD, HTML, and Markdown — free.",
    },
    {
      question: "Is there a free faq generator for blog?",
      answer: "Yes — this tool is free with no signup.",
    },
    {
      question: "How to generate faq generator for blog?",
      answer:
        "Add your questions, write your own answers, and the tool formats them into FAQ markup. It does not write answers for you.",
    },
    {
      question: "How does a faq generator for blog work?",
      answer:
        "You enter questions with your own answers; the tool assembles them into an HTML block, a Markdown block, and a FAQPage JSON-LD snippet. Blank answers become labeled fill-in slots.",
    },
    {
      question: 'Can I use the FAQPage schema on pages other than blog posts?',
      answer:
        'Yes — FAQPage markup works on any page where the questions and answers are actually visible to readers, like product, service, or help pages. The rule is simple: the marked-up content must appear on the page itself, not be hidden. Paste the JSON-LD snippet plus the HTML block into your page and you are set.',
    },
    {
      question: 'What happens if I leave an answer blank?',
      answer:
        'Blank answers become clearly labeled fill-in slots in the output, so your schema stays valid while you finish writing. The tool never writes answers for you — you supply the questions and your own answers, and it handles the formatting into JSON-LD, HTML, and Markdown.',
    },
    {
      question: 'Why three output formats — JSON-LD, HTML, and Markdown?',
      answer:
        'Each has a job. The JSON-LD snippet is the structured data search engines read; the HTML block is the visible FAQ section for your page; the Markdown block is for editors, docs, or static-site workflows. Copy whichever your setup needs — most bloggers paste the JSON-LD in the head and the HTML into the article body.',
    },
  ],
  assumptions: [
    "The tool formats your questions only — it writes no answers and performs no AI Q&A.",
    "Valid JSON-LD improves eligibility for FAQ rich results but does not guarantee them.",
  ],
  jsonLd: [
    {
      "@type": "SoftwareApplication",
      name: "FAQ Generator for Blog 2026 – Free Tool | HusnainBlogger",
      url: "https://husnainblogger.com/tools/ai-workflows/faq-content-builder/",
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
          name: "FAQ Content Builder",
          item: "https://husnainblogger.com/tools/ai-workflows/faq-content-builder/",
        },
      ],
    },
  ],
};
