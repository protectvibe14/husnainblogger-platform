import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  MAX_DISPLAY_LENGTH,
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
  USERNAME_PATTERN,
  FALLBACK_USERNAME_BASE,
  CANDIDATE_COUNT,
} from "./logic.ts";
import { outputs } from "./meta.ts";

interface ProfileNames {
  displayNameCandidates: string[];
  usernameSuggestions: string[];
}

function okNames(input: Record<string, unknown>): ProfileNames {
  const r = runTool(input);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "expected values");
  const d = r.values["displayNameCandidates"];
  const u = r.values["usernameSuggestions"];
  assert.ok(Array.isArray(d) && Array.isArray(u), "both outputs must be arrays");
  return { displayNameCandidates: d as string[], usernameSuggestions: u as string[] };
}

function assertUsernamesValid(usernames: string[]) {
  for (const u of usernames) {
    assert.ok(USERNAME_PATTERN.test(u), `invalid username: ${u}`);
    assert.ok(
      u.length >= MIN_USERNAME_LENGTH && u.length <= MAX_USERNAME_LENGTH,
      `username length out of bounds: ${u}`
    );
    assert.ok(!u.includes(" "), `no spaces allowed: ${u}`);
  }
}

describe("pinterest-profile-name-generator", () => {
  it("happy path: brand + keyword -> 4 display names + 4 valid usernames", () => {
    const { displayNameCandidates, usernameSuggestions } = okNames({
      brandOrName: "Maple & Co.",
      keywords: ["fall decor"],
    });
    assert.equal(displayNameCandidates.length, CANDIDATE_COUNT);
    assert.equal(usernameSuggestions.length, CANDIDATE_COUNT);
    for (const d of displayNameCandidates) {
      assert.ok(d.length <= MAX_DISPLAY_LENGTH, d);
      assert.ok(d.includes("fall decor") || d.includes("Maple"), d);
    }
    assertUsernamesValid(usernameSuggestions);
    assert.ok(usernameSuggestions.some((u) => u.includes("maple")), usernameSuggestions.join(","));
  });

  it("keyword-led candidates keep the keyword", () => {
    const { displayNameCandidates } = okNames({
      brandOrName: "Studio Nine",
      keywords: "wedding",
    });
    assert.ok(displayNameCandidates.filter((d) => d.includes("wedding")).length >= 3);
  });

  it("no keywords -> 4 plain display names, username uses ideas fallback", () => {
    const { displayNameCandidates, usernameSuggestions } = okNames({ brandOrName: "Oak Lane" });
    assert.equal(displayNameCandidates.length, CANDIDATE_COUNT);
    assert.equal(new Set(displayNameCandidates).size, CANDIDATE_COUNT);
    assertUsernamesValid(usernameSuggestions);
    assert.ok(usernameSuggestions.some((u) => u.includes("ideas")));
  });

  it("brand longer than 65 chars -> keyword-first truncation, keyword always kept", () => {
    const longBrand = "The Extraordinarily Long Brand Name That Goes On And On Forever Co";
    assert.ok(longBrand.length > MAX_DISPLAY_LENGTH);
    const { displayNameCandidates } = okNames({
      brandOrName: longBrand,
      keywords: ["candles"],
    });
    assert.equal(displayNameCandidates.length, CANDIDATE_COUNT);
    for (const d of displayNameCandidates) {
      assert.ok(d.length <= MAX_DISPLAY_LENGTH, `${d.length}: ${d}`);
      assert.ok(d.includes("candles"), `keyword must survive truncation: ${d}`);
    }
  });

  it("long brand without keywords still yields distinct names under 65 chars", () => {
    const longBrand = "B".repeat(70);
    const { displayNameCandidates } = okNames({ brandOrName: longBrand });
    for (const d of displayNameCandidates) assert.ok(d.length <= MAX_DISPLAY_LENGTH, d);
    assert.ok(new Set(displayNameCandidates).size >= 3, displayNameCandidates.join(" | "));
  });

  it("brand of exactly 65 chars fits without truncation", () => {
    const { displayNameCandidates } = okNames({ brandOrName: "B".repeat(65) });
    assert.ok(displayNameCandidates[0].length <= MAX_DISPLAY_LENGTH);
  });

  it("username slug rules: lowercase, underscores, no symbols", () => {
    const { usernameSuggestions } = okNames({ brandOrName: "Café Déco!" });
    assertUsernamesValid(usernameSuggestions);
    assert.ok(usernameSuggestions[0].includes("cafe_deco"), usernameSuggestions.join(","));
  });

  it("long brand truncates usernames to 30 chars", () => {
    const { usernameSuggestions } = okNames({
      brandOrName: "averyveryverylongbrandnamethatexceedsthirtycharacters",
    });
    assertUsernamesValid(usernameSuggestions);
    for (const u of usernameSuggestions) assert.ok(u.length <= MAX_USERNAME_LENGTH);
  });

  it("non-Latin brand -> fallback base for usernames, original kept in display names", () => {
    const { displayNameCandidates, usernameSuggestions } = okNames({ brandOrName: "سفرنامہ" });
    assertUsernamesValid(usernameSuggestions);
    assert.ok(
      usernameSuggestions.some((u) => u.startsWith(FALLBACK_USERNAME_BASE)),
      usernameSuggestions.join(",")
    );
    assert.ok(displayNameCandidates.some((d) => d.includes("سفرنامہ")));
  });

  it("determinism: same input twice gives identical output", () => {
    const a = runTool({ brandOrName: "Maple", keywords: ["decor"] });
    const b = runTool({ brandOrName: "Maple", keywords: ["decor"] });
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ brandOrName: "x" });
    assert.ok(r.values);
    assert.deepEqual(Object.keys(r.values).sort(), outputs.map((o) => o.id).sort());
  });

  it("empty / blank / missing / non-string brand errors", () => {
    assert.equal(runTool({ brandOrName: "" }).ok, false);
    assert.equal(runTool({ brandOrName: "   " }).ok, false);
    assert.equal(runTool({}).ok, false);
    assert.equal(runTool({ brandOrName: 42 }).ok, false);
  });

  it("brand is trimmed", () => {
    const { displayNameCandidates } = okNames({ brandOrName: "  Maple  " });
    assert.ok(displayNameCandidates[0].includes("Maple"));
    assert.ok(!displayNameCandidates[0].startsWith(" "));
  });

  it("keywords accept comma-separated string", () => {
    const { usernameSuggestions } = okNames({ brandOrName: "Oak", keywords: "fall, decor" });
    assertUsernamesValid(usernameSuggestions);
    assert.ok(usernameSuggestions.some((u) => u.includes("fall")));
  });

  it("invalid keywords error", () => {
    assert.equal(runTool({ brandOrName: "x", keywords: [1] }).ok, false);
    assert.equal(runTool({ brandOrName: "x", keywords: ["k".repeat(41)] }).ok, false);
  });

  it("usernames are unique within a batch", () => {
    const { usernameSuggestions } = okNames({ brandOrName: "a", keywords: ["b"] });
    assert.equal(new Set(usernameSuggestions).size, usernameSuggestions.length);
  });

  it("short brand still yields valid usernames", () => {
    const { usernameSuggestions } = okNames({ brandOrName: "Bo" });
    assertUsernamesValid(usernameSuggestions);
  });

  it("non-object input errors", () => {
    assert.equal(runTool(null as unknown as Record<string, unknown>).ok, false);
  });
});
