import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  checkContactInfo,
  checkLength,
  checkActionVerbs,
  checkNumbers,
  checkSectionHeaders,
  checkKeywordOverlap,
  checkFirstPerson,
  grade,
  wordCount,
} from "./logic.ts";

const JD =
  "We are hiring a senior software engineer. The engineer will build scalable web applications using TypeScript and React. Experience with cloud infrastructure, automated testing, and agile delivery is required.";

const GOOD_RESUME = [
  "Jane Doe",
  "jane.doe@example.com",
  "+1 555-234-5678",
  "linkedin.com/in/janedoe",
  "",
  "Summary",
  "Senior software engineer with 8 years of experience building scalable web applications.",
  "",
  "Experience",
  "Acme Corp — Senior Software Engineer, 2019-2026",
  "Led a team of 6 engineers and built a React platform serving 2 million users.",
  "Increased deployment frequency by 40% and reduced error rates by 25%.",
  "Delivered 12 major features and improved page load times by 30%.",
  "Developed automated testing pipelines that saved 500 engineering hours.",
  "Managed cloud infrastructure across 3 regions and optimized costs by 15%.",
  "Implemented agile delivery practices and mentored 4 junior engineers.",
  "",
  "Education",
  "BSc Computer Science, State University, 2018",
  "",
  "Skills",
  "TypeScript, React, cloud infrastructure, automated testing, agile delivery",
].join("\n");

const WEAK_RESUME =
  "i am john. me and my team did stuff. i like coding. contact me.";

describe("ats-resume-checker", () => {
  it("happy path: strong resume scores high with a grade", () => {
    const r = runTool({ resumeText: GOOD_RESUME, jobDescription: JD });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const checks = v["checks"] as Array<{ id: string; passed: boolean; earnedPoints: number; maxPoints: number }>;
    assert.equal(v["maxScore"], 100);
    assert.equal(checks.length, 7);
    assert.equal(
      checks.reduce((s, c) => s + c.earnedPoints, 0),
      v["score"],
    );
    assert.ok((v["score"] as number) >= 70, `score was ${v["score"]}`);
    assert.equal(typeof v["grade"], "string");
    assert.ok(typeof v["keywordOverlapPct"] === "number");
    assert.ok(Array.isArray(v["matchedKeywords"]));
    assert.ok((v["wordCount"] as number) > 0);
  });

  it("weak resume fails most checks and scores low", () => {
    const r = runTool({ resumeText: WEAK_RESUME, jobDescription: JD });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const checks = v["checks"] as Array<{ passed: boolean }>;
    const failed = checks.filter((c) => !c.passed).length;
    assert.ok(failed >= 4, `only ${failed} checks failed`);
    assert.ok((v["score"] as number) < 50);
  });

  it("contact-info: needs email plus phone or link", () => {
    assert.equal(checkContactInfo("mail a@b.com phone +1 555-234-5678").passed, true);
    assert.equal(checkContactInfo("mail a@b.com https://linkedin.com/in/x").passed, true);
    assert.equal(checkContactInfo("mail a@b.com").passed, false);
    assert.equal(checkContactInfo("phone +1 555-234-5678").passed, false);
    assert.equal(checkContactInfo("nothing here").earnedPoints, 0);
  });

  it("length: 400-1200 words passes, outside fails", () => {
    assert.equal(checkLength("word ".repeat(500)).passed, true);
    assert.equal(checkLength("word ".repeat(400)).passed, true);
    assert.equal(checkLength("word ".repeat(1200)).passed, true);
    assert.equal(checkLength("word ".repeat(399)).passed, false);
    assert.equal(checkLength("word ".repeat(1201)).passed, false);
  });

  it("action-verbs: >=5 occurrences passes", () => {
    const text = "Led teams. Built systems. Launched products. Increased revenue. Reduced costs.";
    const c = checkActionVerbs(text);
    assert.equal(c.passed, true);
    assert.equal(checkActionVerbs("Did some work on stuff.").passed, false);
  });

  it("numbers: >=3 numeric tokens passes", () => {
    assert.equal(checkNumbers("grew 20% and saved $5000 across 3 teams").passed, true);
    assert.equal(checkNumbers("grew a lot").passed, false);
  });

  it("section-headers: >=2 distinct headers passes", () => {
    assert.equal(checkSectionHeaders("Experience\nblah\nSkills\nblah").passed, true);
    assert.equal(checkSectionHeaders("Experience:\nblah\nblah").passed, false);
    assert.equal(checkSectionHeaders("no headers at all").passed, false);
  });

  it("keyword-overlap: proportional points and pct", () => {
    const { check, overlapPct, matched } = checkKeywordOverlap(
      "senior software engineer building scalable web applications with typescript and react",
      JD,
    );
    assert.ok(overlapPct > 0 && overlapPct <= 100);
    assert.ok(matched.length > 0);
    assert.ok(check.earnedPoints >= 0 && check.earnedPoints <= 15);
    assert.ok(check.detail.includes("%"));
  });

  it("keyword-overlap: empty JD keywords -> 0, not a crash", () => {
    const { check, overlapPct } = checkKeywordOverlap("some resume text", "the and for");
    assert.equal(overlapPct, 0);
    assert.equal(check.earnedPoints, 0);
  });

  it("first-person: <=3 pronouns passes", () => {
    assert.equal(checkFirstPerson("Led the team. Built the platform.").passed, true);
    assert.equal(checkFirstPerson("I led me and my team. I did it myself.").passed, false);
  });

  it("grade thresholds are documented", () => {
    assert.equal(grade(90), "Strong");
    assert.equal(grade(75), "Good");
    assert.equal(grade(55), "Needs work");
    assert.equal(grade(10), "Weak");
  });

  it("wordCount counts whitespace-separated tokens", () => {
    assert.equal(wordCount("one two  three"), 3);
  });

  it("determinism: same inputs twice -> identical result", () => {
    const args = { resumeText: GOOD_RESUME, jobDescription: JD };
    assert.deepEqual(runTool(args), runTool(args));
  });

  it("HTML is stripped before checks run", () => {
    const r = runTool({
      resumeText: "<p>" + GOOD_RESUME.replace(/\n/g, "<br>") + "</p>",
      jobDescription: JD,
    });
    assert.equal(r.ok, true);
    assert.ok(((r.values as Record<string, unknown>)["score"] as number) >= 70);
  });

  it("validation: missing inputs -> error", () => {
    assert.equal(runTool({}).ok, false);
    assert.equal(runTool({ resumeText: "x" }).ok, false);
    assert.equal(runTool({ jobDescription: "x" }).ok, false);
  });

  it("validation: empty or oversized text -> error", () => {
    assert.equal(runTool({ resumeText: "   ", jobDescription: JD }).ok, false);
    assert.equal(
      runTool({ resumeText: "r".repeat(20001), jobDescription: JD }).ok,
      false,
    );
  });
});
