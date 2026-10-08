/**
 * registry.ts — barrel over the registry module.
 *
 * FOLDER_STRUCTURE.md references `app/src/lib/registry.ts` as the typed
 * accessor layer; the implementation lives in `app/src/lib/registry/`
 * (types + loader/queries + validator + template map). This barrel keeps
 * both import styles working with zero duplication.
 */
export * from "./registry/index.ts";
export * from "./registry/types.ts";
export * from "./registry/template-map.ts";
