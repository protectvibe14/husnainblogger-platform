import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, STANCES, TONES, MAX_INPUT_CHARS } from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id);

function happyValues(): Record<string, unknown> {
  return { blogName: "HusnainBlogger", moderationStance: "moderated", tone: "friendly" };
}

describe("blog-comment-policy-generator", () => {
  it("happy path returns policyText and notice", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    assert.equal(typeof r.values!.policyText, "string");
    assert.equal(typeof r.values!.notice, "string");
    assert.ok((r.values!.policyText as string).length > 500);
  });

  it("policy contains all required sections", () => {
    const r = runTool(happyValues());
    const text = r.values!.policyText as string;
    for (const section of [
      "## Welcome",
      "## What is welcome",
      "## What is not allowed",
      "## How moderation works",
      "## Consequences",
      "## Privacy",
      "## Changes to this policy",
    ]) {
      assert.ok(text.includes(section), `missing section: ${section}`);
    }
  });

  it("blog name appears in the policy", () => {
    const r = runTool(happyValues());
    assert.ok((r.values!.policyText as string).includes("HusnainBlogger"));
  });

  it("all 3 stances produce distinct moderation text", () => {
    const texts = STANCES.map((s) =>
      runTool({ ...happyValues(), moderationStance: s }).values!.policyText,
    );
    assert.equal(new Set(texts as string[]).size, 3);
  });

  it("all 3 tones produce distinct welcome text", () => {
    const texts = TONES.map((t) =>
      runTool({ ...happyValues(), tone: t }).values!.policyText,
    );
    assert.equal(new Set(texts as string[]).size, 3);
  });

  it("strict stance mentions pre-moderation", () => {
    const r = runTool({ ...happyValues(), moderationStance: "strict" });
    assert.match(r.values!.policyText as string, /pre-moderated/i);
  });

  it("open stance mentions comments appear immediately", () => {
    const r = runTool({ ...happyValues(), moderationStance: "open" });
    assert.match(r.values!.policyText as string, /appears immediately/i);
  });

  it("policy includes the not-legal-advice disclaimer", () => {
    const r = runTool(happyValues());
    assert.match(r.values!.policyText as string, /not legal advice/i);
  });

  it("missing blogName -> error", () => {
    const v = happyValues();
    delete v.blogName;
    assert.match(runTool(v).error!, /blog name/i);
  });

  it("whitespace-only blogName -> error", () => {
    const v = happyValues();
    v.blogName = "  ";
    assert.equal(runTool(v).ok, false);
  });

  it("invalid stance -> error", () => {
    const v = happyValues();
    v.moderationStance = "lenient";
    const r = runTool(v);
    assert.equal(r.ok, false);
    assert.match(r.error!, /stance/i);
  });

  it("missing stance -> error", () => {
    const v = happyValues();
    delete v.moderationStance;
    assert.equal(runTool(v).ok, false);
  });

  it("invalid tone -> error", () => {
    const v = happyValues();
    v.tone = "angry";
    const r = runTool(v);
    assert.equal(r.ok, false);
    assert.match(r.error!, /tone/i);
  });

  it("missing tone -> error", () => {
    const v = happyValues();
    delete v.tone;
    assert.equal(runTool(v).ok, false);
  });

  it("HTML stripped from blogName", () => {
    const r = runTool({ ...happyValues(), blogName: "<em>My Blog</em>" });
    assert.equal(r.ok, true);
    assert.ok(!(r.values!.policyText as string).includes("<em>"));
    assert.ok((r.values!.policyText as string).includes("My Blog"));
  });

  it("overlong blogName truncated with visible notice", () => {
    const r = runTool({ ...happyValues(), blogName: "B".repeat(400) });
    assert.equal(r.ok, true);
    assert.match(r.values!.notice as string, /shortened/);
  });

  it("emoji survive Unicode-length handling", () => {
    const r = runTool({ ...happyValues(), blogName: "Blog \u{1F525}" });
    assert.equal(r.ok, true);
    assert.ok((r.values!.policyText as string).includes("\u{1F525}"));
  });

  it("duplicate adjacent words collapsed", () => {
    const r = runTool({ ...happyValues(), blogName: "My My Blog" });
    assert.equal(r.ok, true);
    assert.ok(!(r.values!.policyText as string).includes("My My"));
  });

  it("no unfilled {placeholder} tokens in output", () => {
    const r = runTool(happyValues());
    assert.ok(!/\{[a-zA-Z]+\}/.test(r.values!.policyText as string));
  });

  it("deterministic: same inputs -> identical outputs", () => {
    assert.deepEqual(runTool(happyValues()), runTool(happyValues()));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(happyValues());
    assert.deepEqual(new Set(Object.keys(r.values!)), new Set(OUTPUT_IDS));
  });

  it("non-object values -> friendly error", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });
});
