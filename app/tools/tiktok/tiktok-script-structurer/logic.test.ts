import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  SPEAKING_WPM,
  MAX_DURATION_SEC,
  MIN_DURATION_SEC,
  MAX_TOPIC_LENGTH,
  MAX_NICHE_LENGTH,
  GENERIC_HOOKS,
  NICHE_HOOKS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_OUTPUT_IDS = ["fullScript", "beats", "timingNote"];

function okValues(input: Record<string, unknown>): Record<string, unknown> {
  const r = runTool(input);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

describe("tiktok-script-structurer", () => {
  it("happy path: 30s script returns beat sheet", () => {
    const v = okValues({
      topic: "meal prep for beginners",
      niche: "food",
      targetDurationSec: 30,
    });
    assert.equal(typeof v.fullScript, "string");
    assert.ok((v.fullScript as string).includes("meal prep for beginners"));
    assert.ok(Array.isArray(v.beats));
    assert.equal((v.beats as string[]).length, 5); // 30s -> 5 beats
    assert.ok((v.beats as string[])[0].includes("HOOK"));
    assert.ok((v.timingNote as string).includes("30s"));
  });

  it("output ids match meta.ts outputs", () => {
    const v = okValues({ topic: "x".repeat(5), targetDurationSec: 20 });
    const metaIds = outputs.map((o) => o.id).sort();
    assert.deepEqual(Object.keys(v).sort(), metaIds);
    assert.deepEqual(metaIds, [...EXPECTED_OUTPUT_IDS].sort());
  });

  it("missing topic errors", () => {
    const r = runTool({ targetDurationSec: 30 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /topic/i);
  });

  it("blank topic errors", () => {
    const r = runTool({ topic: "   ", targetDurationSec: 30 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /topic/i);
  });

  it("topic over 200 chars errors", () => {
    const r = runTool({ topic: "a".repeat(MAX_TOPIC_LENGTH + 1), targetDurationSec: 30 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /200/);
  });

  it("topic exactly 200 chars is accepted", () => {
    const v = okValues({ topic: "a".repeat(MAX_TOPIC_LENGTH), targetDurationSec: 30 });
    assert.ok(v.fullScript);
  });

  it("missing duration errors", () => {
    const r = runTool({ topic: "budget travel tips" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /duration/i);
  });

  it("non-numeric duration errors", () => {
    const r = runTool({ topic: "budget travel tips", targetDurationSec: "fast" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /duration/i);
  });

  it("duration below 3 seconds errors", () => {
    const r = runTool({ topic: "budget travel tips", targetDurationSec: 2 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least 3/);
  });

  it("numeric-string duration is accepted", () => {
    const v = okValues({ topic: "budget travel tips", targetDurationSec: "45" });
    assert.ok((v.timingNote as string).includes("45s"));
  });

  it("duration over 600 caps at 600 with eligibility warning", () => {
    const v = okValues({ topic: "budget travel tips", targetDurationSec: 3600 });
    assert.ok((v.timingNote as string).includes("600"));
    assert.match((v.timingNote as string), /eligibility/i);
    assert.ok((v.fullScript as string).includes("(600s"));
  });

  it("niche too long errors", () => {
    const r = runTool({
      topic: "sourdough",
      niche: "n".repeat(MAX_NICHE_LENGTH + 1),
      targetDurationSec: 30,
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Niche/i);
  });

  it("empty niche falls back to generic hooks (no crash)", () => {
    const v = okValues({ topic: "home organization", targetDurationSec: 20 });
    const first = (v.beats as string[])[0];
    assert.ok(first.includes("home organization"));
    assert.ok(!first.includes("[TOPIC]"));
  });

  it("unknown niche falls back to the generic hook bank", () => {
    const v = okValues({ topic: "sourdough", niche: "quantum-physics", targetDurationSec: 20 });
    const hookText = (v.beats as string[])[0].split(": ").slice(1).join(": ");
    const filledGeneric = GENERIC_HOOKS.map((h) => h.split("[TOPIC]").join("sourdough"));
    assert.ok(
      filledGeneric.includes(hookText),
      `hook not from generic bank: ${hookText}`
    );
  });

  it("known niche (fitness) picks a hook from the fitness bank", () => {
    const v = okValues({ topic: "pushups", niche: "fitness", targetDurationSec: 20 });
    const hookText = (v.beats as string[])[0].split(": ").slice(1).join(": ");
    const filledFitness = NICHE_HOOKS.fitness.map((h) =>
      h.split("[TOPIC]").join("pushups")
    );
    assert.ok(
      filledFitness.includes(hookText),
      `hook not from fitness bank: ${hookText}`
    );
    assert.equal(NICHE_HOOKS.fitness.length, 4);
  });

  it("word-bank sizes match the documented contract", () => {
    assert.equal(GENERIC_HOOKS.length, 12);
    assert.equal(Object.keys(NICHE_HOOKS).length, 8);
    for (const k of Object.keys(NICHE_HOOKS)) {
      assert.equal(NICHE_HOOKS[k].length, 4, `bank ${k}`);
    }
  });

  it("niche matching is case-insensitive and substring-based", () => {
    for (const niche of ["Food", "street food vlog", "FOOD"]) {
      const v = okValues({ topic: "ramen", niche, targetDurationSec: 20 });
      const hookText = (v.beats as string[])[0].split(": ").slice(1).join(": ");
      const filledFood = NICHE_HOOKS.food.map((h) => h.split("[TOPIC]").join("ramen"));
      assert.ok(
        filledFood.includes(hookText),
        `niche "${niche}" did not use the food bank: ${hookText}`
      );
    }
  });

  it("beat plans scale with duration: 10s->3, 30s->5, 60s->7, 300s->9", () => {
    assert.equal((okValues({ topic: "t", targetDurationSec: 10 }).beats as string[]).length, 3);
    assert.equal((okValues({ topic: "t", targetDurationSec: 30 }).beats as string[]).length, 5);
    assert.equal((okValues({ topic: "t", targetDurationSec: 60 }).beats as string[]).length, 7);
    assert.equal((okValues({ topic: "t", targetDurationSec: 300 }).beats as string[]).length, 9);
  });

  it("long-form plan includes a re-hook beat", () => {
    const v = okValues({ topic: "t", targetDurationSec: 300 });
    assert.ok((v.beats as string[]).some((l) => l.includes("RE-HOOK")));
  });

  it("every beat line ends with CTA and no unfilled slots remain", () => {
    const v = okValues({ topic: "knitting", niche: "DIY", targetDurationSec: 60 });
    const beats = v.beats as string[];
    assert.ok(beats[beats.length - 1].includes("CTA"));
    for (const l of beats) {
      assert.ok(!l.includes("[TOPIC]"), `unfilled slot in: ${l}`);
      assert.ok(!l.includes("[NICHE]"), `unfilled slot in: ${l}`);
    }
    assert.ok(!(v.fullScript as string).includes("[TOPIC]"));
  });

  it("word estimates use the documented 150 wpm constant", () => {
    assert.equal(SPEAKING_WPM, 150);
    const v = okValues({ topic: "t", targetDurationSec: 60 });
    assert.match(v.timingNote as string, /150 words per minute/);
  });

  it("timing ranges cover the full duration without gaps", () => {
    const v = okValues({ topic: "t", targetDurationSec: 45 });
    const beats = v.beats as string[];
    assert.ok(beats[0].startsWith("0\u2013"));
    const last = beats[beats.length - 1];
    assert.ok(last.includes("45s"), `last beat should end at 45s: ${last}`);
  });

  it("determinism: same inputs -> identical outputs", () => {
    const input = { topic: "meal prep", niche: "food", targetDurationSec: 45 };
    const a = okValues(input);
    const b = okValues(input);
    assert.deepEqual(a, b);
  });

  it("different topics produce different hook lines", () => {
    const a = okValues({ topic: "meal prep", targetDurationSec: 30 });
    const b = okValues({ topic: "dog training", targetDurationSec: 30 });
    assert.notEqual((a.beats as string[])[0], (b.beats as string[])[0]);
  });

  it("constants match the spec contract", () => {
    assert.equal(MAX_DURATION_SEC, 600);
    assert.equal(MIN_DURATION_SEC, 3);
    assert.equal(MAX_TOPIC_LENGTH, 200);
    assert.equal(MAX_NICHE_LENGTH, 60);
  });

  it("fullScript is copy-ready text with numbered beats", () => {
    const v = okValues({ topic: "t", targetDurationSec: 20 });
    const s = v.fullScript as string;
    assert.ok(s.includes("1.") && s.includes("2."));
    assert.match(s, /estimate/i);
  });
});
