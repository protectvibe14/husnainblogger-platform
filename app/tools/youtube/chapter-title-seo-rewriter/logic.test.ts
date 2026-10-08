import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  TITLE_LENGTH_CAP,
  MIN_CHAPTERS,
  MIN_CHAPTER_GAP_SECONDS,
  HONESTY_NOTE,
  parseChapterLine,
  validateChapters,
  polishTitle,
  formatCheck,
  runTool,
} from "./logic.ts";
import { inputs, outputs, content } from "./meta.ts";

const GOOD =
  "0:00 Intro\n2:15 setting up the camera\n10:45 lighting tips for small rooms\n25:00 final thoughts";

describe("parseChapterLine", () => {
  it("parses mm:ss and hh:mm:ss", () => {
    assert.equal(parseChapterLine("2:15 Setup", 2)?.seconds, 135);
    assert.equal(parseChapterLine("1:02:03 Deep dive", 1)?.seconds, 3723);
  });
  it("zero-pads single-digit minutes", () => {
    assert.equal(parseChapterLine("2:05 X", 1)?.timestamp, "02:05");
  });
  it("returns null on invalid formats", () => {
    assert.equal(parseChapterLine("hello world", 1), null);
    assert.equal(parseChapterLine("1:99 Bad", 1), null);
    assert.equal(parseChapterLine("0:00", 1), null); // no title
  });
});

describe("validateChapters", () => {
  it("accepts a valid list", () => {
    const r = validateChapters(GOOD);
    assert.deepEqual(r.errors, []);
    assert.equal(r.chapters.length, 4);
  });
  it("errors with the line number on a bad timestamp", () => {
    const r = validateChapters("0:00 Intro\nnope\n10:00 End");
    assert.ok(r.errors.some((e) => e.includes("Line 2")));
  });
  it("errors when the first chapter is not 0:00", () => {
    const r = validateChapters("0:30 Late\n5:00 A\n10:00 B");
    assert.ok(r.errors.some((e) => e.includes("0:00")));
  });
  it("errors on fewer than 3 chapters", () => {
    const r = validateChapters("0:00 A\n1:00 B");
    assert.ok(r.errors.some((e) => e.includes("at least 3")));
    assert.equal(MIN_CHAPTERS, 3);
  });
  it("errors on gaps under 10 seconds with the line number", () => {
    const r = validateChapters("0:00 A\n0:05 B\n1:00 C");
    assert.ok(r.errors.some((e) => e.includes("Line 2") && e.includes("10s")));
    assert.equal(MIN_CHAPTER_GAP_SECONDS, 10);
  });
  it("errors on empty input", () => {
    assert.ok(validateChapters("   ").errors.length > 0);
  });
});

describe("polishTitle", () => {
  it("trims, collapses spaces, strips trailing punctuation, sentence-cases", () => {
    const r = polishTitle("  the   SETUP...  ", "");
    assert.equal(r.polished, "The SETUP");
    assert.equal(r.keywordFrontLoaded, false);
    assert.equal(r.truncated, false);
  });
  it("front-loads the keyword when it is not at the start", () => {
    const r = polishTitle("my favorite lighting tips", "lighting tips");
    assert.equal(r.polished, "lighting tips: My favorite");
    assert.equal(r.keywordFrontLoaded, true);
  });
  it("leaves titles already starting with the keyword untouched", () => {
    const r = polishTitle("Lighting tips for beginners", "lighting tips");
    assert.equal(r.polished, "Lighting tips for beginners");
    assert.equal(r.keywordFrontLoaded, false);
  });
  it("keyword matching is case-insensitive", () => {
    const r = polishTitle("best LIGHTING TIPS ever", "lighting tips");
    assert.equal(r.keywordFrontLoaded, true);
  });
  it("truncates titles over 70 chars at a word boundary with an ellipsis", () => {
    const long = "this is a very long chapter title that definitely exceeds the seventy character heuristic cap";
    const r = polishTitle(long, "");
    assert.equal(r.truncated, true);
    assert.ok(r.polished.endsWith("…"));
    assert.ok([...r.polished].length <= TITLE_LENGTH_CAP + 1);
    assert.ok(!r.polished.slice(0, -1).endsWith(" "));
  });
  it("does not truncate titles at or under 70 chars", () => {
    const r = polishTitle("short title", "");
    assert.equal(r.truncated, false);
  });
});

describe("formatCheck", () => {
  it("reports length and flags", () => {
    const s = formatCheck({
      lineNumber: 2, timestamp: "02:15", original: "x",
      polished: "Lighting tips: My favorite", keywordFrontLoaded: true,
      truncated: false, length: 28,
    });
    assert.ok(s.includes("Line 2"));
    assert.ok(s.includes("28 chars"));
    assert.ok(s.includes("keyword front-loaded"));
  });
});

describe("runTool", () => {
  it("happy path polishes every title", () => {
    const r = runTool({ chapters: GOOD, primaryKeyword: "lighting tips" });
    assert.equal(r.ok, true);
    const titles = r.values?.titles as string[];
    assert.equal(titles.length, 4);
    assert.equal(titles[0], "00:00 Intro");
    assert.equal(titles[1], "02:15 Setting up the camera");
    assert.equal(titles[2], "10:45 Lighting tips for small rooms"); // already front-loaded: untouched
    assert.equal(titles[3], "25:00 Final thoughts");
    assert.equal((r.values?.checks as string[]).length, 4);
    assert.equal(r.values?.honestyNote, HONESTY_NOTE);
    assert.equal(r.values?.count, 4);
  });
  it("copyAll joins titles with newlines", () => {
    const r = runTool({ chapters: GOOD });
    assert.equal((r.values?.copyAll as string).split("\n").length, 4);
  });
  it("errors on empty chapters", () => {
    const r = runTool({ chapters: "   " });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("chapter list"));
  });
  it("errors name the offending line number", () => {
    const r = runTool({ chapters: "0:00 A\nbad line\n5:00 C" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("Line 2"));
  });
  it("errors when the first chapter is not 0:00", () => {
    assert.equal(runTool({ chapters: "1:00 A\n5:00 B\n9:00 C" }).ok, false);
  });
  it("rejects non-object input", () => {
    assert.equal(runTool(null as unknown as Record<string, unknown>).ok, false);
  });
  it("is deterministic", () => {
    const a = { chapters: GOOD, primaryKeyword: "camera" };
    assert.deepEqual(runTool(a), runTool(a));
  });
  it("honesty note says rule-based polish and disclaims AI rewriting", () => {
    assert.ok(HONESTY_NOTE.toLowerCase().includes("rule-based polish"));
    assert.ok(HONESTY_NOTE.includes("not AI"));
  });
});

describe("meta contract (formatter)", () => {
  it("output ids match runTool's returned keys", () => {
    const got = Object.keys(runTool({ chapters: GOOD }).values ?? {}).sort();
    const want = outputs.map((o) => o.id).sort();
    assert.deepEqual(got, want);
  });
  it("inputs has chapters (required textarea) and optional primaryKeyword", () => {
    const chapters = inputs.find((i) => i.id === "chapters");
    const kw = inputs.find((i) => i.id === "primaryKeyword");
    assert.equal(chapters?.type, "textarea");
    assert.equal(chapters?.required, true);
    assert.equal(kw?.type, "text");
    assert.equal(kw?.required, false);
  });
  it("title is <= 60 chars and description is 140-160 chars", () => {
    assert.ok(content.title.length <= 60, `title ${content.title.length}`);
    assert.ok(
      content.description.length >= 140 && content.description.length <= 160,
      `description ${content.description.length}`,
    );
  });
  it("has 2-3 examples with real input ids and primitive values", () => {
    const ex = content.examples ?? [];
    assert.ok(ex.length >= 2 && ex.length <= 3);
    const ids = new Set(inputs.map((i) => i.id));
    for (const e of ex) {
      for (const k of Object.keys(e.inputs)) assert.ok(ids.has(k), k);
    }
  });
  it("canonical url is absolute and matches the slug", () => {
    const ld = content.jsonLd ?? [];
    const app = ld.find((o) => o["@type"] === "SoftwareApplication") as Record<string, unknown>;
    assert.equal(app["url"], "https://husnainblogger.com/tools/youtube/chapter-title-seo-rewriter/");
  });
});
