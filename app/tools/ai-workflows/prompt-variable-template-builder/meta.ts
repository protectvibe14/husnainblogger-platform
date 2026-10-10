import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent, BuilderField } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [
  { id: 'lines', label: 'Template summaries with detected variables', type: 'list' },
  { id: 'preview', label: 'Reusable template fill-in preview', type: 'copy' },
  { id: 'warnings', label: 'Unmatched brace warnings', type: 'list' },
];

export const itemFields: BuilderField[] = [
  {
    id: 'templateText',
    label: 'Template text with {variables}',
    type: 'text',
    required: true,
    placeholder: 'e.g. Write a {tone} blog post about {topic} in {length} words.',
  },
];

export const content: ToolContent = {
  title: 'Prompt Template With Variables',
  description:
    'Build a reusable prompt template with variables from your own text: detect every {variable}, preview a fill-in form, and copy it. Free.',
  howTo: [
    'Paste or type your template text with {variables} into the template text field — at least one is required.',
    'Add more rows if you want to build several reusable templates at once.',
    'Run the tool to see each template\'s detected variables listed in order of appearance.',
    'Check the warnings list for unmatched braces, empty {}, or invalid variable names.',
    'Copy the fill-in preview and reuse it: fill in each variable slot before pasting into your AI tool.',
  ],
  methodology:
    'This tool scans your text for {variable} markers using a fixed name pattern (letters, digits, spaces, underscores, hyphens, periods; 1-60 characters) and collapses duplicates in order of first appearance. It writes no prompt content — your text is the template — and reports unmatched braces as warnings instead of failing.',
  faqs: [
    {
      question: 'What is the best prompt template with variables?',
      answer:
        'The best templates keep variables for the parts that change — topic, tone, audience, length — and fix everything else. This free builder detects the {variables} in your text, lists them, and gives you a fill-in preview so the reusable form is ready to copy.',
    },
    {
      question: 'Is there a free prompt template with variables?',
      answer:
        'Yes — this builder is completely free with no signup. You write the template in your own words; the tool just detects the variables and builds the reusable fill-in form for you.',
    },
    {
      question: 'How to use prompt template with variables?',
      answer:
        'Write your prompt once with placeholders like {topic} and {tone}, paste it here, and copy the fill-in preview. Then fill in each slot with your actual values before pasting the result into your AI tool.',
    },
    {
      question: 'How does a prompt template with variables work?',
      answer:
        'A template keeps the fixed instructions in place and swaps only the {variables} each time you run it. This tool finds those variables in your text, checks the braces are matched, and renders a fill-in form — no AI runs and nothing is written for you.',
    },
    {
      question: 'What is a prompt template with variables?',
      answer:
        'A prompt template with variables is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I build prompt template with variables?',
      answer: 'Fill in the fields with your details and the builder assembles everything into a polished result. Edit any section until it feels right.',
    },
    {
      question: 'Can I save or export my prompt template with variables?',
      answer: 'Yes, copy the result or use your browser\'s print-to-PDF. Everything stays on your device — nothing is uploaded or stored.',
    },
  ],
  assumptions: [
    'The tool detects {variables} in your own text — it writes no prompt content itself.',
    'At least one valid {variable} is required per template; unmatched or invalid braces become warnings, not errors.',
    'Variable names are case-sensitive and limited to 60 characters.',
    'Maximum 20 templates per run, 2,000 characters per template.',
  ],
  jsonLd: [],
};
