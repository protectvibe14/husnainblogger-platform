import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";
import { TRACKER_ITEMS } from "./logic.ts";

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [];

export const trackerMode: "checklist" = "checklist";

export const trackerItems = TRACKER_ITEMS;

const DESCRIPTION =
  'Ship flawless posts with this blog post publishing checklist — SEO, images, links, and formatting checked before you hit publish. Never miss a meta tag.';

export const content: ToolContent = {
  title: "Blog Post Publishing Checklist",
  description: DESCRIPTION,
  howTo: [
    "Open the checklist before you publish any post.",
    "Work through each item top to bottom, checking it off as you finish.",
    "Fix any item you cannot honestly check off, then re-check it.",
    "Watch the progress bar — publish only when it reads 100%.",
    "Your progress is saved in your browser automatically.",
  ],
  methodology:
    "A fixed, human-written list of 18 pre-publish checks covering SEO basics, formatting, images, links, and QA. " +
    "The tracker counts your checked items and shows your progress — nothing is generated, estimated, or personalized.",
  faqs: [
    {
      question: "What is the best blog post publishing checklist?",
      answer:
        "The best blog post publishing checklist covers the title tag, meta description, headings, images, internal and external links, and proofreading before every publish. This tool gives you exactly that as an interactive 18-item list.",
    },
    {
      question: "Is there a free blog post publishing checklist?",
      answer:
        "Yes — this interactive checklist is free with no signup, and your progress is saved in your browser as you check items off.",
    },
    {
      question: "How to use blog post publishing?",
      answer:
        "Open this checklist before publishing, check off each item as you complete it, and only publish when you reach 100%. Use it for every post so quality stays consistent.",
    },
    {
      question: "How does a blog post publishing checklist work?",
      answer:
        "You tick off each fixed checklist item; the tool tracks your progress and saves it in your browser's local storage. The list itself never changes.",
    },
    {
      question: 'What is a blog post publishing checklist?',
      answer:
        'A blog post publishing checklist is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'What should I check before hitting publish?',
      answer: 'Verify your headline, meta description, featured image, internal links, spelling, formatting on mobile, and that all images have alt text. This checklist walks through each item systematically.',
    },
    {
      question: 'How do I ensure my post is SEO-ready?',
      answer: 'Check that your primary keyword appears in the title, first paragraph, at least one H2, the URL slug, and meta description. Also confirm you have 3-5 internal links to related content.',
    },
    {
      question: 'Should I preview on mobile before publishing?',
      answer: 'Always. Over 60% of blog traffic is mobile. Check that images resize properly, text is readable without zooming, and buttons are tappable.',
    },
    {
      question: 'What about social sharing setup?',
      answer: 'Confirm your OG image, title, and description are set so shares look professional. Test with Facebook\'s sharing debugger or Twitter\'s card validator before publishing.',
    },
      {
      question: 'How do I use this blog post publishing checklist tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
    {
      question: 'Is this blog post publishing checklist tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
  ],
  assumptions: [
    "A fixed, general-purpose list — it is not SEO advice tailored to your site or niche.",
    "Progress is stored in your browser only; clearing site data resets it.",
  ],
  jsonLd: [],
};
