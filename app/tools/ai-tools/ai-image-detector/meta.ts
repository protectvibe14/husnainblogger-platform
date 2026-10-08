import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';
import type { AiToolConfig } from '../../../src/lib/ai/types.ts';

export const inputs: ToolInput[] = [
  {
    id: 'image',
    label: 'Image to check',
    type: 'file',
    required: true,
    accept: 'image/*',
    mediaKind: 'image',
    maxFileMB: 10,
  },
];

export const outputs: ToolOutput[] = [
  {
    id: 'signals',
    label: 'Metadata signals',
    type: 'copy',
    description: 'Free ai image detector 2026: Local byte-forensics findings (EXIF, XMP, C2PA, no-metadata…) — signals, never a verdict. Fast, private, no signup - try it now!',
  },
  {
    id: 'scores',
    label: 'Hive detection scores',
    type: 'copy',
    description: 'Optional cloud check: Hive ai_generated vs not_ai_generated scores for the image.',
  },
];

export const content: ToolContent = {
  title: 'Ai Image Detector 2026 – Free Tool | HusnainBlogger',
  description:
    'Free local metadata forensics on any image — EXIF, XMP, C2PA, no-metadata signals — plus an optional Hive cloud check with your key. No signup.',
  howTo: [
    'Upload an image (JPEG, PNG, or WebP — max 10 MB). The local scan runs instantly in your browser.',
    'Read the signals list: EXIF, XMP, C2PA/JUMBF, Adobe metadata, PNG text chunks, or "no metadata segments".',
    'Remember what the meanings say: these are signals, not proof. No output ever claims the image is definitively real or AI.',
    'Optional: paste a Hive API key to also run Hive\'s cloud AI-image detection — its scores appear with a "no detector is definitive" banner.',
    'Use both outputs as hints alongside your own judgment, not as a final answer.',
  ],
  methodology:
    'Local: your browser walks the uploaded image\'s bytes — JPEG APPn segments (APP1 Exif\\0\\0, XMP namespace, APP11 JUMBF/c2pa, APP13 Photoshop 3.0), PNG chunks (tEXt, iTXt, eXIf, c2pa), and WebP RIFF chunks (EXIF, XMP) — and reports which metadata markers exist, or "no metadata segments" when a JPEG has none. Cloud (optional): POST https://api.thehive.ai/api/v2/task/sync with your Hive key (multipart image + model ai_generated_detection) reads ai_generated / not_ai_generated scores from output[0].classes. HusnainBlogger has no backend — the local scan never leaves your browser; the Hive key is sent only to Hive.',
  examples: [
    {
      title: 'Suspicious photo',
      inputs: {},
      note: 'A photo with no EXIF, no XMP, and no C2PA markers gets a "no metadata segments" signal — a weak hint, never proof.',
    },
    {
      title: 'Camera original',
      inputs: {},
      note: 'A photo straight from a camera shows EXIF metadata — consistent with, but not proof of, a real photograph.',
    },
  ],
  faqs: [
    {
      question: 'Can this prove an image is AI-generated?',
      answer:
        'No. This tool reports metadata SIGNALS — EXIF present, XMP present, no metadata segments, and so on. Metadata is trivially stripped or faked, so no signal is proof. The tool deliberately never gives a binary real/fake verdict.',
    },
    {
      question: 'Is the local scan private?',
      answer:
        'Yes — the local byte scan runs entirely in your browser and the image never leaves your device. Only the optional Hive cloud check uploads the image, and only to Hive\'s servers.',
    },
    {
      question: 'Is my API key safe?',
      answer:
        'Yes. Your Hive key is stored only in your browser\'s localStorage and is sent only to Hive\'s API. HusnainBlogger is a static site with no backend — we cannot see, log, or store your key.',
    },
    {
      question: 'What is C2PA?',
      answer:
        'C2PA is an open standard for content credentials — tamper-evident metadata that says where a file came from and what was done to it. Finding a C2PA/JUMBF marker is a positive provenance signal, but the marker can also be removed, so its absence proves nothing.',
    },
    {
      question: 'Why might the Hive check fail?',
      answer:
        'The multipart field name used ("media") could not be verified in Hive\'s docs — if Hive rejects the upload, confirm the field name in your Hive dashboard docs. Browser calls are also not officially documented (CORS unverified), so a blocked call shows a clear error instead of failing silently.',
    },
    {
      question: 'How does the ai image detector work?',
      answer:
        'Enter your details using the inputs above and the ai image detector calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the ai image detector free to use?',
      answer:
        'Yes - this ai image detector is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
  ],
  assumptions: [
    'No key = local scan only. The Hive cloud check needs your own Hive key saved first.',
    'The Hive multipart field name ("media") is unverified and may need correcting against Hive\'s docs.',
    'Outputs are signals, never verdicts — do not present them as proof to others.',
  ],
  jsonLd: [
    {
      '@type': 'SoftwareApplication',
      name: 'Ai Image Detector 2026 – Free Tool | HusnainBlogger',
      url: 'https://husnainblogger.com/tools/ai-tools/ai-image-detector/',
      applicationCategory: 'Utilities',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free Ai Image Detector 2026 – Free Tool - no signup required.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ai Image Detector 2026 – Free Tool | HusnainBlogger', item: 'https://husnainblogger.com/' },
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
          name: 'AI Image Detector',
          item: 'https://husnainblogger.com/tools/ai-tools/ai-image-detector/',
        },
      ],
    },
  ],
};

export const aiConfig: AiToolConfig = {
  lane: 'D',
  headline: 'Free local metadata forensics — signals about any image, never fake verdicts.',
  providers: ['hive'],
  disclosures: [
    'Local scan reports SIGNALS, not proof — never a binary real/fake verdict.',
    'Optional Hive check: bring your own key; no detector is definitive.',
    'Hive multipart field name ("media") is unverified — confirm in Hive dashboard docs if rejected.',
    'Browser calls to Hive are unverified for CORS; the local scan always works offline.',
  ],
  noKeyHeadline: 'Local scan works without a key — add Hive for a cloud second opinion',
  noKeyBody:
    'This tool\'s local metadata forensics works immediately, no key needed: upload an image and read the signals. The optional Hive cloud check is the only part needing a key — paste it into the key vault above, press Save, and the cloud scores appear next to the local signals.',
};
