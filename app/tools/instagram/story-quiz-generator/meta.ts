import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/story-quiz-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. email marketing, sourdough baking, guitar',
  },
  {
    id: 'count',
    label: 'Number of quizzes',
    type: 'number',
    required: false,
    placeholder: '3',
    validation: { min: 1, max: 5 },
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'quizzes',
    label: 'Quiz ideas',
    type: 'table',
    description:
    'Free instagram story quiz ideas 2026: Quiz question, four answer options, the correct answer, and why. Get instant results. free now.',
  },
  {
    id: 'copyAll',
    label: 'Copy all quizzes',
    type: 'copy',
    description:
    'All quiz ideas as plain text, ready to paste.',
  },
  {
    id: 'quizCount',
    label: 'Quizzes generated',
    type: 'number',
    description:
    'How many quiz ideas were generated.',
  },
];

export const content: ToolContent = {
  title: 'Instagram Story Quiz Ideas',
  description:
    'Get instagram story quiz ideas with 4 options, the correct answer, and an explanation. Enter a topic, copy ready-to-post quizzes — free.',
  howTo: [
    'Type your topic into the "Topic" box — e.g. "email marketing" or "guitar".',
    'Choose how many quizzes you want with "Number of quizzes" (1–5, defaults to 3).',
    'Run the tool to get quiz questions, each with four labeled options (A–D), the correct answer, and a one-line explanation.',
    'Use "Copy all quizzes" to grab everything as plain text.',
    'In Instagram, add a Quiz sticker to your story and paste in the question, the four options, and mark the correct answer.',
  ],
  methodology:
    'This tool assembles quizzes from a fixed bank of 8 hand-written multiple-choice templates, returning the first N in bank order and inserting your topic verbatim. The marked answers are common-sense defaults (start small, stay consistent, track progress) — not verified facts about your topic — so review them before posting. Nothing is written by AI.',
  examples: [
    {
      title: 'Music quizzes',
      inputs: { topic: 'guitar', count: 2 },
      note: 'Two multiple-choice quizzes about guitar with marked answers.',
    },
    {
      title: 'Full set of five',
      inputs: { topic: 'freelancing', count: 5 },
      note: 'All five quiz templates filled with the freelancing topic.',
    },
    {
      title: 'Default count',
      inputs: { topic: 'yoga' },
      note: 'Omitting the count gives you the default 3 quizzes.',
    },
  ],
  faqs: [
    {
      question: 'What is the best instagram story quiz ideas?',
      answer:
        'The best instagram story quiz ideas ask a question your followers can guess at — with one clearly correct answer and a short explanation. This tool gives you 8 such multiple-choice templates: enter a topic and each quiz comes with four options, the marked answer, and a why-it-works line.',
    },
    {
      question: 'Is there a free instagram story quiz ideas?',
      answer:
        'Yes — this instagram story quiz ideas generator is completely free with no signup. You can generate between 1 and 5 quiz ideas per run, and run it again for as many topics as you like.',
    },
    {
      question: 'How to use instagram story?',
      answer:
        'Enter a topic and pick how many quizzes you want (1–5), then copy a question with its four options. In the Instagram app, create a story, add the Quiz sticker, paste the question and options, and tap the correct answer to mark it before sharing.',
    },
    {
      question: 'How does an instagram story quiz ideas work?',
      answer:
        'You provide a topic, and the tool fills 8 fixed, hand-written quiz templates with your topic — each with four labeled options, a marked correct answer, and a one-line explanation. The answers are common-sense defaults, not verified facts, so give them a quick review before posting.',
    },
    {
      question: 'What is an instagram story quiz ideas?',
      answer:
        'An instagram story quiz ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'What makes a good instagram story quiz ideas?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
    {
      question: 'How do I create instagram story quiz ideas?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
  ],
  assumptions: [
    'Quizzes come from 8 fixed multiple-choice templates — not AI generation.',
    'Marked answers are common-sense defaults, not verified facts about your topic — review and adapt them before posting.',
    'Quiz ideas are starting points — adapt the wording to your voice and audience.',
  ],
  jsonLd: [],
};
