import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: "startTime",
    label: "Session start time",
    type: "text",
    required: true,
    placeholder: "09:00",
  },
  {
    id: "focusMin",
    label: "Focus minutes per round",
    type: "number",
    required: false,
    placeholder: "25",
    validation: { min: 5, max: 120 },
  },
  {
    id: "breakMin",
    label: "Break minutes between rounds",
    type: "number",
    required: false,
    placeholder: "5",
    validation: { min: 1, max: 30 },
  },
  {
    id: "rounds",
    label: "Number of rounds",
    type: "number",
    required: false,
    placeholder: "4",
    validation: { min: 1, max: 12 },
  },
  {
    id: "taskLabel",
    label: "Task label (optional)",
    type: "text",
    required: false,
    placeholder: "Edit vlog episode 12",
  },
];

export const outputs: ToolOutput[] = [
  { id: "sessionPlan", label: "Session plan", type: "list" },
  { id: "totalMin", label: "Total minutes", type: "number" },
  { id: "endTime", label: "Session end time", type: "text" },
  { id: "warnings", label: "Warnings", type: "list" },
];

const DESCRIPTION =
  "Edit in focused sprints instead of marathons: set your focus and break lengths, round count, and start time for a pomodoro plan built for editors.";

export const content: ToolContent = {
  title: "Video Editing Pomodoro Timer",
  description: DESCRIPTION,
  howTo: [
    "Enter your session start time as HH:MM in 24-hour format (e.g. 09:00).",
    "Set Focus minutes per round (5–120; default 25) for each editing block.",
    "Set Break minutes between rounds (1–30; default 5) to rest your eyes.",
    "Choose the Number of rounds (1–12; default 4) for the session.",
    "Optionally add a Task label like “Edit vlog episode 12”.",
    "Read your ordered session plan: every phase with start/end times, total minutes, and your end time.",
  ],
  methodology:
    "Pure plan arithmetic: focus and break phases alternate round by round, " +
    "the total is summed, and the end time is computed on a 24-hour clock " +
    "from your start time. No live countdown runs in the logic — the ticking " +
    "timer is part of the app shell, not this tool.",
  examples: [
    {
      title: "Morning edit block",
      inputs: { startTime: "09:00", focusMin: 25, breakMin: 5, rounds: 4, taskLabel: "Edit vlog" },
      note: "Classic 4-round plan: 115 minutes, ends 10:55.",
    },
    {
      title: "Deep color-grade session",
      inputs: { startTime: "14:30", focusMin: 50, breakMin: 10, rounds: 3, taskLabel: "Color grade" },
      note: "Longer focus blocks for grading: 170 minutes, ends 17:20.",
    },
    {
      title: "Quick single round",
      inputs: { startTime: "20:00", rounds: 1 },
      note: "One 25-minute focus block with no breaks.",
    },
  ],
  faqs: [
    {
      question: "What is the best video editing pomodoro timer?",
      answer:
        "The best one is the plan you will actually follow: 25-minute focus blocks with 5-minute breaks work well for most editors, while longer 50/10 blocks suit color grading and sound design. This tool builds that plan for you — the discipline of starting on time is up to you.",
    },
    {
      question: "Is there a free video editing pomodoro timer?",
      answer:
        "Yes — this page is completely free with no sign-up. It generates your full session plan (phases, minutes, and end time) instantly, and the live countdown runs right here on the page.",
    },
    {
      question: "How to use video editing pomodoro?",
      answer:
        "Enter a start time, pick focus and break lengths and the number of rounds, then work on exactly one editing task per focus block and step away from the screen on every break. Avoid checking your phone during focus rounds — that is where the technique pays off.",
    },
    {
      question: "How does a video editing pomodoro timer work?",
      answer:
        "It splits your editing session into timed focus rounds separated by short breaks, and this tool computes the full schedule: each phase's start and end time, the total minutes, and when you finish. Sessions over 8 hours get a warning to split across days.",
    },
    {
      question: 'How does the video editing pomodoro timer work?',
      answer:
        'Enter your details using the inputs above and the video editing pomodoro timer calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the video editing pomodoro timer free to use?',
      answer:
        'Yes - this video editing pomodoro timer is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a video editing pomodoro timer?',
      answer:
        'A video editing pomodoro timer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    "Breaks are placed between rounds only — there is no break after the final round.",
    "The live ticking countdown is UI (app shell); this logic only generates the session plan.",
    "Sessions longer than 8 hours produce a warning, not an error — the plan is still returned.",
  ],
  jsonLd: [
    {
      "@type": "SoftwareApplication",
      name: "Video Editing Pomodoro Timer 2026 – Free | HusnainBlogger",
      url: "https://husnainblogger.com/tools/video-editing/editor-pomodoro-timer/",
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
        { "@type": "ListItem", position: 3, name: "Video Editing Tools", item: "https://husnainblogger.com/tools/video-editing/" },
        { "@type": "ListItem", position: 4, name: "Editor Pomodoro Timer", item: "https://husnainblogger.com/tools/video-editing/editor-pomodoro-timer/" },
      ],
    },
  ],
};
