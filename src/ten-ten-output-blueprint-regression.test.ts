import { describe, expect, it } from 'vitest';
import { generate } from './compiler';

const opts = { buildType: 'app-web-app' as const, creationFormat: 'ios-app' as const, visualStyle: 'premium-modern' as const };

const headings = (output: string) => [
  'Role','Product Mission','Idea Lock','Target User','Platform','Main Workflow','Structure Requirements','Core Features','Interaction & State Rules','Settings','Visual Direction','Build Quality & Brand Experience','Constraints','Do Not Add','Completion Standard',
].filter(h => output.includes(`\n\n${h}\n\n`) || output.startsWith(`${h}\n\n`));

const assertOrdered = (output: string, expected: string[]) => {
  let last = -1;
  for (const heading of expected) {
    const at = output.indexOf(`${heading}\n\n`);
    expect(at, `missing ${heading}`).toBeGreaterThan(-1);
    expect(at, `${heading} out of order`).toBeGreaterThan(last);
    last = at;
  }
};

const section = (output: string, name: string, next: string) => output.split(`${name}\n\n`)[1]?.split(`\n\n${next}\n\n`)[0] || '';

const assertNoJunk = (output: string) => {
  expect(output).not.toMatch(/^\s*(?:Show|Add|Record|Include)\s*:\s*\.?\s*$/gim);
  expect(output).not.toMatch(/^\s*[A-Za-z][A-Za-z /&+-]{0,40}\.?\s*$/gm);
};

describe('10/10 global output blueprint', () => {
  it('uses the benchmark section order when settings are relevant', () => {
    const output = generate(`Habit Companion\n\nBuild a personal habit app for one person.\nMain workflow: Welcome → Habit Setup → Home.\nSettings: Theme with Light, Dark, and Automatic. Reminder schedule.\nWhen a habit reaches its saved time, ask the user whether it was completed. Save each answer.\nDo not add teams or social features.`, opts);
    assertOrdered(output, ['Role','Product Mission','Idea Lock','Target User','Platform','Main Workflow','Structure Requirements','Core Features','Interaction & State Rules','Settings','Visual Direction','Build Quality & Brand Experience','Constraints','Do Not Add','Completion Standard']);
  });

  it('keeps structure limited to navigable views while settings stay owned by Settings', () => {
    const output = generate(`Recipe Keeper\n\nBuild a recipe app for one cook.\nMain workflow: Welcome → Recipes → Recipe.\nSettings: Theme with Light, Dark, and Automatic. Serving preferences.\nRecipes page shows saved recipes. Recipe page shows ingredients and steps.`, opts);
    const structure = section(output, 'Structure Requirements', 'Core Features');
    expect(structure).toContain('Welcome');
    expect(structure).toContain('Recipes');
    expect(structure).toContain('Recipe');
    expect(structure).not.toMatch(/Light|Dark|Automatic|Serving preferences/i);
    const settings = section(output, 'Settings', 'Visual Direction');
    expect(settings).toMatch(/Light.*Dark.*Automatic/i);
    expect(settings).toMatch(/Serving preferences/i);
  });

  it('preserves trigger → action → saved-result relationships as complete state instructions', () => {
    const output = generate(`Plant Care\n\nBuild a plant-care app for one person.\nMain workflow: Home → Plants → Plant.\nTwo days before a saved fertilizing date, show a Home question asking whether fertilizer is ready. Save the answer for that cycle.\nWhen the watering date arrives, ask whether the plant was watered and save the result.`, opts);
    const state = section(output, 'Interaction & State Rules', 'Visual Direction');
    expect(state).toMatch(/two days before[^\n]*fertiliz/i);
    expect(state).toMatch(/question[^\n]*save|save[^\n]*answer/i);
    expect(state).toMatch(/watering date[^\n]*ask|ask[^\n]*watered/i);
  });

  it('keeps unrelated domains free of benchmark-example contamination', () => {
    const ideas = [
      `Study Planner\nBuild a study planner for one student. Main workflow: Home → Subjects → Session. Settings: Theme with Light, Dark, and Automatic.`,
      `Car Care\nBuild a vehicle maintenance tracker for one owner. Main workflow: Home → Vehicles → Service. Settings: Units and theme.`,
      `Packing List\nBuild a packing utility for one traveler. Main workflow: Home → Trips → Packing List.`,
    ];
    for (const idea of ideas) {
      const output = generate(idea, opts).toLowerCase();
      expect(output).not.toMatch(/payday|credit card|bill amount|income schedule|trailer|drop & hook|recipe ingredient/);
    }
  });

  it('keeps output clean, sectioned, and implementation-oriented', () => {
    const output = generate(`Reading Log\n\nBuild a reading tracker for one reader.\nMain workflow: Home → Books → Book.\nAllow adding a book, updating reading progress, and saving completed books.\nSettings: Theme with Light, Dark, and Automatic. Reading goal.\nDo not add social feeds or teams.`, opts);
    expect(headings(output).length).toBeGreaterThanOrEqual(13);
    assertNoJunk(output);
    expect(section(output, 'Core Features', 'Interaction & State Rules')).toMatch(/Allow|Add|Update|Save|Track|Show|Provide/i);
  });
});
