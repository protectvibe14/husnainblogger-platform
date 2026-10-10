import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

const TOOL_URL = 'https://husnainblogger.com/tools/creator-business/creator-deduction-finder/';

export const inputs: ToolInput[] = [
  {
    id: 'creatorType',
    label: 'Creator type',
    type: 'select',
    required: false,
    options: ['video', 'photo', 'audio', 'writer', 'streamer'],
  },
  {
    id: 'expenseChecklist',
    label: 'Expense categories you pay for (one per line or comma-separated)',
    type: 'textarea',
    required: false,
    placeholder: 'camera, editing software, internet, travel',
  },
  {
    id: 'homeOffice',
    label: 'I use a home office',
    type: 'boolean',
    required: false,
  },
  {
    id: 'vehicleUse',
    label: 'I use a vehicle for business',
    type: 'boolean',
    required: false,
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'matchedDeductionCategories',
    label: 'Matched expense categories',
    type: 'list',
    description:
    'Free freelancer tax deductions list 2026: General-information list of commonly tracked categories matched to your inputs. Fast, private now.',
  },
  {
    id: 'recordKeepingTips',
    label: 'Record-keeping tips',
    type: 'list',
    description:
    '6 fixed tips for keeping clean expense records.',
  },
  {
    id: 'questionsForTaxPro',
    label: 'Questions for your tax pro',
    type: 'list',
    description:
    '5 fixed questions to bring to a tax professional.',
  },
];

export const content: ToolContent = {
  title: 'Freelancer Tax Deductions List',
  description:
    'Find freelancer tax deductions free — a general-information list of commonly tracked categories matched to your inputs. Find yours now!',
  howTo: [
    'Optionally pick your creator type: video, photo, audio, writer, or streamer.',
    'Type the expense categories you pay for into the expense checklist — one per line or comma-separated (e.g. camera, editing software, internet).',
    'Tick home office and/or vehicle use if they apply to you.',
    'Run the tool to get matched expense categories, 6 record-keeping tips, and 5 questions for your tax professional.',
    'Take the list to a tax pro — the tool suggests categories to ask about, it never decides what you can claim.',
  ],
  methodology:
    'This tool matches your inputs against a fixed, human-curated list of 18 common expense categories (cameras, audio, software, home office, vehicle, travel, and 12 more), plus creator-type relevance suggestions for 5 creator types. Matching is by normalized name or alias only — there is no AI, no jurisdiction logic, and no determination of what is deductible for you. Every result is labeled general information with a confirm-with-a-tax-professional note. Output also includes 6 fixed record-keeping tips and 5 fixed questions for a tax professional.',
  examples: [
    {
      title: 'Video creator checklist',
      inputs: { creatorType: 'video', expenseChecklist: 'camera, premiere, lighting' },
      note: 'Returns matched categories plus other categories commonly tracked by video creators — all labeled general information.',
    },
    {
      title: 'Writer with home office',
      inputs: { creatorType: 'writer', homeOffice: true, expenseChecklist: 'internet, courses' },
      note: 'Adds the home-office category and matches internet and education expenses by alias.',
    },
    {
      title: 'Streamer with vehicle use',
      inputs: { creatorType: 'streamer', vehicleUse: true, expenseChecklist: 'llama food' },
      note: 'Unrecognized entries like "llama food" are reported as not on the general list, never silently dropped.',
    },
  ],
  faqs: [
    {
      question: 'What is the best freelancer tax deductions list?',
      answer:
        'The best list is a starting checklist of expense categories to discuss with a tax professional — not a verdict on what you can claim. This free finder matches your creator type and expenses against 18 commonly tracked categories, adds record-keeping tips, and gives you 5 questions to bring to a tax pro.',
    },
    {
      question: 'Is there a free freelancer tax deductions list?',
      answer:
        'Yes — this freelancer tax deductions finder is completely free with no signup. Pick your creator type, enter your expense categories, and get a general-information checklist plus record-keeping tips.',
    },
    {
      question: 'How to use freelancer tax deductions?',
      answer:
        'Enter the expense categories you pay for and tick home office or vehicle use if they apply. The tool returns matched categories from its 18-item general list, 6 record-keeping tips, and 5 questions for your tax professional. Then confirm everything with a tax pro — eligibility varies by jurisdiction and the tool never decides what is deductible for you.',
    },
    {
      question: 'What is a freelancer tax deductions list?',
      answer:
        'A freelancer tax deductions list is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
    {
      question: 'Do I need to create an account to use the freelancer tax deductions list?',
      answer:
        'No account needed. Open the freelancer tax deductions list, enter your values, and see results immediately - nothing is stored or sent anywhere.',
    },
      {
      question: 'How do I find freelancer tax deductions list?',
      answer: 'Enter your criteria above and the finder surfaces the most relevant options. Refine your inputs for more targeted results.',
    },
    {
      question: 'What makes a good freelancer tax deductions list?',
      answer: 'Relevance to your specific needs, not just popularity. The finder helps you filter by what actually matters for your situation.',
    },
  ],
  assumptions: [
    'General information, not tax advice; eligibility varies by jurisdiction.',
    'The tool suggests categories to ask about — it never determines that any expense is deductible for you.',
    'Country-specific rules are not encoded; the same expense may be treated very differently depending on where you live and work.',
  ],
  jsonLd: [],
};
