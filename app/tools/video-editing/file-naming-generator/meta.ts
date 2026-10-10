import type { ToolInput, ToolOutput } from '../../../src/lib/registry/types.ts';
import type { ToolContent } from '../../../src/templates/types.ts';

export const inputs: ToolInput[] = [
  {
    id: "project",
    label: "Project name",
    type: "text",
    required: true,
    placeholder: "launch-video",
  },
  {
    id: "pattern",
    label: "Naming pattern",
    type: "select",
    required: true,
    options: [
      "Project · Date · Version",
      "Date · Project · Scene · Take · Version",
      "Platform · Project · Date · Version",
      "Project · Scene · Take · Platform · Version",
      "Full Production (all tokens)",
      "Simple (Project · Version)",
    ],
  },
  {
    id: "date",
    label: "Shoot/export date",
    type: "date",
    required: false,
  },
  {
    id: "version",
    label: "Version",
    type: "text",
    required: false,
    placeholder: "v1",
  },
  {
    id: "scene",
    label: "Scene (optional)",
    type: "text",
    required: false,
    placeholder: "scene 3",
  },
  {
    id: "take",
    label: "Take (optional)",
    type: "text",
    required: false,
    placeholder: "take 2",
  },
  {
    id: "platform",
    label: "Platform (optional)",
    type: "text",
    required: false,
    placeholder: "TikTok",
  },
  {
    id: "separator",
    label: "Separator",
    type: "select",
    required: true,
    options: ["_", "-", "."],
  },
  {
    id: "batchVersions",
    label: "Batch versions (1–12)",
    type: "number",
    required: false,
    placeholder: "1",
    validation: { min: 1, max: 12 },
  },
];

export const outputs: ToolOutput[] = [
  { id: "fileName", label: "Generated filename", type: "copy" },
  { id: "patternPreview", label: "Pattern preview", type: "text" },
  { id: "batchNames", label: "Batch filenames", type: "list" },
  { id: "warnings", label: "Warnings", type: "list" },
];

const DESCRIPTION =
  "Name video files you will actually find later: pick a naming pattern, add your shoot details, and copy a clean, searchable filename instantly.";

export const content: ToolContent = {
  title: "Video File Naming Convention",
  description: DESCRIPTION,
  howTo: [
    "Enter your Project name — it anchors every filename.",
    "Choose a Naming pattern from the 6 fixed templates (e.g. “Project · Date · Version”).",
    "Optionally add the Shoot/export date, Version, Scene, Take, and Platform.",
    "Pick your Separator: underscore, hyphen, or dot.",
    "Set Batch versions (1–12) to generate one filename per version, e.g. v01–v03.",
    "Copy the Generated filename and check Warnings for stripped characters or over-long names.",
  ],
  methodology:
    "Pure string templating: tokens from a fixed bank of 6 patterns are joined " +
    "with your separator, filesystem-illegal characters (/ \\ : * ? \" < > |) " +
    "are stripped with a warning, empty optional parts are skipped, and names " +
    "over 200 characters trigger a length warning. No AI, no file-system access.",
  examples: [
    {
      title: "Launch video export",
      inputs: { project: "launch-video", pattern: "Project · Date · Version", date: "2026-10-01", version: "v2", separator: "_" },
      note: "→ launch-video_20261001_v2",
    },
    {
      title: "TikTok take batch",
      inputs: { project: "doc", pattern: "Project · Scene · Take · Platform · Version", scene: "scene 3", take: "take 2", platform: "TikTok", version: "v1", separator: "-", batchVersions: 3 },
      note: "→ doc-scene-3-take-2-TikTok-v01 … v03",
    },
    {
      title: "Simple project file",
      inputs: { project: "trailer", pattern: "Simple (Project · Version)", separator: "_" },
      note: "→ trailer_v1 (date skipped, version defaults to v1)",
    },
  ],
  faqs: [
    {
      question: "What is the best video file naming convention?",
      answer:
        "A good convention puts the most-searched token first (project or date), uses one separator consistently, and always includes a version number. This tool applies exactly that with 6 fixed patterns — pick one and use it for every file in the project.",
    },
    {
      question: "Is there a free video file naming convention?",
      answer:
        "Yes — this page is free and runs entirely in your browser. Enter your project details, pick a pattern, and copy the generated filename; nothing is uploaded or stored.",
    },
    {
      question: "How to use video file naming convention?",
      answer:
        "Enter the project name, choose one of the 6 naming patterns, optionally add date, version, scene, take, and platform, then pick a separator. Copy the generated name and use the same pattern for every asset so files sort and search cleanly.",
    },
    {
      question: "How does a video file naming convention work?",
      answer:
        "It joins ordered tokens (project, date, scene, take, platform, version) with a single separator into one predictable string. This tool also strips filesystem-illegal characters, warns on names over 200 characters, and can batch-generate versioned names like v01–v03.",
    },
    {
      question: 'What is a video file naming convention?',
      answer:
        'A video file naming convention is a free online tool that gives you quick, accurate results without spreadsheets or manual math. This version runs entirely in your browser for instant, private results.',
    },
      {
      question: 'Why does file naming matter for video projects?',
      answer: 'Consistent naming prevents lost files, speeds up searching, and makes collaboration smooth. \'Final_v2_REAL_final.mp4\' helps no one.',
    },
    {
      question: 'What is a good video file naming convention?',
      answer: 'Include project, date, version, and description: \'ClientName_2026-10-10_v02_RoughCut.mp4\'. Sortable, searchable, unambiguous.',
    },
    {
      question: 'Should I include version numbers?',
      answer: 'Always. Use v01, v02 (not \'final\'). Version numbers prevent the \'which final is actually final\' problem that plagues every editor.',
    },
    {
      question: 'How do I organize project folders?',
      answer: 'Standard structure: 01_Footage, 02_Audio, 03_Graphics, 04_Project_Files, 05_Exports. Consistent folders plus consistent naming equals findable everything.',
    },
  ],
  assumptions: [
    "Fixed bank of 6 patterns — template-based, not AI-generated.",
    "When no date is entered, the literal placeholder YYYYMMDD is used.",
    "Sanitization is best-effort against common filesystem-illegal characters; check your platform's own rules for edge cases.",
  ],
  jsonLd: [],
};
