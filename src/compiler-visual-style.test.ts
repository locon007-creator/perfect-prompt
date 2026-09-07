import { describe, expect, it } from 'vitest';
import { compile, generate, parseIdea } from './compiler';

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

  it('keeps product requirements identical across visual styles', () => {
    const premium = compile(raw, { buildType: 'app-web-app', visualStyle: 'premium-modern' });
    const utility = compile(raw, { buildType: 'app-web-app', visualStyle: 'clean-utility' });

    expect(utility.workflow).toBe(premium.workflow);
    expect(utility.screens).toEqual(premium.screens);
    expect(utility.features).toEqual(premium.features);
    expect(utility.states).toEqual(premium.states);
    expect(utility.constraints).toEqual(premium.constraints);
    expect(utility.lock).toEqual(premium.lock);
    expect(utility.role).not.toBe(premium.role);
  });

  it('preserves build-type-only compatibility', () => {
    const output = generate(raw, { buildType: 'app-web-app' });
    expect(output).toContain('Full-Stack Application Engineer');
  });
});