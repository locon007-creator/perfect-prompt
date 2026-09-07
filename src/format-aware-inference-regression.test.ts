import { describe, expect, test } from 'vitest';
import { generate } from './compiler';

const section = (output: string, name: string, next: string) => output.split(`${name}\n\n`)[1]?.split(`\n\n${next}\n\n`)[0] || '';
const vagueRoutine = 'Build a daily routine app.';

describe('global format-aware minimum viable inference', () => {
  test('mobile utility turns a vague product category into a small usable core', () => {
    const output = generate(vagueRoutine, { buildType: 'app-web-app', creationFormat: 'mobile-utility', visualStyle: 'premium-modern' });
    const core = section(output, 'Core Features', 'Interaction & State Rules').toLowerCase();
    expect(core).toContain('routine');
    expect(core).toMatch(/add|create/);
    expect(core).toMatch(/complete|done/);
    expect(core).toMatch(/today|daily/);
    expect(core).toMatch(/save|persist|local/);
    expect(core).not.toMatch(/analytics|social|account|subscription|ai|gamif|streak/);
  });

  test('mobile utility remains structurally lean', () => {
    const output = generate(vagueRoutine, { buildType: 'app-web-app', creationFormat: 'mobile-utility', visualStyle: 'custom' });
    const structure = section(output, 'Structure Requirements', 'Core Features');
    const numbered = structure.split(/\r?\n/).filter(line => /^\d+\./.test(line.trim()));
    expect(numbered.length).toBeLessThanOrEqual(2);
  });

  test('multi-screen app may infer supporting structure but stays bounded', () => {
    const output = generate(vagueRoutine, { buildType: 'app-web-app', creationFormat: 'multi-screen-app', visualStyle: 'custom' });
    const structure = section(output, 'Structure Requirements', 'Core Features').toLowerCase();
    expect(structure).toMatch(/today|routine|home/);
    const numbered = structure.split(/\r?\n/).filter(line => /^\d+\./.test(line.trim()));
    expect(numbered.length).toBeLessThanOrEqual(4);
    expect(structure).not.toMatch(/social|analytics|admin|community/);
  });

  test('explicit requirements always outrank inferred defaults', () => {
    const idea = 'Build a daily routine app. Only allow creating routine items and marking them complete. No history, reminders, streaks, or calendar.';
    const output = generate(idea, { buildType: 'app-web-app', creationFormat: 'multi-screen-app', visualStyle: 'premium-modern' });
    expect(output.toLowerCase()).toContain('creating routine');
    expect(output.toLowerCase()).toContain('marking them complete');
    expect(section(output, 'Do Not Add', 'Completion Standard').toLowerCase()).toMatch(/history|reminders|streaks|calendar/);
    expect(section(output, 'Core Features', 'Interaction & State Rules').toLowerCase()).not.toMatch(/history|reminder|streak|calendar/);
  });

  test('visual style never changes inferred product functionality', () => {
    const a = generate(vagueRoutine, { buildType: 'app-web-app', creationFormat: 'mobile-utility', visualStyle: 'premium-modern' });
    const b = generate(vagueRoutine, { buildType: 'app-web-app', creationFormat: 'mobile-utility', visualStyle: 'bold-cinematic' });
    expect(section(a, 'Core Features', 'Interaction & State Rules')).toBe(section(b, 'Core Features', 'Interaction & State Rules'));
    expect(section(a, 'Structure Requirements', 'Core Features')).toBe(section(b, 'Structure Requirements', 'Core Features'));
  });

  test('non-vague detailed ideas are not expanded beyond their lock', () => {
    const idea = 'Build a loan tracker. Record balance, payment date, payment amount, and remaining balance. No reminders or borrower accounts.';
    const output = generate(idea, { buildType: 'app-web-app', creationFormat: 'android-app', visualStyle: 'premium-modern' });
    const core = section(output, 'Core Features', 'Interaction & State Rules').toLowerCase();
    expect(core).toContain('balance');
    expect(core).toContain('payment');
    expect(core).not.toMatch(/notification|borrower account|messaging|credit score/);
  });
});
