import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, MAX_ITEMS, STATUSES } from "./logic.ts";
import { outputs } from "./meta.ts";

describe("live-q-a-collector", () => {
  it("happy path: builds ranked queue, answered list, export and summary", () => {
    const r = runTool({
      items: [
        { question: "How do I start?", asker: "Sam", upvotes: "3", status: "new" },
        { question: "Best mic?", asker: "Lee", upvotes: 10, status: "new" },
        { question: "Upload schedule?", asker: "Jo", upvotes: 1, status: "answered" },
        { question: "Old question", asker: "Kim", upvotes: 0, status: "archived" },
      ],
    });
    assert.equal(r.ok, true);
    const v = r.values!;
    assert.equal((v["queue"] as string[]).length, 2);
    // ranked by votes desc: "Best mic?" first
    assert.ok((v["queue"] as string[])[0].includes("Best mic?"));
    assert.ok((v["queue"] as string[])[0].startsWith("#1"));
    assert.equal((v["answered"] as string[]).length, 1);
    assert.ok((v["answered"] as string[])[0].includes("Upload schedule?"));
    assert.equal(v["summary"], "2 open (13 votes total), 1 answered, 1 archived");
    assert.ok((v["exportText"] as string).includes("LIVE Q&A QUEUE"));
    assert.ok((v["exportText"] as string).includes("ANSWERED"));
  });

  it("ties keep original entry order", () => {
    const r = runTool({
      items: [
        { question: "First asked", upvotes: 5, status: "new" },
        { question: "Second asked", upvotes: 5, status: "new" },
        { question: "Third asked", upvotes: 5, status: "new" },
      ],
    });
    assert.equal(r.ok, true);
    const queue = r.values!["queue"] as string[];
    assert.ok(queue[0].includes("First asked"));
    assert.ok(queue[1].includes("Second asked"));
    assert.ok(queue[2].includes("Third asked"));
  });

  it("defaults: asker Anonymous, upvotes 0, status new", () => {
    const r = runTool({ items: [{ question: "Hello?" }] });
    assert.equal(r.ok, true);
    const queue = r.values!["queue"] as string[];
    assert.equal(queue.length, 1);
    assert.ok(queue[0].includes("0 votes"));
    assert.ok(queue[0].includes("Anonymous"));
  });

  it("status is case-insensitive", () => {
    const r = runTool({
      items: [
        { question: "Q1", status: "Answered" },
        { question: "Q2", status: "ARCHIVED" },
        { question: "Q3", status: "New" },
      ],
    });
    assert.equal(r.ok, true);
    assert.equal(r.values!["summary"], "1 open (0 votes total), 1 answered, 1 archived");
  });

  it("empty items array -> error", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("at least one question"));
  });

  it("missing items -> error", () => {
    const r = runTool({} as { items: Record<string, unknown>[] });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("too many items -> error", () => {
    const items = Array.from({ length: MAX_ITEMS + 1 }, (_, i) => ({ question: `Q${i}` }));
    const r = runTool({ items });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes(String(MAX_ITEMS)));
  });

  it("empty question -> Item N error", () => {
    const r = runTool({ items: [{ question: "Fine" }, { question: "   " }] });
    assert.equal(r.ok, false);
    assert.equal(r.error, "Item 2: question is required.");
  });

  it("missing question field -> error", () => {
    const r = runTool({ items: [{ asker: "Sam" }] });
    assert.equal(r.ok, false);
    assert.ok(r.error!.startsWith("Item 1:"));
  });

  it("question over 500 chars -> error", () => {
    const r = runTool({ items: [{ question: "x".repeat(501) }] });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("500"));
  });

  it("negative upvotes -> error", () => {
    const r = runTool({ items: [{ question: "Q?", upvotes: -1 }] });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("upvotes"));
  });

  it("fractional upvotes -> error", () => {
    const r = runTool({ items: [{ question: "Q?", upvotes: "2.5" }] });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("upvotes"));
  });

  it("non-numeric upvotes -> error", () => {
    const r = runTool({ items: [{ question: "Q?", upvotes: "lots" }] });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("upvotes"));
  });

  it("invalid status -> error", () => {
    const r = runTool({ items: [{ question: "Q?", status: "maybe" }] });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("status"));
  });

  it("non-object item -> error", () => {
    const r = runTool({ items: ["not an object"] as unknown as Record<string, unknown>[] });
    assert.equal(r.ok, false);
    assert.ok(r.error!.startsWith("Item 1:"));
  });

  it("determinism: same items twice -> identical output", () => {
    const args = {
      items: [
        { question: "A?", upvotes: 4, asker: "X" },
        { question: "B?", upvotes: 4, asker: "Y", status: "answered" },
        { question: "C?", upvotes: 9, asker: "Z" },
      ],
    };
    const a = runTool(args);
    const b = runTool(args);
    assert.deepEqual(a, b);
  });

  it("all archived -> empty queue, counts in summary", () => {
    const r = runTool({
      items: [
        { question: "Q1", status: "archived" },
        { question: "Q2", status: "archived" },
      ],
    });
    assert.equal(r.ok, true);
    assert.deepEqual(r.values!["queue"], []);
    assert.equal(r.values!["summary"], "0 open (0 votes total), 0 answered, 2 archived");
    assert.ok((r.values!["exportText"] as string).includes("(none)"));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ items: [{ question: "Q?" }] });
    assert.equal(r.ok, true);
    const expected = outputs.map((o) => o.id).sort();
    const actual = Object.keys(r.values!).sort();
    assert.deepEqual(actual, expected);
  });

  it("export text contains numbered queue and summary", () => {
    const r = runTool({
      items: [
        { question: "First?", upvotes: 2 },
        { question: "Second?", upvotes: 5 },
      ],
    });
    const text = r.values!["exportText"] as string;
    assert.ok(text.includes("1. #1 [5 votes] Second?"));
    assert.ok(text.includes("2. #2 [2 votes] First?"));
    assert.ok(text.includes("SUMMARY:"));
  });

  it("STATUSES exposes the three supported statuses", () => {
    assert.deepEqual([...STATUSES], ["new", "answered", "archived"]);
  });
});
