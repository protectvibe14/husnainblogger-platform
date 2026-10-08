import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, NICHE_OPTIONS } from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_IDS = ["group", "shots", "captions", "transitions"];

function okResult(profession = "nurse", niche = "Full workday") {
  const r = runTool({ profession, niche });
  assert.equal(r.ok, true, `expected ok, got error: ${"error" in r ? r.error : ""}`);
  return (r as { ok: true; values: Record<string, string | string[]> }).values;
}

describe("tiktok-day-in-my-life-shot-list", () => {
  it("happy path: matched group, 10 shots, 4 captions, 3 transitions", () => {
    const v = okResult();
    assert.deepEqual(Object.keys(v).sort(), EXPECTED_IDS.sort());
    assert.equal(v.group, "healthcare");
    assert.equal((v.shots as string[]).length, 10);
    assert.equal((v.captions as string[]).length, 4);
    assert.equal((v.transitions as string[]).length, 3);
  });

  it("profession keyword matching: barista -> service, developer -> desk", () => {
    assert.equal(okResult("barista").group, "service");
    assert.equal(okResult("software developer").group, "desk / tech");
    assert.equal(okResult("high school teacher").group, "educator");
    assert.equal(okResult("photographer").group, "creative");
    assert.equal(okResult("college student").group, "student");
    assert.equal(okResult("stay-at-home mom").group, "parent");
    assert.equal(okResult("fitness coach").group, "fitness");
  });

  it("unusual profession falls back to generic with swap-in slots", () => {
    const v = okResult("professional taxidermist", "Other");
    assert.equal(v.group, "generic");
    const shots = v.shots as string[];
    assert.ok(shots.every((s) => s.includes("swap in your real")));
  });

  it("time schedule follows the niche", () => {
    const morning = okResult("nurse", "Morning routine").shots as string[];
    const workday = okResult("nurse", "Full workday").shots as string[];
    assert.ok(morning[0].startsWith("6:30 AM"));
    assert.ok(workday[0].startsWith("8:00 AM"));
    assert.notEqual(morning[0], workday[0]);
  });

  it("shots pair a time label with a shot description", () => {
    for (const s of okResult("chef", "Weekend / day off").shots as string[]) {
      assert.match(s, /^.+ — .+$/);
    }
  });

  it("captions mention the profession where the template supports it", () => {
    const v = okResult("barista", "Morning routine");
    assert.ok((v.captions as string[]).some((c) => c.includes("barista")));
  });

  it("missing profession errors", () => {
    const r = runTool({ niche: "Full workday" });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /profession/i);
  });

  it("blank profession errors", () => {
    assert.equal(runTool({ profession: "  ", niche: "Full workday" }).ok, false);
  });

  it("profession over 100 chars errors", () => {
    const r = runTool({ profession: "x".repeat(101), niche: "Full workday" });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /100/);
  });

  it("missing niche errors", () => {
    assert.equal(runTool({ profession: "nurse" }).ok, false);
  });

  it("niche not in options errors", () => {
    const r = runTool({ profession: "nurse", niche: "Night shift" });
    assert.equal(r.ok, false);
    assert.match((r as { error: string }).error, /niche/i);
  });

  it("deterministic: same inputs -> identical output", () => {
    assert.deepEqual(okResult("dentist", "Parent day"), okResult("dentist", "Parent day"));
  });

  it("different professions -> different shot lists", () => {
    const a = okResult("nurse", "Full workday").shots;
    const b = okResult("barista", "Full workday").shots;
    assert.notDeepEqual(a, b);
  });

  it("word-bank bounds: no empty picks across all niches", () => {
    for (const niche of NICHE_OPTIONS) {
      const v = okResult("designer", niche);
      assert.equal((v.shots as string[]).length, 10);
      for (const s of v.shots as string[]) assert.ok(s.length > 10);
      for (const c of v.captions as string[]) assert.ok(c.length > 5 && !c.includes("{profession}"));
      for (const t of v.transitions as string[]) assert.ok(t.length > 5);
    }
  });

  it("matched (non-generic) groups have no swap slots", () => {
    const shots = okResult("nurse", "Full workday").shots as string[];
    assert.ok(shots.every((s) => !s.includes("swap in your real")));
  });

  it("output ids match meta.ts outputs", () => {
    assert.deepEqual(outputs.map((o) => o.id).sort(), EXPECTED_IDS.sort());
  });
});
