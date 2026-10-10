import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'role',
    label: 'Role',
    type: 'text',
    required: true,
    placeholder: 'e.g. product designer',
  },
  {
    id: 'seniority',
    label: 'Seniority',
    type: 'select',
    required: true,
    options: ['Junior', 'Mid-level', 'Senior', 'Lead'],
  },
  {
    id: 'interviewType',
    label: 'Interview type',
    type: 'select',
    required: true,
    options: ['Behavioral', 'Technical', 'Culture fit'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'questions',
    label: 'Interview questions',
    type: 'list',
    description:
    'Free interview question generator 2026: 10 bank questions plus 3 seniority-specific questions, with your role inserted. Fast, private now.',
  },
];

export const content: ToolContent = {
  title: 'Interview Question Generator',
  description:
    'Generate interview questions for any role: behavioral, technical or culture-fit banks with seniority-specific add-ons. Free prep list needed.',
  howTo: [
    'Enter the role you are preparing for, e.g. product designer.',
    'Choose the seniority level you are targeting.',
    'Pick the interview type: behavioral, technical or culture fit.',
    'Click Generate to get 13 questions with your role filled in.',
    'Write bullet-point answers for each, then practice them out loud.',
  ],
  methodology:
    'Fixed question banks — 15 templates each for behavioral, technical and culture-fit interviews, plus 3 seniority-specific templates per level (junior, mid-level, senior, lead). Your role is inserted into {role} placeholders, and 10 bank questions are selected by a deterministic hash rotation so different roles get different starting points. No AI model, no company-specific tailoring — pure template logic run entirely in your browser.',
  examples: [
    {
      title: 'Mid-level designer, behavioral',
      inputs: { role: 'product designer', seniority: 'Mid-level', interviewType: 'Behavioral' },
      note: 'Returns 10 behavioral templates (e.g. "Tell me about a time you missed a deadline as a product designer…") plus 3 mid-level add-ons.',
    },
    {
      title: 'Senior engineer, technical',
      inputs: { role: 'backend engineer', seniority: 'Senior', interviewType: 'Technical' },
      note: 'Returns 10 technical templates plus 3 senior-level questions about direction-setting and growing others.',
    },
  ],
  faqs: [
    {
      question: 'Are these questions tailored to my company?',
      answer:
        'No — and the tool says so on the page. These are proven template questions with your role inserted. For company-specific prep, research the company’s values, product and recent news and write 3–5 custom questions of your own.',
    },
    {
      question: 'How should I use the generated list?',
      answer:
        'Do not memorize scripts. For each question, jot 2–3 bullet points (situation, action, result for behavioral questions), then practice answering out loud. Recruiters notice structure more than polish.',
    },
    {
      question: 'Why do I get the same questions for the same role?',
      answer:
        'Selection is deterministic — a hash of your role, seniority and type picks the starting point in the bank. That keeps results stable and shareable; change the role wording slightly if you want a different rotation.',
    },
    {
      question: 'Can I use this as an interviewer?',
      answer:
        'Yes. The banks work as a structured interview checklist — pick the type that matches the round you are running and add your own role-specific technical deep-dives on top.',
    },
    {
      question: 'What is an interview question generator?',
      answer:
        'An interview question generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I create interview question generator?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
    {
      question: 'Can I customize the generated interview question generator?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
  ],
  assumptions: [
    'Template-based questions with role inserts — a starting point for prep, not role-expert or company-specific questions.',
    'Technical questions are role-aware but generic; deep specialist interviews need custom questions.',
    'English templates; role names in other languages are inserted verbatim.',
  ],
  jsonLd: [],
};
