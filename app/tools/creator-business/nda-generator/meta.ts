import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL =
  'https://husnainblogger.com/tools/creator-business/nda-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'disclosingParty',
    label: 'Disclosing party name',
    type: 'text',
    required: true,
    placeholder: 'Your name or business name',
  },
  {
    id: 'receivingParty',
    label: 'Receiving party name',
    type: 'text',
    required: true,
    placeholder: 'Client name or company',
  },
  {
    id: 'effectiveDate',
    label: 'Effective date',
    type: 'date',
    required: true,
    placeholder: '2026-11-15',
  },
  {
    id: 'confidentialInfoDescription',
    label: 'Description of confidential information',
    type: 'textarea',
    required: true,
    placeholder:
      'e.g. Product launch plans, pricing strategy, and unreleased creative work',
  },
  {
    id: 'termYears',
    label: 'Term (years)',
    type: 'number',
    required: true,
    placeholder: '2',
    validation: { min: 1, max: 50, unit: 'years' },
  },
  {
    id: 'mutual',
    label: 'Mutual NDA (both parties disclose)',
    type: 'boolean',
    required: false,
  },
  {
    id: 'governingLawJurisdiction',
    label: 'Governing law jurisdiction',
    type: 'text',
    required: true,
    placeholder: 'e.g. California, USA (used as-is, not verified)',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'ndaDraftText',
    label: 'NDA draft (copy)',
    type: 'copy',
    description:
    'Free freelance nda template 2026: Sectioned template draft with the mandatory disclaimer — copy it, then have a lawyer. Fast, private now.',
  },
];

export const content: ToolContent = {
  title: 'Freelance NDA Template',
  description:
    'Draft a freelance NDA template fast: enter both parties, the term, and your info description for a sectioned draft. Not legal advice. Try it free.',
  howTo: [
    'Enter the "Disclosing party name" and "Receiving party name" exactly as they should appear.',
    'Set the "Effective date" and describe the confidential information the NDA covers.',
    'Choose the "Term (years)" and tick "Mutual NDA" if both sides will share information.',
    'Type the "Governing law jurisdiction" (used exactly as you write it — not verified).',
    'Copy the "NDA draft" and have a licensed attorney review it before anyone signs.',
  ],
  methodology:
    'The tool assembles a fixed 8-section template (parties, one-way/mutual roles, confidential information definition, obligations, term, governing law, draft status, disclaimer) and interpolates only your own inputs — nothing is written by AI. The disclaimer "Template only — not legal advice. Consult a licensed attorney." is a permanent part of every draft, and the jurisdiction you type is echoed back as unverified.',
  examples: [
    {
      title: 'One-way NDA for a brand collaboration',
      inputs: {
        disclosingParty: 'Ayesha Khan',
        receivingParty: 'GlowCo LLC',
        effectiveDate: '2026-11-15',
        confidentialInfoDescription: 'Product launch plans and pricing strategy',
        termYears: 2,
        mutual: false,
        governingLawJurisdiction: 'California, USA',
      },
      note: 'A one-way 2-year draft protecting the creator’s launch plans.',
    },
    {
      title: 'Mutual NDA with a potential partner',
      inputs: {
        disclosingParty: 'Ayesha Khan',
        receivingParty: 'Northline Agency',
        effectiveDate: '2026-12-01',
        confidentialInfoDescription: 'Audience analytics, rates, and campaign concepts',
        termYears: 3,
        mutual: true,
        governingLawJurisdiction: 'New York, USA',
      },
      note: 'A mutual 3-year draft where both sides share confidential material.',
    },
  ],
  faqs: [
    {
      question: 'What is the best freelance NDA template?',
      answer:
        'The best freelance NDA template covers both parties, defines the confidential information clearly, sets obligations and a term, and names a governing law. This generator assembles all eight of those sections from your inputs as a starting draft.',
    },
    {
      question: 'Is there a free freelance NDA template?',
      answer:
        'Yes — this NDA generator is completely free with no signup. Enter the parties, effective date, confidential information description, term, and jurisdiction, and copy the sectioned draft.',
    },
    {
      question: 'How to use freelance NDA?',
      answer:
        'Fill in both party names, describe what counts as confidential, choose one-way or mutual, set the term and governing law, then copy the draft. Have a licensed attorney review it before anyone signs — a template alone is not advice.',
    },
    {
      question: 'How does a freelance NDA template work?',
      answer:
        'It produces a structured draft from a fixed template with your details inserted: parties, obligations, term, and governing law. This tool never writes legal advice and never signs anything — the draft must be reviewed by counsel.',
    },
    {
      question: 'What is a freelance nda template?',
      answer:
        'A freelance nda template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'What makes a good freelance nda template?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
    {
      question: 'How do I create freelance nda template?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
  ],
  assumptions: [
    'Template only — not legal advice. Consult a licensed attorney. Have counsel review any draft before you rely on or sign it.',
    'The governing-law jurisdiction is your free text, echoed back unvalidated — it is not checked against any legal source.',
    'No electronic signature or signing happens here; this produces a draft only.',
  ],
  jsonLd: [],
};
