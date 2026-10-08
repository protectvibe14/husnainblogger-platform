/**
 * Banned Hashtag Checker — core logic (tool-201).
 *
 * 100% client-side. Pure TypeScript, zero dependencies.
 *
 * ## What this does
 * Extracts hashtags from user-pasted caption/comment text and checks each one
 * against a bundled curated list (`banned-list.json`). Returns per-tag status
 * plus a summary. This is a PRE-SCREEN, not a live Instagram check.
 *
 * ## Honesty assumptions (do not remove — surfaced in UI by MA1)
 * 1. There is NO live Instagram lookup. Client-side JS cannot query Instagram's
 *    restricted-hashtag status (no public API; scraping is against ToS and not
 *    possible from the browser without a backend/proxy).
 * 2. `banned-list.json` is a curated SAMPLE compiled from public 2026 guides.
 *    Instagram's real restricted list is unpublished and changes constantly.
 *    A tag NOT in this list is NOT proven safe.
 * 3. The only reliable check is manual: search the tag inside the Instagram
 *    app; a "recent posts hidden" warning means it is restricted.
 * 4. Hashtag extraction is unicode-aware: `#` followed by letters (any script),
 *    numbers, and underscores. A `#` not followed by a valid tag character is
 *    ignored (e.g. "#" alone, "#!wow").
 * 5. Matching is case-insensitive; tags are normalized to lowercase for lookup
 *    and deduplicated (first occurrence wins, occurrence count reported).
 *
 * @module banned-hashtag-checker/logic
 */

export type TagStatus = "flagged" | "clear";

export interface BannedList {
  tags: string[];
  source: string;
  updated: string;
  disclaimer: string;
}

export interface PerTagResult {
  /** Tag as typed by the user, without the leading `#`. */
  tag: string;
  /** Lowercased lookup key. */
  normalizedTag: string;
  status: TagStatus;
  /** How many times the tag appeared in the input text. */
  occurrences: number;
  /** The banned-list entry that matched (only when status === "flagged"). */
  matchedEntry?: string;
}

export interface CheckSummary {
  totalUniqueTags: number;
  flaggedCount: number;
  clearCount: number;
  /** Verdict: "flagged" if ANY tag matched the curated list. */
  verdict: "flagged" | "clear";
  disclaimer: string;
  listUpdated: string;
}

export interface CheckResult {
  tags: PerTagResult[];
  summary: CheckSummary;
}

/**
 * Extract hashtags from raw text. Unicode-aware: `#` followed by one or more
 * unicode letters, numbers, or underscores. A trailing `#` with no tag
 * characters is ignored. Does NOT capture the `#` itself.
 */
export function extractHashtags(text: string): string[] {
  if (typeof text !== "string") return [];
  const matches = text.match(/#([\p{L}\p{N}_]+)/gu);
  if (!matches) return [];
  return matches.map((m) => m.slice(1));
}

/**
 * Normalize a tag for lookup: trim + lowercase. Unicode lowercase via
 * toLowerCase() (locale-independent default is fine for tag matching).
 */
export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

/**
 * Check pasted caption/comment text against a bundled banned list.
 *
 * @throws {TypeError} if `text` is not a string or `bannedList` is malformed.
 */
export function checkHashtags(text: string, bannedList: BannedList): CheckResult {
  if (typeof text !== "string") {
    throw new TypeError("checkHashtags: text must be a string");
  }
  if (!bannedList || !Array.isArray(bannedList.tags)) {
    throw new TypeError("checkHashtags: bannedList must have a tags array");
  }
  if (text.length > 20000) {
    throw new RangeError("checkHashtags: text exceeds 20000 character limit");
  }

  const banned = new Set(bannedList.tags.map((t) => normalizeTag(String(t))));

  // Dedupe case-insensitively, count occurrences, preserve first-seen spelling.
  const seen = new Map<string, PerTagResult>();
  for (const raw of extractHashtags(text)) {
    const normalized = normalizeTag(raw);
    if (!normalized) continue;
    const existing = seen.get(normalized);
    if (existing) {
      existing.occurrences += 1;
    } else {
      const isFlagged = banned.has(normalized);
      seen.set(normalized, {
        tag: raw,
        normalizedTag: normalized,
        status: isFlagged ? "flagged" : "clear",
        occurrences: 1,
        ...(isFlagged ? { matchedEntry: normalized } : {}),
      });
    }
  }

  const tags = [...seen.values()];
  const flaggedCount = tags.filter((t) => t.status === "flagged").length;

  return {
    tags,
    summary: {
      totalUniqueTags: tags.length,
      flaggedCount,
      clearCount: tags.length - flaggedCount,
      verdict: flaggedCount > 0 ? "flagged" : "clear",
      disclaimer: bannedList.disclaimer,
      listUpdated: bannedList.updated,
    },
  };
}

// ---------------------------------------------------------------------------
// runTool adapter — contract shape for the mountToolUI / checker template
// ---------------------------------------------------------------------------

/**
 * Bundled fallback copy of banned-list.json's `tags` array.
 *
 * Kept inside this module so `runTool` works in zero-import client bundles
 * (the template calls `runTool({ captionText })` and cannot inject the
 * JSON file). If banned-list.json is updated, this const MUST be regenerated
 * from it. 99 tags, copied verbatim from banned-list.json (updated 2026-10-01).
 */
const BUNDLED_BANNED_TAGS: string[] = ["abdl","addmyonlyfans","addmysc","adulting","alone","americangirl","antivax","armparty","asiangirl","ass","assday","assworship","attractive","babyrp","babe","beautyblogger","beautydirectory","besties","bikinibody","boho","books","brain","costumes","curvy","curvygirls","customers","date","dating","desk","direct","dm","dogsofinstagram","easter","edm","eggplant","elevator","fishnets","fitnessgirls","followforfollow","girlsonly","gloves","graffitiigers","hardworkpaysoff","happythanksgiving","hawks","hotweather","humpday","hustler","ice","ig","ilovemyinstagram","instamood","iphonegraphy","italiano","kansas","kickoff","killingit","kissing","master","milf","models","mustfollow","nasty","newyearsday","petite","petitegirls","pornfood","pushups","rats","saltwater","selfharm","shit","shower","single","singlelife","skype","snap","snapchat","snapchatme","snowstorm","sopretty","stranger","streetphoto","sunbathing","swole","tag4like","tanlines","teens","teen","thought","todayimwearing","twerk","undies","valentinesday","weed","workflow","wtf","youngmodel","yolo"];

const BUNDLED_BANNED_LIST: BannedList = {
  tags: BUNDLED_BANNED_TAGS,
  source: "bundled copy of banned-list.json (curated sample, updated 2026-10-01)",
  updated: "2026-10-01",
  disclaimer: "Curated sample compiled from public 2026 guides, NOT live Instagram data. Instagram's restricted-hashtag list is unpublished and changes constantly. Always verify a tag by searching it inside the Instagram app: a 'recent posts hidden' warning means it is restricted.",
};

/**
 * Contract adapter: `runTool({ captionText })` → { ok, values?, error? }.
 * Wraps the tested checkHashtags() engine. Output ids match meta.ts outputs.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const raw = values && typeof values === "object" ? (values as Record<string, unknown>)["captionText"] : undefined;
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return { ok: false, error: "Paste a caption or comment first — there is nothing to check yet." };
  }
  if (raw.length > 20000) {
    return { ok: false, error: "That text is too long — keep it under 20,000 characters." };
  }
  const result = checkHashtags(raw, BUNDLED_BANNED_LIST);
  const s = result.summary;
  const perTagResults = result.tags.map((t) =>
    t.status === "flagged"
      ? `#${t.tag} — FLAGGED (in curated banned sample${t.occurrences > 1 ? `, ×${t.occurrences}` : ""})`
      : `#${t.tag} — clear (not in curated sample${t.occurrences > 1 ? `, ×${t.occurrences}` : ""})`,
  );
  const tagWord = s.totalUniqueTags === 1 ? "unique hashtag" : "unique hashtags";
  const summary =
    s.totalUniqueTags === 0
      ? "No hashtags found in the pasted text. Add hashtags to get a result."
      : `${s.flaggedCount} of ${s.totalUniqueTags} ${tagWord} flagged by the curated sample. Verdict: ${s.verdict.toUpperCase()}.`;
  return {
    ok: true,
    values: {
      perTagResults,
      summary,
      disclaimer: BUNDLED_BANNED_LIST.disclaimer,
    },
  };
}
