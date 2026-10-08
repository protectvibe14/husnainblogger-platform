/**
 * Tests for the Pillar-Cluster Content Planner pure logic (tool-033).
 *
 * Run: node --test app/tools/blogging-seo/pillar-cluster-content-planner/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  buildPlan,
  slugify,
  CLUSTER_BANK,
  CLUSTER_BANK_SIZE,
  MIN_CLUSTERS,
  MAX_CLUSTERS,
  DEFAULT_CLUSTERS,
  FALLBACK_SLUG,
} from "./logic.ts";

describe("runTool — happy path", () => {
  it("builds a plan for a pillar-only input (default 8 clusters)", () => {
    const res = runTool({ pillarTopic: "content marketing" });
    assert.equal(res.ok, true);
    assert.ok(res.values);
    const plan = res.values.plan as Record<string, unknown>;
    assert.equal(plan["pillarTopic"], "content marketing");
    assert.equal(plan["clusterCount"], DEFAULT_CLUSTERS);
    assert.equal((plan["clusters"] as unknown[]).length, DEFAULT_CLUSTERS);
  });

  it("respects an explicit cluster count", () => {
    const res = runTool({ pillarTopic: "content marketing", clusterCount: 5 });
    assert.equal(res.ok, true);
    assert.equal((res.values!.clusterTopics as string[]).length, 5);
  });

  it("fills the pillar into cluster titles", () => {
    const res = runTool({ pillarTopic: "email newsletters", clusterCount: 3 });
    assert.equal(res.ok, true);
    const topics = res.values!.clusterTopics as string[];
    for (const t of topics) assert.ok(t.includes("email newsletters"), t);
  });

  it("produces unique slugs for every cluster", () => {
    const res = runTool({ pillarTopic: "content marketing", clusterCount: 20 });
    assert.equal(res.ok, true);
    const plan = res.values!.plan as Record<string, unknown>;
    const slugs = (plan["clusters"] as { slug: string }[]).map((c) => c.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  it("includes a linking note and assumptions in the plan", () => {
    const res = runTool({ pillarTopic: "content marketing" });
    const plan = res.values!.plan as Record<string, unknown>;
    assert.equal(typeof plan["linkingNote"], "string");
    assert.ok((plan["assumptions"] as string[]).length >= 1);
  });
});

describe("runTool — validation", () => {
  it("rejects a missing pillar topic", () => {
    assert.equal(runTool({}).ok, false);
  });

  it("rejects a blank pillar topic", () => {
    assert.equal(runTool({ pillarTopic: "  " }).ok, false);
  });

  it("rejects a one-character pillar topic", () => {
    assert.equal(runTool({ pillarTopic: "x" }).ok, false);
  });

  it("rejects an over-long pillar topic", () => {
    assert.equal(runTool({ pillarTopic: "p".repeat(121) }).ok, false);
  });

  it("accepts the boundary pillar lengths", () => {
    assert.equal(runTool({ pillarTopic: "ab" }).ok, true);
    assert.equal(runTool({ pillarTopic: "p".repeat(120) }).ok, true);
  });

  it("rejects a cluster count below 3", () => {
    const res = runTool({ pillarTopic: "content marketing", clusterCount: 2 });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("rejects a cluster count above 20", () => {
    const res = runTool({ pillarTopic: "content marketing", clusterCount: 21 });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("rejects a non-integer cluster count", () => {
    assert.equal(runTool({ pillarTopic: "content marketing", clusterCount: 7.5 }).ok, false);
  });

  it("accepts the boundary cluster counts", () => {
    assert.equal(runTool({ pillarTopic: "content marketing", clusterCount: MIN_CLUSTERS }).ok, true);
    assert.equal(runTool({ pillarTopic: "content marketing", clusterCount: MAX_CLUSTERS }).ok, true);
  });
});

describe("slugify", () => {
  it("lowercases, strips diacritics, hyphenates", () => {
    assert.equal(slugify("Café au Lait!"), "cafe-au-lait");
    assert.equal(slugify("  SEO   Basics  "), "seo-basics");
  });

  it("keeps non-Latin scripts", () => {
    assert.equal(slugify("日本語 SEO"), "日本語-seo");
  });

  it("falls back when nothing usable remains", () => {
    assert.equal(slugify("!!!"), FALLBACK_SLUG);
  });

  it("rejects non-string input", () => {
    assert.throws(() => slugify(42 as unknown as string), TypeError);
  });
});

describe("bank honesty and determinism", () => {
  it("documents the fixed bank size honestly", () => {
    assert.equal(CLUSTER_BANK_SIZE, 24);
    assert.equal(CLUSTER_BANK.length, CLUSTER_BANK_SIZE);
  });

  it("bank templates are used in order (first N win)", () => {
    const plan = buildPlan("email newsletters", 3);
    assert.equal(plan.clusters[0].title, "What is email newsletters? A beginner's overview");
    assert.equal(plan.clusters[1].title, "How to get started with email newsletters");
    assert.equal(plan.clusters[2].title, "Common email newsletters mistakes (and how to fix them)");
  });

  it("handles a unicode pillar topic", () => {
    const res = runTool({ pillarTopic: "café marketing 日本語" });
    assert.equal(res.ok, true);
    const plan = res.values!.plan as Record<string, unknown>;
    assert.equal(plan["pillarTopic"], "café marketing 日本語");
  });

  it("is deterministic: same input twice gives identical output", () => {
    const a = runTool({ pillarTopic: "content marketing", clusterCount: 12 });
    const b = runTool({ pillarTopic: "content marketing", clusterCount: 12 });
    assert.deepEqual(a, b);
  });

  it("output ids match the spec: plan + clusterTopics", () => {
    const res = runTool({ pillarTopic: "content marketing" });
    assert.deepEqual(Object.keys(res.values!).sort(), ["clusterTopics", "plan"]);
  });
});
