/**
 * lib/ai/types.ts — shared contracts for AI-lane tools (toolType "ai").
 *
 * Owner: AI-TOOLS coordinator (2026-10-01). Pure TypeScript types only —
 * safe to import from logic.ts? NO: logic.ts keeps its zero-import rule,
 * so per-tool logic files re-declare the small slices they need.
 * These types are for client.ts modules, the AiToolTemplate, and _ai-runtime.
 */

/** The four AI lanes (see data/ai-tools-final-list.md). */
export type AiLane = "A" | "B" | "C" | "D";

/** CORS posture of a provider for direct browser fetch calls. */
export type CorsStatus =
  | "verified" // documented or precedented browser-app usage (e.g. OpenRouter)
  | "likely" // docs target browser JS / known ACAO:* (e.g. HF Inference, Gemini)
  | "unverified" // no evidence either way — client must degrade gracefully
  | "proxy-recommended"; // vendor officially recommends a server proxy (fal.ai)

/** Human-facing metadata for one key-based provider. Pure data. */
export interface AiProviderInfo {
  /** Stable id, e.g. "openrouter". Used as the localStorage key suffix. */
  id: string;
  /** Display name, e.g. "OpenRouter". */
  name: string;
  /** Where the user gets a key (linked in the key-vault UI). */
  keyUrl: string;
  /** Provider docs URL (linked in disclosures). */
  docsUrl: string;
  cors: CorsStatus;
  /** One-line CORS note shown in the key-vault UI when relevant. */
  corsNote: string;
  /** Honest free-tier description, e.g. "Free tier, no credit card". */
  freeTier: string;
  /** Cost/limit disclosure shown next to the key field. */
  costNote: string;
  /** Where the freeTier/costNote claims were verified. */
  source: string;
  /** YYYY-MM-DD the claims were last verified. */
  sourceDate: string;
}

/** One client-side model backing a Lane A tool. */
export interface AiModelInfo {
  /** Hugging Face repo id, e.g. "briaai/RMBG-1.4". */
  id: string;
  /** transformers.js pipeline task, e.g. "image-segmentation". */
  task: string;
  /** Approximate download size in MB (shown before download). */
  sizeMb: number;
  /** Short license note, e.g. "BRIA AI — source-available, non-commercial". */
  license: string;
  /** Quantization to request, e.g. "q8". Omit for default. */
  dtype?: string;
  /** Extra notes for the UI, e.g. "28 voices, 24kHz WAV". */
  notes?: string;
}

/**
 * Authored per tool in meta.ts as `export const aiConfig`.
 * The AiToolTemplate renders disclosures server-side (SEO + honesty);
 * the client module receives the same object at mount time.
 */
export interface AiToolConfig {
  lane: AiLane;
  /** One honest capability line, e.g. "Runs entirely in your browser — no uploads." */
  headline: string;
  /** Lane A only. */
  models?: AiModelInfo[];
  /** Lanes B/D only: provider ids in priority order (see providers.ts). */
  providers?: string[];
  /** Cost / limit / honesty disclosures, rendered as a visible list. */
  disclosures: string[];
  /** Lane D no-key state headline. */
  noKeyHeadline?: string;
  /** Lane D no-key state body (what the user must do). */
  noKeyBody?: string;
}

/** Context handed to a tool's client.ts mount function. */
export interface AiClientContext {
  categorySlug: string;
  slug: string;
  config: AiToolConfig;
  /** The <div data-ai-mount> element the client owns. */
  mountEl: HTMLElement;
  /** Resolve a provider's stored key (null when absent). */
  getKey: (providerId: string) => string | null;
  /** Resolve provider metadata by id. */
  getProvider: (providerId: string) => AiProviderInfo | undefined;
}

/** Shape every tool client.ts must export. */
export interface AiClientModule {
  /**
   * Mount the tool UI into ctx.mountEl. May be async.
   * Return an optional cleanup function.
   */
  mountAiTool(
    ctx: AiClientContext,
  ): void | Promise<void> | (() => void) | Promise<() => void>;
}

/** Narrowed fetch error kinds the client UI maps to human messages. */
export type AiFetchErrorKind =
  | "no-key"
  | "cors-blocked"
  | "unauthorized"
  | "rate-limited"
  | "billing"
  | "bad-request"
  | "server-error"
  | "network"
  | "timeout"
  | "unknown";

/** Normalized provider-call outcome produced by pure parseResponse helpers. */
export interface AiCallOutcome {
  ok: boolean;
  kind?: AiFetchErrorKind;
  /** Human message for the UI (already user-safe, no raw dumps). */
  message?: string;
  /** Normalized payload for the tool (text, imageUrl, audioUrl, ...). */
  data?: Record<string, unknown>;
}
