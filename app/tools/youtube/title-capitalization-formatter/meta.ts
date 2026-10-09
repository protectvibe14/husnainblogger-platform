import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/youtube/title-capitalization-formatter/';

const DESCRIPTION =
  'Format any video title with this YouTube title capitalization tool — Title Case, Sentence case, ALL CAPS, or lowercase, keeping acronyms intact.';

export const inputs: ToolInput[] = [
  {
    id: 'title',
    label: 'Video title',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. how i grew my channel to 10k subscribers',
  },
  {
    id: 'style',
    label: 'Capitalization style',
    type: 'select',
    required: true,
    options: ['Title Case', 'Sentence case', 'ALL CAPS', 'lowercase'],
  },
];

export const outputs: ToolOutput[] = [
  { id: 'formatted', label: 'Formatted title', type: 'copy' },
  { id: 'charCount', label: 'Character count (graphemes)', type: 'number' },
  { id: 'warning', label: 'Length warning', type: 'text' },
];

export const content: ToolContent = {
  title: 'Youtube Title Capitalization Tool',
  description: DESCRIPTION,
  howTo: [
    'Paste your draft video title into the "Video title" box.',
    'Pick a capitalization style: Title Case, Sentence case, ALL CAPS, or lowercase.',
    'Run the tool to get your formatted title with acronyms (AI, USB, DIY) preserved automatically.',
    'Check the character count and length warning — trim the title if it will truncate in search (~70 chars) or exceed YouTube\'s 100-character hard limit.',
    'Copy the formatted title and paste it into YouTube Studio.',
  ],
  methodology:
    'Pure string logic, no AI: the tool applies fixed Title Case rules (first and last words always capitalized; small words like "the", "and", "of" lowercased mid-title), capitalizes hyphenated compounds on both sides, and preserves all-caps acronyms (2+ uppercase letters), internal-capital tokens (iPhone), and digit tokens (4K). Fully-shouted pasted titles are normalized first, restoring a small fixed list of common acronyms. Character counts use graphemes (Intl.Segmenter), so emoji and CJK count as one visible character.',
  examples: [
    {
      title: 'Title Case with acronyms preserved',
      inputs: { title: 'best AI tools for DIY projects in', style: 'Title Case' },
      note: 'AI and DIY stay all-caps while the rest follows Title Case rules.',
    },
    {
      title: 'Sentence case conversion',
      inputs: { title: 'How I Grew My Channel Fast', style: 'Sentence case' },
      note: 'Only the first word is capitalized; everything else is lowered.',
    },
    {
      title: 'ALL CAPS shout',
      inputs: { title: 'new vlog episode', style: 'ALL CAPS' },
      note: 'Uppercases the whole title — best used sparingly for emphasis.',
    },
  ],
  faqs: [
    {
      question: 'what is the best youtube title capitalization tool?',
      answer:
        'The best one follows real style rules instead of just capitalizing every word: it keeps small words like "the" and "of" lowercase mid-title, preserves acronyms like AI and USB, and handles hyphenated words on both sides. This free tool does exactly that and also checks your title against YouTube\'s 100-character limit.',
    },
    {
      question: 'is there a free youtube title capitalization tool?',
      answer:
        'Yes — this tool is free with no signup. Paste your title, choose Title Case, Sentence case, ALL CAPS, or lowercase, and get the formatted result plus a character count and truncation warning, all processed in your browser.',
    },
    {
      question: 'how to use youtube title capitalization?',
      answer:
        'Paste your draft title, pick a style (Title Case is the most common for YouTube), run the formatter, review the length warning, and copy the result into YouTube Studio. Title Case capitalizes major words while keeping small words like "and", "the", and "of" lowercase mid-title.',
    },
    {
      question: 'how does a youtube title capitalization tool work?',
      answer:
        'It applies fixed capitalization rules to your text: Title Case capitalizes the first and last word and all major words; Sentence case capitalizes only the first word; ALL CAPS and lowercase transform everything. This tool adds acronym preservation and grapheme-aware character counting, so emoji-heavy titles are measured by visible characters.',
    },
    {
      question: 'How does the youtube title capitalization tool work?',
      answer:
        'Enter your details using the inputs above and the youtube title capitalization tool calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the youtube title capitalization tool free to use?',
      answer:
        'Yes - this youtube title capitalization tool is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a youtube title capitalization tool?',
      answer:
        'A youtube title capitalization tool is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Title Case follows a Chicago/AP-flavoured rule set; the small-word list is a fixed English set, so non-English titles get structural rules only.',
    'Fully-shouted pasted titles are normalized using a small fixed list of known acronyms — obscure acronyms in shouted titles may not be restored.',
    'Character counts are graphemes; YouTube counts UTF-16 code units, so an emoji-heavy title may be 1–2 characters longer in YouTube\'s counter than reported here.',
    'Titles over 100 graphemes are rejected before formatting; the ~70-character search-truncation flag is a conservative display guideline.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Youtube Title Capitalization Tool 2026 | HusnainBlogger',
      url: TOOL_URL,
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: DESCRIPTION,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        { '@type': 'ListItem', position: 3, name: 'YouTube Tools', item: 'https://husnainblogger.com/tools/youtube/' },
        { '@type': 'ListItem', position: 4, name: 'Title Capitalization Formatter', item: TOOL_URL },
      ],
    },
  ],
};
