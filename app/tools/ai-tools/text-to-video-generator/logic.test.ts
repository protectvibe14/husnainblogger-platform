import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getProviders,
  validateInputs,
  mapHttpStatus,
  classifyFetchError,
  buildT2vSubmitRequest,
  parseFalSubmitResponse,
  buildFalStatusRequest,
  parseFalStatusResponse,
  buildFalResultRequest,
  parseFalVideoResult,
  getDisclosures,
  FAL_T2V_MODEL,
} from "./logic.ts";

describe("text-to-video-generator — providers + validation", () => {
  it("is fal.ai only", () => {
    assert.deepEqual(getProviders(), ["falai"]);
  });
  it("uses the verified Veo 3 text-to-video endpoint id", () => {
    assert.equal(FAL_T2V_MODEL, "fal-ai/veo3");
  });
  it("rejects a too-short prompt", () => {
    assert.equal(validateInputs({ prompt: "ab", duration: "4s", aspect: "16:9" }).ok, false);
  });
  it("rejects an unknown duration or aspect", () => {
    assert.equal(validateInputs({ prompt: "a cat surfing", duration: "10s", aspect: "16:9" }).ok, false);
    assert.equal(validateInputs({ prompt: "a cat surfing", duration: "4s", aspect: "4:3" }).ok, false);
  });
  it("accepts a valid request", () => {
    const r = validateInputs({ prompt: "a cat surfing a neon wave", duration: "6s", aspect: "9:16" });
    assert.equal(r.ok, true);
    assert.deepEqual(r.errors, []);
  });
  it("duration/aspect optional", () => {
    assert.equal(validateInputs({ prompt: "a cat surfing a neon wave" }).ok, true);
  });
  it("maps statuses and fetch errors", () => {
    assert.equal(mapHttpStatus(401), "unauthorized");
    assert.equal(mapHttpStatus(402), "billing");
    assert.equal(mapHttpStatus(429), "rate-limited");
    assert.equal(mapHttpStatus(500), "server-error");
    assert.equal(mapHttpStatus(200), null);
    assert.equal(classifyFetchError("Failed to fetch"), "cors-blocked");
    assert.equal(classifyFetchError("The request timed out"), "timeout");
  });
});

describe("text-to-video-generator — fal.ai submit", () => {
  it("builds the exact veo3 submit request", () => {
    const req = buildT2vSubmitRequest({ key: "fal-key", prompt: "a cat", duration: "6s", aspect: "16:9" });
    assert.equal(req.url, "https://queue.fal.run/fal-ai/veo3");
    assert.equal(req.method, "POST");
    assert.equal(req.headers["Authorization"], "Key fal-key");
    assert.equal(req.headers["Content-Type"], "application/json");
    assert.deepEqual(req.body, { prompt: "a cat", duration: "6s", aspect_ratio: "16:9" });
  });
  it("parses a submit success", () => {
    const out = parseFalSubmitResponse(200, { request_id: "vid-1" });
    assert.equal(out.ok, true);
    assert.equal((out.data as Record<string, unknown>)["requestId"], "vid-1");
  });
  it("maps submit errors", () => {
    assert.equal(parseFalSubmitResponse(402, { detail: "Insufficient balance" }).kind, "billing");
    assert.equal(parseFalSubmitResponse(401, { detail: "bad key" }).kind, "unauthorized");
    assert.equal(parseFalSubmitResponse(429, {}).kind, "rate-limited");
    assert.equal(parseFalSubmitResponse(500, {}).kind, "server-error");
  });
  it("fails without a request_id", () => {
    assert.equal(parseFalSubmitResponse(200, {}).ok, false);
  });
});

describe("text-to-video-generator — fal.ai poll + result", () => {
  it("builds the status URL", () => {
    const req = buildFalStatusRequest({ key: "k", requestId: "vid-1" });
    assert.equal(req.url, "https://queue.fal.run/fal-ai/veo3/requests/vid-1/status");
    assert.equal(req.method, "GET");
  });
  it("parses IN_QUEUE / IN_PROGRESS / COMPLETED", () => {
    const q = parseFalStatusResponse(200, { status: "IN_QUEUE", queue_position: 2 });
    assert.equal(q.ok, true);
    assert.equal((q.data as Record<string, unknown>)["queueStatus"], "IN_QUEUE");
    assert.equal(parseFalStatusResponse(200, { status: "IN_PROGRESS" }).ok, true);
    assert.equal((parseFalStatusResponse(200, { status: "COMPLETED" }).data as Record<string, unknown>)["queueStatus"], "COMPLETED");
  });
  it("turns FAILED into an error with the provider message", () => {
    const f = parseFalStatusResponse(200, { status: "FAILED", error: "prompt blocked" });
    assert.equal(f.ok, false);
    assert.match(f.message ?? "", /prompt blocked/);
  });
  it("builds the result URL and parses video.url", () => {
    const req = buildFalResultRequest({ key: "k", requestId: "vid-1" });
    assert.equal(req.url, "https://queue.fal.run/fal-ai/veo3/requests/vid-1/response");
    const out = parseFalVideoResult(200, { video: { url: "https://cdn.fal/vid.mp4", content_type: "video/mp4" } });
    assert.equal(out.ok, true);
    assert.equal((out.data as Record<string, unknown>)["videoUrl"], "https://cdn.fal/vid.mp4");
  });
  it("fails cleanly without a video URL", () => {
    assert.equal(parseFalVideoResult(200, { video: {} }).ok, false);
    assert.equal(parseFalVideoResult(402, { detail: "no credits" }).kind, "billing");
  });
});

describe("text-to-video-generator — disclosures", () => {
  it("mentions per-second billing, CORS proxy guidance, and the verified endpoint", () => {
    const d = getDisclosures();
    assert.ok(d.some((x) => /per second/i.test(x)));
    assert.ok(d.some((x) => /proxy/i.test(x)));
    assert.ok(d.some((x) => /fal-ai\/veo3/.test(x)));
  });
});
