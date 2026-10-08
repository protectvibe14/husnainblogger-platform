import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { classifyIntent, classifyBatch, batchToCsv, runTool, DISCLAIMER } from "./logic.ts";

describe("search-intent-classifier", () => {
  it("normal: transactional keyword", () => {
    const r = classifyIntent("buy running shoes online");
    assert.equal(r.intent, "transactional");
    assert.ok(r.confidence > 0);
    assert.ok(r.matchedSignals.transactional.includes("buy"));
    assert.equal(r.isHeuristic, true);
    assert.equal(r.disclaimer, DISCLAIMER);
  });

  it("normal: informational keyword", () => {
    const r = classifyIntent("how to bake sourdough bread");
    assert.equal(r.intent, "informational");
    assert.ok(r.matchedSignals.informational.includes("how"));
  });

  it("normal: commercial keyword", () => {
    const r = classifyIntent("best laptop for students review");
    assert.equal(r.intent, "commercial");
  });

  it("normal: navigational keyword", () => {
    const r = classifyIntent("gmail login");
    assert.equal(r.intent, "navigational");
    assert.ok(r.matchedSignals.navigational.includes("login"));
  });

  it("no cue match -> informational with confidence 0", () => {
    const r = classifyIntent("xylophone");
    assert.equal(r.intent, "informational");
    assert.equal(r.confidence, 0);
  });

  it("multi-intent: transactional wins tie over commercial", () => {
    // 'best' (commercial) + 'buy' (transactional) -> transactional by tie-break
    const r = classifyIntent("best price buy headphones");
    assert.equal(r.intent, "transactional");
  });

  it("multi-word phrase cues match ('add to cart', 'pros and cons')", () => {
    const t = classifyIntent("add to cart now");
    assert.equal(t.intent, "transactional");
    const c = classifyIntent("macbook pros and cons");
    assert.equal(c.intent, "commercial");
  });

  it("case-insensitive matching", () => {
    const r = classifyIntent("HOW TO Train A Dog");
    assert.equal(r.intent, "informational");
  });

  it("whole-word matching: 'how' inside 'show' must not match", () => {
    const r = classifyIntent("window show");
    assert.equal(r.intent, "informational");
    assert.equal(r.confidence, 0);
    assert.deepEqual(r.matchedSignals.informational, []);
  });

  it("empty/blank keyword throws", () => {
    assert.throws(() => classifyIntent(""), /non-empty/);
    assert.throws(() => classifyIntent("   "), /non-empty/);
  });

  it("non-string keyword throws", () => {
    assert.throws(() => classifyIntent(42 as unknown as string));
  });

  it("unicode keyword does not crash; cue matching still works", () => {
    const r = classifyIntent("café near me ☕");
    assert.equal(r.intent, "navigational");
    assert.ok(r.matchedSignals.navigational.includes("near me"));
  });

  it("confidence is a 0..1 ratio of winning signals", () => {
    const r = classifyIntent("best cheap laptop buy");
    // commercial: best; transactional: cheap, buy -> transactional 2/3
    assert.equal(r.intent, "transactional");
    assert.ok(r.confidence >= 0 && r.confidence <= 1);
    assert.equal(r.confidence, 0.67);
  });

  it("classifyBatch skips blanks and classifies the rest", () => {
    const rs = classifyBatch(["buy shoes", "", "   ", "how to tie shoes"]);
    assert.equal(rs.length, 2);
    assert.equal(rs[0].intent, "transactional");
    assert.equal(rs[1].intent, "informational");
  });

  it("classifyBatch rejects non-array", () => {
    assert.throws(() => classifyBatch("nope" as unknown as string[]));
  });

  it("batchToCsv: header + escaped rows", () => {
    const rs = classifyBatch(['buy "shoes", now', "how to bake"]);
    const csv = batchToCsv(rs);
    const lines = csv.split("\n");
    assert.equal(lines[0], "keyword,intent,confidence,matched_signals");
    assert.equal(lines.length, 3);
    assert.ok(lines[1].includes('"buy ""shoes"", now"')); // quote escaping
    assert.ok(lines[1].includes("transactional"));
  });

  it("batchToCsv: empty batch yields header only", () => {
    assert.equal(batchToCsv([]), "keyword,intent,confidence,matched_signals");
  });

  it("non-English script with no Latin letters -> unknown, not a crash", () => {
    for (const kw of ["日本語テスト", "نیوزلیٹر", "тестирование"]) {
      const r = classifyIntent(kw);
      assert.equal(r.intent, "unknown");
      assert.equal(r.confidence, 0);
      assert.equal(r.confidenceBand, "low");
      assert.equal(r.isHeuristic, true);
    }
  });

  it("mixed script with Latin cue still classifies (latin present)", () => {
    const r = classifyIntent("buy 日本語");
    assert.equal(r.intent, "transactional");
  });

  it("single character input -> informational with confidence 0", () => {
    const r = classifyIntent("a");
    assert.equal(r.intent, "informational");
    assert.equal(r.confidence, 0);
    assert.equal(r.confidenceBand, "low");
  });

  it("very long input does not crash and still matches cues", () => {
    const long = "a ".repeat(5000) + "buy cheap laptop";
    const r = classifyIntent(long);
    assert.equal(r.intent, "transactional");
    assert.ok(r.confidence >= 0 && r.confidence <= 1);
  });

  it("confidenceBand: high (>=0.75), medium (>=0.40), low (<0.40)", () => {
    // single cue, single bucket -> 1.0 -> high
    assert.equal(classifyIntent("buy shoes").confidenceBand, "high");
    // 2/3 transactional -> 0.67 -> medium
    assert.equal(classifyIntent("best cheap laptop buy").confidenceBand, "medium");
    // 1/3 -> 0.33 -> low
    assert.equal(classifyIntent("best cheap laptop near me").confidenceBand, "low");
    // no cues -> 0 -> low
    assert.equal(classifyIntent("xylophone").confidenceBand, "low");
  });

  it("unknown intent serializes in CSV", () => {
    const csv = batchToCsv(classifyBatch(["日本語"]));
    assert.ok(csv.includes("unknown"));
  });
});

describe("search-intent-classifier runTool (platform contract)", () => {
  it("happy path: returns the four spec output keys", () => {
    const r = runTool({ keyword: "buy running shoes online" });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.deepEqual(Object.keys(v).sort(), [
      "confidence",
      "intent",
      "isHeuristic",
      "matchedSignals",
    ]);
    assert.equal(v["intent"], "transactional");
    assert.ok(
      typeof v["confidence"] === "number" &&
        (v["confidence"] as number) >= 0 &&
        (v["confidence"] as number) <= 1,
    );
    assert.ok(Array.isArray(v["matchedSignals"]));
    assert.equal(
      v["isHeuristic"],
      "heuristic — word-bank rules, not AI or live SERP data",
    );
  });

  it("matchedSignals are 'bucket:cue' strings", () => {
    const r = runTool({ keyword: "best laptop review" });
    const signals = (r.values as Record<string, unknown>)[
      "matchedSignals"
    ] as string[];
    assert.ok(signals.length > 0);
    for (const s of signals) assert.match(s, /^[a-z]+:.+$/);
    assert.ok(signals.some((s) => s.startsWith("commercial:")));
  });

  it("multi-intent keyword: transactional wins the tie", () => {
    const r = runTool({ keyword: "best cheap laptop buy" });
    assert.equal((r.values as Record<string, unknown>)["intent"], "transactional");
  });

  it("brand + login keyword -> navigational", () => {
    const r = runTool({ keyword: "netflix login" });
    assert.equal((r.values as Record<string, unknown>)["intent"], "navigational");
  });

  it("no cue match -> informational with confidence 0", () => {
    const r = runTool({ keyword: "xylophone" });
    const v = r.values as Record<string, unknown>;
    assert.equal(v["intent"], "informational");
    assert.equal(v["confidence"], 0);
    assert.deepEqual(v["matchedSignals"], []);
  });

  it("determinism: same keyword twice -> identical output", () => {
    assert.deepEqual(
      runTool({ keyword: "how to train a dog" }),
      runTool({ keyword: "how to train a dog" }),
    );
  });

  it("validation: missing keyword -> error", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: empty string -> error", () => {
    const r = runTool({ keyword: "" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: whitespace-only -> error", () => {
    const r = runTool({ keyword: "   " });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: non-string keyword -> error", () => {
    const r = runTool({ keyword: 42 });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: longer than 150 chars -> error", () => {
    const r = runTool({ keyword: "a".repeat(151) });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("edge case: exactly 150 chars is accepted", () => {
    const r = runTool({ keyword: "a".repeat(150) });
    assert.equal(r.ok, true);
  });

  it("edge case: leading/trailing spaces are trimmed", () => {
    assert.deepEqual(
      runTool({ keyword: "  buy shoes  " }),
      runTool({ keyword: "buy shoes" }),
    );
  });
});
