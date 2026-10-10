import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";
import type { BuilderField } from "../../../src/templates/types.ts";

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [
  {
    id: "pitchEmail",
    label: "Pitch email",
    type: "copy",
    description:
    "The full pitch email body with your details filled in, ready to copy and personalize.",
  },
  {
    id: "subjectLines",
    label: "Subject line variants",
    type: "list",
    description:
    "Five subject-line variants per pitch to test different openers.",
  },
];

export const itemFields: BuilderField[] = [
  { id: "blogName", label: "Blog name", type: "text", required: true, placeholder: "The blog you want to pitch" },
  { id: "topicIdea", label: "Topic idea", type: "text", required: true, placeholder: "Your guest post topic in one line" },
  { id: "credentials", label: "Your credentials (optional)", type: "text", placeholder: "Why you are qualified to write this" },
];

const DESCRIPTION =
  "Build a guest post pitch template filled with your details. Add the blog name and topic idea to get a pitch email plus subject lines. Try it free.";

export const content: ToolContent = {
  title: "Guest Post Pitch Template",
  description: DESCRIPTION,
  howTo: [
    "Add one row per pitch (up to 10) with the blog name and your topic idea.",
    "Optionally add your credentials — otherwise a neutral fallback line is used.",
    "Click Build to fill the pitch email template and five subject-line variants.",
    "Personalize beyond the slots: mention the blog's recent posts and address the editor by name.",
    "Copy the email, proofread it, and send it yourself — the tool never sends anything.",
  ],
  methodology:
    "The tool fills one fixed pitch-email template (blog name, topic idea, credentials slots) and 5 fixed " +
    "subject-line templates with the details you enter. No AI writing is involved; every word comes from " +
    "the fixed template bank. Personalization beyond the slots is the user's job.",
  faqs: [
    {
      question: "What is the best guest post pitch template?",
      answer:
        "The best guest post pitch template keeps it short: a personal opening, one clear topic idea, your credentials, and a low-friction ask. This tool fills exactly that template with your details — free.",
    },
    {
      question: "Is there a free guest post pitch template?",
      answer:
        "Yes — this tool is free with no signup. You get a full pitch email plus five subject-line variants per pitch.",
    },
    {
      question: "How to use guest post pitch?",
      answer:
        "Enter the blog name, your topic idea, and optionally your credentials. The tool builds the email; then personalize it (mention their recent posts, use the editor's name) and send it yourself.",
    },
    {
      question: "How does a guest post pitch template work?",
      answer:
        "It fills fixed email and subject-line templates with your details. No AI writing happens — the personalization that actually wins placements is the part only you can add.",
    },
    {
      question: 'What is a guest post pitch template?',
      answer:
        'A guest post pitch template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'What makes a guest post pitch get accepted?',
      answer: 'Show you\'ve read their blog, propose a specific topic that fills a gap in their content, and include 2-3 headline options. Generic pitches get deleted.',
    },
    {
      question: 'How long should my pitch email be?',
      answer: 'Under 150 words. Introduce yourself in one line, propose the topic in two lines, and close with your credentials. Editors are busy — respect their time.',
    },
    {
      question: 'Should I include writing samples?',
      answer: 'Yes, link to 2-3 relevant published pieces. Choose samples similar to what you\'re pitching so the editor can see you can deliver.',
    },
    {
      question: 'How do I follow up without being annoying?',
      answer: 'Wait 7-10 days, then send one brief follow-up. If no response after that, move on. Never follow up more than twice.',
    },
      {
      question: 'Can I save or export my guest post pitch template?',
      answer: 'Yes, copy the result or use your browser\'s print-to-PDF. Everything stays on your device — nothing is uploaded or stored.',
    },
    {
      question: 'How do I build guest post pitch template?',
      answer: 'Fill in the fields with your details and the builder assembles everything into a polished result. Edit any section until it feels right.',
    },
  ],
  assumptions: [
    "The email is a fixed template; personalization beyond the slots is the user's job.",
    "The tool never sends emails and never verifies that the blog accepts guest posts.",
    "At most 10 pitches per run; the template wording is the same for every pitch.",
  ],
  jsonLd: [],
};
