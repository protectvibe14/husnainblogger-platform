import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, buildRequestMessage, buildFollowUpMessage, CHANNELS } from "./logic.ts";

describe("testimonial-request-builder", () => {
  it("happy path: one email item produces request + follow-up", () => {
    const r = runTool({
      items: [{ clientName: "Sara", productName: "Course X", channel: "email" }],
    });
    assert.equal(r.ok, true);
    const req = r.values?.requestMessages as string[];
    const fol = r.values?.followUpMessages as string[];
    assert.equal(req.length, 1);
    assert.equal(fol.length, 1);
    assert.ok(req[0].includes("Sara"));
    assert.ok(req[0].includes("Course X"));
    assert.ok(req[0].startsWith("Subject:"));
    assert.ok(fol[0].includes("Sara"));
    assert.ok(fol[0].includes("Course X"));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ items: [{ clientName: "A", productName: "B" }] });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), ["followUpMessages", "requestMessages"]);
  });

  it("multiple items: parallel arrays stay aligned", () => {
    const r = runTool({
      items: [
        { clientName: "Sara", productName: "Course X", channel: "email" },
        { clientName: "Ali", productName: "Template Pack", channel: "DM" },
        { clientName: "Maya", productName: "Coaching", channel: "form" },
      ],
    });
    assert.equal(r.ok, true);
    const req = r.values?.requestMessages as string[];
    const fol = r.values?.followUpMessages as string[];
    assert.equal(req.length, 3);
    assert.equal(fol.length, 3);
    assert.ok(req[0].includes("Sara") && fol[0].includes("Sara"));
    assert.ok(req[1].includes("Ali") && fol[1].includes("Ali"));
    assert.ok(req[2].includes("Maya") && fol[2].includes("Maya"));
  });

  it("each channel has distinct request + follow-up templates", () => {
    for (const ch of CHANNELS) {
      const req = buildRequestMessage("Name", "Product", ch);
      const fol = buildFollowUpMessage("Name", "Product", ch);
      assert.ok(req.length > 20, ch);
      assert.ok(fol.length > 20, ch);
      assert.notEqual(req, fol, ch);
    }
    const emailReq = buildRequestMessage("N", "P", "email");
    const dmReq = buildRequestMessage("N", "P", "DM");
    const formReq = buildRequestMessage("N", "P", "form");
    assert.notEqual(emailReq, dmReq);
    assert.notEqual(dmReq, formReq);
  });

  it("missing channel defaults to email", () => {
    const r = runTool({ items: [{ clientName: "Sara", productName: "Course X" }] });
    assert.equal(r.ok, true);
    assert.ok((r.values?.requestMessages as string[])[0].startsWith("Subject:"));
  });

  it("channel is case-insensitive", () => {
    const r = runTool({ items: [{ clientName: "Sara", productName: "X", channel: "dm" }] });
    assert.equal(r.ok, true);
    assert.ok(!(r.values?.requestMessages as string[])[0].startsWith("Subject:"));
  });

  it("missing clientName -> Item N error", () => {
    const r = runTool({
      items: [
        { clientName: "Sara", productName: "X" },
        { productName: "Y", channel: "DM" },
      ],
    });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /Item 2.*client name/i);
  });

  it("missing productName -> Item N error", () => {
    const r = runTool({ items: [{ clientName: "Sara", channel: "email" }] });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /Item 1.*product name/i);
  });

  it("invalid channel -> Item N error", () => {
    const r = runTool({ items: [{ clientName: "Sara", productName: "X", channel: "sms" }] });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /Item 1.*channel/i);
  });

  it("empty items array -> error", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /at least one client/i);
  });

  it("missing items -> error", () => {
    const r = runTool({} as { items: Record<string, unknown>[] });
    assert.equal(r.ok, false);
  });

  it("non-object item -> error", () => {
    const r = runTool({ items: [null as unknown as Record<string, unknown>] });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /Item 1/);
  });

  it("whitespace-only names rejected", () => {
    const r = runTool({ items: [{ clientName: "   ", productName: "X" }] });
    assert.equal(r.ok, false);
  });

  it("names are trimmed", () => {
    const r = runTool({ items: [{ clientName: "  Sara  ", productName: " X " }] });
    assert.equal(r.ok, true);
    assert.ok((r.values?.requestMessages as string[])[0].includes("Hi Sara,"));
  });

  it("templates only write the ASK, never a sample testimonial", () => {
    for (const ch of CHANNELS) {
      const text =
        buildRequestMessage("Sara", "Course X", ch) + "\n" + buildFollowUpMessage("Sara", "Course X", ch);
      // The message must ASK the client to write; it must not contain a sample
      // testimonial the user could pass off as real.
      assert.match(text, /would you be up for|would you be open|your experience|testimonial/i, ch);
      assert.ok(!/“.*”/.test(text) || !/five stars|amazing|life-changing/i.test(text), ch);
      assert.ok(!/I loved Course X/i.test(text), ch);
    }
  });

  it("deterministic: same items give identical output twice", () => {
    const items = [{ clientName: "Sara", productName: "X", channel: "email" }];
    assert.deepEqual(runTool({ items }), runTool({ items }));
  });

  it("email request includes reply instruction, not a finished testimonial", () => {
    const req = buildRequestMessage("Sara", "Course X", "email");
    assert.match(req, /reply to this email|use this link/i);
  });
});
