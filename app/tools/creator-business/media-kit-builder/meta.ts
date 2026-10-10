import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { BuilderField } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/media-kit-builder/';

export const inputs: ToolInput[] = [];

export const itemFields: BuilderField[] = [
  {
    id: 'profileName',
    label: 'Profile name (first row)',
    type: 'text',
    required: true,
    placeholder: 'e.g. Ayesha Khan',
  },
  {
    id: 'niche',
    label: 'Niche (first row)',
    type: 'text',
    required: true,
    placeholder: 'e.g. budget travel',
  },
  {
    id: 'bio',
    label: 'Bio (first row)',
    type: 'text',
    required: false,
    placeholder: 'e.g. Travel creator helping you explore on a budget.',
  },
  {
    id: 'email',
    label: 'Contact email (first row)',
    type: 'text',
    required: false,
    placeholder: 'e.g. hello@example.com',
  },
  {
    id: 'website',
    label: 'Website (first row)',
    type: 'url',
    required: false,
    placeholder: 'https://example.com',
  },
  {
    id: 'services',
    label: 'Services, comma-separated (first row)',
    type: 'text',
    required: false,
    placeholder: 'e.g. Sponsored Reel, UGC Video Pack',
  },
  {
    id: 'rateRange',
    label: 'Rate range (first row)',
    type: 'text',
    required: false,
    placeholder: 'e.g. $200-$500 per post',
  },
  {
    id: 'platform',
    label: 'Platform',
    type: 'text',
    required: true,
    placeholder: 'e.g. Instagram',
  },
  {
    id: 'followers',
    label: 'Followers',
    type: 'text',
    required: true,
    placeholder: 'e.g. 25000',
  },
  {
    id: 'engagementRate',
    label: 'Engagement rate % (first row value is used)',
    type: 'text',
    required: false,
    placeholder: 'e.g. 4.2',
  },
  {
    id: 'profileUrl',
    label: 'Profile URL',
    type: 'url',
    required: false,
    placeholder: 'https://instagram.com/yourhandle',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'mediaKit',
    label: 'Media kit document (copy)',
    type: 'copy',
    description:
    'Free influencer media kit builder 2026: Structured media kit: profile, audience, services, and contact. Get instant results. free now.',
  },
  {
    id: 'totalFollowers',
    label: 'Total followers',
    type: 'number',
    description:
    'Sum of followers across all platform rows.',
  },
  {
    id: 'primaryPlatform',
    label: 'Primary platform',
    type: 'text',
    description:
    'The platform with the most followers.',
  },
  {
    id: 'platformCount',
    label: 'Platforms listed',
    type: 'number',
    description:
    'Number of platform rows in the kit.',
  },
  {
    id: 'engagementBand',
    label: 'Engagement band',
    type: 'text',
    description:
    'Rough heuristic band for the rate you reported (low/average/strong/exceptional).',
  },
];

export const content: ToolContent = {
  title: 'Influencer Media Kit Builder',
  description:
    'Build a pro influencer media kit in minutes. Add platforms, stats, services, and rates for a polished, shareable media kit. Free now.',
  howTo: [
    'Fill the first row with your profile fields: profile name, niche, bio, email or website, services (comma-separated), and rate range.',
    'Add one row per platform with the platform name, follower count, engagement rate, and profile URL.',
    'Run the tool to assemble your structured media kit document.',
    'Copy the media kit document and paste it into your pitch emails or a one-pager.',
    'Check the engagement band note: it reflects the rate YOU reported, labeled as self-reported.',
  ],
  methodology:
    'This tool assembles the stats you provide into a structured media kit (profile, audience, services, collaborations, contact). Total followers is the plain sum of your platform rows; each platform gets an audience-share percentage; your engagement rate is placed into a rough heuristic band (<1% low, 1-3% average, 3-6% strong, >6% exceptional) and labeled "as reported by creator". No metric is verified, estimated, or fetched — everything comes from your inputs. It produces no visual design or PDF layout; it builds the data the layout renders.',
  examples: [
    {
      title: 'Travel creator, two platforms',
      inputs: {
        profileName: 'Ayesha Khan',
        niche: 'budget travel',
        email: 'hello@ayesha.travels',
        platform: 'Instagram',
        followers: '120000',
        engagementRate: '4.2',
      },
      note: 'Builds a kit with total followers 120,000, primary platform Instagram, and a "strong" engagement band.',
    },
    {
      title: 'New creator, zero followers',
      inputs: {
        profileName: 'New Creator',
        niche: 'tech reviews',
        website: 'https://newcreator.example',
        platform: 'YouTube',
        followers: '0',
      },
      note: 'Still builds the kit and flags the growth stage instead of erroring.',
    },
    {
      title: 'Comma-separated services',
      inputs: {
        profileName: 'Ayesha Khan',
        niche: 'budget travel',
        email: 'hello@ayesha.travels',
        services: 'Sponsored Reel, UGC Video Pack',
        rateRange: '$200-$500 per post',
        platform: 'TikTok',
        followers: '80000',
      },
      note: 'Services become a list and the rate range is preserved in the bio.',
    },
  ],
  faqs: [
    {
      question: 'What is the best influencer media kit builder?',
      answer:
        'The best media kit builder turns your real stats into a clean, shareable document fast: profile, follower counts per platform, engagement rate, services, past deals, and contact. This free builder assembles exactly that from your inputs — no signup — and labels self-reported numbers honestly.',
    },
    {
      question: 'Is there a free influencer media kit builder?',
      answer:
        'Yes — this influencer media kit builder is completely free with no signup. Enter your profile details and one row per platform, then copy the structured media kit into your pitches.',
    },
    {
      question: 'How to build influencer media?',
      answer:
        'Start with your name, niche, and bio, then list each platform with follower counts and your engagement rate. Add the services you sell, any past brand deals, and your contact details. This builder formats all of it into a one-page-ready media kit document.',
    },
    {
      question: 'What is an influencer media kit builder?',
      answer:
        'An influencer media kit builder is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the influencer media kit builder?',
      answer:
        'No account needed. Open the influencer media kit builder, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'How do I build influencer media kit builder?',
      answer: 'Fill in the fields with your details and the builder assembles everything into a polished result. Edit any section until it feels right.',
    },
    {
      question: 'Can I save or export my influencer media kit builder?',
      answer: 'Yes, copy the result or use your browser\'s print-to-PDF. Everything stays on your device — nothing is uploaded or stored.',
    },
  ],
  assumptions: [
    'All follower counts, rates, and brand names are user-provided — the tool performs no verification of claimed metrics.',
    'Engagement rate is self-reported; the band (<1% low, 1-3% average, 3-6% strong, >6% exceptional) is a rough heuristic, not a measurement or guarantee.',
    'Output is structured data only, not a designed PDF or styled page.',
  ],
  jsonLd: [],
};
