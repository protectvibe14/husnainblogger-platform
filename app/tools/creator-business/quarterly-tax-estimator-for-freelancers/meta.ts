import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/quarterly-tax-estimator-for-freelancers/';

export const inputs: ToolInput[] = [
  {
    id: 'quarterNetProfit',
    label: 'This quarter\u2019s net profit (optional)',
    type: 'number',
    required: false,
    placeholder: 'e.g. 18000',
    validation: { min: 0 },
  },
  {
    id: 'annualNetProfitEstimate',
    label: 'Estimated annual net profit',
    type: 'number',
    required: true,
    placeholder: 'e.g. 80000',
    validation: { min: 0 },
  },
  {
    id: 'effectiveTaxRatePct',
    label: 'Your effective tax rate % (your own figure — never prefilled)',
    type: 'number',
    required: false,
    placeholder: 'Enter your rate, e.g. 22',
    validation: { min: 0, max: 100, unit: '%' },
  },
  {
    id: 'incomeTaxRatePct',
    label: 'Income tax rate % (optional, for split-rate method)',
    type: 'number',
    required: false,
    placeholder: 'Enter your rate',
    validation: { min: 0, max: 100, unit: '%' },
  },
  {
    id: 'selfEmploymentTaxRatePct',
    label: 'Self-employment tax rate % (optional, for split-rate method)',
    type: 'number',
    required: false,
    placeholder: 'Enter your rate',
    validation: { min: 0, max: 100, unit: '%' },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'estimatedQuarterlyPayment',
    label: 'Estimated quarterly payment',
    type: 'currency',
    description:
    'Free quarterly estimated tax calculator freelancer 2026: Estimated tax for one quarter: estimated annual tax divided by 4. Fast, private.',
  },
  {
    id: 'estimatedAnnualTax',
    label: 'Estimated annual tax',
    type: 'currency',
    description:
    'Estimated total tax for the year from your profit and your rate.',
  },
  {
    id: 'rateBreakdown',
    label: 'Rate breakdown',
    type: 'list',
    description:
    'Step-by-step math showing the rates you entered and the disclaimer.',
  },
];

export const content: ToolContent = {
  title: 'Quarterly Estimated Tax Calculator Freelanc',
  description:
    'Use this quarterly estimated tax calculator for freelancers to estimate payments. Enter your profit and your own tax rate — never prefilled. Try it.',
  howTo: [
    'Enter your estimated annual net profit (income minus business expenses).',
    'Enter YOUR effective tax rate % — the tool never prefills or assumes a rate.',
    'Optionally, use the split-rate method instead: enter both your income tax rate % and your self-employment tax rate % (both are required for this method).',
    'Optionally add this quarter\u2019s net profit for a side-by-side comparison.',
    'Run the tool to get your estimated quarterly payment, estimated annual tax, and a step-by-step breakdown ending with the tax-advice disclaimer.',
  ],
  methodology:
    'Formula J-TAX-EST. Single-rate method: estimatedAnnualTax = annualNetProfitEstimate x (effectiveTaxRatePct / 100); estimatedQuarterlyPayment = estimatedAnnualTax / 4. Split-rate method: estimatedAnnualTax = annualNetProfitEstimate x ((incomeTaxRatePct + selfEmploymentTaxRatePct) / 100); estimatedQuarterlyPayment = estimatedAnnualTax / 4. Every rate is user-entered (0–100); the tool contains no tax brackets, no default rates, and no jurisdiction logic. Results are informational estimates, not tax advice.',
  examples: [
    {
      title: 'Single effective rate',
      inputs: { annualNetProfitEstimate: 80000, effectiveTaxRatePct: 22 },
      note: 'Estimated annual tax $17,600.00 and quarterly payment $4,400.00 from your own 22% rate.',
    },
    {
      title: 'Split income + self-employment rates',
      inputs: {
        annualNetProfitEstimate: 100000,
        incomeTaxRatePct: 20,
        selfEmploymentTaxRatePct: 10,
      },
      note: 'Combined 30% rate gives $30,000.00 annual and $7,500.00 quarterly — both split rates are required.',
    },
    {
      title: 'Quarter profit for comparison',
      inputs: {
        annualNetProfitEstimate: 60000,
        effectiveTaxRatePct: 18,
        quarterNetProfit: 20000,
      },
      note: 'The quarterly figure stays annual/4 ($2,700.00); your reported quarter profit appears in the breakdown for comparison only.',
    },
  ],
  faqs: [
    {
      question: 'What is the best quarterly estimated tax calculator freelancer?',
      answer:
        'The best calculator for freelancers uses YOUR profit and YOUR tax rate with transparent math — and never invents a rate for you. This free tool does exactly that: enter your annual net profit estimate and either a single effective rate or split income/self-employment rates, and it shows the full breakdown plus a tax-advice disclaimer.',
    },
    {
      question: 'Is there a free quarterly estimated tax calculator freelancer?',
      answer:
        'Yes — this quarterly estimated tax calculator for freelancers is completely free with no signup. Enter your profit and your own tax rate to get an estimated quarterly payment and annual total.',
    },
    {
      question: 'How to calculate quarterly estimated tax calculator freelancer?',
      answer:
        'Multiply your estimated annual net profit by your effective tax rate, then divide by 4. For example, $80,000 profit at your own 22% rate gives an estimated $17,600 annual tax and $4,400 per quarter. This tool runs that exact math for you — with the important reminder that the rate must be your own figure.',
    },
    {
      question: 'How does a quarterly estimated tax calculator freelancer work?',
      answer:
        'It takes two things from you — estimated annual net profit and a tax rate you provide — multiplies them for an annual estimate, and divides by 4 for the quarterly figure. This tool never prefills a rate, shows every step in the breakdown, and labels the result an estimate, not tax advice.',
    },
    {
      question: 'What is a quarterly estimated tax calculator freelancer?',
      answer:
        'A quarterly estimated tax calculator freelancer is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'General information only, not tax advice; rules vary by country/state; verify with a tax professional.',
    'The tool knows nothing about tax brackets, deductions, credits, or filing thresholds — it multiplies your profit by your rate, nothing more.',
    'Quarterly payments are estimated as annual/4 for simplicity; real estimated-tax rules (safe harbors, due dates, penalties) are not modeled.',
  ],
  jsonLd: [],
};
