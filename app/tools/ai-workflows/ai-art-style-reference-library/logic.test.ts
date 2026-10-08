import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ART_STYLES, findStyle, runTool } from "./logic.ts";

describe("ART_STYLES — library bounds", () => {
  it("contains exactly 20 styles", () => {
    assert.equal(ART_STYLES.length, 20);
  });

  it("style names are unique", () => {
    const names = ART_STYLES.map((s) => s.name);
    assert.equal(new Set(names).size, names.length);
  });

  it("every style has a non-empty description", () => {
    for (const s of ART_STYLES) {
      assert.ok(s.description.trim().length > 0, `${s.name} has empty description`);
    }
  });

  it("every style has a non-empty example snippet", () => {
    for (const s of ART_STYLES) {
      assert.ok(s.exampleSnippet.trim().length > 0, `${s.name} has empty snippet`);
    }
  });

  it("every style has at least 2 tags and at least 3 sample keywords", () => {
    for (const s of ART_STYLES) {
      assert.ok(s.tags.length >= 2, `${s.name} needs >= 2 tags`);
      assert.ok(s.sampleKeywords.length >= 3, `${s.name} needs >= 3 keywords`);
    }
  });

  it("example snippets stay in the documented 8–16 word range", () => {
    for (const s of ART_STYLES) {
      const words = s.exampleSnippet.trim().split(/\s+/).length;
      assert.ok(words >= 8 && words <= 16, `${s.name} snippet is ${words} words`);
    }
  });
});

describe("findStyle", () => {
  it("finds a style by exact name", () => {
    assert.equal(findStyle("Cyberpunk")?.description.length! > 0, true);
  });

  it("returns undefined for unknown names", () => {
    assert.equal(findStyle("Not A Style"), undefined);
  });

  it("returns undefined for non-strings", () => {
    assert.equal(findStyle(undefined), undefined);
    assert.equal(findStyle(42), undefined);
  });
});

describe("runTool — happy path", () => {
  it("returns the full card for a valid style", () => {
    const res = runTool({ style: "Anime" });
    assert.equal(res.ok, true);
    assert.equal(res.values!.styleName, "Anime");
    assert.ok(typeof res.values!.description === "string");
    assert.ok(typeof res.values!.exampleSnippet === "string");
    assert.ok(Array.isArray(res.values!.tags));
    assert.ok(Array.isArray(res.values!.sampleKeywords));
  });

  it("works for every style in the library", () => {
    for (const s of ART_STYLES) {
      const res = runTool({ style: s.name });
      assert.equal(res.ok, true, `${s.name} failed`);
      assert.equal(res.values!.styleName, s.name);
    }
  });
});

describe("runTool — validation", () => {
  it("rejects a missing style", () => {
    const res = runTool({});
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("rejects an unknown style name", () => {
    const res = runTool({ style: "Oil-Painting!!" });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });
});

describe("runTool — determinism and output contract", () => {
  it("same input -> identical output (deep equal)", () => {
    assert.deepEqual(runTool({ style: "Pixel Art" }), runTool({ style: "Pixel Art" }));
  });

  it("returns exactly the five documented output keys (matches meta.ts outputs)", () => {
    const res = runTool({ style: "Vaporwave" });
    assert.deepEqual(Object.keys(res.values!).sort(), [
      "description",
      "exampleSnippet",
      "sampleKeywords",
      "styleName",
      "tags",
    ]);
  });
});
