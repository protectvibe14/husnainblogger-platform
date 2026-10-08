import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getProviders,
  detectFormat,
  scanImageBytes,
  validateImageFile,
  buildHiveRequest,
  parseHiveResponse,
  getDisclosures,
  mapHttpStatus,
  classifyFetchError,
  providerErrorMessage,
  HIVE_URL,
  HIVE_MODEL,
  HIVE_MEDIA_FIELD,
} from "./logic.ts";

// --- byte-array builders ----------------------------------------------------

function jpegSegment(marker: number, payload: string): number[] {
  const bytes: number[] = [];
  for (const c of payload) bytes.push(c.charCodeAt(0));
  const len = bytes.length + 2;
  return [0xff, marker, (len >> 8) & 0xff, len & 0xff, ...bytes];
}

function jpeg(...segments: number[][]): Uint8Array {
  return new Uint8Array([0xff, 0xd8, ...segments.flat(), 0xff, 0xd9]);
}

function pngChunk(type: string, payload: number[]): number[] {
  const len = payload.length;
  return [
    (len >>> 24) & 0xff,
    (len >>> 16) & 0xff,
    (len >>> 8) & 0xff,
    len & 0xff,
    ...[...type].map((c) => c.charCodeAt(0)),
    ...payload,
    0, 0, 0, 0, // CRC placeholder (not verified by scanner)
  ];
}

function png(...chunks: number[][]): Uint8Array {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  return new Uint8Array([...sig, ...chunks.flat()]);
}

function str(s: string): number[] {
  return [...s].map((c) => c.charCodeAt(0));
}

describe("ai-image-detector — format detection", () => {
  it("is hive only", () => {
    assert.deepEqual(getProviders(), ["hive"]);
  });
  it("detects jpeg/png/webp/unknown", () => {
    assert.equal(detectFormat(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])), "jpeg");
    assert.equal(detectFormat(png()), "png");
    assert.equal(detectFormat(new Uint8Array([...str("RIFF"), 0, 0, 0, 0, ...str("WEBP")])), "webp");
    assert.equal(detectFormat(new Uint8Array([1, 2, 3, 4])), "unknown");
    assert.equal(detectFormat(new Uint8Array([])), "unknown");
  });
});

describe("ai-image-detector — JPEG forensics", () => {
  it("finds EXIF in APP1", () => {
    const r = scanImageBytes(jpeg(jpegSegment(0xe1, "Exif\0\0II*\0")));
    assert.equal(r.format, "jpeg");
    assert.ok(r.signals.some((s) => s.id === "exif"), JSON.stringify(r.signals));
  });
  it("finds XMP in APP1", () => {
    const r = scanImageBytes(jpeg(jpegSegment(0xe1, "http://ns.adobe.com/xap/1.0/\0<x:xmpmeta/>")));
    assert.ok(r.signals.some((s) => s.id === "xmp"));
  });
  it("finds C2PA in APP11", () => {
    const r = scanImageBytes(jpeg(jpegSegment(0xeb, "JUMBF\0" + "jumb" + "c2pa")));
    assert.ok(r.signals.some((s) => s.id === "c2pa"));
  });
  it("finds Adobe metadata in APP13", () => {
    const r = scanImageBytes(jpeg(jpegSegment(0xed, "Photoshop 3.0\0" + "8BIM")));
    assert.ok(r.signals.some((s) => s.id === "adobe"));
  });
  it("reports no-metadata for a JPEG with no APP segments", () => {
    const r = scanImageBytes(jpeg(jpegSegment(0xdb, "DQTdata")));
    assert.ok(r.signals.some((s) => s.id === "no-metadata"));
  });
  it("does not report no-metadata when APP segments exist", () => {
    const r = scanImageBytes(jpeg(jpegSegment(0xe0, "JFIF\0")));
    assert.ok(!r.signals.some((s) => s.id === "no-metadata"));
    assert.deepEqual(r.signals, []);
  });
  it("dedupes repeated signals", () => {
    const r = scanImageBytes(jpeg(jpegSegment(0xe1, "Exif\0\0a"), jpegSegment(0xe1, "Exif\0\0b")));
    assert.equal(r.signals.filter((s) => s.id === "exif").length, 1);
  });
});

describe("ai-image-detector — PNG forensics", () => {
  it("finds tEXt and iTXt chunks", () => {
    const r = scanImageBytes(png(pngChunk("tEXt", str("Comment\0hi"))));
    assert.equal(r.format, "png");
    assert.ok(r.signals.some((s) => s.id === "png-text"));
  });
  it("finds eXIf and c2pa chunks", () => {
    const r = scanImageBytes(png(pngChunk("eXIf", str("II*\0")), pngChunk("c2pa", str("data"))));
    assert.ok(r.signals.some((s) => s.id === "exif"));
    assert.ok(r.signals.some((s) => s.id === "c2pa"));
  });
  it("finds no signals in a clean PNG", () => {
    const r = scanImageBytes(png(pngChunk("IHDR", new Array(13).fill(0)), pngChunk("IEND", [])));
    assert.deepEqual(r.signals, []);
  });
});

describe("ai-image-detector — WebP forensics", () => {
  function webp(...chunks: Array<[string, number[]]>): Uint8Array {
    const body: number[] = [];
    for (const [fourcc, data] of chunks) {
      body.push(...str(fourcc), data.length & 0xff, (data.length >> 8) & 0xff, (data.length >> 16) & 0xff, (data.length >> 24) & 0xff, ...data);
      if (data.length % 2) body.push(0);
    }
    return new Uint8Array([...str("RIFF"), 0, 0, 0, 0, ...str("WEBP"), ...body]);
  }
  it("finds EXIF and XMP chunks", () => {
    const r = scanImageBytes(webp(["EXIF", str("II*\0")], ["XMP ", str("<x/>")]));
    assert.equal(r.format, "webp");
    assert.ok(r.signals.some((s) => s.id === "exif"));
    assert.ok(r.signals.some((s) => s.id === "xmp"));
  });
  it("finds no signals in a plain VP8 webp", () => {
    const r = scanImageBytes(webp(["VP8 ", str("data")]));
    assert.deepEqual(r.signals, []);
  });
});

describe("ai-image-detector — unrecognized files", () => {
  it("returns the unrecognized signal for unknown bytes", () => {
    const r = scanImageBytes(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]));
    assert.equal(r.format, "unknown");
    assert.ok(r.signals.some((s) => s.id === "unrecognized"));
  });
});

describe("ai-image-detector — signal meanings never verdicts", () => {
  it("no meaning claims proof or a binary verdict", () => {
    const probes = [
      jpeg(jpegSegment(0xe1, "Exif\0\0x")),
      jpeg(jpegSegment(0xdb, "x")),
      png(pngChunk("tEXt", str("a\0b"))),
      new Uint8Array([9, 9, 9]),
    ];
    for (const p of probes) {
      for (const s of scanImageBytes(p).signals) {
        assert.match(s.meaning, /signal|not proof|never/i);
        assert.doesNotMatch(s.meaning, /definitely|is AI-generated|is real\b/i);
      }
    }
  });
});

describe("ai-image-detector — Hive request", () => {
  it("validates image files", () => {
    assert.equal(validateImageFile({ mimeType: "image/jpeg", sizeBytes: 100 }).ok, true);
    assert.equal(validateImageFile({ mimeType: "text/plain", sizeBytes: 100 }).ok, false);
    assert.equal(validateImageFile({ mimeType: "image/png", sizeBytes: 11 * 1024 * 1024 }).ok, false);
  });
  it("builds the multipart request with lowercase token header", () => {
    const req = buildHiveRequest({ key: "hive-key" });
    assert.equal(req.url, HIVE_URL);
    assert.equal(req.url, "https://api.thehive.ai/api/v2/task/sync");
    assert.equal(req.method, "POST");
    assert.equal(req.headers["authorization"], "token hive-key");
    assert.deepEqual(req.formFields, [HIVE_MEDIA_FIELD, "model"]);
    assert.deepEqual(req.body, { model: HIVE_MODEL });
  });
  it("parses the ai_generated / not_ai_generated scores", () => {
    const out = parseHiveResponse(200, {
      output: [
        { classes: [{ class: "ai_generated", score: 0.87 }, { class: "not_ai_generated", score: 0.13 }] },
      ],
    });
    assert.equal(out.ok, true);
    const scores = (out.data as Record<string, unknown>)["scores"] as Record<string, number>;
    assert.equal(scores["aiGenerated"], 0.87);
    assert.equal(scores["notAiGenerated"], 0.13);
  });
  it("maps Hive errors", () => {
    assert.equal(parseHiveResponse(401, { message: "Unauthorized" }).kind, "unauthorized");
    assert.equal(parseHiveResponse(429, {}).kind, "rate-limited");
    assert.equal(parseHiveResponse(200, { output: [] }).ok, false);
    assert.equal(parseHiveResponse(200, {}).ok, false);
  });
});

describe("ai-image-detector — misc", () => {
  it("maps statuses and fetch errors", () => {
    assert.equal(mapHttpStatus(200), null);
    assert.equal(classifyFetchError("Failed to fetch"), "cors-blocked");
    assert.equal(providerErrorMessage(null), null);
  });
  it("discloses signals-not-proof, unverified field, and Hive CORS", () => {
    const d = getDisclosures();
    assert.ok(d.some((x) => /not proof|signals/i.test(x)));
    assert.ok(d.some((x) => /'media'.*could not be verified|could not be verified.*"media"/i.test(x)));
    assert.ok(d.some((x) => /CORS unverified/i.test(x)));
  });
});
