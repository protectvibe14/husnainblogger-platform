/**
 * Tests for the Content Upgrade Idea Generator pure logic (tool-427).
 *
 * Run: node --test app/tools/email-marketing/content-upgrade-idea-generator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import {
  runTool,
  readCount,
  collapseDuplicateWords,
  UPGRADE_TEMPLATES,
  FORMATS,
  IDEAS_COLUMNS,
  MIN_COUNT,
  MAX_COUNT,
  MAX_TOPIC_CHARS,
} from "./logic.ts";
import { outputs as metaOutputs, content as metaContent } from "./meta.ts";

const VALID = {
  blogTopic: "email marketing",
  audience: "beginner bloggers",
  count: 5,
};

interface IdeasTable {
  columns: string[];
  rows: string[][];
}

function ideasOf(r: { ok: boolean; values?: Record<string, unknown> }): IdeasTable {
  assert.strictEqual(r.ok, true);
  return r.values!["ideas"] as IdeasTable;
}

describe("runTool — happy path", () => {
  it("returns a table with the requested number of ideas", () => {
    const t = ideasOf(runTool({ ...VALID }));
    assert.deepStrictEqual(t.columns, [...IDEAS_COLUMNS]);
    assert.strictEqual(t.rows.length, 5);
    for (const row of t.rows) {
      assert.strictEqual(row.length, 4);
      assert.ok(row[1].length > 0, "idea title must not be empty");
      assert.ok(FORMATS.includes(row[2]), `format must be known: ${row[2]}`);
      assert.ok(row[3].length > 0, "placement must not be empty");
    }
  });

  it("embeds the blog topic or audience in every idea", () => {
    const t = ideasOf(runTool({ ...VALID }));
    const all = t.rows.map((r) => r[1]).join(" ");
    assert.ok(all.includes("email marketing"), "topic appears somewhere");
    assert.ok(all.includes("beginner bloggers"), "audience appears somewhere");
  });

  it("picks distinct templates within one run (coprime stride)", () => {
    const t = ideasOf(runTool({ ...VALID, count: 10 }));
    const titles = t.rows.map((r) => r[1]);
    assert.strictEqual(new Set(titles).size, titles.length, "all 10 ideas distinct");
  });

  it("accepts a numeric-string count", () => {
    const t = ideasOf(runTool({ blogTopic: "x", audience: "y", count: "3" }));
    assert.strictEqual(t.rows.length, 3);
  });
});

describe("runTool — validation errors", () => {
  it("rejects missing blogTopic", () => {
    const r = runTool({ audience: "y", count: 3 });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /blog topic/i);
  });

  it("rejects whitespace-only blogTopic", () => {
    const r = runTool({ blogTopic: "   ", audience: "y", count: 3 });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /blog topic/i);
  });

  it("rejects missing audience", () => {
    const r = runTool({ blogTopic: "x", count: 3 });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /audience/i);
  });

  it("rejects missing count", () => {
    const r = runTool({ blogTopic: "x", audience: "y" });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /number of ideas/i);
  });

  it("rejects non-numeric count", () => {
    const r = runTool({ blogTopic: "x", audience: "y", count: "abc" });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /number/i);
  });

  it("rejects NaN and Infinity counts", () => {
    assert.strictEqual(runTool({ ...VALID, count: Number.NaN }).ok, false);
    assert.strictEqual(runTool({ ...VALID, count: Number.POSITIVE_INFINITY }).ok, false);
  });
});

describe("runTool — edge cases", () => {
  it("is deterministic: same inputs give identical output", () => {
    const a = runTool({ ...VALID });
    const b = runTool({ ...VALID });
    assert.deepStrictEqual(a, b);
  });

  it("clamps count above max and adds a visible note", () => {
    const t = ideasOf(runTool({ ...VALID, count: 99 }));
    assert.strictEqual(t.rows.length, MAX_COUNT + 1); // +1 note row
    assert.match(t.rows[t.rows.length - 1][1], /capped at the maximum of 10/);
  });

  it("raises count below min and adds a visible note", () => {
    const t = ideasOf(runTool({ ...VALID, count: 0 }));
    assert.strictEqual(t.rows.length, MIN_COUNT + 1);
    assert.match(t.rows[t.rows.length - 1][1], /minimum of 1/);
  });

  it("truncates overlong topic with a visible notice", () => {
    const long = "x".repeat(MAX_TOPIC_CHARS + 50);
    const t = ideasOf(runTool({ blogTopic: long, audience: "y", count: 2 }));
    assert.strictEqual(t.rows.length, 3); // 2 ideas + note row
    assert.match(t.rows[2][1], new RegExp(`shortened from ${MAX_TOPIC_CHARS + 50} to ${MAX_TOPIC_CHARS}`));
  });

  it("measures length in code points so emoji topics are not cut early", () => {
    const topic = "📧".repeat(10); // 10 code points
    const r = runTool({ blogTopic: topic, audience: "y", count: 1 });
    assert.strictEqual(r.ok, true);
    const t = ideasOf(r);
    assert.strictEqual(t.rows.length, 1, "no truncation notice row expected");
  });

  it("escapes HTML in user input so no markup renders", () => {
    const t = ideasOf(runTool({ blogTopic: "<b>bold</b>", audience: "y", count: 2 }));
    for (const row of t.rows) {
      assert.ok(!row[1].includes("<b>"), row[1]);
      assert.ok(row[1].includes("&lt;b&gt;"), row[1]);
    }
  });

  it("collapses consecutive duplicate words introduced by filling", () => {
    const t = ideasOf(runTool({ blogTopic: "Printable", audience: "y", count: 4 }));
    const all = t.rows.map((r) => r[1]).join(" ");
    assert.ok(!/printable printable/i.test(all), all);
  });
});

describe("collapseDuplicateWords — unit", () => {
  it("collapses exact consecutive repeats case-insensitively", () => {
    assert.strictEqual(collapseDuplicateWords("The the Guide"), "The Guide");
  });

  it("leaves non-consecutive repeats alone", () => {
    assert.strictEqual(collapseDuplicateWords("very good, very nice"), "very good, very nice");
  });
});

describe("readCount — unit", () => {
  it("rounds fractional counts", () => {
    assert.deepStrictEqual(readCount({ count: 4.7 }), { ok: true, value: 5 });
  });

  it("keeps in-range values unchanged without notice", () => {
    assert.deepStrictEqual(readCount({ count: 6 }), { ok: true, value: 6 });
  });
});

describe("bank bounds", () => {
  it("template bank has 24 non-empty entries, 4 per format", () => {
    assert.strictEqual(UPGRADE_TEMPLATES.length, 24);
    for (const f of FORMATS) {
      const n = UPGRADE_TEMPLATES.filter((t) => t.format === f).length;
      assert.strictEqual(n, 4, `format ${f}`);
    }
    for (const t of UPGRADE_TEMPLATES) {
      assert.ok(t.pattern.length > 0 && t.placement.length > 0);
      assert.ok(t.pattern.includes("{blogTopic}") || t.pattern.includes("{audience}"));
    }
  });
});

describe("meta contract", () => {
  it("output ids match meta outputs", () => {
    const ids = metaOutputs.map((o) => o.id);
    assert.deepStrictEqual(ids, ["ideas"]);
  });

  it("title is <= 60 chars and description is 140–160 chars", () => {
    assert.ok(metaContent.title.length <= 60, metaContent.title);
    assert.ok(
      metaContent.description.length >= 140 && metaContent.description.length <= 160,
      `${metaContent.description.length}: ${metaContent.description}`,
    );
  });

  it("schema contract: ToolShell auto-emits SoftwareApplication + BreadcrumbList + FAQPage for every tool page", () => {
    // Architecture: ToolShell.astro emits FAQPage/SoftwareApplication/
    // BreadcrumbList for ALL tool pages from tool meta. content.jsonLd in
    // meta.ts is reserved for tool-specific extras only, so the tool's job
    // is to feed the shell valid meta — and never duplicate the shell's blocks.
    const types = (metaContent.jsonLd as Array<Record<string, unknown>>).map((j) => j["@type"]);
    assert.ok(!types.includes("SoftwareApplication"), "ToolShell auto-generates SoftwareApplication");
    assert.ok(!types.includes("BreadcrumbList"), "ToolShell auto-generates BreadcrumbList");
    assert.ok(!types.includes("FAQPage"), "ToolShell auto-generates FAQPage");
    assert.ok(
      (metaContent.description ?? "").length > 0,
      "shell builds SoftwareApplication.description from the tool description",
    );
    const shell = readFileSync(
      new URL("../../../src/templates/ToolShell.astro", import.meta.url),
      "utf8",
    );
    assert.ok(shell.includes("'@type': 'SoftwareApplication'"), "ToolShell emits SoftwareApplication");
    assert.ok(shell.includes("'@type': 'BreadcrumbList'"), "ToolShell emits BreadcrumbList");
    assert.ok(shell.includes("'@type': 'FAQPage'"), "ToolShell emits FAQPage");
    // Breadcrumb is built from tool data: Home / Tools / category / tool
    assert.ok(shell.includes("position: 3") && shell.includes("tool.category"), "shell builds the category crumb from tool data");
  });
});
