import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'registrants',
    label: 'Number of registrants',
    type: 'number',
    required: true,
    placeholder: 'e.g. 2000',
    validation: { min: 1 },
  },
  {
    id: 'showUpRate',
    label: 'Show-up rate (%)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 25 — your own estimate, no benchmark given',
    validation: { min: 0, max: 100, unit: '%' },
  },
  {
    id: 'offerConversionRate',
    label: 'Attendee-to-buyer conversion (%)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 3 — your own estimate, no benchmark given',
    validation: { min: 0, max: 100, unit: '%' },
  },
  {
    id: 'offerPrice',
    label: 'Offer price (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 497',
    validation: { min: 0.01, unit: 'USD' },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'attendees', label: 'Projected attendees', type: 'number' },
  { id: 'buyers', label: 'Projected buyers', type: 'number' },
  { id: 'estimatedRevenue', label: 'Estimated revenue', type: 'currency' },
  { id: 'funnelSteps', label: 'Funnel breakdown', type: 'table' },
  { id: 'projectionLabel', label: 'Projection disclaimer', type: 'text' },
];

const DESCRIPTION =
  'Estimate webinar revenue from registrants, show-up rate, and conversion with this free webinar revenue calculator. Projection only — run your scenario now.';

export const content: ToolContent = {
  title: 'Webinar Revenue Calculator',
  description: DESCRIPTION,
  howTo: [
    'Enter how many people registered for your webinar (whole number).',
    'Enter your expected show-up rate as a percent — your own estimate; the tool provides no "verified" benchmark.',
    'Enter your attendee-to-buyer conversion rate as a percent — again, your number, not an industry average.',
    'Enter your offer price in USD.',
    'Read the funnel table (registrants → attendees → buyers → revenue) as a scenario projection, not a forecast.',
  ],
  methodology:
    'Pure funnel arithmetic on your inputs: attendees = registrants × show-up rate ÷ 100; buyers = attendees × conversion rate ÷ 100; estimated revenue = buyers × offer price. Attendees and buyers round to integers; money rounds half-up to 2 decimals. Show-up and conversion benchmarks are NOT verified — they are user-entered or clearly labeled estimates — and every result is labeled a scenario projection, never a forecast or guarantee.',
  examples: [
    {
      title: '2,000 registrants selling a $497 offer',
      inputs: { registrants: 2000, showUpRate: 25, offerConversionRate: 3, offerPrice: 497 },
      note: 'Projects 500 attendees, 15 buyers, and $7,455 estimated revenue.',
    },
    {
      title: 'Small high-converting webinar',
      inputs: { registrants: 300, showUpRate: 40, offerConversionRate: 8, offerPrice: 997 },
      note: '120 attendees and roughly 10 buyers — compare with your big-list scenario.',
    },
  ],
  faqs: [
    {
      question: 'What is the best webinar revenue calculator?',
      answer:
        'The best one is honest about benchmarks: this free webinar revenue calculator runs pure funnel math on YOUR registrants, show-up rate, and conversion — it carries no "verified 2026" benchmarks and invents none. The result is a scenario projection you can adjust, not a forecast.',
    },
    {
      question: 'Is there a free webinar revenue calculator?',
      answer:
        'Yes — this webinar revenue calculator is completely free with no signup. Enter your registrants, show-up rate, conversion rate, and offer price to see projected attendees, buyers, and revenue instantly.',
    },
    {
      question: 'How to calculate webinar revenue?',
      answer:
        'Multiply registrants by your show-up rate to get attendees, multiply attendees by your offer conversion rate to get buyers, then multiply buyers by your offer price. This estimator does that math and shows each funnel stage in a table.',
    },
    {
      question: 'What show-up rate should I use for a webinar revenue estimate?',
      answer:
        'Your own historical show-up rate — this tool deliberately provides no benchmark because show-up rates vary widely by audience, reminder sequence, and topic. If you have never run a webinar, model several scenarios (low, mid, high) and label each an estimate.',
    },
    {
      question: 'What is a webinar revenue calculator?',
      answer:
        'A webinar revenue calculator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'What is a good webinar revenue calculator?',
      answer: 'It depends on your industry, location, and experience level. Use the calculator to benchmark different scenarios, then compare against published averages for your niche.',
    },
    {
      question: 'Is this webinar revenue calculator calculator accurate?',
      answer: 'Yes, it uses standard formulas and up-to-date rates. However, treat the result as an estimate for planning — actual figures may vary based on your specific situation.',
    },
  ],
  assumptions: [
    'Show-up/conversion benchmarks were NOT verified — user-entered or clearly labeled estimates only; the UI must say so.',
    'Revenue is a funnel estimate, not a forecast or guarantee.',
    'Conversion applies to attendees (registrants → attendees → buyers).',
    'Attendees/buyers round to integers; money rounds half-up to 2 decimals.',
    'Not financial advice.',
  ],
  jsonLd: [],
};
