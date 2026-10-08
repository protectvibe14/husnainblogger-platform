/**
 * Profile Grid Planner — pure logic (tool-206), zero imports, zero network,
 * zero DOM, no Math.random.
 *
 * WHAT THIS MODULE HONESTLY IS: pure computation that the interactive
 * planner template calls with the user's planned posts. It validates the
 * 9-slot grid state, maps slots to rows/columns, estimates image data size,
 * and produces a printable/exportable summary. It does NOT render a grid,
 * does NOT do drag-and-drop, and does NOT touch localStorage — those are
 * the DOM template's job. The honestyNote from the spec applies:
 * "Fully client-side visual planner. Images stored as dataURLs in
 * localStorage (quota limits apply, warn user)."
 *
 * Storage math: typical browser localStorage quota is ~5 MB (labeled as an
 * ESTIMATE — actual quota varies by browser/device). A base64 dataURL
 * decodes to roughly (length - prefixLength) * 3/4 bytes.
 *
 * Slots: 0..8, left-to-right, top-to-bottom. row = floor(slot/3)+1,
 * col = (slot%3)+1.
 */

export const GRID_SIZE = 3;
export const SLOT_COUNT = 9;
export const MAX_CAPTION_LENGTH = 2200; // Instagram caption limit
export const LOCAL_STORAGE_QUOTA_BYTES = 5 * 1024 * 1024; // ~5 MB, ESTIMATE
export const STORAGE_WARN_RATIO = 0.9; // warn at 90% of the estimated quota

const DATA_URL_RE = /^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/;

export interface PlannedPostInput {
  slot: number;
  imageRef: string;
  captionDraft: string;
}

export interface GridCell {
  slot: number;
  row: number;
  col: number;
  hasImage: boolean;
  captionPreview: string;
  /** Estimated decoded bytes of the imageRef dataURL (0 when no image). */
  estimatedBytes: number;
}

export interface GridPlanResult {
  cells: GridCell[];
  filledSlots: number;
  emptySlots: number[];
  rowsComplete: number;
  totalImageBytes: number;
  /** Human-readable storage estimate, e.g. "~1.2 MB of ~5 MB estimated quota". */
  storageEstimate: string;
  storageWarning: string | null;
  balanceNotes: string[];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/** Approximate decoded bytes of a base64 dataURL. Returns 0 for empty refs. */
export function estimateDataUrlBytes(imageRef: string): number {
  if (!imageRef) return 0;
  const comma = imageRef.indexOf(",");
  const b64 = comma >= 0 ? imageRef.slice(comma + 1) : imageRef;
  return Math.floor((b64.length * 3) / 4);
}

function toInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.trim());
    if (Number.isFinite(n)) return Math.trunc(n);
  }
  return null;
}

function parsePlannedPosts(raw: unknown): PlannedPostInput[] | { error: string } {
  if (raw === undefined || raw === null) {
    return { error: "Planned posts are required. Paste your planned-post JSON into the input box." };
  }
  let parsed: unknown;
  if (typeof raw === "string") {
    if (raw.trim() === "") return [];
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {
        error:
          "Planned posts is not valid JSON. Use an array like: [{\"slot\": 0, \"imageRef\": \"\", \"captionDraft\": \"Launch day\"}].",
      };
    }
  } else {
    parsed = raw;
  }
  if (!Array.isArray(parsed)) {
    return { error: "Planned posts must be a JSON array of post objects." };
  }
  const seen = new Set<number>();
  const posts: PlannedPostInput[] = [];
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i] as Record<string, unknown>;
    if (typeof item !== "object" || item === null) {
      return { error: `Item ${i + 1} is not an object. Each post needs {slot, imageRef, captionDraft}.` };
    }
    const slot = toInteger(item.slot);
    if (slot === null || slot < 0 || slot > SLOT_COUNT - 1) {
      return { error: `Item ${i + 1}: slot must be a whole number from 0 to 8.` };
    }
    if (seen.has(slot)) {
      return { error: `Item ${i + 1}: slot ${slot} is used twice. Each slot holds one post.` };
    }
    seen.add(slot);
    const imageRef = item.imageRef === undefined || item.imageRef === null ? "" : String(item.imageRef);
    if (imageRef !== "" && !DATA_URL_RE.test(imageRef)) {
      return {
        error: `Item ${i + 1}: imageRef must be a valid image dataURL (data:image/...;base64,...) or empty for a placeholder.`,
      };
    }
    const captionDraft =
      item.captionDraft === undefined || item.captionDraft === null ? "" : String(item.captionDraft);
    if (captionDraft.length > MAX_CAPTION_LENGTH) {
      return {
        error: `Item ${i + 1}: caption is ${captionDraft.length} characters — Instagram captions max out at ${MAX_CAPTION_LENGTH}.`,
      };
    }
    posts.push({ slot, imageRef, captionDraft });
  }
  return posts;
}

function captionPreview(caption: string): string {
  const t = caption.trim();
  if (!t) return "—";
  return t.length > 40 ? t.slice(0, 37) + "..." : t;
}

export function planGrid(posts: PlannedPostInput[]): GridPlanResult {
  const bySlot = new Map<number, PlannedPostInput>();
  for (const p of posts) bySlot.set(p.slot, p);

  const cells: GridCell[] = [];
  const emptySlots: number[] = [];
  let totalImageBytes = 0;
  const rowFill = [0, 0, 0];
  for (let slot = 0; slot < SLOT_COUNT; slot++) {
    const post = bySlot.get(slot);
    const row = Math.floor(slot / GRID_SIZE) + 1;
    const col = (slot % GRID_SIZE) + 1;
    const bytes = post ? estimateDataUrlBytes(post.imageRef) : 0;
    totalImageBytes += bytes;
    if (post) rowFill[row - 1]++;
    else emptySlots.push(slot);
    cells.push({
      slot,
      row,
      col,
      hasImage: Boolean(post && post.imageRef !== ""),
      captionPreview: post ? captionPreview(post.captionDraft) : "—",
      estimatedBytes: bytes,
    });
  }

  const filledSlots = SLOT_COUNT - emptySlots.length;
  const rowsComplete = rowFill.filter((n) => n === GRID_SIZE).length;

  const ratio = totalImageBytes / LOCAL_STORAGE_QUOTA_BYTES;
  const storageEstimate =
    `~${formatBytes(totalImageBytes)} of image data vs an estimated ~5 MB localStorage quota ` +
    `(~${Math.round(ratio * 100)}% used — quota is an estimate, it varies by browser).`;
  let storageWarning: string | null = null;
  if (totalImageBytes > LOCAL_STORAGE_QUOTA_BYTES) {
    storageWarning =
      "Estimated image data EXCEEDS the typical ~5 MB localStorage limit. The planner keeps the plan in memory only " +
      "and warns instead of crashing — compress your images or drop some before saving. (Spec edge case: localStorage full → warn, keep in-memory.)";
  } else if (totalImageBytes > LOCAL_STORAGE_QUOTA_BYTES * STORAGE_WARN_RATIO) {
    storageWarning =
      "Estimated image data is near the typical ~5 MB localStorage limit. Compress images or plan fewer photo slots " +
      "before saving, so the plan stays in memory safely.";
  }

  const balanceNotes: string[] = [];
  if (filledSlots === 0) {
    balanceNotes.push("No posts yet — every slot renders as an empty placeholder in the preview.");
  } else {
    for (let r = 0; r < GRID_SIZE; r++) {
      const filled = rowFill[r];
      if (filled === 2) {
        balanceNotes.push(`Row ${r + 1} has one empty slot — it shows as a placeholder gap in the preview.`);
      } else if (filled === 1) {
        balanceNotes.push(
          `Row ${r + 1} is mostly empty — check how its single post reads against the empty placeholders beside it.`,
        );
      }
    }
    if (rowsComplete === GRID_SIZE) {
      balanceNotes.push("All three rows are full — the 3x3 grid is complete.");
    }
    balanceNotes.push("Empty slots render as placeholders (spec edge case) — they are gaps, not deleted posts.");
  }
  if (storageWarning) balanceNotes.push(storageWarning);

  return {
    cells,
    filledSlots,
    emptySlots,
    rowsComplete,
    totalImageBytes,
    storageEstimate,
    storageWarning,
    balanceNotes,
  };
}

/**
 * Template entry point. values.plannedPosts: JSON string (or array) of
 * [{slot, imageRef, captionDraft}].
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const parsed = parsePlannedPosts(values.plannedPosts);
  if (!Array.isArray(parsed)) return { ok: false, error: parsed.error };

  const result = planGrid(parsed);

  const gridPreview = {
    columns: ["Slot", "Row", "Col", "Image", "Caption"],
    rows: result.cells.map((c) => [
      String(c.slot + 1),
      String(c.row),
      String(c.col),
      c.hasImage ? "Image" : "Placeholder",
      c.captionPreview,
    ]),
  };

  const reorderState = JSON.stringify(
    result.cells.map((c) => ({
      slot: c.slot,
      row: c.row,
      col: c.col,
      hasImage: c.hasImage,
      estimatedBytes: c.estimatedBytes,
    })),
    null,
    2,
  );

  const summaryLines = [
    `Grid: ${result.filledSlots}/9 slots filled, ${result.emptySlots.length} placeholder(s), ${result.rowsComplete}/3 rows complete.`,
    `Storage: ${result.storageEstimate}`,
    ...result.balanceNotes.map((n) => `Note: ${n}`),
    "Honesty: this summary is pure computation — the interactive template handles drag-and-drop and saving.",
  ];

  return {
    ok: true,
    values: {
      gridPreview,
      reorderState,
      summary: summaryLines.join("\n"),
    },
  };
}
