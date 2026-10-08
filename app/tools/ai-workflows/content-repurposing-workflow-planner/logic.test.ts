import test from "node:test";
import assert from "node:assert/strict";
import { runTool, FORMATS } from "./logic.ts";

const GOOD = { sourceFormat: "blog-post", targetFormats: "newsletter, short-video" };

test("happy path returns stages table and overview", () => {
  const r = runTool(GOOD);
  assert.equal(r.ok, true);
  assert.ok(r.values);
  assert.deepEqual(r.values.stages.columns, [
    "Order",
    "Stage",
    "Target format",
    "Task",
    "Depends on",
  ]);
  assert.ok(r.values.stages.rows.length > 0);
  assert.equal(typeof r.values.overview, "string");
});

test("output ids match meta.ts: stages, overview", () => {
  const r = runTool(GOOD);
  assert.deepEqual(Object.keys(r.values!).sort(), ["overview", "stages"]);
});

test("row count is 3 prep + 4 per target + 3 wrap-up", () => {
  const r = runTool(GOOD);
  assert.equal(r.values!.stages.rows.length, 3 + 4 * 2 + 3);
});

test("single target gives 3 + 4 + 3 = 10 rows", () => {
  const r = runTool({ sourceFormat: "video", targetFormats: "newsletter" });
  assert.equal(r.values!.stages.rows.length, 10);
});

test("every row has 5 columns and no empty cells", () => {
  const r = runTool(GOOD);
  for (const row of r.values!.stages.rows) {
    assert.equal(row.length, 5);
    for (const cell of row) assert.ok(cell.trim().length > 0, "no empty cell");
  }
});

test("orders ascend stage by stage", () => {
  const r = runTool(GOOD);
  const orders = r.values!.stages.rows.map((row) => row[0]);
  assert.deepEqual(orders, [
    "1.1", "1.2", "1.3",
    "2.1", "2.2", "2.3", "2.4",
    "3.1", "3.2", "3.3", "3.4",
    "W.1", "W.2", "W.3",
  ]);
});

test("dependencies point at earlier tasks only", () => {
  const r = runTool(GOOD);
  const orders = new Set(r.values!.stages.rows.map((row) => row[0]));
  for (const row of r.values!.stages.rows) {
    const dep = row[4];
    if (dep === "—" || dep === "all format stages") continue;
    assert.ok(orders.has(dep), `dependency ${dep} must be a listed order`);
  }
});

test("first per-format task depends on the last prep task", () => {
  const r = runTool(GOOD);
  const first = r.values!.stages.rows.find((row) => row[0] === "2.1")!;
  assert.equal(first[4], "1.3");
});

test("each target format gets its own stage with its label", () => {
  const r = runTool(GOOD);
  const stage2 = r.values!.stages.rows.filter((row) => row[1] === "2 — Repurpose");
  assert.equal(stage2.length, 4);
  assert.ok(stage2.every((row) => row[2] === "Newsletter"));
  const stage3 = r.values!.stages.rows.filter((row) => row[1] === "3 — Repurpose");
  assert.ok(stage3.every((row) => row[2] === "Short-form video"));
});

test("overview names the source, targets, and task count", () => {
  const r = runTool(GOOD);
  assert.match(r.values!.overview, /blog post/i);
  assert.match(r.values!.overview, /Newsletter/);
  assert.match(r.values!.overview, /Short-form video/);
  assert.match(r.values!.overview, /14 ordered tasks/);
});

test("overview is honest about no transformation", () => {
  const r = runTool(GOOD);
  assert.match(r.values!.overview, /no content is transformed/i);
});

test("targetFormats also accepts an array", () => {
  const r = runTool({ sourceFormat: "podcast", targetFormats: ["thread", "newsletter"] });
  assert.equal(r.ok, true);
  assert.equal(r.values!.stages.rows.length, 3 + 8 + 3);
});

test("duplicate targets are deduped", () => {
  const r = runTool({ sourceFormat: "podcast", targetFormats: "thread, thread, THREAD" });
  assert.equal(r.ok, true);
  assert.equal(r.values!.stages.rows.length, 10);
});

test("missing sourceFormat is rejected", () => {
  const r = runTool({ targetFormats: "newsletter" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /source format/i);
});

test("unknown sourceFormat is rejected with the valid list", () => {
  const r = runTool({ sourceFormat: "meme", targetFormats: "newsletter" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /unknown source format/i);
  assert.match(r.error!, /blog-post/);
});

test("missing targetFormats is rejected", () => {
  const r = runTool({ sourceFormat: "blog-post" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /at least one target format/i);
});

test("unknown target format is rejected and named", () => {
  const r = runTool({ sourceFormat: "blog-post", targetFormats: "newsletter, smoke-signal" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /smoke-signal/);
});

test("source cannot equal a target", () => {
  const r = runTool({ sourceFormat: "newsletter", targetFormats: "thread, newsletter" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /cannot also be a target/i);
});

test("deterministic: same inputs give identical outputs", () => {
  const a = runTool(GOOD);
  const b = runTool({ sourceFormat: "blog-post", targetFormats: ["newsletter", "short-video"] });
  assert.deepEqual(a, b);
});

test("bank size: 8 documented formats", () => {
  assert.equal(FORMATS.length, 8);
});
