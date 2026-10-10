import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: "serviceType",
    label: "Service type",
    type: "select",
    required: true,
    options: ["audit", "monthly_retainer", "link_building"],
  },
  {
    id: "sitePages",
    label: "Site pages in scope",
    type: "number",
    required: true,
    placeholder: "e.g. 50",
    validation: { min: 1 },
  },
  {
    id: "hoursPerMonth",
    label: "Monthly hours (retainer / link building)",
    type: "number",
    required: true,
    placeholder: "e.g. 20",
    validation: { min: 0.1 },
  },
  {
    id: "rateLowOverride",
    label: "Your low rate in USD (optional override — replaces our bands)",
    type: "number",
    required: false,
    placeholder: "e.g. 1000",
    validation: { min: 0.01 },
  },
  {
    id: "rateHighOverride",
    label: "Your high rate in USD (optional override — replaces our bands)",
    type: "number",
    required: false,
    placeholder: "e.g. 2500",
    validation: { min: 0.01 },
  },
];

export const outputs: ToolOutput[] = [
  { id: "lowRate", label: "Suggested low rate", type: "currency" },
  { id: "highRate", label: "Suggested high rate", type: "currency" },
  { id: "basis", label: "What this estimate is based on", type: "text" },
];

export const content: ToolContent = {
  title: "SEO Freelancer Rates Calculator",
  description:
    "Free seo freelancer rates calculator 2026: estimate audit, retainer and link-building quotes from site pages and monthly hours. —.",
  howTo: [
    "Choose the service type: SEO audit, monthly retainer, or link building.",
    "Enter the number of site pages in scope and your expected monthly hours.",
    "Read the suggested low–high range (USD). Audits are priced as flat projects; retainers and link building scale with hours.",
    "Optional: enter your own low and high rate overrides to replace our bands with numbers from your market.",
    "Use the range as a starting point for quotes — always confirm against your own market rates.",
  ],
  methodology:
    "The calculator multiplies your scope (pages or monthly hours) by rate bands. " +
    "Those bands are unverified placeholders — no 2026 benchmark source was verified for this tool — " +
    "so every result is labeled an estimate and the bands are fully replaceable with your own numbers.",
  examples: [
    {
      title: "Small-site SEO audit",
      inputs: { serviceType: "audit", sitePages: 40, hoursPerMonth: 10 },
      note: "Flat project pricing for a 40-page audit; hours are ignored for audits.",
    },
    {
      title: "20-hour monthly retainer",
      inputs: { serviceType: "monthly_retainer", sitePages: 100, hoursPerMonth: 20 },
      note: "Retainer quote scales with monthly hours on an unverified hourly band.",
    },
    {
      title: "Custom market band",
      inputs: {
        serviceType: "link_building",
        sitePages: 25,
        hoursPerMonth: 10,
        rateLowOverride: 800,
        rateHighOverride: 1600,
      },
      note: "Overrides replace the built-in bands with the user's own market numbers.",
    },
  ],
  faqs: [
    {
      question: "What are typical seo freelancer rates?",
      answer:
        "There is no single best rate — it depends on service type, scope, and experience. This calculator gives an adjustable low–high estimate range so you can pick a number that fits your market.",
    },
    {
      question: "Is there a free seo freelancer rates calculator?",
      answer:
        "Yes — this calculator is free to use with no sign-up. It produces an estimate range for audits, monthly retainers, and link building work.",
    },
    {
      question: "How do I use this seo freelancer rates calculator?",
      answer:
        "Select the service type, enter the site pages in scope and your monthly hours, then read the suggested range. For a realistic quote, replace the built-in bands with your own low/high overrides from your market.",
    },
    {
      question: "How much should I charge for an SEO audit?",
      answer:
        "Audits are priced as flat projects here: choose the audit service type, enter the site pages in scope, and the tool prices a base fee plus a per-page add-on. Monthly hours are ignored for audits — retainers and link building are the ones that scale with hours.",
    },
    {
      question: "Should I price SEO work hourly or as a monthly retainer?",
      answer:
        "It depends on the engagement: this tool prices audits as flat projects and scales monthly retainers and link building with your monthly hours. If a client wants ongoing work, model it as a retainer; for one-off deep dives, use the audit mode.",
    },
    {
      question: "Can I use my own rates instead of the built-in bands?",
      answer:
        "Yes — enter your low and high rate in USD and they fully replace the built-in bands for that calculation. This is the recommended move: the built-in bands are unverified placeholders, so real quotes should run on numbers from your own market.",
    },
    {
      question: "Are the built-in rate bands reliable market data?",
      answer:
        "No — the tool is explicit that no 2026 benchmark source was verified for its bands, and every result is labeled an estimate. Use the range as a starting bracket, then replace the bands with your own low/high overrides for quotes you actually send.",
    },
  ],
  assumptions: [
    "Rate bands are unverified placeholder estimates — no 2026 benchmark source was verified. Adjust them to your market; this is not pricing advice.",
    "Audits are modeled as flat projects (base + per-page add-on); retainers and link building scale with monthly hours on hourly bands.",
    "Real freelance rates vary by niche, experience, region, and demand — treat every result as an estimate, not a researched market rate.",
  ],
  jsonLd: [],
};
