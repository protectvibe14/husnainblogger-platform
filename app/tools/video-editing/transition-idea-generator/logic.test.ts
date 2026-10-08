import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, TRANSITION_BANK_SIZE } from "./logic.ts";

const base = { fromScene: "talking head in office", toScene: "running outside at night", energy: "punchy", count: 5 };

describe("transition-idea-generator", () => {
  it("happy path returns ideas with name, capcutHowTo, difficulty + matchReason", () => {
    const r = runTool({ ...base });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const ideas = v.ideas as { name: string; capcutHowTo: string; difficulty: string }[];
    assert.equal(ideas.length, 5);
    for (const i of ideas) {
      assert.ok(i.name.length > 0, "name non-empty");
      assert.ok(i.capcutHowTo.length > 10, "how-to is a real instruction");
      assert.ok(["easy", "medium", "advanced"].includes(i.difficulty));
    }
    assert.ok((v.matchReason as string).length > 20);
  });

  it("count defaults to 5 when omitted", () => {
    const r = runTool({ fromScene: "a", toScene: "b", energy: "calm" });
    assert.equal(r.ok, true);
    assert.equal((r.values as Record<string, unknown>).ideas instanceof Array, true);
    assert.equal(((r.values as Record<string, unknown>).ideas as unknown[]).length, 5);
  });

  it("count of 1 works", () => {
    const r = runTool({ ...base, count: 1 });
    assert.equal(r.ok, true);
    assert.equal(((r.values as Record<string, unknown>).ideas as unknown[]).length, 1);
  });

  it("count of 10 works", () => {
    const r = runTool({ ...base, count: 10 });
    assert.equal(r.ok, true);
    assert.equal(((r.values as Record<string, unknown>).ideas as unknown[]).length, 10);
  });

  it("rejects empty fromScene", () => {
    const r = runTool({ ...base, fromScene: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /fromScene/);
  });

  it("rejects empty toScene", () => {
    const r = runTool({ ...base, toScene: "" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /toScene/);
  });

  it("rejects missing fromScene entirely", () => {
    const r = runTool({ toScene: "b", energy: "calm" });
    assert.equal(r.ok, false);
  });

  it("rejects invalid energy", () => {
    const r = runTool({ ...base, energy: "wild" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /calm.*punchy|punchy.*calm/i);
  });

  it("rejects count of 0", () => {
    const r = runTool({ ...base, count: 0 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /1 and 10/);
  });

  it("rejects count of 11", () => {
    const r = runTool({ ...base, count: 11 });
    assert.equal(r.ok, false);
  });

  it("rejects non-integer count", () => {
    const r = runTool({ ...base, count: 2.5 });
    assert.equal(r.ok, false);
  });

  it("rejects non-numeric count", () => {
    const r = runTool({ ...base, count: "many" });
    assert.equal(r.ok, false);
  });

  it("identical scenes -> only match-cut family, and reason says so", () => {
    const r = runTool({ fromScene: "Person walks through door", toScene: "person walks through DOOR", energy: "punchy", count: 5 });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const ideas = v.ideas as { name: string }[];
    assert.equal(ideas.length, 5);
    const matchCutNames = ["Hand Swipe Match Cut", "Object Match Cut", "Spin Frame Match", "Snap Zoom Match Cut", "Clap Sync Cut"];
    for (const i of ideas) assert.ok(matchCutNames.includes(i.name), `${i.name} is a match-cut`);
    assert.match(v.matchReason as string, /match-cut/i);
  });

  it("calm energy excludes whip pan and other punchy transitions", () => {
    const r = runTool({ ...base, energy: "calm", count: 10 });
    assert.equal(r.ok, true);
    const names = ((r.values as Record<string, unknown>).ideas as { name: string }[]).map((i) => i.name);
    const banned = ["Whip Pan", "Zoom Punch", "Glitch Cut", "Shake Cut", "Flash Frame Spin", "Light Leak Swipe", "Tape Stop", "VHS Rewind", "Zoom-Through Mask"];
    for (const b of banned) assert.ok(!names.includes(b), `${b} excluded under calm`);
  });

  it("punchy energy ranks punchy transitions first", () => {
    const r = runTool({ ...base, energy: "punchy", count: 3 });
    assert.equal(r.ok, true);
    const names = ((r.values as Record<string, unknown>).ideas as { name: string }[]).map((i) => i.name);
    const punchy = ["Whip Pan", "Zoom Punch", "Glitch Cut", "Shake Cut", "Flash Frame Spin", "Light Leak Swipe", "Tape Stop", "VHS Rewind", "Zoom-Through Mask", "Spin Frame Match", "Snap Zoom Match Cut"];
    assert.ok(punchy.includes(names[0]), `first pick ${names[0]} is punchy`);
  });

  it("keyword boost: zoom scene boosts zoom-tagged transitions", () => {
    const r = runTool({ fromScene: "zoom into the product box", toScene: "close-up detail of the phone", energy: "punchy", count: 10 });
    assert.equal(r.ok, true);
    const names = ((r.values as Record<string, unknown>).ideas as { name: string }[]).map((i) => i.name);
    assert.ok(names.includes("Zoom Punch") || names.includes("Snap Zoom Match Cut") || names.includes("Zoom-Through Mask"));
  });

  it("determinism: same inputs run twice give identical JSON", () => {
    const a = JSON.stringify(runTool({ ...base }));
    const b = JSON.stringify(runTool({ ...base }));
    assert.equal(a, b);
  });

  it("bank size documented: 30 transitions", () => {
    assert.equal(TRANSITION_BANK_SIZE, 30);
  });

  it("count string numeric '5' is accepted (template may pass strings)", () => {
    const r = runTool({ ...base, count: "5" });
    assert.equal(r.ok, true);
    assert.equal(((r.values as Record<string, unknown>).ideas as unknown[]).length, 5);
  });
});
