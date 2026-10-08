import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ACTIONS,
  entryId,
  parseVault,
  parseTags,
  formatEntry,
  exportVault,
  searchVault,
  runTool,
  type VaultEntry,
} from "./logic.ts";

const sampleVault = (): VaultEntry[] => [
  { id: entryId("I Tried Waking Up at 5AM"), text: "I Tried Waking Up at 5AM", source: "big channel", tags: ["challenge", "vlog"], status: "unused" },
  { id: entryId("10 Editing Tricks"), text: "10 Editing Tricks", source: "", tags: ["editing"], status: "used" },
];

describe("entryId", () => {
  it("is deterministic for the same text", () => {
    assert.equal(entryId("Hello World"), entryId("Hello World"));
  });
  it("slugifies and appends the grapheme length", () => {
    assert.equal(entryId("Hello World"), "hello-world-11");
  });
  it("differs for different texts", () => {
    assert.notEqual(entryId("Hello World"), entryId("Hello There"));
  });
});

describe("parseVault", () => {
  it("returns [] for missing/empty vaultJson", () => {
    assert.deepEqual(parseVault(undefined), []);
    assert.deepEqual(parseVault(""), []);
  });
  it("parses a valid vault array", () => {
    const vault = parseVault(JSON.stringify(sampleVault()));
    assert.equal(vault.length, 2);
    assert.equal(vault[0].status, "unused");
  });
  it("throws a human error on invalid JSON", () => {
    assert.throws(() => parseVault("{not json"), /not valid JSON/);
  });
  it("throws on a non-array JSON", () => {
    assert.throws(() => parseVault('{"a":1}'), /JSON array/);
  });
  it("throws on an entry missing text", () => {
    assert.throws(() => parseVault('[{"id":"x"}]'), /missing its title text/);
  });
  it("repairs missing ids deterministically", () => {
    const vault = parseVault('[{"text":"No ID Here"}]');
    assert.equal(vault[0].id, entryId("No ID Here"));
  });
});

describe("parseTags", () => {
  it("splits and trims comma-separated tags", () => {
    assert.deepEqual(parseTags("a, b ,c"), ["a", "b", "c"]);
  });
  it("drops empties and handles non-strings", () => {
    assert.deepEqual(parseTags("a,, ,b"), ["a", "b"]);
    assert.deepEqual(parseTags(undefined), []);
  });
});

describe("formatEntry", () => {
  it("renders text, status, tags, and source", () => {
    assert.equal(
      formatEntry(sampleVault()[0]),
      "I Tried Waking Up at 5AM [unused] · tags: challenge, vlog · source: big channel",
    );
  });
  it("handles no tags and no source", () => {
    assert.equal(
      formatEntry({ id: "x", text: "T", source: "", tags: [], status: "unused" }),
      "T [unused] · tags: no tags",
    );
  });
});

describe("exportVault", () => {
  it("exports JSON with 2-space indent", () => {
    const lines = exportVault(sampleVault(), "json");
    assert.equal(lines.length, 1);
    assert.deepEqual(JSON.parse(lines[0]), sampleVault().map((e) => ({ ...e })));
  });
  it("exports CSV with a header and escaped cells", () => {
    const lines = exportVault(
      [{ id: "x-1", text: 'Say "hi", please', source: "", tags: ["a"], status: "unused" }],
      "csv",
    );
    assert.equal(lines[0], "id,text,source,tags,status");
    assert.equal(lines[1], '"x-1","Say ""hi"", please","","a","unused"');
  });
});

describe("searchVault", () => {
  it("matches text, source, and tags case-insensitively", () => {
    assert.equal(searchVault(sampleVault(), "5am").length, 1);
    assert.equal(searchVault(sampleVault(), "BIG CHANNEL").length, 1);
    assert.equal(searchVault(sampleVault(), "editing").length, 1);
  });
  it("returns [] on no match", () => {
    assert.deepEqual(searchVault(sampleVault(), "zebra"), []);
  });
});

describe("runTool — add action", () => {
  it("adds an entry and returns the updated vaultJson", () => {
    const r = runTool({
      action: "add",
      titleText: "My First Vlog",
      source: "idea",
      tags: "vlog, intro",
      status: "unused",
      vaultJson: "",
    });
    assert.equal(r.ok, true);
    const vault = JSON.parse(String(r.values!.vaultJson));
    assert.equal(vault.length, 1);
    assert.equal(vault[0].text, "My First Vlog");
    assert.deepEqual(vault[0].tags, ["vlog", "intro"]);
    assert.equal(r.values!.count, 1);
  });
  it("rejects a duplicate (identical text, case-insensitive)", () => {
    const vaultJson = JSON.stringify(sampleVault());
    const r = runTool({ action: "add", titleText: "i tried waking up at 5am", vaultJson });
    assert.equal(r.ok, false);
    assert.match(r.error!, /already in your vault/);
  });
  it("rejects an empty title", () => {
    const r = runTool({ action: "add", titleText: "  ", vaultJson: "" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /title field is empty/);
  });
  it("warns (but saves) when the title exceeds 100 graphemes", () => {
    const r = runTool({ action: "add", titleText: "a".repeat(105), vaultJson: "" });
    assert.equal(r.ok, true);
    assert.match(String(r.values!.message), /over YouTube's 100-character title limit/);
    assert.equal(JSON.parse(String(r.values!.vaultJson)).length, 1);
  });
  it("marks status used when selected", () => {
    const r = runTool({ action: "add", titleText: "Used Title", status: "used", vaultJson: "" });
    assert.equal(JSON.parse(String(r.values!.vaultJson))[0].status, "used");
  });
});

describe("runTool — list/search/export actions", () => {
  it("lists entries with a count", () => {
    const r = runTool({ action: "list", vaultJson: JSON.stringify(sampleVault()) });
    assert.equal(r.ok, true);
    assert.equal((r.values!.entries as string[]).length, 2);
    assert.equal(r.values!.count, 2);
  });
  it("gives an onboarding hint for an empty vault", () => {
    const r = runTool({ action: "list", vaultJson: "" });
    assert.equal(r.ok, true);
    assert.match(String(r.values!.message), /vault is empty/);
    assert.equal(r.values!.count, 0);
  });
  it("searches and reports matches", () => {
    const r = runTool({ action: "search", query: "editing", vaultJson: JSON.stringify(sampleVault()) });
    assert.equal(r.ok, true);
    assert.equal((r.values!.entries as string[]).length, 1);
    assert.match(String(r.values!.message), /1 match/);
  });
  it("reports no matches honestly", () => {
    const r = runTool({ action: "search", query: "zebra", vaultJson: JSON.stringify(sampleVault()) });
    assert.equal(r.ok, true);
    assert.match(String(r.values!.message), /No titles match/);
  });
  it("rejects an empty search query", () => {
    const r = runTool({ action: "search", query: "  ", vaultJson: "" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /search box is empty/);
  });
  it("exports CSV lines", () => {
    const r = runTool({ action: "export", exportFormat: "csv", vaultJson: JSON.stringify(sampleVault()) });
    assert.equal(r.ok, true);
    const lines = r.values!.entries as string[];
    assert.equal(lines[0], "id,text,source,tags,status");
    assert.equal(lines.length, 3);
    assert.match(String(r.values!.message), /localStorage/);
  });
  it("exports JSON by default", () => {
    const r = runTool({ action: "export", vaultJson: JSON.stringify(sampleVault()) });
    assert.match((r.values!.entries as string[])[0], /^\[/);
  });
  it("handles export of an empty vault", () => {
    const r = runTool({ action: "export", vaultJson: "" });
    assert.equal(r.ok, true);
    assert.match(String(r.values!.message), /Nothing to export/);
  });
});

describe("runTool — validation", () => {
  it("rejects an unknown action", () => {
    const r = runTool({ action: "delete", vaultJson: "" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Pick an action/);
  });
  it("rejects a missing action", () => {
    assert.equal(runTool({ vaultJson: "" }).ok, false);
  });
  it("rejects corrupt vaultJson with a human error", () => {
    const r = runTool({ action: "list", vaultJson: "{oops" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /not valid JSON/);
  });
  it("is deterministic across runs", () => {
    const v = { action: "add", titleText: "Deterministic Title", tags: "a, b", vaultJson: "" };
    assert.deepEqual(runTool(v), runTool(v));
  });
  it("output keys match the meta outputs contract (entries, vaultJson, count, message)", () => {
    const r = runTool({ action: "list", vaultJson: "" });
    assert.deepEqual(Object.keys(r.values!).sort(), ["count", "entries", "message", "vaultJson"]);
  });
  it("all advertised actions are handled", () => {
    assert.deepEqual([...ACTIONS].sort(), ["add", "export", "list", "search"]);
  });
});
