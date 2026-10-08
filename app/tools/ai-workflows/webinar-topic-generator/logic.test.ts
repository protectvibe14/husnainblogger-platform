import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  TITLE_FORMULAS,
  ANGLE_TWISTS,
  GENERIC_NICHE,
  TOPIC_COUNT,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const base = {
  niche: "real estate coaches",
  audiencePain: "inconsistent lead flow",
};

describe("webinar-topic-generator", () => {
  it("happy path: returns 8 topics, each with an angle variant", () => {
    const r = runTool({ ...base });
    assert.equal(r.ok, true);
    const topics = r.values!.topics as string[];
    assert.equal(topics.length, 8);
    for (const t of topics) {
      assert.match(t, /Angle variant:/);
      assert.ok(t.split("\n").length === 2);
    }
  });

  it("happy path: niche and pain appear in every topic", () => {
    const r = runTool({ ...base });
    const topics = r.values!.topics as string[];
    for (const t of topics) {
      assert.ok(t.includes("Real estate coaches"), `missing niche in: ${t}`);
      assert.ok(t.includes("Inconsistent lead flow"), `missing pain in: ${t}`);
    }
  });

  it("happy path: no formula placeholders leak through", () => {
    const r = runTool({ ...base });
    const topics = r.values!.topics as string[];
    assert.ok(!topics.join("\n").includes("{niche}"));
    assert.ok(!topics.join("\n").includes("{pain}"));
  });

  it("happy path: angle variants differ from their titles", () => {
    const r = runTool({ ...base });
    const topics = r.values!.topics as string[];
    for (const t of topics) {
      const [titleLine, variantLine] = t.split("\n");
      assert.ok(variantLine.includes(titleLine.replace(/^\d+\. /, "")));
      assert.ok(variantLine.length > titleLine.length);
    }
  });

  it("happy path: note describes the niche-specific bank", () => {
    const r = runTool({ ...base });
    assert.match(r.values!.note as string, /Niche-specific/);
    assert.match(r.values!.note as string, /Not AI ideation/);
  });

  it("edge case: empty niche uses the generic bank and labels it as generic", () => {
    const r = runTool({ niche: "   ", audiencePain: "inconsistent lead flow" });
    assert.equal(r.ok, true);
    const topics = r.values!.topics as string[];
    assert.ok(topics.join("\n").includes(GENERIC_NICHE));
    assert.match(r.values!.note as string, /generic word bank/);
  });

  it("edge case: niche omitted entirely still works with the generic bank", () => {
    const r = runTool({ audiencePain: "inconsistent lead flow" });
    assert.equal(r.ok, true);
    assert.equal((r.values!.topics as string[]).length, TOPIC_COUNT);
  });

  it("missing audiencePain: rejected with human message", () => {
    const r = runTool({ niche: "coaches" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /pain point/);
  });

  it("blank audiencePain: rejected", () => {
    const r = runTool({ niche: "coaches", audiencePain: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /pain point/);
  });

  it("whitespace trimmed from inputs", () => {
    const r = runTool({ niche: "  coaches  ", audiencePain: "  no clients  " });
    assert.equal(r.ok, true);
    assert.ok((r.values!.topics as string[]).join("\n").includes("Coaches"));
    assert.ok((r.values!.topics as string[]).join("\n").includes("No clients"));
  });

  it("determinism: same inputs produce identical output", () => {
    const a = runTool({ ...base });
    const b = runTool({ ...base });
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs ids", () => {
    const r = runTool({ ...base });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), outputs.map((o) => o.id).sort());
  });

  it("word-bank bounds: 8 formulas, 8 twists, no empty entries", () => {
    assert.equal(TITLE_FORMULAS.length, 8);
    assert.equal(ANGLE_TWISTS.length, 8);
    assert.equal(TOPIC_COUNT, 8);
    assert.ok(TITLE_FORMULAS.every((f) => f.length > 0 && f.includes("{niche}") && f.includes("{pain}")));
    assert.ok(ANGLE_TWISTS.every((t) => t.length > 0));
  });

  it("bank produces distinct titles across formulas", () => {
    const r = runTool({ ...base });
    const titles = (r.values!.topics as string[]).map((t) => t.split("\n")[0]);
    assert.equal(new Set(titles).size, 8);
  });

  it("constants honor spec", () => {
    assert.equal(GENERIC_NICHE, "your industry");
  });

  it("non-object input: rejected", () => {
    const r = runTool(42 as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.match(r.error!, /object/);
  });
});
