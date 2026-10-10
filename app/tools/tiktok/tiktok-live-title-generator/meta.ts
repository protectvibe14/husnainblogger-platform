import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'liveTopic',
    label: 'LIVE topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. weeknight meal prep, skincare routine, guitar practice',
    validation: { max: 80 },
  },
  {
    id: 'niche',
    label: 'Your niche (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. budget cooking',
    validation: { max: 60 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'liveTitles', label: 'LIVE title options', type: 'list' },
  { id: 'limitNote', label: 'Character-limit honesty note', type: 'text' },
];

const DESCRIPTION =
  'Generate catchy TikTok LIVE title ideas for your stream topic — short, clickable titles from proven patterns. No login needed. Try it free now.';

export const content: ToolContent = {
  title: 'TikTok Live Title Generator',
  description: DESCRIPTION,
  howTo: [
    'Type your LIVE topic into the "LIVE topic" box — for example "weeknight meal prep".',
    'Optional: add your niche so titles read like "budget cooking: weeknight meal prep".',
    'Run the generator to get 8 title options, each capped at 60 characters.',
    'Pick the title with the hook in the first 25-30 characters — that is what scrollers see first.',
    'Paste your chosen title into the TikTok LIVE setup screen and go live.',
    'Read the honesty note under the results: TikTok publishes no official title limit, so 60 is a conservative cap.',
  ],
  methodology:
    'Each run combines 6 fixed title prefixes with 10 fixed hook phrases (60 unique combinations) in a deterministic order seeded by your topic, then trims every title to 60 characters at a word boundary. There is no AI and no TikTok data. The 60-character cap is a conservative best practice — TikTok does not publish an official LIVE title limit.',
  examples: [
    {
      title: 'Cooking stream',
      inputs: { liveTopic: 'weeknight meal prep', niche: 'budget cooking' },
      note: '8 titles combining the niche and topic with hooks like "ask me anything".',
    },
    {
      title: 'No niche',
      inputs: { liveTopic: 'guitar practice session' },
      note: '8 titles built from the topic alone — niche is optional.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok live title ideas?',
      answer:
        'The best LIVE titles front-load a hook in the first 25-30 characters, name the topic clearly, and invite participation ("ask me anything", "live demo"). This free tool generates 8 options from proven prefix-and-hook patterns.',
    },
    {
      question: 'Is there a free tiktok live title ideas?',
      answer:
        'Yes — this LIVE title generator is completely free with no signup. It assembles titles from fixed word banks in your browser, so there is no usage limit.',
    },
    {
      question: 'How to use tiktok live title?',
      answer:
        'Enter your stream topic (and optional niche), generate 8 title options, pick one, then paste it into the title field on TikTok\'s LIVE setup screen before you go live. Keep it under 60 characters as a safe practice — TikTok does not publish an official limit.',
    },
    {
      question: 'What is a tiktok live title ideas?',
      answer:
        'A tiktok live title ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the tiktok live title ideas?',
      answer:
        'No account needed. Open the tiktok live title ideas, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'TikTok does NOT publish an official LIVE title character limit — the 60-character cap is a conservative best practice chosen by this tool, not a platform rule.',
    'Titles are assembled from fixed banks (6 prefixes × 10 hooks); they are pattern-based suggestions, not AI-written copy.',
    'This tool has no access to TikTok: it cannot check what titles are trending or guarantee any title will attract viewers.',
  ],
  jsonLd: [],
};
