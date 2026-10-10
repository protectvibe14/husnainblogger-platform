import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/youtube-seo-score-checker/';

const DESCRIPTION =
  'Run a free youtube seo score checker — a 10-point heuristic checklist scoring your title, description, tags, chapters and thumbnail text. Audit your video now.';

export const inputs: ToolInput[] = [
  {
    id: 'title',
    label: 'Video title',
    type: 'text',
    required: true,
    placeholder: 'Paste your video title — e.g. "Budget Travel Tips for Beginners"',
    validation: { max: 500 },
  },
  {
    id: 'targetKeyword',
    label: 'Target keyword',
    type: 'text',
    required: false,
    placeholder: 'The main keyword you want the video to be found for',
  },
  {
    id: 'description',
    label: 'Description',
    type: 'textarea',
    required: false,
    placeholder: 'Paste your full video description here',
    validation: { max: 20000 },
  },
  {
    id: 'tags',
    label: 'Tags (comma-separated)',
    type: 'text',
    required: false,
    placeholder: 'e.g. budget travel tips, cheap flights, travel guide',
  },
  {
    id: 'chapters',
    label: 'Chapters (one per line)',
    type: 'textarea',
    required: false,
    placeholder: '0:00 Intro\n2:15 Flights\n5:40 Hotels',
  },
  {
    id: 'thumbnailText',
    label: 'Thumbnail text',
    type: 'text',
    required: false,
    placeholder: 'The overlay text on your thumbnail, if any',
  },
];

export const outputs: ToolOutput[] = [
  { id: 'score', label: 'Metadata completeness score (0–100)', type: 'number' },
  { id: 'grade', label: 'Grade', type: 'text' },
  { id: 'checkResults', label: 'Per-factor pass/fail', type: 'list' },
  { id: 'fixes', label: 'Fix list', type: 'list' },
  { id: 'disclaimer', label: 'Honesty disclaimer', type: 'text' },
];

export const content: ToolContent = {
  title: 'Youtube SEO Score Checker',
  description: DESCRIPTION,
  howTo: [
    'Enter your video title (required) and your target keyword if you have one.',
    'Paste your description, comma-separated tags, and chapters (one "0:00 Name" per line).',
    'Optionally enter your thumbnail overlay text for the readability readiness check.',
    'Run the checker — each of the 10 published checks passes or fails with an explanation.',
    'Work through the fix list, then re-run to confirm your metadata completeness score.',
  ],
  methodology:
    'The tool scores 10 published on-page checks with fixed weights that sum to 100: keyword in title (15), keyword front-loaded (10), title ≤70 chars (10), description ≥200 chars (10), keyword in first 150 description chars (10), valid chapters from 0:00 (10), link in description (5), tags present and ≤500 chars (10), a tag matching the keyword (10), thumbnail text present (10). This is a metadata completeness score, not a ranking prediction: YouTube publishes no ranking formula, and watch time, CTR, and audience behavior — which this tool cannot see — drive actual performance.',
  examples: [
    {
      title: 'Fully optimized metadata',
      inputs: {
        title: 'budget travel tips for beginners',
        targetKeyword: 'budget travel tips',
        description:
    'budget travel tips for beginners: save money on flights, hotels, and food. Full guide at https://example.com. 0:00 Intro\n2:15 Flights\n5:40 Hotels.',
        tags: 'budget travel tips, travel, cheap flights',
        chapters: '0:00 Intro\n2:15 Flights\n5:40 Hotels',
        thumbnailText: 'TRAVEL CHEAP',
      },
      note: 'All 10 checks pass — score 100, grade Excellent.',
    },
    {
      title: 'Title only',
      inputs: { title: 'my video' },
      note: 'Only the title-length check passes — score 10, grade Weak, with 9 concrete fixes.',
    },
    {
      title: 'Missing keyword',
      inputs: {
        title: 'Budget Travel Tips for Beginners',
        description:
    'x.'.repeat(250),
        tags: 'travel, cheap flights',
      },
      note: 'Without a target keyword the 4 keyword-dependent checks fail and the score drops accordingly.',
    },
  ],
  faqs: [
    {
      question: 'what is the best youtube seo score checker?',
      answer:
        'The most honest checkers score what they can actually measure: your metadata completeness. This free tool runs 10 published on-page checks (keyword placement, title length, description, chapters, tags, thumbnail text) into a 0–100 score — but no checker can predict ranking, because YouTube publishes no ranking formula.',
    },
    {
      question: 'is there a free youtube seo score checker?',
      answer:
        'Yes — this checker is completely free with no signup. Paste your title, description, tags, and chapters to get a 0–100 metadata completeness score with per-factor pass/fail and a fix list.',
    },
    {
      question: 'how to check youtube seo score?',
      answer:
        'Enter your video title, target keyword, description, tags, and chapters into the tool above. It scores 10 published checks and lists exactly what to fix — then verify real performance in YouTube Studio, since metadata is only part of the picture.',
    },
    {
      question: 'how does a youtube seo score checker work?',
      answer:
        'This one applies 10 fixed checks with published weights totaling 100 points: keyword in title and front-loaded, title length, description length and keyword placement, valid chapters, a description link, tag limits and relevance, and thumbnail text presence. Failed checks produce concrete fixes. It measures metadata completeness, never ranking likelihood.',
    },
    {
      question: 'What is a youtube seo score checker?',
      answer:
        'A youtube seo score checker is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The score measures metadata completeness, not ranking likelihood — YouTube publishes no ranking formula and watch time/CTR/audience behavior are not visible to this tool.',
    'The 4 keyword-dependent checks cannot pass without a target keyword; the tool does not guess your keyword.',
    'Thresholds (70 title chars, 200 description chars, 500 tag chars) reflect widely recommended on-page practices and YouTube\'s real limits, not official ranking factors.',
  ],
  jsonLd: [],
};
