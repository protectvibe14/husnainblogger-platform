import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  buildSystemPrompt,
  splitBullets,
  cleanField,
  validateTone,
  TONES,
} from "./logic.ts";

const GOOD = {
  role: "a friendly math tutor",
  audience: "high school students",
  tone: "friendly",
  doList: "Explain step by step\nGive practice problems",
  dontList: "Skip steps\nUse jargon without explaining",
  constraints: "Keep answers under 200 words",
};

describe("system-prompt-builder", () => {
  it("happy path: assembles the full fixed-structure block", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const sp = v["systemPrompt"] as string;
    assert.ok(sp.startsWith("You are a friendly math tutor."));
    assert.ok(sp.includes("Your audience is high school students."));
    assert.ok(sp.includes(TONES["friendly"]));
    assert.ok(sp.includes("Do:"));
    assert.ok(sp.includes("- Explain step by step"));
    assert.ok(sp.includes("Do not:"));
    assert.ok(sp.includes("- Skip steps"));
    assert.ok(sp.includes("Constraints:"));
    assert.ok(sp.includes("- Keep answers under 200 words"));
    assert.equal(v["itemCount"], 5);
  });

  it("empty lists are omitted as sections", () => {
    const r = runTool({ ...GOOD, doList: "", constraints: "" });
    assert.equal(r.ok, true);
    const sp = (r.values as Record<string, unknown>)["systemPrompt"] as string;
    assert.ok(!sp.includes("Do:"));
    assert.ok(!sp.includes("Constraints:"));
    assert.ok(sp.includes("Do not:"));
  });

  it("bullet markers and numbering are stripped from list items", () => {
    assert.deepEqual(splitBullets("- one\n* two\n• three\n1. four\n2) five"), [
      "one",
      "two",
      "three",
      "four",
      "five",
    ]);
  });

  it("splitBullets drops blank lines", () => {
    assert.deepEqual(splitBullets("one\n\n  \ntwo"), ["one", "two"]);
  });

  it("every tone key is accepted and case-insensitive", () => {
    for (const t of Object.keys(TONES)) {
      assert.equal(runTool({ ...GOOD, tone: t }).ok, true, t);
    }
    assert.equal(validateTone("  FRIENDLY "), "friendly");
    assert.equal(validateTone("nope"), null);
  });

  it("user input is HTML-stripped (no raw injection in output)", () => {
    const r = runTool({ ...GOOD, role: "<script>alert(1)</script> tutor" });
    assert.equal(r.ok, true);
    const sp = (r.values as Record<string, unknown>)["systemPrompt"] as string;
    assert.ok(!sp.includes("<script>"));
    assert.ok(sp.includes("tutor"));
  });

  it("cleanField collapses whitespace", () => {
    assert.equal(cleanField("  a   b  "), "a b");
  });

  it("determinism: same inputs twice -> identical output", () => {
    assert.deepEqual(runTool(GOOD), runTool(GOOD));
  });

  it("validation: missing role/audience -> error", () => {
    assert.equal(runTool({ ...GOOD, role: "" }).ok, false);
    assert.equal(runTool({ ...GOOD, audience: "x" }).ok, false);
    assert.equal(runTool({ tone: "friendly", doList: "x" }).ok, false);
  });

  it("validation: invalid tone -> error", () => {
    assert.equal(runTool({ ...GOOD, tone: "sassy" }).ok, false);
  });

  it("validation: all three lists empty -> error", () => {
    assert.equal(
      runTool({ ...GOOD, doList: "", dontList: "", constraints: "" }).ok,
      false,
    );
  });

  it("validation: field over max length -> error", () => {
    assert.equal(runTool({ ...GOOD, role: "r".repeat(501) }).ok, false);
  });
});
