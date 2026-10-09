import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";

export const inputs: ToolInput[] = [
  {
    id: "serviceKeywords",
    label: "Service keywords",
    type: "textarea",
    required: true,
    placeholder: "e.g. logo design, brand identity\n(one per line or comma-separated)",
  },
  {
    id: "tone",
    label: "Tagline tone",
    type: "select",
    required: true,
    options: ["professional", "friendly", "bold"],
  },
  {
    id: "taglineCount",
    label: "How many taglines (1–30)",
    type: "number",
    required: false,
    placeholder: "10",
    validation: { min: 1, max: 30 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: "taglineIdeas",
    label: "Tagline ideas",
    type: "list",
    description:
    "Template-based tagline ideas built from your service keywords in the chosen tone.",
  },
];

const DESCRIPTION =
  'Sum up your value with these freelancer tagline ideas — sharp one-liners that tell clients exactly what you do best. Nail your homepage headline.';

export const content: ToolContent = {
  title: "Freelancer Tagline Ideas",
  description: DESCRIPTION,
  howTo: [
    "Enter your service keywords — one per line or comma-separated (e.g. logo design, copywriting).",
    "Pick a tone: professional, friendly, or bold.",
    "Choose how many taglines you want (1–30; defaults to 10).",
    "Review the ideas and shortlist the ones that sound like you.",
    "Before adopting one, search the web to make sure the tagline is not already in use by another brand.",
  ],
  methodology:
    "Pattern-based assembly from fixed templates — never AI copywriting. " +
    "Each tone has 8 fixed sentence patterns (24 total) with one slot for your service keyword; " +
    "your keywords are inserted verbatim into each pattern. That gives 8 taglines per keyword, " +
    "deduplicated and returned in the same fixed order every time.",
  examples: [
    {
      title: "Designer, professional tone",
      inputs: { serviceKeywords: "logo design", tone: "professional", taglineCount: 3 },
      note: "Results-focused lines like 'logo design for businesses that demand results.'",
    },
    {
      title: "Writer, friendly tone",
      inputs: { serviceKeywords: "copywriting", tone: "friendly" },
      note: "Warm lines like 'I make copywriting easy' and 'Great copywriting, zero headaches.'",
    },
    {
      title: "Marketer, bold tone",
      inputs: { serviceKeywords: "email marketing", tone: "bold", taglineCount: 4 },
      note: "Confident lines like 'email marketing that refuses to blend in.'",
    },
  ],
  faqs: [
    {
      question: "What is the best freelancer tagline ideas?",
      answer:
        "The best tagline is specific to your service and memorable to your clients — no tool can crown one winner. This generator gives you up to 30 template-based starting points in your chosen tone so you can shortlist and refine them yourself.",
    },
    {
      question: "Is there a free freelancer tagline ideas?",
      answer:
        "Yes — this tool is free with no signup. Enter your service keywords, pick professional, friendly, or bold tone, and get up to 30 tagline ideas instantly.",
    },
    {
      question: "How to use freelancer tagline?",
      answer:
        "Enter the services you offer, choose a tone that fits your brand, and set how many ideas you want. Use the results as a starting point, then rewrite your favorite in your own voice before publishing it.",
    },
    {
      question: "How does a freelancer tagline ideas work?",
      answer:
        "It is pattern-based, not AI: your keywords are inserted into 24 fixed sentence templates (8 per tone), producing 8 taglines per keyword. It does not check whether a tagline is already used by another brand, so verify before adopting one.",
    },
    {
      question: 'How does the freelancer tagline ideas work?',
      answer:
        'Enter your details using the inputs above and the freelancer tagline ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the freelancer tagline ideas free to use?',
      answer:
        'Yes - this freelancer tagline ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a freelancer tagline ideas?',
      answer:
        'A freelancer tagline ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    "Taglines are assembled from fixed templates — pattern-based, never AI-written.",
    "No brand-conflict checking: a generated tagline may already be in use, so verify before adopting one.",
    "At most 20 service keywords are used and at most 30 taglines are returned.",
  ],
  jsonLd: [
    {
      "@type": "SoftwareApplication",
      name: "Freelancer Tagline Ideas 2026 – Free Tool | HusnainBlogger",
      url: "https://husnainblogger.com/tools/creator-business/freelancer-tagline-generator/",
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
          name: "Creator Business Tools",
          item: "https://husnainblogger.com/tools/creator-business/",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Freelancer Tagline Generator",
          item: "https://husnainblogger.com/tools/creator-business/freelancer-tagline-generator/",
        },
      ],
    },
  ],
};
