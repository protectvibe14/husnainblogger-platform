/**
 * templates/_ai-runtime.ts — client-side loader for AI-lane tool modules.
 *
 * Pattern mirrors _tool-runtime.ts: per-tool `client.ts` files are discovered
 * with import.meta.glob and lazy-imported ONLY in the browser, so the SSR
 * build never executes DOM/fetch/transformers.js code.
 */

import type { AiClientContext, AiClientModule, AiToolConfig } from "../lib/ai/types.ts";
import { getKey } from "../lib/ai/key-vault.ts";
import { getProviderInfo } from "../lib/ai/providers.ts";

const clientModules = import.meta.glob("../../tools/*/*/client.ts");

type AiClientLoader = () => Promise<{ mountAiTool: AiClientModule["mountAiTool"] }>;

function lookupClient(categorySlug: string, slug: string): AiClientLoader | null {
  const key = `../../tools/${categorySlug}/${slug}/client.ts`;
  const loader = (clientModules as Record<string, AiClientLoader>)[key];
  return loader ?? null;
}

/**
 * Mount the AI tool living in [data-ai-mount]. Reads data-category, data-slug,
 * and the serialized data-ai-config attribute. Safe to call when the module
 * or config is missing — renders an honest fallback instead of throwing.
 */
export async function mountAiToolPage(root: HTMLElement): Promise<void> {
  const categorySlug = root.dataset.category ?? "";
  const slug = root.dataset.slug ?? "";
  let config: AiToolConfig | null = null;
  try {
    config = JSON.parse(root.dataset.aiConfig ?? "null") as AiToolConfig | null;
  } catch {
    config = null;
  }

  const loader = lookupClient(categorySlug, slug);
  if (!loader || !config) {
    root.innerHTML = "";
    const p = document.createElement("p");
    p.className = "hb-ai-fallback";
    p.textContent =
      "This interactive tool could not start in your browser. The guides, examples, and FAQs below still work — try reloading the page.";
    root.appendChild(p);
    return;
  }

  const ctx: AiClientContext = {
    categorySlug,
    slug,
    config,
    mountEl: root,
    getKey,
    getProvider: getProviderInfo,
  };

  try {
    const mod = await loader();
    if (typeof mod?.mountAiTool !== "function") throw new Error("missing mountAiTool export");
    await mod.mountAiTool(ctx);
  } catch (err) {
    root.innerHTML = "";
    const p = document.createElement("p");
    p.className = "hb-ai-fallback";
    p.textContent =
      `This tool failed to start: ${(err as Error)?.message ?? "unknown error"}. ` +
      "The guides and FAQs below still work — try reloading the page.";
    root.appendChild(p);
  }
}

/** Auto-mount every [data-ai-mount] region on the page. */
export function initAiTools(): void {
  const roots = document.querySelectorAll<HTMLElement>("[data-ai-mount]");
  roots.forEach((root) => {
    void mountAiToolPage(root);
  });
}
