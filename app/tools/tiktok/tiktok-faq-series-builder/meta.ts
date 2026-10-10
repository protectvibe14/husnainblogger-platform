import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent, BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-faq-series-builder/';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'question',
    label: 'Question (as your audience asks it)',
    type: 'text',
    required: true,
    placeholder: 'e.g. How much does it cost to start?',
  },
  {
    id: 'answerPoints',
    label: 'Your answer points (optional, comma-separated)',
    type: 'text',
    placeholder: 'e.g. A decent phone, a ring light, a tripod',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'seriesPlan', label: 'Full series plan', type: 'copy' },
  { id: 'episodes', label: 'Episode breakdowns', type: 'list' },
];

export const content: ToolContent = {
  title: 'TikTok FAQ Series',
  description:
    'Build a tiktok faq series from your questions: episode hooks, answer-beat outlines, and CTAs. Answers are yours — the tool never invents them. Try it free.',
  howTo: [
    'Add one item per question your audience actually asks (1–20 per run).',
    'Write each question as your audience phrases it — it becomes the episode hook.',
    'Optionally add your own answerPoints, comma-separated (max 4) — your facts, expanded on camera.',
    'Leave answer points blank to get a fixed [ADD YOUR ANSWER HERE] placeholder to fill in yourself.',
    'Generate to get the series plan: series title, intro frame, and one structured episode per question.',
    'Film each episode as written: hook, question on screen, answer beats, outro CTA asking for the next question.',
  ],
  methodology:
    'This is a fixed word-bank builder, not AI: the series title, intro frame, episode hooks, and outro CTAs come from fixed banks (8 titles, 6 intros, 8 hooks, 6 CTAs) picked by a deterministic hash of each question, so the same items always produce the same series. Answers are never invented — your answer points are placed verbatim, or a fixed placeholder is left for you to fill.',
  faqs: [
    {
      question: 'What is the best tiktok faq series?',
      answer:
        'The best FAQ series answers one real audience question per video: the question as a hook, the question on screen, 2–3 answer beats, and a CTA collecting the next question. This builder gives you that structure for up to 20 questions — the answers come from you.',
    },
    {
      question: 'Is there a free tiktok faq series?',
      answer:
        'Yes — this builder is free and runs entirely in your browser. Add your questions and get a series title, intro frame, and per-episode breakdowns with no signup.',
    },
    {
      question: 'How to use tiktok faq series?',
      answer:
        'Add each audience question as an item with your own answer points, generate the plan, then film one episode per question following the beats. Keep episodes under 60 seconds and always end by asking for the next question.',
    },
    {
      question: 'How does a tiktok faq series work?',
      answer:
        'It turns your comment section into a content engine: each answered question trains viewers to ask the next one, and the series format gives followers a reason to keep coming back. The builder structures the series; your real answers make it work.',
    },
    {
      question: 'What is a tiktok faq series?',
      answer:
        'A tiktok faq series is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I build tiktok faq series?',
      answer: 'Fill in the fields with your details and the builder assembles everything into a polished result. Edit any section until it feels right.',
    },
    {
      question: 'Can I save or export my tiktok faq series?',
      answer: 'Yes, copy the result or use your browser\'s print-to-PDF. Everything stays on your device — nothing is uploaded or stored.',
    },
  ],
  assumptions: [
    'Structure builder, not AI: the tool never invents answers — blank answer points leave a placeholder you must fill.',
    'Maximum 20 episodes per run; questions capped at 200 characters, answer points at 160 each (max 4).',
    'The series intro and CTAs are fixed templates; adapt the wording to your voice before filming.',
  ],
  jsonLd: [],
};
