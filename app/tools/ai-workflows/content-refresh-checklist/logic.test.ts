import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, CONTENT_TYPES } from "./logic.ts";

describe("content-refresh-checklist", () => {
  it("post branch: returns the fixed 12-step checklist", () => {
    const res = runTool({ contentType: "post" });
    assert.equal(res.ok, true);
    assert.equal(res.values!.checklist.length, 12);
    assert.ok(res.values!.checklist[0].startsWith("Check traffic"));
  });

  it("video branch: returns the fixed 11-step checklist", () => {
    const res = runTool({ contentType: "video" });
    assert.equal(res.ok, true);
    assert.equal(res.values!.checklist.length, 11);
    assert.ok(res.values!.checklist.some((s) => s.includes("end screen")));
  });

  it("page branch: returns the fixed 10-step checklist", () => {
    const res = runTool({ contentType: "page" });
    assert.equal(res.ok, true);
    assert.equal(res.values!.checklist.length, 10);
    assert.ok(res.values!.checklist.some((s) => s.includes("mobile")));
  });

  it("output id matches meta.ts outputs (checklist)", () => {
    const res = runTool({ contentType: "post" });
    assert.deepEqual(Object.keys(res.values!), ["checklist"]);
    assert.ok(Array.isArray(res.values!.checklist));
  });

  it("each branch ends with the keep/update/merge/delete decision", () => {
    for (const t of CONTENT_TYPES) {
      const res = runTool({ contentType: t });
      const last = res.values!.checklist[res.values!.checklist.length - 1];
      assert.ok(last.includes("KEEP") && last.includes("UPDATE") && last.includes("MERGE") && last.includes("DELETE"),
        `branch ${t} missing decision step`);
    }
  });

  it("missing contentType fails with a helpful message", () => {
    const res = runTool({});
    assert.equal(res.ok, false);
    assert.match(res.error!, /post, video, or page/);
  });

  it("empty string contentType fails", () => {
    const res = runTool({ contentType: "   " });
    assert.equal(res.ok, false);
  });

  it("unknown contentType fails and names the value", () => {
    const res = runTool({ contentType: "podcast" });
    assert.equal(res.ok, false);
    assert.match(res.error!, /Unknown content type "podcast"/);
  });

  it("non-string contentType fails", () => {
    const res = runTool({ contentType: 42 });
    assert.equal(res.ok, false);
  });

  it("contentType is case-insensitive and trimmed", () => {
    const a = runTool({ contentType: "  POST " });
    const b = runTool({ contentType: "post" });
    assert.equal(a.ok, true);
    assert.deepEqual(a.values, b.values);
  });

  it("determinism: two runs produce identical output", () => {
    assert.deepEqual(runTool({ contentType: "video" }), runTool({ contentType: "video" }));
  });

  it("returned arrays are copies (mutation does not corrupt the bank)", () => {
    const first = runTool({ contentType: "post" });
    first.values!.checklist.push("INJECTED");
    first.values!.checklist[0] = "MUTATED";
    const second = runTool({ contentType: "post" });
    assert.equal(second.values!.checklist.length, 12);
    assert.ok(second.values!.checklist[0].startsWith("Check traffic"));
  });

  it("branch sizes match the documented counts", () => {
    assert.deepEqual(
      CONTENT_TYPES.map((t) => runTool({ contentType: t }).values!.checklist.length),
      [12, 11, 10],
    );
  });

  it("no empty steps in any branch", () => {
    for (const t of CONTENT_TYPES) {
      for (const step of runTool({ contentType: t }).values!.checklist) {
        assert.ok(step.trim().length > 0, `empty step in ${t}`);
      }
    }
  });

  it("copy never claims AI generation", () => {
    const joined = CONTENT_TYPES.map((t) => runTool({ contentType: t }).values!.checklist.join(" ")).join(" ");
    assert.ok(!/ai-generated/i.test(joined));
    assert.ok(!/artificial intelligence/i.test(joined));
  });

  it("ignores extra unrelated input keys", () => {
    const res = runTool({ contentType: "page", topic: "x", count: 5 });
    assert.equal(res.ok, true);
    assert.equal(res.values!.checklist.length, 10);
  });

  it("branches differ per content type (post != video)", () => {
    assert.notDeepEqual(
      runTool({ contentType: "post" }).values,
      runTool({ contentType: "video" }).values,
    );
  });
});
