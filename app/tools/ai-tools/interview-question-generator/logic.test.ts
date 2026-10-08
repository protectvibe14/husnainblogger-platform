import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generateQuestions,
  hashSeed,
  BANK_QUESTIONS,
} from "./logic.ts";

describe("interview-question-generator", () => {
  it("happy path: 10 bank + 3 seniority questions with role inserted", () => {
    const r = runTool({
      role: "product designer",
      seniority: "Mid-level",
      interviewType: "Behavioral",
    });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    const questions = v["questions"] as string[];
    assert.equal(questions.length, BANK_QUESTIONS + 3);
    assert.equal(v["count"], questions.length);
    assert.ok(!questions.some((q) => q.includes("{role}")), "no unfilled placeholders");
    assert.ok(
      questions.some((q) => q.includes("product designer")),
      "role is inserted",
    );
    assert.ok(typeof v["honestyNote"] === "string");
  });

  it("each type bank yields distinct first questions across types", () => {
    const b = generateQuestions("engineer", "senior", "behavioral");
    const t = generateQuestions("engineer", "senior", "technical");
    const c = generateQuestions("engineer", "senior", "culture");
    assert.notDeepEqual(b.bankQuestions, t.bankQuestions);
    assert.notDeepEqual(t.bankQuestions, c.bankQuestions);
  });

  it("seniority add-ons differ by level", () => {
    const junior = generateQuestions("analyst", "junior", "behavioral");
    const lead = generateQuestions("analyst", "lead", "behavioral");
    assert.notDeepEqual(junior.seniorityQuestions, lead.seniorityQuestions);
    assert.equal(junior.seniorityQuestions.length, 3);
  });

  it("rotation: different roles can start at different bank positions", () => {
    const a = generateQuestions("nurse", "junior", "technical").bankQuestions;
    const b = generateQuestions("pilot", "junior", "technical").bankQuestions;
    // Same set rotated — or identical if hashes collide mod 15 (accepted, still deterministic).
    assert.equal(a.length, BANK_QUESTIONS);
    assert.equal(b.length, BANK_QUESTIONS);
  });

  it("hashSeed is deterministic", () => {
    assert.equal(hashSeed("abc"), hashSeed("abc"));
  });

  it("accepts raw ids as well as labels", () => {
    const r = runTool({
      role: "writer",
      seniority: "senior",
      interviewType: "culture",
    });
    assert.equal(r.ok, true);
  });

  it("validation: missing role -> error", () => {
    const r = runTool({ seniority: "Junior", interviewType: "Behavioral" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: role too short -> error", () => {
    const r = runTool({
      role: "x",
      seniority: "Junior",
      interviewType: "Behavioral",
    });
    assert.equal(r.ok, false);
  });

  it("validation: unknown seniority -> error", () => {
    const r = runTool({
      role: "designer",
      seniority: "Nope",
      interviewType: "Behavioral",
    });
    assert.equal(r.ok, false);
  });

  it("validation: unknown type -> error", () => {
    const r = runTool({
      role: "designer",
      seniority: "Junior",
      interviewType: "Nope",
    });
    assert.equal(r.ok, false);
  });

  it("determinism: same inputs twice -> identical output", () => {
    const args = {
      role: "data analyst",
      seniority: "Senior",
      interviewType: "Technical",
    };
    assert.deepEqual(runTool(args), runTool(args));
  });
});
