import { describe, expect, test } from 'vitest';
import { generate } from './compiler';

const section = (output: string, name: string, next: string) => output.split(`${name}\n\n`)[1]?.split(`\n\n${next}\n\n`)[0] || '';

const financeIdea = `Personal Financial Administration\n\nBuild a premium personal financial administration app for one person.\n\nPrimary job:\nHelp the user set up their normal income and recurring monthly bills once, then make ongoing money management mostly automatic with very little typing.\n\nMain workflow:\nWelcome → Income Setup → Bills Setup → Setup Complete → Home\n\nIncome Setup:\nLet the user choose how they normally get paid using simple dropdowns or selectors: weekly, biweekly, twice monthly, monthly, or custom. Select the usual payday and enter the expected amount. Allow more than one income source.\n\nBills Setup:\nAdd regular monthly bills using quick selectors for bill type, due date, frequency, and payment method. The user mainly selects options and enters the bill amount. Allow common bills such as rent, utilities, phone, insurance, subscriptions, loans, and credit cards.\n\nHome:\nAfter setup, automatically organize income and bills based on their saved schedules. Show what money is expected next, which bills are coming due, what has been paid, and how much money remains.\n\nWhen a scheduled income or bill arrives, ask only for the actual amount or confirmation when necessary instead of making the user re-enter everything.\n\nKeep interactions fast: dropdowns, toggles, date selectors, quick amount entry, and one-tap confirmations.\n\nSave all schedules and financial activity persistently.\n\nKeep it strictly personal. Do not add accounting terminology, business bookkeeping, investments, bank trading, social features, or complicated spreadsheets.`;

describe('global Core Features instruction quality', () => {
  test('finance Core Features are complete implementation instructions, not fragments', () => {
    const output = generate(financeIdea, { buildType: 'app-web-app', creationFormat: 'android-app', visualStyle: 'apple-minimal' });
    const core = section(output, 'Core Features', 'Interaction & State Rules');
    expect(core).not.toContain('Recurring monthly bills once.');
    expect(core).not.toContain('Then make ongoing money management mostly automatic with very little typing.');
    expect(core).not.toMatch(/Record Add regular monthly bills/i);
    for (const line of core.split(/\r?\n/).map(line => line.trim()).filter(Boolean)) {
      expect(line).toMatch(/^(?:Set up|Allow|Add|Show|Organize|Track|Record|Use|Create|Manage|Calculate|Display|Save|Provide|Keep|Require|Mark|Enter|Review|Automatically|Optional:)/i);
    }
  });

  test('state-owned scheduled confirmation behavior is not duplicated in Core Features', () => {
    const output = generate(financeIdea, { buildType: 'app-web-app', creationFormat: 'android-app', visualStyle: 'premium-modern' });
    const core = section(output, 'Core Features', 'Interaction & State Rules').toLowerCase();
    const state = section(output, 'Interaction & State Rules', 'Visual Direction').toLowerCase();
    expect(state).toContain('actual amount');
    expect(core).not.toContain('actual amount');
    expect(core).not.toContain('confirmation when necessary');
  });

  test('explicit core behavior remains preserved while grammar is normalized', () => {
    const idea = 'Build a simple loan tracker. Record a balance, payment dates, payment amounts, and remaining balance.';
    const output = generate(idea, { buildType: 'app-web-app', creationFormat: 'android-app', visualStyle: 'premium-modern' });
    const core = section(output, 'Core Features', 'Interaction & State Rules').toLowerCase();
    expect(core).toContain('balance');
    expect(core).toContain('payment');
    expect(core).not.toMatch(/^payment amounts\.$/m);
  });

  test('Drop & Hook feature ownership stays intact', () => {
    const idea = 'Build Drop & Hook Assistant. Show the active business name and address, arrival time, departure time, and a Drop & Hook label. Include one collapsible Drop & Hook section attached directly to the active stop card. Navigation can open externally. Save previously used trailer numbers for quick reuse.';
    const output = generate(idea, { buildType: 'app-web-app', creationFormat: 'mobile-utility', visualStyle: 'premium-modern' });
    const core = section(output, 'Core Features', 'Interaction & State Rules').toLowerCase();
    const state = section(output, 'Interaction & State Rules', 'Visual Direction').toLowerCase();
    expect(core).toContain('active business');
    expect(core).toContain('collapsible');
    expect(state).toContain('navigation');
    expect(state).toContain('trailer');
  });
});
