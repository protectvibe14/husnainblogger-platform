import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";

export const inputs: ToolInput[] = [
  {
    id: "keywords",
    label: "Keywords",
    type: "textarea",
    required: true,
    placeholder: "e.g. pixel, design, bright\n(one per line or comma-separated)",
  },
  {
    id: "style",
    label: "Name style",
    type: "select",
    required: true,
    options: ["professional", "playful", "minimal"],
  },
  {
    id: "nameCount",
    label: "How many names (1–50)",
    type: "number",
    required: false,
    placeholder: "10",
    validation: { min: 1, max: 50 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: "nameIdeas",
    label: "Business name ideas",
    type: "list",
    description:
    "Template-based name combinations from your keywords and the chosen style's word bank.",
  },
  {
    id: "availabilityNote",
    label: "Availability reminder",
    type: "text",
    description:
    "Reminder that domain and trademark availability are not checked — verify yourself.",
  },
];

const DESCRIPTION =
  'Name your freelance business with these freelance business name ideas — memorable, brandable names that fit your services. Find a name that fits you.';

export const content: ToolContent = {
  title: "Freelance Business Name Ideas",
  description: DESCRIPTION,
  howTo: [
    "Enter keywords that describe your work — one per line or comma-separated (e.g. pixel, design, bright).",
    "Pick a name style: professional, playful, or minimal.",
    "Choose how many name ideas you want (1–50; defaults to 10).",
    "Browse the combinations and shortlist your favorites.",
    "Check domain and trademark availability yourself before using any name — the tool cannot do this for you.",
  ],
  methodology:
    "Template-based assembly from fixed word banks — never AI creativity. " +
    "Each style has a bank of 10 fixed suffix words (30 total across professional, playful, and minimal), " +
    "combined with your keywords through 4 fixed patterns ('{Keyword} {Suffix}', '{Suffix} {Keyword}', " +
    "'{Keyword} & {Suffix}', and a merged one-word form). That gives 40 possible combinations per keyword; " +
    "duplicates are removed and results are returned in the same fixed order every time.",
  examples: [
    {
      title: "Design freelancer, professional style",
      inputs: { keywords: "pixel, design", style: "professional", nameCount: 5 },
      note: "Combinations like Pixel Studio, Studio Pixel, and Pixel & Studio.",
    },
    {
      title: "Playful brand for a writer",
      inputs: { keywords: "word", style: "playful", nameCount: 6 },
      note: "Lighter combinations such as Word Squad, Squad Word, and WordSquad.",
    },
    {
      title: "Minimal one-word feel",
      inputs: { keywords: "north", style: "minimal" },
      note: "Ten minimal combinations by default, including merged forms like NorthStudio.",
    },
  ],
  faqs: [
    {
      question: "What is the best freelance business name ideas?",
      answer:
        "The best name is short, memorable, and easy to spell in your niche — no generator can pick it for you. This tool gives you up to 50 template-based starting points from your keywords so you can shortlist and judge them yourself.",
    },
    {
      question: "Is there a free freelance business name ideas?",
      answer:
        "Yes — this tool is free with no signup. Enter keywords, choose professional, playful, or minimal style, and get up to 50 name combinations instantly.",
    },
    {
      question: "How to use freelance business name?",
      answer:
        "Type keywords that describe your work, pick a style, and set how many ideas you want. Review the list, shortlist favorites, then check domain registrars and your country's trademark database before committing to one.",
    },
    {
      question: "How does a freelance business name ideas work?",
      answer:
        "It is template-based, not AI: your keywords are combined with a fixed bank of 30 suffix words (10 per style) through 4 fixed patterns, producing up to 40 combinations per keyword. It cannot check whether a name is taken — you must verify domain and trademark availability yourself.",
    },
    {
      question: 'How does the freelance business name ideas work?',
      answer:
        'Enter your details using the inputs above and the freelance business name ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the freelance business name ideas free to use?',
      answer:
        'Yes - this freelance business name ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a freelance business name ideas?',
      answer:
        'A freelance business name ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    "Names are assembled from fixed word banks and patterns — template-based, never AI-generated.",
    "The tool cannot check domain or trademark availability; every result carries a reminder to verify yourself.",
    "At most 20 keywords are used and at most 50 names are returned, even if you ask for more combinations than exist.",
  ],
  jsonLd: [],
};
