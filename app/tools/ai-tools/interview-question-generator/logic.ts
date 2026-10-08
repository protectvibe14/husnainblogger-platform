/**
 * Interview Question Generator — pure logic (tool-537), zero imports, zero
 * network, zero DOM.
 *
 * HONESTY CONTRACT: fixed question banks with {role} templating. These are
 * deterministic interview-prep templates — NOT role-expert questions written
 * by a hiring manager, and NOT tailored to any specific company. The same
 * role + seniority + type always yields the same list (hash-rotated for
 * variety across different roles).
 */

export type InterviewType = "behavioral" | "technical" | "culture";
export type Seniority = "junior" | "mid" | "senior" | "lead";

export const TYPE_LABEL_TO_ID: Record<string, InterviewType> = {
  Behavioral: "behavioral",
  Technical: "technical",
  "Culture fit": "culture",
};

export const SENIORITY_LABEL_TO_ID: Record<string, Seniority> = {
  Junior: "junior",
  "Mid-level": "mid",
  Senior: "senior",
  Lead: "lead",
};

/** 15 fixed behavioral templates. {role} is replaced with the user's role. */
const BEHAVIORAL_BANK: string[] = [
  "Tell me about a time you missed a deadline as a {role}. What happened and what did you change afterward?",
  "Describe a disagreement you had with a teammate or stakeholder. How did you resolve it?",
  "Tell me about the most challenging project you worked on as a {role}.",
  "Give an example of a time you had to learn something completely new for your {role} work.",
  "Describe a situation where you received difficult feedback. How did you respond?",
  "Tell me about a time you went above and beyond what was expected of you.",
  "Describe a time you had to prioritize between competing demands.",
  "Tell me about a mistake you made at work and what it taught you.",
  "Give an example of when you improved a process in your {role} role.",
  "Describe a time you worked with a difficult stakeholder or client.",
  "Tell me about a time you had to explain a complex {role} topic to a non-expert.",
  "Describe a situation where you took initiative without being asked.",
  "Tell me about a time you failed to meet a goal. What did you do next?",
  "Give an example of how you handled ambiguity in a {role} project.",
  "Describe your proudest professional achievement so far and why it matters to you.",
];

/** 15 fixed technical templates (role-aware, not role-expert). */
const TECHNICAL_BANK: string[] = [
  "Walk me through how you would approach a brand-new {role} task with unclear requirements.",
  "How do you stay current with developments in your {role} field?",
  "Describe the tools and workflows you rely on most as a {role}, and why.",
  "How do you check the quality of your own {role} work before handing it off?",
  "Walk me through a difficult technical problem you solved recently.",
  "How do you decide between a quick fix and a proper long-term solution?",
  "Describe how you would document your {role} work so a teammate could pick it up.",
  "What metrics or signals tell you that your {role} work is actually working?",
  "How do you handle a situation where your first approach to a problem fails?",
  "Describe a trade-off you had to make between speed and quality.",
  "How do you test or validate your work as a {role}?",
  "Explain a core concept from your {role} field as if I knew nothing about it.",
  "What would you do if you inherited a messy, undocumented {role} project?",
  "How do you prioritize when everything on your plate as a {role} feels urgent?",
  "Describe a time a tool or process you chose turned out to be wrong. What did you learn?",
];

/** 15 fixed culture-fit templates. */
const CULTURE_BANK: string[] = [
  "What kind of team environment helps you do your best work?",
  "How do you prefer to receive feedback?",
  "Describe your ideal manager.",
  "What motivates you beyond a paycheck?",
  "How do you handle conflict with a coworker?",
  "What does a healthy work-life balance look like for you?",
  "How do you like to communicate day to day — async messages, calls, or docs?",
  "What company values matter most to you, and why?",
  "Describe a team ritual or habit you have found genuinely useful.",
  "How do you react when plans change suddenly?",
  "What would your previous teammates say is your greatest strength?",
  "How do you contribute to a positive team culture?",
  "What is something you are working on improving about yourself?",
  "How do you feel about giving feedback to peers or managers?",
  "Why does this {role} role interest you specifically?",
];

/** 3 seniority-specific add-ons per level. */
const SENIORITY_BANK: Record<Seniority, string[]> = {
  junior: [
    "What are you hoping to learn in your first year in this {role} role?",
    "How do you approach tasks you have never done before?",
    "Tell me about a time you asked for help — what made you decide to ask?",
  ],
  mid: [
    "How do you mentor or support less experienced teammates?",
    "Describe a time you owned a project end to end.",
    "How do you push back when you disagree with a decision?",
  ],
  senior: [
    "How do you set technical or professional direction for a team?",
    "Describe a time you influenced a decision you did not directly own.",
    "How do you grow the people around you as a senior {role}?",
  ],
  lead: [
    "How do you run 1:1s that actually help your reports?",
    "Describe how you handle an underperforming team member.",
    "How do you balance hands-on {role} work with leadership responsibilities?",
  ],
};

const BANKS: Record<InterviewType, string[]> = {
  behavioral: BEHAVIORAL_BANK,
  technical: TECHNICAL_BANK,
  culture: CULTURE_BANK,
};

/** Questions taken from the rotated bank. */
export const BANK_QUESTIONS = 10;

/** Simple deterministic hash (sum of char codes with rotation). */
export function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Build the question list: 10 hash-rotated from the type bank + 3
 * seniority-specific. {role} is replaced in every template.
 */
export function generateQuestions(
  role: string,
  seniority: Seniority,
  type: InterviewType,
): { questions: string[]; bankQuestions: string[]; seniorityQuestions: string[] } {
  const bank = BANKS[type];
  const start = hashSeed(`${role}|${seniority}|${type}`) % bank.length;
  const rotated: string[] = [];
  for (let i = 0; i < BANK_QUESTIONS; i++) {
    rotated.push(bank[(start + i) % bank.length]);
  }
  const fill = (t: string): string => t.replace(/\{role\}/g, role);
  const bankQuestions = rotated.map(fill);
  const seniorityQuestions = SENIORITY_BANK[seniority].map(fill);
  return {
    questions: [...bankQuestions, ...seniorityQuestions],
    bankQuestions,
    seniorityQuestions,
  };
}

/**
 * Tool entry point (matches the platform ToolRunFn contract).
 * values.role: string, required, 2..80 chars.
 * values.seniority: select label (or id). values.interviewType: select label (or id).
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawRole = values["role"];
  if (rawRole === undefined || rawRole === null || rawRole === "") {
    return { ok: false, error: "Please enter the role you are preparing for." };
  }
  if (typeof rawRole !== "string") {
    return { ok: false, error: "Role must be text." };
  }
  const role = rawRole.replace(/\s+/g, " ").trim();
  if (role.length < 2) {
    return { ok: false, error: "Role must be at least 2 characters long." };
  }
  if (role.length > 80) {
    return { ok: false, error: "Role must be 80 characters or fewer." };
  }

  const seniorityRaw =
    typeof values["seniority"] === "string" ? values["seniority"] : "";
  const seniority: Seniority | null =
    seniorityRaw in SENIORITY_LABEL_TO_ID
      ? SENIORITY_LABEL_TO_ID[seniorityRaw]
      : (["junior", "mid", "senior", "lead"] as Seniority[]).includes(
          seniorityRaw as Seniority,
        )
        ? (seniorityRaw as Seniority)
        : null;
  if (!seniority) {
    return { ok: false, error: "Please choose a seniority level." };
  }

  const typeRaw =
    typeof values["interviewType"] === "string" ? values["interviewType"] : "";
  const type: InterviewType | null =
    typeRaw in TYPE_LABEL_TO_ID
      ? TYPE_LABEL_TO_ID[typeRaw]
      : (["behavioral", "technical", "culture"] as InterviewType[]).includes(
          typeRaw as InterviewType,
        )
        ? (typeRaw as InterviewType)
        : null;
  if (!type) {
    return { ok: false, error: "Please choose an interview type." };
  }

  const { questions, bankQuestions, seniorityQuestions } = generateQuestions(
    role,
    seniority,
    type,
  );

  return {
    ok: true,
    values: {
      questions,
      bankQuestions,
      seniorityQuestions,
      count: questions.length,
      role,
      seniority,
      interviewType: type,
      honestyNote:
        "Template-based questions with role inserts — a starting point for prep, not role-expert or company-specific questions.",
    },
  };
}
