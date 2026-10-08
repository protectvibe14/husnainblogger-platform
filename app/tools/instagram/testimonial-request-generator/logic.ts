/**
 * tool-231 — Testimonial Request Generator (generator)
 *
 * Pure client-side template engine. Assembles a ready-to-send testimonial
 * request from FIXED banks — no AI, no network, no randomness.
 *
 * Bank sizes (documented per honesty contract):
 *   - REQUEST_SCRIPTS: 12 templates (4 per channel: dm | email | in-person)
 *   - QUESTION_PROMPTS: 6 fixed guided questions
 *   - THANK_YOU_NOTES: 3 templates
 *
 * Selection is deterministic: an FNV-1a hash of the trimmed inputs picks
 * the script/note template, so identical inputs always produce identical
 * output, while different clients/projects get varied phrasing.
 */

export interface ToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

const CHANNELS = ['Direct message (DM)', 'Email', 'In person'] as const;
type Channel = (typeof CHANNELS)[number];

/** 4 request-script templates per channel (12 total). */
const REQUEST_SCRIPTS: Record<Channel, string[]> = {
  'Direct message (DM)': [
    'Hi {clientName}! I loved working with you on {project}. Would you be open to sharing a short testimonial about your experience? It only takes a minute and it helps others find me. I can send over a few prompt questions if that helps — totally optional!',
    'Hey {clientName}! Quick question — would you be up for leaving a short testimonial about {project}? Just a sentence or two about what the experience was like for you. No pressure at all, but it would mean a lot.',
    'Hi {clientName}, hope you\'re doing well! I\'m collecting a few testimonials from clients I\'ve loved working with, and {project} is one I\'m really proud of. Would you share a couple of sentences about your experience? I can send guiding questions if you\'d like.',
    '{clientName}! Small favor: would you write a quick testimonial about working with me on {project}? Something like what the problem was, what we did, and what changed. Happy to draft it from a quick voice note too!',
  ],
  Email: [
    'Subject: Quick favor — a testimonial about {project}?\n\nHi {clientName},\n\nIt was a real pleasure working with you on {project}. I\'m putting together testimonials for my portfolio, and I\'d love to feature your experience.\n\nWould you be willing to share 2–3 sentences about what it was like working with me? To make it easy, I\'ve included a few guiding questions below — just answer whichever ones feel natural:\n\n{questions}\n\nNo rush at all, and thank you for considering it!\n\nBest,\n[Your name]',
    'Subject: Could you help me with a testimonial, {clientName}?\n\nHi {clientName},\n\nI\'m reaching out because {project} was one of my favorite collaborations, and I\'d love to share your perspective on my website.\n\nWould you be open to writing a short testimonial? A couple of sentences is plenty. If it helps, here are some questions to spark ideas:\n\n{questions}\n\nAnd of course, I\'m happy to return the favor anytime.\n\nThanks so much,\n[Your name]',
    'Subject: Your experience with {project} — in your words?\n\nHi {clientName},\n\nOne quick ask: I\'m collecting short client testimonials, and I\'d be honored to include one from you about {project}.\n\nFeel free to keep it casual — what stood out, what changed, or what you\'d tell a friend. The questions below can guide you if you like:\n\n{questions}\n\nI\'ll only publish it with your permission.\n\nGratefully,\n[Your name]',
    'Subject: 2 minutes = a testimonial about {project}?\n\nHi {clientName},\n\nYou know what takes 2 minutes and helps me enormously? A short testimonial about {project}.\n\nJust reply to this email with whatever comes to mind — or use these prompts if they help:\n\n{questions}\n\nThank you a hundred times over,\n[Your name]',
  ],
  'In person': [
    'Talking points for {clientName} (about {project}):\n1. "I\'ve loved working with you on {project} — would you be comfortable sharing a short testimonial about your experience?"\n2. "It can be super brief — just what the problem was and what changed."\n3. "I can send you a couple of guiding questions by text so you don\'t have to think about it."\n4. "Only if you\'re happy with it, of course — and I\'ll show you the draft before I publish anything."',
    'Talking points for {clientName} (about {project}):\n1. "Quick one — would you be open to giving me a short testimonial about {project}?"\n2. "A sentence or two is perfect. What stood out? What would you tell a friend?"\n3. "You can send it as a voice note if typing is a pain."\n4. "No pressure at all — but it would really help me win more clients like you."',
    'Talking points for {clientName} (about {project}):\n1. "I\'m collecting testimonials from clients I loved working with, and {project} is at the top of my list."\n2. "Would you share a couple of sentences about the experience?"\n3. "Happy to send prompt questions over text to make it effortless."\n4. "And I\'ll send you the final version to approve before it goes anywhere."',
    'Talking points for {clientName} (about {project}):\n1. "Can I ask a small favor? A short testimonial about {project}."\n2. "Just: what the situation was, what we did, and what the result was."\n3. "You can record it as audio — I\'ll transcribe and polish it for your approval."\n4. "Thank you in advance — seriously, it makes a real difference."',
  ],
};

/** 6 fixed guided questions (one list output). */
const QUESTION_PROMPTS = [
  'What problem were you trying to solve when we started working together?',
  'What was the experience of working together like?',
  'What specific result or change did you get from {project}?',
  'What surprised you most about the process?',
  'How would you describe {project} to a friend in one sentence?',
  'Would you recommend working with me — and if so, to whom?',
];

/** 3 thank-you note templates. */
const THANK_YOU_NOTES = [
  'Thank you so much, {clientName}! Your words about {project} mean the world to me — I\'m so glad the experience landed. I\'ll send you a link once it\'s live on my page. And remember, the door is always open for round two!',
  '{clientName}, this made my day. Thank you for taking the time to write about {project} — your testimonial helps other people feel confident reaching out, and that\'s priceless. I\'ll share the published version with you for approval first.',
  'Wow, {clientName} — thank you! I\'m thrilled that {project} delivered for you, and I really appreciate you putting it into words. I\'ll send you the final draft before it goes public, so you can tweak anything.',
];

function hashString(input: string): number {
  // FNV-1a 32-bit — deterministic, dependency-free.
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function pick<T>(bank: T[], key: string): T {
  return bank[hashString(key) % bank.length];
}

function fill(template: string, clientName: string, project: string): string {
  return template.split('{clientName}').join(clientName).split('{project}').join(project);
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function runTool(values: Record<string, unknown>): ToolResult {
  const clientName = asString(values['clientName']);
  const project = asString(values['project']);
  const channel = asString(values['channel']);

  if (!clientName) {
    return { ok: false, error: 'Please enter the client\u2019s name.' };
  }
  if (!project) {
    return { ok: false, error: 'Please enter the project or service name.' };
  }
  if (!channel) {
    return { ok: false, error: 'Please choose a channel: Direct message (DM), Email, or In person.' };
  }
  if (!CHANNELS.includes(channel as Channel)) {
    return {
      ok: false,
      error: 'Channel must be one of: ' + CHANNELS.join(', ') + '.',
    };
  }

  const seed = (clientName + '|' + project + '|' + channel).toLowerCase();
  const typedChannel = channel as Channel;

  const questions = QUESTION_PROMPTS.map((q) => fill(q, clientName, project));
  const scriptTemplate = pick(REQUEST_SCRIPTS[typedChannel], 'script:' + seed);
  let requestScript = fill(scriptTemplate, clientName, project);
  if (requestScript.includes('{questions}')) {
    const numbered = questions.map((q, i) => (i + 1) + '. ' + q).join('\n');
    requestScript = requestScript.split('{questions}').join(numbered);
  }
  const thankYouNote = fill(pick(THANK_YOU_NOTES, 'thanks:' + seed), clientName, project);

  return {
    ok: true,
    values: {
      requestScript,
      questionPrompts: questions,
      thankYouNote,
    },
  };
}
