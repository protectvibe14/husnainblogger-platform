import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'promptText',
    label: 'Your prompt',
    type: 'textarea',
    required: true,
    placeholder: 'Paste the prompt you plan to send…',
  },
  {
    id: 'inputPricePerM',
    label: 'Input price per 1M tokens (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 2.50 — from your provider’s pricing page',
  },
  {
    id: 'outputPricePerM',
    label: 'Output price per 1M tokens (USD)',
    type: 'number',
    required: true,
    placeholder: 'e.g. 10.00 — from your provider’s pricing page',
  },
  {
    id: 'expectedOutputTokens',
    label: 'Expected output tokens',
    type: 'number',
    required: true,
    placeholder: 'e.g. 500',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'estimatedInputTokens',
    label: 'Estimated input tokens',
    type: 'number',
    description:
    'Free ai token cost calculator 2026: Rough token estimate from character count — real tokenizers differ. Get instant results. free now.',
  },
  {
    id: 'totalCostDisplay',
    label: 'Estimated total cost',
    type: 'text',
    description:
    'Input + output cost in USD, shown with the full math breakdown.',
  },
  {
    id: 'math',
    label: 'Cost math',
    type: 'list',
    description:
    'Step-by-step calculation so you can verify every number.',
  },
];

export const content: ToolContent = {
  title: 'Prompt Token Cost Estimator',
  description:
    'Estimate what an AI prompt will cost before you run it. Paste your prompt, enter your provider’s per-token prices, and get a transparent cost breakdown.',
  howTo: [
    'Paste your full prompt into the Your prompt field.',
    'Enter the input and output prices per 1M tokens from your AI provider’s pricing page — this tool never guesses them.',
    'Enter how many output tokens you expect the response to use.',
    'Click Calculate to see the input, output and total cost with the full math shown.',
    'Re-run with a shorter prompt to see exactly how much each edit saves.',
  ],
  methodology:
    'Token count is a rough heuristic: character count divided by 4, rounded up, labeled "rough estimate — real tokenizers differ" (real tokenizers like tiktoken or SentencePiece can differ 10–30%). Cost = tokens ÷ 1,000,000 × your entered price, computed separately for input and output. No provider prices are built in — every rate is typed in by you. Runs entirely in your browser.',
  examples: [
    {
      title: 'Blog outline',
      inputs: {
        promptText: 'Write a detailed outline for a blog post about email marketing for beginners.',
        inputPricePerM: 2.5,
        outputPricePerM: 10,
        expectedOutputTokens: 600,
      },
      note: 'Shows the input-token estimate, the output cost for 600 tokens, and the combined total with all four math steps.',
    },
    {
      title: 'Free-tier check',
      inputs: {
        promptText: 'Summarize this in one sentence.',
        inputPricePerM: 0,
        outputPricePerM: 0,
        expectedOutputTokens: 30,
      },
      note: 'Zero prices give a $0.00 total — useful for sanity-checking free tiers without inventing any pricing.',
    },
  ],
  faqs: [
    {
      question: 'How accurate is the token estimate?',
      answer:
        'It is a rough heuristic — character count divided by 4, rounded up — and is always labeled as such. Real tokenizers (tiktoken for OpenAI, SentencePiece for others) typically differ by 10–30%, and non-English text can differ more. Treat the result as a planning estimate, not a billing quote.',
    },
    {
      question: 'Why do I have to enter the prices myself?',
      answer:
        'Provider pricing changes often and differs by model, so this tool deliberately stores no prices — entering them from your provider’s pricing page guarantees the math uses your real rates instead of a stale guess.',
    },
    {
      question: 'What counts as input vs output tokens?',
      answer:
        'Input tokens cover everything you send: the prompt, system instructions and any pasted context. Output tokens are what the model generates back, including reasoning tokens on thinking models. Most providers charge different rates for each.',
    },
    {
      question: 'How can I lower my prompt cost?',
      answer:
        'Shorten the prompt, cut repeated context, ask for concise outputs, and cap max output tokens. Paste your trimmed prompt here to see the exact dollar difference before you run it.',
    },
    {
      question: 'How do I estimate the cost of a prompt with this tool?',
      answer:
        'Paste your prompt text — the tool estimates tokens with a transparent character-count heuristic (roughly characters divided by 4, rounded up). Then enter the per-token input and output prices from your provider pricing page, and it does the math: estimated tokens times your rates equals the cost of one run. Adjust the text or prices and the numbers update instantly, all in your browser.',
    },
    {
      question: 'Is my prompt text sent anywhere?',
      answer:
        'No. Everything runs locally in your browser — your pasted prompts, pricing inputs, and results never leave your device. That matters when pasting proprietary prompts or client data to sanity-check API spend before you run anything.',
    },
    {
      question: 'Why do input and output tokens have separate prices?',
      answer:
        'Because most providers bill them differently — output tokens are usually priced higher than input tokens, and reasoning models also bill their internal thinking as output. A long answer therefore costs more than a long prompt at the same rate. Enter both rates from your provider pricing page and the tool keeps the two sides separate in the math.',
    },
  ],
  assumptions: [
    'Token counts are a chars÷4 heuristic, not a real tokenizer — expect 10–30% variance versus actual billing.',
    'Prices are user-entered; the tool cannot verify them against any provider.',
    'Does not account for cached-input discounts, batch pricing, or provider-specific billing quirks.',
  ],
  jsonLd: [
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Prompt Token Cost Estimator',
          item: 'https://husnainblogger.com/tools/ai-tools/prompt-token-cost-estimator/',
        },
      ],
    },
  ],
};
