/**
 * lib/admin-config.ts — admin panel configuration.
 * Owner: Admin.
 *
 * REPO_OWNER / REPO_NAME are set once the GitHub repo is created
 * (Phase 2). The admin panel reads/writes site content through the
 * GitHub Contents API using the token the admin pastes at login.
 */
export const REPO_OWNER = "protectvibe14";
export const REPO_NAME = "husnainblogger-platform";
export const REPO_BRANCH = "main";

/** Paths inside the repo that the admin manages. */
export const CONTENT_PATHS = {
  blogDir: "app/src/content/blog",
  toolsInventory: "data/tools-inventory.json",
  siteSettings: "data/site-settings.json",
} as const;
