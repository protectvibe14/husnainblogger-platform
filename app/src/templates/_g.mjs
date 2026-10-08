  import { mountToolUI, loadToolRun } from './_tool-runtime.ts';
  import type { ToolRunValues, ToolRunResult } from './types.ts';

  /* ================= TOOL LOGIC SLOT (DEMO — MA2: replace) =================
   * Demo: blog-title idea generator from fixed templates. Works on
   * DEMO_INPUTS above only. Real tools return string[] for the list output.
   * ======================================================================= */
  function demoRun(values: ToolRunValues): ToolRunResult {
    const topic = String(values.topic ?? '').trim();
    const count = Math.min(20, Math.max(1, Math.round(Number(values.count) || 10)));
    const style = String(values.style ?? 'How-to');
    if (!topic) return { ok: false, error: 'Enter a topic first.' };
    const templates: Record<string, string[]> = {
      'How-to': [
        `How to master ${topic} in 30 days`,
        `How to get started with ${topic} (beginner guide)`,
        `How to avoid the 7 biggest ${topic} mistakes`,
      ],
      Listicle: [
        `15 ${topic} ideas you can try this weekend`,
        `9 ${topic} tools worth every penny`,
        `21 ${topic} tips from people who do it daily`,
      ],
      Question: [
        `Is ${topic} worth your time in 2026?`,
        `What nobody tells you about ${topic}`,
        `Why does ${topic} work so well? (explained)`,
      ],
    };
    const bank = templates[style] ?? templates['How-to'];
    const items: string[] = [];
    for (let i = 0; items.length < count; i++) items.push(bank[i % bank.length]);
    return { ok: true, values: { items } };
  }

  const configEl = document.querySelector('[data-tool-config]');
  const config = JSON.parse(configEl?.textContent ?? '{}');

  // Batch-1 pilot: use the tool's real logic module when it exists;
  // DEMO runner remains the fallback for tools still pending.
  const realRun = await loadToolRun(config.categorySlug, config.slug);

  mountToolUI({
    root: '[data-tool-root]',
    toolId: config.toolId,
    toolName: config.toolName,
    toolType: config.toolType,
    inputs: config.inputs,
    outputs: config.outputs,
    run: realRun ?? demoRun,
    resultHeading: 'Generated results',
  });
