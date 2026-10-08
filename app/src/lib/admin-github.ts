/**
 * lib/admin-github.ts — GitHub Contents API client for the admin panel.
 * Owner: Admin.
 *
 * Runs 100% in the browser. The token is the admin's own fine-grained
 * PAT (repo-scoped), pasted at login and kept in localStorage — it never
 * touches our servers. All writes commit directly to the repo; Vercel
 * auto-deploys from git, so the site updates within a minute or two.
 */
import { REPO_OWNER, REPO_NAME, REPO_BRANCH } from "./admin-config";

const API = "https://api.github.com";

function token(): string {
  const t = localStorage.getItem("hb_admin_token");
  if (!t) throw new Error("Not logged in.");
  return t;
}

async function gh(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

const repoPath = (p: string) =>
  `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${p}?ref=${REPO_BRANCH}`;

/** Validate the token by reading the repo. Used at login. */
export async function validateToken(t: string): Promise<string> {
  const res = await fetch(`${API}/repos/${REPO_OWNER}/${REPO_NAME}?ref=${REPO_BRANCH}`, {
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${t}` },
  });
  if (!res.ok) throw new Error("Token invalid or repo not accessible.");
  const data = await res.json();
  return data.full_name as string;
}

/** List files in a repo directory. */
export async function listDir(dir: string): Promise<{ name: string; path: string; sha: string }[]> {
  const data = await gh(repoPath(dir));
  return (Array.isArray(data) ? data : []).map((f: any) => ({
    name: f.name,
    path: f.path,
    sha: f.sha,
  }));
}

/** Read a file's text content (base64-decoded). Returns { content, sha }. */
export async function readFile(path: string): Promise<{ content: string; sha: string }> {
  const data = await gh(repoPath(path));
  const b64 = (data.content as string).replace(/\n/g, "");
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return { content: new TextDecoder().decode(bytes), sha: data.sha as string };
}

function toB64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

/** Create or update a file. Pass sha when updating (null for new files).
 *  Set rawBase64=true when content is already base64 (e.g. image upload). */
export async function writeFile(
  path: string,
  content: string,
  message: string,
  sha: string | null,
  rawBase64 = false,
): Promise<void> {
  await gh(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: rawBase64 ? content : toB64(content),
      branch: REPO_BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
}

/** Delete a file. */
export async function deleteFile(path: string, sha: string, message: string): Promise<void> {
  await gh(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${REPO_BRANCH}`, {
    method: "DELETE",
    body: JSON.stringify({ message, sha, branch: REPO_BRANCH }),
  });
}
