import { describe, expect, it } from 'vitest';
import { generate } from './compiler';

const section = (output: string, start: string, end: string) =>
  output.split(`${start}\n\n`)[1]?.split(`\n\n${end}\n\n`)[0]?.trim() ?? '';

const options = { buildType: 'app-web-app' as const, creationFormat: 'ios-app' as const, visualStyle: 'premium-modern' as const };

const assertClean = (output: string) => {
  const structure = section(output, 'Structure Requirements', 'Core Features');
  const core = section(output, 'Core Features', 'Interaction & State Rules');
  const doNotAdd = section(output, 'Do Not Add', 'Settings');
  for (const body of [structure, core, doNotAdd]) {
    expect(body).not.toMatch(/(?:^|\n)(?:Show|Add|Record|Include)\s*:\.?\s*(?:\n|$)/i);
    expect(body).not.toMatch(/(?:^|\n)\s*[-*]?\s*(?:and|or|then|also)\s*\.?\s*(?:\n|$)/i);
  }
};

describe('global compiler hygiene is domain agnostic', () => {
  it('keeps settings controls out of structure for a finance app', () => {
    const output = generate(`Build a personal finance assistant for one person. Workflow: Home → Bills → Settings. Settings: Theme with Light, Dark, and Automatic. Manage Bills for adding, removing, editing, and changing due dates. Core features: track income and recurring bills.`, options);
    const structure = section(output, 'Structure Requirements', 'Core Features').toLowerCase();
    expect(structure).toContain('settings');
    expect(structure).not.toContain('light');
    expect(structure).not.toContain('dark');
    expect(structure).not.toContain('manage bills for');
    assertClean(output);
  });

  it('keeps settings controls out of structure for an unrelated recipe app', () => {
    const output = generate(`Build a recipe organizer for home cooks. Workflow: Recipes → Recipe → Settings. Settings: Theme with Light, Dark, and Automatic. Measurement units: US or Metric. Core features: save recipes, ingredients, cooking steps, favorites.`, options);
    const structure = section(output, 'Structure Requirements', 'Core Features').toLowerCase();
    expect(structure).toContain('settings');
    expect(structure).not.toContain('metric');
    expect(structure).not.toContain('light');
    assertClean(output);
  });

  it('preserves conditional and scheduled behavior without domain-specific wording', () => {
    const output = generate(`Build a plant care app for one person. Workflow: Home → Plants → Plant. When a plant reaches its saved watering day, show a Home question asking whether it was watered. Two days before a saved fertilizing date, ask for confirmation. Save each answer in history.`, options);
    const state = section(output, 'Interaction & State Rules', 'Visual Direction').toLowerCase();
    expect(state).toContain('watering day');
    expect(state).toContain('two days before');
    expect(state).toContain('fertilizing');
    assertClean(output);
  });

  it('compresses long option/example lists without turning each item into a feature fragment', () => {
    const output = generate(`Build a packing list app for travelers. Show a categorized list of common packing items: shirts, pants, socks, shoes, toiletries, chargers, medications, documents, snacks, jackets, hats, and books. Allow a custom item.`, options);
    const core = section(output, 'Core Features', 'Interaction & State Rules');
    const tinyLines = core.split(/\r?\n/).map(x => x.trim()).filter(x => /^[A-Z][A-Za-z /&-]{1,24}\.$/.test(x));
    expect(tinyLines.length).toBeLessThanOrEqual(3);
    expect(core.toLowerCase()).toContain('custom item');
    assertClean(output);
  });

  it('normalizes negative fragments generically', () => {
    const output = generate(`Build a reading tracker for one person. Do not assume reading goals stay the same. Do not require the user to re-enter saved books. No social features. No: chat, followers, public profiles.`, options);
    const doNotAdd = section(output, 'Do Not Add', 'Settings') || section(output, 'Do Not Add', 'Completion Standard');
    expect(doNotAdd).not.toContain('Add:.');
    expect(doNotAdd).not.toContain('No:.');
    expect(doNotAdd.toLowerCase()).toContain('social');
    assertClean(output);
  });

  it('does not leak concepts between unrelated domains', () => {
    const cases = [
      ['garden journal', 'plants, watering history, photos', ['income', 'bills', 'credit card', 'truck', 'trailer', 'payroll']],
      ['recipe organizer', 'recipes, ingredients, cooking steps', ['income', 'payday', 'trailer', 'mileage', 'punch in']],
      ['study planner', 'subjects, study sessions, assignments', ['bills', 'credit card', 'trailer', 'drop & hook', 'groceries']],
      ['vehicle maintenance log', 'vehicles, service records, mileage', ['payday', 'rent', 'credit card', 'recipes', 'study sessions']],
    ] as const;
    for (const [name, features, forbidden] of cases) {
      const output = generate(`Build a ${name} for one person. Core features: ${features}. Keep it focused only on this job.`, options).toLowerCase();
      for (const term of forbidden) expect(output).not.toContain(term);
    }
  });
});
