import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/booking-page-copy-generator/';
const DESCRIPTION =
  'Write booking page copy that converts: enter your service and audience to get a full headline-to-CTA page draft instantly. Try it free today!';

export const inputs: ToolInput[] = [
  {
    id: 'serviceName',
    label: 'Service name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Brand identity design',
  },
  {
    id: 'targetClient',
    label: 'Target client',
    type: 'text',
    required: true,
    placeholder: 'e.g. early-stage SaaS founders',
  },
  {
    id: 'benefits',
    label: 'Benefits',
    type: 'textarea',
    required: false,
    placeholder: 'one benefit per line',
  },
  {
    id: 'processSteps',
    label: 'Process steps',
    type: 'textarea',
    required: false,
    placeholder: 'one step per line, in order',
  },
  {
    id: 'priceAnchor',
    label: 'Price anchor (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. $250 per session — echoed as you type it',
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: false,
    options: ['friendly', 'professional', 'bold', 'warm'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'bookingPageCopy',
    label: 'Booking page copy (copy)',
    type: 'copy',
    description:
    'The full page draft — headline, subhead, benefits, process, FAQ stub, and CTA.',
  },
];

export const content: ToolContent = {
  title: 'Booking Page Copy',
  description: DESCRIPTION,
  howTo: [
    'Enter your service name and target client (both required).',
    'List your benefits and process steps, one per line (optional — placeholders are used if you skip them).',
    'Pick a tone: friendly, professional, bold, or warm.',
    'Optionally add a price anchor — it is echoed exactly as you type it.',
    'Generate, then copy the full page draft and edit it for your voice before publishing.',
  ],
  methodology:
    'This tool fills a fixed page template (headline, subhead, who-it-is-for, benefits, process, price anchor, FAQ stub, final CTA) with your inputs. Headlines and CTAs are picked deterministically from fixed word banks (12 headlines, 4 subhead templates, 12 CTA lines across 4 tones); your price anchor is echoed verbatim; FAQ answers are [bracketed] prompts for you to fill in. No AI runs — the output is a starting draft, not finished copy.',
  examples: [
    {
      title: 'Brand designer booking page',
      inputs: {
        serviceName: 'Brand identity design',
        targetClient: 'early-stage SaaS founders',
        benefits: 'A logo suite that looks funded\nBrand guidelines your team can actually use',
        processSteps: 'Discovery call\nConcepts in 7 days\nRevisions and final delivery',
        tone: 'professional',
      },
      note: 'Full page draft with a professional tone — edit the bracketed FAQ answers before publishing.',
    },
    {
      title: 'Coach with a price anchor',
      inputs: {
        serviceName: '1:1 business coaching',
        targetClient: 'solo founders',
        benefits: 'A 90-day action plan\nWeekly accountability calls',
        processSteps: 'Free intro call\nRoadmap session\nWeekly coaching',
        priceAnchor: '$500/month',
        tone: 'warm',
      },
      note: 'Adds an Investment section echoing your $500/month anchor exactly as typed.',
    },
  ],
  faqs: [
    {
      question: 'What is the best booking page copy?',
      answer:
        'The best booking page copy names the service, names the client, lists concrete benefits, shows the process, and ends with one clear call-to-action. This free generator assembles exactly that structure from your details — how persuasive it is still depends on your offer and proof.',
    },
    {
      question: 'Is there a free booking page copy?',
      answer:
        'Yes — this generator is completely free with no signup. Everything is assembled in your browser from fixed templates; nothing is stored or sent anywhere.',
    },
    {
      question: 'How to use booking?',
      answer:
        'Enter your service name and target client, list benefits and process steps one per line, pick a tone, and optionally add a price anchor. The tool returns a full page draft — headline, subhead, benefits, process, FAQ stub, and CTA — for you to edit.',
    },
    {
      question: 'How does a booking page copy work?',
      answer:
        'It fills a fixed page template (headline, subhead, who it is for, benefits, process, price anchor, FAQ stub, CTA) with your inputs, picking headline and CTA lines from fixed word banks — 12 headlines, 4 subheads, 12 CTAs across 4 tones. No AI runs; the output is a starting draft, not finished copy.',
    },
    {
      question: 'How does the booking page copy work?',
      answer:
        'Enter your details using the inputs above and the booking page copy calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the booking page copy free to use?',
      answer:
        'Yes - this booking page copy is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a booking page copy?',
      answer:
        'A booking page copy is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Output is a starting draft assembled from fixed templates (12 headlines, 4 subheads, 12 CTA lines across 4 tones) — not AI-written copy.',
    'Your price anchor is echoed exactly as you type it; the tool does not validate or suggest pricing.',
    'FAQ answers are [bracketed] prompts for you to fill in.',
    'Edit the draft for your voice and add proof (testimonials, results) before publishing.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Booking Page Copy 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: DESCRIPTION,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Creator Business Tools',
          item: 'https://husnainblogger.com/tools/creator-business/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Booking Page Copy Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
