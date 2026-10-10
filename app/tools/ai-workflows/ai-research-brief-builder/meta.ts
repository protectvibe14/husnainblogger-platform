import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";
import type { BuilderField } from "../../../src/templates/types.ts";

const TOOL_URL = "https://husnainblogger.com/tools/ai-workflows/ai-research-brief-builder/";

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [
  {
    id: "brief",
    label: "Research brief (copy)",
    type: "copy",
    description:
    "The full brief — sub-questions, source checklist, verification steps — in Markdown.",
  },
  {
    id: "subQuestions",
    label: "Sub-questions",
    type: "list",
    description:
    "The sub-questions to answer for your research question.",
  },
  {
    id: "verification",
    label: "Verification steps",
    type: "list",
    description:
    "The verification checklist matched to your chosen depth.",
  },
];

export const itemFields: BuilderField[] = [
  {
    id: "researchQuestion",
    label: "Research question",
    type: "text",
    required: true,
    placeholder: "e.g. Are standing desks worth it? (fill once)",
  },
  {
    id: "depth",
    label: "Depth",
    type: "text",
    placeholder: "quick, standard, or deep (fill once; blank = standard)",
  },
  {
    id: "sourceType",
    label: "Source type",
    type: "text",
    placeholder: "e.g. Industry publications (one per row)",
  },
];

const DESCRIPTION =
  'Research faster with this AI research prompt builder — structured briefs that pull sharper, more useful answers from any model. Get structured answers.';

export const content: ToolContent = {
  title: "AI Research Prompt",
  description: DESCRIPTION,
  howTo: [
    "Enter your research question once on the first row — it is required.",
    "Set the depth: quick, standard, or deep (blank defaults to standard).",
    "Add one row per source type you plan to consult (optional).",
    "Click Build to get your brief: sub-questions, source checklist, and verification steps.",
    "Work through the sub-questions top to bottom, then run every claim past the verification steps.",
    "Copy the Markdown brief into your docs and track your sources as you go.",
  ],
  methodology:
    "Your question is structured against fixed banks: 4/6/8 sub-question templates and 3/5/7 verification steps " +
    "for quick/standard/deep depth. The source checklist uses your own source rows; when you add none, 5 suggested " +
    "starting points are shown and labeled as suggestions. The tool performs no research and cites no sources — " +
    "every fact must be found and verified by you.",
  faqs: [
    {
      question: "What is the best ai research prompt?",
      answer:
        "The best ai research prompt turns a vague question into answerable sub-questions, a source checklist, and verification steps. This free tool builds exactly that brief from your question in seconds.",
    },
    {
      question: "Is there a free ai research prompt?",
      answer:
        "Yes — this AI research brief builder is free with no signup. Enter your research question, pick a depth, and get a structured brief with sub-questions and verification steps.",
    },
    {
      question: "How to use ai research prompt?",
      answer:
        "Enter your research question, choose quick, standard, or deep depth, and list the source types you plan to use. Work the resulting brief top to bottom: answer each sub-question, then verify every claim against the checklist.",
    },
    {
      question: "How does an ai research prompt work?",
      answer:
        "It structures your question into a brief instead of doing research for you. This tool assembles fixed sub-question templates around your question, adds a source checklist and verification steps, and performs no research and cites no sources itself.",
    },
    {
      question: 'What is an ai research prompt?',
      answer:
        'An ai research prompt is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'What should a research brief include?',
      answer: 'A solid research brief covers your topic, target audience, key questions to answer, preferred sources, scope boundaries, and deliverable format. This tool structures all of these into a clear brief you can follow or hand to a researcher.',
    },
    {
      question: 'How detailed should my research brief be?',
      answer: 'Aim for one page covering the essentials: what you need to learn, why it matters, and what good looks like. Too vague and research wanders; too detailed and you constrain discovery. This tool finds the right balance.',
    },
    {
      question: 'Can I use this for client research projects?',
      answer: 'Yes. The generated brief works as a project scoping document — share it with clients to align on research goals before you start, which prevents scope creep and revision cycles.',
    },
    {
      question: 'Does this work for academic research?',
      answer: 'The structure adapts well to academic contexts. Define your thesis question, literature scope, and methodology needs in the inputs, and the brief will organize them into a research plan.',
    },
      {
      question: 'Can I save or export my ai research prompt?',
      answer: 'Yes, copy the result or use your browser\'s print-to-PDF. Everything stays on your device — nothing is uploaded or stored.',
    },
    {
      question: 'How do I build ai research prompt?',
      answer: 'Fill in the fields with your details and the builder assembles everything into a polished result. Edit any section until it feels right.',
    },
  ],
  assumptions: [
    "The tool structures your question only — it performs no research and cites no sources.",
    "Depth controls bank size: quick = 4 sub-questions + 3 checks, standard = 6 + 5, deep = 8 + 7.",
    "Source rows are capped at 15; when you add none, 5 suggested starting points are shown, not endorsed.",
  ],
  jsonLd: [],
};
