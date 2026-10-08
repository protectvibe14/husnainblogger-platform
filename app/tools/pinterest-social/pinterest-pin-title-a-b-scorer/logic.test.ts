import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  runTool,
  scoreTitle,
  TITLE_MAX_CHARS,
  OVER_LIMIT_PENALTY,
  CRITERION_WEIGHTS,
  LIST_WORDS,
  ACTION_VERBS,
  CURIOSITY_WORDS,
} from './logic.ts';
import { inputs, outputs, content } from './meta.ts';

const HAPPY = {
  titleA: '25 Cozy Fall Porch Decor Ideas on a Budget',
  titleB: 'Fall Porch Decorations You Will Love This Season',
  primaryKeyword: 'fall porch decor',
};

describe('runTool — happy path', () => {
  it('scores two titles and declares a winner', () => {
    const r = runTool(HAPPY);
    assert.equal(r.ok, true);
    const v = r.values!;
    const scores = v['scores'] as { columns: string[]; rows: string[][] };
    assert.equal(scores.rows.length, 2);
    assert.equal(scores.columns.length, 7);
    assert.ok(['A', 'B', 'tie'].includes(v['winner'] as string));
    const notes = v['notes'] as string[];
    assert.ok(
      notes.some((n) => n.includes('Heuristic estimate, not a prediction of Pinterest ranking')),
      'heuristic label must be present',
    );
  });

  it('stronger title (number + keyword up front) beats the weaker one', () => {
    const r = runTool(HAPPY);
    assert.equal(r.values!['winner'], 'A');
  });

  it('B can win when it is the stronger title', () => {
    const r = runTool({
      titleA: 'Decor',
      titleB: '25 Cozy Fall Porch Decor Ideas on a Budget',
      primaryKeyword: 'fall porch decor',
    });
    assert.equal(r.values!['winner'], 'B');
  });

  it('total scores stay within 0-100', () => {
    const r = runTool(HAPPY);
    const rows = (r.values!['scores'] as { rows: string[][] }).rows;
    for (const row of rows) {
      const total = Number(row[1]);
      assert.ok(total >= 0 && total <= 100, `out of range: ${total}`);
    }
  });
});

describe('runTool — validation errors', () => {
  it('empty titleA -> ok:false', () => {
    const r = runTool({ titleA: '  ', titleB: 'Some title', primaryKeyword: '' });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });
  it('empty titleB -> ok:false', () => {
    const r = runTool({ titleA: 'Some title', titleB: '' });
    assert.equal(r.ok, false);
  });
  it('missing values -> ok:false', () => {
    const r = runTool({});
    assert.equal(r.ok, false);
  });
  it('non-string titles -> ok:false', () => {
    const r = runTool({ titleA: 42, titleB: 'Some title' });
    assert.equal(r.ok, false);
  });
});

describe('runTool — edge cases', () => {
  it('identical titles -> tie with note', () => {
    const r = runTool({ titleA: 'Fall Decor Ideas', titleB: 'fall  decor ideas ' });
    assert.equal(r.ok, true);
    assert.equal(r.values!['winner'], 'tie');
    assert.ok(
      (r.values!['notes'] as string[]).some((n) => n.includes('identical')),
    );
  });

  it('over-limit title gets the 10-point penalty and a warning', () => {
    const long = 'A'.repeat(TITLE_MAX_CHARS + 1);
    const r = runTool({ titleA: long, titleB: 'Short title here' });
    assert.equal(r.ok, true);
    const rows = (r.values!['scores'] as { rows: string[][] }).rows;
    // penalty is applied on top of the (already zeroed) length criterion
    const s = scoreTitle(long, '');
    const weighted = Math.round(
      (CRITERION_WEIGHTS.keywordPosition * s.criteria.keywordPosition +
        CRITERION_WEIGHTS.specificity * s.criteria.specificity +
        CRITERION_WEIGHTS.length * s.criteria.length +
        CRITERION_WEIGHTS.actionLanguage * s.criteria.actionLanguage +
        CRITERION_WEIGHTS.curiosityGap * s.criteria.curiosityGap) /
        100,
    );
    assert.equal(s.totalScore, Math.max(0, weighted - OVER_LIMIT_PENALTY));
    assert.ok(s.overLimit);
    assert.ok(
      (r.values!['notes'] as string[]).some((n) => n.includes('over 100 characters')),
    );
    assert.ok(rows[0][0].length > TITLE_MAX_CHARS);
  });

  it('non-Latin titles -> limited heuristic coverage note', () => {
    const r = runTool({ titleA: '最好的蛋糕食谱大全', titleB: '简单家常菜谱合集' });
    assert.equal(r.ok, true);
    assert.ok(
      (r.values!['notes'] as string[]).some((n) => n.includes('Limited heuristic coverage')),
    );
  });

  it('no keyword -> neutral 60 for both + guidance note', () => {
    const r = runTool({ titleA: 'Fall Decor Ideas', titleB: 'Winter Decor Ideas' });
    assert.equal(r.ok, true);
    const rows = (r.values!['scores'] as { rows: string[][] }).rows;
    assert.equal(rows[0][2], '60');
    assert.equal(rows[1][2], '60');
    assert.ok(
      (r.values!['notes'] as string[]).some((n) => n.includes('No primary keyword')),
    );
  });

  it('deterministic: same inputs -> identical output', () => {
    assert.deepEqual(runTool(HAPPY), runTool(HAPPY));
  });
});

describe('scoreTitle — criterion behavior', () => {
  it('keyword early in title -> 100; absent -> 20', () => {
    assert.equal(scoreTitle('fall porch decor ideas for autumn', 'fall porch decor').criteria.keywordPosition, 100);
    assert.equal(scoreTitle('x'.repeat(45) + ' fall porch decor', 'fall porch decor').criteria.keywordPosition, 55);
    assert.equal(scoreTitle('cozy autumn ideas', 'fall porch decor').criteria.keywordPosition, 20);
  });

  it('specificity rewards numbers, list words, how-to, year, parentheses', () => {
    const s = scoreTitle('25 Fall Porch Decor Tips (2026 Guide): How to Style', '');
    assert.equal(s.criteria.specificity, 100); // 35+25+20+10+10 capped
    const plain = scoreTitle('Fall porch decor', '');
    assert.ok(plain.criteria.specificity < 100);
  });

  it('length criterion bands', () => {
    assert.equal(scoreTitle('x'.repeat(50), '').criteria.length, 100);
    assert.equal(scoreTitle('x'.repeat(30), '').criteria.length, 70);
    assert.equal(scoreTitle('x'.repeat(10), '').criteria.length, 40);
    assert.equal(scoreTitle('x'.repeat(101), '').criteria.length, 0);
  });

  it('action language: verb present -> 100, else 45', () => {
    assert.equal(scoreTitle('Transform your porch this fall', '').criteria.actionLanguage, 100);
    assert.equal(scoreTitle('Pretty porch pictures', '').criteria.actionLanguage, 45);
  });

  it('curiosity gap: question or curiosity word -> 100, else 50', () => {
    assert.equal(scoreTitle('Why does nobody talk about porch decor?', '').criteria.curiosityGap, 100);
    assert.equal(scoreTitle('The secret to a cozy porch', '').criteria.curiosityGap, 100);
    assert.equal(scoreTitle('Pretty porch pictures', '').criteria.curiosityGap, 50);
  });
});

describe('rubric contract', () => {
  it('criterion weights sum to 100', () => {
    const sum = Object.values(CRITERION_WEIGHTS).reduce((a, b) => a + b, 0);
    assert.equal(sum, 100);
  });

  it('documented bank sizes', () => {
    assert.equal(LIST_WORDS.length, 20);
    assert.equal(ACTION_VERBS.length, 25);
    assert.equal(CURIOSITY_WORDS.length, 15);
  });

  it('TITLE_MAX_CHARS is 100 per spec', () => {
    assert.equal(TITLE_MAX_CHARS, 100);
  });
});

describe('meta.ts alignment', () => {
  it('output ids match runTool value keys', () => {
    const r = runTool(HAPPY);
    const valueIds = Object.keys(r.values!).sort();
    const metaIds = outputs.map((o) => o.id).sort();
    assert.deepEqual(valueIds, metaIds);
  });

  it('input ids cover the spec classification inputs', () => {
    const ids = inputs.map((i) => i.id).sort();
    assert.deepEqual(ids, ['primaryKeyword', 'titleA', 'titleB']);
  });

  it('title <=60 chars, description 140-160 chars', () => {
    assert.ok(content.title.length <= 60, `title ${content.title.length}`);
    assert.ok(
      content.description.length >= 140 && content.description.length <= 160,
      `description ${content.description.length}`,
    );
  });

  it('faqs come from the spec questionQueries (4)', () => {
    assert.equal(content.faqs.length, 4);
  });

  it('jsonLd has SoftwareApplication + BreadcrumbList, never FAQPage', () => {
    const types = (content.jsonLd as Array<{ '@type': string }>).map((j) => j['@type']);
    assert.deepEqual(types.sort(), ['BreadcrumbList', 'SoftwareApplication']);
  });
});
