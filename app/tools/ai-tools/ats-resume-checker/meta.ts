import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'resumeText',
    label: 'Resume text',
    type: 'textarea',
    required: true,
    placeholder: 'Paste your resume text here\u2026',
  },
  {
    id: 'jobDescription',
    label: 'Job description',
    type: 'textarea',
    required: true,
    placeholder: 'Paste the job description here\u2026',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'score',
    label: 'Resume score',
    type: 'number',
    description:
    'Free ats resume checker 2026: Heuristic score out of 100 across 7 transparent checks. free.',
  },
  {
    id: 'checks',
    label: 'Check breakdown',
    type: 'table',
    description:
    'Each check with pass/fail, points earned and an explanation.',
  },
  {
    id: 'keywordOverlapPct',
    label: 'JD keyword overlap',
    type: 'percent',
    description:
    'Share of job-description keywords found in the resume.',
  },
];

export const content: ToolContent = {
  title: 'ATS Resume Checker',
  description:
    'Check your resume against a transparent 100-point rubric: contact info, length, action verbs, numbers, headers, JD keyword overlap. Free heuristic.',
  howTo: [
    'Paste your full resume text into the Resume text field.',
    'Paste the job description you are targeting into the second field.',
    'Click Check resume to run the 7 heuristic checks.',
    'Review the score, the per-check breakdown and the keyword overlap percentage.',
    'Fix the failed checks, re-paste and run again to see your score improve.',
  ],
  methodology:
    'This tool applies a transparent 100-point rubric, all in your browser: contact info (15 pts — email plus phone or link), length (15 pts — 400-1200 words), action verbs (15 pts — 5+ from a fixed 30-word list), quantified results (15 pts — 3+ numbers), section headers (15 pts — 2+ recognized headers), job-description keyword overlap (15 pts — points scale with token-overlap ratio) and first-person pronouns (10 pts — 3 or fewer). It is a heuristic checklist, not a real applicant tracking system — the score is not what an employer\u2019s software would give.',
  examples: [
    {
      title: 'Software engineer resume',
      inputs: { resumeText: 'Jane Doe, jane.doe@example.com, +1 555-234-5678. Experience: led a team of 6, increased revenue by 40%. Skills: TypeScript, React.', jobDescription: 'Senior software engineer, TypeScript, React, cloud infrastructure.' },
      note: 'Scores each rubric check — contact info and verbs pass, length likely fails on this short sample.',
    },
    {
      title: 'Thin resume',
      inputs: { resumeText: 'John, I like coding. Contact me.', jobDescription: 'Data analyst, SQL, dashboards, reporting.' },
      note: 'Fails most checks — no email, too short, no action verbs, zero keyword overlap.',
    },
  ],
  faqs: [
    {
      question: 'Is this a real ATS test?',
      answer:
        'No. Real applicant tracking systems are proprietary and score resumes in ways this tool cannot reproduce. This is a transparent, rule-based checklist that measures surface-level signals like contact info, length, action verbs and keyword overlap.',
    },
    {
      question: 'How is the keyword overlap calculated?',
      answer:
        'Both texts are lowercased, stripped of punctuation and stopwords, and reduced to unique tokens of 4+ letters. Overlap is the share of job-description tokens found in your resume. Points scale with that ratio, so partial matches earn partial credit.',
    },
    {
      question: 'What counts as an action verb?',
      answer:
        'A fixed list of 30 strong verbs — led, built, launched, increased, reduced, streamlined and others. The tool counts occurrences; you need 5 or more to pass that check.',
    },
    {
      question: 'Why does resume length matter?',
      answer:
        'The rubric targets 400-1200 words as a rough band for a complete one-to-two-page resume. Very short resumes usually lack detail; very long ones rarely get fully read. It is a heuristic, not a rule employers enforce.',
    },
    {
      question: 'Is my resume text uploaded anywhere?',
      answer:
        'No. Every check runs in your browser — your resume and the job description never leave your device.',
    },
    {
      question: 'How does the ats resume checker work?',
      answer:
        'Enter your details using the inputs above and the ats resume checker calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ats resume checker free to use?',
      answer:
        'Yes - this ats resume checker is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'The score is a heuristic checklist result, not a prediction of hiring outcomes or of any real ATS score.',
    'Keyword overlap uses simple token matching — it does not understand synonyms, so "JS" will not match "JavaScript".',
    'The tool reads English text best; other languages may fail the verb and header checks.',
  ],
  jsonLd: [],
};
