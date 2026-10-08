import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  escapeHtml,
  charCount,
  validateVia,
  validateUrl,
  buildIntentUrl,
  MAX_TWEET_CHARS,
  INTENT_BASE,
} from "./logic.ts";

describe("click-to-tweet-box-generator", () => {
  it("builds a box on a happy path", () => {
    const r = runTool({
      tweetText: "Blogging is compounding.",
      via: "@husnain",
      url: "https://example.com/post",
    });
    assert.equal(r.ok, true);
    const html = r.values!.boxHtml as string;
    const intent = r.values!.intentUrl as string;
    assert.ok(html.includes("Blogging is compounding."));
    assert.ok(html.includes("Click to Tweet"));
    assert.ok(html.includes('target="_blank"'));
    assert.ok(intent.startsWith(INTENT_BASE + "?text="));
    assert.ok(intent.includes("via=husnain"));
    assert.ok(intent.includes("url=" + encodeURIComponent("https://example.com/post")));
  });

  it("percent-encodes spaces and special chars in the intent URL", () => {
    const r = runTool({ tweetText: "a b & c?" });
    assert.equal(r.ok, true);
    assert.equal(
      r.values!.intentUrl,
      INTENT_BASE + "?text=" + encodeURIComponent("a b & c?")
    );
  });

  it("encodes unicode and emoji in the intent URL", () => {
    const r = runTool({ tweetText: "ہیلو 🎉" });
    assert.equal(r.ok, true);
    const intent = r.values!.intentUrl as string;
    assert.equal(intent, INTENT_BASE + "?text=" + encodeURIComponent("ہیلو 🎉"));
    assert.ok((r.values!.boxHtml as string).includes("ہیلو 🎉"));
  });

  it("omits via and url params when not provided", () => {
    const r = runTool({ tweetText: "Just text." });
    assert.equal(r.ok, true);
    assert.equal(r.values!.intentUrl, INTENT_BASE + "?text=" + encodeURIComponent("Just text."));
  });

  it("works with only a via handle", () => {
    const r = runTool({ tweetText: "Hi", via: "@me" });
    assert.equal(r.ok, true);
    assert.ok((r.values!.intentUrl as string).includes("via=me"));
    assert.ok((r.values!.boxHtml as string).includes("via @me"));
  });

  it("accepts exactly 280 characters", () => {
    const r = runTool({ tweetText: "x".repeat(MAX_TWEET_CHARS) });
    assert.equal(r.ok, true);
  });

  it("rejects 281 characters", () => {
    const r = runTool({ tweetText: "x".repeat(MAX_TWEET_CHARS + 1) });
    assert.equal(r.ok, false);
    assert.match(r.error!, /281 characters/);
  });

  it("counts emoji as one character", () => {
    assert.equal(charCount("🎉"), 1);
    const r = runTool({ tweetText: "🎉".repeat(MAX_TWEET_CHARS) });
    assert.equal(r.ok, true);
  });

  it("rejects empty tweet text", () => {
    const r = runTool({ tweetText: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Tweet text is required/);
  });

  it("rejects missing tweet text", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
  });

  it("rejects a via handle without @", () => {
    const r = runTool({ tweetText: "Hi", via: "nohandle" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /must start with @/);
  });

  it("rejects a bare @ with no name", () => {
    const r = runTool({ tweetText: "Hi", via: "@" });
    assert.equal(r.ok, false);
  });

  it("validateVia treats empty as not provided", () => {
    assert.deepEqual(validateVia(""), { handle: null });
    assert.deepEqual(validateVia(undefined), { handle: null });
  });

  it("rejects an invalid share URL", () => {
    const r = runTool({ tweetText: "Hi", url: "not a url" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /valid URL/);
  });

  it("rejects a URL without a scheme", () => {
    const r = runTool({ tweetText: "Hi", url: "example.com/post" });
    assert.equal(r.ok, false);
  });

  it("accepts an http URL", () => {
    const r = runTool({ tweetText: "Hi", url: "http://example.com/x" });
    assert.equal(r.ok, true);
  });

  it("validateUrl treats empty as not provided", () => {
    assert.deepEqual(validateUrl("  "), { url: null });
  });

  it("escapes <script> in the box text", () => {
    const r = runTool({ tweetText: "<script>alert(1)</script>" });
    assert.equal(r.ok, true);
    const html = r.values!.boxHtml as string;
    assert.ok(!html.includes("<script>"));
    assert.ok(html.includes("&lt;script&gt;"));
  });

  it("escapes quotes and ampersands", () => {
    assert.equal(escapeHtml('a&b"c'), "a&amp;b&quot;c");
  });

  it("escapes the via handle in the box", () => {
    const r = runTool({ tweetText: "Hi", via: '@<b>x</b>' });
    assert.equal(r.ok, true);
    assert.ok((r.values!.boxHtml as string).includes("&lt;b&gt;"));
  });

  it("buildIntentUrl orders params text, via, url", () => {
    const u = buildIntentUrl("Hi", "@me", "https://x.com");
    assert.ok(u.indexOf("text=") < u.indexOf("via="));
    assert.ok(u.indexOf("via=") < u.indexOf("url="));
  });

  it("is deterministic (same inputs → identical outputs)", () => {
    const input = { tweetText: "Hello world", via: "@me", url: "https://x.com/y" };
    assert.deepEqual(runTool(input), runTool(input));
  });

  it("returns exactly the output ids defined in meta.ts", () => {
    const r = runTool({ tweetText: "Hi" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["boxHtml", "intentUrl"]);
  });

  it("rejects a non-object input", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });
});
