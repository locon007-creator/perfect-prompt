import { describe, expect, test } from 'vitest';
import { compile, generate, parseIdea } from './compiler';
import type { VisualStyle } from './visual-style';

const raw = 'Build a personal appointment manager for saving appointments, dates, times, and simple reminders in a clean mobile interface.';

const styleExpectations: Record<Exclude<VisualStyle, 'custom'>, string[]> = {
  'premium-modern': ['visual identity', 'first screen', 'micro-interactions', 'generic template'],
  'apple-minimal': ['visual identity', 'first screen', 'native-feeling motion', 'generic template'],
  'figma-product': ['visual identity', 'first screen', 'component consistency', 'micro-interactions'],
  'bold-cinematic': ['visual identity', 'first screen', 'cinematic', 'purposeful motion'],
  'clean-utility': ['visual identity', 'first screen', 'restrained motion', 'generic template']
};

describe('global premium build quality layer', () => {
  for (const [style, phrases] of Object.entries(styleExpectations) as Array<[Exclude<VisualStyle, 'custom'>, string[]]>) {
    test(`${style} emits concrete build-quality direction without mutating Idea Lock`, () => {
      const before = parseIdea(raw);
      const prompt = compile(raw, { buildType: 'app-web-app', visualStyle: style });
      const after = parseIdea(raw);
      expect(after).toEqual(before);
      expect(Object.isFrozen(after)).toBe(true);
      expect(prompt.quality.length).toBeGreaterThanOrEqual(4);
      const quality = prompt.quality.join(' ').toLowerCase();
      for (const phrase of phrases) expect(quality).toContain(phrase.toLowerCase());
    });
  }

  test('assembled prompts contain a dedicated build quality section', () => {
    const output = generate(raw, { buildType: 'app-web-app', visualStyle: 'premium-modern' });
    expect(output).toContain('Build Quality & Brand Experience');
    expect(output).toContain('visual identity');
    expect(output).toContain('first screen');
    expect(output).toContain('micro-interactions');
    expect(output.toLowerCase()).toContain('generic template');
  });

  test('custom style does not inject invented brand or motion direction', () => {
    const prompt = compile(raw, { buildType: 'app-web-app', visualStyle: 'custom' });
    expect(prompt.quality).toEqual([]);
    const output = generate(raw, { buildType: 'app-web-app', visualStyle: 'custom' });
    expect(output).toContain('Build Quality & Brand Experience');
    expect(output).toContain('Follow only build-quality, branding, and motion requirements explicitly stated in the idea.');
  });

  test('quality layer never changes product requirements across styles', () => {
    const baseline = compile(raw, { buildType: 'app-web-app', visualStyle: 'premium-modern' });
    for (const style of ['apple-minimal', 'figma-product', 'bold-cinematic', 'clean-utility', 'custom'] as const) {
      const prompt = compile(raw, { buildType: 'app-web-app', visualStyle: style });
      expect(prompt.workflow).toBe(baseline.workflow);
      expect(prompt.screens).toEqual(baseline.screens);
      expect(prompt.features).toEqual(baseline.features);
      expect(prompt.states).toEqual(baseline.states);
      expect(prompt.constraints).toEqual(baseline.constraints);
      expect(prompt.lock).toEqual(baseline.lock);
    }
  });
});