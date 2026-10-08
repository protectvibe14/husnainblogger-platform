import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const base = { niche: "fitness", city: "Austin", count: 5 };

describe("location-tag-idea-generator (tool-218)", () => {
  it("happy path: returns count ideas + copyAll", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const ideas = r.values?.locationIdeas as string[];
    assert.equal(ideas.length, 5);
    assert.ok(ideas.every((s) => s.length > 20));
    assert.equal(r.values?.copyAll, ideas.join("\n"));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    const ids = Object.keys(r.values ?? {}).sort();
    assert.deepEqual(ids, ["copyAll", "locationIdeas", "note"]);
  });

  it("city is slotted into the ideas", () => {
    const r = runTool(base);
    const ideas = r.values?.locationIdeas as string[];
    assert.ok(ideas.some((s) => s.includes("Austin")));
  });

  it("niche is slotted into venue ideas", () => {
    // niche length 3 -> seed hits the "Farmers markets{nicheTail}" template deterministically
    const r = runTool({ niche: "gym", city: "Austin", count: 5 });
    const ideas = r.values?.locationIdeas as string[];
    assert.ok(ideas.some((s) => s.includes(" for gym")));
  });

  it("empty city: generic 'your area' fallback", () => {
    const r = runTool({ niche: "travel", count: 4 });
    assert.equal(r.ok, true);
    const ideas = r.values?.locationIdeas as string[];
    assert.ok(ideas.some((s) => s.includes("your area")));
  });

  it("missing niche: error", () => {
    const r = runTool({ city: "Austin", count: 5 });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("niche"));
  });

  it("blank niche: error", () => {
    const r = runTool({ niche: "   " });
    assert.equal(r.ok, false);
  });

  it("count defaults to 5", () => {
    const r = runTool({ niche: "food" });
    assert.equal((r.values?.locationIdeas as string[]).length, 5);
  });

  it("count=1 and count=10 bounds", () => {
    assert.equal((runTool({ ...base, count: 1 }).values?.locationIdeas as string[]).length, 1);
    assert.equal((runTool({ ...base, count: 10 }).values?.locationIdeas as string[]).length, 10);
  });

  it("count=0 rejected", () => {
    const r = runTool({ ...base, count: 0 });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("1 and 10"));
  });

  it("count=11 rejected", () => {
    assert.equal(runTool({ ...base, count: 11 }).ok, false);
  });

  it("count as string accepted", () => {
    const r = runTool({ ...base, count: "3" });
    assert.equal(r.ok, true);
    assert.equal((r.values?.locationIdeas as string[]).length, 3);
  });

  it("count non-numeric rejected", () => {
    assert.equal(runTool({ ...base, count: "lots" }).ok, false);
  });

  it("every idea carries a strategy note", () => {
    const r = runTool(base);
    const ideas = r.values?.locationIdeas as string[];
    assert.ok(ideas.every((s) => s.includes(" — ")));
  });

  it("no raw {place}/{nicheTail} slots leak through", () => {
    const r = runTool({ niche: "beauty", city: "Miami", count: 10 });
    const ideas = r.values?.locationIdeas as string[];
    assert.ok(ideas.every((s) => !s.includes("{place}") && !s.includes("{nicheTail}")));
  });

  it("determinism: identical runs", () => {
    assert.deepEqual(runTool(base), runTool(base));
  });

  it("honesty note present", () => {
    const r = runTool(base);
    assert.ok(String(r.values?.note).includes("not a live venue"));
  });
});
