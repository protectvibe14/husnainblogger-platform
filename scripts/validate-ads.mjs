#!/usr/bin/env node
/**
 * validate-ads.mjs — Zero-dependency Node CI gate for admin-pasted ad code.
 *
 * Ad code in data/ads-config.json is injected into public pages via
 * set:html in app/src/components/ads/AdSlot.astro — it executes with full
 * page privileges. This gate runs at build time (see "validate" script in
 * app/package.json) and FAILS (non-zero exit) on any enabled slot whose code:
 *
 *   1. Loads a remote resource (<script>/<iframe>/<img>/<link> src|href) from
 *      a host NOT on the ad-network allowlist below.
 *   2. Contains a javascript: URI anywhere.
 *   3. Contains an inline event-handler attribute (onload=, onclick=,
 *      onerror=, …).
 *   4. Contains <object>, <embed>, or <form> tags.
 *
 * Slots that are disabled or have empty code are skipped (pass).
 * Trust model: docs/security/ADS_TRUST_MODEL.md
 *
 * Exit codes: 0 = all slots pass, 1 = validation errors, 2 = usage/file problem.
 * No dependencies — runs on any Node >= 16.
 *
 * Usage: node scripts/validate-ads.mjs [path/to/ads-config.json]
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Ad-network hosts permitted in slot code. Bare entries are exact hosts;
// "*.x" entries match any subdomain of x (suffix match).
const ALLOWLIST = [
  "pagead2.googlesyndication.com",
  "*.googlesyndication.com",
  "*.googleadservices.com",
  "*.doubleclick.net",
  "*.amazon-adsystem.com",
  "*.media.net",
  "*.quantserve.com",
];

function hostAllowed(host) {
  const h = host.toLowerCase().replace(/\.$/, "");
  for (const entry of ALLOWLIST) {
    if (entry.startsWith("*.")) {
      const suffix = entry.slice(2);
      if (h === suffix || h.endsWith("." + suffix)) return true;
    } else if (h === entry.toLowerCase()) {
      return true;
    }
  }
  return false;
}

// Extract URLs from src/href attributes on script, iframe, img, link tags.
function extractRemoteUrls(code) {
  const urls = [];
  const tagRe =
    /<(script|iframe|img|link)\b[^>]*?\b(src|href)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  let m;
  while ((m = tagRe.exec(code)) !== null) {
    urls.push({ tag: m[1].toLowerCase(), url: m[3] ?? m[4] ?? m[5] });
  }
  return urls;
}

function hostnameOf(url) {
  const m = /^\s*(?:https?:)?\/\/([^/?#\s"'>]+)/i.exec(url);
  return m ? m[1] : null;
}

function validateSlot(key, slot) {
  const errors = [];
  const code = String(slot.code ?? "");

  // 1. javascript: URIs anywhere
  if (/javascript\s*:/i.test(code)) {
    errors.push("javascript: URI found");
  }

  // 2. Inline event-handler attributes (onload=, onclick=, onerror=, ...)
  //    Matches `on<word>=` inside a tag, e.g. <img src="x" onerror="…">
  if (/<[a-z][^>]*?\s(on[a-z]+)\s*=/i.test(code)) {
    errors.push("inline event-handler attribute found");
  }

  // 3. <object> / <embed> / <form> tags
  for (const tag of ["object", "embed", "form"]) {
    if (new RegExp(`<\\s*${tag}\\b`, "i").test(code)) {
      errors.push(`<${tag}> tag not allowed`);
    }
  }

  // 4. Remote URL hosts must be allowlisted (script, iframe, img, link)
  for (const { tag, url } of extractRemoteUrls(code)) {
    const host = hostnameOf(url);
    if (host && !hostAllowed(host)) {
      errors.push(`<${tag}> loads "${url}" — host not on ad-network allowlist`);
    }
  }

  return errors;
}

function main() {
  const root = dirname(fileURLToPath(import.meta.url));
  const configPath = process.argv[2]
    ? resolve(process.argv[2])
    : resolve(root, "..", "data", "ads-config.json");

  let config;
  try {
    config = JSON.parse(readFileSync(configPath, "utf8"));
  } catch (e) {
    console.error(`validate-ads: cannot read ${configPath}: ${e.message}`);
    return 2;
  }

  const slots = config.slots ?? {};
  let failed = 0;
  let checked = 0;
  let skipped = 0;

  for (const [key, slot] of Object.entries(slots)) {
    if (!slot || slot.enabled !== true || !String(slot.code ?? "").trim()) {
      console.log(`[SKIP] ${key} — disabled or empty code`);
      skipped++;
      continue;
    }
    checked++;
    const errors = validateSlot(key, slot);
    if (errors.length === 0) {
      console.log(`[PASS] ${key}`);
    } else {
      failed++;
      console.log(`[FAIL] ${key}`);
      for (const e of errors) console.log(`       ${e}`);
    }
  }

  console.log(
    `validate-ads: ${checked} checked, ${skipped} skipped, ${failed} failed`
  );
  if (failed > 0) {
    console.log("RESULT: FAIL — ad code validation failed.");
    return 1;
  }
  console.log("RESULT: PASS — ad code is valid.");
  return 0;
}

process.exit(main());
