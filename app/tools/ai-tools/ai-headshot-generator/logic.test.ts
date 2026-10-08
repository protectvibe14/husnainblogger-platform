import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getProviders,
  validateInputs,
  buildHeadshotPrompt,
  buildOpenRouterHeadshotEditRequest,
  parseOpenRouterImageResponse,
  buildHfHeadshotRequest,
  parseHfImageStatus,
  buildFalHeadshotSubmitRequest,
  parseFalSubmitResponse,
  buildFalStatusRequest,
  parseFalStatusResponse,
  buildFalResultRequest,
  parseFalImageResult,
  getDisclosures,
  mapHttpStatus,
  classifyFetchError,
} from "./logic.ts";

describe("ai-headshot-generator — validation", () => {
  it("lists providers in priority order", () => {
    assert.deepEqual(getProviders(), ["openrouter", "hf-inference", "falai"]);
  });
  it("rejects unknown styles", () => {
    assert.equal(validateInputs({ style: "glamour" }).ok, false);
  });
  it("requires a selfie for the OpenRouter edit route", () => {
    const r = validateInputs({ style: "corporate", provider: "openrouter", hasImage: false });
    assert.equal(r.ok, false);
    assert.match(r.errors.join(" "), /selfie/i);
  });
  it("accepts OpenRouter with a selfie and other providers without", () => {
    assert.equal(validateInputs({ style: "studio", provider: "openrouter", hasImage: true }).ok, true);
    assert.equal(validateInputs({ style: "creative", provider: "falai", hasImage: false }).ok, true);
  });
});

describe("ai-headshot-generator — prompt builder", () => {
  it("keeps identity language and includes the style", () => {
    const p = buildHeadshotPrompt("corporate");
    assert.match(p, /same person/i);
    assert.match(p, /corporate/i);
    assert.doesNotMatch(buildHeadshotPrompt("studio"), /corporate/i);
  });
});

describe("ai-headshot-generator — OpenRouter edit request", () => {
  it("builds a multimodal edit request with the selfie data URL", () => {
    const req = buildOpenRouterHeadshotEditRequest({
      key: "sk-or-1",
      selfieDataUrl: "data:image/jpeg;base64,/9j/",
      style: "corporate",
    });
    assert.equal(req.url, "https://openrouter.ai/api/v1/chat/completions");
    assert.equal(req.method, "POST");
    assert.equal(req.headers["Authorization"], "Bearer sk-or-1");
    assert.equal(req.headers["HTTP-Referer"], "https://husnainblogger.com");
    assert.equal(req.headers["X-Title"], "HusnainBlogger AI Tools");
    const body = req.body as Record<string, unknown>;
    assert.equal(body["model"], "google/gemini-2.5-flash-image");
    assert.deepEqual(body["modalities"], ["image", "text"]);
    const msg = (body["messages"] as Record<string, unknown>[])[0];
    const parts = msg["content"] as Record<string, unknown>[];
    assert.equal(parts[0]["type"], "text");
    assert.match(String((parts[0] as Record<string, unknown>)["text"]), /same person/i);
    assert.equal(parts[1]["type"], "image_url");
    assert.equal(
      ((parts[1] as Record<string, unknown>)["image_url"] as Record<string, unknown>)["url"],
      "data:image/jpeg;base64,/9j/",
    );
  });
  it("parses a success image", () => {
    const out = parseOpenRouterImageResponse(200, {
      choices: [{ message: { images: [{ image_url: { url: "data:image/png;base64,ZZ" } }] } }],
    });
    assert.equal(out.ok, true);
    assert.equal((out.data as Record<string, unknown>)["imageUrl"], "data:image/png;base64,ZZ");
  });
  it("maps 401/402/429/500", () => {
    assert.equal(parseOpenRouterImageResponse(401, { error: { message: "bad key" } }).kind, "unauthorized");
    assert.equal(parseOpenRouterImageResponse(402, { error: { message: "no credits" } }).kind, "billing");
    assert.equal(parseOpenRouterImageResponse(429, {}).kind, "rate-limited");
    assert.equal(parseOpenRouterImageResponse(500, {}).kind, "server-error");
  });
});

describe("ai-headshot-generator — HF + fal.ai routes", () => {
  it("builds the HF text-to-image request", () => {
    const req = buildHfHeadshotRequest({ key: "hf_1", style: "studio" });
    assert.equal(req.url, "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell");
    assert.match(String((req.body as Record<string, unknown>)["inputs"]), /studio/i);
  });
  it("treats image bytes as success, 503 as warmup", () => {
    assert.equal(parseHfImageStatus(200, null, "image/png").ok, true);
    const w = parseHfImageStatus(503, { estimated_time: 60 }, "application/json");
    assert.equal(w.ok, false);
    assert.match(w.message ?? "", /warming up/);
  });
  it("builds the fal submit with portrait size", () => {
    const req = buildFalHeadshotSubmitRequest({ key: "k", style: "creative" });
    assert.equal(req.url, "https://queue.fal.run/fal-ai/flux/schnell");
    assert.equal((req.body as Record<string, unknown>)["image_size"], "portrait_4_3");
    assert.match(String((req.body as Record<string, unknown>)["prompt"]), /creative/i);
  });
  it("parses fal submit/status/result", () => {
    assert.equal((parseFalSubmitResponse(200, { request_id: "r1" }).data as Record<string, unknown>)["requestId"], "r1");
    assert.equal(parseFalSubmitResponse(402, {}).kind, "billing");
    const st = buildFalStatusRequest({ key: "k", requestId: "r1" });
    assert.equal(st.url, "https://queue.fal.run/fal-ai/flux/schnell/requests/r1/status");
    const done = parseFalStatusResponse(200, { status: "COMPLETED" });
    assert.equal((done.data as Record<string, unknown>)["queueStatus"], "COMPLETED");
    assert.equal(parseFalStatusResponse(200, { status: "FAILED", error: "x" }).ok, false);
    const rr = buildFalResultRequest({ key: "k", requestId: "r1" });
    assert.equal(rr.url, "https://queue.fal.run/fal-ai/flux/schnell/requests/r1/response");
    const res = parseFalImageResult(200, { images: [{ url: "https://cdn.f/h.jpg" }] });
    assert.equal((res.data as Record<string, unknown>)["imageUrl"], "https://cdn.f/h.jpg");
    assert.equal(parseFalImageResult(200, { images: [] }).ok, false);
  });
  it("maps statuses and fetch errors", () => {
    assert.equal(mapHttpStatus(403), "unauthorized");
    assert.equal(classifyFetchError("Failed to fetch"), "cors-blocked");
  });
});

describe("ai-headshot-generator — disclosures", () => {
  it("states the likeness limitation honestly", () => {
    const d = getDisclosures();
    assert.ok(d.some((x) => /do not preserve your face|likeness/i.test(x)));
    assert.ok(d.some((x) => /proxy/i.test(x)));
  });
});
