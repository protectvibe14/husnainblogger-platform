import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  buildMap,
  clusterSubtopics,
  parseSubtopics,
  findCoverageGaps,
  mapToMarkdown,
  slugify,
  significantWords,
  ANGLE_BANK_SIZE,
  FAQ_TEMPLATE_COUNT,
  STARTER_CLUSTER_COUNT,
  GAP_BANK_SIZE,
  MAX_SUBTOPICS,
  MAX_CORE_TOPIC_CHARS,
} from "./logic.ts";

function okRun(items: Record<string, unknown>[]) {
  const r = runTool({ items });
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values as Record<string, unknown>;
}

describe("topical-authority-map-builder", () => {
  it("happy path: depth 1 builds pillar + cluster guides", () => {
    const v = okRun([{ coreTopic: "email marketing", subtopics: "list building\nemail copywriting", depth: "1" }]);
    const result = v.result as string;
    assert.match(result, /# Topical Map: email marketing/);
    assert.match(result, /## Pillar/);
    assert.match(result, /list building: The Complete Guide/);
    const clusters = v.clusters as string[];
    assert.ok(clusters.length >= 1);
  });

  it("depth 2 adds supporting articles from the angle bank", () => {
    const v = okRun([{ coreTopic: "email marketing", subtopics: "list building", depth: 2 }]);
    const result = v.result as string;
    assert.match(result, /\[supporting\]/);
    assert.match(result, /Step-by-Step Tutorial|for Beginners/);
  });

  it("depth 3 adds FAQ questions", () => {
    const v = okRun([{ coreTopic: "email marketing", subtopics: "list building", depth: 3 }]);
    const result = v.result as string;
    assert.match(result, /\[faq\]/);
    assert.match(result, /\?/);
  });

  it("depth defaults to 2", () => {
    const v = okRun([{ coreTopic: "email marketing", subtopics: "list building" }]);
    assert.match(v.result as string, /\[supporting\]/);
    assert.ok(!(v.result as string).includes("[faq]"));
  });

  it("invalid depth fails with Item 1 label", () => {
    const r = runTool({ items: [{ coreTopic: "email marketing", depth: "5" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Item 1: depth must be 1, 2, or 3/);
  });

  it("missing coreTopic fails", () => {
    const r = runTool({ items: [{ subtopics: "a" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Item 1: coreTopic is required/);
  });

  it("over-long coreTopic fails", () => {
    const r = runTool({ items: [{ coreTopic: "c".repeat(MAX_CORE_TOPIC_CHARS + 1) }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /120 characters or fewer/);
  });

  it("too many subtopics fails", () => {
    const many = Array.from({ length: MAX_SUBTOPICS + 1 }, (_, i) => `topic ${i}`);
    const r = runTool({ items: [{ coreTopic: "email marketing", subtopics: many }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /at most 30 subtopics/);
  });

  it("edge: no subtopics uses starter clusters (template-generated)", () => {
    const v = okRun([{ coreTopic: "email marketing" }]);
    const result = v.result as string;
    assert.match(result, /Foundations/);
    assert.match(result, /auto-generated from starter angles/);
    const clusters = v.clusters as string[];
    assert.equal(clusters.length, STARTER_CLUSTER_COUNT);
    assert.equal(STARTER_CLUSTER_COUNT, 4);
  });

  it("edge: unicode subtopics cluster and render correctly", () => {
    const v = okRun([{ coreTopic: "baking", subtopics: "sourdough brød\nsourdough starter tips" }]);
    const result = v.result as string;
    assert.match(result, /sourdough/);
    assert.ok((v.clusters as string[]).length >= 1);
  });

  it("clustering: subtopics sharing a significant word group together", () => {
    const groups = clusterSubtopics(["email copywriting", "email automation", "landing pages"]);
    assert.equal(groups.length, 2);
    const email = groups.find((g) => g.includes("email copywriting"))!;
    assert.ok(email.includes("email automation"));
  });

  it("clustering: no shared words means separate clusters", () => {
    const groups = clusterSubtopics(["email copywriting", "landing pages"]);
    assert.equal(groups.length, 2);
  });

  it("coverage gaps list uncovered angles", () => {
    const gaps = findCoverageGaps(["email copywriting"]);
    assert.ok(gaps.length > 0);
    assert.ok(gaps.every((g) => g.startsWith("Consider adding")));
    assert.equal(GAP_BANK_SIZE, 10);
  });

  it("covered angles are not reported as gaps", () => {
    const gaps = findCoverageGaps(["beginner tutorial", "email copywriting"]);
    assert.ok(!gaps.some((g) => g.includes("beginner guides")));
  });

  it("markdown includes the honesty note about not measuring authority", () => {
    const m = buildMap("email marketing", ["list building"], 1);
    const md = mapToMarkdown(m);
    assert.match(md, /does not measure real topical authority/);
    assert.match(md, /Total articles planned/);
  });

  it("angle bank and FAQ template counts are documented", () => {
    assert.equal(ANGLE_BANK_SIZE, 10);
    assert.equal(FAQ_TEMPLATE_COUNT, 3);
  });

  it("subtopics dedupe case-insensitively, blanks dropped", () => {
    const parsed = parseSubtopics("List Building\n\nlist building\nEmail Copy");
    assert.deepEqual(parsed, ["List Building", "Email Copy"]);
  });

  it("multiple items produce multiple maps with separators", () => {
    const v = okRun([
      { coreTopic: "email marketing", subtopics: "list building", depth: 1 },
      { coreTopic: "seo basics", subtopics: "keyword research", depth: 1 },
    ]);
    const result = v.result as string;
    assert.match(result, /Map 1/);
    assert.match(result, /Map 2/);
    assert.match(result, /email marketing/);
    assert.match(result, /seo basics/);
  });

  it("second bad item fails the whole run", () => {
    const r = runTool({
      items: [{ coreTopic: "email marketing" }, { coreTopic: "x" }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Item 2: coreTopic is required/);
  });

  it("empty items fail", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /at least one core topic/);
  });

  it("slugify and significantWords behave", () => {
    assert.equal(slugify("Email Marketing 101!"), "email-marketing-101");
    assert.deepEqual(significantWords("The quick brown fox"), ["quick", "brown"]);
  });

  it("deterministic: same items give identical output", () => {
    const items = [{ coreTopic: "email marketing", subtopics: "list building\nemail copywriting", depth: 2 }];
    assert.deepEqual(okRun(items), okRun(items));
  });

  it("output ids match contract: result, clusters, coverageGaps", () => {
    const v = okRun([{ coreTopic: "email marketing", subtopics: "list building" }]);
    assert.deepEqual(Object.keys(v).sort(), ["clusters", "coverageGaps", "result"]);
    assert.ok(Array.isArray(v.clusters));
    assert.ok(Array.isArray(v.coverageGaps));
    assert.equal(typeof v.result, "string");
  });

  it("non-object input fails gracefully", () => {
    const r = runTool(null as unknown as { items: Record<string, unknown>[] });
    assert.equal(r.ok, false);
    assert.ok(typeof r.error === "string");
  });
});
