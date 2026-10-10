import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'brand',
    label: 'Brand name',
    type: 'text',
    required: true,
    placeholder: 'e.g. GlowLab',
    validation: { max: 120 },
  },
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. skincare for beginners',
    validation: { max: 120 },
  },
  {
    id: 'contentType',
    label: 'Content type you offer',
    type: 'select',
    required: true,
    options: [
      'Product unboxing video',
      'Testimonial-style review',
      'Day-in-my-life integration',
      'Before/after transformation',
      'Photo carousel post',
    ],
  },
  {
    id: 'rate',
    label: 'Your rate (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. $150 (leave blank to stay flexible)',
    validation: { max: 120 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'pitch',
    label: 'Your UGC pitch (copy)',
    type: 'copy',
    description:
    'Free ugc pitch template 2026: The full outreach message with your brand, niche, and rate filled in. Get instant results. free now.',
  },
  {
    id: 'deliverablesList',
    label: 'Deliverables included',
    type: 'list',
    description:
    'What the pitch promises, matched to your content type.',
  },
  {
    id: 'followUpTemplate',
    label: 'Follow-up message (copy)',
    type: 'copy',
    description:
    'A polite nudge to send if the brand does not reply in a week.',
  },
];

export const content: ToolContent = {
  title: 'UGC Pitch Template',
  description:
    'Use a proven ugc pitch template to message brands: enter the brand, your niche, and content type, get a copyable pitch plus follow-up. Free —.',
  howTo: [
    'Type the brand name in the "Brand name" field (for example, "GlowLab").',
    'Enter your niche in the "Your niche" field (for example, "skincare for beginners").',
    'Choose the content type you are offering from the dropdown.',
    'Optionally add your rate — leave it blank to keep the pitch flexible.',
    'Click run, copy your pitch, and use the follow-up template if you hear nothing in a week.',
  ],
  methodology:
    'This tool is a client-side template engine, not AI. A fixed pitch template is filled with your brand name, niche, content type, and rate (or a flexible-rate line when left blank). Deliverables come from a fixed bank of 4 items per content type, and the follow-up message is a fixed template with the same slots. Same inputs always produce the same pitch.',
  examples: [
    {
      title: 'Skincare creator pitching unboxing',
      inputs: { brand: 'GlowLab', niche: 'skincare for beginners', contentType: 'Product unboxing video', rate: '$150' },
      note: 'Gets a full pitch with unboxing deliverables, the $150 rate line, and a follow-up message.',
    },
    {
      title: 'Fitness creator, no rate set',
      inputs: { brand: 'FitFuel', niche: 'home workouts', contentType: 'Testimonial-style review' },
      note: 'Gets a pitch with testimonial deliverables and the flexible-rate line.',
    },
  ],
  faqs: [
    {
      question: 'What is the best ugc pitch template?',
      answer:
        'A strong UGC pitch names the brand, states your niche, lists clear deliverables, and ends with one simple ask — a quick chat. This tool generates exactly that structure with a follow-up message included, so you can send polished outreach in minutes.',
    },
    {
      question: 'Is there a free ugc pitch template?',
      answer:
        'Yes — this UGC Pitch Template Generator is completely free with no signup. Enter the brand, your niche, and content type to get a copyable pitch, deliverables list, and follow-up message instantly.',
    },
    {
      question: 'How to use ugc pitch?',
      answer:
        'Fill in the brand name, your niche, and the content type you offer, then run the tool. Copy the pitch, replace "[Your Name]" with your name, personalize one line about the brand, and send it. If you hear nothing in a week, send the generated follow-up.',
    },
    {
      question: 'What is an ugc pitch template?',
      answer:
        'An ugc pitch template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the ugc pitch template?',
      answer:
        'No account needed. Open the ugc pitch template, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'Can I customize the generated ugc pitch template?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
    {
      question: 'What makes a good ugc pitch template?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
  ],
  assumptions: [
    'The pitch is a template — it cannot promise replies, deals, or payment from brands.',
    'Personalize one line per brand before sending; identical mass messages get ignored and Instagram may limit bulk DM outreach.',
  ],
  jsonLd: [],
};
