import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";

export const inputs: ToolInput[] = [
  {
    id: "avgClientValue",
    label: "Average client value",
    type: "number",
    required: true,
    placeholder: "e.g. 2000",
    validation: { min: 0, unit: "USD" },
  },
  {
    id: "commissionPct",
    label: "Referral commission (%)",
    type: "number",
    required: true,
    placeholder: "e.g. 10",
    validation: { min: 0, max: 100, unit: "%" },
  },
  {
    id: "flatBounty",
    label: "Flat bounty per referral (optional)",
    type: "number",
    required: false,
    placeholder: "e.g. 50",
    validation: { min: 0, unit: "USD" },
  },
  {
    id: "expectedReferralsPerQuarter",
    label: "Expected referrals per quarter",
    type: "number",
    required: true,
    placeholder: "e.g. 4",
    validation: { min: 0 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: "payoutPerReferral",
    label: "Payout per referral",
    type: "currency",
    description:
    "Commission amount plus any flat bounty, for one referral.",
  },
  {
    id: "quarterlyProgramCost",
    label: "Estimated quarterly program cost",
    type: "currency",
    description:
    "Payout per referral multiplied by expected referrals per quarter.",
  },
  {
    id: "programROIEstimate",
    label: "Program ROI estimate",
    type: "text",
    description:
    "A labeled estimate of quarterly revenue vs. cost from your own inputs.",
  },
];

const DESCRIPTION =
  'Turn clients into promoters with this freelance referral program planner — rewards and rules that keep referrals flowing in. Reward clients who refer.';

export const content: ToolContent = {
  title: "Freelance Referral Program",
  description: DESCRIPTION,
  howTo: [
    "Enter your average client value — what one referred client is typically worth to you.",
    "Enter the referral commission percentage you want to offer (0–100%).",
    "Optionally add a flat bounty per referral on top of the commission.",
    "Enter how many referrals you expect per quarter.",
    "Read your payout per referral, estimated quarterly cost, and the labeled ROI estimate — then set terms you are comfortable paying.",
  ],
  methodology:
    "Pure arithmetic on your own numbers: payout per referral = average client value × (commission % ÷ 100) + flat bounty; " +
    "quarterly program cost = payout per referral × expected referrals per quarter; " +
    "the ROI estimate divides estimated referral revenue (referrals × average client value) by estimated cost. " +
    "Nothing is fetched or predicted — the output is only as good as the inputs you type.",
  examples: [
    {
      title: "Design freelancer, 10% commission",
      inputs: {
        avgClientValue: 2000,
        commissionPct: 10,
        flatBounty: 50,
        expectedReferralsPerQuarter: 4,
      },
      note: "Each referral pays $250; four referrals a quarter cost about $1,000.",
    },
    {
      title: "Flat bounty only",
      inputs: {
        avgClientValue: 500,
        commissionPct: 0,
        flatBounty: 100,
        expectedReferralsPerQuarter: 6,
      },
      note: "No percentage commission — a simple $100 bounty per referral, $600 a quarter.",
    },
    {
      title: "High-ticket consultant",
      inputs: {
        avgClientValue: 10000,
        commissionPct: 15,
        expectedReferralsPerQuarter: 2,
      },
      note: "15% of $10,000 = $1,500 per referral; two referrals a quarter cost about $3,000.",
    },
  ],
  faqs: [
    {
      question: "What is the best freelance referral program?",
      answer:
        "There is no single best program — the right one depends on your margins and client value. A common starting point is a 10–15% commission or a flat bounty you can comfortably afford, which is exactly what this planner helps you size from your own numbers.",
    },
    {
      question: "Is there a free freelance referral program?",
      answer:
        "Yes — this planner is free with no signup. It estimates your payout per referral, quarterly program cost, and ROI from the numbers you enter, so you can design your own program without paying for software.",
    },
    {
      question: "How to use freelance referral program?",
      answer:
        "Enter your average client value, the commission percentage you want to offer, any flat bounty, and how many referrals you expect per quarter. The tool shows what each referral will cost you and the estimated quarterly total — use that to write your referral terms.",
    },
    {
      question: "How does a freelance referral program work?",
      answer:
        "You reward people who send you clients: each successful referral earns a commission, a flat bounty, or both. This planner computes the payout from your inputs (client value × commission % + bounty) and projects the quarterly cost at your expected referral volume.",
    },
    {
      question: 'How does the freelance referral program work?',
      answer:
        'Enter your details using the inputs above and the freelance referral program calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the freelance referral program free to use?',
      answer:
        'Yes - this freelance referral program is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a freelance referral program?',
      answer:
        'A freelance referral program is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    "Commission terms are your own policy — this planner does not give business or legal advice.",
    "The ROI figure is an estimate from your inputs, not a prediction; referral quality and conversion rates are not modeled.",
    "Percentages are bounded 0–100 and all inputs must be finite, non-negative numbers.",
  ],
  jsonLd: [
    {
      "@type": "SoftwareApplication",
      name: "Freelance Referral Program 2026 – Free | HusnainBlogger",
      url: "https://husnainblogger.com/tools/creator-business/referral-program-planner/",
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
          name: "Referral Program Planner",
          item: "https://husnainblogger.com/tools/creator-business/referral-program-planner/",
        },
      ],
    },
  ],
};
