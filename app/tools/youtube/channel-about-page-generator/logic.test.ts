import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const BASE = {
  channelName: "PixelCraft",
  niche: "pixel art",
  uploadSchedule: "New videos every Tuesday and Friday",
  contactEmail: "hello@pixelcraft.example",
};

describe("channel-about-page-generator — happy path", () => {
  it("returns ok with aboutPage and charCount", () => {
    const r = runTool({ ...BASE });
    assert.equal(r.ok, true);
    assert.equal(typeof r.values!.aboutPage, "string");
    assert.equal(typeof r.values!.charCount, "number");
  });

  it("mentions the channel name, niche, and schedule", () => {
    const r = runTool({ ...BASE });
    const page = r.values!.aboutPage as string;
    assert.ok(page.includes("PixelCraft"));
    assert.ok(page.includes("pixel art"));
    assert.ok(page.includes("New videos every Tuesday and Friday"));
  });

  it("includes the contact email when provided", () => {
    const r = runTool({ ...BASE });
    assert.ok((r.values!.aboutPage as string).includes("hello@pixelcraft.example"));
  });

  it("works without a contact email (optional)", () => {
    const { contactEmail, ...rest } = BASE;
    const r = runTool(rest);
    assert.equal(r.ok, true);
    assert.ok((r.values!.aboutPage as string).length > 0);
  });

  it("output stays within the 1000-character limit", () => {
    const r = runTool({ ...BASE });
    assert.ok((r.values!.aboutPage as string).length <= 1000);
  });

  it("charCount matches the actual aboutPage length", () => {
    const r = runTool({ ...BASE });
    assert.equal(r.values!.charCount, (r.values!.aboutPage as string).length);
  });

  it("stays within limit even with maximum-length inputs", () => {
    const r = runTool({
      channelName: "C".repeat(100),
      niche: "N".repeat(60),
      uploadSchedule: "S".repeat(80),
      contactEmail: "a".repeat(240) + "@example.com",
    });
    assert.equal(r.ok, true);
    assert.ok((r.values!.aboutPage as string).length <= 1000);
  });

  it("is deterministic — same inputs give identical output", () => {
    const a = runTool({ ...BASE });
    const b = runTool({ ...BASE });
    assert.deepEqual(a, b);
  });

  it("picks the same CTA for the same seed across runs", () => {
    const a = runTool({ ...BASE }).values!.aboutPage as string;
    const b = runTool({ ...BASE }).values!.aboutPage as string;
    assert.equal(a, b);
  });
});

describe("channel-about-page-generator — validation errors", () => {
  it("rejects missing channelName", () => {
    const { channelName, ...rest } = BASE;
    const r = runTool(rest);
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects blank channelName", () => {
    const r = runTool({ ...BASE, channelName: "   " });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects channelName over 100 chars", () => {
    const r = runTool({ ...BASE, channelName: "C".repeat(101) });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects missing niche", () => {
    const { niche, ...rest } = BASE;
    const r = runTool(rest);
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects niche over 60 chars", () => {
    const r = runTool({ ...BASE, niche: "N".repeat(61) });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects missing uploadSchedule", () => {
    const { uploadSchedule, ...rest } = BASE;
    const r = runTool(rest);
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects uploadSchedule over 80 chars", () => {
    const r = runTool({ ...BASE, uploadSchedule: "S".repeat(81) });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects an invalid contact email", () => {
    const r = runTool({ ...BASE, contactEmail: "not-an-email" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("rejects a non-string contact email", () => {
    const r = runTool({ ...BASE, contactEmail: 12345 });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });
});
