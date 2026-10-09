import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";
import type { BuilderField } from "../../../src/templates/types.ts";

const TOOL_URL = "https://husnainblogger.com/tools/ai-workflows/prompt-chain-workflow-builder/";

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [
  {
    id: "chain",
    label: "Prompt chain (copy)",
    type: "copy",
    description: "The ordered chain with variable handoffs and prompt templates — copy it whole.",
  },
  {
    id: "warnings",
    label: "Variable warnings",
    type: "list",
    description: "Undefined or malformed {variables} found in your step prompts.",
  },
];

export const itemFields: BuilderField[] = [
  {
    id: "chainGoal",
    label: "Chain goal",
    type: "text",
    placeholder: "e.g. Write a product review (fill once)",
  },
  {
    id: "stepName",
    label: "Step name",
    type: "text",
    required: true,
    placeholder: "e.g. Outline",
  },
  {
    id: "stepPrompt",
    label: "Step prompt (optional)",
    type: "text",
    placeholder: "Your template — may use {variables}; blank uses a fixed template",
  },
];

const DESCRIPTION =
  "Free ai prompt chain builder 2026: The ordered chain with variable handoffs and prompt templates — copy it whole. Fast, private, no signup - try it now!";

export const content: ToolContent = {
  title: "AI Prompt Chain Builder",
  description: DESCRIPTION,
  howTo: [
    "Add one row per step, in the order the steps run.",
    "Enter each step's name; optionally write its prompt template using {variables}.",
    "Fill in your chain goal once on the first row — it becomes the {goal} variable.",
    "Click Build to order the steps and wire each step's output into the next step's inputs.",
    "Check the warnings panel for undefined {variables} and fix them before you use the chain.",
    "Copy the full chain and edit each step's prompt template with your own instructions.",
  ],
  methodology:
    "Your steps are ordered exactly as entered (2–12 steps). {goal} is always defined; each step defines one " +
    "output variable derived from its name (e.g. {outline_output}), and each step lists the previous step's output " +
    "as its input. Any {variable} in your prompts that no step defines is reported as a warning, never silently " +
    "resolved. Blank prompts get a fixed generic template — step prompts are templates you edit, not AI-written.",
  faqs: [
    {
      question: "What is the best ai prompt chain builder?",
      answer:
        "The best ai prompt chain builder orders your steps, wires {variable} handoffs between them, and flags undefined variables before you run anything. This free tool does exactly that for 2–12 step chains.",
    },
    {
      question: "Is there a free ai prompt chain builder?",
      answer:
        "Yes — this AI prompt chain builder is free with no signup. Define your steps, get ordered prompt templates with variable handoffs, and copy the chain for use anywhere.",
    },
    {
      question: "How to build ai prompt chain?",
      answer:
        "Break your workflow into steps, name what each step produces, and pass that output as the next step's input with {variables}. This tool wires those handoffs for you and warns about variables that are not defined anywhere in the chain.",
    },
    {
      question: "How does an ai prompt chain builder work?",
      answer:
        "You enter your steps in order with optional prompt templates; the tool assigns each step an output variable, lists every step's inputs and outputs, and reports undefined variables in a warnings panel. The prompts are fixed templates you edit — nothing is AI-written.",
    },
    {
      question: 'How does the ai prompt chain builder work?',
      answer:
        'Enter your details using the inputs above and the ai prompt chain builder calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai prompt chain builder free to use?',
      answer:
        'Yes - this ai prompt chain builder is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an ai prompt chain builder?',
      answer:
        'An ai prompt chain builder is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    "Step prompts are fixed templates you edit — the tool writes no prompt content for you.",
    "Chains need 2–12 steps; {goal} and each step's output variable are the only auto-defined variables.",
    "Undefined variables are reported as warnings; the chain never invents their meaning.",
  ],
  jsonLd: [
    {
      "@type": "SoftwareApplication",
      name: "AI Prompt Chain Builder 2026 – Free Tool | HusnainBlogger",
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
          name: "Prompt Chain Workflow Builder",
          item: TOOL_URL,
        },
      ],
    },
  ],
};
