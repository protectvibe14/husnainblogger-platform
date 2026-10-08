/**
 * Client Onboarding Questionnaire Generator — pure logic (tool-465).
 *
 * ASSUMPTIONS:
 * - Zero imports, zero network, zero DOM. Fully deterministic and
 *   client-side: a FIXED question bank (43 questions total) filtered by the
 *   user's selections. Nothing is written by AI.
 * - Bank composition: 5 sections × 5 fixed questions (goals, brand,
 *   audience, logistics, budget) = 25 questions, plus 3 fixed
 *   service-specific questions for each of 6 service types (design, writing,
 *   marketing, development, video, social-media) = 18 questions. The
 *   "other" service type adds no extras — generic sections only.
 * - includeSections accepts a comma/newline-separated string or an array;
 *   at least one valid section is required.
 * - serviceType "other" (or any unknown value) yields generic sections only.
 * - runTool validates every input and returns { ok:false, error } with a
 *   human-readable message on any invalid or missing input.
 */

export const SECTIONS = [
  "goals",
  "brand",
  "audience",
  "logistics",
  "budget",
] as const;
export type SectionId = (typeof SECTIONS)[number];

export const SECTION_LABELS: Record<SectionId, string> = {
  goals: "Goals & Success Metrics",
  brand: "Brand & Voice",
  audience: "Audience",
  logistics: "Logistics & Process",
  budget: "Budget & Timeline",
};

export const SERVICE_TYPES = [
  "design",
  "writing",
  "marketing",
  "development",
  "video",
  "social-media",
  "other",
] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  design: "Design",
  writing: "Writing",
  marketing: "Marketing",
  development: "Development",
  video: "Video",
  "social-media": "Social media",
  other: "Other (generic questions only)",
};

const SECTION_QUESTIONS: Record<SectionId, string[]> = {
  goals: [
    "What is the #1 outcome you want from this project? (Be specific: revenue, signups, followers, etc.)",
    "How will you measure whether this project was a success 90 days after delivery?",
    "What does a failed version of this project look like to you?",
    "What have you already tried to solve this problem, and why didn't it work?",
    "What is your ideal deadline, and what is driving that date?",
  ],
  brand: [
    "Describe your brand in 3 adjectives. What should it NEVER sound or look like?",
    "Who are 2-3 brands or creators whose style you admire, and what specifically do you like about each?",
    "Share links to your existing brand assets (logo, fonts, colors, past work). What should stay, and what should change?",
    "What is your brand's tone of voice? (e.g. playful, authoritative, minimal, bold)",
    "Are there any words, claims, or visuals that are off-limits for compliance or brand reasons?",
  ],
  audience: [
    "Who exactly is this for? Describe your ideal customer or viewer in 2-3 sentences.",
    "What problem does your audience have that this project should solve for them?",
    "Where does your audience spend their time online? (platforms, communities, newsletters)",
    "What objections or doubts does your audience usually have before buying or engaging?",
    "Do you have existing audience data, testimonials, or reviews I should see? Please share links.",
  ],
  logistics: [
    "Who is the single decision-maker who gives final approval on my work?",
    "How many revision rounds do you expect to be included, and who reviews each round?",
    "What is your preferred way to communicate? (email, Slack, calls) And expected response times?",
    "Are there any fixed dates I must hit? (launches, campaigns, events)",
    "Who else is involved in this project, and what are their roles? (team members, other freelancers, agencies)",
  ],
  budget: [
    "What budget range have you set aside for this project?",
    "Is this a fixed-fee, hourly, or milestone-based engagement in your mind?",
    "What does your payment process look like? (approval chain, payment terms, invoicing requirements)",
    "Are there ongoing costs after delivery I should plan for? (ads, tools, maintenance)",
    "If the budget had to stretch 20% further, what would you cut first — and what would you protect?",
  ],
};

const SERVICE_QUESTIONS: Record<ServiceType, string[]> = {
  design: [
    "What deliverable formats and file types do you need at handoff? (e.g. Figma source, PNG, SVG)",
    "Do you have an existing design system or UI kit I must follow?",
    "What screen sizes, print specs, or aspect ratios must the designs cover?",
  ],
  writing: [
    "What is the target word count or length, and what reading level should I aim for?",
    "Are there SEO requirements? (target keywords, search intent, internal links)",
    "Should I write in first person, second person, or a brand voice — and who is credited as the author?",
  ],
  marketing: [
    "What is your current cost per acquisition or conversion rate, if you know it?",
    "Which channels are you already running, and what is working or failing there?",
    "What is the monthly ad or promotion budget separate from my fee?",
  ],
  development: [
    "What is your current tech stack, and where will this code live? (repo access, hosting)",
    "Are there existing APIs, databases, or third-party services I must integrate with?",
    "What are the performance, browser/device, or accessibility requirements?",
  ],
  video: [
    "What is the target runtime, aspect ratio(s), and where will the video be published?",
    "Do you need captions, translations, or multiple cut-downs? If so, which versions?",
    "Who provides the footage, voiceover, and music — you, me, or licensed stock?",
  ],
  "social-media": [
    "Which platforms and posting frequency are you expecting? (e.g. 3 Reels/week on Instagram)",
    "Who owns the accounts, and will I get posting access or deliver files for you to post?",
    "How do you define a winning post — views, saves, clicks, or something else?",
  ],
  other: [],
};

export interface QuestionnaireInputs {
  serviceType: ServiceType;
  includeSections: SectionId[];
}

export function parseSections(value: unknown): SectionId[] {
  const raw = Array.isArray(value)
    ? value.map((v) => String(v ?? ""))
    : typeof value === "string"
      ? value.split(/[\r\n,]+/)
      : [];
  const seen = new Set<SectionId>();
  for (const item of raw) {
    const id = item.trim().toLowerCase() as SectionId;
    if ((SECTIONS as readonly string[]).includes(id)) seen.add(id);
  }
  return SECTIONS.filter((s) => seen.has(s));
}

export function generateQuestionnaire(input: QuestionnaireInputs): string {
  const { serviceType, includeSections } = input;
  const serviceQuestions = SERVICE_QUESTIONS[serviceType];

  const lines: string[] = [
    "CLIENT ONBOARDING QUESTIONNAIRE",
    `Service type: ${SERVICE_TYPE_LABELS[serviceType]}`,
    "",
    "Send these questions to your client before the project starts. Their answers become the brief you work from.",
    "",
  ];

  let n = 1;
  for (const section of includeSections) {
    lines.push(`${SECTION_LABELS[section].toUpperCase()}`);
    for (const q of SECTION_QUESTIONS[section]) {
      lines.push(`${n}. ${q}`);
      n += 1;
    }
    lines.push("");
  }

  if (serviceQuestions.length > 0) {
    lines.push(
      `${SERVICE_TYPE_LABELS[serviceType].toUpperCase()}-SPECIFIC QUESTIONS`,
    );
    for (const q of serviceQuestions) {
      lines.push(`${n}. ${q}`);
      n += 1;
    }
    lines.push("");
  }

  lines.push(`Total questions: ${n - 1}.`);
  return lines.join("\n");
}

export function runTool(
  values: Record<string, unknown>,
): { ok: boolean; values?: Record<string, unknown>; error?: string } {
  const serviceType = String(values.serviceType ?? "").trim().toLowerCase();
  if (!(SERVICE_TYPES as readonly string[]).includes(serviceType)) {
    return {
      ok: false,
      error: `Select a service type: ${SERVICE_TYPES.join(", ")}.`,
    };
  }

  const includeSections = parseSections(values.includeSections);
  if (includeSections.length === 0) {
    return {
      ok: false,
      error:
        "Select at least one section: goals, brand, audience, logistics, budget.",
    };
  }

  return {
    ok: true,
    values: {
      questionnaireDocument: generateQuestionnaire({
        serviceType: serviceType as ServiceType,
        includeSections,
      }),
    },
  };
}
