import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  STOPWORDS,
  IDEA_TEMPLATES,
  MIN_TOKEN_LENGTH,
  MIN_PHRASE_COUNT,
  TOP_WORDS_LIMIT,
  TOP_PHRASES_LIMIT,
  IDEA_SEED_LIMIT,
  LOW_CONFIDENCE_THRESHOLD,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_OUTPUT_IDS = ["topWords", "topPhrases", "ideaSeeds", "summary"];

function okValues(input: Record<string, unknown>): Record<string, unknown> {
  const r = runTool(input);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

const SAMPLE = [
  "this recipe is amazing, best recipe ever",
  "where did you get the recipe book?",
  "recipe please!! I need this recipe",
  "the plating is gorgeous 🔥🔥",
  "can you share the full recipe video?",
  "🔥🔥🔥 best plating ever",
].join("\n");

describe("tiktok-comment-keyword-miner", () => {
  it("happy path: word table, phrases, idea seeds, summary", () => {
    const v = okValues({ pastedComments: SAMPLE });
    const table = v.topWords as { columns: string[]; rows: string[][] };
    assert.deepEqual(table.columns, ["Word", "Count", "Share %"]);
    assert.ok(table.rows.length > 0 && table.rows.length <= TOP_WORDS_LIMIT);
    const topRow = table.rows[0];
    assert.equal(topRow[0], "recipe");
    assert.ok(Number(topRow[1]) >= 4);
    assert.ok(Array.isArray(v.topPhrases));
    assert.ok((v.ideaSeeds as string[]).length > 0);
    assert.ok((v.ideaSeeds as string[])[0].includes("recipe"));
    assert.ok((v.summary as string).includes("6 pasted comments"));
  });

  it("output ids match meta.ts outputs", () => {
    const v = okValues({ pastedComments: SAMPLE });
    const metaIds = outputs.map((o) => o.id).sort();
    assert.deepEqual(Object.keys(v).sort(), metaIds);
    assert.deepEqual(metaIds, [...EXPECTED_OUTPUT_IDS].sort());
  });

  it("missing input errors", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.match(r.error!, /paste/i);
  });

  it("blank input errors", () => {
    const r = runTool({ pastedComments: "  \n  " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /paste/i);
  });

  it("URLs are stripped before tokenizing", () => {
    const v = okValues({
      pastedComments: "check https://example.com/abc recipe recipe\nrecipe time",
    });
    const table = v.topWords as { columns: string[]; rows: string[][] };
    const words = table.rows.map((r) => r[0]);
    assert.ok(!words.some((w) => w.includes("http") || w.includes("example") || w.includes("com")));
    assert.ok(words.includes("recipe"));
  });

  it("@handles are stripped before tokenizing", () => {
    const v = okValues({
      pastedComments: "@chefmarco recipe recipe\n@foodie22 recipe",
    });
    const table = v.topWords as { columns: string[]; rows: string[][] };
    const words = table.rows.map((r) => r[0]);
    assert.ok(!words.includes("chefmarco") && !words.includes("foodie22"));
    assert.equal(words[0], "recipe");
  });

  it("tokens shorter than 3 chars are dropped", () => {
    const v = okValues({ pastedComments: "a bb ccc dddd recipe recipe" });
    const table = v.topWords as { columns: string[]; rows: string[][] };
    const words = table.rows.map((r) => r[0]);
    assert.ok(!words.includes("a") && !words.includes("bb"));
    assert.ok(words.includes("ccc") && words.includes("dddd"));
    assert.equal(MIN_TOKEN_LENGTH, 3);
  });

  it("stopwords are removed from the word table", () => {
    const v = okValues({
      pastedComments: "the recipe and the plating\nthis is the best recipe",
    });
    const table = v.topWords as { columns: string[]; rows: string[][] };
    const words = table.rows.map((r) => r[0]);
    assert.ok(!words.includes("the") && !words.includes("and") && !words.includes("this"));
    assert.ok(words.includes("recipe"));
  });

  it("emojis are preserved as sentiment tokens in the summary", () => {
    const v = okValues({ pastedComments: SAMPLE });
    assert.match(v.summary as string, /Top emojis/);
    assert.ok((v.summary as string).includes("\u{1F525}"));
  });

  it("top phrases surface repeated bigrams with counts", () => {
    const v = okValues({ pastedComments: SAMPLE });
    const phrases = v.topPhrases as string[];
    assert.ok(phrases.length <= TOP_PHRASES_LIMIT);
    // "recipe" repeats but bigrams need count>=2; single-occurrence bigrams excluded
    for (const p of phrases) {
      const m = p.match(/\(×(\d+)\)$/);
      assert.ok(m && Number(m[1]) >= MIN_PHRASE_COUNT, `phrase below min count: ${p}`);
    }
  });

  it("share % values sum to <= 100 and are numeric", () => {
    const v = okValues({ pastedComments: SAMPLE });
    const table = v.topWords as { columns: string[]; rows: string[][] };
    let sum = 0;
    for (const row of table.rows) {
      const pct = Number(row[2].replace("%", ""));
      assert.ok(Number.isFinite(pct) && pct > 0 && pct <= 100);
      sum += pct;
    }
    assert.ok(sum <= 100.5, `share sum ${sum}`);
  });

  it("fewer than 5 comments adds a low-confidence warning", () => {
    const v = okValues({ pastedComments: "recipe recipe\nplating nice" });
    assert.match(v.summary as string, /low-confidence/i);
    assert.equal(LOW_CONFIDENCE_THRESHOLD, 5);
  });

  it("5+ comments have no low-confidence warning", () => {
    const v = okValues({ pastedComments: SAMPLE });
    assert.ok(!(v.summary as string).match(/low-confidence/i));
  });

  it("summary states the paste-only limitation honestly", () => {
    const v = okValues({ pastedComments: SAMPLE });
    assert.match(v.summary as string, /cannot read your TikTok comments directly/i);
  });

  it("non-English comments still count frequencies; seeds stay English", () => {
    const v = okValues({
      pastedComments: "寿司が大好き 寿司\n寿司 recipe 寿司\n寿司が大好き",
    });
    const table = v.topWords as { columns: string[]; rows: string[][] };
    assert.ok(table.rows.length > 0);
    for (const s of v.ideaSeeds as string[]) {
      assert.ok(/^[\x00-\x7F]*$/.test(s) || s.includes('"'), `seed not English template: ${s}`);
    }
  });

  it("tiebreak is alphabetical for equal counts", () => {
    const v = okValues({ pastedComments: "zebra apple\napple zebra" });
    const table = v.topWords as { columns: string[]; rows: string[][] };
    assert.equal(table.rows[0][0], "apple");
    assert.equal(table.rows[1][0], "zebra");
  });

  it("idea seeds use the top 5 words with fixed templates", () => {
    const v = okValues({ pastedComments: SAMPLE });
    const seeds = v.ideaSeeds as string[];
    assert.ok(seeds.length <= IDEA_SEED_LIMIT);
    assert.equal(IDEA_TEMPLATES.length, 5);
    for (const s of seeds) assert.ok(!s.includes("[WORD]"));
  });

  it("lines that become empty after stripping are dropped", () => {
    const r = runTool({ pastedComments: "https://x.com/a\n@someone\n   " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /empty/i);
  });

  it("stopword-only input errors honestly", () => {
    const r = runTool({ pastedComments: "lol omg haha\nthe and a" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /stopwords/i);
  });

  it("stopword list size matches the documented contract", () => {
    assert.ok(STOPWORDS.length >= 70, `stopwords: ${STOPWORDS.length}`);
    assert.ok(new Set(STOPWORDS).size === STOPWORDS.length, "stopwords unique");
  });

  it("determinism: same paste -> identical analysis", () => {
    const input = { pastedComments: SAMPLE };
    const a = okValues(input);
    const b = okValues(input);
    assert.deepEqual(a, b);
  });

  it("different pastes produce different analyses", () => {
    const a = okValues({ pastedComments: "recipe recipe recipe" });
    const b = okValues({ pastedComments: "plating plating plating" });
    assert.notDeepEqual(a.topWords, b.topWords);
  });

  it("CRLF line endings are handled", () => {
    const v = okValues({ pastedComments: "recipe recipe\r\nplating plating\r\nrecipe" });
    assert.match(v.summary as string, /3 pasted comments/);
  });
});
