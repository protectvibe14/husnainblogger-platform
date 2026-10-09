import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: "followerCount",
    label: "Follower count",
    type: "number",
    required: true,
    placeholder: "e.g. 50000",
    validation: { min: 1 },
  },
  {
    id: "avgViews",
    label: "Average views per video",
    type: "number",
    required: true,
    placeholder: "e.g. 100000",
    validation: { min: 1 },
  },
];

export const outputs: ToolOutput[] = [
  { id: "lowRate", label: "Suggested low rate (USD/video)", type: "currency" },
  { id: "highRate", label: "Suggested high rate (USD/video)", type: "currency" },
  { id: "basis", label: "What this estimate is based on", type: "text" },
];

export const content: ToolContent = {
  title: "Tiktok Sponsorship Rates',
  description:
    "Estimate tiktok sponsorship rates with this free brand-deal calculator. Enter followers and average views for an honest per-video estimate range — try it now.",
  howTo: [
    "Enter your TikTok follower count.",
    "Enter your average views per video (use recent videos, not one viral outlier).",
    "Read the suggested low–high per-video range (USD). The tool blends a creator-tier band with a view-based floor.",
    "Treat the range as a starting point — real brand-deal prices vary by niche, engagement, and region.",
  ],
  methodology:
    "The calculator interpolates a creator-tier band from follower count (nano $5–$25/video scaling to mega $5k–$25k+), " +
    "computes a view-based floor from average views at an estimated $2–$6 CPM, and takes the higher of the two. " +
    "All bands are 2026 compiled estimates — not guaranteed rates and not verified platform data.",
  examples: [
    {
      title: "Micro creator, strong views",
      inputs: { followerCount: 50000, avgViews: 100000 },
      note: "50k followers with 100k average views — the view-based floor lifts the tier band.",
    },
    {
      title: "Nano creator",
      inputs: { followerCount: 5000, avgViews: 2000 },
      note: "5k followers at the nano end of the estimate bands.",
    },
    {
      title: "Mega creator",
      inputs: { followerCount: 3000000, avgViews: 500000 },
      note: "3M followers at the top of the estimate bands.",
    },
  ],
  faqs: [
    {
      question: "What is the best tiktok sponsorship rates?",
      answer:
        "There is no single best rate — it depends on followers, average views, niche, and engagement. This calculator estimates a per-video range from followers and views so you can start negotiations with a number.",
    },
    {
      question: "Is there a free tiktok sponsorship rates?",
      answer:
        "Yes — this calculator is free to use with no sign-up. It estimates TikTok sponsorship rates per video from follower count and average views.",
    },
    {
      question: "How to use tiktok sponsorship rates?",
      answer:
        "Enter your follower count and average views per video, then read the suggested range. Use it as a floor for brand-deal negotiations and adjust for your niche and engagement.",
    },
    {
      question: 'How does the tiktok sponsorship rates work?',
      answer:
        'Enter your details using the inputs above and the tiktok sponsorship rates calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the tiktok sponsorship rates free to use?',
      answer:
        'Yes - this tiktok sponsorship rates is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a tiktok sponsorship rates?',
      answer:
        'A tiktok sponsorship rates is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the tiktok sponsorship rates?',
      answer:
        'No account needed. Open the tiktok sponsorship rates, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    "Tier bands are 2026 compiled survey estimates (nano $5–$25/video to mega $5k–$25k+) — not guaranteed rates and not verified platform data (needs review).",
    "The view-based floor uses an estimated $2–$6 CPM; actual deal prices vary by niche, engagement, audience quality, and region.",
    "Average views should reflect recent typical videos, not a single viral outlier — outliers inflate the view-based floor.",
  ],
  jsonLd: [
    {
      "@type": "SoftwareApplication",
      name: "Tiktok Sponsorship Rates 2026 – Free Tool | HusnainBlogger",
      url: "https://husnainblogger.com/tools/make-money/tiktok-sponsorship-rate-calculator/",
      applicationCategory: "Utilities",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: "Estimate tiktok sponsorship rates with this free brand-deal calculator. Enter followers and average views for an honest per-video estimate range — try it now.",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://husnainblogger.com/" },
        { "@type": "ListItem", position: 2, name: "Tools", item: "https://husnainblogger.com/tools/" },
        {
          "@type": "ListItem",
          position: 3,
          name: "Make Money Tools",
          item: "https://husnainblogger.com/tools/make-money/",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "TikTok Sponsorship Rate Calculator",
          item: "https://husnainblogger.com/tools/make-money/tiktok-sponsorship-rate-calculator/",
        },
      ],
    },
  ],
};
