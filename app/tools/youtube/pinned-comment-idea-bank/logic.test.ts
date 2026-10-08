import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  COMMENT_BANK,
  PIN_TIPS,
  HONESTY_NOTE,
  fillTemplate,
  templatesForGoal,
  runTool,
} from "./logic.ts";
import { inputs, outputs, content } from "./meta.ts";

describe("COMMENT_BANK", () => {
  it("has exactly 12 templates, 4 per goal", () => {
    assert.equal(COMMENT_BANK.length, 12);
    for (const goal of ["engagement", "corrections", "links"]) {
      assert.equal(COMMENT_BANK.filter((t) => t.goal === goal).length, 4, goal);
    }
  });
  it("ids are unique kebab-case and every template has a {topic} slot", () => {
    const ids = COMMENT_BANK.map((t) => t.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const t of COMMENT_BANK) {
      assert.match(t.id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
      assert.ok(t.template.includes("{topic}"), t.id);
      assert.ok(t.template.trim().length > 0);
    }
  });
  it("PIN_TIPS has the manual-pinning honesty steps", () => {
    assert.ok(PIN_TIPS.length >= 3);
    assert.ok(PIN_TIPS.join(" ").includes("cannot post or pin"));
  });
});

describe("fillTemplate", () => {
  it("fills {topic} and normalizes whitespace", () => {
    assert.equal(
      fillTemplate("Tell me about {topic}!", "  budget   travel "),
      "Tell me about budget travel!",
    );
  });
  it("fills every {topic} occurrence", () => {
    assert.equal(fillTemplate("{topic} vs {topic}", "x"), "x vs x");
  });
});

describe("templatesForGoal", () => {
  it("returns bank-order templates for each goal", () => {
    const e = templatesForGoal("engagement");
    assert.equal(e.length, 4);
    assert.deepEqual(
      e.map((t) => t.id),
      ["engagement-question", "engagement-takeaway", "engagement-next-video", "engagement-poll"],
    );
  });
});

describe("runTool", () => {
  it("happy path: engagement goal returns 4 filled comments", () => {
    const r = runTool({ topic: "sourdough baking", goal: "engagement" });
    assert.equal(r.ok, true);
    const comments = r.values?.comments as string[];
    assert.equal(comments.length, 4);
    for (const c of comments) {
      assert.ok(c.includes("sourdough baking"));
      assert.ok(!c.includes("{topic}"));
    }
    assert.equal(r.values?.count, 4);
    assert.equal((r.values?.pinTips as string[]).length, PIN_TIPS.length);
    assert.equal(r.values?.honestyNote, HONESTY_NOTE);
  });
  it("corrections and links goals each return 4 comments", () => {
    for (const goal of ["corrections", "links"]) {
      const r = runTool({ topic: "email marketing", goal });
      assert.equal(r.ok, true);
      assert.equal((r.values?.comments as string[]).length, 4);
    }
  });
  it("copyAll contains all comments numbered", () => {
    const r = runTool({ topic: "x", goal: "links" });
    const copyAll = String(r.values?.copyAll);
    assert.ok(copyAll.includes("1.") && copyAll.includes("4."));
    assert.ok(!(r.values?.comments as string[]).some((c) => !copyAll.includes(c)));
  });
  it("errors on empty topic", () => {
    const r = runTool({ topic: "   ", goal: "engagement" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("topic"));
  });
  it("errors on missing topic", () => {
    assert.equal(runTool({ goal: "engagement" }).ok, false);
  });
  it("errors on an invalid goal with the allowed list", () => {
    const r = runTool({ topic: "x", goal: "viral" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("engagement"));
  });
  it("errors on missing goal", () => {
    assert.equal(runTool({ topic: "x" }).ok, false);
  });
  it("rejects non-object input", () => {
    assert.equal(runTool(null as unknown as Record<string, unknown>).ok, false);
  });
  it("goal parsing is case-insensitive", () => {
    assert.equal(runTool({ topic: "x", goal: "Engagement" }).ok, true);
  });
  it("is deterministic", () => {
    const a = { topic: "yoga", goal: "corrections" };
    assert.deepEqual(runTool(a), runTool(a));
  });
  it("honesty note says template library, not AI", () => {
    assert.ok(HONESTY_NOTE.toLowerCase().includes("template"));
    assert.ok(HONESTY_NOTE.toLowerCase().includes("cannot post"));
  });
});

describe("meta contract (generator)", () => {
  it("output ids match runTool's returned keys", () => {
    const got = Object.keys(runTool({ topic: "x", goal: "engagement" }).values ?? {}).sort();
    const want = outputs.map((o) => o.id).sort();
    assert.deepEqual(got, want);
  });
  it("inputs has topic (required text) and goal (required select with 3 options)", () => {
    const topic = inputs.find((i) => i.id === "topic");
    const goal = inputs.find((i) => i.id === "goal");
    assert.equal(topic?.type, "text");
    assert.equal(topic?.required, true);
    assert.equal(goal?.type, "select");
    assert.deepEqual(goal?.options, ["engagement", "corrections", "links"]);
  });
  it("title is <= 60 chars and description is 140-160 chars", () => {
    assert.ok(content.title.length <= 60, `title ${content.title.length}`);
    assert.ok(
      content.description.length >= 140 && content.description.length <= 160,
      `description ${content.description.length}`,
    );
  });
  it("has 2-3 examples with real input ids and primitive values", () => {
    const ex = content.examples ?? [];
    assert.ok(ex.length >= 2 && ex.length <= 3);
    const ids = new Set(inputs.map((i) => i.id));
    for (const e of ex) {
      for (const k of Object.keys(e.inputs)) assert.ok(ids.has(k), k);
    }
  });
  it("canonical url is absolute and matches the slug", () => {
    const ld = content.jsonLd ?? [];
    const app = ld.find((o) => o["@type"] === "SoftwareApplication") as Record<string, unknown>;
    assert.equal(app["url"], "https://husnainblogger.com/tools/youtube/pinned-comment-idea-bank/");
  });
});
