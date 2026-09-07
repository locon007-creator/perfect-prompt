import { describe, expect, it } from 'vitest';
import { compile, generate } from './compiler';

const cases = [
  {
    idea: 'Build a personal time tracker for one worker to see weekly pay without spreadsheets or payroll complexity.',
    required: 'see weekly pay',
    excluded: ['spreadsheets', 'payroll complexity']
  },
  {
    idea: 'Build a route checklist for drivers to organize stops without GPS tracking or dispatch tools.',
    required: 'organize stops',
    excluded: ['GPS tracking', 'dispatch tools']
  },
  {
    idea: 'Create a private notes utility for writers to save notes without ads or subscriptions.',
    required: 'save notes',
    excluded: ['ads', 'subscriptions']
  }
];

describe('global negative qualifier parsing', () => {
  for (const item of cases) {
    it(`keeps the positive capability while isolating exclusions: ${item.required}`, () => {
      const prompt = compile(item.idea);
      expect(prompt.features.join(' ').toLowerCase()).toContain(item.required.toLowerCase());
      expect(prompt.features.join(' ').toLowerCase()).not.toContain(' without ');
      for (const exclusion of item.excluded) {
        expect(prompt.lock.explicitExclusions.join(' ').toLowerCase()).toContain(exclusion.toLowerCase());
      }
      expect(() => generate(item.idea)).not.toThrow();
    });
  }
});
