import { describe, expect, test } from 'vitest';
import { compile, generate, parseIdea } from './compiler';

const raw = `Build a premium personal timesheet app for one worker.

The app has one main job: make it fast and easy to punch in, punch out, track daily work hours, and see a simple weekly total.

Main workflow:

Home → Punch In → Active Shift → Punch Out → Saved Day

Home should show today’s date, current shift status, today’s worked hours, and one large Punch In or Punch Out button.

During an active shift, show a real live elapsed timer that remains accurate if the app is closed and reopened.

When the worker punches out, automatically calculate total hours worked and save the day.

Include a Weekly view using a Sunday–Friday workweek. Show each day’s hours and the weekly total.

Include History so previous workdays can be reviewed and edited.

Allow the user to set their preferred time format.

Save all timesheet data locally so entries survive app restarts.

Keep it strictly personal. Do not add teams, employee management, GPS tracking, scheduling, employer dashboards, payroll processing, or social features.`;

describe('semantic feature synthesis', () => {
  test('workflow actions are not promoted to screens', () => {
    const lock = parseIdea(raw);
    expect(lock.screens).toEqual(['Weekly', 'Home', 'Active Shift', 'Saved Day', 'History', 'Settings']);
    expect(lock.screens).not.toContain('Punch In');
    expect(lock.screens).not.toContain('Punch Out');
  });

  test('core features are concise semantic requirements without source-fragment contamination', () => {
    const output = generate(raw, { buildType: 'app-web-app', creationFormat: 'ios-app', visualStyle: 'figma-product' });
    const core = output.split('Core Features')[1]?.split('Interaction & State Rules')[0] || '';
    const states = output.split('Interaction & State Rules')[1]?.split('Visual Direction')[0] || '';

    expect(core).toContain('Punch in to start a work shift.');
    expect(core).toContain('Punch out to end the active shift.');
    expect(core).toContain('Show a live elapsed shift timer that remains accurate if the app is closed and reopened.');
    expect(core).toContain('Calculate and save total daily worked hours.');
    expect(core).toContain('Show a Sunday–Friday Weekly view with daily hours and the weekly total.');
    expect(core).toContain('Provide History for reviewing and editing previous workdays.');
    expect(core).toContain('Allow the user to choose their preferred time format.');
    expect(states).toContain('Save all timesheet data locally so entries survive app restarts');

    expect(core).not.toContain('Make it fast.');
    expect(core).not.toContain('One main job:');
    expect(core).not.toContain('Record Home should');
    expect(core).not.toContain('Calculate and display Include');
    expect(core).not.toContain('Record Allow the user');
    expect(core).not.toContain('Persist all timesheet data');
    expect(core).not.toContain('Keep it strictly personal.');
  });

  test('semantic synthesis does not mutate the Idea Lock', () => {
    const before = parseIdea(raw);
    const compiled = compile(raw, { buildType: 'app-web-app', creationFormat: 'ios-app', visualStyle: 'figma-product' });
    expect(compiled.lock).toEqual(before);
    expect(Object.isFrozen(compiled.lock)).toBe(true);
  });
});
