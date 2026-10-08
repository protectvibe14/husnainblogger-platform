import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'scriptBeats',
    label: 'Script beats (one per line)',
    type: 'textarea',
    required: true,
    placeholder: 'Hook: the one mistake ruining your edits\nDemo: apply the fix live\nCTA: follow for part 2',
  },
  {
    id: 'totalDurationSec',
    label: 'Total duration (seconds)',
    type: 'number',
    required: true,
    placeholder: '30',
    validation: { min: 1 },
  },
  {
    id: 'framesPerBeat',
    label: 'Frames per beat',
    type: 'number',
    required: false,
    placeholder: '1',
    validation: { min: 1, max: 5 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'frames', label: 'Storyboard frames', type: 'table' },
  { id: 'totalCheck', label: 'Duration check', type: 'text' },
];

export const content: ToolContent = {
  title: 'Video Storyboard Planner 2026 – Free Tool | HusnainBlogger',
  description:
    'Use this video storyboard planner to turn script beats into frames: paste beats, set duration and frames per beat, get camera setups and captions. Start now.',
  howTo: [
    'Paste your script beats, one per line — add an optional visual hint after " | ", e.g. "Intro | close-up of the product".',
    'Enter the total duration in seconds.',
    'Set frames per beat (1-5; 1 is the default) if a beat needs multiple angles.',
    'Generate to get a timed frame plan: beat, visual description, camera setup, duration, and caption.',
    'Fill in any visual marked TBD, then sketch or shoot frame by frame.',
  ],
  methodology:
    'Pure planning logic, not AI: the total duration is divided evenly across beats x frames per beat (leftover milliseconds are dealt 1 ms at a time so the plan always sums exactly), and camera setups cycle through a fixed 6-entry bank in order. Beats without a visual hint are marked TBD for you to complete.',
  examples: [
    {
      title: '30-second explainer, 3 beats',
      inputs: {
        scriptBeats: 'Hook: the one mistake ruining your edits\nDemo: apply the fix live\nCTA: follow for part 2',
        totalDurationSec: 30,
        framesPerBeat: 1,
      },
      note: '3 frames of 10,000 ms each; the duration check confirms an exact fit.',
    },
    {
      title: 'Product demo with visual hints',
      inputs: {
        scriptBeats: 'Intro | close-up of the product\nResult | wide hero shot',
        totalDurationSec: 20,
        framesPerBeat: 2,
      },
      note: '4 frames; hints become the visual descriptions and frames 2 and 4 get alternate-angle variants.',
    },
  ],
  faqs: [
    {
      question: 'What is the best video storyboard planner?',
      answer:
        'The best one turns your script into timed visual frames without guesswork. This free planner divides your total duration across script beats, assigns a camera setup to each frame from a fixed rotation, and flags beats missing a visual description as TBD.',
    },
    {
      question: 'Is there a free video storyboard planner?',
      answer:
        'Yes — this planner is completely free with no signup. Paste your script beats, set the duration, and get a timed frame-by-frame plan instantly.',
    },
    {
      question: 'How to plan video storyboard?',
      answer:
        'Break your script into beats (one per line), note an optional visual hint after " | " for each, and set your total duration. The planner allocates exact milliseconds per frame, suggests camera setups, and drafts captions so you can sketch or shoot in order.',
    },
    {
      question: 'How does a video storyboard planner work?',
      answer:
        'It is pure allocation logic, not AI: it splits the total duration evenly across your beats (times frames per beat), cycles camera setups through a fixed 6-entry bank, truncates long beats into captions, and marks missing visuals as TBD. The frame durations always sum exactly to your total.',
    },
    {
      question: 'How does the video storyboard planner work?',
      answer:
        'Enter your details using the inputs above and the video storyboard planner calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the video storyboard planner free to use?',
      answer:
        'Yes - this video storyboard planner is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a video storyboard planner?',
      answer:
        'A video storyboard planner is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'The minimum plannable frame is 1 second — too many beats for the duration returns an error suggesting you merge beats.',
    'Camera setups cycle a fixed 6-entry bank in order; they are suggestions, not shot requirements.',
    'Beats without a visual hint are marked TBD — the planner does not invent visuals for you.',
    'This plans visual frames per beat; the general camera shot list is a separate tool (Shot List Generator).',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Video Storyboard Planner 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/video-editing/storyboard-planner/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Use this video storyboard planner to turn script beats into frames: paste beats, set duration and frames per beat, get camera setups and captions. Start now.',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'CapCut & Video Editing',
          item: 'https://husnainblogger.com/tools/video-editing/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Storyboard Planner',
          item: 'https://husnainblogger.com/tools/video-editing/storyboard-planner/',
        },
      ],
    },
  ],
};
