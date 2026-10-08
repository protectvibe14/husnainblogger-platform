import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_IDS = ["shotList", "transitionPoint", "caption", "cta", "honestyNote"];

function okResult(topic: string) {
  const r = runTool({ transformationTopic: topic });
  assert.equal(r.ok, true, `expected ok, got error: ${"error" in r ? r.error : ""}`);
  return (r as { ok: true; values: Record<string, unknown> }).values;
}

describe("tiktok-before-after-planner", () => {
  it("happy path: all five outputs present", () => {
    const v = okResult("my messy desk setup");
    for (const id of EXPECTED_IDS) {
      assert.ok(id in v, `missing output ${id}`);
    }
  });

  it("output ids match meta.ts outputs", () => {
    const v = okResult("my messy desk setup");
    assert.deepEqual(Object.keys(v).sort(), EXPECTED_IDS.sort());
    assert.deepEqual(outputs.map((o) => o.id).sort(), EXPECTED_IDS.sort());
  });

  it("shotList has 7 fixed shots", () => {
    const v = okResult("my messy desk setup");
    const shots = v.shotList as string[];
    assert.ok(Array.isArray(shots));
    assert.equal(shots.length, 7);
    for (const s of shots) assert.ok(s.length > 20);
  });

  it("topic is interpolated into shots and caption", () => {
    const v = okResult("my balcony garden");
    const shots = v.shotList as string[];
    assert.ok(shots[0].includes("my balcony garden"));
    assert.ok((v.caption as string).includes("my balcony garden"));
    assert.ok(!(v.caption as string).includes("{topic}"));
  });

  it("transitionPoint, cta are non-empty strings", () => {
    const v = okResult("my balcony garden");
    assert.ok((v.transitionPoint as string).length > 10);
    assert.ok((v.cta as string).length > 10);
  });

  it("honestyNote warns against faked before/afters (edge case)", () => {
    const v = okResult("my balcony garden");
    const note = v.honestyNote as string;
    assert.ok(note.includes("Real footage only"));
    assert.ok(note.includes("Never use doctored"));
  });

  it("honestyNote is fixed text, identical across topics", () => {
    const a = okResult("topic one");
    const b = okResult("a completely different topic");
    assert.equal(a.honestyNote, b.honestyNote);
  });

  it("missing topic: error", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.includes("transformation topic"));
  });

  it("whitespace-only topic: error", () => {
    const r = runTool({ transformationTopic: "   " });
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.length > 0);
  });

  it("non-string topic: error", () => {
    const r = runTool({ transformationTopic: 42 });
    assert.equal(r.ok, false);
  });

  it("topic over 150 chars: error", () => {
    const r = runTool({ transformationTopic: "t".repeat(151) });
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.includes("150 characters"));
  });

  it("topic at exactly 150 chars: ok", () => {
    const v = okResult("t".repeat(150));
    assert.ok((v.caption as string).length > 0);
  });

  it("deterministic: same topic run twice → identical", () => {
    const a = okResult("my sourdough starter");
    const b = okResult("my sourdough starter");
    assert.deepEqual(a, b);
  });

  it("case-insensitive pick: 'Desk' and 'DESK' get same templates", () => {
    const a = okResult("Desk");
    const b = okResult("DESK");
    assert.equal(a.transitionPoint, b.transitionPoint);
    assert.equal(a.cta, b.cta);
    // topic text itself keeps the user's original casing
    assert.ok((a.shotList as string[])[0].includes('"Desk"'));
    assert.ok((b.shotList as string[])[0].includes('"DESK"'));
  });

  it("different topics vary the transition pick", () => {
    const seen = new Set<string>();
    const topics = ["desk", "garden", "hair", "car", "room", "dog", "skin", "closet"];
    for (const t of topics) {
      seen.add(okResult(t).transitionPoint as string);
    }
    assert.ok(seen.size > 1, "transition should vary across topics");
  });

  it("leading/trailing whitespace is trimmed", () => {
    const a = okResult("  my desk  ");
    const b = okResult("my desk");
    assert.deepEqual(a, b);
  });

  it("caption has no leftover template slots", () => {
    const v = okResult("my desk");
    for (const s of v.shotList as string[]) {
      assert.ok(!s.includes("{topic}"), `leftover slot in shot: ${s}`);
    }
  });
});
