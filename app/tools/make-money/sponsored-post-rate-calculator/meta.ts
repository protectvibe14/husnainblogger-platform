import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: "platform",
    label: "Platform",
    type: "select",
    required: true,
    options: ["instagram", "tiktok", "youtube"],
  },
  {
    id: "followerCount",
    label: "Follower / subscriber count",
    type: "number",
    required: true,
    placeholder: "e.g. 25000",
    validation: { min: 1 },
  },
  {
    id: "engagementRate",
    label: "Engagement rate (%)",
    type: "number",
    required: true,
    placeholder: "e.g. 3.5",
    validation: { min: 0.01 },
  },
  {
    id: "contentFormat",
    label: "Content format",
    type: "select",
    required: true,
    options: ["post", "reel", "video"],
  },
];

export const outputs: ToolOutput[] = [
  { id: "lowRate", label: "Suggested low rate (USD)", type: "currency" },
  { id: "highRate", label: "Suggested high rate (USD)", type: "currency" },
  { id: "perFollowerRate", label: "Rate per follower (USD, estimate)", type: "number" },
  { id: "basis", label: "What this estimate is based on", type: "text" },
];

export const content: ToolContent = {
  title: "Sponsored Post Rate Calculator",
  description:
    "Use our free sponsored post rate calculator. Enter platform, followers, engagement and format for an honest low–high estimate range —.",
  howTo: [
    "Choose the platform: Instagram, TikTok, or YouTube.",
    "Enter your follower or subscriber count and your engagement rate as a percent (e.g. 3.5).",
    "Choose the content format: post, reel, or video — video formats carry an estimated premium.",
    "Read the suggested low–high range (USD) plus the estimated rate per follower.",
    "Treat the range as a starting point — real brand-deal prices vary by niche, audience quality, and region.",
  ],
  methodology:
    "The calculator places your follower count in a platform tier band, interpolates the band, " +
    "then applies an estimated format multiplier (post 1.0, reel 1.4, video 1.6) and an engagement adjustment " +
    "against per-platform benchmarks. All bands, benchmarks, and multipliers are labeled market estimates — " +
    "not guaranteed rates and not verified platform data.",
  examples: [
    {
      title: "Instagram micro-influencer reel",
      inputs: { platform: "instagram", followerCount: 20000, engagementRate: 3.0, contentFormat: "reel" },
      note: "20k followers with above-average engagement on a reel format.",
    },
    {
      title: "TikTok creator video",
      inputs: { platform: "tiktok", followerCount: 30000, engagementRate: 5.0, contentFormat: "video" },
      note: "30k followers, strong engagement, video format with the full premium.",
    },
    {
      title: "YouTube channel sponsorship",
      inputs: { platform: "youtube", followerCount: 60000, engagementRate: 3.0, contentFormat: "video" },
      note: "60k subscribers on a video sponsorship.",
    },
  ],
  faqs: [
    {
      question: "What is the best sponsored post rate calculator?",
      answer:
        "A good one combines follower tier, engagement rate, and content format — not followers alone. This free calculator does all three and labels every output as an estimate range.",
    },
    {
      question: "Is there a free sponsored post rate calculator?",
      answer:
        "Yes — this calculator is free to use with no sign-up. It estimates sponsored-post rates for Instagram, TikTok, and YouTube from followers, engagement, and format.",
    },
    {
      question: "How to calculate sponsored post rate?",
      answer:
        "Start from a follower-tier band, adjust up for video formats and strong engagement, then sanity-check against your niche. This tool automates the math and shows the assumptions it used.",
    },
    {
      question: 'How does the sponsored post rate calculator work?',
      answer:
        'Enter your details using the inputs above and the sponsored post rate calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the sponsored post rate calculator free to use?',
      answer:
        'Yes - this sponsored post rate calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a sponsored post rate calculator?',
      answer:
        'A sponsored post rate calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the sponsored post rate calculator?',
      answer:
        'No account needed. Open the sponsored post rate calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    "All tier bands, engagement benchmarks, and format multipliers are market estimates — not guaranteed rates and not verified platform data (needs review).",
    "Actual sponsored-post prices vary widely by niche, engagement quality, audience demographics, and region.",
    "The story format (estimated 40–60% cheaper than posts) is not modeled here — only post, reel, and video formats are priced.",
  ],
  jsonLd: [
    {
      "@type": "SoftwareApplication",
      name: "Sponsored Post Rate Calculator 2026 – Free | HusnainBlogger",
      url: "https://husnainblogger.com/tools/make-money/sponsored-post-rate-calculator/",
      applicationCategory: "Utilities",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
    "Use our free sponsored post rate calculator. Enter platform, followers, engagement and format for an honest low–high estimate range —.",
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
          name: "Sponsored Post Rate Calculator",
          item: "https://husnainblogger.com/tools/make-money/sponsored-post-rate-calculator/",
        },
      ],
    },
  ],
};
