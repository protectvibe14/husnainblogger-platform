import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent, BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/tiktok/tiktok-myth-vs-fact-builder/';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'myth',
    label: 'Myth (the claim, as viewers say it)',
    type: 'text',
    required: true,
    placeholder: 'e.g. You only use 10% of your brain',
  },
  {
    id: 'fact',
    label: 'Fact (your verified correction)',
    type: 'text',
    required: true,
    placeholder: 'e.g. You use virtually all of your brain, even in simple tasks',
  },
  {
    id: 'source',
    label: 'Source (optional, shown on screen)',
    type: 'text',
    placeholder: 'e.g. Neuroscience textbooks, CDC guidelines',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'script', label: 'Myth vs fact script', type: 'copy' },
  { id: 'beats', label: 'Script beats', type: 'list' },
];

export const content: ToolContent = {
  title: 'Myth vs Fact TikTok',
  description:
    'Build a myth vs fact tiktok video from your claims: hook, myth setup, reveal, fact beat, and CTA. Never invents facts — free template builder.',
  howTo: [
    'Add one item per myth you want to bust (1–5 per run).',
    'Write the myth exactly as viewers say it — one line, max 200 characters.',
    'Write the fact yourself: your verified correction, max 400 characters. The tool never invents facts.',
    'Optionally add where you verified it (e.g. an official source) — it appears as an on-screen source beat.',
    'Generate to get the full script: hook, myth setup, transition, fact beat, source beat, and CTA.',
    'If your topic touches health, money, or safety, a verify banner is added — check claims against authoritative sources before posting.',
  ],
  methodology:
    'This is a fixed template builder, not AI: a hook, myth-setup line, reveal transition, fact frame, and CTA are picked from fixed banks (8 hooks, 6 setups, 6 transitions, 6 fact frames, 6 CTAs) by a deterministic hash of each item, so the same items always produce the same script. Your myth and fact text are inserted verbatim — never rewritten, verified, or corrected. Items containing health, finance, or safety keywords trigger a fixed "verify with authoritative sources" honesty banner.',
  faqs: [
    {
      question: 'What is the best myth vs fact tiktok?',
      answer:
        'The best myth vs fact videos follow a tight structure: a hook that names the myth, the myth stated as viewers say it, a clear reveal transition, the verified fact, and a CTA asking for the next myth. This builder produces that structure from templates — you supply the real myth and fact.',
    },
    {
      question: 'Is there a free myth vs fact tiktok?',
      answer:
        'Yes — this builder is free and runs entirely in your browser. Add 1–5 myth/fact pairs and get a full script with beats and CTAs, no signup required.',
    },
    {
      question: 'How to use myth vs fact tiktok?',
      answer:
        'Add each myth as an item with your own verified fact, generate the script, then film the beats: hook, myth, transition, fact, source on screen, and CTA. Post only claims you have personally verified — especially for health or money topics.',
    },
    {
      question: 'How does a myth vs fact tiktok work?',
      answer:
        'It works on curiosity and correction: viewers stop for a claim they recognize, stay for the reveal, and remember the fact. The builder assembles that flow from fixed templates; the persuasion comes from your real, verified facts.',
    },
    {
      question: 'How does the myth vs fact tiktok work?',
      answer:
        'Enter your details using the inputs above and the myth vs fact tiktok calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the myth vs fact tiktok free to use?',
      answer:
        'Yes - this myth vs fact tiktok is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a myth vs fact tiktok?',
      answer:
        'A myth vs fact tiktok is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Template-based, not AI: the tool never invents, verifies, or corrects facts — every claim must be true and checked by you.',
    'The verify banner for health/finance/safety topics is a reminder, not legal or medical advice.',
    'Maximum 5 myth/fact pairs per run; myths are capped at 200 characters and facts at 400.',
  ],
  jsonLd: [
        {
          '@type': 'ListItem',
          position: 4,
          name: 'TikTok Myth vs Fact Builder',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
