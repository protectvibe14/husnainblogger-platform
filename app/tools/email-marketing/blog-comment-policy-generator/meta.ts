import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'blogName',
    label: 'Blog name',
    type: 'text',
    required: true,
    placeholder: 'e.g. HusnainBlogger',
  },
  {
    id: 'moderationStance',
    label: 'Moderation stance',
    type: 'select',
    required: true,
    options: ['open', 'moderated', 'strict'],
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: true,
    options: ['friendly', 'professional', 'firm'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'policyText', label: 'Comment policy', type: 'copy' },
  { id: 'notice', label: 'Notice', type: 'text' },
];

export const content: ToolContent = {
  title: 'Blog Comment Policy Template',
  description:
    'Set clear comment rules without the awkwardness: pick open, moderated, or strict, choose your tone, and publish a complete policy in seconds.',
  howTo: [
    'Type your blog name.',
    'Choose a moderation stance: open, moderated (first comments held), or strict (everything pre-approved).',
    'Pick a tone: friendly, professional, or firm.',
    'Run the generator to get a complete policy covering welcome rules, banned content, moderation, consequences, and privacy.',
    'Post it on your comments page — and have a lawyer review it, since this is template text, not legal advice.',
  ],
  methodology:
    'Policies are assembled from a bundled library of 24 patterns: 3 tone openers, 3 stance-dependent moderation modules, 3 stance-dependent consequence modules, 5 welcome bullets, 8 banned-content rules, plus fixed privacy and changes notes. The tool picks the modules matching your choices deterministically — no AI, no network requests, identical inputs always produce identical output.',
  examples: [
    {
      title: 'Friendly moderated blog',
      inputs: { blogName: 'HusnainBlogger', moderationStance: 'moderated', tone: 'friendly' },
      note: 'A warm policy with first-comment review and one-warning consequences.',
    },
    {
      title: 'Strict firm policy',
      inputs: { blogName: 'Dev Notes', moderationStance: 'strict', tone: 'firm' },
      note: 'Pre-moderation wording and permanent bans for repeat violations.',
    },
    {
      title: 'Open professional policy',
      inputs: { blogName: 'Travel Diaries', moderationStance: 'open', tone: 'professional' },
      note: 'Comments appear immediately with reader-report moderation.',
    },
  ],
  faqs: [
    {
      question: 'What is the best blog comment policy template?',
      answer:
        'The best policy matches how you actually moderate: open for instant comments, moderated if you review first comments, strict if you pre-approve everything. This free tool generates all three styles in friendly, professional, or firm tones — pick the stance you will truly enforce.',
    },
    {
      question: 'Is there a free blog comment policy template?',
      answer:
        'Yes — this tool is completely free with no signup. Generate a full policy with welcome rules, banned content, moderation process, consequences, and a privacy note, as many times as you like.',
    },
    {
      question: 'How to use blog comment policy?',
      answer:
        'Generate your policy, paste it onto your blog comments page or a dedicated policy page, and link to it from your comment form. Then moderate the way the policy says you will — a policy you do not enforce hurts trust more than having none.',
    },
    {
      question: 'How does a blog comment policy template work?',
      answer:
        'This generator assembles your blog name, moderation stance, and tone into a bundled set of policy sections: what is welcome, what is banned, how moderation works, consequences, privacy, and change notices. It is template text, not legal advice — have a lawyer review it for your jurisdiction.',
    },
    {
      question: 'How does the blog comment policy template work?',
      answer:
        'Enter your details using the inputs above and the blog comment policy template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the blog comment policy template free to use?',
      answer:
        'Yes - this blog comment policy template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a blog comment policy template?',
      answer:
        'A blog comment policy template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Template policy text only — this is not legal advice; have a lawyer review it for your jurisdiction.',
    'Built from 24 bundled patterns (3 tone openers, stance modules, 8 banned-content rules, 5 welcome bullets).',
    'The policy only works if you enforce it the way it is written — pick the stance you will truly follow.',
    'No tracking of commenter behavior — this tool generates text; it does not moderate comments.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Blog Comment Policy Template 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/email-marketing/blog-comment-policy-generator/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Set clear comment rules without the awkwardness: pick open, moderated, or strict, choose your tone, and publish a complete policy in seconds.',
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
          name: 'Blog Comment Policy Generator',
          item: 'https://husnainblogger.com/tools/email-marketing/blog-comment-policy-generator/',
        },
      ],
    },
  ],
};
