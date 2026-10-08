/**
 * Live Q&A Collector — pure logic (tool-127), zero imports, zero network,
 * zero DOM.
 *
 * HONESTY: this is a MANUAL queue manager for live-stream Q&A. It CANNOT
 * read YouTube live chat (there is no YouTube API integration); the streamer
 * or a moderator copies questions from the stream chat into the tool by hand,
 * upvotes them manually, and marks them answered/archived.
 *
 * Engine: local list manager. Items carry an upvote count and a status
 * (new / answered / archived). Output = ranked queue of open questions
 * sorted by upvotes descending (ties keep original entry order) plus an
 * answered archive and a plain-text export. Fully deterministic:
 * same items -> same outputs, always.
 */

export const MAX_ITEMS = 50;

export const STATUSES = ['new', 'answered', 'archived'] as const;
export type QuestionStatus = (typeof STATUSES)[number];

export interface CollectedQuestion {
  /** 1-based position in the submitted item list (for error messages). */
  itemNo: number;
  question: string;
  asker: string;
  upvotes: number;
  status: QuestionStatus;
}

interface ItemArgs {
  items: Record<string, unknown>[];
}

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

function asText(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function parseUpvotes(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return 0;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) return null;
  return n;
}

function parseStatus(v: unknown): QuestionStatus | null {
  const s = asText(v).toLowerCase();
  if (s === '') return 'new';
  if ((STATUSES as readonly string[]).includes(s)) return s as QuestionStatus;
  return null;
}

function validateItem(item: Record<string, unknown>, idx: number): CollectedQuestion | string {
  const itemNo = idx + 1;
  const question = asText(item['question']);
  if (!question) return `Item ${itemNo}: question is required.`;
  if (question.length > 500) return `Item ${itemNo}: question must be 500 characters or fewer.`;
  const asker = asText(item['asker']) || 'Anonymous';
  const upvotes = parseUpvotes(item['upvotes']);
  if (upvotes === null) return `Item ${itemNo}: upvotes must be a whole number of 0 or more.`;
  const status = parseStatus(item['status']);
  if (status === null) return `Item ${itemNo}: status must be one of new, answered or archived.`;
  return { itemNo, question, asker, upvotes, status };
}

export function runTool(args: ItemArgs): RunResult {
  const items = args?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: 'Add at least one question to build the Q&A queue.' };
  }
  if (items.length > MAX_ITEMS) {
    return { ok: false, error: `Too many questions: the collector handles up to ${MAX_ITEMS} at a time.` };
  }

  const parsed: CollectedQuestion[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      return { ok: false, error: `Item ${i + 1}: invalid item.` };
    }
    const q = validateItem(item as Record<string, unknown>, i);
    if (typeof q === 'string') return { ok: false, error: q };
    parsed.push(q);
  }

  const open = parsed.filter((q) => q.status === 'new');
  const answered = parsed.filter((q) => q.status === 'answered');
  const archived = parsed.filter((q) => q.status === 'archived');

  // Ranked queue: upvotes desc, ties keep original entry order (stable sort).
  const ranked = open
    .map((q, order) => ({ q, order }))
    .sort((a, b) => b.q.upvotes - a.q.upvotes || a.order - b.order)
    .map(({ q }) => q);

  const voteWord = (n: number) => (n === 1 ? '1 vote' : `${n} votes`);

  const queue = ranked.map(
    (q, i) => `#${i + 1} [${voteWord(q.upvotes)}] ${q.question} — asked by ${q.asker}`,
  );

  const answeredList = answered.map(
    (q) => `${q.question} — asked by ${q.asker} (${voteWord(q.upvotes)})`,
  );

  const openVotes = open.reduce((sum, q) => sum + q.upvotes, 0);
  const summary =
    `${open.length} open (${openVotes} votes total), ` +
    `${answered.length} answered, ${archived.length} archived`;

  const lines: string[] = [
    'LIVE Q&A QUEUE (ranked by votes)',
    ...queue.map((q, i) => `${i + 1}. ${q}`),
    '',
    'ANSWERED',
    ...(answeredList.length > 0 ? answeredList.map((a, i) => `${i + 1}. ${a}`) : ['(none)']),
    '',
    `SUMMARY: ${summary}`,
  ];
  const exportText = lines.join('\n');

  return {
    ok: true,
    values: {
      queue,
      answered: answeredList,
      exportText,
      summary,
    },
  };
}
