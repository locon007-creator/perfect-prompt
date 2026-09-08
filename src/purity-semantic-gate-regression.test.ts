import { describe, expect, it } from 'vitest';
import { compile, generate } from './compiler';

const opts = {
  buildType: 'app-web-app' as const,
  creationFormat: 'android-app' as const,
  visualStyle: 'premium-modern' as const,
};

const section = (output: string, name: string, next: string) =>
  output.split(`${name}\n\n`)[1]?.split(`\n\n${next}\n\n`)[0] || '';

const normalizedLines = (output: string) => output
  .split(/\r?\n/)
  .map(line => line.trim().toLowerCase())
  .filter(Boolean);

describe('purity and semantic survival gate', () => {
  it('preserves a complete time + condition + action + saved-result rule', () => {
    const idea = `Personal Financial Assistant\n\nBuild a personal finance app for one person.\nMain workflow: Welcome → Income Setup → Bills Setup → Setup Complete → Home.\nDuring Income Setup, ask whether income is Fixed or Variable and save the payday.\nIf income is fixed, save the normal amount.\nIf income is variable, never assume the paycheck stays the same.\nBeginning Thursday after 6 PM, if the next day is the saved payday and the amount has not been entered, Home should ask how much the user expects to receive on the next payday. Save that answer for that pay period and immediately use it in current calculations.\nDuring Bills Setup, ask for each bill's name, due date, and Fixed or Variable amount type.\nA few days before a variable bill is due, Home should ask for that cycle's actual amount. Save that amount only for the current billing cycle.\nSettings: Theme with Light, Dark, and Automatic. Income Schedule. Manage Bills. Notification preferences. Data and history management.\nDo not add investments, stock trading, payroll processing, teams, or social features.`;
    const compiled = compile(idea, opts);
    expect(compiled.states.join('\n')).toMatch(/Thursday[^\n]*after 6\s*PM/i);

    const output = generate(idea, opts);
    const state = section(output, 'Interaction & State Rules', 'Settings');
    expect(state).toMatch(/Thursday[^\n]*after 6\s*PM/i);
    expect(state).toMatch(/next day[^\n]*payday/i);
    expect(state).toMatch(/amount[^\n]*(?:not been entered|missing)/i);
    expect(state).toMatch(/Home[^\n]*ask[^\n]*(?:how much|amount)/i);
    expect(state).toMatch(/save[^\n]*pay period|pay period[^\n]*save/i);
    expect(state).toMatch(/current calculations|update[^\n]*calculations/i);
    expect(state).toMatch(/few days before[^\n]*variable bill/i);
    expect(state).toMatch(/save[^\n]*current billing cycle|current billing cycle[^\n]*save/i);
  });

  it('removes orphaned parser fragments and exact duplicate instructions before output', () => {
    const output = generate(`Money Helper\n\nBuild a money helper for one person.\nMain workflow: Welcome → Setup → Home.\nKeep the user's money picture accurate by remembering income and bill schedules, then ask for actual amounts only when relevant.\nShow:\n- Actual income received this month\n- Upcoming bills\n- Paid bills\nOnly show questions when they are relevant.\nOnly show questions when they are relevant.\nA few days before a variable bill is due, Home should ask:\n“How much is your [Bill Name] bill?”\nSave that amount only for the current billing cycle.\nDo not add investments or teams.`, opts);

    expect(output).not.toMatch(/^\s*(?:show|add|record|include|then asking|bill schedules?)\s*[:.]?\s*$/gim);
    const lines = normalizedLines(output);
    const duplicates = lines.filter((line, index) => lines.indexOf(line) !== index);
    expect(duplicates).toEqual([]);
  });

  it('does not carry content from a previous generation into the next generation', () => {
    generate(`Payday Helper\nBuild a finance app for one person. Ask about variable income before payday. Do not add teams.`, opts);
    const second = generate(`Recipe Keeper\nBuild a recipe app for one cook. Main workflow: Home → Recipes → Recipe. Allow adding recipes and saving ingredients. Do not add social features.`, opts).toLowerCase();

    expect(second).not.toMatch(/payday|variable income|income schedule|financial items|credit card/);
    expect(second).toMatch(/recipe/);
  });
});
