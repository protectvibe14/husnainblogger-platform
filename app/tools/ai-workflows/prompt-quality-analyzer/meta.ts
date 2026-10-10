import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'promptText',
    label: 'Your prompt',
    type: 'textarea',
    required: true,
    placeholder: 'Paste the AI prompt you want to score…',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'totalScore', label: 'Total score', type: 'number' },
  { id: 'scoreBand', label: 'Band', type: 'text' },
  {
    id: 'criteriaScores',
    label: 'Per-criterion breakdown',
    type: 'table',
    description:
    'Free ai prompt quality checker 2026: Your score on each of the five rubric criteria, with notes. Get instant results. free now.',
  },
  {
    id: 'suggestions',
    label: 'How to improve',
    type: 'list',
    description:
    'Rule-based tips from the rubric for each criterion you did not max out.',
  },
];

export const content: ToolContent = {
  title: 'AI Prompt Quality Checker',
  description:
    'Score your AI prompt against a published 5-criterion rubric: 0-100 score, per-criterion breakdown, rule-based tips. Free - check yours now.',
  howTo: [
    'Paste your full AI prompt into the Your prompt box (at least 20 characters).',
    'Click run to score it against the published rubric below.',
    'Read your total score, band, and the per-criterion breakdown.',
    'Work through the improvement tips for any criterion you did not max out.',
    'Edit your prompt and score it again to see your score rise.',
  ],
  methodology:
    'This tool scores prompts against a published, transparent rubric totaling 100 points — not an AI judge. ' +
    '1) Task clarity (25): starts with an action verb = 25; 2+ action verbs = 18; 1 = 10; none = 5. ' +
    '2) Context & background (20): 120+ words = 20; 60–119 = 14; 30–59 = 8; under 30 = 4. ' +
    '3) Output format (20): any format cue (markdown, table, bullet, word count…) = 20, else 0. ' +
    '4) Constraints & boundaries (20): 2+ constraint cues (don\'t, avoid, must, only…) = 20; 1 = 12; none = 0. ' +
    '5) Examples, role, or tone (15): any cue (example, "you are", "act as", tone, audience) = 15, else 0. ' +
    'Bands: 85+ Excellent, 70–84 Good, 50–69 Fair, below 50 Needs work. ' +
    'Only the first 5000 characters are scored. The score measures observable prompt-engineering signals; ' +
    'it cannot judge semantic quality, creativity, or the correctness of any answer the prompt would produce.',
  examples: [
    {
      title: 'Strong prompt',
      inputs: {
        promptText:
          "Write a 300-word beginner's guide to email list building in markdown format with a comparison table and bullet points. Do not use jargon. Avoid hype. You are an experienced marketer writing for small business owners. For example, show how to place a signup form. Must include exactly three sections with at least two bullet points each, and only recommend free tools.",
      },
      note: 'Scores in the Excellent band — clear task, format, constraints, role, and example.',
    },
    {
      title: 'Weak prompt',
      inputs: { promptText: 'Give me ideas for my blog about cooking healthy family meals tonight please' },
      note: 'Scores in the Needs work band — only the action verb earns points.',
    },
  ],
  faqs: [
    {
      question: 'What is the best AI prompt quality checker?',
      answer:
        'The best checker is a transparent one: it shows exactly what it measures. This tool scores your prompt against a published 5-criterion rubric (task clarity, context, format, constraints, examples) and explains every point.',
    },
    {
      question: 'Is there a free AI prompt quality checker?',
      answer:
        'Yes — this AI Prompt Quality Checker is free with no signup. Paste any prompt of 20+ characters and get a 0–100 score with a full breakdown instantly.',
    },
    {
      question: 'How do you check AI prompt quality?',
      answer:
        'Check for the five things this rubric measures: a clear action task, enough context, a specified output format, boundaries, and an example or role. Score your prompt above to see which ones you are missing.',
    },
    {
      question: 'How does an AI prompt quality checker work?',
      answer:
        'This one is a rubric scorer, not an AI judge: it checks your prompt text for observable signals like action verbs, word count, and format or constraint keywords, then totals them into a 0–100 score with rule-based improvement tips.',
    },
    {
      question: 'Is my prompt text sent anywhere?',
      answer:
        'No. The analyzer is a rule-based scorer, not an AI judge — it reads the observable signals in your prompt (action verbs, word count, format and constraint keywords) entirely in your browser. Nothing is uploaded, and there are no AI calls or API costs involved at all.',
    },
    {
      question: 'Can a low-scoring prompt still work fine?',
      answer:
        'Yes — the 0–100 score measures best-practice signals, not guaranteed results. A two-line prompt for a simple task can score low and still work, because it genuinely needs less context and fewer constraints. Use the score to spot missing ingredients (a clear task, context, output format, boundaries, an example), not as a verdict on your idea.',
    },
    {
      question: 'Do I need AI credits or an API key to use it?',
      answer:
        'No. This analyzer uses fixed, published rules — no model calls, no tokens, no keys. Paste any prompt of 20+ characters and you get a 0–100 score with a full breakdown instantly, free, with no signup.',
    },
  ],
  assumptions: [
    'A transparent rubric scorer — not an AI judge. It cannot assess semantic quality, creativity, or answer correctness.',
    'Context is measured by word count only, which is a rough proxy for background detail.',
    'Only the first 5000 characters of a prompt are scored.',
    'English-focused: action verbs and cue lists are English.',
  ],
  jsonLd: [],
};
