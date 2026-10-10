import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";

export const inputs: ToolInput[] = [
  {
    id: "topic",
    label: "Roundup topic",
    type: "text",
    required: true,
    placeholder: "e.g. email list building mistakes",
  },
  {
    id: "expertCount",
    label: "Number of experts to contact",
    type: "number",
    required: true,
    validation: { min: 3, max: 30 },
  },
  {
    id: "questionSet",
    label: "Your custom questions (optional)",
    type: "textarea",
    required: false,
    placeholder: "One question per line — added before the generic templates",
  },
];

export const outputs: ToolOutput[] = [
  {
    id: "questions",
    label: "Question list",
    type: "list",
    description:
    "Your custom questions first, then 6 generic question templates labeled for personalization.",
  },
  {
    id: "outreachTracker",
    label: "Outreach tracker",
    type: "table",
    description:
    "One empty numbered row per expert slot — names and contacts are yours to fill in.",
  },
  {
    id: "timeline",
    label: "Follow-up timeline",
    type: "list",
    description:
    "Fixed milestones from invite day to publish day, with follow-up reminders.",
  },
];

const DESCRIPTION =
  "Plan your expert roundup template with ease. Enter a topic and expert count to get questions, an outreach tracker, and a timeline. Free to use.";

export const content: ToolContent = {
  title: "Expert Roundup Template",
  description: DESCRIPTION,
  howTo: [
    "Enter the topic of your roundup post.",
    "Enter how many experts to contact (3 to 30).",
    "Optionally add your own questions, one per line — they appear before the generic templates.",
    "Review the question list and personalize the generic templates for your topic.",
    "Use the outreach tracker to record names, contacts, and follow-ups as you work the timeline.",
  ],
  methodology:
    "The tool combines your custom questions with 6 fixed generic question templates (clearly labeled " +
    "for personalization), generates one empty numbered tracker row per expert slot, and outputs a fixed " +
    "6-milestone timeline from Day 0 (invites) to Day 24 (publish). Expert names and contacts are never " +
    "fabricated — the tracker rows are blank slots you fill in yourself.",
  examples: [
    {
      title: "10-expert roundup on list building",
      inputs: { topic: "Email list building", expertCount: 10 },
      note: "Get the generic question templates, a 10-row tracker, and the follow-up timeline.",
    },
    {
      title: "5-expert roundup with custom questions",
      inputs: {
        topic: "SEO",
        expertCount: 5,
        questionSet: "What is your #1 SEO tip?",
      },
      note: "Your question appears first, followed by the generic templates.",
    },
  ],
  faqs: [
    {
      question: "What is the best expert roundup template?",
      answer:
        "The best expert roundup template plans the whole outreach: interview questions, a tracker for names and follow-ups, and a reminder timeline. This tool generates all three from your topic and expert count — free.",
    },
    {
      question: "Is there a free expert roundup template?",
      answer:
        "Yes — this tool is free with no signup. You get a question list, an empty outreach tracker table, and a follow-up timeline.",
    },
    {
      question: "How to use expert roundup?",
      answer:
        "Enter your topic and how many experts to contact, add any custom questions, then work the plan: send invites on Day 0, follow up on Days 7 and 14, and publish by Day 24. You fill in the expert names yourself.",
    },
    {
      question: "How does an expert roundup template work?",
      answer:
        "It organizes your outreach instead of writing it. You get generic question templates to personalize, a blank tracker for the experts you choose, and a fixed timeline with follow-up reminders. No names or quotes are ever invented.",
    },
    {
      question: 'How does the expert roundup template work?',
      answer:
        'Enter your details using the inputs above and the expert roundup template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the expert roundup template free to use?',
      answer:
        'Yes - this expert roundup template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an expert roundup template?',
      answer:
        'An expert roundup template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    "Expert names and contacts are never fabricated; tracker rows are empty slots for you to fill in.",
    "The 6 generic questions are templates — personalize them for your topic before sending.",
    "The timeline is a fixed starting point (Day 0 to Day 24); adjust the dates to your publishing schedule.",
    "Expert count is limited to 3–30 per plan.",
  ],
  jsonLd: [],
};
