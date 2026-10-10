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
    description:
    "The ordered chain with variable handoffs and prompt templates — copy it whole.",
  },
  {
    id: "warnings",
    label: "Variable warnings",
    type: "list",
    description:
    "Undefined or malformed {variables} found in your step prompts.",
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
  'Chain prompts like a pro with this AI prompt chain builder — link steps into workflows that produce consistent, quality results. Reuse chains every.';

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
      question: 'What is an ai prompt chain builder?',
      answer:
        'An ai prompt chain builder is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'What is a prompt chain?',
      answer: 'A sequence where each AI prompt\'s output feeds into the next prompt\'s input. For example: prompt 1 generates an outline, prompt 2 expands each section, prompt 3 polishes the tone.',
    },
    {
      question: 'When should I use prompt chains vs single prompts?',
      answer: 'Use chains for complex tasks with multiple distinct steps. Single prompts work for simple tasks. If your prompt has more than 3 instructions, consider splitting it into a chain.',
    },
    {
      question: 'How do I handle errors in the middle of a chain?',
      answer: 'Build validation checkpoints between steps. If step 2\'s output looks wrong, don\'t feed it to step 3 — add a review or retry logic at each handoff point.',
    },
    {
      question: 'What\'s the ideal chain length?',
      answer: 'Three to five steps. Longer chains accumulate errors and become hard to debug. If you need more steps, consider whether the task should be split into separate workflows.',
    },
      {
      question: 'Can I save or export my ai prompt chain builder?',
      answer: 'Yes, copy the result or use your browser\'s print-to-PDF. Everything stays on your device — nothing is uploaded or stored.',
    },
    {
      question: 'How do I build ai prompt chain builder?',
      answer: 'Fill in the fields with your details and the builder assembles everything into a polished result. Edit any section until it feels right.',
    },
  ],
  assumptions: [
    "Step prompts are fixed templates you edit — the tool writes no prompt content for you.",
    "Chains need 2–12 steps; {goal} and each step's output variable are the only auto-defined variables.",
    "Undefined variables are reported as warnings; the chain never invents their meaning.",
  ],
  jsonLd: [],
};
