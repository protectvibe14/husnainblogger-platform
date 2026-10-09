import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";

export const inputs: ToolInput[] = [
  {
    id: "usageType",
    label: "What type of content uses AI?",
    type: "select",
    required: true,
    options: ["text", "image", "video", "voice"],
  },
  {
    id: "placement",
    label: "Where will the disclosure appear?",
    type: "select",
    required: true,
    options: ["caption", "description", "footer"],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: "variants",
    label: "Disclosure statement variants",
    type: "list",
    description:
    "Four fixed disclosure variants (short, standard, detailed, friendly) for your content type.",
  },
  {
    id: "recommended",
    label: "Recommended statement",
    type: "copy",
    description:
    "The best-matching variant for your chosen placement, ready to copy.",
  },
  {
    id: "placementTip",
    label: "Placement tip",
    type: "text",
    description:
    "Where to put the disclosure so readers actually see it.",
  },
];

const DESCRIPTION =
  "Free ai disclosure generator 2026: Four fixed disclosure variants (short, standard, detailed, friendly) for your content type. Fast, private, no signup - try!";

export const content: ToolContent = {
  title: "AI Disclosure Generator",
  description: DESCRIPTION,
  howTo: [
    "Choose what type of content uses AI: text, image, video, or voice.",
    "Choose where the disclosure will appear: caption, description, or footer.",
    "Review the four variants — short, standard, detailed, and friendly.",
    "Copy the recommended statement for your placement.",
    "Have a human review the wording before publishing — these are templates, not legal advice.",
  ],
  methodology:
    "The tool fills fixed disclosure templates chosen from a bank of 16 statements (4 content types x 4 tones). " +
    "Each placement maps to the best-fitting tone: captions get the short variant, descriptions the detailed one, " +
    "footers the standard one. Nothing is written by AI; every word comes from the fixed template bank.",
  examples: [
    {
      title: "AI-edited blog post",
      inputs: { usageType: "text", placement: "description" },
      note: "Get the detailed variant for a blog post footer or about page.",
    },
    {
      title: "AI-generated video",
      inputs: { usageType: "video", placement: "caption" },
      note: "Get the short variant that fits at the start of a caption.",
    },
    {
      title: "AI voiceover",
      inputs: { usageType: "voice", placement: "footer" },
      note: "Get the standard variant for a video footer or end credits.",
    },
  ],
  faqs: [
    {
      question: "What is the best ai disclosure generator?",
      answer:
        "The best ai disclosure generator gives you clear, ready-to-paste transparency statements matched to your content type and placement. This tool fills fixed templates for text, image, video, and voice content — free.",
    },
    {
      question: "Is there a free ai disclosure generator?",
      answer:
        "Yes — this tool is free with no signup. It produces short, standard, detailed, and friendly disclosure variants plus a placement recommendation.",
    },
    {
      question: "How to generate ai disclosure?",
      answer:
        "Choose the content type that uses AI (text, image, video, or voice) and where the disclosure will appear (caption, description, or footer). The tool fills matching templates you can copy straight into your content.",
    },
    {
      question: "How does an ai disclosure generator work?",
      answer:
        "It fills fixed disclosure templates — no AI writing involved. A bank of 16 statements covers 4 content types in 4 tones, and the tool recommends the tone that fits your placement. These are templates, not legal advice, so have a human review them.",
    },
    {
      question: 'Do these templates count as legal compliance?',
      answer:
        'No — they are transparency best-practice starters, not legal advice. Rules differ by platform and country: Meta and TikTok require labels on realistic AI-generated content, and regulators like the FTC expect clear disclosures in ads and endorsements. Use the templates to cover the basics, then check the policy of each platform you post on and the rules in your country — and have a human review anything high-stakes.',
    },
    {
      question: 'Do I have to disclose AI use at all?',
      answer:
        'It depends on what you make and where you post. Realistic AI images, videos, and voices generally need a label on Meta, TikTok, and YouTube, and paid or sponsored content has stricter rules. When in doubt, disclosing is the safer move — the tool gives you short, standard, detailed, and friendly variants so you can pick the tone that fits your placement.',
    },
    {
      question: 'Which tone should I choose for my disclosure?',
      answer:
        'Match the tone to the placement. A footer or video description can carry the detailed variant; a caption or story usually needs the short or friendly one. The tool recommends a tone for your chosen placement, and every statement is a fixed template you can paste as-is or tweak in your own voice.',
    },
  ],
  assumptions: [
    "The statements are fixed templates, not legal advice; have a human or lawyer review them before publishing.",
    "Disclosure rules differ by platform and region — templates do not track any specific policy.",
    "The tool never invents facts about your content; it only fills disclosure wording.",
  ],
  jsonLd: [
    {
      "@type": "SoftwareApplication",
      name: "AI Disclosure Generator 2026 – Free Tool | HusnainBlogger",
      url: "https://husnainblogger.com/tools/ai-workflows/ai-disclosure-statement-generator/",
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
          name: "AI Disclosure Statement Generator",
          item: "https://husnainblogger.com/tools/ai-workflows/ai-disclosure-statement-generator/",
        },
      ],
    },
  ],
};
