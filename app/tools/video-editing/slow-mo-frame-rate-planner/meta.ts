import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'sourceFps',
    label: 'Source frame rate (fps)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 120',
    validation: { min: 24, max: 960, unit: 'fps' },
  },
  {
    id: 'timelineFps',
    label: 'Timeline frame rate (fps)',
    type: 'select',
    required: true,
    options: ['24', '25', '30', '60'],
  },
  {
    id: 'desiredSlowFactor',
    label: 'Slow factor (0.5 = half speed)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 0.5',
    validation: { min: 0.05, max: 1 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'achievable', label: 'Smoothly achievable', type: 'text' },
  { id: 'playbackSpeedPct', label: 'Playback speed (%)', type: 'percent' },
  { id: 'effectiveFps', label: 'Effective fps at slow speed', type: 'number' },
  { id: 'qualityVerdict', label: 'Quality verdict', type: 'text' },
  { id: 'shootRecommendation', label: 'Shoot recommendation', type: 'text' },
];

export const content: ToolContent = {
  title: 'Slow Motion FPS Planner',
  description:
    'Plan buttery slow motion before you shoot: enter the source fps, timeline fps, and your slow-motion factor for clean, judder-free frame math.',
  howTo: [
    'Enter your source frame rate — what the camera actually records (24-960 fps).',
    'Pick your timeline frame rate: 24, 25, 30, or 60 fps.',
    'Enter the slow factor you want (0.5 = half speed, 0.25 = quarter speed).',
    'Run the planner to see whether the slow motion is smoothly achievable, the playback speed %, and the effective fps.',
    'If it is not achievable, follow the shoot recommendation — the reshoot frame rate rounded to the next standard step.',
    'Read the quality verdict for judder or light-flicker warnings before you shoot.',
  ],
  methodology:
    'Pure frame-rate arithmetic, no video processing: smooth slow motion needs one real source frame per timeline frame, so it is achievable when sourceFps × slowFactor ≥ timelineFps. playbackSpeedPct = slowFactor × 100; effectiveFps = sourceFps × slowFactor. Even cadence requires the source fps to be a multiple of the timeline fps; otherwise the verdict warns of judder on pans and fast motion. If the factor is not achievable, the reshoot target is ceil(timelineFps / slowFactor) rounded up to the next standard high-speed step (60/120/240/480/960). Sources at 240 fps+ carry a light-flicker warning.',
  examples: [
    {
      title: 'Half-speed on a 24 fps timeline',
      inputs: { sourceFps: 120, timelineFps: '24', desiredSlowFactor: 0.5 },
      note: 'Achievable: 60 real fps cover the 24 fps timeline evenly — smooth native slow motion.',
    },
    {
      title: 'Too ambitious slow factor',
      inputs: { sourceFps: 30, timelineFps: '24', desiredSlowFactor: 0.5 },
      note: 'Not achievable: only 15 real fps for a 24 fps timeline — the plan recommends reshooting at 60 fps.',
    },
  ],
  faqs: [
    {
      question: 'What is the best slow motion fps planner?',
      answer:
        'The best one checks the math before you shoot. This free planner tells you whether your source fps can cover your timeline fps at your chosen slow factor, flags judder when the frame rates do not divide evenly, and gives you the exact reshoot frame rate if the plan fails.',
    },
    {
      question: 'Is there a free slow motion fps planner?',
      answer:
        'Yes — this planner is free with no signup. Enter source fps, timeline fps, and slow factor to get the achievability verdict, playback speed, and shoot recommendation instantly.',
    },
    {
      question: 'How to plan slow motion fps?',
      answer:
        'Multiply your camera fps by your slow factor — the result must be at least your timeline fps (e.g. 120 fps × 0.5 = 60, which covers a 24 fps timeline). If it falls short, reshoot at a higher fps. This planner does that math and warns about judder and light flicker.',
    },
    {
      question: 'How does the slow motion fps planner work?',
      answer:
        'Enter your details using the inputs above and the slow motion fps planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the slow motion fps planner free to use?',
      answer:
        'Yes - this slow motion fps planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a slow motion fps planner?',
      answer:
        'A slow motion fps planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the slow motion fps planner?',
      answer:
        'No account needed. Open the slow motion fps planner, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'Pure arithmetic planning — no video is processed and no frames are analyzed.',
    'Assumes a constant frame rate source; variable-frame-rate phone footage may behave differently.',
    'Even cadence assumes integer frame rates that divide evenly; the judder warning is a heuristic.',
    'The light-flicker warning at 240 fps+ is a heuristic — test under your actual lighting.',
    'Same inputs always produce the same plan — the formulas are fully deterministic.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Slow Motion FPS Planner 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/video-editing/slow-mo-frame-rate-planner/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Plan buttery slow motion before you shoot: enter the source fps, timeline fps, and your slow-motion factor for clean, judder-free frame math.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Video Editing Tools',
          item: 'https://husnainblogger.com/tools/video-editing/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Slow-Mo Frame Rate Planner',
          item: 'https://husnainblogger.com/tools/video-editing/slow-mo-frame-rate-planner/',
        },
      ],
    },
  ],
};
