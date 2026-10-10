import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/pinned-comment-idea-bank/';

const DESCRIPTION =
  'Get fresh youtube pinned comment ideas in seconds: pick engagement, corrections, or links and copy 4 fill-in-the-blank comment templates. Generate ideas free!';

export const inputs: ToolInput[] = [
  {
    id: 'topic',
    label: 'Video topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. sourdough baking, email marketing, budget travel',
  },
  {
    id: 'goal',
    label: 'Comment goal',
    type: 'select',
    required: true,
    options: ['engagement', 'corrections', 'links'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'comments', label: 'Pinned comment suggestions', type: 'list' },
  { id: 'copyAll', label: 'Copy all comments', type: 'copy' },
  { id: 'pinTips', label: 'How to pin a comment', type: 'list' },
  { id: 'honestyNote', label: 'What this tool is (and is not)', type: 'text' },
  { id: 'count', label: 'Comments generated', type: 'number' },
];

export const content: ToolContent = {
  title: 'Youtube Pinned Comment Ideas',
  description: DESCRIPTION,
  howTo: [
    'Type your video topic into the "Video topic" field (e.g. sourdough baking).',
    'Pick a goal: engagement (replies and polls), corrections (fixes and updates), or links (resources).',
    'Run the tool to get 4 fill-in-the-blank comment templates with your topic inserted.',
    'Fill in the bracketed placeholders — timestamps, corrections, or links — in your own words.',
    'Copy your favorite, paste it as a comment on your video, then pin it in YouTube Studio → Comments.',
  ],
  methodology:
    'Template assembly from a fixed bank of 12 hand-written comment templates (4 per goal: engagement, corrections, links). The {topic} placeholder is replaced with your topic verbatim; templates are returned in fixed bank order. No AI writes anything, and the tool cannot post or pin comments to YouTube — the how-to-pin steps are included because pinning is always manual.',
  examples: [
    {
      title: 'Engagement comments for a baking video',
      inputs: { topic: 'sourdough baking', goal: 'engagement' },
      note: 'Returns 4 reply-inviting comments, e.g. a beginner-vs-pro poll and a next-video vote.',
    },
    {
      title: 'Correction comments for a tutorial',
      inputs: { topic: 'email marketing', goal: 'corrections' },
      note: 'Returns 4 correction/update templates with timestamp placeholders to fill in.',
    },
    {
      title: 'Link comments for a travel video',
      inputs: { topic: 'budget travel', goal: 'links' },
      note: 'Returns 4 resource comments with (paste your link) placeholders for your description links.',
    },
  ],
  faqs: [
    {
      question: 'what is the best youtube pinned comment ideas?',
      answer:
        'The best pinned comments serve one goal: engagement comments ask a question or run a poll, correction comments fix mistakes with timestamps, and link comments route viewers to resources. This free tool gives you 4 fill-in-the-blank templates per goal from a fixed 12-template bank.',
    },
    {
      question: 'is there a free youtube pinned comment ideas?',
      answer:
        'Yes — this pinned comment idea bank is completely free with no signup. Pick engagement, corrections, or links, get 4 templates with your topic filled in, and copy them to pin manually in YouTube Studio.',
    },
    {
      question: 'how to use youtube pinned comment?',
      answer:
        'Post a comment on your own video, then pin it: YouTube Studio → Comments → find the comment → three dots → Pin. Only one comment can be pinned per video, so pin the one matching your goal. This tool writes the comment text; pinning is always done by you.',
    },
    {
      question: 'how does a youtube pinned comment ideas work?',
      answer:
        'You enter your topic and goal, and the tool fills your topic into 4 hand-written templates from a fixed 12-template bank — no AI involved. It cannot post or pin comments for you (no YouTube API connection), so you copy the text and pin it manually.',
    },
    {
      question: 'What is a youtube pinned comment ideas?',
      answer:
        'A youtube pinned comment ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'How do I use this youtube pinned comment ideas tool?',
      answer: 'Enter your details in the fields above and get instant results. Everything runs in your browser — no signup, no waiting, no data uploaded.',
    },
    {
      question: 'Is this youtube pinned comment ideas tool really free?',
      answer: 'Yes, completely free with no account required. Use it as many times as you want — there are no usage limits or hidden paywalls.',
    },
  ],
  assumptions: [
    'Template library: all 12 comments come from a fixed hand-written bank — nothing is AI-generated.',
    'Copy-paste only: the tool cannot post or pin comments to YouTube; pinning happens manually in YouTube Studio.',
    'Fill in the bracketed placeholders (timestamps, links, corrections) with your real details before posting.',
    'Only one comment can be pinned per video — choose the goal that matters most for each upload.',
  ],
  jsonLd: [],
};
