import { describe, expect, test } from 'vitest';
import { generate } from './compiler';

const section = (output: string, name: string, next: string) => output.split(`${name}\n\n`)[1]?.split(`\n\n${next}\n\n`)[0] || '';

const financeIdea = `Personal Financial Administrator\n\nBuild a premium personal financial administration app for one person.\n\nPrimary job:\nHelp the user stay on top of actual income received, bills due, credit card payments, and money remaining.\n\nMain workflow:\nWelcome → Income Setup → Bills Setup → Credit Cards → Setup Complete → Home\n\nIncome Setup:\nThe user is normally paid every Friday. Save that schedule. Every Friday, Home must ask: “How much did you get paid today?”\n\nBills Setup:\nLet the user add regular bills with bill name, due date, and bill type: Fixed Amount or Variable Amount. Variable bills ask for the actual amount 2–3 days before due.\n\nCredit Cards:\nAllow adding each credit card with card name/type, normal payment date, and expected payment amount.\n\nSettings:\nInclude Theme with Light, Dark, and Automatic. Include Manage Bills as its own page where the user can add bills, remove bills, edit due dates, change Fixed or Variable type, and update amounts. Also include Manage Credit Cards and Income Schedule.\n\nPersist all setup and financial activity locally. Do not add investments, trading, business bookkeeping, teams, or social features.`;

describe('global settings semantics', () => {
  test('explicit settings stay in a dedicated Settings section and out of Structure Requirements', () => {
    const output = generate(financeIdea, { buildType: 'app-web-app', creationFormat: 'ios-app', visualStyle: 'premium-modern' });
    const structure = section(output, 'Structure Requirements', 'Core Features').toLowerCase();
    const settings = section(output, 'Settings', 'Visual Direction').toLowerCase();
    expect(settings).toContain('theme');
    expect(settings).toContain('light');
    expect(settings).toContain('dark');
    expect(settings).toContain('automatic');
    expect(settings).toContain('manage bills');
    expect(settings).toContain('manage credit cards');
    expect(settings).toContain('income schedule');
    expect(structure).not.toContain('theme with light');
    expect(structure).not.toMatch(/^\d+\.\s+(?:dark|automatic)$/m);
  });

  test('settings option values never become standalone screens', () => {
    const output = generate('Build a personal timesheet app. Settings: Theme with Light, Dark, and Automatic. Include time format and History.', { buildType: 'app-web-app', creationFormat: 'android-app', visualStyle: 'premium-modern' });
    const structure = section(output, 'Structure Requirements', 'Core Features').toLowerCase();
    expect(structure).not.toMatch(/(?:^|\n)\d+\.\s+(?:light|dark|automatic|time format)(?:\n|$)/i);
  });

  test('a simple utility does not get a bloated Settings section when settings are unnecessary', () => {
    const output = generate('Build a simple one-screen flashlight utility with one large on/off button.', { buildType: 'app-web-app', creationFormat: 'mobile-utility', visualStyle: 'clean-utility' });
    expect(output).not.toContain('\n\nSettings\n\n');
  });

  test('format-aware inferred settings stay small and product-relevant', () => {
    const output = generate('Build a personal timesheet app for one worker. Track punch in, punch out, daily hours, and weekly totals. Save data locally.', { buildType: 'app-web-app', creationFormat: 'multi-screen-app', visualStyle: 'premium-modern' });
    const settings = section(output, 'Settings', 'Visual Direction');
    const lines = settings.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    expect(lines.length).toBeGreaterThanOrEqual(1);
    expect(lines.length).toBeLessThanOrEqual(4);
    expect(settings.toLowerCase()).toMatch(/theme|time format|history|data/);
  });

  test('Drop & Hook explicit settings are preserved without inventing unrelated finance or account settings', () => {
    const output = generate('Build Drop & Hook Assistant for one driver. Settings: Home Base and Truck Profiles. Save trailer suggestions. No accounts, payroll, or fleet management.', { buildType: 'app-web-app', creationFormat: 'android-app', visualStyle: 'premium-modern' });
    const settings = section(output, 'Settings', 'Visual Direction').toLowerCase();
    expect(settings).toContain('home base');
    expect(settings).toContain('truck profiles');
    expect(settings).not.toContain('payment');
    expect(settings).not.toContain('account');
  });
});
