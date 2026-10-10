import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/blogging-seo/image-seo-filename-renamer/';

export const inputs: ToolInput[] = [
  {
    id: 'originalName',
    label: 'Original file name',
    type: 'text',
    required: true,
    placeholder: 'IMG_20241001.jpg',
  },
  {
    id: 'keywords',
    label: 'Descriptive keywords (optional)',
    type: 'text',
    required: false,
    placeholder: 'red running shoes product shot',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'suggestedFilename',
    label: 'Suggested filename',
    type: 'text',
    description:
    'Free seo image filename generator 2026: The SEO-friendly filename: lowercase, hyphen-separated, extension preserved. Fast, private now.',
  },
  {
    id: 'downloadFilename',
    label: 'Renamed file download',
    type: 'download',
    description:
    'Download the file you supply under the new SEO-friendly name.',
  },
];

export const content: ToolContent = {
  title: 'SEO Image Filename Generator',
  description:
    'Rename images for SEO in seconds. Turn messy camera filenames into clean, keyword-rich names with this free seo image filename generator. Start.',
  howTo: [
    'Type or paste the current file name into "Original file name" — e.g. IMG_20241001.jpg.',
    'Optionally add descriptive keywords in "Descriptive keywords" — these become the new name.',
    'Run the tool to get a lowercase, hyphen-separated, SEO-friendly filename.',
    'Copy the name or use the download button, then rename the file in your CMS, media library, or computer.',
  ],
  methodology:
    'The name is built from your keywords when given, otherwise from the original name\u2019s words. Path parts are stripped, accented Latin letters are transliterated to ASCII, everything is lowercased, and non-alphanumeric runs become single hyphens (capped at 60 characters). The original extension is preserved in lowercase; files without an extension get none. No AI — the same inputs always produce the same filename.',
  examples: [
    {
      title: 'Camera photo with keywords',
      inputs: { originalName: 'IMG_20241001 (2).JPG', keywords: 'red running shoes' },
      note: 'Keywords become the new descriptive filename.',
    },
    {
      title: 'Screenshot without keywords',
      inputs: { originalName: 'My Vacation Photo 2024.png' },
      note: 'The name is cleaned up from the original filename.',
    },
  ],
  faqs: [
    {
      question: 'What is the best seo image filename generator?',
      answer:
        'The best one produces short, descriptive, lowercase-hyphenated filenames with your target keyword near the front — exactly what this free tool does, with no signup and no uploads.',
    },
    {
      question: 'Is there a free seo image filename generator?',
      answer:
        'Yes — this tool is completely free. Type the original filename, add optional keywords, and copy the SEO-friendly name it suggests.',
    },
    {
      question: 'How to generate seo image filename?',
      answer:
        'Describe the image in 3–6 lowercase words with your keyword first (e.g. red-running-shoes.jpg), keep it under 60 characters, and keep the original extension. This tool applies that recipe automatically.',
    },
    {
      question: 'How does a seo image filename generator work?',
      answer:
        'It takes your filename and optional keywords, strips paths, transliterates accented letters, lowercases everything, and joins words with hyphens while preserving the file extension. Nothing is uploaded — it is a pure text transformation.',
    },
    {
      question: 'What is a seo image filename generator?',
      answer:
        'A seo image filename generator is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Can I customize the generated seo image filename generator?',
      answer: 'Yes. Use the output as a starting point, then edit the wording, tone, or format to match your voice. The generator gives you a strong draft to refine.',
    },
    {
      question: 'What makes a good seo image filename generator?',
      answer: 'Clarity, specificity, and relevance to your audience. Avoid generic phrases — the more specific your input, the better the output.',
    },
  ],
  assumptions: [
    'Only renames the file name as text — it never sees or edits the image itself; apply the name in your CMS, media library, or operating system.',
    'Transliteration covers accented Latin letters only; non-Latin scripts (Chinese, Arabic, etc.) fall back to the generic name "image".',
  ],
  jsonLd: [],
};
