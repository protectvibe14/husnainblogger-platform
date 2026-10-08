import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  convertPrompt,
  splitMjParams,
  resolveModelId,
  HONESTY_NOTE,
} from "./logic.ts";

describe("cross-model-prompt-converter", () => {
  it("MJ -> DALL-E 3: --ar becomes prose, --v is dropped with a reason", () => {
    const r = convertPrompt(
      "a red sports car at sunset --ar 16:9 --v 6",
      "midjourney",
      "dalle3",
    );
    assert.ok(r.convertedPrompt.includes("wide aspect ratio 16:9"));
    assert.ok(!r.convertedPrompt.includes("--v"));
    assert.ok(!r.convertedPrompt.includes("--ar"));
    const dropped = r.droppedParams.find((d) => d.param === "--v 6");
    assert.ok(dropped && dropped.reason.length > 0);
    assert.deepEqual(r.extractedParams, ["--ar 16:9", "--v 6"]);
  });

  it("MJ -> Flux: --tile becomes prose, --chaos is dropped", () => {
    const r = convertPrompt("floral pattern --tile --chaos 20", "midjourney", "flux");
    assert.ok(r.convertedPrompt.includes("seamless tileable pattern"));
    assert.ok(r.droppedParams.some((d) => d.param === "--chaos 20"));
    assert.ok(r.suggestions.some((s) => s.toLowerCase().includes("flux")));
  });

  it("MJ -> SDXL: --no becomes a negative-field suggestion", () => {
    const r = convertPrompt("portrait --no blurry, watermark", "midjourney", "sdxl");
    assert.ok(!r.convertedPrompt.includes("--no"));
    assert.ok(
      r.droppedParams.some((d) => d.reason.toLowerCase().includes("negative prompt field")),
    );
  });

  it("plain prose -> MJ: aspect hint suggests --ar", () => {
    const r = convertPrompt(
      "a wide panoramic mountain landscape",
      "dalle3",
      "midjourney",
    );
    assert.ok(r.convertedPrompt.includes("--ar 16:9"));
    assert.ok(r.suggestions.some((s) => s.includes("--ar 16:9")));
  });

  it("plain prose -> MJ: negative-sounding words suggest --no", () => {
    const r = convertPrompt("a clean studio photo, not blurry", "flux", "midjourney");
    assert.ok(r.suggestions.some((s) => s.includes("--no")));
  });

  it("non-MJ -> non-MJ: stray MJ params stripped", () => {
    const r = convertPrompt("a cat --ar 1:1", "flux", "dalle3");
    assert.ok(!r.convertedPrompt.includes("--ar"));
    assert.ok(r.droppedParams.length === 1);
  });

  it("splitMjParams separates prose from params", () => {
    const [prose, params] = splitMjParams("sunset --ar 16:9 --style raw");
    assert.equal(prose, "sunset");
    assert.deepEqual(params, ["--ar 16:9", "--style raw"]);
  });

  it("resolveModelId handles labels and ids", () => {
    assert.equal(resolveModelId("Midjourney"), "midjourney");
    assert.equal(resolveModelId("DALL-E 3"), "dalle3");
    assert.equal(resolveModelId("sdxl"), "sdxl");
    assert.equal(resolveModelId("nope"), null);
  });

  it("happy path via runTool includes the honesty note", () => {
    const r = runTool({
      prompt: "a lighthouse --ar 3:2",
      fromModel: "Midjourney",
      toModel: "Flux",
    });
    assert.equal(r.ok, true);
    const v = r.values as Record<string, unknown>;
    assert.equal(v["honestyNote"], HONESTY_NOTE);
    assert.equal(v["fromModel"], "Midjourney");
    assert.equal(v["toModel"], "Flux");
    assert.ok(typeof v["convertedPrompt"] === "string");
  });

  it("validation: missing prompt -> error", () => {
    assert.equal(
      runTool({ fromModel: "Midjourney", toModel: "Flux" }).ok,
      false,
    );
  });

  it("validation: same source and target -> error", () => {
    const r = runTool({
      prompt: "a cat",
      fromModel: "Flux",
      toModel: "Flux",
    });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("validation: unknown model -> error", () => {
    const r = runTool({
      prompt: "a cat",
      fromModel: "Nope",
      toModel: "Flux",
    });
    assert.equal(r.ok, false);
  });

  it("validation: oversized prompt -> error", () => {
    const r = runTool({
      prompt: "a".repeat(2001),
      fromModel: "Midjourney",
      toModel: "SDXL",
    });
    assert.equal(r.ok, false);
  });

  it("determinism: same inputs twice -> identical output", () => {
    const args = {
      prompt: "a robot --ar 16:9 --v 6",
      fromModel: "Midjourney",
      toModel: "DALL-E 3",
    };
    assert.deepEqual(runTool(args), runTool(args));
  });
});
