/**
 * Tests for tool-361 Pinterest Pin Ratio Checker logic.
 * node:test + node:assert only.
 */
import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  reduceRatio,
  classifyFormat,
  gcd,
  RATIO_TOLERANCE,
  IDEAL_PIN_WIDTH,
  IDEAL_PIN_HEIGHT,
} from "./logic.ts";

test("happy path: 1000x1500 -> 2:3, standard-2:3, feed-safe", () => {
  const r = runTool({ widthPx: 1000, heightPx: 1500 });
  assert.equal(r.ok, true);
  assert.ok(r.values);
  assert.equal(r.values!.ratio, "2:3");
  assert.equal(r.values!.closestFormat, "standard-2:3");
  assert.equal(r.values!.verdict, "feed-safe");
  assert.ok(r.values!.recommendation.includes("1000 × 1500"));
});

test("GCD reduction: 2000x3000 reduces to 2:3", () => {
  const r = runTool({ widthPx: 2000, heightPx: 3000 });
  assert.equal(r.ok, true);
  assert.equal(r.values!.ratio, "2:3");
  assert.equal(r.values!.closestFormat, "standard-2:3");
});

test("idea pin: 1080x1920 -> 9:16, idea-9:16, feed-safe", () => {
  const r = runTool({ widthPx: 1080, heightPx: 1920 });
  assert.equal(r.ok, true);
  assert.equal(r.values!.ratio, "9:16");
  assert.equal(r.values!.closestFormat, "idea-9:16");
  assert.equal(r.values!.verdict, "feed-safe");
});

test("square: 1000x1000 -> 1:1, square-1:1, low-visibility", () => {
  const r = runTool({ widthPx: 1000, heightPx: 1000 });
  assert.equal(r.ok, true);
  assert.equal(r.values!.ratio, "1:1");
  assert.equal(r.values!.closestFormat, "square-1:1");
  assert.equal(r.values!.verdict, "low-visibility");
  assert.ok(/less space|less attention/i.test(r.values!.recommendation));
});

test("long pin: 1000x2100 -> 1:2.1, long-1:2.1, cropped-in-feed", () => {
  const r = runTool({ widthPx: 1000, heightPx: 2100 });
  assert.equal(r.ok, true);
  assert.equal(r.values!.ratio, "10:21");
  assert.equal(r.values!.closestFormat, "long-1:2.1");
  assert.equal(r.values!.verdict, "cropped-in-feed");
});

test("edge case extreme ratio: 100x1000 (1:10) -> off-spec, will crop heavily", () => {
  const r = runTool({ widthPx: 100, heightPx: 1000 });
  assert.equal(r.ok, true);
  assert.equal(r.values!.closestFormat, "off-spec");
  assert.equal(r.values!.verdict, "cropped-in-feed");
  assert.ok(/crop heavily/i.test(r.values!.recommendation));
});

test("edge case wide image: 1600x900 -> off-spec", () => {
  const r = runTool({ widthPx: 1600, heightPx: 900 });
  assert.equal(r.ok, true);
  assert.equal(r.values!.closestFormat, "off-spec");
  assert.equal(r.values!.verdict, "cropped-in-feed");
});

test("edge case between bands: 3:4 (0.75) -> off-spec, not square", () => {
  const r = runTool({ widthPx: 750, heightPx: 1000 });
  assert.equal(r.ok, true);
  assert.equal(r.values!.ratio, "3:4");
  assert.equal(r.values!.closestFormat, "off-spec");
});

test("non-integer dims accepted: 999.6x1499.6 rounds to 1000x1500", () => {
  const r = runTool({ widthPx: 999.6, heightPx: 1499.6 });
  assert.equal(r.ok, true);
  assert.equal(r.values!.ratio, "2:3");
  assert.equal(r.values!.closestFormat, "standard-2:3");
});

test("validation: missing widthPx -> error", () => {
  const r = runTool({ heightPx: 1500 });
  assert.equal(r.ok, false);
  assert.ok(r.error && /width/i.test(r.error));
});

test("validation: missing heightPx -> error", () => {
  const r = runTool({ widthPx: 1000 });
  assert.equal(r.ok, false);
  assert.ok(r.error && /height/i.test(r.error));
});

test("validation: zero width -> error", () => {
  const r = runTool({ widthPx: 0, heightPx: 1500 });
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test("validation: negative height -> error", () => {
  const r = runTool({ widthPx: 1000, heightPx: -50 });
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test("validation: non-number input -> error", () => {
  const r = runTool({ widthPx: "1000", heightPx: 1500 });
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test("determinism: same inputs twice give identical outputs", () => {
  const a = runTool({ widthPx: 736, heightPx: 1102 });
  const b = runTool({ widthPx: 736, heightPx: 1102 });
  assert.deepEqual(a, b);
});

test("unit: gcd and reduceRatio behave", () => {
  assert.equal(gcd(1000, 1500), 500);
  assert.equal(reduceRatio(1000, 1500), "2:3");
  assert.equal(reduceRatio(1080, 1920), "9:16");
  assert.equal(classifyFormat(2 / 3), "standard-2:3");
  assert.equal(classifyFormat(1), "square-1:1");
  assert.equal(RATIO_TOLERANCE, 0.04);
  assert.equal(IDEAL_PIN_WIDTH, 1000);
  assert.equal(IDEAL_PIN_HEIGHT, 1500);
});

test("output ids match meta.ts: ratio, closestFormat, verdict, recommendation", () => {
  const r = runTool({ widthPx: 1000, heightPx: 1500 });
  assert.equal(r.ok, true);
  const keys = Object.keys(r.values!).sort();
  assert.deepEqual(keys, ["closestFormat", "ratio", "recommendation", "verdict"]);
});
