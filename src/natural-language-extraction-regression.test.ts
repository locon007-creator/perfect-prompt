import { describe, expect, test } from 'vitest';
import { compile, generate, parseIdea } from './compiler';

describe('global natural-language requirement extraction', () => {
  const idea = `Build a premium mobile-first personal work log app named Work Log for one worker.

The app has one main job: make it extremely easy to start work, end work, track daily work hours, and see weekly pay without spreadsheets or payroll complexity.

Main workflow:
Home → Start Work → Active Shift → End Work → Saved Day

Home should show today’s date, current shift status, today’s worked hours, and one large primary Start Work or End Work button.

When active, show a real live elapsed timer that continues accurately even if the app is closed and reopened.

When the worker ends work, automatically calculate total hours worked for that day and save the entry.

Include a Weekly screen using a Sunday–Friday workweek. Show each day, hours worked, weekly total hours, hourly rate, gross pay, configurable deductions, and estimated net pay.

Also include History and a Monthly Calendar so previous workdays can be reviewed and edited.

Allow the user to set their hourly rate, normal workweek, deductions, and preferred time format.

Use local persistent storage so all entries survive app restarts.

Target Android phones in 360–430 px portrait layouts with premium, calm, polished mobile UI and large thumb-friendly controls.

Keep it strictly personal. Do not add teams, employee management, GPS tracking, scheduling, employer dashboards, or payroll processing.`;

  test('extracts the clean project name and explicit audience', () => {
    const lock = parseIdea(idea);
    expect(lock.appName).toBe('Work Log');
    expect(lock.targetUser).toBe('one worker');
    expect(lock.targetUser.trim()).not.toBe('');
  });

  test('extracts explicit structures described in ordinary sentences', () => {
    const prompt = compile(idea, { buildType: 'app-web-app' });
    const structures = prompt.screens.map(x => x.toLowerCase());
    for (const expected of ['home', 'active shift', 'weekly', 'history', 'monthly calendar', 'settings']) {
      expect(structures.some(x => x.includes(expected))).toBe(true);
    }
  });

  test('extracts important capabilities instead of leaving core features thin', () => {
    const text = compile(idea, { buildType: 'app-web-app' }).features.join(' | ').toLowerCase();
    for (const expected of [
      'live elapsed timer',
      'total hours worked',
      'weekly total hours',
      'hourly rate',
      'gross pay',
      'deductions',
      'estimated net pay',
      'reviewed and edited',
      'persistent storage',
    ]) {
      expect(text).toContain(expected);
    }
  });

  test('extracts state, persistence, layout constraints, and individual exclusions', () => {
    const lock = parseIdea(idea);
    const state = [...lock.stateRules, ...lock.persistenceRules].join(' | ').toLowerCase();
    expect(state).toContain('closed and reopened');
    expect(state).toContain('calculate total hours worked');
    expect(state).toContain('survive app restarts');

    const constraints = lock.constraints.join(' | ').toLowerCase();
    expect(constraints).toContain('360–430');
    expect(constraints).toContain('portrait');
    expect(constraints).toContain('thumb-friendly');

    const exclusions = lock.explicitExclusions.map(x => x.toLowerCase());
    for (const expected of ['spreadsheets', 'payroll complexity', 'teams', 'employee management', 'gps tracking', 'scheduling', 'employer dashboards', 'payroll processing']) {
      expect(exclusions).toContain(expected);
    }
  });

  test('assembles a complete prompt without duplicated audience wording', () => {
    const output = generate(idea, { buildType: 'app-web-app', visualStyle: 'figma-product' });
    expect(output).toContain('Project name: Work Log');
    expect(output).toContain('Target user: one worker');
    expect(output).not.toContain('for one worker for one worker');
    expect(output).toContain('Structure Requirements');
    expect(output).toContain('Core Features');
  });
});

describe('target user resilience', () => {
  test.each([
    ['Build a private household inventory named Home List for one homeowner.', 'one homeowner'],
    ['Create a reading tracker named Book Log for students who want to record completed books.', 'students'],
    ['Make a simple planner named Day Plan targeted at busy parents.', 'busy parents'],
  ])('keeps a stated audience non-empty: %s', (idea, target) => {
    expect(parseIdea(idea).targetUser).toBe(target);
  });
});
