import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getProviders,
  validateInputs,
  buildCartoonPrompt,
  buildOpenRouterCartoonEditRequest,
  parseOpenRouterImageResponse,
  buildHfCartoonRequest,
  parseHfImageStatus,
  buildFalCartoonSubmitRequest,
  parseFalSubmitResponse,
  buildFalStatusRequest,
  parseFalStatusResponse,
  buildFalResultRequest,
  parseFalImageResult,
  getDisclosures,
  mapHttpStatus,
  classifyFetchError,
} from "./logic.ts";

describe("photo-cartoonizer — validation", () => {
  it("lists providers in priority order", () => {
    assert.deepEqual(getProviders(), ["openrouter", "hf-inference", "falai"]);
  });
  it("rejects unknown styles", () => {
    assert.equal(validateInputs({ style: "watercolor" }).ok, false);
  });
  it("requires a photo for the OpenRouter edit route", () => {
    const r = validateInputs({ style: "anime", provider: "openrouter", hasImage: false });
    assert.equal(r.ok, false);
    assert.match(r.errors.join(" "), /photo/i);
  });
  it("accepts OpenRouter with a photo and other providers without", () => {
    assert.equal(validateInputs({ style: "anime", provider: "openrouter", hasImage: true }).ok, true);
    assert.equal(validateInputs({ style: "comic-book", provider: "hf-inference", hasImage: false }).ok, true);
  });
});

describe("photo-cartoonizer — prompt builder", () => {
  it("uses descriptive style words, no trademark claims", () => {
    const p = buildCartoonPrompt("3d animated");
    assert.match(p, /3d animated/i);
    assert.doesNotMatch(p.toLowerCase(), /pixar/);
    assert.match(buildCartoonPrompt("anime"), /anime/i);
    assert.match(buildCartoonPrompt("comic-book"), /comic-book/i);
  });
});

describe("photo-cartoonizer — OpenRouter edit request", () => {
  it("builds a multimodal cartoon edit request", () => {
    const req = buildOpenRouterCartoonEditRequest({
      key: "sk-or-1",
      photoDataUrl: "data:image/jpeg;base64,/9j/",
      style: "anime",
    });
    assert.equal(req.url, "https://openrouter.ai/api/v1/chat/completions");
    assert.equal(req.method, "POST");
    assert.equal(req.headers["Authorization"], "Bearer sk-or-1");
    assert.equal(req.headers["HTTP-Referer"], "https://husnainblogger.com");
    const body = req.body as Record<string, unknown>;
    assert.equal(body["model"], "google/gemini-2.5-flash-image");
    assert.deepEqual(body["modalities"], ["image", "text"]);
    const parts = ((body["messages"] as Record<string, unknown>[])[0]["content"] as Record<string, unknown>[]);
    assert.equal(parts[0]["type"], "text");
    assert.match(String(parts[0]["text"]), /anime/i);
    assert.equal(parts[1]["type"], "image_url");
    assert.equal(
      (parts[1]["image_url"] as Record<string, unknown>)["url"],
      "data:image/jpeg;base64,/9j/",
    );
  });
  it("parses a success image", () => {
    const out = parseOpenRouterImageResponse(200, {
      choices: [{ message: { images: [{ image_url: { url: "https://cdn.x/c.png" } }] } }],
    });
    assert.equal(out.ok, true);
    assert.equal((out.data as Record<string, unknown>)["imageUrl"], "https://cdn.x/c.png");
  });
  it("maps 401/402/429/500", () => {
    assert.equal(parseOpenRouterImageResponse(401, { error: { message: "bad key" } }).kind, "unauthorized");
    assert.equal(parseOpenRouterImageResponse(402, { error: { message: "no credits" } }).kind, "billing");
    assert.equal(parseOpenRouterImageResponse(429, {}).kind, "rate-limited");
    assert.equal(parseOpenRouterImageResponse(500, {}).kind, "server-error");
  });
});

describe("photo-cartoonizer — HF + fal.ai routes", () => {
  it("builds the HF cartoon request", () => {
    const req = buildHfCartoonRequest({ key: "hf_1", style: "comic-book" });
    assert.equal(req.url, "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell");
    assert.match(String((req.body as Record<string, unknown>)["inputs"]), /comic-book/i);
  });
  it("treats image bytes as success, 503 as warmup", () => {
    assert.equal(parseHfImageStatus(200, null, "image/jpeg").ok, true);
    assert.match(parseHfImageStatus(503, { estimated_time: 30 }, "application/json").message ?? "", /warming up/);
  });
  it("builds the fal cartoon submit", () => {
    const req = buildFalCartoonSubmitRequest({ key: "k", style: "3d animated" });
    assert.equal(req.url, "https://queue.fal.run/fal-ai/flux/schnell");
    assert.match(String((req.body as Record<string, unknown>)["prompt"]), /3d animated/i);
  });
  it("parses fal submit/status/result", () => {
    assert.equal((parseFalSubmitResponse(200, { request_id: "r1" }).data as Record<string, unknown>)["requestId"], "r1");
    assert.equal(parseFalSubmitResponse(429, {}).kind, "rate-limited");
    const st = buildFalStatusRequest({ key: "k", requestId: "r1" });
    assert.equal(st.url, "https://queue.fal.run/fal-ai/flux/schnell/requests/r1/status");
    assert.equal(parseFalStatusResponse(200, { status: "IN_PROGRESS" }).ok, true);
    assert.equal(parseFalStatusResponse(200, { status: "CANCELLED" }).ok, false);
    const rr = buildFalResultRequest({ key: "k", requestId: "r1" });
    assert.equal(rr.url, "https://queue.fal.run/fal-ai/flux/schnell/requests/r1/response");
    const res = parseFalImageResult(200, { images: [{ url: "https://cdn.f/c.jpg" }] });
    assert.equal((res.data as Record<string, unknown>)["imageUrl"], "https://cdn.f/c.jpg");
  });
  it("maps statuses and fetch errors", () => {
    assert.equal(mapHttpStatus(403), "unauthorized");
    assert.equal(classifyFetchError("Failed to fetch"), "cors-blocked");
  });
});

describe("photo-cartoonizer — disclosures", () => {
  it("is honest about which routes cartoonize the photo", () => {
    const d = getDisclosures();
    assert.ok(d.some((x) => /only the OpenRouter route cartoonizes YOUR uploaded photo/i.test(x)));
    assert.ok(d.some((x) => /not affiliated/i.test(x)));
  });
});
