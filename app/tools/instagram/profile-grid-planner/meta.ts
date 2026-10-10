import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/instagram/profile-grid-planner/';

export const inputs: ToolInput[] = [
  {
    id: 'plannedPosts',
    label: 'Planned posts (JSON)',
    type: 'textarea',
    required: true,
    placeholder:
      '[{"slot": 0, "imageRef": "", "captionDraft": "Launch day"}, {"slot": 1, "imageRef": "", "captionDraft": "Behind the scenes"}]',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'gridPreview',
    label: '3x3 grid preview',
    type: 'table',
    description:
    'Free instagram grid planner 2026: All 9 slots with row, column, image/placeholder status and caption preview. Fast, private now.',
  },
  {
    id: 'reorderState',
    label: 'Reorder state (copy)',
    type: 'copy',
    description:
    'JSON of the 9-cell layout state — the planner template uses it for saving and drag-and-drop.',
  },
  {
    id: 'summary',
    label: 'Plan summary',
    type: 'text',
    description:
    'Filled/empty slot counts, storage estimate, and deterministic layout notes.',
  },
];

export const content: ToolContent = {
  title: 'Instagram Grid Planner',
  description:
    'Plan your Instagram grid layout free with a 3x3 visual planner. Map nine posts, preview rows and gaps, and export a storage-safe plan. Start planning now.',
  howTo: [
    'Paste your planned posts into the "Planned posts (JSON)" box as a JSON array — each post looks like {"slot": 0, "imageRef": "", "captionDraft": "Your caption"}.',
    'Use slots 0–8 (top-left is 0, bottom-right is 8); leave imageRef empty for a placeholder, or paste an image dataURL.',
    'Run the tool to validate every post and generate the 3x3 grid preview table.',
    'Read the plan summary for filled/empty counts, row-balance notes, and the image-storage estimate.',
    'Copy the reorder state JSON — the interactive planner uses it for drag-and-drop ordering and saving your plan.',
  ],
  methodology:
    'This tool validates your 9-slot grid state in pure client-side code: slots must be whole numbers 0–8 and unique, imageRef must be empty or a valid image dataURL, and captions are capped at Instagram\'s 2,200-character limit. It maps each slot to its row and column, estimates image data size from base64 length, and compares it against a typical ~5 MB localStorage quota (labeled as an estimate — actual quota varies by browser). Empty slots render as placeholders, and if image data would exceed storage, the tool warns and keeps the plan in memory instead of crashing. Nothing is uploaded anywhere; all computation happens in your browser.',
  examples: [
    {
      title: 'Two posts in the top row',
      inputs: {
        plannedPosts: '[{"slot": 0, "imageRef": "", "captionDraft": "Launch day"}, {"slot": 1, "imageRef": "", "captionDraft": "Behind the scenes"}]',
      },
      note: 'Slots 0 and 1 fill; the other 7 render as placeholders with a row-balance note.',
    },
    {
      title: 'Empty plan',
      inputs: { plannedPosts: '[]' },
      note: 'All 9 slots render as placeholders — a clean starting point for a new grid.',
    },
    {
      title: 'Full grid',
      inputs: {
        plannedPosts:
          '[{"slot":0,"imageRef":"","captionDraft":"A"},{"slot":1,"imageRef":"","captionDraft":"B"},{"slot":2,"imageRef":"","captionDraft":"C"},{"slot":3,"imageRef":"","captionDraft":"D"},{"slot":4,"imageRef":"","captionDraft":"E"},{"slot":5,"imageRef":"","captionDraft":"F"},{"slot":6,"imageRef":"","captionDraft":"G"},{"slot":7,"imageRef":"","captionDraft":"H"},{"slot":8,"imageRef":"","captionDraft":"I"}]',
      },
      note: 'All three rows complete — the summary confirms the 3x3 grid is full.',
    },
  ],
  faqs: [
    {
      question: 'What is the best Instagram grid planner?',
      answer:
        'The best Instagram grid planner shows you a true 3x3 preview of your profile, lets you rearrange posts before publishing, and saves your plan. This tool is free with no signup: map your 9 posts, preview rows and gaps, and copy the layout state for your planning workflow.',
    },
    {
      question: 'Is there a free Instagram grid planner?',
      answer:
        'Yes — this Instagram grid planner is completely free with no signup and no image uploads. Your data stays in your browser; the tool only computes the preview, validation, and storage estimates from the posts you enter.',
    },
    {
      question: 'How to plan Instagram?',
      answer:
        'Start by deciding your grid goal (launch, portfolio, or content mix), draft captions for your next 9 posts, then lay them out in a 3x3 preview so rows look balanced before you publish. Enter those drafts here as JSON, review the row-balance notes, and post in slot order.',
    },
    {
      question: 'How does an Instagram grid planner work?',
      answer:
        'It maps each planned post to one of the 9 grid slots (0–8), shows which slots are filled or placeholders, and flags rows that look unbalanced. This version runs entirely in your browser: it validates your input, estimates image data against a typical ~5 MB localStorage quota, and exports a copyable layout state.',
    },
    {
      question: 'What is an instagram grid planner?',
      answer:
        'An instagram grid planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'What should I include in my instagram grid planner plan?',
      answer: 'Cover your objectives, timeline, resources needed, and success metrics. This tool prompts you for each element so nothing gets missed.',
    },
    {
      question: 'How do I plan instagram grid planner?',
      answer: 'Start by entering your goals and constraints above. The planner organizes everything into a step-by-step plan you can follow or share with your team.',
    },
  ],
  assumptions: [
    'Image data stored as dataURLs lives under a typical ~5 MB localStorage quota — an estimate that varies by browser; the tool warns when your images approach or exceed it.',
    'This page computes validation and summaries only — the visual drag-and-drop grid itself is the interactive template\'s job.',
    'Empty slots are treated as placeholders (gaps), not deleted posts.',
    'Caption limit of 2,200 characters follows Instagram\'s published limit; Instagram may change it.',
  ],
  jsonLd: [],
};
