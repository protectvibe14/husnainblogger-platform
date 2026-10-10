import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'channelName',
    label: 'Channel name',
    type: 'text',
    required: true,
    placeholder: 'e.g. PixelCraft',
    validation: { max: 100 },
  },
  {
    id: 'niche',
    label: 'Channel niche or topic',
    type: 'text',
    required: true,
    placeholder: 'e.g. pixel art tutorials',
    validation: { max: 60 },
  },
  {
    id: 'uploadSchedule',
    label: 'Upload schedule',
    type: 'text',
    required: true,
    placeholder: 'e.g. New videos every Tuesday and Friday',
    validation: { max: 80 },
  },
  {
    id: 'contactEmail',
    label: 'Contact email (optional)',
    type: 'text',
    required: false,
    placeholder: 'e.g. you@example.com',
    validation: { max: 254 },
  },
];

export const outputs: ToolOutput[] = [
  { id: 'aboutPage', label: 'Channel about page text', type: 'copy' },
  { id: 'charCount', label: 'Character count', type: 'number' },
];

const DESCRIPTION =
  'Write a channel bio that converts with this YouTube about page generator — niche, upload schedule, and contact details combined in one clean draft.';

export const content: ToolContent = {
  title: 'Youtube About Page Generator',
  description: DESCRIPTION,
  howTo: [
    'Enter your channel name, your niche or topic, and your upload schedule.',
    'Add a contact email if you want a business-inquiries line (optional).',
    'Generate — the tool assembles a welcome, what-you-get, schedule, call-to-action, and contact section.',
    'Check the character count stays under 1000, copy the text, and paste it into your channel About tab.',
    'Edit the wording in your own voice before publishing — the template is a starting point.',
  ],
  methodology:
    'The tool fills a fixed 5-section template (welcome, what you will find, upload schedule, call-to-action, contact) with your inputs. The call-to-action line is picked deterministically from a fixed bank of 4 templates based on your channel name — the same inputs always produce the same result. Output is capped at 1000 characters, matching YouTube\'s channel description limit (verified from a secondary source). There is no AI writing involved.',
  examples: [
    {
      title: 'Pixel art channel',
      inputs: {
        channelName: 'PixelCraft',
        niche: 'pixel art',
        uploadSchedule: 'New videos every Tuesday and Friday',
        contactEmail: 'hello@pixelcraft.example',
      },
      note: 'Produces a structured about page with all five sections and a business-inquiries line.',
    },
    {
      title: 'Cooking channel, no email',
      inputs: {
        channelName: 'Weeknight Wins',
        niche: 'quick home cooking',
        uploadSchedule: 'One new recipe every Sunday',
      },
      note: 'The contact section falls back to a generic inquiries line when no email is given.',
    },
  ],
  faqs: [
    {
      question: 'What is the best youtube about page generator?',
      answer:
        'A good one assembles the five sections viewers look for — who you are, what you post, your schedule, a subscribe call-to-action, and contact info — and keeps the result under YouTube\'s 1000-character limit. This free tool does exactly that from a fixed template.',
    },
    {
      question: 'Is there a free youtube about page generator?',
      answer:
        'Yes — this generator is completely free with no signup. Enter your channel name, niche, schedule, and optional contact email, then copy the assembled description straight into your channel About tab.',
    },
    {
      question: 'How to generate youtube about?',
      answer:
        'Fill in your channel name, niche, and upload schedule above, optionally add a contact email, and generate. You get a five-section about page under 1000 characters — copy it, tweak the wording in your own voice, and paste it into YouTube Studio.',
    },
    {
      question: 'How does a youtube about page generator work?',
      answer:
        'This one fills a fixed template with your inputs and picks one of 4 call-to-action lines deterministically from your channel name. It is template assembly, not AI — same inputs always give the same result, and the output is capped at 1000 characters.',
    },
    {
      question: 'How does the youtube about page generator work?',
      answer:
        'Enter your details using the inputs above and the youtube about page generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube about page generator free to use?',
      answer:
        'Yes - this youtube about page generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube about page generator?',
      answer:
        'A youtube about page generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'YouTube\'s channel description limit of 1000 characters is verified from a secondary source — re-check in YouTube Studio if YouTube changes it.',
    'Output is template assembly, not AI-written copy; edit it in your own voice before publishing.',
    'The tool does not publish anything — you paste the result into your channel About tab yourself.',
  ],
  jsonLd: [],
};
