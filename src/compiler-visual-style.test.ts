import { describe, expect, it } from 'vitest';
import { compile, generate, parseIdea } from './compiler';
import { visualStyleOptions } from './visual-style';

describe('compiler visual style boundary', () => {
  const raw = 'Build an Android checklist app for one person. Workflow: add item, mark complete. Screens: Checklist. Required features: checklist. No sharing.';

  it('routes a design specialist without mutating Idea Lock', () => {
    const before = parseIdea(raw);
    const output = generate(raw, { buildType: 'app-web-app', visualStyle: 'apple-minimal' });
    const after = parseIdea(raw);

    expect(output).toContain('Interaction Design Specialist');
    expect(after).toEqual(before);
    expect(Object.isFrozen(after)).toBe(true);
  });

  it('keeps product requirements identical across every visual style', () => {
    const baseline = compile(raw, { buildType: 'app-web-app', visualStyle: 'premium-modern' });

    for (const option of visualStyleOptions) {
      const prompt = compile(raw, { buildType: 'app-web-app', visualStyle: option.visualStyle });
      expect(prompt.workflow).toBe(baseline.workflow);
      expect(prompt.screens).toEqual(baseline.screens);
      expect(prompt.features).toEqual(baseline.features);
      expect(prompt.states).toEqual(baseline.states);
      expect(prompt.constraints).toEqual(baseline.constraints);
      expect(prompt.lock).toEqual(baseline.lock);
      expect(prompt.role).toContain(option.role);

      if (option.visualStyle === 'custom') {
        expect(prompt.visual).toBe('');
      } else {
        expect(prompt.visual).toBe(option.emphasis.join('; '));
      }
    }
  });

  it('gives each preset style a distinct role and visual direction', () => {
    const presets = visualStyleOptions.filter(option => option.visualStyle !== 'custom');
    const roles = presets.map(option => compile(raw, { buildType: 'app-web-app', visualStyle: option.visualStyle }).role);
    const visuals = presets.map(option => compile(raw, { buildType: 'app-web-app', visualStyle: option.visualStyle }).visual);

    expect(new Set(roles).size).toBe(presets.length);
    expect(new Set(visuals).size).toBe(presets.length);
  });

  it('preserves build-type-only compatibility', () => {
    const output = generate(raw, { buildType: 'app-web-app' });
    expect(output).toContain('Full-Stack Application Engineer');
  });
});
