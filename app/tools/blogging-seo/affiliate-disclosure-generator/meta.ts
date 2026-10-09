import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/affiliate-disclosure-generator/';

export const inputs: ToolInput[] = [
  {
    id: 'placement',
    label: 'Where the disclosure appears',
    type: 'select',
    required: true,
    options: [
      'top',
      'inline',
      'bottom',
    ],
  },
  {
    id: 'programNames',
    label: 'Affiliate program names (optional)',
    type: 'textarea',
    required: false,
    placeholder: 'One per line, e.g.\nAmazon Associates\nShareASale\n\nLeave blank for a generic disclosure.',
  },
  {
    id: 'tone',
    label: 'Tone',
    type: 'select',
    required: false,
    options: [
      'formal',
      'casual',
    ],
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'disclosureText',
    label: 'Disclosure text',
    type: 'copy',
    description: 'Free affiliate disclosure generator 2026: Ready-to-paste plain-text disclosure for your post. Instant, private, and mobile-friendly. No signup - try it free!',
  },
  {
    id: 'disclosureHtml',
    label: 'Disclosure HTML',
    type: 'copy',
    description: 'The same disclosure as an escaped HTML paragraph you can paste into your editor.',
  },
  {
    id: 'legalNotice',
    label: 'Legal notice',
    type: 'text',
    description: 'Honest reminder that disclosure rules vary by country and this is template text, not legal advice.',
  },
];

export const content: ToolContent = {
  title: 'Affiliate Disclosure Generator',
  description:
    'Create a compliant-ready affiliate disclosure with this free affiliate disclosure generator. Pick a placement, add programs, and copy text or HTML now!',
  howTo: [
    'Choose where the disclosure will appear: top of the post, inline next to the link, or at the bottom.',
    'Optionally list your affiliate program names (one per line) — leave blank for a generic disclosure.',
    'Pick a formal or casual tone to match your writing voice.',
    'Run the tool and copy the plain-text disclosure, or grab the HTML version for your editor.',
    'Read the legal notice: disclosure rules vary by country, so review the wording against your local rules.',
  ],
  methodology:
    'The tool selects one template from a fixed bank of 12 (3 placements × 2 tones × named-program and generic variants) and fills in your program names if you provided them. Nothing is written by AI. The HTML version is the same text escaped and wrapped in a <p class="affiliate-disclosure"> paragraph. A legal notice is returned with every result: disclosure requirements vary by country (e.g. the US FTC), and this is template text, not legal advice.',
  examples: [
    {
      title: 'Blog post footer disclosure',
      inputs: {
        placement: 'bottom',
        programNames: 'Amazon Associates',
        tone: 'formal',
      },
      note: 'A formal named disclosure for the bottom of a review post.',
    },
    {
      title: 'Inline link disclosure',
      inputs: {
        placement: 'inline',
        tone: 'casual',
      },
      note: 'A short casual parenthetical that sits next to an affiliate link.',
    },
    {
      title: 'Multi-program top disclosure',
      inputs: {
        placement: 'top',
        programNames: 'ShareASale\nImpact',
        tone: 'formal',
      },
      note: 'Names both programs in one clear statement at the top of the post.',
    },
  ],
  faqs: [
    {
      question: 'what is the best affiliate disclosure generator?',
      answer:
        'The best affiliate disclosure generator gives you ready-to-paste wording for each placement — top, inline, and bottom — plus an HTML version, and is honest that rules vary by country. This free tool does that from a fixed template bank, with no signup.',
    },
    {
      question: 'is there a free affiliate disclosure generator?',
      answer:
        'Yes — this affiliate disclosure generator is completely free with no signup. Choose a placement and tone, optionally add your program names, and copy the text or HTML version instantly.',
    },
    {
      question: 'how to generate affiliate disclosure?',
      answer:
        'Pick where the disclosure goes (top, inline, or bottom), list your affiliate program names or leave it generic, choose a tone, and run the tool. Then paste the result where readers will actually see it — disclosures hidden in footers or behind clicks may not satisfy regulators like the FTC.',
    },
    {
      question: 'how does an affiliate disclosure generator work?',
      answer:
        'It assembles your disclosure from a fixed bank of proven disclosure templates — here, 12 templates covering three placements, two tones, and named or generic programs. Your program names are filled into the chosen template, and you get both plain text and an escaped HTML paragraph.',
    },
    {
      question: 'How does the affiliate disclosure generator work?',
      answer:
        'Enter your details using the inputs above and the affiliate disclosure generator calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the affiliate disclosure generator free to use?',
      answer:
        'Yes - this affiliate disclosure generator is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is an affiliate disclosure generator?',
      answer:
        'An affiliate disclosure generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Template wording only — disclosure requirements vary by country (e.g. the US FTC), and this is not legal advice.',
    'The tool does not verify that your disclosure is sufficient for any specific program or jurisdiction — placement and visibility are your responsibility.',
    'Up to 10 program names are used; extras are ignored.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Affiliate Disclosure Generator 2026 – Free | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free affiliate disclosure generator 2026: Ready-to-paste plain-text disclosure for your post. Instant, private, and mobile-friendly. No signup - try it free!',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Blogging & SEO Tools',
          item: 'https://husnainblogger.com/tools/blogging-seo/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Affiliate Disclosure Generator',
          item: TOOL_URL,
        },
      ],
    },
  ],
};
