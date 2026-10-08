import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";
import type { BuilderField } from "../../../src/templates/types.ts";

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [
  {
    id: "lines",
    label: "FAQPage JSON-LD snippet",
    type: "list",
    description: "The ready-to-paste FAQPage JSON-LD, one line per item.",
  },
  {
    id: "html",
    label: "FAQ HTML block",
    type: "copy",
    description: "Your questions and answers as an HTML block for your page.",
  },
  {
    id: "markdown",
    label: "FAQ Markdown block",
    type: "copy",
    description: "Your questions and answers as a Markdown block.",
  },
];

export const itemFields: BuilderField[] = [
  { id: "question", label: "Question", type: "text", required: true, placeholder: "What is\u2026?" },
  { id: "answer", label: "Answer (your own words)", type: "text", placeholder: "Write your answer — the tool never writes it for you" },
];

const DESCRIPTION =
  "Format your own questions into a ready-to-paste faq generator for blog output — FAQ HTML, Markdown, and FAQPage JSON-LD schema markup. Free, no signup.";

export const content: ToolContent = {
  title: "FAQ Generator for Blog 2026 – Free Tool | HusnainBlogger",
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
      question: 'How does the faq generator for blog work?',
      answer:
        'Enter your details using the inputs above and the faq generator for blog calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the faq generator for blog free to use?',
      answer:
        'Yes - this faq generator for blog is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a faq generator for blog?',
      answer:
        'A faq generator for blog is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
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
