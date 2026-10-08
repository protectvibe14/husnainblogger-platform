/**
 * Tests for tool-390 Facebook Post Idea Generator logic.
 * node:test + node:assert only.
 */
import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  formatDraft,
  ENGAGEMENT_IDEAS,
  TRAFFIC_IDEAS,
  COMMUNITY_IDEAS,
  POST_GOALS,
  DRAFT_COUNT,
  HOOK_GUIDE_LENGTH,
  MAX_PAGE_TYPE_LENGTH,
  MAX_DRAFT_LENGTH,
  LONG_DRAFT_NOTE_AT,
} from "./logic.ts";

const BASE = { pageType: "bakery", goal: "engagement" };

test("happy path: 5 drafts with HOOK/BODY/CTA, all output ids present", () => {
  const r = runTool(BASE);
  assert.equal(r.ok, true);
  assert.ok(r.values);
  const v = r.values!;
  assert.equal(v.postDrafts.length, DRAFT_COUNT);
  for (const d of v.postDrafts) {
    assert.ok(d.startsWith("HOOK: "));
    assert.ok(d.includes("\nBODY: "));
    assert.ok(d.includes("\nCTA: "));
    assert.ok(!d.includes("{type}"));
    assert.ok(d.toLowerCase().includes("bakery"));
  }
  assert.ok(v.copyAll.includes(v.postDrafts[0]));
  assert.ok(v.trimTip.includes("125–150"));
  assert.ok(v.trimTip.includes("63,206"));
  assert.equal(v.yourDraft, "");
});

test("goal missing -> defaults to engagement", () => {
  const r = runTool({ pageType: "bakery" });
  assert.equal(r.ok, true);
  assert.equal(r.values!.postDrafts.length, DRAFT_COUNT);
});

test("traffic goal -> traffic-flavored drafts", () => {
  const r = runTool({ ...BASE, goal: "traffic" });
  assert.equal(r.ok, true);
  assert.ok(r.values!.postDrafts.join(" ").includes("[link]"));
});

test("community goal -> community-flavored drafts", () => {
  const r = runTool({ ...BASE, goal: "community" });
  assert.equal(r.ok, true);
  assert.equal(r.values!.postDrafts.length, DRAFT_COUNT);
});

test("invalid goal -> error", () => {
  const r = runTool({ ...BASE, goal: "viral" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /engagement.*traffic.*community/i);
});

test("missing pageType -> error", () => {
  const r = runTool({ goal: "traffic" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /page type/i);
});

test("pageType too long -> error", () => {
  const r = runTool({ pageType: "x".repeat(MAX_PAGE_TYPE_LENGTH + 1) });
  assert.equal(r.ok, false);
  assert.match(r.error!, /60/i);
});

test("deterministic: same inputs -> identical outputs", () => {
  const a = runTool(BASE);
  const b = runTool(BASE);
  assert.deepEqual(a, b);
});

test("hooks are front-loaded: all hooks <= 120 chars after fill", () => {
  const r = runTool({ pageType: "fitness coaching", goal: "engagement" });
  for (const d of r.values!.postDrafts) {
    const hook = d.split("\n")[0].replace("HOOK: ", "");
    assert.ok(hook.length <= HOOK_GUIDE_LENGTH, `hook too long: "${hook}"`);
  }
});

test("bank sizes documented: 8 ideas per goal = 24 total", () => {
  assert.equal(ENGAGEMENT_IDEAS.length, 8);
  assert.equal(TRAFFIC_IDEAS.length, 8);
  assert.equal(COMMUNITY_IDEAS.length, 8);
  assert.deepEqual(POST_GOALS, ["engagement", "traffic", "community"]);
  for (const idea of [...ENGAGEMENT_IDEAS, ...TRAFFIC_IDEAS, ...COMMUNITY_IDEAS]) {
    assert.ok(idea.hook.length > 0 && idea.body.length > 0 && idea.cta.length > 0);
  }
});

test("edge case: pasted draft kept verbatim", () => {
  const draft = "My sale starts Monday! Big discounts on all cakes.";
  const r = runTool({ ...BASE, yourDraft: draft });
  assert.equal(r.ok, true);
  assert.equal(r.values!.yourDraft, draft);
});

test("edge case: 5000-char draft kept + trim note appears", () => {
  const draft = "x".repeat(5000);
  const r = runTool({ ...BASE, yourDraft: draft });
  assert.equal(r.ok, true);
  assert.equal(r.values!.yourDraft, draft);
  assert.match(r.values!.trimTip, /consider trimming/i);
  assert.ok(r.values!.trimTip.includes("5000"));
});

test("short draft -> no trim note", () => {
  const r = runTool({ ...BASE, yourDraft: "short" });
  assert.equal(r.ok, true);
  assert.ok(!r.values!.trimTip.includes("consider trimming"));
});

test("draft over max length -> error", () => {
  const r = runTool({ ...BASE, yourDraft: "x".repeat(MAX_DRAFT_LENGTH + 1) });
  assert.equal(r.ok, false);
  assert.match(r.error!, /63,206/i);
});

test("formatDraft renders HOOK/BODY/CTA lines", () => {
  const s = formatDraft({ hook: "h", body: "b", cta: "c" });
  assert.equal(s, "HOOK: h\nBODY: b\nCTA: c");
});

test("drafts vary with different page types", () => {
  const a = runTool(BASE).values!.postDrafts;
  const b = runTool({ ...BASE, pageType: "car detailing" }).values!.postDrafts;
  assert.ok(a.join(" ").toLowerCase().includes("bakery"));
  assert.ok(b.join(" ").toLowerCase().includes("car detailing"));
});

test("LONG_DRAFT_NOTE_AT threshold sane", () => {
  assert.equal(LONG_DRAFT_NOTE_AT, 2000);
});
