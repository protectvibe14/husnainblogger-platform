import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. personal finance, meal prep, skincare',
    validation: { max: 100 },
  },
  {
    id: 'stance',
    label: 'Your stance on the video',
    type: 'select',
    required: true,
    options: ['agree', 'debunk', 'add-context', 'funny'],
  },
  {
    id: 'videoDescription',
    label: 'Video description (optional)',
    type: 'textarea',
    required: false,
    placeholder:
      'Optional: paste a short description of the video you want to stitch — e.g. "a creator claiming protein powder is a scam". This tool never fetches videos from TikTok.',
    validation: { max: 500 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'stitchPrompts', label: 'Stitch prompts: opening line + response angle', type: 'list' },
  { id: 'filmingTips', label: 'Filming tips for this stance', type: 'list' },
];

const DESCRIPTION =
  'Start conversations with this TikTok stitch prompt generator — openers designed to earn stitches from creators in your space. Invite creative responses.';

export const content: ToolContent = {
  title: 'TikTok Stitch Prompt Generator',
  description: DESCRIPTION,
  howTo: [
    'Type your niche into the "Your niche" box — for example "personal finance".',
    'Pick your stance: agree (back the video up), debunk (correct it), add-context (fill the missing piece), or funny (parody it).',
    'Optional: paste a short description of the video you plan to stitch so the prompts reference it. Nothing is fetched from TikTok.',
    'Run the generator to get 5 prompts — each with a ready opening line and a response angle — plus filming tips for your stance.',
    'Open the TikTok app, tap Share then Stitch on the video, and deliver your opening line exactly as written.',
  ],
  methodology:
    'Each run draws from fixed template banks (6 opening lines and 6 response angles per stance, 3 filming tips per stance) using a deterministic hash of your niche and stance, so identical inputs always return the same 5 prompts. There is no AI and no TikTok access — a pasted video description is only quoted back as text you supplied; nothing is fetched or verified.',
  examples: [
    {
      title: 'Debunk finance clip',
      inputs: { niche: 'personal finance', stance: 'debunk' },
      note: '5 correction-style prompts with opening lines that challenge the original video respectfully.',
    },
    {
      title: 'Funny take on meal prep',
      inputs: {
        niche: 'meal prep',
        stance: 'funny',
        videoDescription: 'a creator meal-prepping 21 identical chicken bowls',
      },
      note: '5 comedy prompts that quote your video description back so you can tailor the joke.',
    },
    {
      title: 'Agree with skincare tip',
      inputs: { niche: 'skincare', stance: 'agree' },
      note: '5 validation-style prompts focused on backing the original video up with your own proof.',
    },
  ],
  faqs: [
    {
      question: 'What is the best tiktok stitch ideas?',
      answer:
        'The best stitch ideas take a clear stance: agree and add proof, debunk with a correction, add missing context, or go funny with a parody. This free tool generates 5 opening lines with response angles for each stance, tailored to your niche.',
    },
    {
      question: 'Is there a free tiktok stitch ideas?',
      answer:
        'Yes — this stitch prompt generator is completely free with no signup. It assembles prompts from fixed templates in your browser, so there is no usage limit.',
    },
    {
      question: 'How to use tiktok stitch?',
      answer:
        'In the TikTok app, open a video that allows stitches, tap the Share arrow, then tap Stitch. Choose up to 5 seconds of the original clip, then record your response. If the Stitch button is missing, the creator has disabled stitches on that video.',
    },
    {
      question: 'How does a tiktok stitch ideas work?',
      answer:
        'This tool takes your niche, your stance (agree, debunk, add-context, or funny), and optionally a short description you paste of the target video, then assembles 5 prompts from fixed template banks. It cannot fetch or preview videos from TikTok — you still pick and stitch the video inside the TikTok app.',
    },
    {
      question: 'What is a tiktok stitch ideas?',
      answer:
        'A tiktok stitch ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'What makes a good tiktok stitch prompt generator?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
    {
      question: 'How do I create tiktok stitch prompt generator?',
      answer: 'Describe what you need in the input fields, then click generate. You can regenerate as many times as you like and copy the version that fits best.',
    },
  ],
  assumptions: [
    'Prompts come from fixed template banks (6 openers and 6 angles per stance) — they are starting lines, not AI-written scripts.',
    'This tool cannot fetch, preview, or verify TikTok videos. A pasted description is quoted back as text you supplied; nothing is checked against TikTok.',
    'Stitch availability depends on the original creator\'s settings; this tool cannot enable stitches on someone else\'s video.',
  ],
  jsonLd: [],
};
