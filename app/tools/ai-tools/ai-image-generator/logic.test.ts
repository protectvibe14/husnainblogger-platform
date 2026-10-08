import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getProviders,
  validateInputs,
  mapHttpStatus,
  classifyFetchError,
  buildOpenRouterImageRequest,
  parseOpenRouterImageResponse,
  buildHfImageRequest,
  parseHfImageStatus,
  buildFalImageSubmitRequest,
  buildFalSubmitRequest,
  parseFalSubmitResponse,
  buildFalStatusRequest,
  parseFalStatusResponse,
  buildFalResultRequest,
  parseFalImageResult,
  getDisclosures,
  FAL_FLUX_SCHNELL_MODEL,
} from "./logic.ts";

describe("ai-image-generator — providers + validation", () => {
  it("getProviders returns the exact priority list", () => {
    assert.deepEqual(getProviders(), ["openrouter", "hf-inference", "falai"]);
  });
  it("rejects a too-short prompt", () => {
    const r = validateInputs({ prompt: "ab" });
    assert.equal(r.ok, false);
    assert.ok(r.errors.length >= 1);
  });
  it("rejects an over-long prompt", () => {
    const r = validateInputs({ prompt: "x".repeat(2001) });
    assert.equal(r.ok, false);
  });
  it("rejects an unknown aspect", () => {
    const r = validateInputs({ prompt: "a red balloon over a lake", aspect: "ultrawide" });
    assert.equal(r.ok, false);
  });
  it("accepts a valid prompt + aspect", () => {
    const r = validateInputs({ prompt: "a red balloon over a lake", aspect: "square" });
    assert.equal(r.ok, true);
    assert.deepEqual(r.errors, []);
  });
  it("aspect is optional", () => {
    assert.equal(validateInputs({ prompt: "a red balloon over a lake" }).ok, true);
  });
});

describe("ai-image-generator — HTTP status mapping", () => {
  it("maps 401/403 to unauthorized, 402 to billing, 429 to rate-limited, 500 to server-error", () => {
    assert.equal(mapHttpStatus(401), "unauthorized");
    assert.equal(mapHttpStatus(403), "unauthorized");
    assert.equal(mapHttpStatus(402), "billing");
    assert.equal(mapHttpStatus(429), "rate-limited");
    assert.equal(mapHttpStatus(500), "server-error");
    assert.equal(mapHttpStatus(503), "server-error");
  });
  it("maps 400 to bad-request and 200 to null", () => {
    assert.equal(mapHttpStatus(400), "bad-request");
    assert.equal(mapHttpStatus(200), null);
  });
  it("classifies 'Failed to fetch' as cors-blocked and timeouts as timeout", () => {
    assert.equal(classifyFetchError("Failed to fetch"), "cors-blocked");
    assert.equal(classifyFetchError("Load failed"), "cors-blocked");
    assert.equal(classifyFetchError("The operation timed out"), "timeout");
    assert.equal(classifyFetchError("something else broke"), "network");
  });
});

describe("ai-image-generator — OpenRouter request/response", () => {
  it("builds the exact chat/completions request", () => {
    const req = buildOpenRouterImageRequest({ key: "sk-or-123", prompt: "a cat" });
    assert.equal(req.url, "https://openrouter.ai/api/v1/chat/completions");
    assert.equal(req.method, "POST");
    assert.equal(req.headers["Authorization"], "Bearer sk-or-123");
    assert.equal(req.headers["Content-Type"], "application/json");
    assert.equal(req.headers["HTTP-Referer"], "https://husnainblogger.com");
    assert.equal(req.headers["X-Title"], "HusnainBlogger AI Tools");
    assert.deepEqual(req.body, {
      model: "google/gemini-2.5-flash-image",
      messages: [{ role: "user", content: "a cat" }],
      modalities: ["image", "text"],
    });
  });
  it("parses a success payload with a data: URL", () => {
    const out = parseOpenRouterImageResponse(200, {
      choices: [{ message: { images: [{ image_url: { url: "data:image/png;base64,AAAA" } }] } }],
    });
    assert.equal(out.ok, true);
    assert.equal((out.data as Record<string, unknown>)["imageUrl"], "data:image/png;base64,AAAA");
  });
  it("parses a success payload with an https URL", () => {
    const out = parseOpenRouterImageResponse(200, {
      choices: [{ message: { images: [{ image_url: { url: "https://cdn.example/img.png" } }] } }],
    });
    assert.equal(out.ok, true);
    assert.equal((out.data as Record<string, unknown>)["imageUrl"], "https://cdn.example/img.png");
  });
  it("fails cleanly when no image is present", () => {
    const out = parseOpenRouterImageResponse(200, { choices: [{ message: { content: "hi" } }] });
    assert.equal(out.ok, false);
    assert.ok((out.message ?? "").length > 0);
  });
  it("maps error payloads", () => {
    const e401 = parseOpenRouterImageResponse(401, { error: { message: "No auth credentials", code: 401 } });
    assert.equal(e401.ok, false);
    assert.equal(e401.kind, "unauthorized");
    assert.match(e401.message ?? "", /No auth credentials/);
    const e402 = parseOpenRouterImageResponse(402, { error: { message: "Insufficient credits" } });
    assert.equal(e402.kind, "billing");
    const e429 = parseOpenRouterImageResponse(429, { error: { message: "Rate limited" } });
    assert.equal(e429.kind, "rate-limited");
    const e500 = parseOpenRouterImageResponse(500, { error: { message: "Boom" } });
    assert.equal(e500.kind, "server-error");
  });
  it("falls back to a generic message on unknown error shapes", () => {
    const out = parseOpenRouterImageResponse(418, null);
    assert.equal(out.ok, false);
    assert.equal(out.kind, "bad-request");
    assert.match(out.message ?? "", /418/);
  });
});

describe("ai-image-generator — Hugging Face request/status", () => {
  it("builds the exact FLUX.1-schnell request", () => {
    const req = buildHfImageRequest({ key: "hf_abc", prompt: "a cat" });
    assert.equal(req.url, "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell");
    assert.equal(req.method, "POST");
    assert.equal(req.headers["Authorization"], "Bearer hf_abc");
    assert.equal(req.headers["Content-Type"], "application/json");
    assert.deepEqual(req.body, { inputs: "a cat" });
  });
  it("treats image/* content-type as success (client converts bytes)", () => {
    const out = parseHfImageStatus(200, null, "image/jpeg");
    assert.equal(out.ok, true);
    assert.equal((out.data as Record<string, unknown>)["bytes"], true);
  });
  it("turns a 503 cold-start into a server-error with ETA guidance", () => {
    const out = parseHfImageStatus(503, { error: "Model loading", estimated_time: 120 }, "application/json");
    assert.equal(out.ok, false);
    assert.equal(out.kind, "server-error");
    assert.match(out.message ?? "", /warming up/);
    assert.match(out.message ?? "", /2 minute/);
  });
  it("maps 401/429 error JSON", () => {
    const e401 = parseHfImageStatus(401, { error: "Unauthorized" }, "application/json");
    assert.equal(e401.kind, "unauthorized");
    const e429 = parseHfImageStatus(429, { error: "Too many" }, "application/json");
    assert.equal(e429.kind, "rate-limited");
  });
});

describe("ai-image-generator — fal.ai queue", () => {
  it("uses the verified FLUX schnell endpoint id", () => {
    assert.equal(FAL_FLUX_SCHNELL_MODEL, "fal-ai/flux/schnell");
  });
  it("builds the submit request with image_size enum", () => {
    const req = buildFalImageSubmitRequest({ key: "fal-key", prompt: "a cat", aspect: "landscape" });
    assert.equal(req.url, "https://queue.fal.run/fal-ai/flux/schnell");
    assert.equal(req.method, "POST");
    assert.equal(req.headers["Authorization"], "Key fal-key");
    assert.equal(req.headers["Content-Type"], "application/json");
    assert.deepEqual(req.body, {
      prompt: "a cat",
      image_size: "landscape_16_9",
      num_images: 1,
      output_format: "jpeg",
    });
  });
  it("maps square aspect to square_hd", () => {
    const req = buildFalImageSubmitRequest({ key: "k", prompt: "a cat", aspect: "square" });
    assert.equal((req.body as Record<string, unknown>)["image_size"], "square_hd");
  });
  it("generic submit builder points at queue.fal.run/{modelId}", () => {
    const req = buildFalSubmitRequest({ modelId: "fal-ai/veo3", key: "k", input: { prompt: "x" } });
    assert.equal(req.url, "https://queue.fal.run/fal-ai/veo3");
  });
  it("parses a submit success", () => {
    const out = parseFalSubmitResponse(200, {
      request_id: "req-1",
      status_url: "https://queue.fal.run/x/requests/req-1/status",
      response_url: "https://queue.fal.run/x/requests/req-1/response",
    });
    assert.equal(out.ok, true);
    assert.equal((out.data as Record<string, unknown>)["requestId"], "req-1");
  });
  it("parses submit errors (402 billing, 401 unauthorized, 429 rate-limited)", () => {
    assert.equal(parseFalSubmitResponse(402, { detail: "Insufficient balance" }).kind, "billing");
    assert.equal(parseFalSubmitResponse(401, { detail: "Invalid key" }).kind, "unauthorized");
    assert.equal(parseFalSubmitResponse(429, {}).kind, "rate-limited");
  });
  it("fails when submit returns no request_id", () => {
    const out = parseFalSubmitResponse(200, {});
    assert.equal(out.ok, false);
    assert.match(out.message ?? "", /request_id/);
  });
  it("builds the status request URL", () => {
    const req = buildFalStatusRequest({ modelId: "fal-ai/flux/schnell", key: "k", requestId: "req-1" });
    assert.equal(req.url, "https://queue.fal.run/fal-ai/flux/schnell/requests/req-1/status");
    assert.equal(req.method, "GET");
    assert.equal(req.headers["Authorization"], "Key k");
  });
  it("parses IN_QUEUE / IN_PROGRESS as ok polls", () => {
    const q = parseFalStatusResponse(200, { status: "IN_QUEUE", queue_position: 3 });
    assert.equal(q.ok, true);
    assert.equal((q.data as Record<string, unknown>)["queueStatus"], "IN_QUEUE");
    assert.equal((q.data as Record<string, unknown>)["queuePosition"], 3);
    const p = parseFalStatusResponse(200, { status: "IN_PROGRESS" });
    assert.equal(p.ok, true);
    assert.equal((p.data as Record<string, unknown>)["queueStatus"], "IN_PROGRESS");
  });
  it("parses COMPLETED as ok", () => {
    const out = parseFalStatusResponse(200, { status: "COMPLETED" });
    assert.equal(out.ok, true);
    assert.equal((out.data as Record<string, unknown>)["queueStatus"], "COMPLETED");
  });
  it("turns FAILED / CANCELLED into errors with provider message", () => {
    const f = parseFalStatusResponse(200, { status: "FAILED", error: "GPU ran out of memory" });
    assert.equal(f.ok, false);
    assert.match(f.message ?? "", /GPU ran out of memory/);
    const c = parseFalStatusResponse(200, { status: "CANCELLED" });
    assert.equal(c.ok, false);
  });
  it("maps status-check HTTP errors", () => {
    assert.equal(parseFalStatusResponse(500, {}).kind, "server-error");
    assert.equal(parseFalStatusResponse(401, {}).kind, "unauthorized");
  });
  it("builds the result request URL", () => {
    const req = buildFalResultRequest({ modelId: "fal-ai/flux/schnell", key: "k", requestId: "req-1" });
    assert.equal(req.url, "https://queue.fal.run/fal-ai/flux/schnell/requests/req-1/response");
  });
  it("parses an image result", () => {
    const out = parseFalImageResult(200, { images: [{ url: "https://cdn.fal/img.jpg", width: 1024 }] });
    assert.equal(out.ok, true);
    assert.equal((out.data as Record<string, unknown>)["imageUrl"], "https://cdn.fal/img.jpg");
  });
  it("fails cleanly when the result has no images", () => {
    const out = parseFalImageResult(200, { images: [] });
    assert.equal(out.ok, false);
  });
  it("maps result HTTP errors", () => {
    assert.equal(parseFalImageResult(402, { detail: "no credits" }).kind, "billing");
  });
});

describe("ai-image-generator — disclosures", () => {
  it("mentions fal.ai proxy/CORS guidance and key privacy", () => {
    const d = getDisclosures();
    assert.ok(d.length >= 3);
    assert.ok(d.some((x) => /proxy/i.test(x)));
    assert.ok(d.some((x) => /no backend|cannot see/i.test(x)));
  });
});
