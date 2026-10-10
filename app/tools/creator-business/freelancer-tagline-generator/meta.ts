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
      question: 'What is a freelancer tagline ideas?',
      answer:
        'A freelancer tagline ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'What makes a tagline effective?',
      answer: 'It communicates what you do and who you serve in under 10 words. \'I help SaaS startups write onboarding emails that convert\' beats \'Creative wordsmith crafting compelling narratives.\'',
    },
    {
      question: 'Where should I use my tagline?',
      answer: 'Your website header, LinkedIn headline, email signature, proposals, and social bios. Consistency builds recognition — use the same tagline everywhere.',
    },
    {
      question: 'Should my tagline mention my niche?',
      answer: 'Yes, if you have one. Specificity attracts ideal clients and repels bad fits. \'Email copywriter for fitness coaches\' will outperform generic alternatives.',
    },
    {
      question: 'How often should I update my tagline?',
      answer: 'When your services, audience, or positioning changes. Otherwise, keep it stable — changing too often confuses your audience.',
    },
      {
      question: 'What makes a good freelancer tagline ideas?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
    {
      question: 'How do I create freelancer tagline ideas?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
  ],
  assumptions: [
    "Taglines are assembled from fixed templates — pattern-based, never AI-written.",
    "No brand-conflict checking: a generated tagline may already be in use, so verify before adopting one.",
    "At most 20 service keywords are used and at most 30 taglines are returned.",
  ],
  jsonLd: [],
};
