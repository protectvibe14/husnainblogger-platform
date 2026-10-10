import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

// tool-218 — Location Tag Idea Generator (generator).

export const inputs: ToolInput[] = [
  {
    id: 'niche',
    label: 'Your niche',
    type: 'text',
    required: true,
    placeholder: 'e.g. fitness, food, travel, fashion',
  },
  {
    id: 'city',
    label: 'City (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. Austin — leave blank for generic ideas',
  },
  {
    id: 'count',
    label: 'Number of ideas',
    type: 'number',
    required: false,
    validation: { min: 1, max: 10 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'locationIdeas', label: 'Location tag ideas', type: 'list' },
  { id: 'copyAll', label: 'Copy all ideas', type: 'copy' },
  { id: 'note', label: 'Source note', type: 'text' },
];

export const content: ToolContent = {
  title: 'Instagram Location Tag Ideas',
  description:
    'Get the best location tags for your niche with these free instagram location tag ideas: enter your niche and city for venue types and geotag tips.',
  howTo: [
    'Enter your niche (fitness, food, travel, fashion, or anything else).',
    'Optionally add your city — leave it blank for generic ideas that work anywhere.',
    'Choose how many ideas you want (1–10).',
    'Generate to get venue-type ideas, each paired with a tag strategy.',
    'Use the Copy-all button and test locations on real posts; compare reach in Insights.',
  ],
  methodology:
    'Ideas come from a fixed pool of 24 venue types and 8 tag strategies, selected by a fixed rotation rule from your niche and city — the tool is fully client-side and is not a live venue or location-tag search, so it never looks up real places.',
  examples: [
    {
      title: 'Fitness creator in Austin',
      inputs: { niche: 'fitness', city: 'Austin', count: 5 },
      note: 'Five venue-type ideas for Austin (coffee shops, gyms, parks…), each with a geotag strategy.',
    },
    {
      title: 'Travel blogger, no city',
      inputs: { niche: 'travel', city: '', count: 4 },
      note: 'Four generic ideas using "your area" as the place — works for any location.',
    },
  ],
  faqs: [
    {
      question: 'What is the best instagram location tag ideas?',
      answer:
        'This free tool gives curated venue-type ideas paired with tag strategies for your niche and city. It is a fixed idea pool, not a live venue search — for the exact tag, use the exact business name as it appears on Instagram.',
    },
    {
      question: 'Is there a free instagram location tag ideas?',
      answer:
        'Yes — this tool is free and runs entirely in your browser. Enter your niche, optionally your city, and get 1–10 venue-type ideas with a copy-all button.',
    },
    {
      question: 'How to use instagram location tag?',
      answer:
        'When posting, tap "Add location" and pick the exact venue. Tags work best when they match where you actually were — posts tagged from the place itself tend to surface on that location page.',
    },
    {
      question: 'How does an instagram location tag ideas work?',
      answer:
        'You enter your niche and city; the tool picks venue-type ideas from a fixed 24-item pool and pairs each with one of 8 fixed tag strategies. It does not search live locations — it gives you idea starters to test.',
    },
    {
      question: 'How does the instagram location tag ideas work?',
      answer:
        'Enter your details using the inputs above and the instagram location tag ideas calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the instagram location tag ideas free to use?',
      answer:
        'Yes - this instagram location tag ideas is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an instagram location tag ideas?',
      answer:
        'An instagram location tag ideas is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Curated ideas only — NOT a live venue or location-tag search; no real places are looked up.',
    'Fixed pool: 24 venue types × 8 tag strategies, selected by a fixed rotation rule.',
    'Location reach also depends on the post itself — test ideas and compare in Instagram Insights.',
  ],
  jsonLd: [],
};
