import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getProviders,
  validateAddVoiceInputs,
  validateTtsInputs,
  buildAddVoiceRequest,
  parseAddVoiceResponse,
  buildUserRequest,
  parseUserResponse,
  buildTtsRequest,
  parseTtsStatus,
  getDisclosures,
  mapHttpStatus,
  classifyFetchError,
  providerErrorMessage,
} from "./logic.ts";

describe("ai-voice-cloning-studio — validation", () => {
  it("is elevenlabs only", () => {
    assert.deepEqual(getProviders(), ["elevenlabs"]);
  });
  it("requires a name and at least one audio sample", () => {
    assert.equal(validateAddVoiceInputs({ name: "", fileCount: 0 }).ok, false);
    assert.equal(validateAddVoiceInputs({ name: "  ", fileCount: 1 }).ok, false);
    assert.equal(validateAddVoiceInputs({ name: "My Voice", fileCount: 0 }).ok, false);
  });
  it("rejects over-long names", () => {
    assert.equal(validateAddVoiceInputs({ name: "x".repeat(65), fileCount: 1 }).ok, false);
  });
  it("accepts a valid voice request", () => {
    const r = validateAddVoiceInputs({ name: "My Voice", fileCount: 2 });
    assert.equal(r.ok, true);
    assert.deepEqual(r.errors, []);
  });
  it("validates TTS inputs", () => {
    assert.equal(validateTtsInputs({ text: "", voiceId: "" }).ok, false);
    assert.equal(validateTtsInputs({ text: "hello", voiceId: "" }).ok, false);
    assert.equal(validateTtsInputs({ text: "x".repeat(2501), voiceId: "v1" }).ok, false);
    assert.equal(validateTtsInputs({ text: "hello world", voiceId: "v1" }).ok, true);
  });
});

describe("ai-voice-cloning-studio — add-voice request", () => {
  it("builds the multipart descriptor (no Content-Type — browser sets boundary)", () => {
    const req = buildAddVoiceRequest({ key: "xi-key", name: "My Voice" });
    assert.equal(req.url, "https://api.elevenlabs.io/v1/voices/add");
    assert.equal(req.method, "POST");
    assert.equal(req.headers["xi-api-key"], "xi-key");
    assert.ok(!("Content-Type" in req.headers));
    assert.deepEqual(req.formFields, ["name", "files"]);
  });
  it("parses a success voice_id", () => {
    const out = parseAddVoiceResponse(200, { voice_id: "voice_abc123" });
    assert.equal(out.ok, true);
    assert.equal((out.data as Record<string, unknown>)["voiceId"], "voice_abc123");
  });
  it("maps the ElevenLabs detail error shape", () => {
    const out = parseAddVoiceResponse(401, {
      detail: { status: "invalid_api_key", message: "Invalid API key", code: "invalid_api_key" },
    });
    assert.equal(out.ok, false);
    assert.equal(out.kind, "unauthorized");
    assert.match(out.message ?? "", /Invalid API key/);
  });
  it("maps 402/429/500", () => {
    assert.equal(parseAddVoiceResponse(402, { detail: { message: "Quota exceeded" } }).kind, "billing");
    assert.equal(parseAddVoiceResponse(429, {}).kind, "rate-limited");
    assert.equal(parseAddVoiceResponse(500, {}).kind, "server-error");
  });
  it("fails cleanly without a voice_id", () => {
    assert.equal(parseAddVoiceResponse(200, {}).ok, false);
  });
  it("providerErrorMessage handles string detail", () => {
    assert.equal(providerErrorMessage({ detail: "plain string" }), "plain string");
    assert.equal(providerErrorMessage(null), null);
  });
});

describe("ai-voice-cloning-studio — test key", () => {
  it("builds the GET /v1/user request", () => {
    const req = buildUserRequest({ key: "xi-key" });
    assert.equal(req.url, "https://api.elevenlabs.io/v1/user");
    assert.equal(req.method, "GET");
    assert.equal(req.headers["xi-api-key"], "xi-key");
  });
  it("parses subscription info", () => {
    const out = parseUserResponse(200, {
      subscription: { tier: "starter", character_count: 1200, character_limit: 30000 },
    });
    assert.equal(out.ok, true);
    assert.equal((out.data as Record<string, unknown>)["tier"], "starter");
    assert.equal((out.data as Record<string, unknown>)["characterCount"], 1200);
  });
  it("rejects a bad key with the detail message", () => {
    const out = parseUserResponse(401, { detail: { message: "Invalid API key" } });
    assert.equal(out.kind, "unauthorized");
    assert.match(out.message ?? "", /Invalid API key/);
  });
});

describe("ai-voice-cloning-studio — TTS request", () => {
  it("builds the exact TTS request (bytes — client converts)", () => {
    const req = buildTtsRequest({ key: "xi-key", voiceId: "voice_abc", text: "hello world" });
    assert.equal(req.url, "https://api.elevenlabs.io/v1/text-to-speech/voice_abc");
    assert.equal(req.method, "POST");
    assert.equal(req.headers["xi-api-key"], "xi-key");
    assert.equal(req.headers["Content-Type"], "application/json");
    assert.equal(req.headers["Accept"], "audio/mpeg");
    assert.deepEqual(req.body, { text: "hello world", model_id: "elevenlabs_multilingual_v2" });
  });
  it("encodes the voice id in the URL", () => {
    const req = buildTtsRequest({ key: "k", voiceId: "voice/with space", text: "hi" });
    assert.match(req.url, /voice%2Fwith%20space/);
  });
  it("treats audio/* bytes as success", () => {
    const out = parseTtsStatus(200, null, "audio/mpeg");
    assert.equal(out.ok, true);
    assert.equal((out.data as Record<string, unknown>)["bytes"], true);
  });
  it("maps TTS errors", () => {
    assert.equal(parseTtsStatus(401, { detail: { message: "Invalid API key" } }, "application/json").kind, "unauthorized");
    assert.equal(parseTtsStatus(402, { detail: { message: "quota" } }, "application/json").kind, "billing");
    assert.equal(parseTtsStatus(429, {}, "application/json").kind, "rate-limited");
  });
});

describe("ai-voice-cloning-studio — misc", () => {
  it("maps statuses and fetch errors", () => {
    assert.equal(mapHttpStatus(403), "unauthorized");
    assert.equal(mapHttpStatus(200), null);
    assert.equal(classifyFetchError("Failed to fetch"), "cors-blocked");
    assert.equal(classifyFetchError("timed out"), "timeout");
  });
  it("discloses CORS status, consent, and plan requirements", () => {
    const d = getDisclosures();
    assert.ok(d.some((x) => /CORS unverified/i.test(x)));
    assert.ok(d.some((x) => /consent|permission/i.test(x)));
    assert.ok(d.some((x) => /paid/i.test(x)));
  });
});
