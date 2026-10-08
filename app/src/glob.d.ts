/**
 * Minimal ImportMeta.glob typing for tsc (Vite/Astro build-time API).
 * The real types come from vite/client at Astro build time; this keeps
 * `tsc -p tsconfig.tools.json` green without the vite package installed.
 */
interface ImportMeta {
  glob(pattern: string): Record<string, () => Promise<unknown>>;
  glob<T = unknown>(
    pattern: string,
    options: { eager: true },
  ): Record<string, T>;
}
