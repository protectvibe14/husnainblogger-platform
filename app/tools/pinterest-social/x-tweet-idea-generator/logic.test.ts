import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  runTool,
  weightedLength,
  TWEET_MAX_WEIGHTED,
  URL_WEIGHT,
  EMOJI_WEIGHT,
  GOALS,
  DRAFT_COUNT,
} from './logic.ts';
import { inputs, outputs, content } from './meta.ts';

describe('weightedLength — conservative X counting', () => {
  it('plain text counts 1 per code point', () => {
    assert.equal(weightedLength('hello'), 5);
  });
  it('URL counts as 23', () => {
    assert.equal(URL_WEIGHT, 23);
    assert.equal(weightedLength('x https://example.com/very/long/path'), 2 + 23);
  });
  it('emoji counts as 2', () => {
    assert.equal(EMOJI_WEIGHT, 2);
    assert.equal(weightedLength('a👇b'), 1 + 2 + 1);
  });
  it('multiple URLs and emoji combine', () => {
    assert.equal(weightedLength('https://a.co x 😀 https://b.co'), 23 + 3 + 2 + 1 + 23);
  });
});

describe('runTool — happy path', () => {
  it('returns 8 drafts within 280 weighted chars', () => {
    const r = runTool({ topic: 'sourdough baking', goal: 'engagement' });
    assert.equal(r.ok, true);
    const tweets = r.values!['tweets'] as string[];
    assert.equal(tweets.length, DRAFT_COUNT);
    for (const t of tweets) {
      assert.ok(weightedLength(t) <= TWEET_MAX_WEIGHTED, `over cap: ${t}`);
      assert.ok(t.length > 0);
    }
  });

  it('drafts use the topic', () => {
    const tweets = runTool({ topic: 'sourdough baking', goal: 'engagement' }).values!['tweets'] as string[];
    assert.ok(tweets.every((t) => t.includes('sourdough baking')));
  });

  it('each goal produces goal-flavored drafts', () => {
    const traffic = runTool({ topic: 'home workouts', goal: 'traffic' }).values!['tweets'] as string[];
    assert.ok(traffic.some((t) => t.includes('link in reply')));
    const followers = runTool({ topic: 'home workouts', goal: 'followers' }).values!['tweets'] as string[];
    assert.ok(followers.some((t) => /follow/i.test(t)));
  });

  it('no goal -> general drafts still valid', () => {
    const r = runTool({ topic: 'budget travel' });
    assert.equal(r.ok, true);
    assert.equal((r.values!['tweets'] as string[]).length, DRAFT_COUNT);
  });

  it('notes carry link-in-reply best practice and the counting method', () => {
    const notes = runTool({ topic: 'x' }).values!['notes'] as string[];
    assert.ok(notes.some((n) => n.includes('first reply')));
    assert.ok(notes.some((n) => n.includes('23')));
  });
});

describe('runTool — validation errors', () => {
  it('missing topic -> ok:false', () => {
    assert.equal(runTool({}).ok, false);
  });
  it('blank topic -> ok:false', () => {
    assert.equal(runTool({ topic: '   ' }).ok, false);
  });
  it('non-string topic -> ok:false', () => {
    assert.equal(runTool({ topic: 5 }).ok, false);
  });
  it('topic alone over 280 weighted chars -> thread suggestion error', () => {
    const r = runTool({ topic: 'word '.repeat(70) });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes('tool-371'));
  });
});

describe('runTool — edge cases', () => {
  it('long topic is cut at a word boundary with ellipsis and still fits', () => {
    const topic = 'sourdough baking for absolute beginners who have never touched flour';
    const r = runTool({ topic: topic + ' ' + 'extra '.repeat(30), goal: 'engagement' });
    assert.equal(r.ok, true);
    for (const t of r.values!['tweets'] as string[]) {
      assert.ok(weightedLength(t) <= TWEET_MAX_WEIGHTED, `over cap: ${t}`);
    }
    assert.ok((r.values!['tweets'] as string[]).some((t) => t.includes('…')));
  });

  it('unknown goal falls back to general with a note', () => {
    const r = runTool({ topic: 'sourdough', goal: 'viral' });
    assert.equal(r.ok, true);
    assert.ok((r.values!['notes'] as string[]).some((n) => n.includes('not supported')));
  });

  it('deterministic: same inputs -> identical drafts', () => {
    const in_ = { topic: 'sourdough baking', goal: 'engagement' };
    assert.deepEqual(runTool(in_), runTool(in_));
  });

  it('topic with a URL is weighted correctly and still fits', () => {
    const r = runTool({ topic: 'my guide https://example.com/guide', goal: 'traffic' });
    assert.equal(r.ok, true);
    for (const t of r.values!['tweets'] as string[]) {
      assert.ok(weightedLength(t) <= TWEET_MAX_WEIGHTED);
    }
  });
});

describe('contract', () => {
  it('TWEET_MAX_WEIGHTED is 280', () => {
    assert.equal(TWEET_MAX_WEIGHTED, 280);
  });
  it('GOALS are engagement/traffic/followers', () => {
    assert.deepEqual([...GOALS].sort(), ['engagement', 'followers', 'traffic']);
  });
  it('DRAFT_COUNT is 8', () => {
    assert.equal(DRAFT_COUNT, 8);
  });
});

describe('meta.ts alignment', () => {
  it('output ids match runTool value keys', () => {
    const r = runTool({ topic: 'x' });
    assert.deepEqual(Object.keys(r.values!).sort(), outputs.map((o) => o.id).sort());
  });

  it('input ids cover topic and goal', () => {
    assert.deepEqual(inputs.map((i) => i.id).sort(), ['goal', 'topic']);
    assert.deepEqual(inputs.find((i) => i.id === 'goal')!.options, [
      'engagement',
      'traffic',
      'followers',
    ]);
  });

  it('title <=60, description 140-160, 2-3 examples, 3 faqs from spec', () => {
    assert.ok(content.title.length <= 60, `title ${content.title.length}`);
    assert.ok(
      content.description.length >= 140 && content.description.length <= 160,
      `description ${content.description.length}`,
    );
    assert.ok(content.examples!.length >= 2 && content.examples!.length <= 3);
    assert.equal(content.faqs.length, 3);
  });

  it('jsonLd has SoftwareApplication + BreadcrumbList, never FAQPage', () => {
    const types = (content.jsonLd as Array<{ '@type': string }>).map((j) => j['@type']);
    assert.deepEqual(types.sort(), ['BreadcrumbList', 'SoftwareApplication']);
  });
});
