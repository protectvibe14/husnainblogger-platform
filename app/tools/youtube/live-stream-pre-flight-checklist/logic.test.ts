import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TRACKER_ITEMS, describeProgress } from "./logic.ts";
import * as logicModule from "./logic.ts";

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe("live-stream-pre-flight-checklist — item shape", () => {
  it("has between 15 and 20 items", () => {
    assert.ok(TRACKER_ITEMS.length >= 15 && TRACKER_ITEMS.length <= 20);
  });

  it("every item has a non-empty label", () => {
    for (const item of TRACKER_ITEMS) {
      assert.equal(typeof item.label, "string");
      assert.ok(item.label.trim().length > 0, `empty label on ${item.id}`);
    }
  });

  it("every item has a one-line detail", () => {
    for (const item of TRACKER_ITEMS) {
      assert.equal(typeof item.detail, "string");
      assert.ok(item.detail!.trim().length > 0, `empty detail on ${item.id}`);
    }
  });

  it("item ids are unique", () => {
    const ids = TRACKER_ITEMS.map((i) => i.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("item ids are lowercase kebab-case", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(KEBAB.test(item.id), `bad id format: ${item.id}`);
    }
  });

  it("covers tech, audio, lighting, settings, backup, and post-stream", () => {
    const ids = TRACKER_ITEMS.map((i) => i.id);
    assert.ok(ids.includes("internet-speed-test"));
    assert.ok(ids.includes("microphone-audio-test"));
    assert.ok(ids.includes("lighting-check"));
    assert.ok(ids.includes("stream-key-ready"));
    assert.ok(ids.includes("backup-connection-plan"));
    assert.ok(ids.includes("post-stream-tasks"));
  });

  it("exports no runTool (tracker tools do not compute)", () => {
    assert.equal("runTool" in logicModule, false);
  });
});

describe("live-stream-pre-flight-checklist — describeProgress", () => {
  it("formats 0/total", () => {
    assert.equal(describeProgress(0, 18), "0 of 18 checks complete (0%)");
  });

  it("formats a partial count with rounded percent", () => {
    assert.equal(describeProgress(9, 18), "9 of 18 checks complete (50%)");
  });

  it("rounds percentages (1 of 3 -> 33%)", () => {
    assert.equal(describeProgress(1, 3), "1 of 3 checks complete (33%)");
  });

  it("formats total/total with the ready message", () => {
    assert.equal(describeProgress(18, 18), "18 of 18 checks complete (100%) — ready to go live");
  });

  it("clamps checked above total", () => {
    assert.equal(describeProgress(25, 18), "18 of 18 checks complete (100%) — ready to go live");
  });

  it("clamps negative checked to zero", () => {
    assert.equal(describeProgress(-2, 18), "0 of 18 checks complete (0%)");
  });

  it("handles total = 0 without NaN", () => {
    assert.equal(describeProgress(0, 0), "0 of 0 checks complete (0%)");
  });

  it("floors fractional inputs", () => {
    assert.equal(describeProgress(9.7, 18), "9 of 18 checks complete (50%)");
  });

  it("is deterministic", () => {
    assert.equal(describeProgress(7, 18), describeProgress(7, 18));
  });
});
