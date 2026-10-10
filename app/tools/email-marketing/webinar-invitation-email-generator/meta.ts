import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/email-marketing/webinar-invitation-email-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'webinarTitle',
    label: 'Webinar title',
    type: 'text',
    required: true,
    placeholder: 'e.g. Email List Growth Masterclass',
  },
  {
    id: 'dateTime',
    label: 'Date and time',
    type: 'text',
    required: true,
    placeholder: 'e.g. Oct 15, 2026 at 2:00 PM EST',
  },
  {
    id: 'speaker',
    label: 'Speaker',
    type: 'text',
    required: true,
    placeholder: 'e.g. Jane Doe',
  },
  {
    id: 'benefits',
    label: 'Benefits (one per line)',
    type: 'textarea',
    required: true,
    placeholder: 'Grow your list faster\nWrite emails people open\nAutomate follow-ups',
  },
  {
    id: 'cta',
    label: 'Call to action',
    type: 'text',
    required: true,
    placeholder: 'e.g. https://example.com/register',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'subjectOptions',
    label: 'Subject line options',
    type: 'list',
    description:
    'Free webinar invitation email template 2026: 5 subject-line options assembled from fixed templates with your title, speaker, and date. Fast, private.',
  },
  {
    id: 'bodyDraft',
    label: 'Invitation email draft',
    type: 'copy',
    description:
    'Full invitation draft: greeting, title, speaker, date, benefit bullets, CTA, and PS.',
  },
];

export const content: ToolContent = {
  title: 'Webinar Invitation Email Template',
  description:
    'Fill your webinar seats with a better invite: enter the title, date, time, speaker, and attendee benefits for 5 subject lines plus a complete draft.',
  howTo: [
    'Enter your webinar title exactly as you want it to appear.',
    'Enter the date and time, including the timezone (e.g. Oct 15, 2026 at 2:00 PM EST).',
    'Add the speaker name and list the attendee benefits, one per line.',
    'Paste your registration link or call-to-action text.',
    'Run the tool to get 5 subject-line options and a full invitation draft you can copy.',
  ],
  methodology:
    'The generator assembles your draft from fixed template banks (12 subject patterns, 6 openers, 4 body paragraphs, 6 CTA lines, 6 PS lines, 4 sign-offs) filled with your own inputs — no AI, no guessing. Variant selection is a deterministic hash of your inputs, so the same inputs always produce the same draft. Inputs are capped in length, truncated with a visible notice, and HTML-escaped so the output stays plain text.',
  examples: [
    {
      title: 'List-growth masterclass',
      inputs: {
        webinarTitle: 'Email List Growth Masterclass',
        dateTime: 'Oct 15, 2026 at 2:00 PM EST',
        speaker: 'Jane Doe',
        benefits: 'Grow your list faster\nWrite emails people open\nAutomate follow-ups',
        cta: 'https://example.com/register',
      },
      note: 'Classic expert-led webinar with three benefit bullets.',
    },
    {
      title: 'Product walkthrough webinar',
      inputs: {
        webinarTitle: 'Content Calendar Pro: Live Walkthrough',
        dateTime: 'Nov 2, 2026 at 11:00 AM PST',
        speaker: 'The OptiOfficial Team',
        benefits: 'See every feature in action\nAsk questions live\nGet the setup checklist',
        cta: 'https://example.com/walkthrough',
      },
      note: 'Demo-style webinar with a live Q&A promise.',
    },
  ],
  faqs: [
    {
      question: 'What is the best webinar invitation email template?',
      answer:
        'The best template names the webinar, the speaker, and the date up front, lists 3–5 concrete attendee benefits as bullets, and ends with one clear registration CTA. This free generator builds exactly that structure from your inputs, with 5 subject-line options to choose from.',
    },
    {
      question: 'Is there a free webinar invitation email template?',
      answer:
        'Yes — this webinar invitation email template generator is completely free with no signup. You get 5 subject lines and a full invitation draft you can copy into any email tool.',
    },
    {
      question: 'How to use webinar invitation email?',
      answer:
        'Enter your webinar title, date and time with timezone, speaker name, the benefits attendees will get (one per line), and your registration link. Run the tool, pick a subject line, copy the draft, and send it through your email platform.',
    },
    {
      question: 'How does a webinar invitation email template work?',
      answer:
        'It fills fixed template patterns with your details: the title, speaker, and date go into the greeting and body, your benefits become bullet points, and your link becomes the call to action. Nothing is invented — every fact in the draft comes from what you entered.',
    },
    {
      question: 'How does the webinar invitation email template work?',
      answer:
        'Enter your details using the inputs above and the webinar invitation email template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the webinar invitation email template free to use?',
      answer:
        'Yes - this webinar invitation email template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a webinar invitation email template?',
      answer:
        'A webinar invitation email template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Drafts are assembled from fixed template banks (12 subject patterns, 6 openers, 4 body paragraphs, 6 CTA lines, 6 PS lines, 4 sign-offs) — no AI copywriting is involved.',
    'The tool does not verify your date, time, or registration link — double-check them before sending.',
    'Very long inputs are truncated with a visible notice; benefit lists are capped at 6.',
  ],
  jsonLd: [
  ],
};
