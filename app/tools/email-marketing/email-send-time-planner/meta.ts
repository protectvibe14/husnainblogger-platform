import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/email-marketing/email-send-time-planner/';

export const inputs: ToolInput[] = [
  {
    id: 'audienceTimezone',
    label: 'Audience timezone',
    type: 'text',
    required: true,
    placeholder: 'e.g. America/New_York',
  },
  {
    id: 'senderTimezone',
    label: 'Your (sender) timezone',
    type: 'text',
    required: true,
    placeholder: 'e.g. Europe/London',
  },
  {
    id: 'cadence',
    label: 'Send cadence',
    type: 'select',
    required: true,
    options: ['weekly', 'biweekly', 'monthly'],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'sendSlots',
    label: 'Converted send slots',
    type: 'list',
    description: 'Free best time to send email 2026: Send slots with sender-local and audience-local times for each band (bands labeled as. Fast, private, no signup - try it now!',
  },
  {
    id: 'bestBandNote',
    label: 'Guidance note',
    type: 'text',
    description: 'Honest note: bands are commonly-cited guidance, not verified open-rate facts; DST caveat included.',
  },
];

export const content: ToolContent = {
  title: 'Best Time to Send Email 2026 – Free Tool | HusnainBlogger',
  description:
    'Plan the best time to send email with timezone conversion. Enter sender and audience zones to get converted slots from common guidance. Free!',
  howTo: [
    'Enter the audience timezone as an IANA name (e.g. America/New_York).',
    'Enter your own (sender) timezone the same way.',
    'Choose your send cadence: weekly, biweekly, or monthly.',
    'Run the tool to get converted send slots — sender-local and audience-local times per band.',
    'Read the guidance note: bands are general guidance, so confirm against your own list’s past open data.',
  ],
  methodology:
    'The planner converts four commonly-cited audience-local time bands (morning 8–10 AM, midday 11 AM–1 PM, afternoon 2–4 PM, early evening 5–7 PM) into your timezone using pure Intl date math — no AI, no network. These bands are general guidance from common industry discussion, NOT verified open-rate facts: the tool never presents open-rate percentages and never claims research-backed optimal times. Offsets are computed for one fixed reference date (2026-10-01) so results are deterministic; the outputs warn that daylight-saving changes can shift real send times by an hour.',
  examples: [
    {
      title: 'US sender, UK audience',
      inputs: {
        audienceTimezone: 'Europe/London',
        senderTimezone: 'America/New_York',
        cadence: 'weekly',
      },
      note: '4 weekly slots; the morning band shows as 4:00 AM sender time for a 9:00 AM audience time.',
    },
    {
      title: 'Same timezone, monthly',
      inputs: {
        audienceTimezone: 'Asia/Dubai',
        senderTimezone: 'Asia/Dubai',
        cadence: 'monthly',
      },
      note: 'Sender and audience times match; 3 monthly slots across the rotating bands.',
    },
  ],
  faqs: [
    {
      question: 'What is the best time to send email?',
      answer:
        'There is no universally verified best time — commonly-cited general guidance points to weekday mornings and midday in the audience’s local timezone, but these are not measured open-rate facts. This free planner converts those guidance bands into your timezone; your own list’s past open data is always a better guide than any general band.',
    },
    {
      question: 'Is there a free best time to send email tool?',
      answer:
        'Yes — this best time to send email planner is completely free with no signup. Enter the sender and audience timezones plus your cadence to get converted send slots, each labeled honestly as general guidance rather than verified fact.',
    },
    {
      question: 'How to use best time to send email guidance?',
      answer:
        'Enter both IANA timezones and your cadence, then run the tool. It shows when each guidance band lands in both timezones. Treat the bands as a starting hypothesis, send at those times, then adjust based on your own open-rate data — and double-check conversions near daylight-saving changes.',
    },
    {
      question: 'How does the best time to send email work?',
      answer:
        'Enter your details using the inputs above and the best time to send email calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the best time to send email free to use?',
      answer:
        'Yes - this best time to send email is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a best time to send email?',
      answer:
        'A best time to send email is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the best time to send email?',
      answer:
        'No account needed. Open the best time to send email, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
  ],
  assumptions: [
    'All "best time" bands are commonly-cited general guidance, NOT verified open-rate facts — no open-rate percentages are presented or implied.',
    'Timezone offsets use a fixed reference date (2026-10-01) for deterministic results; daylight-saving shifts can move real conversions by an hour.',
    'Send days (Tue/Wed/Thu rotation) are commonly-cited guidance, not a researched optimum for your audience.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Best Time to Send Email 2026 – Free Tool | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free best time to send email 2026: Send slots with sender-local and audience-local times for each band (bands labeled as. Fast, private, no signup - try it now!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Email Marketing Tools',
          item: 'https://husnainblogger.com/tools/email-marketing/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Email Send-Time Planner',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
