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
      question: 'How does the guest post pitch template work?',
      answer:
        'Enter your details using the inputs above and the guest post pitch template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the guest post pitch template free to use?',
      answer:
        'Yes - this guest post pitch template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a guest post pitch template?',
      answer:
        'A guest post pitch template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    "The email is a fixed template; personalization beyond the slots is the user's job.",
    "The tool never sends emails and never verifies that the blog accepts guest posts.",
    "At most 10 pitches per run; the template wording is the same for every pitch.",
  ],
  jsonLd: [
    {
      "@type": "SoftwareApplication",
      name: "Guest Post Pitch Template 2026 – Free Tool | HusnainBlogger",
      url: "https://husnainblogger.com/tools/ai-workflows/guest-post-pitch-builder/",
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
        { "@type": "ListItem", position: 3, name: "AI Workflow Tools", item: "https://husnainblogger.com/tools/ai-workflows/" },
        {
          "@type": "ListItem",
          position: 4,
          name: "Guest Post Pitch Builder",
          item: "https://husnainblogger.com/tools/ai-workflows/guest-post-pitch-builder/",
        },
      ],
    },
  ],
};
