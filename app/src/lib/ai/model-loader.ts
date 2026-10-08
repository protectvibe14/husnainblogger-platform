/**
 * lib/ai/model-loader.ts — lazy client-side model loading for Lane A tools.
 *
 * Browser-only. Loaded dynamically so the SSR build never touches
 * @huggingface/transformers or kokoro-js. All loads:
 * - prefer WebGPU when available, fall back to WASM
 * - report download progress (models are tens to hundreds of MB)
 * - cache via the Cache API / IndexedDB through transformers.js defaults,
 *   so repeat visits are offline-capable
 * - throw honest, user-readable errors on failure
 */

export interface ModelLoadProgress {
  /** 0..1 fraction of the current file, or -1 when unknown. */
  fraction: number;
  /** Human status line, e.g. "Downloading model weights (42 MB of 86 MB)…". */
  status: string;
  file: string;
}

export type ProgressCallback = (p: ModelLoadProgress) => void;

export interface LoadOptions {
  dtype?: string;
  device?: "webgpu" | "wasm";
  onProgress?: ProgressCallback;
}

/** True when the browser exposes WebGPU (Chrome/Edge 113+, Safari 26+). */
export async function detectWebGPU(): Promise<boolean> {
  try {
    if (typeof navigator === "undefined" || !("gpu" in navigator)) return false;
    const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu;
    if (!gpu) return false;
    const adapter = await gpu.requestAdapter();
    return !!adapter;
  } catch {
    return false;
  }
}

/**
 * Load a transformers.js pipeline in the browser.
 * @param task pipeline task, e.g. "image-segmentation"
 * @param model HF repo id, e.g. "briaai/RMBG-1.4"
 */
export async function loadPipeline(
  task: string,
  model: string,
  opts: LoadOptions = {},
): Promise<unknown> {
  const { pipeline, env } = await import("@huggingface/transformers");
  env.allowRemoteModels = true;

  const webgpu = opts.device === "webgpu" || (opts.device === undefined && (await detectWebGPU()));
  const device = webgpu ? "webgpu" : "wasm";
  const onProgress = opts.onProgress;

  if (onProgress) {
    onProgress({
      fraction: 0,
      status: webgpu
        ? "Starting download — WebGPU detected, using your GPU."
        : "Starting download — using CPU (WASM). This is slower but works everywhere.",
      file: model,
    });
  }

  const progress_callback = onProgress
    ? (info: Record<string, unknown>) => {
        if (info.status === "progress" && typeof info.progress === "number") {
          const loaded = typeof info.loaded === "number" ? info.loaded : 0;
          const total = typeof info.total === "number" ? info.total : 0;
          onProgress({
            fraction: info.progress / 100,
            status:
              total > 0
                ? `Downloading ${(info.file as string) ?? "model"} — ${formatMB(loaded)} of ${formatMB(total)}…`
                : `Downloading ${(info.file as string) ?? "model"}…`,
            file: String(info.file ?? model),
          });
        } else if (info.status === "done") {
          onProgress({ fraction: 1, status: `Ready — ${(info.file as string) ?? "model"} loaded.`, file: String(info.file ?? model) });
        } else if (info.status === "initiate") {
          onProgress({ fraction: 0, status: `Fetching ${(info.file as string) ?? "model"}…`, file: String(info.file ?? model) });
        }
      }
    : undefined;

  try {
    const pipe = await pipeline(task as never, model, {
      dtype: opts.dtype as never,
      device: device as never,
      progress_callback: progress_callback as never,
    });
    return pipe;
  } catch (err) {
    throw new Error(
      `Could not load the AI model "${model}" (${task}). ` +
        `Check your connection and try again — the model downloads once, then works offline. ` +
        `(${(err as Error)?.message ?? "unknown error"})`,
    );
  }
}

/**
 * Load the Kokoro TTS model (Lane A TTS tools).
 * Returns the KokoroTTS instance from kokoro-js.
 */
export async function loadKokoroTTS(opts: {
  modelId?: string;
  dtype?: string;
  onProgress?: ProgressCallback;
} = {}): Promise<unknown> {
  const { KokoroTTS } = await import("kokoro-js");
  const modelId = opts.modelId ?? "onnx-community/Kokoro-82M-v1.0-ONNX";
  const webgpu = await detectWebGPU();
  if (opts.onProgress) {
    opts.onProgress({
      fraction: 0,
      status: webgpu
        ? "Loading voice model (~86 MB, one-time download) — WebGPU detected."
        : "Loading voice model (~86 MB, one-time download) — CPU mode.",
      file: modelId,
    });
  }
  try {
    const tts = await KokoroTTS.from_pretrained(modelId, {
      dtype: (opts.dtype ?? "q8") as never,
      device: (webgpu ? "webgpu" : "wasm") as never,
    });
    if (opts.onProgress) opts.onProgress({ fraction: 1, status: "Voice model ready.", file: modelId });
    return tts;
  } catch (err) {
    throw new Error(
      `Could not load the voice model. Check your connection and try again — the ~86 MB download happens once, then voices work offline. ` +
        `(${(err as Error)?.message ?? "unknown error"})`,
    );
  }
}

export function formatMB(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 MB";
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Format a duration in seconds as mm:ss for audio UIs. */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
