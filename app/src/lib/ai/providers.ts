/**
 * lib/ai/providers.ts — pure provider registry for AI-lane tools.
 *
 * Pure data + tiny pure helpers. Imported by tool client.ts modules and the
 * AiToolTemplate's island script. NEVER import from logic.ts (zero-import rule).
 *
 * CORS statuses were verified 2026-10-01 from public docs/index sources:
 * - OpenRouter: "verified" — browser apps call it directly (lazy-imagen-openrouter
 *   precedent); docs show HTTP-Referer/X-Title browser headers.
 * - Gemini: "likely" — Google documents browser API-key usage (?key=).
 * - HF Inference: "likely" — HF docs target browser JS; community browser demos exist.
 * - Groq: "likely" — OpenAI-compatible; SDK has dangerouslyAllowBrowser flag.
 * - ElevenLabs: "unverified" — mixed evidence; one browser project works in
 *   practice, one issue report suspects blocked CORS. Client must degrade gracefully.
 * - fal.ai: "proxy-recommended" — official docs recommend a server proxy;
 *   direct browser use is possible per fal-js README but not recommended.
 * - Hive: "unverified".
 * - llm7.io: "likely" — keyless OpenAI-compatible gateway (no SLA, community-run).
 *
 * Cost/limit claims carry source + sourceDate per the honesty contract.
 */

import type { AiProviderInfo } from "./types.ts";

export const AI_PROVIDERS: Record<string, AiProviderInfo> = {
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    keyUrl: "https://openrouter.ai/keys",
    docsUrl: "https://openrouter.ai/docs/api-reference/overview",
    cors: "verified",
    corsNote: "OpenRouter supports direct browser calls; send HTTP-Referer and X-Title headers.",
    freeTier: "Free account; some models are free, most image models are pay-per-use.",
    costNote:
      "Image models cost real money (roughly $0.05–$0.10 per image, billed in output tokens). Charges go to YOUR OpenRouter account.",
    source: "openrouter.ai/docs + community browser-app precedent (2026)",
    sourceDate: "2026-10-01",
  },
  "hf-inference": {
    id: "hf-inference",
    name: "Hugging Face Inference",
    keyUrl: "https://huggingface.co/settings/tokens",
    docsUrl: "https://huggingface.co/docs/inference-providers/index",
    cors: "likely",
    corsNote:
      "Hugging Face documents browser JavaScript usage; if your browser blocks the call you will see a clear error.",
    freeTier: "Free account includes a small amount of inference credit (about $0.10/month).",
    costNote:
      "Usage draws from YOUR Hugging Face credits. FLUX.1-schnell text-to-image is available on the free allowance at low volume.",
    source: "huggingface.co/docs/inference-providers (2026)",
    sourceDate: "2026-10-01",
  },
  falai: {
    id: "falai",
    name: "fal.ai",
    keyUrl: "https://fal.ai/dashboard/keys",
    docsUrl: "https://docs.fal.ai/model-endpoints/",
    cors: "proxy-recommended",
    corsNote:
      "fal.ai officially recommends calling through your own server proxy. Direct browser calls may be blocked by CORS — this tool will tell you if that happens.",
    freeTier: "Pay-as-you-go; new accounts include a small free credit.",
    costNote:
      "Every generation bills YOUR fal.ai account per second/model pricing. Video generation is the most expensive category.",
    source: "fal-ai/fal-js README + docs.fal.ai (2026)",
    sourceDate: "2026-10-01",
  },
  elevenlabs: {
    id: "elevenlabs",
    name: "ElevenLabs",
    keyUrl: "https://elevenlabs.io/app/settings/api-keys",
    docsUrl: "https://elevenlabs.io/docs/api-reference/text-to-speech",
    cors: "unverified",
    corsNote:
      "Browser calls with a user key work in practice for several projects, but ElevenLabs does not document browser support — if blocked, you will see a clear error.",
    freeTier: "Free tier includes about 10,000 credits/month (roughly 10 minutes of audio).",
    costNote:
      "Voice cloning requires a paid plan on most tiers. Usage bills YOUR ElevenLabs account.",
    source: "elevenlabs.io/docs + community evidence (2026)",
    sourceDate: "2026-10-01",
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini (AI Studio)",
    keyUrl: "https://aistudio.google.com/apikey",
    docsUrl: "https://ai.google.dev/gemini-api/docs",
    cors: "likely",
    corsNote:
      "Google documents browser API-key usage for Gemini; the key is sent as a ?key= query parameter.",
    freeTier: "Generous free tier, no credit card: Flash models allow thousands of requests/day.",
    costNote:
      "Free-tier quotas apply to YOUR Google AI Studio project. This tool never sees your key beyond your browser.",
    source: "ai.google.dev/gemini-api/docs (2026)",
    sourceDate: "2026-10-01",
  },
  groq: {
    id: "groq",
    name: "Groq",
    keyUrl: "https://console.groq.com/keys",
    docsUrl: "https://console.groq.com/docs",
    cors: "likely",
    corsNote:
      "Groq is OpenAI-compatible and supports browser usage; if blocked you will see a clear error.",
    freeTier: "Free tier, no credit card, with per-minute and per-day caps.",
    costNote: "Usage counts against YOUR Groq free-tier quotas.",
    source: "console.groq.com/docs (2026)",
    sourceDate: "2026-10-01",
  },
  hive: {
    id: "hive",
    name: "Hive AI",
    keyUrl: "https://hivemoderation.com/api",
    docsUrl: "https://docs.hivemoderation.com/reference",
    cors: "unverified",
    corsNote:
      "Browser support is not documented — if your browser blocks the call you will see a clear error.",
    freeTier: "Demo access available; paid plans for volume.",
    costNote: "Detection calls bill YOUR Hive account.",
    source: "docs.hivemoderation.com (2026)",
    sourceDate: "2026-10-01",
  },
  llm7: {
    id: "llm7",
    name: "llm7.io (keyless demo lane)",
    keyUrl: "https://dash.llm7.io",
    docsUrl: "https://llm7.io/docs",
    cors: "likely",
    corsNote: "OpenAI-compatible keyless gateway; community-run with no SLA.",
    freeTier: "Anonymous: ~10 req/min, 60/hour. No key needed.",
    costNote:
      "Free community service with no uptime guarantee — a convenience fallback, not infrastructure.",
    source: "community probe reports (2026-09)",
    sourceDate: "2026-10-01",
  },
};

export function getProviderInfo(id: string): AiProviderInfo | undefined {
  return AI_PROVIDERS[id];
}

/** True when the provider needs an explicit warning in the key-vault UI. */
export function needsCorsWarning(id: string): boolean {
  const p = AI_PROVIDERS[id];
  return !!p && (p.cors === "unverified" || p.cors === "proxy-recommended");
}
