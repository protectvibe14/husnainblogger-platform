import type { ToolInput, ToolOutput } from "../../../src/lib/registry/types.ts";
import type { ToolContent } from "../../../src/templates/types.ts";
import type { BuilderField } from "../../../src/templates/types.ts";

export const inputs: ToolInput[] = [];

export const outputs: ToolOutput[] = [
  {
    id: "lines",
    label: "Show notes (Markdown)",
    type: "list",
    description:
    "The formatted show notes, one template line per item.",
  },
  {
    id: "html",
    label: "Show notes (HTML)",
    type: "copy",
    description:
    "The same show notes as an HTML block for your website.",
  },
];

export const itemFields: BuilderField[] = [
  { id: "episodeTitle", label: "Episode title", type: "text", required: true, placeholder: "Ep 42: Workflow Wins" },
  { id: "guestName", label: "Guest name", type: "text", placeholder: "Jane Doe" },
  { id: "episodeSummary", label: "Episode summary", type: "text", placeholder: "One-line summary in your own words" },
  { id: "keyLinkLabel", label: "Link label", type: "text", placeholder: "e.g. Jane\u2019s blog" },
  { id: "keyLinkUrl", label: "Link URL", type: "url", placeholder: "https://\u2026" },
  { id: "chapterTimestamp", label: "Chapter timestamp", type: "text", placeholder: "MM:SS" },
  { id: "chapterTitle", label: "Chapter title", type: "text", placeholder: "Why workflows matter" },
];

const DESCRIPTION =
  'Publish faster with this podcast show notes template — timestamps, links, and takeaways structured for listeners and SEO. Export notes ready to paste.';

export const content: ToolContent = {
  title: "Podcast Show Notes Template",
  description: DESCRIPTION,
  howTo: [
    "Add a row and enter your episode title, guest name, and summary on it.",
    "Add one row per link mentioned: a label and the full URL.",
    "Add one row per chapter: a timestamp (MM:SS) and a chapter title.",
    "Click Build to format everything into the fixed show-notes template.",
    "Copy the Markdown lines or the HTML block and paste them into your podcast host.",
  ],
  methodology:
    "A fixed template fills in your episode details: title, guest, summary, chapters, and links. " +
    "Sections with no data are left out cleanly, and your links and chapters keep the order you entered. " +
    "The tool writes nothing about the episode itself — every word of content is yours.",
  faqs: [
    {
      question: "What is the best podcast show notes template?",
      answer:
        "The best template lists the episode title, guest, a short summary, timestamped chapters, and the links you mentioned. This tool formats exactly that structure in Markdown and HTML, free.",
    },
    {
      question: "Is there a free podcast show notes template?",
      answer:
        "Yes — this tool is free with no signup. It formats your episode details into a reusable show-notes template you can paste into any podcast host or website.",
    },
    {
      question: "How to use podcast show notes?",
      answer:
        "Paste them into your podcast host's episode description field and on your episode page. Chapters help listeners jump to parts they care about; links drive clicks to what you mentioned.",
    },
    {
      question: "How does a podcast show notes template work?",
      answer:
        "You enter your episode title, guest, chapters, and links; the tool arranges them into a fixed template in Markdown and HTML. It writes no episode content itself.",
    },
    {
      question: 'How does the podcast show notes template work?',
      answer:
        'Enter your details using the inputs above and the podcast show notes template calculates everything instantly in your browser. No data leaves your device, and you get results the moment you change any value.',
    },
    {
      question: 'Is the podcast show notes template free to use?',
      answer:
        'Yes - this podcast show notes template is completely free with no signup, no account, and no usage limits. It runs 100% in your browser.',
    },
    {
      question: 'What is a podcast show notes template?',
      answer:
        'A podcast show notes template is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
  ],
  assumptions: [
    "The tool formats only the details you enter — it writes nothing about the episode itself.",
    "Chapters and links keep the order you entered them; nothing is reordered or generated.",
  ],
  jsonLd: [
  ],
};
