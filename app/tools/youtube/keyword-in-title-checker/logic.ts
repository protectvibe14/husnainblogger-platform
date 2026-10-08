/**
 * Keyword-in-Title Checker (tool-133) — pure logic, zero imports.
 *
 * ENGINE: deterministic string check.
 *   - Default mode: case-insensitive substring match (Unicode-aware via
 *     String.prototype.toLowerCase).
 *   - Word-boundary mode (wordBoundary=true): both strings are tokenized
 *     with Intl.Segmenter (word granularity); the keyword matches only when
 *     its whole token sequence appears consecutively in the title. This
 *     avoids false positives like keyword "cat" matching title "concatenate".
 *   - Position: "front" (match starts at index 0), "end" (match runs to the
 *     very end of the title), otherwise "middle". When not found,
 *     position is "not found".
 *   - Recommendation: a fixed front-loading suggestion based on position.
 *
 * HONESTY: pure arithmetic on strings — no SEO authority claimed beyond
 * the front-loading best practice. Case folding uses toLowerCase, which
 * does not handle locale-specific rules (e.g. Turkish dotted-I); this is
 * documented in meta assumptions, not silently fixed.
 */

export type MatchPosition = "front" | "middle" | "end" | "not found";

export interface TitleCheckResult {
  ok: true;
  values: {
    match: string;
    position: string;
    matchDetails: string;
    recommendation: string;
  };
}

export interface TitleCheckError {
  ok: false;
  error: string;
}

/** Unicode-aware word tokens (lowercased). */
function wordTokens(text: string): string[] {
  const seg = new Intl.Segmenter("en", { granularity: "word" });
  return [...seg.segment(text.toLowerCase())]
    .filter((s) => s.isWordLike)
    .map((s) => s.segment);
}

/**
 * Find the keyword's token sequence inside the title's token sequence.
 * Returns the starting token index, or -1.
 */
function tokenSequenceIndex(titleTokens: string[], keywordTokens: string[]): number {
  if (keywordTokens.length === 0) return -1;
  outer: for (let i = 0; i <= titleTokens.length - keywordTokens.length; i++) {
    for (let j = 0; j < keywordTokens.length; j++) {
      if (titleTokens[i + j] !== keywordTokens[j]) continue outer;
    }
    return i;
  }
  return -1;
}

function recommendationFor(position: MatchPosition): string {
  switch (position) {
    case "front":
      return "Good placement — your keyword is front-loaded at the very start of the title. Keep the title natural and readable; no change needed.";
    case "middle":
      return "Your keyword sits in the middle of the title. If you can move it closer to the start without forcing it, the title scans better in search results.";
    case "end":
      return "Your keyword is buried at the end of the title. Try rewriting so the keyword appears near the start, where viewers and search engines notice it first.";
    case "not found":
      return "Your title does not contain the keyword. Add the exact keyword phrase near the start of the title — front-loading helps viewers instantly see the topic.";
  }
}

export function runTool(values: Record<string, unknown>): TitleCheckResult | TitleCheckError {
  const keyword = values["keyword"];
  const title = values["title"];
  const wordBoundary = values["wordBoundary"] === true;

  if (typeof keyword !== "string" || keyword.trim() === "") {
    return { ok: false, error: "Enter the target keyword or phrase to check." };
  }
  if (typeof title !== "string" || title.trim() === "") {
    return { ok: false, error: "Enter the video title to check." };
  }

  const kw = keyword.toLowerCase();
  const cleanTitle = title.trim();
  const lowerTitle = cleanTitle.toLowerCase();

  let found: boolean;
  let position: MatchPosition;
  let detail: string;

  if (!wordBoundary) {
    const idx = lowerTitle.indexOf(kw);
    found = idx !== -1;
    if (!found) {
      position = "not found";
      detail = `Keyword "${keyword.trim()}" does not appear in the title (case-insensitive substring check).`;
    } else {
      position = idx === 0 ? "front" : idx + kw.length === lowerTitle.length ? "end" : "middle";
      const wordIdx = wordTokens(cleanTitle.slice(0, idx)).length + 1;
      detail = `Keyword found at character ${idx + 1} of ${cleanTitle.length} (around word ${wordIdx} of the title).`;
    }
  } else {
    const titleTokens = wordTokens(cleanTitle);
    const kwTokens = wordTokens(keyword);
    const tokenIdx = tokenSequenceIndex(titleTokens, kwTokens);
    found = tokenIdx !== -1;
    if (!found) {
      position = "not found";
      detail = `Keyword "${keyword.trim()}" does not appear as whole word(s) in the title (word-boundary check).`;
    } else {
      position =
        tokenIdx === 0
          ? "front"
          : tokenIdx + kwTokens.length === titleTokens.length
            ? "end"
            : "middle";
      detail = `Keyword matched as whole word(s) starting at word ${tokenIdx + 1} of ${titleTokens.length}.`;
    }
  }

  return {
    ok: true,
    values: {
      match: found ? "Yes" : "No",
      position,
      matchDetails: detail,
      recommendation: recommendationFor(position),
    },
  };
}
