import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: "experienceLevel",
    label: "Experience level",
    type: "select",
    required: true,
    options: ["entry", "intermediate", "expert"],
  },
  {
    id: "tasksComplexity",
    label: "Task complexity",
    type: "select",
    required: true,
    options: ["basic", "specialized"],
  },
  {
    id: "hoursPerWeek",
    label: "Hours per week",
    type: "number",
    required: true,
    placeholder: "e.g. 20",
    validation: { min: 0.1 },
  },
  {
    id: "hourlyLowOverride",
    label: "Your low hourly rate in USD (optional override — replaces our bands)",
    type: "number",
    required: false,
    placeholder: "e.g. 18",
    validation: { min: 0.01 },
  },
  {
    id: "hourlyHighOverride",
    label: "Your high hourly rate in USD (optional override — replaces our bands)",
    type: "number",
    required: false,
    placeholder: "e.g. 32",
    validation: { min: 0.01 },
  },
];

export const outputs: ToolOutput[] = [
  { id: "hourlyLow", label: "Low hourly rate (USD)", type: "currency" },
  { id: "hourlyHigh", label: "High hourly rate (USD)", type: "currency" },
  { id: "weeklyLow", label: "Low weekly cost (USD)", type: "currency" },
  { id: "weeklyHigh", label: "High weekly cost (USD)", type: "currency" },
  { id: "basis", label: "What this estimate is based on", type: "text" },
];

export const content: ToolContent = {
  title: "Virtual Assistant Rates Calculator",
  description:
    "Use our virtual assistant rates calculator to estimate VA costs free. Pick level, task type and weekly hours for an adjustable range —.",
  howTo: [
    "Choose the VA's experience level: entry, intermediate, or expert.",
    "Choose the task complexity: basic admin work or specialized skills.",
    "Enter the expected hours per week to get an hourly range and a weekly cost range (USD).",
    "Optional: enter your own low and high hourly overrides to replace our bands with numbers from your market.",
    "Use the range to set pay or price packages — confirm against your own region's going rates.",
  ],
  methodology:
    "The calculator looks up an hourly band for the chosen level and task type, then multiplies it by weekly hours. " +
    "The bands are survey estimates ($15–$50/hr overall), not a verified 2026 market benchmark, " +
    "so every result is labeled an estimate and the bands are fully replaceable with your own numbers.",
  examples: [
    {
      title: "Entry-level VA, 20 hours",
      inputs: { experienceLevel: "entry", tasksComplexity: "basic", hoursPerWeek: 20 },
      note: "Basic admin work by an entry-level VA: 20 hours × the 15–25/hr estimate band.",
    },
    {
      title: "Expert VA, specialized tasks",
      inputs: { experienceLevel: "expert", tasksComplexity: "specialized", hoursPerWeek: 10 },
      note: "Specialized work at the top of the estimate span: 40–50/hr.",
    },
    {
      title: "Custom market band",
      inputs: {
        experienceLevel: "intermediate",
        tasksComplexity: "basic",
        hoursPerWeek: 30,
        hourlyLowOverride: 22,
        hourlyHighOverride: 30,
      },
      note: "Overrides replace the built-in bands with the user's own market numbers.",
    },
  ],
  faqs: [
    {
      question: "What is the best virtual assistant rates calculator?",
      answer:
        "A good one separates hourly rate from weekly cost and lets you adjust the bands. This free calculator estimates both from experience level and task complexity, with overrides for your own market numbers.",
    },
    {
      question: "Is there a free virtual assistant rates calculator?",
      answer:
        "Yes — this calculator is free to use with no sign-up. It estimates hourly and weekly VA costs from level, task complexity, and weekly hours.",
    },
    {
      question: "How to calculate virtual assistant rates?",
      answer:
        "Pick the experience level and task complexity, enter weekly hours, and multiply the hourly band by hours. For a realistic number, replace the estimate bands with rates you have actually seen in your market.",
    },
    {
      question: 'How does the virtual assistant rates calculator work?',
      answer:
        'Enter your details using the inputs above and the virtual assistant rates calculator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the virtual assistant rates calculator free to use?',
      answer:
        'Yes - this virtual assistant rates calculator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a virtual assistant rates calculator?',
      answer:
        'A virtual assistant rates calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the virtual assistant rates calculator?',
      answer:
        'No account needed. Open the virtual assistant rates calculator, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    "Rate bands are survey estimates ($15–$50/hr by level/region) — not a verified 2026 market benchmark. Adjust them to your market; this is not pay advice.",
    "Weekly cost is simple multiplication (hourly band × weekly hours); it does not model taxes, platform fees, or benefits.",
    "Real VA rates vary by region, niche, and demand — treat every result as an estimate, not a researched market rate.",
  ],
  jsonLd: [],
};
