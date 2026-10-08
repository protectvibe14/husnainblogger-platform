import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, hashtagFromName } from "./logic.ts";
import { outputs } from "./meta.ts";

const BASE = { challengeName: "Two-Minute Tidy", challengeType: "how-to" };

function okValues(overrides: Record<string, unknown> = {}) {
  const r = runTool({ ...BASE, ...overrides });
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

describe("tiktok-challenge-creator-kit", () => {
  it("happy path: how-to kit with all 6 outputs", () => {
    const v = okValues();
    assert.equal(v.challengeHashtag, "#twominutetidy");
    assert.ok((v.rulesText as string).includes("Two-Minute Tidy"));
    assert.ok((v.rulesText as string).includes("#twominutetidy"));
    assert.ok((v.exampleScript as string).includes("Two-Minute Tidy"));
    assert.equal((v.judgingCriteria as string[]).length, 4);
    assert.ok((v.launchCta as string).includes("#twominutetidy"));
    assert.ok((v.disclosureNote as string).includes("#ad"));
  });

  it("all 4 challenge types produce distinct kits", () => {
    const rules = ["dance", "how-to", "before-after", "duet-chain"].map(
      (t) => okValues({ challengeType: t }).rulesText as string,
    );
    assert.equal(new Set(rules).size, 4, "each type has its own rules");
  });

  it("challengeType is case/whitespace tolerant", () => {
    const v = okValues({ challengeType: "  DUET-CHAIN " });
    assert.ok((v.rulesText as string).includes("duet"));
  });

  it("hashtag sanitization: strips spaces and punctuation", () => {
    assert.equal(hashtagFromName("Two-Minute Tidy!"), "#twominutetidy");
    assert.equal(hashtagFromName("  30 DAY  Glow-Up  "), "#30dayglowup");
    assert.equal(hashtagFromName("Café Con Leche"), "#cafconleche");
  });

  it("judging criteria reference the hashtag and name", () => {
    const v = okValues();
    for (const c of v.judgingCriteria as string[]) {
      assert.ok(c.trim().length > 10, `criterion substantive: ${c}`);
    }
    assert.ok((v.judgingCriteria as string[]).some((c) => c.includes("#twominutetidy")));
  });

  it("works without niche", () => {
    const v = okValues({ niche: undefined });
    assert.equal(v.challengeHashtag, "#twominutetidy");
  });

  it("no unfilled {name}/{hashtag} placeholders anywhere", () => {
    for (const t of ["dance", "how-to", "before-after", "duet-chain"]) {
      const v = okValues({ challengeType: t, niche: "home life" });
      const all = [
        v.rulesText as string,
        v.exampleScript as string,
        v.launchCta as string,
        ...(v.judgingCriteria as string[]),
      ];
      for (const s of all) {
        assert.ok(!s.includes("{name}"), `no placeholder: ${s}`);
        assert.ok(!s.includes("{hashtag}"), `no placeholder: ${s}`);
      }
    }
  });

  it("disclosure note covers #ad and trademarks", () => {
    const v = okValues();
    assert.match(v.disclosureNote as string, /#ad/);
    assert.match(v.disclosureNote as string, /trademark/i);
    assert.match(v.disclosureNote as string, /cannot launch/i);
  });

  it("errors on missing challengeName", () => {
    const r = runTool({ challengeType: "dance" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /name your challenge/i);
  });

  it("errors on blank challengeName", () => {
    const r = runTool({ ...BASE, challengeName: "   " });
    assert.equal(r.ok, false);
  });

  it("errors on non-string challengeName", () => {
    const r = runTool({ ...BASE, challengeName: 5 });
    assert.equal(r.ok, false);
  });

  it("errors on challengeName over 80 chars", () => {
    const r = runTool({ ...BASE, challengeName: "n".repeat(81) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /80/);
  });

  it("errors on name with no letters or numbers (no hashtag possible)", () => {
    const r = runTool({ ...BASE, challengeName: "!!! ???" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /letter or number/i);
  });

  it("errors on niche over 60 chars", () => {
    const r = runTool({ ...BASE, niche: "n".repeat(61) });
    assert.equal(r.ok, false);
  });

  it("errors on invalid challengeType", () => {
    const r = runTool({ ...BASE, challengeType: "prank" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /dance, how-to, before-after, or duet-chain/);
  });

  it("errors on missing challengeType", () => {
    const r = runTool({ challengeName: "Test" });
    assert.equal(r.ok, false);
  });

  it("deterministic: same inputs twice -> identical output", () => {
    const a = runTool({ ...BASE, niche: "home life" });
    const b = runTool({ challengeName: "Two-Minute Tidy", challengeType: "how-to", niche: "home life" });
    assert.deepEqual(a, b);
  });

  it("different names -> different kits", () => {
    const a = okValues({ challengeName: "Plank Party" }).rulesText;
    const b = okValues({ challengeName: "Desk Reset" }).rulesText;
    assert.notEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const v = okValues({ niche: "home life" });
    assert.deepEqual(Object.keys(v).sort(), outputs.map((o) => o.id).sort());
  });

  it("error results carry no values", () => {
    const r = runTool({ challengeName: "", challengeType: "nope" });
    assert.equal(r.ok, false);
    assert.equal(r.values, undefined);
    assert.ok(typeof r.error === "string" && r.error.length > 0);
  });
});
