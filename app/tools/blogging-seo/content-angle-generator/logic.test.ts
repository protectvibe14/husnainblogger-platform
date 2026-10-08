import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  ANGLE_BANK,
  DEFAULT_AUDIENCE,
  MAX_TOPIC_CHARS,
  MAX_AUDIENCE_CHARS,
} from "./logic.ts";

const CURRENT_YEAR = String(new Date().getUTCFullYear());

function anglesOf(result: { values?: Record<string, unknown> }): { columns: string[]; rows: string[][] } {
  return result.values!["angles"] as { columns: string[]; rows: string[][] };
}

describe("content-angle-generator", () => {
  it("happy path: topic + audience produce 12 angles", () => {
    const r = runTool({ topic: "email marketing", audience: "small business owners" });
    assert.equal(r.ok, true);
    const a = anglesOf(r);
    assert.deepEqual(a.columns, ["Angle type", "Title idea", "Why it works"]);
    assert.equal(a.rows.length, ANGLE_BANK.length);
    assert.equal(r.values!["count"], ANGLE_BANK.length);
    assert.ok(a.rows.every((row) => row[0] && row[1] && row[2]));
    // spot-check substitution
    assert.ok(a.rows.some((row) => row[1] === "7 email marketing mistakes small business owners keep making"));
    assert.ok(a.rows.some((row) => row[1] === `email marketing statistics small business owners should know in ${CURRENT_YEAR}`));
    assert.ok(a.rows.some((row) => row[0] === "Comparison"));
  });

  it("audience defaults to beginners when omitted", () => {
    const r = runTool({ topic: "sourdough baking" });
    assert.equal(r.ok, true);
    const a = anglesOf(r);
    assert.ok(a.rows.every((row) => row[1].includes(DEFAULT_AUDIENCE)));
    assert.ok(!a.rows.some((row) => row[1].includes("  ")));
  });

  it("empty audience string falls back to the default", () => {
    const r = runTool({ topic: "sourdough baking", audience: "   " });
    assert.equal(r.ok, true);
    assert.ok(anglesOf(r).rows[0][1].includes(DEFAULT_AUDIENCE));
  });

  it("very broad topic still works", () => {
    const r = runTool({ topic: "fitness" });
    assert.equal(r.ok, true);
    assert.equal(anglesOf(r).rows.length, 12);
  });

  it("unicode topic is substituted cleanly", () => {
    const r = runTool({ topic: "café au lait", audience: "coffee lovers" });
    assert.equal(r.ok, true);
    const a = anglesOf(r);
    assert.ok(a.rows.every((row) => row[1].includes("café au lait") && row[1].includes("coffee lovers")));
  });

  it("no leftover placeholders in any title idea", () => {
    const r = runTool({ topic: "gardening", audience: "renters" });
    for (const row of anglesOf(r).rows) {
      assert.ok(!row[1].includes("{topic}"));
      assert.ok(!row[1].includes("{audience}"));
      assert.ok(!row[1].includes("{year}"));
    }
  });

  it("missing topic is rejected", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.match(r.error!, /Topic is required/);
  });

  it("topic shorter than 2 chars is rejected", () => {
    const r = runTool({ topic: "a" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /2-120/);
  });

  it("topic longer than 120 chars is rejected", () => {
    const r = runTool({ topic: "x".repeat(MAX_TOPIC_CHARS + 1) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /2-120/);
  });

  it("topic of exactly 2 and 120 chars is accepted", () => {
    assert.equal(runTool({ topic: "ab" }).ok, true);
    assert.equal(runTool({ topic: "x".repeat(MAX_TOPIC_CHARS) }).ok, true);
  });

  it("audience longer than 80 chars is rejected", () => {
    const r = runTool({ topic: "gardening", audience: "x".repeat(MAX_AUDIENCE_CHARS + 1) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /80/);
  });

  it("audience of exactly 80 chars is accepted", () => {
    const r = runTool({ topic: "gardening", audience: "x".repeat(MAX_AUDIENCE_CHARS) });
    assert.equal(r.ok, true);
  });

  it("non-string topic is rejected", () => {
    const r = runTool({ topic: 42 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Topic is required/);
  });

  it("word-bank bound: 12 angles with unique types", () => {
    assert.equal(ANGLE_BANK.length, 12);
    const types = ANGLE_BANK.map((a) => a.type);
    assert.equal(new Set(types).size, 12);
    assert.ok(ANGLE_BANK.every((a) => a.template.includes("{topic}")));
  });

  it("output ids match meta.ts (angles, count)", () => {
    const r = runTool({ topic: "gardening" });
    assert.deepEqual(Object.keys(r.values!).sort(), ["angles", "count"]);
  });

  it("determinism: two runs produce identical output", () => {
    const a = runTool({ topic: "houseplants", audience: "apartment dwellers" });
    const b = runTool({ topic: "houseplants", audience: "apartment dwellers" });
    assert.deepEqual(a, b);
  });
});
