import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  SUBJECT_TEMPLATES,
  MAX_INPUT_CHARS,
  MAX_HOST_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id);

function happyValues(): Record<string, unknown> {
  return {
    podcastName: "The Growth Show",
    episodeTopic: "how founders price their first offer",
    hostName: "Maya",
    yourCredentials: "10 years pricing SaaS, 40 podcast appearances",
  };
}

describe("podcast-pitch-email-generator", () => {
  it("happy path returns subjectOptions, pitchEmail, notice", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    assert.equal(typeof r.values!.pitchEmail, "string");
    assert.equal(Array.isArray(r.values!.subjectOptions), true);
    assert.equal(typeof r.values!.notice, "string");
  });

  it("returns all 8 subject options with no duplicates", () => {
    const r = runTool(happyValues());
    const subs = r.values!.subjectOptions as string[];
    assert.equal(subs.length, 8);
    assert.equal(new Set(subs).size, 8);
  });

  it("subject lines are non-empty and each references show, topic, or host", () => {
    const r = runTool(happyValues());
    const subs = r.values!.subjectOptions as string[];
    for (const s of subs) {
      assert.ok(s.length > 0, "empty subject line");
      assert.ok(
        s.includes("The Growth Show") ||
          s.includes("how founders price their first offer") ||
          s.includes("Maya"),
        `subject references nothing from the inputs: ${s}`,
      );
    }
  });

  it("no unfilled {placeholder} tokens remain anywhere", () => {
    const r = runTool(happyValues());
    const subs = r.values!.subjectOptions as string[];
    const body = r.values!.pitchEmail as string;
    assert.ok(!/\{[a-zA-Z]+\}/.test([...subs, body].join("\n")));
  });

  it("missing podcastName -> error", () => {
    const v = happyValues();
    delete v.podcastName;
    const r = runTool(v);
    assert.equal(r.ok, false);
    assert.match(r.error!, /podcast name/i);
  });

  it("whitespace-only podcastName -> error", () => {
    const v = happyValues();
    v.podcastName = "   ";
    assert.equal(runTool(v).ok, false);
  });

  it("missing episodeTopic -> error", () => {
    const v = happyValues();
    delete v.episodeTopic;
    const r = runTool(v);
    assert.equal(r.ok, false);
    assert.match(r.error!, /topic/i);
  });

  it("whitespace-only episodeTopic -> error", () => {
    const v = happyValues();
    v.episodeTopic = " \t ";
    assert.equal(runTool(v).ok, false);
  });

  it("missing yourCredentials -> error", () => {
    const v = happyValues();
    delete v.yourCredentials;
    const r = runTool(v);
    assert.equal(r.ok, false);
    assert.match(r.error!, /credentials/i);
  });

  it("hostName is optional: uses fallback greeting and host phrase", () => {
    const v = happyValues();
    delete v.hostName;
    const r = runTool(v);
    assert.equal(r.ok, true);
    assert.ok((r.values!.pitchEmail as string).startsWith("Hi there,"));
    assert.ok(!/\{[a-zA-Z]+\}/.test((r.values!.pitchEmail as string)));
  });

  it("hostName present: greeting uses the name", () => {
    const r = runTool(happyValues());
    assert.ok((r.values!.pitchEmail as string).startsWith("Hi Maya,"));
  });

  it("overlong podcastName truncated to MAX_INPUT_CHARS with visible notice", () => {
    const v = happyValues();
    v.podcastName = "P".repeat(500);
    const r = runTool(v);
    assert.equal(r.ok, true);
    assert.ok((r.values!.notice as string).includes("shortened"));
    assert.ok((r.values!.pitchEmail as string).length > 0);
  });

  it("emoji count as single code points (no silent mangling)", () => {
    const v = happyValues();
    v.podcastName = "The Show \u{1F3A7}";
    const r = runTool(v);
    assert.equal(r.ok, true);
    assert.ok((r.values!.pitchEmail as string).includes("\u{1F3A7}"));
    assert.equal((r.values!.notice as string), "");
  });

  it("HTML tags are stripped from user input", () => {
    const v = happyValues();
    v.podcastName = "<b>Bold</b> Show <script>alert(1)</script>";
    const r = runTool(v);
    assert.equal(r.ok, true);
    assert.ok(!(r.values!.pitchEmail as string).includes("<b>"));
    assert.ok(!(r.values!.pitchEmail as string).includes("<script>"));
  });

  it("adjacent duplicate words are collapsed", () => {
    const v = happyValues();
    v.episodeTopic = "pricing pricing strategies";
    const r = runTool(v);
    assert.equal(r.ok, true);
    assert.ok(!(r.values!.pitchEmail as string).includes("pricing pricing"));
  });

  it("deterministic: same inputs -> identical outputs", () => {
    const a = runTool(happyValues());
    const b = runTool(happyValues());
    assert.deepEqual(a, b);
  });

  it("different inputs pick the template deterministically (same pick each time)", () => {
    const v = happyValues();
    v.podcastName = "Deep Tech Talks";
    const a = runTool(v);
    const b = runTool(v);
    assert.deepEqual(a.values!.pitchEmail, b.values!.pitchEmail);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(happyValues());
    assert.deepEqual(new Set(Object.keys(r.values!)), new Set(OUTPUT_IDS));
  });

  it("non-object values -> friendly error", () => {
    const r = runTool(undefined as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });

  it("non-string hostName -> error", () => {
    const v = happyValues();
    v.hostName = 42;
    assert.equal(runTool(v).ok, false);
  });

  it("body email contains credentials and talking points", () => {
    const r = runTool(happyValues());
    const body = r.values!.pitchEmail as string;
    assert.ok(body.includes("40 podcast appearances"));
    assert.ok(body.includes("1."));
  });
});
