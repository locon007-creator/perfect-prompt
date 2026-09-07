import { describe, expect, test } from 'vitest';
import { compile, generate, parseIdea } from './compiler';

const section = (output: string, name: string, next: string) =>
  (output.split(`\n\n${name}\n\n`)[1]?.split(`\n\n${next}\n\n`)[0] || '').trim();

const lines = (value: string) => value.split('\n').map(x => x.trim()).filter(Boolean);

const raw = 'Build a personal timesheet utility for recording work start and end times, daily hours, and a simple weekly total.';

describe('section-aware prompt assembly', () => {
  test('turns weak feature fragments into build-ready action lines', () => {
    const output = generate(raw, { buildType: 'app-web-app', visualStyle: 'figma-product' });
    const core = section(output, 'Core Features', 'Interaction & State Rules');
    expect(core).toContain('Record work start time');
    expect(core).toContain('Record work end times');
    expect(core).toContain('Calculate daily hours');
    expect(core).toContain('Calculate and display a simple weekly total');
    expect(lines(core)).not.toContain('end times');
    expect(lines(core)).not.toContain('daily hours');
  });

  test('formats visual direction as concise execution lines instead of one adjective dump', () => {
    const output = generate(raw, { buildType: 'app-web-app', visualStyle: 'figma-product' });
    const visual = section(output, 'Visual Direction', 'Build Quality & Brand Experience');
    const visualLines = lines(visual);
    expect(visualLines.length).toBeGreaterThanOrEqual(5);
    expect(visualLines.length).toBeLessThanOrEqual(7);
    expect(visualLines).toContain('Systematic hierarchy.');
    expect(visualLines).toContain('Component consistency.');
    expect(visualLines).toContain('Handoff-ready polish.');
  });

  test('keeps target user and unspecified platform concise but execution-aware', () => {
    const output = generate(raw, { buildType: 'app-web-app', visualStyle: 'figma-product' });
    const audience = section(output, 'Target User', 'Platform');
    const platform = section(output, 'Platform', 'Main Workflow');
    expect(audience).toContain('Primary audience: the intended user.');
    expect(audience).toContain('Do not invent a more specific persona');
    expect(platform).toContain('Not explicitly specified');
    expect(platform).toContain('Do not assume Android, iOS, or web');
  });

  test('does not pad or duplicate lines just to hit a section target', () => {
    const output = generate('Build a checklist app for one person. Required features: checklist.', { buildType: 'app-web-app', visualStyle: 'clean-utility' });
    for (const [name, next] of [
      ['Core Features', 'Interaction & State Rules'],
      ['Visual Direction', 'Build Quality & Brand Experience'],
      ['Build Quality & Brand Experience', 'Constraints'],
      ['Constraints', 'Do Not Add']
    ] as const) {
      const values = lines(section(output, name, next));
      expect(new Set(values.map(x => x.toLowerCase())).size).toBe(values.length);
      expect(values.length).toBeLessThanOrEqual(7);
    }
  });

  test('presentation formatting never mutates Idea Lock or product requirements', () => {
    const before = parseIdea(raw);
    const prompt = compile(raw, { buildType: 'app-web-app', visualStyle: 'figma-product' });
    const after = parseIdea(raw);
    expect(after).toEqual(before);
    expect(Object.isFrozen(after)).toBe(true);
    expect(prompt.lock).toEqual(before);
    expect(prompt.features).toEqual([...before.requiredFeatures]);
  });
});
