import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";
import type { BuilderField } from "../../../src/templates/types.ts";

const TOOL_URL = "https://husnainblogger.com/tools/ai-workflows/editorial-style-guide-builder/";

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [
  {
    id: "guide",
    label: "Style guide (copy)",
    type: "copy",
    description: "The compiled style-guide document in Markdown — copy it into your docs.",
  },
  {
    id: "sections",
    label: "Section headings",
    type: "list",
    description: "The guide's section headings in document order.",
  },
];

export const itemFields: BuilderField[] = [
  {
    id: "guideName",
    label: "Guide name",
    type: "text",
    placeholder: "Acme Blog Style Guide (fill once — becomes the title)",
  },
  {
    id: "section",
    label: "Section",
    type: "text",
    required: true,
    placeholder: "e.g. Voice & Tone",
  },
  {
    id: "rule",
    label: "Your rule",
    type: "text",
    required: true,
    placeholder: "e.g. Second person, contractions allowed",
  },
  {
    id: "example",
    label: "Example (optional)",
    type: "text",
    placeholder: "e.g. do → 'You can'; don't → 'It can be done'",
  },
];

const DESCRIPTION =
  "Free editorial style guide template 2026: The compiled style-guide document in Markdown — copy it into your docs. Fast, private, no signup - try it now!";

export const content: ToolContent = {
  title: "Editorial Style Guide Template',
  description: DESCRIPTION,
  howTo: [
    "Add one row per style rule you want to set.",
    "Enter the section (e.g. Voice & Tone), your rule, and an optional example.",
    "Include at least one rule for the Voice & Tone section — every guide starts with tone.",
    "Fill in your guide name once on the first row — it becomes the document title.",
    "Click Build to compile your answers into a formatted style-guide document.",
    "Copy the Markdown version into your docs; unanswered sections are marked Decide later.",
  ],
  methodology:
    "Your answers are compiled against a fixed 6-section questionnaire (Voice & Tone, Casing & Capitalization, " +
    "Numbers & Units, Citations & Sources, Banned Words & Phrases, Grammar & Punctuation). Sections follow your " +
    "first-appearance order; rules keep your wording verbatim. Core sections you leave unanswered get an honest " +
    '"Decide later" placeholder — the tool never invents a standard for you.',
  faqs: [
    {
      question: "What is the best editorial style guide template?",
      answer:
        "The best editorial style guide template covers tone, casing, numbers, citations, banned words, and grammar — and it reflects your own standards, not someone else's. This tool compiles your answers into exactly that structure.",
    },
    {
      question: "Is there a free editorial style guide template?",
      answer:
        "Yes — this editorial style guide builder is free with no signup. Answer the questionnaire rows and get a formatted, copy-ready style guide in seconds.",
    },
    {
      question: "How to use editorial style?",
      answer:
        "Write down your rules for tone, casing, units, citations, and banned words in one place, then apply them to every piece you publish. This tool turns those answers into a single reference document your whole team can follow.",
    },
    {
      question: "How does an editorial style guide template work?",
      answer:
        "You enter your own rules per section; the tool formats them into a numbered, Markdown-ready style guide. It compiles your answers — it never chooses standards for you, and unanswered sections are marked Decide later.",
    },
    {
      question: 'How does the editorial style guide template work?',
      answer:
        'Enter your details using the inputs above and the editorial style guide template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the editorial style guide template free to use?',
      answer:
        'Yes - this editorial style guide template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an editorial style guide template?',
      answer:
        'An editorial style guide template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    "The tool compiles your answers only — it sets no standards, defaults, or recommendations.",
    "Unanswered core sections show a Decide later placeholder; they are not filled in for you.",
    "At least one rule for the Voice & Tone section is required; rules are capped at 40 per guide.",
  ],
  jsonLd: [
    {
      "@type": "SoftwareApplication",
      name: "Editorial Style Guide Template 2026 – Free | HusnainBlogger",
      url: TOOL_URL,
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
        {
          "@type": "ListItem",
          position: 3,
          name: "AI Workflow Tools",
          item: "https://husnainblogger.com/tools/ai-workflows/",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Editorial Style Guide Builder",
          item: TOOL_URL,
        },
      ],
    },
  ],
};
