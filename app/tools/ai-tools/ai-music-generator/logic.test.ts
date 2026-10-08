import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getProviders,
  MUSIC_ENDPOINT_STORAGE_KEY,
  normalizeBaseUrl,
  validateInputs,
  buildGenerateRequest,
  parseGenerateResponse,
  buildRecordInfoRequest,
  parseRecordInfoResponse,
  getDisclosures,
  mapHttpStatus,
  classifyFetchError,
  providerErrorMessage,
} from "./logic.ts";

describe("ai-music-generator — validation", () => {
  it("is custom-music-api only", () => {
    assert.deepEqual(getProviders(), ["custom-music-api"]);
    assert.equal(MUSIC_ENDPOINT_STORAGE_KEY, "hb-music-endpoint");
  });
  it("normalizes base URLs", () => {
    assert.equal(normalizeBaseUrl("  https://api.sunoapi.org/  "), "https://api.sunoapi.org");
    assert.equal(normalizeBaseUrl("https://api.sunoapi.org///"), "https://api.sunoapi.org");
  });
  it("requires a prompt and a sane base URL", () => {
    assert.equal(validateInputs({ prompt: "", base: "" }).ok, false);
    assert.equal(validateInputs({ prompt: "ab", base: "https://api.sunoapi.org" }).ok, false);
    assert.equal(validateInputs({ prompt: "a sunny pop song", base: "notaurl" }).ok, false);
    assert.equal(validateInputs({ prompt: "a sunny pop song", base: "" }).ok, false);
  });
  it("rejects over-long prompts", () => {
    assert.equal(validateInputs({ prompt: "x".repeat(501), base: "https://api.sunoapi.org" }).ok, false);
  });
  it("accepts a valid request", () => {
    assert.equal(validateInputs({ prompt: "a sunny pop song about summer", base: "https://api.sunoapi.org/" }).ok, true);
  });
});

describe("ai-music-generator — generate request", () => {
  it("builds the exact suno-compatible request", () => {
    const req = buildGenerateRequest({
      base: "https://api.sunoapi.org/",
      key: "k",
      prompt: "a sunny pop song",
      instrumental: false,
    });
    assert.equal(req.url, "https://api.sunoapi.org/api/v1/generate");
    assert.equal(req.method, "POST");
    assert.equal(req.headers["Authorization"], "Bearer k");
    assert.equal(req.headers["Content-Type"], "application/json");
    assert.deepEqual(req.body, {
      prompt: "a sunny pop song",
      customMode: false,
      instrumental: false,
      model: "V4_5",
    });
  });
  it("parses a task id", () => {
    const out = parseGenerateResponse(200, { code: 200, msg: "success", data: { taskId: "task_123" } });
    assert.equal(out.ok, true);
    assert.equal((out.data as Record<string, unknown>)["taskId"], "task_123");
  });
  it("fails without a task id", () => {
    const out = parseGenerateResponse(200, { code: 200, data: {} });
    assert.equal(out.ok, false);
    assert.equal(out.kind, "bad-request");
  });
  it("maps provider errors and HTTP statuses", () => {
    assert.equal(parseGenerateResponse(401, { msg: "invalid token" }).kind, "unauthorized");
    assert.equal(parseGenerateResponse(402, { msg: "insufficient credits" }).kind, "billing");
    assert.equal(parseGenerateResponse(429, {}).kind, "rate-limited");
    assert.equal(providerErrorMessage({ msg: "custom msg" }), "custom msg");
  });
});

describe("ai-music-generator — record-info", () => {
  it("builds the status request", () => {
    const req = buildRecordInfoRequest({ base: "https://api.sunoapi.org", key: "k", taskId: "task_1" });
    assert.equal(req.url, "https://api.sunoapi.org/api/v1/generate/record-info?taskId=task_1");
    assert.equal(req.method, "GET");
    assert.equal(req.headers["Authorization"], "Bearer k");
  });
  it("treats PENDING / TEXT_SUCCESS / FIRST_SUCCESS as still working", () => {
    for (const s of ["PENDING", "TEXT_SUCCESS", "FIRST_SUCCESS"]) {
      const out = parseRecordInfoResponse(200, { code: 200, data: { status: s } });
      assert.equal(out.ok, true);
      assert.equal((out.data as Record<string, unknown>)["done"], false);
    }
  });
  it("maps FAILED to an error", () => {
    const out = parseRecordInfoResponse(200, { code: 200, data: { status: "FAILED", response: {} } });
    assert.equal(out.ok, false);
    assert.equal(out.kind, "server-error");
  });
  it("extracts both tracks from sunoData on SUCCESS", () => {
    const out = parseRecordInfoResponse(200, {
      code: 200,
      data: {
        status: "SUCCESS",
        response: {
          sunoData: [
            { id: "a1", title: "Summer Day", audioUrl: "https://cdn.example.com/a1.mp3", streamAudioUrl: "https://cdn.example.com/s1", duration: 183 },
            { id: "a2", title: "Summer Day (Alt)", audioUrl: "https://cdn.example.com/a2.mp3", streamAudioUrl: "", duration: 181 },
          ],
        },
      },
    });
    assert.equal(out.ok, true);
    const tracks = (out.data as { tracks: Array<Record<string, unknown>> })["tracks"];
    assert.equal(tracks.length, 2);
    assert.equal(tracks[0]["audioUrl"], "https://cdn.example.com/a1.mp3");
    assert.equal(tracks[1]["title"], "Summer Day (Alt)");
  });
  it("fails when SUCCESS carries no audio", () => {
    const out = parseRecordInfoResponse(200, { code: 200, data: { status: "SUCCESS", response: { sunoData: [] } } });
    assert.equal(out.ok, false);
  });
});

describe("ai-music-generator — misc", () => {
  it("maps statuses and fetch errors", () => {
    assert.equal(mapHttpStatus(200), null);
    assert.equal(classifyFetchError("Failed to fetch"), "cors-blocked");
  });
  it("discloses the no-official-API convention", () => {
    const d = getDisclosures();
    assert.ok(d.some((x) => /no official API/i.test(x)));
    assert.ok(d.some((x) => /compatible/i.test(x)));
    assert.ok(d.some((x) => /two song variations/i.test(x)));
  });
});
