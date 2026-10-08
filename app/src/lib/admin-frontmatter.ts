/**
 * lib/admin-frontmatter.ts — frontmatter parse/stringify for the admin panel.
 * Owner: Admin.
 *
 * Minimal YAML-subset handling for blog post frontmatter:
 *   title, description, date, category, image, draft, tags
 * Runs in the browser; no dependencies.
 */

export interface BlogFrontmatter {
  title: string;
  description: string;
  date: string;
  category: string;
  image: string;
  draft: boolean;
  tags: string[];
  noindex: boolean;
}

const FIELDS: (keyof BlogFrontmatter)[] = [
  "title",
  "description",
  "date",
  "category",
  "image",
  "draft",
  "tags",
  "noindex",
];

/** Split "---\nfrontmatter\n---\nbody" into { frontmatter, body }. */
export function splitPost(text: string): { frontmatter: BlogFrontmatter; body: string } {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  const fm: BlogFrontmatter = {
    title: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    category: "",
    image: "",
    draft: false,
    tags: [],
    noindex: false,
  };
  if (!m) return { frontmatter: fm, body: text };
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (!(FIELDS as string[]).includes(key)) continue;
    if (key === "draft" || key === "noindex") {
      (fm as any)[key] = val === "true";
    } else if (key === "tags") {
      // tags: [a, b] or tags: []
      const inner = val.replace(/^\[|\]$/g, "").trim();
      fm.tags = inner ? inner.split(",").map((t) => t.trim().replace(/^"|"$/g, "")) : [];
    } else {
      // strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      (fm as any)[key] = val;
    }
  }
  return { frontmatter: fm, body: m[2] };
}

/** Build the full markdown file text from frontmatter + body. */
export function buildPost(fm: BlogFrontmatter, body: string): string {
  const q = (s: string) => `"${s.replace(/"/g, '\\"')}"`;
  const lines = [
    "---",
    `title: ${q(fm.title)}`,
    `description: ${q(fm.description)}`,
    `date: "${fm.date}"`,
    `category: ${q(fm.category)}`,
    `image: ${q(fm.image)}`,
    `draft: ${fm.draft}`,
    `noindex: ${fm.noindex}`,
    `tags: [${fm.tags.map((t) => `"${t}"`).join(", ")}]`,
    "---",
    "",
    body.trim() + "\n",
  ];
  return lines.join("\n");
}

/** Slug from title: lowercase, spaces→dashes, strip special chars. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}
