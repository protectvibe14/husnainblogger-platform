import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  generatePositioning,
  fitBio,
  FRAMES,
  BIO_LIMIT,
  STATEMENT_COUNT,
} from "./logic.ts";

// --- happy path ------------------------------------------------------------

test("happy path: niche + audience -> 5 bio-fit statements", () => {
  const r = runTool({ niche: "email marketing", audience: "busy founders" });
  assert.equal(r.ok, true);
  const stmts = r.values!.positioningStatements as string[];
  assert.equal(stmts.length, 5);
  for (const s of stmts) {
    assert.ok(s.length <= BIO_LIMIT, `over bio limit: ${s}`);
    assert.ok(s.length > 0);
    assert.ok(!s.includes("{niche}") && !s.includes("{audience}") && !s.includes("{Niche}"));
  }
});

test("niche and audience are substituted verbatim", () => {
  const r = runTool({ niche: "sourdough baking", audience: "home bakers" });
  assert.equal(r.ok, true);
  const stmts = r.values!.positioningStatements as string[];
  assert.ok(stmts.some((s) => s.includes("sourdough baking")));
  assert.ok(stmts.some((s) => s.includes("home bakers")));
});

test("{Niche} placeholder capitalizes the niche's first letter", () => {
  // brute-force inputs until the picked 5-frame window includes a {Niche} frame
  let found: string[] | null = null;
  for (let i = 0; i < 50 && !found; i++) {
    const out = generatePositioning(`testniche${i}`, "readers");
    if (out.some((s) => s.includes(`Testniche${i}`))) found = out;
  }
  assert.ok(found !== null, "no 5-frame window contained a {Niche} frame");
});

test("statements are distinct", () => {
  const r = runTool({ niche: "fitness", audience: "new moms" });
  const stmts = r.values!.positioningStatements as string[];
  assert.equal(new Set(stmts).size, stmts.length);
});

// --- bio-fit edge cases -------------------------------------------------------

test("long-but-valid niche/audience still fits 160 chars via word-boundary trim", () => {
  const r = runTool({
    niche: "a".repeat(70),
    audience: "b".repeat(70),
  });
  assert.equal(r.ok, true);
  for (const s of r.values!.positioningStatements as string[]) {
    assert.ok(s.length <= BIO_LIMIT, `over bio limit (${s.length}): ${s}`);
  }
});

test("fitBio: short line untouched", () => {
  assert.equal(fitBio("Hello world"), "Hello world");
});

test("fitBio: 160-char line untouched", () => {
  assert.equal(fitBio("x".repeat(160)), "x".repeat(160));
});

test("fitBio: long line trimmed at word boundary with ellipsis", () => {
  const out = fitBio("word ".repeat(50).trim());
  assert.ok(out.length <= BIO_LIMIT);
  assert.ok(out.endsWith("…"));
});

test("fitBio: single huge word hard-truncates", () => {
  const out = fitBio("z".repeat(300));
  assert.equal(out.length, BIO_LIMIT);
  assert.ok(out.endsWith("…"));
});

// --- validation errors ----------------------------------------------------------

test("error: missing niche", () => {
  const r = runTool({ audience: "founders" });
  assert.equal(r.ok, false);
  assert.ok((r.error as string).includes("niche"));
});

test("error: missing audience", () => {
  const r = runTool({ niche: "fitness" });
  assert.equal(r.ok, false);
  assert.ok((r.error as string).includes("audience"));
});

test("error: empty niche", () => {
  const r = runTool({ niche: "  ", audience: "founders" });
  assert.equal(r.ok, false);
});

test("error: empty audience", () => {
  const r = runTool({ niche: "fitness", audience: "" });
  assert.equal(r.ok, false);
});

test("error: niche over 80 chars", () => {
  const r = runTool({ niche: "x".repeat(81), audience: "founders" });
  assert.equal(r.ok, false);
  assert.ok((r.error as string).includes("80"));
});

test("error: audience over 80 chars", () => {
  const r = runTool({ niche: "fitness", audience: "y".repeat(81) });
  assert.equal(r.ok, false);
});

// --- determinism & bank bounds -----------------------------------------------------

test("deterministic: same inputs -> identical output", () => {
  const a = runTool({ niche: "email marketing", audience: "busy founders" });
  const b = runTool({ niche: "email marketing", audience: "busy founders" });
  assert.deepEqual(a, b);
});

test("different inputs rotate the frame selection", () => {
  const a = generatePositioning("email marketing", "busy founders");
  const b = generatePositioning("real estate", "first-time buyers");
  assert.equal(a.length, 5);
  assert.equal(b.length, 5);
  assert.ok(a.every((s) => s.includes("email marketing") || s.includes("Email marketing")));
});

test("output ids match meta.ts outputs", () => {
  const r = runTool({ niche: "fitness", audience: "founders" });
  assert.deepEqual(Object.keys(r.values!), ["positioningStatements"]);
});

test("frame bank bounds: 10 frames, each with exactly one promise shape", () => {
  assert.equal(FRAMES.length, 10);
  assert.equal(STATEMENT_COUNT, 5);
  assert.equal(BIO_LIMIT, 160);
  for (const f of FRAMES) {
    assert.ok(f.includes("{niche}") || f.includes("{Niche}"), `missing niche placeholder: ${f}`);
    assert.ok(f.includes("{audience}"), `missing audience placeholder: ${f}`);
    // natural frame length (before user text) is well under the bio limit
    assert.ok(f.length <= 90, `frame too long: ${f}`);
  }
});
