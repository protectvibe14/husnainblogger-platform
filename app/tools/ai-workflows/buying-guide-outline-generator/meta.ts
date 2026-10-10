import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";

const TOOL_URL = "https://husnainblogger.com/tools/ai-workflows/buying-guide-outline-generator/";

export const inputs: ToolInput[] = [
  {
    id: "categoryName",
    label: "Product category",
    type: "text",
    required: true,
    placeholder: "e.g. robot vacuum cleaners",
  },
  {
    id: "budgetTiers",
    label: "Budget tiers (one per line)",
    type: "textarea",
    required: false,
    placeholder: "Under $300\n$300–$600\nPremium",
  },
];

export const outputs: ToolOutput[] = [
  {
    id: "outline",
    label: "Buying guide outline (copy)",
    type: "copy",
    description:
    "The full outline with your category and tier slots — copy it whole.",
  },
  {
    id: "sections",
    label: "Section headings",
    type: "list",
    description:
    "Numbered list of the section headings for quick reference.",
  },
  {
    id: "criteria",
    label: "Criteria checklist",
    type: "list",
    description:
    "The 6 fixed buying criteria with your category filled in.",
  },
];

const DESCRIPTION =
  'Guide buyers well with this buying guide template — comparisons, budgets, and top picks organized for confident decisions. Help readers decide confidently.';

export const content: ToolContent = {
  title: "Buying Guide Template",
  description: DESCRIPTION,
  howTo: [
    "Enter your product category (required).",
    "List your budget tiers, one per line — skip this to use default Budget / Mid-range / Premium slots.",
    "Run the tool to get a full guide structure: intro, how to choose, one pick section per tier, and closing sections.",
    "Follow each section's write prompt and fill the pick slots with products you researched or tested.",
    "Work through the 6-criteria checklist for every pick so nothing important gets skipped.",
    "Copy the full outline and write your guide top to bottom.",
  ],
  methodology:
    "The tool assembles a fixed structure: 5 fixed sections (what the guide covers, how to choose, features worth " +
    "paying for, what to avoid, final recommendation) plus one pick section per budget tier, and a fixed 6-criteria " +
    "checklist with your category substituted in. Your tiers are used verbatim; blank tiers get marked default slots. " +
    "No product recommendations are made or invented — pick slots are brackets you fill after real research or testing.",
  examples: [
    {
      title: "Home appliances",
      inputs: { categoryName: "robot vacuum cleaners", budgetTiers: "Under $300\n$300–$600\nPremium" },
      note: "Three custom price tiers, one pick section each.",
    },
    {
      title: "No tiers entered",
      inputs: { categoryName: "espresso machines", budgetTiers: "" },
      note: "Default Budget / Mid-range / Premium slots are used and marked as defaults.",
    },
  ],
  faqs: [
    {
      question: "What is the best buying guide template?",
      answer:
        "The best buying guide template has a clear criteria checklist, one pick section per budget tier, and honest buying advice — with every pick backed by real research. This free tool generates exactly that structure for any product category.",
    },
    {
      question: "Is there a free buying guide template?",
      answer:
        "Yes — this buying guide outline generator is completely free with no signup. Enter your category and budget tiers and get the full outline with tier slots and a criteria checklist instantly.",
    },
    {
      question: "How to use buying?",
      answer:
        "List your budget tiers, then research or test products for each tier before writing a word. Fill each pick slot with a real verdict and trade-off versus the next tier up — never invent a pick, because readers act on these recommendations.",
    },
    {
      question: "How does a buying guide template work?",
      answer:
        "You enter your product category and budget tiers; the tool builds the guide's structure — intro, criteria, one section per tier, what to avoid, and final recommendation — with empty pick slots. The recommendations themselves are yours to make after real research or testing.",
    },
    {
      question: 'How does the buying guide template work?',
      answer:
        'Enter your details using the inputs above and the buying guide template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the buying guide template free to use?',
      answer:
        'Yes - this buying guide template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a buying guide template?',
      answer:
        'A buying guide template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    "The tool structures your category and tiers only — no product recommendations are made or invented.",
    "Tiers are used verbatim (max 8); blank tiers produce marked default Budget / Mid-range / Premium slots.",
    "The criteria checklist is fixed at 6 criteria; publish only after real research or testing.",
  ],
  jsonLd: [
  ],
};
