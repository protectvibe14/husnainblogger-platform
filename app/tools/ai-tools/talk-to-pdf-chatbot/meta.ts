import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'pdf',
    label: 'PDF document',
    type: 'file',
    required: true,
    accept: 'application/pdf',
    maxFileMB: 15,
  },
  {
    id: 'question',
    label: 'Your question',
    type: 'textarea',
    required: true,
    placeholder: 'e.g. What are the key findings of this report?',
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'answer',
    label: 'Answer',
    type: 'copy',
    description: 'Free chat with pdf ai 2026: Chat with any PDF using your free Gemini key — upload a document (max 15 MB), ask. Fast, private, no signup - try it now!',
  },
];

export const content: ToolContent = {
  title: 'Chat With Pdf Ai 2026 – Free Tool | HusnainBlogger',
  description:
    'Chat with any PDF using your free Gemini key — upload a document (max 15 MB), ask questions, and get answers grounded in its pages. No signup needed.',
  howTo: [
    'Save your Gemini API key in the key vault above (free tier available from Google AI Studio).',
    'Upload a PDF — max 15 MB. It stays in your browser session and is attached to your first question.',
    'Ask your question, e.g. "What are the key findings?" or "List the deadlines mentioned."',
    'Read the answer in the chat thread and follow up — the conversation history stays in context.',
    'Verify anything important against the document itself; AI answers can be wrong.',
  ],
  methodology:
    'Your browser calls YOUR Gemini key directly: POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key= with a system instruction ("Answer using ONLY the attached PDF") and the PDF as inline_data (base64) on the first turn; follow-ups append text-only user/model history. HusnainBlogger has no backend — keys never leave your browser, and chatting only works after you save a key.',
  examples: [
    {
      title: 'Report summary',
      inputs: { question: 'Summarize the key findings of this report in 5 bullets.' },
      note: 'The model reads the attached PDF and answers only from it.',
    },
    {
      title: 'Contract check',
      inputs: { question: 'What are the termination terms mentioned in this contract?' },
      note: 'Follow-up questions keep the earlier answers in context.',
    },
  ],
  faqs: [
    {
      question: 'Is my API key safe?',
      answer:
        'Yes. Your key is stored only in your browser\'s localStorage and is sent directly to Google. HusnainBlogger is a static site with no backend — we cannot see, log, or store your key.',
    },
    {
      question: 'Why Gemini only, not OpenRouter?',
      answer:
        'PDF attachment support could not be verified in OpenRouter\'s docs, so this tool ships Gemini-only — the provider with documented PDF input. Nothing about this tool would change except the provider tabs if a verified PDF-capable option appears.',
    },
    {
      question: 'Is it free?',
      answer:
        'The tool is free, and Gemini\'s free tier covers normal use. Heavy use bills YOUR Google AI account per token.',
    },
    {
      question: 'Does my PDF stay private?',
      answer:
        'Your PDF is attached to the request and sent to Google\'s servers, which is required for the model to read it. Do not upload documents you must keep private, and do not rely on this for confidential material.',
    },
    {
      question: 'Why did it say the answer is not in the PDF?',
      answer:
        'The system prompt tells the model to answer only from the document. If it cannot find the answer there, it says so instead of inventing one — that is the intended behaviour.',
    },
  ],
  assumptions: [
    'No key = no chat. Every question needs your own Gemini key saved first.',
    'PDFs are capped at 15 MB by this tool before any upload.',
    'Answers are model-generated and grounded in the PDF by prompt — always verify important facts against the document itself.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Chat With Pdf Ai 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/talk-to-pdf-chatbot/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free Chat With Pdf Ai 2026 – Free Tool - no signup required.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Chat With Pdf Ai 2026 – Free Tool | HusnainBlogger', item: 'https://husnainblogger.com/' },
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
          name: 'Talk to PDF Chatbot',
          item: 'https://husnainblogger.com/tools/ai-tools/talk-to-pdf-chatbot/',
        },
      ],
    },
  ],
};

export const aiConfig: AiToolConfig = {
  lane: 'D',
  headline: 'Chat with any PDF using YOUR free Gemini key — answers from the document only.',
  providers: ['gemini'],
  disclosures: [
    'OpenRouter PDF support could not be verified — this tool is Gemini-only (documented PDF support).',
    'Bring-your-own-key: the key stays in your browser and travels in the request URL (Google\'s documented pattern).',
    'Your PDF is uploaded to Google\'s servers — never upload confidential documents.',
    'Answers are grounded by prompt, not guaranteed — verify important facts against the PDF.',
  ],
  noKeyHeadline: 'Save your Gemini key to unlock PDF chat',
  noKeyBody:
    'This tool is fully built — the only missing piece is your key. Get a free Gemini key (link above), paste it into the key vault, press Save, and the full flow works immediately: upload a PDF (max 15 MB) → ask → get answers grounded in the document.',
};
