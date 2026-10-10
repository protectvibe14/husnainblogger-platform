import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";

export const inputs: ToolInput[] = [
  {
    id: "contentType",
    label: "Content type",
    type: "select",
    required: true,
    options: ["post", "video", "page"],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: "checklist",
    label: "Refresh checklist",
    type: "list",
    description:
    "The fixed decision-tree checklist for your content type.",
  },
];

const DESCRIPTION =
  'Update old posts with this content refresh checklist — stats, links, images, and keywords reviewed for a complete refresh. Watch rankings climb.';

export const content: ToolContent = {
  title: "Content Refresh Checklist",
  description: DESCRIPTION,
  howTo: [
    "Choose the type of content you are refreshing: post, video, or page.",
    "Click Run to get the fixed checklist for that type.",
    "Work through each step — traffic, accuracy, and intent checks come first.",
    "Finish with the final step: decide KEEP, UPDATE, MERGE, or DELETE.",
  ],
  methodology:
    "A fixed decision tree: your content type selects one of three human-written checklists " +
    "(post: 12 steps, video: 11 steps, page: 10 steps). Nothing is generated at runtime — the same " +
    "type always returns the same checklist.",
  faqs: [
    {
      question: "What is the best content refresh checklist?",
      answer:
        "The best content refresh checklist starts with traffic, accuracy, and intent checks, then ends with a clear decision: keep, update, merge, or delete. This tool gives you that flow for posts, videos, and pages.",
    },
    {
      question: "Is there a free content refresh checklist?",
      answer: "Yes — this checklist is free with no signup. Pick a content type and work the fixed list.",
    },
    {
      question: "How to use content refresh?",
      answer:
        "Pick whether you are refreshing a post, video, or page, then work the fixed checklist top to bottom and make the final keep, update, merge, or delete call.",
    },
    {
      question: "How does a content refresh checklist work?",
      answer:
        "You select a content type; the tool returns the matching fixed checklist branch. No content is generated — the checklist is the same every time for the same type.",
    },
    {
      question: 'When should I delete a post instead of updating it?',
      answer:
        'Delete when the content is hopelessly outdated, gets no traffic, has no backlinks, and no longer matches what searchers want. Update when it still gets some visits or has links worth keeping. Merge when two thin posts chase the same keyword. The checklist walks you through the traffic, accuracy, and intent checks first, so the keep, update, merge, or delete call is based on evidence, not gut feeling.',
    },
    {
      question: 'How do I know a post actually needs a refresh?',
      answer:
        'Look for the warning signs: traffic sliding in Search Console, facts or screenshots that are now wrong, comments saying the advice no longer works, or a ranking that is slipping to fresher competitors. If you spot two or more of these, run the checklist — pick post, video, or page and work the fixed list top to bottom.',
    },
    {
      question: 'Does this work for YouTube videos and landing pages too?',
      answer:
        'Yes — the tool has separate checklist branches for posts, videos, and pages. The checks adapt to the format (a video branch covers titles, descriptions, and pinned comments rather than headings and internal links), but the flow is the same: audit traffic, accuracy, and intent, then make the keep, update, merge, or delete decision.',
    },
  ],
  assumptions: [
    "A fixed checklist, not an AI audit — it cannot look at your analytics or your content.",
    "Traffic checks assume you can verify visits yourself (for example Search Console or YouTube Studio).",
  ],
  jsonLd: [
  ],
};
