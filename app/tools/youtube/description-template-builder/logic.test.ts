import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_DESCRIPTION_CHARS,
  MAX_HASHTAGS,
  FOLD_PREVIEW_CHARS,
  FTC_DISCLOSURE,
  parseChapterLine,
  validateChapters,
  splitList,
  keywordsToHashtags,
  aboveFoldPreview,
  buildDescription,
  charCount,
  runTool,
} from "./logic.ts";
import { inputs, outputs, itemFields, content } from "./meta.ts";

const FULL = {
  topic: "Budget Travel Tips",
  keywords: "budget travel, cheap flights, travel hacks",
  links: "https://example.com/guide\nhttps://example.com/deals",
  affiliateLinks: "https://example.com/hotel?aff=1",
  chapters: "0:00 Intro\n1:30 Booking flights\n5:00 Packing light",
};

describe("parseChapterLine / validateChapters", () => {
  it("parses mm:ss and hh:mm:ss lines", () => {
    assert.deepEqual(parseChapterLine("1:30 Booking")?.seconds, 90);
    assert.deepEqual(parseChapterLine("1:02:03 Deep dive")?.seconds, 3723);
  });
  it("returns null for invalid formats", () => {
    assert.equal(parseChapterLine("no timestamp here"), null);
    assert.equal(parseChapterLine("1:99 Bad"), null);
  });
  it("accepts a valid chapter list", () => {
    const r = validateChapters(["0:00 Intro", "1:30 Flights", "5:00 Packing"]);
    assert.deepEqual(r.problems, []);
    assert.equal(r.chapters.length, 3);
  });
  it("rejects a first chapter not at 0:00", () => {
    const r = validateChapters(["0:05 Late", "1:30 A", "2:30 B"]);
    assert.ok(r.problems.some((p) => p.includes("0:00")));
  });
  it("rejects fewer than 3 chapters", () => {
    const r = validateChapters(["0:00 A", "1:30 B"]);
    assert.ok(r.problems.some((p) => p.includes("at least 3")));
  });
  it("rejects gaps under 10 seconds", () => {
    const r = validateChapters(["0:00 A", "0:05 B", "1:00 C"]);
    assert.ok(r.problems.some((p) => p.includes("10s")));
  });
});

describe("helpers", () => {
  it("splitList trims, drops empties, de-duplicates case-insensitively", () => {
    assert.deepEqual(splitList("a, A ,b\n\nc", /[,\n]+/), ["a", "b", "c"]);
  });
  it("keywordsToHashtags lowercases and strips non-alphanumerics", () => {
    assert.deepEqual(keywordsToHashtags(["Budget Travel", "cheap-flights!", ""]), [
      "#budgettravel",
      "#cheapflights",
    ]);
  });
  it("aboveFoldPreview caps at 150 chars with an ellipsis", () => {
    const long = "x".repeat(200);
    const p = aboveFoldPreview(long);
    assert.equal([...p].length, FOLD_PREVIEW_CHARS + 1);
    assert.ok(p.endsWith("…"));
    assert.equal(aboveFoldPreview("short"), "short");
  });
});

describe("buildDescription", () => {
  it("assembles all sections for a full item", () => {
    const item = {
      topic: "Budget Travel Tips",
      keywords: ["budget travel", "cheap flights"],
      links: ["https://example.com/guide"],
      affiliateLinks: [],
      chapters: ["0:00 Intro", "1:30 Flights", "5:00 Packing"],
    };
    const { text, warnings } = buildDescription(item);
    assert.ok(text.startsWith("Budget Travel Tips —"));
    assert.ok(text.includes("CHAPTERS"));
    assert.ok(text.includes("0:00 Intro"));
    assert.ok(text.includes("LINKS & RESOURCES"));
    assert.ok(text.includes("subscribe"));
    assert.ok(text.includes("#budgettravel"));
    assert.deepEqual(warnings, []);
  });
  it("adds the FTC disclosure when affiliate links are present", () => {
    const { text } = buildDescription({
      topic: "T",
      keywords: [],
      links: [],
      affiliateLinks: ["https://example.com/a"],
      chapters: [],
    });
    assert.ok(text.includes(FTC_DISCLOSURE));
  });
  it("omits the disclosure without affiliate links", () => {
    const { text } = buildDescription({
      topic: "T",
      keywords: [],
      links: [],
      affiliateLinks: [],
      chapters: [],
    });
    assert.ok(!text.includes("AFFILIATE DISCLOSURE"));
  });
  it("omits invalid chapters and reports a warning", () => {
    const { text, warnings } = buildDescription({
      topic: "T",
      keywords: [],
      links: [],
      affiliateLinks: [],
      chapters: ["0:00 A", "0:05 B"],
    });
    assert.ok(!text.includes("CHAPTERS"));
    assert.equal(warnings.length, 1);
    assert.ok(warnings[0].includes("at least 3"));
  });
  it("warns when hashtags exceed 15", () => {
    const kws = Array.from({ length: 20 }, (_, i) => `kw${i}`);
    const { warnings } = buildDescription({
      topic: "T",
      keywords: kws,
      links: [],
      affiliateLinks: [],
      chapters: [],
    });
    assert.ok(warnings.some((w) => w.includes("ignores ALL hashtags")));
  });
});

describe("runTool", () => {
  it("happy path builds one description per item", () => {
    const r = runTool({ items: [FULL, { topic: "Solo Topic" }] });
    assert.equal(r.ok, true);
    assert.equal((r.values?.descriptions as string[]).length, 2);
    assert.equal((r.values?.aboveFold as string[]).length, 2);
    assert.equal((r.values?.charCounts as string[]).length, 2);
    assert.equal(r.values?.count, 2);
    assert.ok((r.values?.aboveFold as string[])[0].length <= FOLD_PREVIEW_CHARS + 1);
  });
  it("errors when items is empty", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("at least one"));
  });
  it("errors when an item has no topic, naming the item number", () => {
    const r = runTool({ items: [{ topic: "ok" }, { topic: "  " }] });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("Item 2"));
  });
  it("errors on an invalid link URL", () => {
    const r = runTool({ items: [{ ...FULL, links: "not-a-url" }] });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("not a valid URL"));
  });
  it("errors when the description exceeds 5000 characters", () => {
    const r = runTool({ items: [{ topic: "T", keywords: "x".repeat(6000) }] });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("5000"));
  });
  it("collects chapter warnings without failing the item", () => {
    const r = runTool({ items: [{ topic: "T", chapters: "0:00 A\n0:05 B" }] });
    assert.equal(r.ok, true);
    assert.ok((r.values?.warnings as string[]).some((w) => w.includes("Item 1")));
  });
  it("is deterministic", () => {
    assert.deepEqual(runTool({ items: [FULL] }), runTool({ items: [FULL] }));
  });
  it("charCount counts code points", () => {
    assert.equal(charCount("abc"), 3);
    assert.equal(MAX_DESCRIPTION_CHARS, 5000);
    assert.equal(MAX_HASHTAGS, 15);
  });
});

describe("meta contract (builder)", () => {
  it("output ids match runTool's returned keys", () => {
    const got = Object.keys(runTool({ items: [{ topic: "T" }] }).values ?? {}).sort();
    const want = outputs.map((o) => o.id).sort();
    assert.deepEqual(got, want);
  });
  it("inputs is empty and itemFields covers the spec inputs", () => {
    assert.deepEqual(inputs, []);
    const ids = itemFields.map((f) => f.id);
    for (const id of ["topic", "keywords", "links", "affiliateLinks", "chapters"]) {
      assert.ok(ids.includes(id), id);
    }
    assert.ok(itemFields.find((f) => f.id === "topic")?.required);
  });
  it("title is <= 60 chars and description is 140-160 chars", () => {
    assert.ok(content.title.length <= 60, `title ${content.title.length}`);
    assert.ok(
      content.description.length >= 140 && content.description.length <= 160,
      `description ${content.description.length}`,
    );
  });
  it("canonical url is absolute and matches the slug", () => {
    const ld = content.jsonLd ?? [];
    const app = ld.find((o) => o["@type"] === "SoftwareApplication") as Record<string, unknown>;
    assert.equal(app["url"], "https://husnainblogger.com/tools/youtube/description-template-builder/");
  });
  it("methodology is honest (assembly, never claims AI generation)", () => {
    const m = (content.methodology ?? "").toLowerCase();
    assert.ok(m.includes("assembl"));
    assert.ok(!/ai[\s-]?generated|ai[\s-]?powered|powered by ai|generated by ai/.test(m));
  });
});
