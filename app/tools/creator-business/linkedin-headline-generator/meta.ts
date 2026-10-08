import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";

export const inputs: ToolInput[] = [
  {
    id: "role",
    label: "Your role",
    type: "text",
    required: true,
    placeholder: "e.g. Web Designer, Copywriter",
  },
  {
    id: "specialties",
    label: "Specialties",
    type: "textarea",
    required: false,
    placeholder: "e.g. branding, landing pages, SEO\n(one per line or comma-separated)",
  },
  {
    id: "proofPoint",
    label: "Proof point (optional)",
    type: "text",
    required: false,
    placeholder: "e.g. 50+ projects shipped",
  },
  {
    id: "style",
    label: "Headline style",
    type: "select",
    required: true,
    options: ["keyword-focused", "outcome-driven", "conversational"],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: "headlineOptions",
    label: "Headline options",
    type: "list",
    description:
      "Template-based headline options, each character-counted against the 220-character limit.",
  },
  {
    id: "limitNote",
    label: "Character limit note",
    type: "text",
    description:
      "Note about the 220-character limit and that proof points are user-provided, not verified.",
  },
];

const DESCRIPTION =
  "Create a stronger LinkedIn headline for freelancers. Enter role and specialties, pick a style, and get options counted under 220 characters. Free — try it now.";

export const content: ToolContent = {
  title: "Linkedin Headline for Freelancers 2026 | HusnainBlogger",
  description: DESCRIPTION,
  howTo: [
    "Enter your role — the job title clients search for (e.g. Web Designer).",
    "List your specialties, one per line or comma-separated (e.g. branding, landing pages, SEO).",
    "Optionally add a proof point in your own words (e.g. 50+ projects shipped).",
    "Pick a headline style: keyword-focused, outcome-driven, or conversational.",
    "Review the character-counted options and paste your favorite into LinkedIn — the tool keeps every option under 220 characters.",
  ],
  methodology:
    "Template-based assembly — never AI writing. Each style has 8 fixed headline templates (24 total) " +
    "with slots for your role, up to three specialties, and your proof point. Templates whose slots you " +
    "leave empty are skipped, and every style ends with generic fallbacks so you always get options. " +
    "Each headline is counted: if it exceeds 220 characters it is rebuilt without the proof point, and if " +
    "still over, truncated to 219 characters plus an ellipsis.",
  examples: [
    {
      title: "Web designer, keyword style",
      inputs: {
        role: "Web Designer",
        specialties: "branding, landing pages, SEO",
        style: "keyword-focused",
      },
      note: "Searchable options like 'Web Designer | branding · landing pages · SEO'.",
    },
    {
      title: "Copywriter with proof",
      inputs: {
        role: "Copywriter",
        specialties: "email, sales pages",
        proofPoint: "50+ projects shipped",
        style: "outcome-driven",
      },
      note: "Result-framed options weaving in your proof point, all under 220 characters.",
    },
    {
      title: "Casual consultant headline",
      inputs: { role: "Marketing Consultant", style: "conversational" },
      note: "Friendly options even with no specialties entered, e.g. 'Coffee first, then great work'.",
    },
  ],
  faqs: [
    {
      question: "What is the best linkedin headline for freelancers?",
      answer:
        "The best headline states your role plus what you do for clients in searchable words — no template wins for everyone. This tool gives you character-counted options in three styles (keyword-focused, outcome-driven, conversational) so you can pick the framing that fits you.",
    },
    {
      question: "Is there a free linkedin headline for freelancers?",
      answer:
        "Yes — this tool is free with no signup. Enter your role and specialties, add an optional proof point, and get headline options counted against the 220-character limit instantly.",
    },
    {
      question: "How to use linkedin headline for freelancers?",
      answer:
        "Enter your role, list your specialties, optionally add a proof point, and choose a style. Copy a favorite option and paste it into the headline field on your LinkedIn profile — every option is kept under 220 characters.",
    },
    {
      question: "How does a linkedin headline for freelancers work?",
      answer:
        "It is template-based, not AI: your role, specialties, and proof point are inserted into 24 fixed headline templates (8 per style). Proof points are echoed exactly as you type them — the tool does not verify any claim — and every headline is counted to stay within LinkedIn's 220-character limit.",
    },
    {
      question: 'How does the linkedin headline for freelancers work?',
      answer:
        'Enter your details using the inputs above and the linkedin headline for freelancers calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the linkedin headline for freelancers free to use?',
      answer:
        'Yes - this linkedin headline for freelancers is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a linkedin headline for freelancers?',
      answer:
        'A linkedin headline for freelancers is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    "Headlines are assembled from fixed templates — template-based, never AI-written.",
    "The 220-character limit is widely documented platform knowledge, not fetched live — confirm it in LinkedIn's current UI, as platforms change.",
    "Proof points are your own words echoed as typed; the tool does not verify any claim you make.",
  ],
  jsonLd: [
    {
      "@type": "SoftwareApplication",
      name: "Linkedin Headline for Freelancers 2026 | HusnainBlogger",
      url: "https://husnainblogger.com/tools/creator-business/linkedin-headline-generator/",
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
        {
          "@type": "ListItem",
          position: 3,
          name: "Creator Business Tools",
          item: "https://husnainblogger.com/tools/creator-business/",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "LinkedIn Headline Generator",
          item: "https://husnainblogger.com/tools/creator-business/linkedin-headline-generator/",
        },
      ],
    },
  ],
};
