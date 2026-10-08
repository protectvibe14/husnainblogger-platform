/**
 * Robots.txt Generator — pure logic (zero imports, zero network, zero DOM).
 *
 * Assembles a standards-compliant robots.txt from the rule blocks the user
 * types in. This is a FIXED CONFIG TEMPLATE, not AI: the tool parses a
 * simple line format (see below), validates it, and emits the canonical
 * robots.txt text. It never invents rules — every line in the output comes
 * from the user's own input.
 *
 * Input format (one directive per line, blank line starts a new block,
 * lines starting with # are ignored):
 *   User-agent: *
 *   Disallow: /admin/
 *   Allow: /public/
 *
 *   User-agent: Googlebot
 *   Disallow:
 *
 * Template (one group per block):
 *   User-agent: <agent>
 *   Disallow: <path>     (empty = allow everything for that agent)
 *   Allow: <path>
 * followed by an optional "Sitemap: <absolute url>" line.
 *
 * Honesty notes:
 * - Paths that do not start with "/" are auto-corrected (a leading "/" is
 *   prepended) and the correction is reported in `errors` — nothing is
 *   silently changed.
 * - An empty Disallow list for an agent means "allow all" per the standard;
 *   this is emitted as a bare "Disallow:" line and noted in `errors`.
 * - A rule line with no User-agent above it (e.g. after a blank line) is
 *   attached to the previous block's group, and the attachment is reported
 *   in `errors` — nothing is silently dropped.
 * - Non-ASCII paths are percent-encoded with encodeURI so the file stays
 *   ASCII-safe (per the robots.txt specification).
 * - This tool only writes correct syntax. Whether a URL is actually blocked
 *   or allowed depends on the paths YOU enter — review them before
 *   publishing. robots.txt is a crawling hint, not a security control.
 * - Deterministic: same inputs always produce the same file text.
 */

export interface RunToolResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

export interface RuleLine {
  directive: "Allow" | "Disallow";
  path: string;
}

export interface RuleBlock {
  userAgents: string[];
  rules: RuleLine[];
}

const DIRECTIVE_RE = /^(user-agent|allow|disallow)\s*:\s*(.*)$/i;

/**
 * True for an absolute http(s) URL. Pure parse — no network, no DOM.
 * Uses the WHATWG URL global (available in Node and browsers).
 */
export function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Parse the textarea DSL into rule blocks.
 * Returns blocks plus per-line notes (corrections/ignored lines).
 */
export function parseRuleBlocks(
  rulesText: string
): { blocks: RuleBlock[]; notes: string[] } {
  const blocks: RuleBlock[] = [];
  const notes: string[] = [];
  let current: RuleBlock | null = null;
  let lineNo = 0;

  const closeBlock = () => {
    // `current` may already be in `blocks` when an orphan rule line was
    // attached to a previous block — never push it twice.
    if (current && current.userAgents.length > 0 && !blocks.includes(current)) {
      blocks.push(current);
    }
    current = null;
  };

  for (const rawLine of rulesText.split(/\r?\n/)) {
    lineNo += 1;
    const line = rawLine.trim();

    if (line === "") {
      closeBlock();
      continue;
    }
    if (line.startsWith("#")) continue;

    const m = DIRECTIVE_RE.exec(line);
    if (!m) {
      notes.push(`Line ${lineNo}: ignored — not a directive. Use "User-agent:", "Allow:" or "Disallow:".`);
      continue;
    }

    const directive = m[1].toLowerCase();
    const value = (m[2] ?? "").trim();

    if (directive === "user-agent") {
      if (value === "") {
        notes.push(`Line ${lineNo}: ignored — User-agent has no value.`);
        continue;
      }
      // A new User-agent line right after rule lines starts a new block
      // only when the current block already has rules; consecutive
      // User-agent lines belong to the same group (per the standard).
      if (current && current.rules.length > 0) closeBlock();
      if (!current) current = { userAgents: [], rules: [] };
      current.userAgents.push(value);
    } else {
      if (!current) {
        if (blocks.length > 0) {
          // A rule line with no User-agent above it (e.g. after a blank
          // line): attach it to the previous block's group and say so.
          current = blocks[blocks.length - 1];
          notes.push(
            `Line ${lineNo}: this rule has no "User-agent:" above it — it was added to the previous group ("${current.userAgents.join(", ")}").`
          );
        } else {
          current = { userAgents: [], rules: [] };
        }
      }
      let path = value;
      if (path !== "" && !path.startsWith("/")) {
        path = "/" + path;
        notes.push(`Line ${lineNo}: path did not start with "/" — corrected to "${path}".`);
      }
      // Percent-encode non-ASCII characters (robots.txt is ASCII).
      const encoded = path === "" ? "" : encodeURI(path);
      if (encoded !== path) {
        notes.push(`Line ${lineNo}: non-ASCII characters in "${path}" were percent-encoded.`);
      }
      current.rules.push({
        directive: directive === "allow" ? "Allow" : "Disallow",
        path: encoded,
      });
    }
  }
  closeBlock();
  return { blocks, notes };
}

/**
 * Render the parsed blocks (+ optional sitemap) to robots.txt text.
 * Pure — no validation, assumes parseRuleBlocks output.
 */
export function renderRobotsTxt(blocks: RuleBlock[], sitemapUrl: string): string {
  const lines: string[] = [
    "# robots.txt generated with the HusnainBlogger Robots.txt Generator",
    "# Review the rules below before uploading this file to your site root.",
  ];
  blocks.forEach((block, i) => {
    lines.push("");
    for (const agent of block.userAgents) {
      lines.push(`User-agent: ${agent}`);
    }
    if (block.rules.length === 0) {
      lines.push("Disallow:");
    } else {
      for (const rule of block.rules) {
        // No trailing space on an empty path ("Disallow:" alone = allow all).
        lines.push(rule.path === "" ? `${rule.directive}:` : `${rule.directive}: ${rule.path}`);
      }
    }
    if (i === blocks.length - 1) lines.push("");
  });
  if (sitemapUrl !== "") {
    lines.push(`Sitemap: ${sitemapUrl}`);
  }
  return lines.join("\n");
}

/**
 * Tool-logic slot. Values keys: rules (textarea DSL, required),
 * sitemapUrl? (absolute URL).
 * Returns values: { robotsTxt, errors } (match meta.ts ids).
 */
export function runTool(values: Record<string, unknown>): RunToolResult {
  if (!values || typeof values !== "object") {
    return { ok: false, error: "Please enter your robots.txt rules first." };
  }

  const rulesText = str(values["rules"]);
  const sitemapUrl = str(values["sitemapUrl"]);

  if (rulesText.length === 0) {
    return { ok: false, error: "Please enter at least one rule block (a User-agent line)." };
  }
  if (sitemapUrl !== "" && !isAbsoluteHttpUrl(sitemapUrl)) {
    return {
      ok: false,
      error: "Sitemap URL must be an absolute URL starting with http:// or https://.",
    };
  }

  const { blocks, notes } = parseRuleBlocks(rulesText);
  if (blocks.length === 0) {
    return {
      ok: false,
      error: 'No valid rule blocks found. Each block needs a "User-agent:" line, e.g. "User-agent: *".',
    };
  }

  const errors: string[] = [...notes];
  for (const block of blocks) {
    // An empty Disallow ("Disallow:" with no path) is still a Disallow
    // rule, but it does not block anything — flag it as allow-all.
    const blocksAnything = block.rules.some(
      (r) => r.directive === "Disallow" && r.path !== ""
    );
    if (!blocksAnything) {
      errors.push(
        `Note: "${block.userAgents.join(", ")}" blocks nothing — it has no Disallow paths (an empty Disallow means crawlers may access everything).`
      );
    }
  }

  return {
    ok: true,
    values: { robotsTxt: renderRobotsTxt(blocks, sitemapUrl), errors },
  };
}
