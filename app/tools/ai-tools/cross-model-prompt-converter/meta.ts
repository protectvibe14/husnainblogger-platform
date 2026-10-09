import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const modelOptions = ['Midjourney', 'Flux', 'SDXL', 'DALL-E 3', 'Ideogram'];

export const inputs: ToolInput[] = [
  {
    id: 'prompt',
    label: 'Your prompt',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. a red sports car at sunset --ar 16:9 --v 6',
  },
  {
    id: 'fromModel',
    label: 'From model',
    type: 'select',
    required: true,
    options: modelOptions,
  },
  {
    id: 'toModel',
    label: 'To model',
    type: 'select',
    required: true,
    options: modelOptions,
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'convertedPrompt',
    label: 'Converted prompt',
    type: 'copy',
    description:
    'Free midjourney to flux prompt converter 2026: Your prompt rewritten in the target model’s syntax. Get instant results. free now.',
  },
  {
    id: 'droppedParams',
    label: 'Parameters that didn’t carry over',
    type: 'list',
    description:
    'Each dropped parameter with a plain-language reason.',
  },
  {
    id: 'suggestions',
    label: 'Target-model suggestions',
    type: 'list',
    description:
    'Extra tweaks to get the most out of the target model.',
  },
];

export const content: ToolContent = {
  title: 'Cross-Model Prompt Converter',
  description:
    'Convert image prompts between Midjourney, Flux, SDXL, DALL-E 3 and Ideogram. Best-effort syntax mapping shows what carried over — and what didn’t.',
  howTo: [
    'Paste the prompt you wrote for your source model, parameters included.',
    'Choose the source model and the target model from the dropdowns.',
    'Click Convert to get the rewritten prompt plus a list of dropped parameters.',
    'Read the drop reasons — anything Midjourney-specific may need a manual rewrite.',
    'Apply the target-model suggestions, then review the final prompt before generating.',
  ],
  methodology:
    'Fixed syntax-mapping rules, run entirely in your browser. Midjourney parameters are parsed (--ar, --v, --no, --style, --chaos, --tile, --seed and others): --ar becomes plain aspect-ratio words, --tile becomes "seamless tileable pattern", --niji becomes "anime style", and non-portable flags (--v, --chaos, --weird, --seed, --stylize) are listed as dropped with a reason. --no material is redirected to the target’s negative-prompt field. Converting to Midjourney detects aspect hints (wide, vertical, square) and suggests --ar values, and flags negative-sounding words for --no. This is a syntax mapping, not a semantic rewrite — no AI model is involved.',
  examples: [
    {
      title: 'Midjourney to DALL-E 3',
      inputs: {
        prompt: 'a red sports car at sunset --ar 16:9 --v 6',
        fromModel: 'Midjourney',
        toModel: 'DALL-E 3',
      },
      note: '--ar 16:9 becomes "wide aspect ratio 16:9" in the prose; --v 6 is listed as dropped (no DALL-E equivalent).',
    },
    {
      title: 'DALL-E 3 to Midjourney',
      inputs: {
        prompt: 'a wide panoramic mountain landscape at dawn',
        fromModel: 'DALL-E 3',
        toModel: 'Midjourney',
      },
      note: 'Detects the wide/panoramic framing and suggests appending "--ar 16:9".',
    },
  ],
  faqs: [
    {
      question: 'Can a prompt be converted perfectly between models?',
      answer:
        'No — and this tool is honest about that. Each model reads prompts differently: Midjourney uses parameters, Flux prefers natural language, SDXL uses tag lists. The converter maps the syntax and tells you exactly what it dropped, so you can finish the rewrite yourself.',
    },
    {
      question: 'What happens to --no when converting away from Midjourney?',
      answer:
        'It is never silently deleted. The tool flags it as dropped and tells you to paste the material into the target model’s negative-prompt field (SDXL, Flux UIs) or rephrase it positively for DALL-E 3.',
    },
    {
      question: 'Does it rewrite my prompt’s meaning?',
      answer:
        'No. It only strips, translates or suggests parameter syntax — the descriptive words stay yours. That is why the page is labeled "best-effort syntax mapping, not a semantic rewrite".',
    },
    {
      question: 'Which conversions are supported?',
      answer:
        'All pairs between Midjourney, Flux, SDXL, DALL-E 3 and Ideogram — 20 directions. Same-model conversion is rejected since there is nothing to convert.',
    },
    {
      question: 'How does the midjourney to flux prompt converter work?',
      answer:
        'Enter your details using the inputs above and the midjourney to flux prompt converter calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the midjourney to flux prompt converter free to use?',
      answer:
        'Yes - this midjourney to flux prompt converter is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a midjourney to flux prompt converter?',
      answer:
        'A midjourney to flux prompt converter is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    'Best-effort syntax mapping, not a semantic rewrite — review every converted prompt before generating.',
    'Rules cover common Midjourney parameters; rare or brand-new flags are dropped with a generic reason.',
    'Aspect detection on plain prose is keyword-based (wide, vertical, square…) and can misfire on ambiguous text.',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Cross-Model Prompt Converter 2026 – Free | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/cross-model-prompt-converter/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
    'Free midjourney to flux prompt converter 2026: Your prompt rewritten in the target model’s syntax. Get instant results. free now.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://husnainblogger.com/' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://husnainblogger.com/tools/' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'AI Tools',
          item: 'https://husnainblogger.com/tools/ai-tools/',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Cross-Model Prompt Converter',
          item: 'https://husnainblogger.com/tools/ai-tools/cross-model-prompt-converter/',
        },
      ],
    },
  ],
};
