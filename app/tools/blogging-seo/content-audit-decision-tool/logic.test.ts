/**
 * Tests for the Content Audit Decision Tool pure logic (tool-037).
 *
 * Run: node --test app/tools/blogging-seo/content-audit-decision-tool/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  scorePage,
  decidePage,
  isValidUrl,
  MAX_PAGES,
} from "./logic.ts";

function pagesJson(pages: unknown[]): string {
  return JSON.stringify(pages);
}

const STRONG = {
  url: "https://example.com/strong-post",
  trafficTrend: 9,
  conversions: 8,
  quality: 9,
  cannibalizationRisk: 2,
};
const WEAK = {
  url: "https://example.com/weak-post",
  trafficTrend: 1,
  conversions: 1,
  quality: 2,
  cannibalizationRisk: 4,
};

describe("isValidUrl", () => {
  it("accepts http/https URLs", () => {
    assert.equal(isValidUrl("https://example.com/a"), true);
    assert.equal(isValidUrl("http://example.com"), true);
  });
  it("rejects non-URLs and missing protocol", () => {
    assert.equal(isValidUrl("example.com"), false);
    assert.equal(isValidUrl("ftp://example.com"), false);
    assert.equal(isValidUrl(""), false);
    assert.equal(isValidUrl("not a url"), false);
  });
  it("accepts unicode URLs", () => {
    assert.equal(isValidUrl("https://例え.jp/記事"), true);
    assert.equal(isValidUrl("https://example.com/café"), true);
  });
});

describe("scorePage / decidePage — the published decision tree", () => {
  const equal = { trafficTrend: 1, conversions: 1, quality: 1, cannibalizationRisk: 1 };

  it("keeps a healthy page (score >= 7.5)", () => {
    const d = decidePage(STRONG, scorePage(STRONG, equal));
    assert.equal(d.decision, "keep");
    assert.ok(d.reason.length > 0);
  });

  it("recommends update for a middling page", () => {
    const page = { ...STRONG, url: "https://example.com/mid", trafficTrend: 4, conversions: 4, quality: 6, cannibalizationRisk: 3 };
    const d = decidePage(page, scorePage(page, equal));
    assert.equal(d.decision, "update");
  });

  it("recommends merge when cannibalization risk is >= 7 (and page is decent)", () => {
    const page = { ...STRONG, url: "https://example.com/dup", cannibalizationRisk: 8 };
    const d = decidePage(page, scorePage(page, equal));
    assert.equal(d.decision, "merge");
  });

  it("recommends delete for a thin, declining, non-converting page", () => {
    const d = decidePage(WEAK, scorePage(WEAK, equal));
    assert.equal(d.decision, "delete");
    assert.ok(d.reason.includes("backlinks"));
  });

  it("recommends delete for a page with score < 3 that is not thin-declining", () => {
    // quality 4 avoids rule 1; score = (1+1+4+5)/4 = 2.75 < 3 -> delete via rule 5.
    const page = { url: "https://example.com/low4", trafficTrend: 1, conversions: 1, quality: 4, cannibalizationRisk: 5 };
    const d = decidePage(page, scorePage(page, equal));
    assert.equal(d.decision, "delete");
  });

  it("weights change the score deterministically", () => {
    const page = { url: "https://example.com/w", trafficTrend: 10, conversions: 0, quality: 0, cannibalizationRisk: 0 };
    const equalW = { trafficTrend: 1, conversions: 1, quality: 1, cannibalizationRisk: 1 };
    const trafficOnly = { trafficTrend: 3, conversions: 0, quality: 0, cannibalizationRisk: 0 };
    assert.equal(scorePage(page, equalW), 5);
    assert.equal(scorePage(page, trafficOnly), 10);
  });

  it("cannibalization risk counts against the score", () => {
    const low = { ...STRONG, url: "https://example.com/a", cannibalizationRisk: 0 };
    const high = { ...STRONG, url: "https://example.com/b", cannibalizationRisk: 10 };
    assert.ok(scorePage(low, equal) > scorePage(high, equal));
  });
});

describe("runTool — happy path", () => {
  it("audits multiple pages and returns decisions + summary", () => {
    const res = runTool({ pages: pagesJson([STRONG, WEAK]) });
    assert.equal(res.ok, true);
    const v = res.values as Record<string, unknown>;
    const decisions = v["decisions"] as { columns: string[]; rows: string[][] };
    assert.equal(decisions.rows.length, 2);
    assert.equal(decisions.rows[0][2], "KEEP");
    assert.equal(decisions.rows[1][2], "DELETE");
    const summary = v["summary"] as string;
    assert.ok(summary.includes("2 page(s) audited"));
    assert.ok(summary.includes("measures no real traffic"));
  });

  it("handles a single-page audit where every page lands in one band", () => {
    const res = runTool({ pages: pagesJson([STRONG, { ...STRONG, url: "https://example.com/b" }]) });
    const v = res.values as Record<string, unknown>;
    const decisions = v["decisions"] as { rows: string[][] };
    assert.ok(decisions.rows.every((r) => r[2] === "KEEP"));
    assert.ok((v["summary"] as string).includes("2 keep"));
  });

  it("applies custom weights (merged over equal defaults)", () => {
    // weights = {trafficTrend: 3, others: 1}; score = (3*10 + 1*0 + 1*0 + 1*10)/6 = 6.7
    const page = { url: "https://example.com/x", trafficTrend: 10, conversions: 0, quality: 0, cannibalizationRisk: 0 };
    const res = runTool({ pages: pagesJson([page]), weights: '{"trafficTrend": 3}' });
    assert.equal(res.ok, true);
    const v = res.values as Record<string, unknown>;
    const decisions = v["decisions"] as { rows: string[][] };
    assert.equal(decisions.rows[0][1], "6.7");
  });
});

describe("runTool — validation", () => {
  it("rejects missing pages", () => {
    assert.deepEqual(runTool({}), {
      ok: false,
      error: "Please paste your pages as a JSON array.",
    });
  });
  it("rejects invalid JSON", () => {
    assert.equal(runTool({ pages: "not json" }).ok, false);
  });
  it("rejects a non-array JSON value", () => {
    assert.equal(runTool({ pages: '{"url":"x"}' }).ok, false);
  });
  it("rejects an empty array", () => {
    assert.equal(runTool({ pages: "[]" }).ok, false);
  });
  it("rejects an invalid URL", () => {
    const res = runTool({ pages: pagesJson([{ ...STRONG, url: "no-protocol" }]) });
    assert.equal(res.ok, false);
    assert.ok(res.error!.includes("Page 1"));
  });
  it("rejects a rating out of 0-10", () => {
    const res = runTool({ pages: pagesJson([{ ...STRONG, quality: 11 }]) });
    assert.equal(res.ok, false);
    assert.ok(res.error!.includes("quality"));
  });
  it("rejects a missing rating", () => {
    const { trafficTrend: _dropped, ...rest } = STRONG;
    assert.equal(typeof _dropped, "number"); // sanity: the field existed
    const res = runTool({ pages: pagesJson([rest]) });
    assert.equal(res.ok, false);
    assert.ok(res.error!.includes("trafficTrend"));
  });
  it("rejects too many pages", () => {
    const many = Array.from({ length: MAX_PAGES + 1 }, (_, i) => ({
      ...STRONG,
      url: `https://example.com/p${i}`,
    }));
    const res = runTool({ pages: pagesJson(many) });
    assert.equal(res.ok, false);
    assert.ok(res.error!.includes(String(MAX_PAGES)));
  });
  it("rejects invalid weights JSON", () => {
    assert.equal(runTool({ pages: pagesJson([STRONG]), weights: "nope" }).ok, false);
  });
  it("rejects unknown weight keys", () => {
    const res = runTool({ pages: pagesJson([STRONG]), weights: '{"backlinks": 2}' });
    assert.equal(res.ok, false);
    assert.ok(res.error!.includes("backlinks"));
  });
  it("rejects negative weights and all-zero weights", () => {
    assert.equal(
      runTool({ pages: pagesJson([STRONG]), weights: '{"quality": -1}' }).ok,
      false,
    );
    assert.equal(
      runTool({
        pages: pagesJson([STRONG]),
        weights: '{"trafficTrend": 0, "conversions": 0, "quality": 0, "cannibalizationRisk": 0}',
      }).ok,
      false,
    );
  });
});

describe("runTool — determinism & output shape", () => {
  it("is deterministic: same inputs -> identical outputs", () => {
    const input = { pages: pagesJson([STRONG, WEAK]), weights: '{"quality": 2}' };
    assert.deepEqual(runTool(input), runTool(input));
  });
  it("returns only the declared output ids (decisions, summary)", () => {
    const res = runTool({ pages: pagesJson([STRONG]) });
    assert.deepEqual(Object.keys(res.values ?? {}).sort(), ["decisions", "summary"]);
  });
  it("column count matches row cell count in the decisions table", () => {
    const res = runTool({ pages: pagesJson([STRONG, WEAK]) });
    const v = res.values as Record<string, unknown>;
    const decisions = v["decisions"] as { columns: string[]; rows: string[][] };
    for (const row of decisions.rows) {
      assert.equal(row.length, decisions.columns.length);
    }
  });
});
