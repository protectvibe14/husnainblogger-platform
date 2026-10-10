import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent, BuilderField } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: "round",
    label: "Round number",
    type: "text",
    required: true,
    placeholder: "1",
  },
  {
    id: "request",
    label: "Client request",
    type: "text",
    required: true,
    placeholder: "Trim the intro by 10 seconds",
  },
  {
    id: "status",
    label: "Status",
    type: "text",
    required: true,
    placeholder: "pending | in-progress | approved | rejected",
  },
];

export const trackerMode: 'log' = 'log';

export const outputs: ToolOutput[] = [
  { id: "summary", label: "Revision summary", type: "text" },
  { id: "openCount", label: "Open revisions", type: "number" },
  { id: "overLimit", label: "Over revision limit", type: "text" },
  { id: "roundHistory", label: "Round history", type: "list" },
  { id: "exportCsv", label: "Export CSV", type: "download" },
];

const DESCRIPTION =
  "Track client revision rounds without the chaos: log every request and status in one clean session list, then export the CSV for your records.";

export const content: ToolContent = {
  title: "Video Revision Tracker",
  description: DESCRIPTION,
  howTo: [
    "Add one item per revision round: enter the Round number (1, 2, 3…).",
    "Describe the Client request in plain words, e.g. “Trim the intro by 10 seconds”.",
    "Set the Status: pending, in-progress, approved, or rejected (capitalization doesn’t matter).",
    "Read the Revision summary: total logged, open count, and per-status breakdown.",
    "Hit Export CSV to download your round history — the list is session-based, so export to keep your log.",
  ],
  methodology:
    "Each entry is validated (round must be a positive whole number, status " +
    "must match the fixed 4-value enum, canonicalized case-insensitively), " +
    "rounds are sorted ascending, and the summary plus CSV are derived from " +
    "that list. Nothing is stored anywhere — export the CSV to keep your log.",
  faqs: [
    {
      question: "What is the best video revision tracker?",
      answer:
        "The best tracker is one you update every round: number each revision, write the client's exact request, and mark its status. This tool gives you that log plus a one-click CSV export — no account needed.",
    },
    {
      question: "Is there a free video revision tracker?",
      answer:
        "Yes — this page is completely free. It is session-based, which means your list lives on this page only: export the CSV before you close the tab to keep your revision log.",
    },
    {
      question: "How to track video revision?",
      answer:
        "Log one row per revision round with the round number, the client's request, and a status (pending, in-progress, approved, rejected). Export the CSV after each client review so you always have a dated record of what changed and what is still open.",
    },
    {
      question: "How does a video revision tracker work?",
      answer:
        "You add each revision as an entry with a round number, request, and status; the tool validates the entries, sorts them by round, and shows a summary with the open count. If you set a revision limit and exceed it, the summary flags that you are over the limit.",
    },
    {
      question: 'How does the video revision tracker work?',
      answer:
        'Enter your details using the inputs above and the video revision tracker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the video revision tracker free to use?',
      answer:
        'Yes - this video revision tracker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a video revision tracker?',
      answer:
        'A video revision tracker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    "Session-based: the list is NOT saved — export the CSV before closing the tab to keep your log.",
    "Nothing is sent to a server; everything runs in your browser on this page.",
    "Statuses are canonicalized case-insensitively to pending, in-progress, approved, or rejected.",
    "The optional revision limit is not persisted — set it again each session if you use it.",
  ],
  jsonLd: [
  ],
};
