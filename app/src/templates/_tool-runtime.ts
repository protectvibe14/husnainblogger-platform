/**
 * _tool-runtime.ts — shared client-side wiring for all 10 tool templates.
 *
 * Owner: MA1-Templates. Framework-free vanilla TypeScript, zero dependencies
 * beyond app/src/lib/validation and app/src/lib/state/urlState.
 *
 * What it does (so templates don't re-implement it):
 *  - builds a validation Schema from ToolInput[] (registry-driven)
 *  - collects form data, validates, renders inline errors + error summary
 *    (a11y §4.1: focus to summary when >=2 errors, to the field when 1)
 *  - calls the tool's run() (the TOOL LOGIC SLOT) and renders outputs
 *    by OutputKind (text/number/currency/percent/list/table/copy/download)
 *  - copy-to-clipboard (unique names, polite announce, failure fallback),
 *    download (txt/csv/json), reset, share-link (?s= state), examples
 *  - focus management (results heading on success, first field on reset)
 *  - announce via the shell's shared live regions (never invents its own)
 *  - ToolErrorBoundary-compatible: mount() never throws; failures render
 *    the template's [data-tool-fallback] block with retry.
 *
 * DOM contract with the Design-System Field component (normative — the DS
 * agent implements it; the runtime only queries it):
 *  - [data-field="<id>"]            wrapper
 *  - [data-field-input="<id>"]      the native control (name="<id>")
 *  - [data-field-error="<id>"]      error <p>, empty when valid
 *  - [data-field-hint="<id>"]       hint <p> (optional)
 * The runtime toggles aria-invalid and appends the error id to
 * aria-describedby; it never re-renders the Field itself.
 */

import {
  validateObject,
  type FieldSchema,
  type Schema,
} from '../lib/validation/index.ts';
import {
  buildShareLink,
  parseToolStateFromQuery,
} from '../lib/state/urlState.ts';
import type {
  ToolInput,
  ToolOutput,
} from '../lib/registry/types.ts';
import type { ToolRunFn, ToolRunResult, ToolRunValues } from './types.ts';
import { TOOL_EVENTS, setAnalyticsContext, trackEvent } from './_analytics.ts';

// ---------------------------------------------------------------------------
// Schema building (registry ToolInput -> validation Schema)
// ---------------------------------------------------------------------------

function controlToField(input: ToolInput): FieldSchema {
  const v = input.validation ?? {};
  const base: FieldSchema = {
    type: 'string',
    label: input.label,
    required: input.required === true,
  };
  if (v.min !== undefined) base.min = v.min;
  if (v.max !== undefined) base.max = v.max;
  if (v.sanitize !== undefined) base.sanitize = v.sanitize;
  if (v.pattern) {
    try {
      base.pattern = new RegExp(v.pattern);
    } catch {
      /* invalid pattern in registry data: ignore, validator flags it */
    }
  }
  switch (input.type) {
    case 'number':
      base.type = 'number';
      break;
    case 'select':
      base.type = 'enum';
      base.enumValues = input.options ?? [];
      break;
    case 'textarea':
    case 'text':
      base.type = 'string';
      break;
    case 'boolean':
      base.type = 'boolean';
      break;
    case 'date':
      base.type = 'string';
      if (!base.pattern) base.pattern = /^\d{4}-\d{2}-\d{2}$/;
      base.messages = {
        ...(base.messages ?? {}),
        pattern: `${input.label} must be a valid date.`,
      };
      break;
    case 'url':
      base.type = 'url';
      break;
    default:
      base.type = 'string';
  }
  return base;
}

/** Build a validation Schema from the tool's registry inputs. */
export function buildSchema(inputs: ToolInput[]): Schema {
  const schema: Schema = {};
  for (const input of inputs) schema[input.id] = controlToField(input);
  return schema;
}

// ---------------------------------------------------------------------------
// Announce helpers (shared live regions owned by ToolShell)
// ---------------------------------------------------------------------------

function ensureLiveRegions(): { polite: HTMLElement; assertive: HTMLElement } {
  let polite = document.getElementById('hb-live-polite');
  let assertive = document.getElementById('hb-live-assertive');
  if (!polite) {
    polite = document.createElement('div');
    polite.id = 'hb-live-polite';
    polite.setAttribute('role', 'status');
    polite.setAttribute('aria-live', 'polite');
    polite.className = 'hb-visually-hidden';
    document.body.prepend(polite);
  }
  if (!assertive) {
    assertive = document.createElement('div');
    assertive.id = 'hb-live-assertive';
    assertive.setAttribute('role', 'alert');
    assertive.setAttribute('aria-live', 'assertive');
    assertive.className = 'hb-visually-hidden';
    document.body.prepend(assertive);
  }
  return { polite, assertive };
}

export function announcePolite(message: string): void {
  const { polite } = ensureLiveRegions();
  polite.textContent = '';
  requestAnimationFrame(() => {
    polite.textContent = message;
  });
}

export function announceAssertive(message: string): void {
  const { assertive } = ensureLiveRegions();
  assertive.textContent = '';
  requestAnimationFrame(() => {
    assertive.textContent = message;
  });
}

// ---------------------------------------------------------------------------
// Formatting (USD-first per locked product rules; en-US)
// ---------------------------------------------------------------------------

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
const num = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

export function formatOutputValue(
  value: unknown,
  kind: ToolOutput['type'],
): string {
  if (value === null || value === undefined) return '—';
  switch (kind) {
    case 'currency': {
      const n = Number(value);
      return Number.isFinite(n) ? usd.format(n) : String(value);
    }
    case 'percent': {
      const n = Number(value);
      return Number.isFinite(n) ? `${num.format(n)}%` : String(value);
    }
    case 'number': {
      const n = Number(value);
      return Number.isFinite(n) ? num.format(n) : String(value);
    }
    default:
      // Arrays in a scalar slot: format each item readably (objects become
      // key: value pairs, not "[object Object]").
      if (Array.isArray(value)) {
        if (value.length === 0) return '—';
        return value
          .map((item) =>
            typeof item === 'object' && item !== null
              ? Object.entries(item as Record<string, unknown>)
                  .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
                  .join(', ')
              : String(item),
          )
          .join('\n');
      }
      // Plain objects (e.g. {stopwords: 64}) must not render as
      // "[object Object]" — format as readable key: value pairs.
      if (typeof value === 'object' && !Array.isArray(value)) {
        const entries = Object.entries(value as Record<string, unknown>);
        if (entries.length === 0) return '—';
        return entries
          .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
          .join(', ');
      }
      return String(value);
  }
}

// ---------------------------------------------------------------------------
// Mount options
// ---------------------------------------------------------------------------

export interface ToolMountOptions {
  /** CSS selector or element of the [data-tool-root] container. */
  root: string | HTMLElement;
  toolId: string;
  toolName: string;
  toolType: string;
  /** Registry inputs (templates fall back to DEMO_INPUTS when empty). */
  inputs: ToolInput[];
  /** Registry outputs (templates fall back to demo outputs when empty). */
  outputs: ToolOutput[];
  /**
   * ===== TOOL LOGIC SLOT =====
   * MA2: replace the demo function with an adapter over
   * app/tools/<category>/<slug>/logic.ts. Same signature, no other
   * template changes needed.
   */
  run: ToolRunFn;
  /** Heading text for the results region, e.g. "Generated hashtags". */
  resultHeading?: string;
  /** Value prop shown above results; defaults to tool description. */
  resultIntro?: string;
  /** Pre-run hook (e.g. tracker persistence). Return false to cancel. */
  onBeforeRun?: (values: ToolRunValues) => boolean | Promise<boolean>;
  /** Optional async confirm before reset (wires DS ConfirmDialog). */
  confirmReset?: () => Promise<boolean>;
  /** Download formats offered for text/list/table results. */
  downloadFormats?: Array<'txt' | 'csv' | 'json'>;
  /** Extra CSS class hooks for the results container. */
  resultsClass?: string;
}

interface MountedTool {
  root: HTMLElement;
  form: HTMLFormElement;
  results: HTMLElement;
  resultsHeading: HTMLElement;
  summary: HTMLElement;
  options: ToolMountOptions;
  schema: Schema;
  lastResult: ToolRunResult | null;
  lastValues: ToolRunValues | null;
}

// ---------------------------------------------------------------------------
// Form data collection
// ---------------------------------------------------------------------------

function collectFormData(
  form: HTMLFormElement,
  inputs: ToolInput[],
): Record<string, unknown> {
  const data = new FormData(form);
  const out: Record<string, unknown> = {};
  for (const input of inputs) {
    const el = form.querySelector(
      `[data-field-input="${CSS.escape(input.id)}"]`,
    ) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
    if (!el) {
      const raw = data.get(input.id);
      out[input.id] = raw === null ? '' : raw;
      continue;
    }
    if (input.type === 'boolean') {
      out[input.id] = (el as HTMLInputElement).checked === true;
    } else {
      out[input.id] = el.value;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Media-input lane (2026-10-01, batch-20).
//
// Tools that analyze user media (audio waveform, video frames) declare
// `type: "file"` inputs. The browser MUST decode the file — there is no
// way to do this in pure logic.ts — so the runtime decodes client-side
// (Web Audio API for audio, <video> + canvas for frame capture) and hands
// runTool a plain JSON-serializable descriptor. Files never leave the device.
//
// runTool contract for media tools:
//   audio: { kind: "audio", fileName, fileSizeMB, sampleRate, durationSec,
//            channels, samples: number[] (mono, mean-pooled) }
//   video frame: { kind: "videoFrame", fileName, fileSizeMB, timestampSec
//            (actual captured ts, clamped), width, height, dataUrl }
// ---------------------------------------------------------------------------

export interface AudioMediaValue {
  kind: 'audio';
  fileName: string;
  fileSizeMB: number;
  /** Effective sample rate AFTER downsampling (see MAX_MEDIA_SAMPLES). */
  sampleRate: number;
  durationSec: number;
  channels: number;
  /** Mono mix, mean-pooled when the source exceeds MAX_MEDIA_SAMPLES. */
  samples: number[];
}

export interface VideoFrameMediaValue {
  kind: 'videoFrame';
  fileName: string;
  fileSizeMB: number;
  /** Actual captured timestamp (requested ts clamped to [0, duration]). */
  timestampSec: number;
  width: number;
  height: number;
  dataUrl: string;
}

export type MediaValue = AudioMediaValue | VideoFrameMediaValue;

/** Upper bound on decoded mono samples handed to runTool (~4M ≈ 90s @44.1k). */
const MAX_MEDIA_SAMPLES = 4_000_000;
/** Hard cap on decoded audio duration (seconds) — decode is memory-bound. */
const MAX_AUDIO_DURATION_SEC = 20 * 60;

let sharedAudioCtx: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!sharedAudioCtx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) throw new Error('Web Audio API is not available in this browser.');
    sharedAudioCtx = new AC();
  }
  if (sharedAudioCtx.state === 'suspended') void sharedAudioCtx.resume();
  return sharedAudioCtx;
}

/** Average channels to mono; mean-pool down to MAX_MEDIA_SAMPLES. */
function monoAndDownsample(
  channels: Float32Array[],
  sampleRate: number,
): { samples: number[]; sampleRate: number } {
  const n = channels[0].length;
  const mono = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (const ch of channels) sum += ch[i] ?? 0;
    mono[i] = sum / channels.length;
  }
  const factor = Math.max(1, Math.ceil(n / MAX_MEDIA_SAMPLES));
  if (factor === 1) return { samples: Array.from(mono), sampleRate };
  const outLen = Math.ceil(n / factor);
  const out = new Array<number>(outLen);
  for (let i = 0; i < outLen; i++) {
    let sum = 0;
    const start = i * factor;
    const end = Math.min(n, start + factor);
    for (let j = start; j < end; j++) sum += mono[j] ?? 0;
    out[i] = sum / (end - start);
  }
  return { samples: out, sampleRate: sampleRate / factor };
}

async function decodeAudioFile(file: File): Promise<AudioMediaValue> {
  const ctx = getAudioContext();
  const buf = await file.arrayBuffer();
  let decoded: AudioBuffer;
  try {
    decoded = await ctx.decodeAudioData(buf);
  } catch {
    throw new Error(
      'Could not decode that audio file. Try WAV, MP3, M4A, or OGG.',
    );
  }
  if (!Number.isFinite(decoded.duration) || decoded.duration <= 0) {
    throw new Error('That audio file has no decodable audio stream.');
  }
  if (decoded.duration > MAX_AUDIO_DURATION_SEC) {
    throw new Error(
      `Audio is ${Math.round(decoded.duration / 60)} min long — this tool handles up to 20 minutes. Trim the file and try again.`,
    );
  }
  const channels: Float32Array[] = [];
  for (let c = 0; c < decoded.numberOfChannels; c++) {
    channels.push(decoded.getChannelData(c));
  }
  const { samples, sampleRate } = monoAndDownsample(channels, decoded.sampleRate);
  return {
    kind: 'audio',
    fileName: file.name,
    fileSizeMB: Math.round((file.size / 1048576) * 10) / 10,
    sampleRate: Math.round(sampleRate),
    durationSec: Math.round(decoded.duration * 100) / 100,
    channels: decoded.numberOfChannels,
    samples,
  };
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = window.setTimeout(() => reject(new Error(label)), ms);
    p.then(
      (v) => { window.clearTimeout(t); resolve(v); },
      (e) => { window.clearTimeout(t); reject(e); },
    );
  });
}

async function captureVideoFrame(
  file: File,
  timestampSec: number,
  outputSize: string,
): Promise<VideoFrameMediaValue> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = url;
    await withTimeout(
      new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('not a playable video file'));
      }),
      15000,
      'Timed out loading that video file.',
    );
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error('Could not read that video file.');
    }
    const ts = Math.min(Math.max(timestampSec || 0, 0), Math.max(0, duration - 0.05));
    await withTimeout(
      new Promise<void>((resolve, reject) => {
        video.onseeked = () => resolve();
        video.onerror = () => reject(new Error('seek failed'));
        video.currentTime = ts;
      }),
      15000,
      'Timed out seeking in that video file.',
    );
    let w = video.videoWidth;
    let h = video.videoHeight;
    if (outputSize === '1080p' && h > 1080) {
      w = Math.round((w * 1080) / h); h = 1080;
    } else if (outputSize === '720p' && h > 720) {
      w = Math.round((w * 720) / h); h = 720;
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const g = canvas.getContext('2d');
    if (!g) throw new Error('Canvas is not available in this browser.');
    g.drawImage(video, 0, 0, w, h);
    return {
      kind: 'videoFrame',
      fileName: file.name,
      fileSizeMB: Math.round((file.size / 1048576) * 10) / 10,
      timestampSec: Math.round(ts * 100) / 100,
      width: w,
      height: h,
      dataUrl: canvas.toDataURL('image/png'),
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Decode every `type: "file"` input. Returns media descriptors keyed by
 * input id plus per-field errors. File inputs are EXCLUDED from the
 * validateObject schema (see mountTool) — presence/size/decode checks live
 * here so error copy can be media-specific.
 */
async function processFileInputs(
  tool: MountedTool,
  raw: Record<string, unknown>,
): Promise<{
  values: Record<string, MediaValue>;
  errors: Record<string, string[]>;
}> {
  const values: Record<string, MediaValue> = {};
  const errors: Record<string, string[]> = {};
  const fileInputs = tool.options.inputs.filter((i) => i.type === 'file');
  for (const input of fileInputs) {
    const el = tool.form.querySelector(
      `[data-field-input="${CSS.escape(input.id)}"]`,
    ) as HTMLInputElement | null;
    const file = el?.files?.[0] ?? null;
    if (!file) {
      if (input.required) {
        errors[input.id] = [`Please choose ${articleFor(input.label)} ${input.label.toLowerCase()}.`];
      }
      continue;
    }
    const maxMB = input.maxFileMB ?? 200;
    if (file.size > maxMB * 1048576) {
      errors[input.id] = [
        `${input.label} is ${Math.round(file.size / 1048576)} MB — the limit is ${maxMB} MB.`,
      ];
      continue;
    }
    try {
      if (input.mediaKind === 'audio') {
        values[input.id] = await decodeAudioFile(file);
      } else if (input.mediaKind === 'video') {
        const tsRaw = input.frameAtInputId ? raw[input.frameAtInputId] : 0;
        const ts = typeof tsRaw === 'number' ? tsRaw : Number(tsRaw ?? 0);
        const sizeRaw = input.frameSizeInputId ? raw[input.frameSizeInputId] : 'original';
        values[input.id] = await captureVideoFrame(
          file,
          Number.isFinite(ts) ? ts : 0,
          typeof sizeRaw === 'string' ? sizeRaw : 'original',
        );
      } else {
        errors[input.id] = [
          `${input.label}: this tool's file type is not configured correctly.`,
        ];
      }
    } catch (err) {
      errors[input.id] = [
        err instanceof Error ? err.message : 'Could not read that file.',
      ];
    }
  }
  return { values, errors };
}

function articleFor(label: string): string {
  return /^[aeiou]/i.test(label.trim()) ? 'an' : 'a';
}

// ---------------------------------------------------------------------------
// Error rendering (inline + summary, a11y §4.1)
// ---------------------------------------------------------------------------

function clearFieldErrors(root: HTMLElement, inputs: ToolInput[]): void {
  for (const input of inputs) {
    const id = CSS.escape(input.id);
    const control = root.querySelector(
      `[data-field-input="${id}"]`,
    ) as HTMLElement | null;
    const errEl = root.querySelector(`[data-field-error="${id}"]`);
    if (control) {
      control.removeAttribute('aria-invalid');
      const hint = root.querySelector(`[data-field-hint="${id}"]`);
      const describedBy: string[] = [];
      if (hint?.id) describedBy.push(hint.id);
      if (describedBy.length) control.setAttribute('aria-describedby', describedBy.join(' '));
      else control.removeAttribute('aria-describedby');
    }
    if (errEl) {
      const textEl = errEl.querySelector('[data-field-error-text]');
      if (textEl) textEl.textContent = '';
      else errEl.textContent = '';
      errEl.setAttribute('hidden', '');
    }
  }
}

function renderFieldErrors(
  tool: MountedTool,
  errors: Record<string, string[]>,
): void {
  const { root, inputs } = { root: tool.root, inputs: tool.options.inputs };
  clearFieldErrors(root, inputs);
  const inputById = new Map(inputs.map((i) => [i.id, i]));
  for (const [path, messages] of Object.entries(errors)) {
    const fieldId = path.split('.')[0].split('[')[0];
    const input = inputById.get(fieldId);
    if (!input) continue;
    const id = CSS.escape(input.id);
    const control = root.querySelector(
      `[data-field-input="${id}"]`,
    ) as HTMLElement | null;
    const errEl = root.querySelector(`[data-field-error="${id}"]`);
    const message = messages[0] ?? 'This field is invalid.';
    if (errEl) {
      const textEl = errEl.querySelector('[data-field-error-text]');
      if (textEl) textEl.textContent = message;
      else errEl.textContent = message;
      errEl.removeAttribute('hidden');
    }
    if (control) {
      control.setAttribute('aria-invalid', 'true');
      const hint = root.querySelector(`[data-field-hint="${id}"]`);
      const parts: string[] = [];
      if (hint?.id) parts.push(hint.id);
      if (errEl?.id) parts.push(errEl.id);
      else if (errEl) {
        errEl.id = `hb-err-${tool.options.toolId}-${input.id}`;
        parts.push(errEl.id);
      }
      control.setAttribute('aria-describedby', parts.join(' '));
    }
  }
}

function renderErrorSummary(
  tool: MountedTool,
  errors: Record<string, string[]>,
): void {
  const { summary, options } = tool;
  const entries = Object.entries(errors);
  if (entries.length < 2) {
    summary.hidden = true;
    summary.innerHTML = '';
    return;
  }
  const inputById = new Map(options.inputs.map((i) => [i.id, i]));
  const items = entries
    .map(([path, messages]) => {
      const fieldId = path.split('.')[0].split('[')[0];
      const input = inputById.get(fieldId);
      const label = input?.label ?? fieldId;
      const anchor = input ? `#field-${options.toolId}-${input.id}` : '#';
      return `<li><a href="${anchor}" data-error-jump="${fieldId}">${escapeHtml(label)}: ${escapeHtml(messages[0] ?? 'Invalid value')}</a></li>`;
    })
    .join('');
  summary.innerHTML =
    `<h2 class="hb-error-summary__title" tabindex="-1" data-summary-title>` +
    `There are ${entries.length} problems</h2>` +
    `<ul class="hb-error-summary__list">${items}</ul>`;
  summary.hidden = false;
  summary.setAttribute('role', 'alert');
  const title = summary.querySelector('[data-summary-title]') as HTMLElement | null;
  title?.focus();
  // summary links move focus to the field (a11y §3.10)
  summary.querySelectorAll('[data-error-jump]').forEach((a) => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const fid = (a as HTMLElement).getAttribute('data-error-jump') ?? '';
      const control = tool.root.querySelector(
        `[data-field-input="${CSS.escape(fid)}"]`,
      ) as HTMLElement | null;
      control?.focus();
    });
  });
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------------
// Output rendering by OutputKind
// ---------------------------------------------------------------------------

/** Exported for builder/tracker templates, which render their own results. */
export function copyButtonHtml(what: string, targetSelector: string): string {
  return (
    `<button type="button" class="hb-btn hb-btn--secondary hb-copy-btn" ` +
    `data-copy data-copy-what="${escapeHtml(what)}" ` +
    `data-copy-source="${escapeHtml(targetSelector)}" ` +
    `data-analytics-event="${TOOL_EVENTS.COPY}" data-analytics-what="${escapeHtml(what)}" ` +
    `aria-label="Copy ${escapeHtml(what)} to clipboard">Copy</button>`
  );
}

function renderScalarRow(
  output: ToolOutput,
  value: unknown,
  toolId: string,
): string {
  const targetId = `hb-result-${toolId}-${output.id}`;
  return (
    `<div class="hb-result-row">` +
    `<dt class="hb-result-row__label">${escapeHtml(output.label)}</dt>` +
    `<dd class="hb-result-row__value" id="${targetId}" style="white-space:pre-wrap;overflow-wrap:anywhere">${escapeHtml(formatOutputValue(value, output.type))}</dd>` +
    `<dd class="hb-result-row__actions">${copyButtonHtml(output.label, `#${targetId}`)}</dd>` +
    (output.description
      ? `<p class="hb-result-row__desc">${escapeHtml(output.description)}</p>`
      : '') +
    `</div>`
  );
}

/**
 * Render a download-type output as a summary row. The file buttons live in
 * the actions bar; this row tells the user what the download contains.
 */
function renderDownloadRow(
  output: ToolOutput,
  value: unknown,
  toolId: string,
): string {
  const targetId = `hb-result-${toolId}-${output.id}`;
  let summary = formatListItem(value);
  if (summary.length > 300) summary = summary.slice(0, 297) + '…';
  return (
    `<div class="hb-result-row">` +
    `<dt class="hb-result-row__label">${escapeHtml(output.label)}</dt>` +
    `<dd class="hb-result-row__value" id="${targetId}">${escapeHtml(summary || 'Ready to download — use the buttons below.')}</dd>` +
    `</div>`
  );
}

/**
 * Format a list-output item for display. List outputs are usually string[],
 * but some tools return structured rows ({ label, amount } etc.). String()
 * on those renders "[object Object]", so format objects as readable text.
 */
function formatListItem(item: unknown): string {
  if (item === null || item === undefined) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'number' || typeof item === 'boolean') return String(item);
  if (Array.isArray(item)) return item.map(formatListItem).join(', ');
  if (typeof item === 'object') {
    const rec = item as Record<string, unknown>;
    // Common shapes: { label, amount|value|text|detail }, { title, ... }, { name, ... }
    const labelKeys = ['label', 'title', 'name', 'heading', 'text'];
    const valueKeys = ['amount', 'value', 'detail', 'description', 'content'];
    const labelKey = labelKeys.find((k) => rec[k] !== undefined && rec[k] !== null);
    const valueKey = valueKeys.find((k) => rec[k] !== undefined && rec[k] !== null);
    if (labelKey && valueKey && labelKey !== valueKey) {
      return `${formatListItem(rec[labelKey])}: ${formatListItem(rec[valueKey])}`;
    }
    if (labelKey) return formatListItem(rec[labelKey]);
    // Fallback: key: value pairs, one level deep.
    return Object.entries(rec)
      .map(([k, v]) => `${k}: ${formatListItem(v)}`)
      .join(' · ');
  }
  return String(item);
}

function renderListOutput(
  output: ToolOutput,
  items: string[],
  toolId: string,
): string {
  // Drop blank items so we never render empty list markers.
  const clean = items.filter((s) => s.trim().length > 0);
  const listId = `hb-result-${toolId}-${output.id}`;
  const lis = clean
    .map((item, i) => {
      const itemId = `${listId}-item-${i}`;
      return (
        `<li class="hb-result-list__item"><span id="${itemId}">${escapeHtml(item)}</span> ` +
        copyButtonHtml(`${output.label} item ${i + 1}`, `#${itemId}`) +
        `</li>`
      );
    })
    .join('');
  return (
    `<div class="hb-result-block">` +
    `<div class="hb-result-block__head"><h3 class="hb-result-block__title">${escapeHtml(output.label)}</h3>` +
    copyButtonHtml(`all ${output.label}`, `#${listId}`) +
    `</div>` +
    `<ol class="hb-result-list" id="${listId}" style="white-space:pre-wrap;overflow-wrap:anywhere">${lis}</ol>` +
    `</div>`
  );
}

function renderTableOutput(
  output: ToolOutput,
  table: { columns: string[]; rows: string[][] },
  toolId: string,
): string {
  const tableId = `hb-result-${toolId}-${output.id}`;
  const head = table.columns
    .map((c) => `<th scope="col">${escapeHtml(c)}</th>`)
    .join('');
  const body = table.rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`,
    )
    .join('');
  return (
    `<div class="hb-result-block">` +
    `<div class="hb-result-block__head"><h3 class="hb-result-block__title">${escapeHtml(output.label)}</h3></div>` +
    `<div class="hb-table-wrap" role="region" aria-label="${escapeHtml(output.label)} table" tabindex="0">` +
    `<table class="hb-table" id="${tableId}"><caption class="hb-visually-hidden">${escapeHtml(output.label)}</caption>` +
    `<thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>` +
    `</div>`
  );
}

/**
 * Exported for builder/tracker templates: renders download + share buttons
 * for a result snapshot. Wire with wireResultActions().
 */
export function resultActionsHtml(
  formats: Array<'txt' | 'csv' | 'json'>,
  withShare: boolean,
): string {
  const actions: string[] = [];
  for (const fmt of formats) {
    actions.push(
      `<button type="button" class="hb-btn hb-btn--secondary" data-download ` +
        `data-download-format="${fmt}" ` +
        `data-analytics-event="${TOOL_EVENTS.DOWNLOAD}" data-analytics-format="${fmt}" ` +
        `aria-label="Download results as ${fmt.toUpperCase()}">Download ${fmt.toUpperCase()}</button>`,
    );
  }
  if (withShare) {
    actions.push(
      `<button type="button" class="hb-btn hb-btn--secondary" data-action="share" ` +
        `data-analytics-event="${TOOL_EVENTS.SHARE}">Copy share link</button>`,
    );
  }
  return actions.length
    ? `<div class="hb-result-actions">${actions.join('')}</div>`
    : '';
}

export interface ResultSnapshot {
  toolId: string;
  toolName: string;
  outputs: ToolOutput[];
  values: Record<string, unknown>;
  /** Flat input values for the share-link state (primitives only). */
  shareState?: Record<string, string | number | boolean>;
}

function resultsToPlainText(
  outputs: ToolOutput[],
  values: Record<string, unknown>,
): string {
  const lines: string[] = [];
  for (const output of outputs) {
    const v = values[output.id];
    if (v === undefined) continue;
    lines.push(`${output.label}:`);
    if (Array.isArray(v)) {
      for (const item of v) lines.push(`- ${String(item)}`);
    } else if (typeof v === 'object' && v !== null && 'columns' in v) {
      const t = v as { columns: string[]; rows: string[][] };
      lines.push(t.columns.join(' | '));
      for (const row of t.rows) lines.push(row.join(' | '));
    } else {
      lines.push(formatOutputValue(v, output.type));
    }
    lines.push('');
  }
  return lines.join('\n').trim();
}

function resultsToCsv(
  outputs: ToolOutput[],
  values: Record<string, unknown>,
): string {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const lines: string[] = [];
  for (const output of outputs) {
    const v = values[output.id];
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      lines.push(esc(output.label));
      for (const item of v) lines.push(esc(String(item)));
    } else if (typeof v === 'object' && v !== null && 'columns' in v) {
      const t = v as { columns: string[]; rows: string[][] };
      lines.push(t.columns.map(esc).join(','));
      for (const row of t.rows) lines.push(row.map(esc).join(','));
    } else {
      lines.push(`${esc(output.label)},${esc(formatOutputValue(v, output.type))}`);
    }
  }
  return lines.join('\n');
}

/**
 * Normalize a table output value. Accepts the canonical { columns, rows }
 * shape and the common array-of-objects shape (columns derived from keys).
 * Returns null when the value is not tabular.
 */
function normalizeTableValue(
  v: unknown,
): { columns: string[]; rows: string[][] } | null {
  if (typeof v !== 'object' || v === null) return null;
  if ('columns' in (v as Record<string, unknown>)) {
    const rec = v as Record<string, unknown>;
    if (Array.isArray(rec.columns) && Array.isArray(rec.rows)) {
      return {
        columns: rec.columns.map(String),
        rows: (rec.rows as unknown[][]).map((r) =>
          (Array.isArray(r) ? r : [r]).map((c) => formatListItem(c)),
        ),
      };
    }
    return null;
  }
  if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && v[0] !== null) {
    const columns = Object.keys(v[0] as Record<string, unknown>);
    return {
      columns,
      rows: (v as Array<Record<string, unknown>>).map((row) =>
        columns.map((c) => formatListItem(row[c])),
      ),
    };
  }
  return null;
}

export function renderResults(
  tool: MountedTool,
  result: ToolRunResult,
): void {
  const { results, resultsHeading, options } = tool;
  const outputs = options.outputs;
  const values = result.values ?? {};

  let html = '';
  const dlRows: string[] = [];
  for (const output of outputs) {
    const v = values[output.id];
    if (v === undefined) continue;
    if (output.type === 'list' && Array.isArray(v)) {
      html += renderListOutput(output, v.map(formatListItem), options.toolId);
    } else if (output.type === 'table' && typeof v === 'object' && v !== null) {
      // Accept both { columns, rows } and array-of-objects shapes.
      const table = normalizeTableValue(v);
      if (table) {
        html += renderTableOutput(output, table, options.toolId);
      } else {
        dlRows.push(renderScalarRow(output, v, options.toolId));
      }
    } else if (output.type === 'download') {
      // Download outputs: show a summary row so the results area is not
      // empty; the actual file buttons render in the actions bar below.
      dlRows.push(renderDownloadRow(output, v, options.toolId));
    } else {
      dlRows.push(renderScalarRow(output, v, options.toolId));
    }
  }
  if (dlRows.length) html = `<dl class="hb-result-grid">${dlRows.join('')}</dl>` + html;

  // actions bar: download + share
  const formats = options.downloadFormats ?? defaultDownloadFormats(outputs);
  html += resultActionsHtml(formats, true);

  results.innerHTML =
    `<h2 class="hb-results__title" tabindex="-1" data-results-heading>` +
    `${escapeHtml(options.resultHeading ?? 'Results')}</h2>` +
    (options.resultIntro
      ? `<p class="hb-results__intro">${escapeHtml(options.resultIntro)}</p>`
      : '') +
    html;
  results.hidden = false;
  tool.resultsHeading =
    results.querySelector('[data-results-heading]') as HTMLElement;
}

function defaultDownloadFormats(outputs: ToolOutput[]): Array<'txt' | 'csv' | 'json'> {
  const kinds = new Set(outputs.map((o) => o.type));
  if (kinds.has('table') || kinds.has('list')) return ['csv', 'txt', 'json'];
  return ['txt', 'json'];
}

// ---------------------------------------------------------------------------
// Clipboard + download
// ---------------------------------------------------------------------------

async function copyText(text: string, what: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function fallbackSelect(selector: string): void {
  const el = document.querySelector(selector);
  if (!el) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

/** Standalone copy handler — works for any template via wireResultActions. */
export async function handleCopyClick(btn: HTMLElement): Promise<void> {
  const what = btn.getAttribute('data-copy-what') ?? 'result';
  const source = btn.getAttribute('data-copy-source');
  const text =
    btn.getAttribute('data-copy-text') ??
    (source ? (document.querySelector(source)?.textContent ?? '') : '');
  if (!text.trim()) {
    announceAssertive('Nothing to copy yet.');
    return;
  }
  const ok = await copyText(text, what);
  if (ok) {
    const original = btn.textContent;
    btn.textContent = 'Copied ✓';
    announcePolite(`${what} copied to clipboard.`);
    window.setTimeout(() => {
      btn.textContent = original;
    }, 3000);
  } else {
    if (source) fallbackSelect(source);
    announceAssertive(
      `Copy failed — select the text and press Ctrl+C. (${what})`,
    );
  }
}

/** Standalone download handler — takes an explicit snapshot. */
export function handleDownload(
  btn: HTMLElement,
  snapshot: ResultSnapshot | null,
): void {
  const format = btn.getAttribute('data-download-format') ?? 'txt';
  if (!snapshot) {
    announceAssertive('Run the tool first, then download.');
    return;
  }
  const { outputs, values, toolId } = snapshot;
  let content = '';
  let mime = 'text/plain';
  if (format === 'csv') {
    content = resultsToCsv(outputs, values);
    mime = 'text/csv';
  } else if (format === 'json') {
    content = JSON.stringify(
      { tool: toolId, outputs: values },
      null,
      2,
    );
    mime = 'application/json';
  } else {
    content = resultsToPlainText(outputs, values);
  }
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${toolId}-results.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
  announcePolite(`Download started: results.${format}.`);
}

// ---------------------------------------------------------------------------
// Share link (?s= state)
// ---------------------------------------------------------------------------

function flatShareState(
  tool: MountedTool,
): Record<string, string | number | boolean> | null {
  const { options, lastValues } = tool;
  if (!lastValues) return null;
  const state: Record<string, string | number | boolean> = {};
  for (const input of options.inputs) {
    const v = lastValues[input.id];
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      state[input.id] = v;
    }
  }
  return state;
}

/**
 * Standalone share handler. `shareState` is the flat primitive input map
 * used for the ?s= param (ADR-003).
 */
export function handleShare(
  toolId: string,
  shareState: Record<string, string | number | boolean> | null,
): void {
  if (!shareState) {
    announceAssertive('Run the tool first, then copy a share link.');
    return;
  }
  let encoded: string;
  try {
    const base = window.location.href.split('?')[0];
    const result = buildShareLink(base, shareState);
    if (!result.ok) {
      announceAssertive(result.warning ?? 'This result is too large to share as a link.');
      return;
    }
    encoded = result.url;
    if (result.warning) announcePolite(result.warning);
  } catch {
    announceAssertive('Could not build a share link for these inputs.');
    return;
  }
  copyText(encoded, 'share link').then((ok) => {
    if (ok) {
      announcePolite('Share link copied to clipboard.');
    } else {
      window.prompt('Copy this share link:', encoded);
    }
  });
}

/**
 * Wire copy / download / share buttons inside any container (delegated).
 * Builder and tracker templates use this for their bespoke results areas.
 * `getSnapshot` returns the current result or null when there is none.
 */
export function wireResultActions(
  container: HTMLElement,
  getSnapshot: () => ResultSnapshot | null,
): void {
  container.addEventListener('click', (ev) => {
    const target = ev.target as HTMLElement;
    const copyBtn = target.closest('[data-copy]') as HTMLElement | null;
    if (copyBtn && container.contains(copyBtn)) {
      void handleCopyClick(copyBtn);
      return;
    }
    const dlBtn = target.closest('[data-download]') as HTMLElement | null;
    if (dlBtn && container.contains(dlBtn)) {
      handleDownload(dlBtn, getSnapshot());
      return;
    }
    const shareBtn = target.closest('[data-action="share"]') as HTMLElement | null;
    if (shareBtn && container.contains(shareBtn)) {
      const snap = getSnapshot();
      handleShare(snap?.toolId ?? '', snap?.shareState ?? null);
    }
  });
}

function updateUrlState(tool: MountedTool): void {
  // Keep the URL in sync (replaceState, no navigation) so copying the
  // address bar reproduces the result — ADR-003 URL-first state.
  try {
    const { options, lastValues } = tool;
    if (!lastValues) return;
    const state: Record<string, string | number | boolean> = {};
    for (const input of options.inputs) {
      const v = lastValues[input.id];
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        state[input.id] = v;
      }
    }
    const base = window.location.href.split('?')[0];
    const result = buildShareLink(base, state);
    if (result.ok) window.history.replaceState(null, '', result.url);
  } catch {
    /* URL sync is best-effort */
  }
}

// ---------------------------------------------------------------------------
// Prefill (examples + shared links)
// ---------------------------------------------------------------------------

function setFieldValue(
  tool: MountedTool,
  id: string,
  value: string | number | boolean,
): void {
  const control = tool.root.querySelector(
    `[data-field-input="${CSS.escape(id)}"]`,
  ) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
  if (!control) return;
  const input = tool.options.inputs.find((i) => i.id === id);
  if (input?.type === 'boolean' && control instanceof HTMLInputElement) {
    control.checked = value === true || value === 'true';
  } else {
    control.value = String(value);
  }
  control.dispatchEvent(new Event('input', { bubbles: true }));
  control.dispatchEvent(new Event('change', { bubbles: true }));
}

function prefillFromState(
  tool: MountedTool,
  state: Record<string, string | number | boolean>,
): void {
  for (const [key, value] of Object.entries(state)) {
    if (tool.options.inputs.some((i) => i.id === key)) setFieldValue(tool, key, value);
  }
}

// ---------------------------------------------------------------------------
// Submit flow
// ---------------------------------------------------------------------------

async function runSubmit(tool: MountedTool, userInitiated: boolean): Promise<void> {
  const { options, schema } = tool;
  const raw = collectFormData(tool.form, options.inputs);

  // Media lane: decode file inputs BEFORE validation. File inputs are
  // excluded from the schema above; required/size/decode errors are
  // reported here with media-specific copy.
  const media = await processFileInputs(tool, raw);
  if (Object.keys(media.errors).length > 0) {
    renderFieldErrors(tool, media.errors);
    const firstFieldId = Object.keys(media.errors)[0] as string;
    announceAssertive(
      'There is a problem with the chosen file. It has been highlighted.',
    );
    const firstControl = tool.root.querySelector(
      `[data-field-input="${CSS.escape(firstFieldId)}"]`,
    ) as HTMLElement | null;
    firstControl?.focus();
    trackEvent(TOOL_EVENTS.VALIDATION_ERROR, {
      errorCount: Object.keys(media.errors).length,
    });
    return;
  }

  const validation = validateObject(raw, schema);

  if (!validation.ok) {
    renderFieldErrors(tool, validation.errors);
    const count = Object.keys(validation.errors).length;
    if (count >= 2) {
      renderErrorSummary(tool, validation.errors);
    } else {
      tool.summary.hidden = true;
      tool.summary.innerHTML = '';
      const firstPath = Object.keys(validation.errors)[0];
      const fieldId = firstPath.split('.')[0].split('[')[0];
      const control = tool.root.querySelector(
        `[data-field-input="${CSS.escape(fieldId)}"]`,
      ) as HTMLElement | null;
      control?.focus();
    }
    announceAssertive(
      count === 1
        ? 'There is 1 problem with the form. It has been highlighted.'
        : `There are ${count} problems with the form. Review the summary at the top of the form.`,
    );
    trackEvent(TOOL_EVENTS.VALIDATION_ERROR, { errorCount: count });
    return;
  }

  tool.summary.hidden = true;
  tool.summary.innerHTML = '';
  clearFieldErrors(tool.root, options.inputs);

  // Decoded media descriptors merge here. updateUrlState skips non-primitive
  // values, so media never leaks into the URL.
  const runValues: Record<string, unknown> = {
    ...validation.values,
    ...media.values,
  };

  if (options.onBeforeRun) {
    try {
      const proceed = await options.onBeforeRun(runValues);
      if (proceed === false) return;
    } catch {
      /* hook failure must not block the run */
    }
  }

  let result: ToolRunResult;
  try {
    result = await options.run(runValues);
  } catch (err) {
    result = {
      ok: false,
      error: 'Something went wrong running this tool. Your inputs were kept — please try again.',
    };
    trackEvent(TOOL_EVENTS.ERROR, {
      stage: 'run_throw',
      message: err instanceof Error ? err.message : String(err),
    });
  }

  if (!result.ok) {
    tool.results.innerHTML =
      `<h2 class="hb-results__title" tabindex="-1" data-results-heading>` +
      `${escapeHtml(options.resultHeading ?? 'Results')}</h2>` +
      `<div class="hb-run-error" role="alert"><p>${escapeHtml(result.error ?? 'The tool could not produce a result for these inputs.')}</p></div>`;
    tool.results.hidden = false;
    tool.resultsHeading =
      tool.results.querySelector('[data-results-heading]') as HTMLElement;
    announceAssertive(result.error ?? 'The tool could not produce a result.');
    trackEvent(TOOL_EVENTS.ERROR, { stage: 'run_not_ok' });
    if (userInitiated) tool.resultsHeading?.focus();
    return;
  }

  tool.lastResult = result;
  tool.lastValues = runValues;
  renderResults(tool, result);
  updateUrlState(tool);
  const outputCount = options.outputs.filter(
    (o) => result.values && result.values[o.id] !== undefined,
  ).length;
  announcePolite(
    `${options.resultHeading ?? 'Results'} ready. ${outputCount} result${outputCount === 1 ? '' : 's'} shown below the form.`,
  );
  trackEvent(TOOL_EVENTS.RUN, { outputCount });
  if (userInitiated) tool.resultsHeading?.focus();
}

async function handleReset(tool: MountedTool): Promise<void> {
  const { options } = tool;
  if (options.confirmReset) {
    const confirmed = await options.confirmReset().catch(() => false);
    if (!confirmed) return;
  }
  tool.form.reset();
  tool.results.hidden = true;
  tool.results.innerHTML = '';
  tool.summary.hidden = true;
  tool.summary.innerHTML = '';
  clearFieldErrors(tool.root, options.inputs);
  try {
    const base = window.location.href.split('?')[0];
    window.history.replaceState(null, '', base);
  } catch {
    /* best-effort */
  }
  announcePolite('Form cleared.');
  trackEvent(TOOL_EVENTS.RESET, {});
  const first = tool.root.querySelector(
    '[data-field-input]',
  ) as HTMLElement | null;
  first?.focus();
}

// ---------------------------------------------------------------------------
// Confirm dialog contract (DS ConfirmDialog; native <dialog> underneath)
// ---------------------------------------------------------------------------

/**
 * Open a DS ConfirmDialog by id. The dialog element must be
 * `<dialog data-confirm-dialog="<id>">` containing `[data-confirm-ok]` and
 * `[data-confirm-cancel]` buttons. Falls back to window.confirm() when the
 * DS component is absent (never blocks the flow).
 */
export function requestConfirm(
  dialogId: string,
  fallbackMessage: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    const dialog = document.querySelector(
      `dialog[data-confirm-dialog="${CSS.escape(dialogId)}"]`,
    ) as HTMLDialogElement | null;
    if (!dialog || typeof dialog.showModal !== 'function') {
      resolve(window.confirm(fallbackMessage));
      return;
    }
    const ok = dialog.querySelector('[data-confirm-ok]');
    const cancel = dialog.querySelector('[data-confirm-cancel]');
    const done = (value: boolean) => {
      ok?.removeEventListener('click', onOk);
      cancel?.removeEventListener('click', onCancel);
      dialog.removeEventListener('close', onClose);
      if (dialog.open) dialog.close();
      resolve(value);
    };
    const onOk = () => done(true);
    const onCancel = () => done(false);
    const onClose = () => done(dialog.returnValue === 'ok');
    ok?.addEventListener('click', onOk);
    cancel?.addEventListener('click', onCancel);
    dialog.addEventListener('close', onClose);
    dialog.showModal();
  });
}

// ---------------------------------------------------------------------------
// mount()
// ---------------------------------------------------------------------------

function showFallback(root: HTMLElement, retry: () => void): void {
  const fallback = root.querySelector('[data-tool-fallback]') as HTMLElement | null;
  if (fallback) {
    fallback.hidden = false;
    const retryBtn = fallback.querySelector('[data-fallback-retry]');
    retryBtn?.addEventListener('click', () => {
      fallback.hidden = true;
      retry();
    });
  } else {
    announceAssertive(
      'Something went wrong running this tool. Please reload the page and try again.',
    );
  }
}

/**
 * Wire one tool island. Never throws — failures render the template's
 * [data-tool-fallback] block (ToolErrorBoundary-compatible).
 */
export function mountToolUI(options: ToolMountOptions): void {
  const boot = () => {
    try {
      bootInner(options);
    } catch {
      const root =
        typeof options.root === 'string'
          ? document.querySelector(options.root)
          : options.root;
      if (root instanceof HTMLElement) {
        showFallback(root, () => mountToolUI(options));
      }
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
}

function bootInner(options: ToolMountOptions): void {
  const root =
    typeof options.root === 'string'
      ? document.querySelector(options.root)
      : options.root;
  if (!(root instanceof HTMLElement)) return;
  const form = root.querySelector('[data-tool-form]') as HTMLFormElement | null;
  const results = root.querySelector('[data-tool-results]') as HTMLElement | null;
  const summary = root.querySelector('[data-error-summary]') as HTMLElement | null;
  if (!form || !results || !summary) return;

  setAnalyticsContext({
    toolId: options.toolId,
    toolType: options.toolType,
    toolName: options.toolName,
  });

  const tool: MountedTool = {
    root,
    form,
    results,
    resultsHeading: results.querySelector('[data-results-heading]') as HTMLElement,
    summary,
    options,
    // File inputs are decoded by the media lane (processFileInputs) before
    // validation; their presence/size/decode checks live there, so they are
    // excluded from the validateObject schema.
    schema: buildSchema(options.inputs.filter((i) => i.type !== 'file')),
    lastResult: null,
    lastValues: null,
  };

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    void runSubmit(tool, true);
  });

  // Delegated actions inside this tool root: copy / download / share are
  // wired by the shared helper; reset + examples are mount-specific.
  wireResultActions(root, () =>
    tool.lastResult?.values
      ? {
          toolId: options.toolId,
          toolName: options.toolName,
          outputs: options.outputs,
          values: tool.lastResult.values,
          shareState: flatShareState(tool) ?? undefined,
        }
      : null,
  );

  // Example buttons live in the shell's Examples section (outside
  // [data-tool-root]), so they are handled at document level and routed to
  // this page's single tool instance.
  const handleExample = (exampleBtn: HTMLElement): void => {
    const idx = Number(exampleBtn.getAttribute('data-example-index'));
    const payloadEl = exampleBtn
      .closest('[data-example]')
      ?.querySelector('[data-example-payload]');
    if (!payloadEl) return;
    try {
      const payload = JSON.parse(payloadEl.textContent ?? '{}') as Record<
        string,
        string | number | boolean
      >;
      prefillFromState(tool, payload);
      trackEvent(TOOL_EVENTS.EXAMPLE_USE, { exampleIndex: idx });
      void runSubmit(tool, true);
    } catch {
      announceAssertive('Could not load that example.');
    }
  };
  document.addEventListener('click', (ev) => {
    const exampleBtn = (ev.target as HTMLElement).closest?.(
      '[data-example-index]',
    ) as HTMLElement | null;
    if (!exampleBtn) return;
    // Only handle examples belonging to this tool's page.
    const page = exampleBtn.closest('[data-tool-page]');
    if (page && page.contains(root)) handleExample(exampleBtn);
  });

  root.addEventListener('click', (ev) => {
    const target = ev.target as HTMLElement;
    const actionBtn = target.closest(
      '[data-action="reset"]',
    ) as HTMLElement | null;
    if (actionBtn && root.contains(actionBtn)) {
      void handleReset(tool);
    }
  });

  // Shared-link state: prefill + auto-run (no focus steal on load)
  try {
    const shared = parseToolStateFromQuery(window.location.search);
    if (shared) {
      prefillFromState(tool, shared);
      void runSubmit(tool, false);
    }
  } catch {
    /* malformed shared state: decode never throws; ignore */
  }

  trackEvent(TOOL_EVENTS.VIEW, {});
}

/* ---------------------------------------------------------------------------
 * Batch-1 pilot: per-tool logic loading (MA2 slot wiring).
 *
 * Each tool's real logic lives at app/tools/<categorySlug>/<slug>/logic.ts
 * and exports `runTool(values): ToolRunResult`. Templates call
 * loadToolRun() in their island script and fall back to their DEMO runner
 * when the tool has no logic module yet (475 tools still pending).
 * import.meta.glob is LAZY: only the requested tool's chunk is fetched.
 * ------------------------------------------------------------------------- */

const logicModules = import.meta.glob('../../tools/*/*/logic.ts');

/**
 * Load a tool's real logic module. Returns the `runTool` export, or null
 * when the tool has no logic module yet (caller falls back to DEMO).
 * Never throws — a broken module must not break the page shell.
 */
export async function loadToolRun(
  categorySlug: string,
  slug: string,
): Promise<ToolRunFn | null> {
  const key = `../../tools/${categorySlug}/${slug}/logic.ts`;
  const loader = (logicModules as Record<string, () => Promise<unknown>>)[key];
  if (!loader) return null;
  try {
    const mod = (await loader()) as { runTool?: unknown };
    return typeof mod.runTool === 'function' ? (mod.runTool as ToolRunFn) : null;
  } catch {
    return null;
  }
}
