import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'promptText',
    label: 'Image prompt',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. a beautiful lighthouse at sunset, dark bright sky --aspec 16:9',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'score',
    label: 'Health score',
    type: 'number',
    description:
    'Free ai prompt debugger 2026: 0–100 score from the public rubric: 100 minus documented deductions. Get instant results. free now.',
  },
  {
    id: 'grade',
    label: 'Grade',
    type: 'text',
    description:
    'A–F grade band for the score.',
  },
  {
    id: 'issues',
    label: 'Issues found',
    type: 'list',
    description:
    'Each issue with severity, explanation and a concrete fix.',
  },
];

export const content: ToolContent = {
  title: 'Prompt Health Debugger & Scorer',
  description:
    'Debug your AI image prompt: get a 0–100 health score, find vague words, conflicts, typos and missing style or lighting — with a fix for every issue.',
  howTo: [
    'Paste your full image prompt, including any parameters like --ar.',
    'Click Debug to run the 8-check rubric over it.',
    'Read your score, grade and the plain-language summary.',
    'Work through each issue — every one includes a concrete fix suggestion.',
    'Re-paste the improved prompt to watch the score climb.',
  ],
  methodology:
    'A fixed, fully public 8-check rubric: prompt length (<15 chars −20, >800 −10), vague words from a 17-word list (−5 each, max −15), contradictory term pairs such as dark/bright (−8 each), missing subject detail (−15), missing style keyword from a 20-term list (−10), missing lighting keyword from a 15-term list (−5), known Midjourney parameter typos like --aspec (−5 each) and comma stuffing (>12 commas −8, >20 −12). Score = 100 − deductions, floored at 0; grades A (90+) to F (<40). No AI judgment — pure keyword and string rules, run entirely in your browser.',
  examples: [
    {
      title: 'Thin vague prompt',
      inputs: { promptText: 'a beautiful dog' },
      note: 'Scores around 60 (C): flags "beautiful" as vague, plus missing style and lighting, each with a fix.',
    },
    {
      title: 'Typo + conflict',
      inputs: { promptText: 'a dark bright lighthouse, photorealistic --aspec 16:9' },
      note: 'Flags the dark/bright conflict and corrects --aspec to --ar.',
    },
  ],
  faqs: [
    {
      question: 'What makes a good image prompt?',
      answer:
        'A clear subject with concrete details, one style keyword (photorealistic, oil painting, anime…), one lighting phrase (soft light, golden hour…), no contradictory terms and no vague filler like "beautiful". This rubric checks exactly those things.',
    },
    {
      question: 'Is the score judged by AI?',
      answer:
        'No. The score is arithmetic: 100 minus fixed deductions from a published 8-check rubric. Every deduction is shown with the rule that triggered it, so you can verify the math yourself.',
    },
    {
      question: 'Why does my prompt lose points for missing style?',
      answer:
        'Without a style keyword the model picks a look at random — photorealistic, painterly, 3D — and you get inconsistent results. Naming the style is the cheapest way to control output.',
    },
    {
      question: 'Does it work for DALL-E or Flux prompts too?',
      answer:
        'The vague-word, conflict, length, style and lighting checks apply to any image prompt. The parameter-typo check is Midjourney-specific and simply will not trigger on plain prose.',
    },
    {
      question: 'How does the ai prompt debugger work?',
      answer:
        'Enter your details using the inputs above and the ai prompt debugger calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai prompt debugger free to use?',
      answer:
        'Yes - this ai prompt debugger is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an ai prompt debugger?',
      answer:
        'An ai prompt debugger is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Keyword lists are fixed English sets — creative or non-English prompts may be mis-scored.',
    'Style/lighting detection is keyword-based; describing style in unusual words will read as "missing".',
    'The score measures prompt hygiene, not artistic quality — a high score does not guarantee a great image.',
  ],
  jsonLd: [],
};
