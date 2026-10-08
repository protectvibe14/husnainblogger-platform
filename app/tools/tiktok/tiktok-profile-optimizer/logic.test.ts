import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  hashStr,
  MAX_BIO_CHARS,
  HANDLE_GUIDANCE_MAX,
  MAX_NICHE_LENGTH,
  MAX_CURRENT_BIO_LENGTH,
  MAX_HANDLE_LENGTH,
  BIO_TEMPLATES,
  CTA_LINES,
  NAME_FIELD_PATTERNS,
  CHECKLIST_ITEMS,
  LINK_SUGGESTIONS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_OUTPUT_IDS = ["bioOptions", "nameFieldSuggestions", "profileChecklist", "linkSuggestions"];

function okValues(input: Record<string, unknown>): Record<string, unknown> {
  const r = runTool(input);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values;
}

describe("tiktok-profile-optimizer", () => {
  it("happy path: full inputs produce all four outputs", () => {
    const v = okValues({
      niche: "skincare",
      currentBio: "I post skincare stuff",
      handle: "glowwithsam",
      followerCount: "under-1000",
    });
    assert.equal(Object.keys(v).sort().join(","), EXPECTED_OUTPUT_IDS.slice().sort().join(","));
    assert.equal((v.bioOptions as string[]).length, 3);
    assert.equal((v.nameFieldSuggestions as string[]).length, 3);
    assert.ok((v.profileChecklist as string[]).length >= CHECKLIST_ITEMS.length);
    assert.equal((v.linkSuggestions as string[]).length, LINK_SUGGESTIONS.length);
  });

  it("every bio option is within the 80-char platform cap", () => {
    const v = okValues({ niche: "personal finance tips for students" });
    for (const bio of v.bioOptions as string[]) {
      assert.ok(bio.length <= MAX_BIO_CHARS, `bio too long (${bio.length}): ${bio}`);
      assert.ok(bio.length > 0, "bio non-empty");
      assert.ok(!bio.includes("[NICHE]"), "no unfilled slots");
    }
  });

  it("long niche is truncated so bios still fit 80 chars", () => {
    const v = okValues({ niche: "a".repeat(MAX_NICHE_LENGTH) });
    for (const bio of v.bioOptions as string[]) {
      assert.ok(bio.length <= MAX_BIO_CHARS, `bio too long (${bio.length})`);
    }
  });

  it("determinism: same inputs -> identical outputs", () => {
    const input = { niche: "fitness", handle: "fitwithsam", followerCount: "1000-plus" };
    assert.deepEqual(runTool(input).values, runTool(input).values);
  });

  it("different niches produce different bio options", () => {
    const a = (okValues({ niche: "fitness" }).bioOptions as string[]).join("|");
    const b = (okValues({ niche: "cooking" }).bioOptions as string[]).join("|");
    assert.notEqual(a, b);
  });

  it("missing niche -> error", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.match(r.error as string, /niche/i);
  });

  it("empty niche -> error", () => {
    const r = runTool({ niche: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /niche/i);
  });

  it("niche longer than 48 chars -> error", () => {
    const r = runTool({ niche: "x".repeat(MAX_NICHE_LENGTH + 1) });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /48/);
  });

  it("currentBio longer than 160 chars -> error", () => {
    const r = runTool({ niche: "fitness", currentBio: "x".repeat(MAX_CURRENT_BIO_LENGTH + 1) });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /160/);
  });

  it("currentBio over 80 chars -> checklist review line", () => {
    const v = okValues({ niche: "fitness", currentBio: "x".repeat(100) });
    const cl = v.profileChecklist as string[];
    assert.ok(cl.some((s) => s.includes("100 characters") && s.includes("80-character")), "review line present");
  });

  it("currentBio under 80 chars -> positive review line", () => {
    const v = okValues({ niche: "fitness", currentBio: "short bio" });
    const cl = v.profileChecklist as string[];
    assert.ok(cl.some((s) => s.includes("9 characters")), "review line present");
  });

  it("handle longer than 64 chars -> error", () => {
    const r = runTool({ niche: "fitness", handle: "x".repeat(MAX_HANDLE_LENGTH + 1) });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /64/);
  });

  it("handle over 24 chars -> labeled guidance note, still ok", () => {
    const v = okValues({ niche: "fitness", handle: "x".repeat(30) });
    const cl = v.profileChecklist as string[];
    assert.ok(cl.some((s) => s.includes("30 characters") && s.includes("guidance")), "guidance note present");
  });

  it("handle with @ prefix is stripped", () => {
    const v = okValues({ niche: "fitness", handle: "@glowwithsam" });
    const names = (v.nameFieldSuggestions as string[]).join(" ");
    assert.ok(names.includes("glowwithsam"));
    assert.ok(!names.includes("@glowwithsam"));
  });

  it("invalid followerCount -> error", () => {
    const r = runTool({ niche: "fitness", followerCount: "lots" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /follower count/i);
  });

  it("under-1000 followers -> LIVE/link limitation note", () => {
    const v = okValues({ niche: "fitness", followerCount: "under-1000" });
    const cl = v.profileChecklist as string[];
    assert.ok(cl.some((s) => s.includes("1,000 followers") && s.includes("LIVE")), "limitation note present");
  });

  it("1000-plus followers -> full link-in-bio note, no LIVE limitation", () => {
    const v = okValues({ niche: "fitness", followerCount: "1000-plus" });
    const cl = v.profileChecklist as string[];
    assert.ok(cl.some((s) => s.includes("full link-in-bio")), "link note present");
    assert.ok(!cl.some((s) => s.includes("LIVE access") && s.includes("unlock")), "no limitation note");
  });

  it("name suggestions use niche and default name when no handle", () => {
    const v = okValues({ niche: "fitness" });
    const names = v.nameFieldSuggestions as string[];
    assert.ok(names.every((s) => s.includes("fitness")));
    assert.ok(names.some((s) => s.includes("YourName")));
  });

  it("word banks match documented sizes", () => {
    assert.equal(BIO_TEMPLATES.length, 12);
    assert.equal(CTA_LINES.length, 6);
    assert.equal(NAME_FIELD_PATTERNS.length, 6);
    assert.equal(CHECKLIST_ITEMS.length, 12);
    assert.equal(LINK_SUGGESTIONS.length, 6);
    for (const t of BIO_TEMPLATES) assert.ok(t.includes("[NICHE]"));
    for (const s of LINK_SUGGESTIONS) assert.ok(s.length > 0);
  });

  it("output ids match meta.ts outputs", () => {
    const ids = outputs.map((o) => o.id).sort();
    assert.deepEqual(ids, EXPECTED_OUTPUT_IDS.slice().sort());
  });

  it("hashStr is deterministic", () => {
    assert.equal(hashStr("fitness"), hashStr("fitness"));
    assert.notEqual(hashStr("fitness"), hashStr("cooking"));
  });

  it("handle non-string -> error", () => {
    const r = runTool({ niche: "fitness", handle: 123 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /handle/i);
  });
});
