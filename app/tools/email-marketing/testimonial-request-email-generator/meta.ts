import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/email-marketing/testimonial-request-email-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'clientName',
    label: 'Client name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Sarah',
  },
  {
    id: 'product',
    label: 'Product or service',
    type: 'text',
    required: true,
    placeholder: 'e.g. Content Calendar Pro',
  },
  {
    id: 'specificAsk',
    label: 'What should they mention?',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. how it helped you plan a month of content in one afternoon',
  },
  {
    id: 'incentive',
    label: 'Thank-you incentive (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. a $10 Amazon gift card',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'subjectOptions',
    label: 'Subject line options',
    type: 'list',
    description:
    'Free testimonial request email template 2026: 5 subject-line options assembled from fixed templates with the client name and product. Fast, private.',
  },
  {
    id: 'bodyDraft',
    label: 'Request email draft',
    type: 'copy',
    description:
    'Full request draft: greeting, the ask, an easy-reply prompt, optional incentive, and closer.',
  },
];

export const content: ToolContent = {
  title: 'Testimonial Request Email Template',
  description:
    'Ask for testimonials people actually write: add your client, the product they used, and your specific ask for 5 subject lines plus a ready draft.',
  howTo: [
    'Enter the client name and the product or service they used.',
    'Describe exactly what you want them to mention (the "specific ask").',
    'Optionally add a thank-you incentive, such as a gift card or discount.',
    'Run the tool to get 5 subject-line options and a full request draft.',
    'Copy the draft, replace [Your Name], and send it from your own email.',
  ],
  methodology:
    'The generator assembles your email from fixed template banks (10 subject patterns, 6 openers, 5 ask framings, 5 "make it easy" lines, 5 incentive lines, 5 closers, 4 sign-offs) filled with your own inputs — no AI, no guessing. The incentive paragraph appears only when you enter an incentive. Variant selection is a deterministic hash of your inputs, so the same inputs always produce the same draft.',
  examples: [
    {
      title: 'SaaS testimonial request',
      inputs: {
        clientName: 'Sarah',
        product: 'Content Calendar Pro',
        specificAsk: 'how it helped you plan a month of content in one afternoon',
        incentive: 'a $10 Amazon gift card',
      },
      note: 'Friendly ask with a concrete prompt and a small gift incentive.',
    },
    {
      title: 'Service testimonial, no incentive',
      inputs: {
        clientName: 'Marcus',
        product: 'Website Redesign Package',
        specificAsk: 'the before-and-after difference in your conversion rate',
        incentive: '',
      },
      note: 'No incentive entered, so the draft skips the thank-you paragraph.',
    },
  ],
  faqs: [
    {
      question: 'What is the best testimonial request email template?',
      answer:
        'The best template thanks the client, makes one specific ask (what to mention), keeps the effort tiny ("two sentences is plenty"), and offers an optional thank-you. This free generator builds that structure from fixed templates with your client name, product, and ask.',
    },
    {
      question: 'Is there a free testimonial request email template?',
      answer:
        'Yes — this testimonial request email template generator is completely free with no signup. You get 5 subject lines and a full request draft you can copy and send.',
    },
    {
      question: 'How to use testimonial request email?',
      answer:
        'Enter the client name, the product they used, and the specific point you want them to mention, plus an optional thank-you incentive. Run the tool, pick a subject line, copy the draft, replace [Your Name], and send it personally.',
    },
    {
      question: 'How does the testimonial request email template work?',
      answer:
        'Enter your details using the inputs above and the testimonial request email template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the testimonial request email template free to use?',
      answer:
        'Yes - this testimonial request email template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a testimonial request email template?',
      answer:
        'A testimonial request email template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the testimonial request email template?',
      answer:
        'No account needed. Open the testimonial request email template, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Drafts are assembled from fixed template banks (10 subject patterns, 6 openers, 5 ask framings, 5 ease lines, 5 incentive lines, 5 closers, 4 sign-offs) — no AI copywriting is involved.',
    'Always send testimonial requests yourself and only to real clients — the tool cannot verify your relationship with the recipient.',
    'Very long inputs are truncated with a visible notice.',
  ],
  jsonLd: [
  ],
};
