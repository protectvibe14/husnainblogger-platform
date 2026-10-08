  import { validateObject } from '../lib/validation/index.ts';
  import type { FieldSchema } from '../lib/validation/index.ts';
  import {
    announcePolite,
    announceAssertive,
    escapeHtml,
    copyButtonHtml,
    loadToolRun,
    renderResults,
    resultActionsHtml,
    wireResultActions,
    type ResultSnapshot,
  } from './_tool-runtime.ts';  import { TOOL_EVENTS, setAnalyticsContext, trackEvent } from './_analytics.ts';
  import type { ToolRunResult } from './types.ts';

  interface DemoItem { label: string; url: string }

  /* ================= TOOL LOGIC SLOT (DEMO — MA2: replace) =================
   * Demo: composes "label — url" lines from validated items. Real tools
   * adapt app/tools/<category>/<slug>/logic.ts to
   * (items) => { ok, values } keyed by ToolOutput.id.
   * ======================================================================= */
  function demoCompose(items: DemoItem[]): ToolRunResult {
    return {
      ok: true,
      values: { lines: items.map((it) => `${it.label} — ${it.url}`) },
    };
  }

  const configEl = document.querySelector('[data-tool-config]');
  const config = JSON.parse(configEl?.textContent ?? '{}') as {
    toolId: string; toolName: string; toolType: string;
    categorySlug: string; slug: string;
    fields: Array<{ id: string; label: string; type: string; required?: boolean }>;
    outputs: Array<{ id: string; label: string; type: string }>;
    minItems: number; maxItems: number;
  };
  // Batch-1 pilot: prefer the tool's real logic module (runTool({ items })) when present.
  const realRun = await loadToolRun(config.categorySlug, config.slug);
  const root = document.querySelector('[data-tool-root]') as HTMLElement;
  const itemsEl = root.querySelector('[data-builder-items]') as HTMLElement;
  const resultsEl = root.querySelector('[data-tool-results]') as HTMLElement;
  const summaryEl = root.querySelector('[data-error-summary]') as HTMLElement;

  setAnalyticsContext({ toolId: config.toolId, toolType: config.toolType, toolName: config.toolName });

  let snapshot: ResultSnapshot | null = null;
  wireResultActions(root, () => snapshot);

  function fieldSchema(): Record<string, FieldSchema> {
    const schema: Record<string, FieldSchema> = {};
    for (const f of config.fields) {
      schema[f.id] = {
        type: f.type === 'url' ? 'url' : 'string',
        label: f.label,
        required: f.required === true,
        maxLength: 500,
      };
    }
    return schema;
  }

  // Collect row values in field order (rows are re-indexed, so DOM order
  // within the row is the source of truth, not input names).
  function collectRows(): Array<{ row: HTMLElement; values: Record<string, string> }> {
    const schema = fieldSchema();
    return Array.from(itemsEl.querySelectorAll('[data-builder-item]')).map((row) => {
      const values: Record<string, string> = {};
      const inputs = Array.from(
        row.querySelectorAll('[data-field-input]'),
      ) as HTMLInputElement[];
      config.fields.forEach((f, i) => {
        values[f.id] = inputs[i]?.value ?? '';
      });
      void schema;
      return { row: row as HTMLElement, values };
    });
  }

  function renumber(): void {
    Array.from(itemsEl.querySelectorAll('[data-builder-item]')).forEach((row, i) => {
      row.setAttribute('data-index', String(i));
      const title = row.querySelector('.hb-builder-item__title');
      if (title) title.textContent = `Item ${i + 1}`;
      row.querySelector('[data-row-up]')?.setAttribute('aria-label', `Move item ${i + 1} up`);
      row.querySelector('[data-row-down]')?.setAttribute('aria-label', `Move item ${i + 1} down`);
    });
  }

  function addRow(): void {
    const count = itemsEl.querySelectorAll('[data-builder-item]').length;
    if (count >= config.maxItems) {
      announceAssertive(`You can add up to ${config.maxItems} items.`);
      return;
    }
    const first = itemsEl.querySelector('[data-builder-item]') as HTMLElement;
    const clone = first.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('[data-field-input]').forEach((el) => {
      (el as HTMLInputElement).value = '';
      el.removeAttribute('aria-invalid');
    });
    const err = clone.querySelector('[data-row-error]');
    if (err) { err.textContent = ''; err.setAttribute('hidden', ''); }
    itemsEl.appendChild(clone);
    renumber();
    const firstInput = clone.querySelector('[data-field-input]') as HTMLElement | null;
    firstInput?.focus();
    announcePolite(`Item ${count + 1} added.`);
  }

  function moveRow(row: HTMLElement, dir: -1 | 1): void {
    const sibling = dir === -1 ? row.previousElementSibling : row.nextElementSibling;
    if (!sibling?.hasAttribute('data-builder-item')) return;
    if (dir === -1) itemsEl.insertBefore(row, sibling);
    else itemsEl.insertBefore(sibling, row);
    renumber();
    announcePolite(`Item moved ${dir === -1 ? 'up' : 'down'}.`);
  }

  async function build(): Promise<void> {
    const collected = collectRows();
    const schema = fieldSchema();
    let firstErrorRow: HTMLElement | null = null;
    let errorCount = 0;
    const validItems: DemoItem[] = [];
    for (const { row, values } of collected) {
      const errEl = row.querySelector('[data-row-error]') as HTMLElement;
      const result = validateObject(values, schema);
      // mark invalid controls
      const inputs = Array.from(row.querySelectorAll('[data-field-input]')) as HTMLElement[];
      inputs.forEach((el) => el.removeAttribute('aria-invalid'));
      if (!result.ok) {
        errorCount += Object.keys(result.errors).length;
        const messages = Object.values(result.errors).flat();
        errEl.textContent = messages.join(' ');
        errEl.removeAttribute('hidden');
        config.fields.forEach((f, i) => {
          if (result.errors[f.id]) inputs[i]?.setAttribute('aria-invalid', 'true');
        });
        if (!firstErrorRow) firstErrorRow = row;
      } else {
        errEl.textContent = '';
        errEl.setAttribute('hidden', '');
        validItems.push(result.values as unknown as DemoItem);
      }
    }
    if (validItems.length < config.minItems) {
      summaryEl.innerHTML =
        `<h2 tabindex="-1" data-summary-title>There is a problem</h2>` +
        `<p>Add at least ${config.minItems} item${config.minItems === 1 ? '' : 's'} before building.</p>`;
      summaryEl.hidden = false;
      summaryEl.setAttribute('role', 'alert');
      (summaryEl.querySelector('[data-summary-title]') as HTMLElement)?.focus();
      announceAssertive(`Add at least ${config.minItems} item before building.`);
      trackEvent(TOOL_EVENTS.VALIDATION_ERROR, { errorCount: 1 });
      return;
    }
    if (errorCount > 0) {
      summaryEl.innerHTML =
        `<h2 tabindex="-1" data-summary-title>There are problems in the list</h2>` +
        `<p>Fix the highlighted item fields, then build again.</p>`;
      summaryEl.hidden = false;
      summaryEl.setAttribute('role', 'alert');
      (summaryEl.querySelector('[data-summary-title]') as HTMLElement)?.focus();
      announceAssertive('Some items have errors. Fix the highlighted fields.');
      trackEvent(TOOL_EVENTS.VALIDATION_ERROR, { errorCount });
      (firstErrorRow?.querySelector('[data-field-input]') as HTMLElement | null)?.focus();
      return;
    }
    summaryEl.hidden = true;
    summaryEl.innerHTML = '';

    let result: ToolRunResult;
    try {
      result = realRun ? await realRun({ items: validItems }) : demoCompose(validItems);
    } catch {
      result = { ok: false, error: 'Something went wrong building the list.' };
    }
    if (!result.ok || !result.values) {
      announceAssertive(result.error ?? 'Could not build the list.');
      trackEvent(TOOL_EVENTS.ERROR, { stage: 'compose_not_ok' });
      return;
    }
    const output = config.outputs[0];
    const fakeTool = {
      root,
      form: root.querySelector('[data-builder-form]') ?? document.createElement('form'),
      results: resultsEl,
      resultsHeading: resultsEl.querySelector('[data-results-heading]'),
      summary: summaryEl,
      options: {
        toolId: config.toolId,
        toolName: config.toolName,
        toolType: config.toolType,
        inputs: [],
        outputs: config.outputs,
        run: realRun ?? demoCompose,
        resultHeading: output.label,
      },
      schema: {},
      lastResult: result,
      lastValues: { items: validItems },
    };
    renderResults(fakeTool, result);
    resultsEl.hidden = false;
    snapshot = {
      toolId: config.toolId,
      toolName: config.toolName,
      outputs: config.outputs as ResultSnapshot['outputs'],
      values: result.values,
    };
    const renderedCount = Object.keys(result.values ?? {}).length;
    announcePolite(`List built with ${renderedCount} result section${renderedCount === 1 ? '' : 's'}.`);
    trackEvent(TOOL_EVENTS.RUN, { outputCount: renderedCount });
    (resultsEl.querySelector('[data-results-heading]') as HTMLElement)?.focus();
  }

  function resetAll(): void {
    itemsEl.innerHTML = '';
    addRow();
    resultsEl.hidden = true;
    resultsEl.innerHTML = '';
    summaryEl.hidden = true;
    summaryEl.innerHTML = '';
    snapshot = null;
    announcePolite('Builder cleared.');
    trackEvent(TOOL_EVENTS.RESET, {});
    (itemsEl.querySelector('[data-field-input]') as HTMLElement | null)?.focus();
  }

  root.addEventListener('click', (ev) => {
    const t = ev.target as HTMLElement;
    const row = t.closest('[data-builder-item]') as HTMLElement | null;
    if (t.closest('[data-builder-add]')) { addRow(); return; }
    if (t.closest('[data-builder-build]')) { void build(); return; }
    if (t.closest('[data-action="reset"]')) { resetAll(); return; }
    if (row) {
      if (t.closest('[data-row-remove]')) {
        const count = itemsEl.querySelectorAll('[data-builder-item]').length;
        if (count <= 1) { announceAssertive('Keep at least one item.'); return; }
        row.remove();
        renumber();
        announcePolite('Item removed.');
        return;
      }
      if (t.closest('[data-row-up]')) { moveRow(row, -1); return; }
      if (t.closest('[data-row-down]')) { moveRow(row, 1); return; }
    }
  });

  renumber();
  trackEvent(TOOL_EVENTS.VIEW, {});
