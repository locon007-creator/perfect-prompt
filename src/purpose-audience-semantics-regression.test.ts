import { describe, expect, test } from 'vitest';
import { compile, generate, parseIdea } from './compiler';

describe('purpose and audience semantics', () => {
  test('does not treat a purpose phrase as the target user', () => {
    const lock = parseIdea('Build an expense tracker for manually recording purchases, categories, dates, and monthly totals.');
    expect(lock.targetUser).toBe('the intended user');
    expect(lock.primaryJob.toLowerCase()).toContain('manually recording purchases');
  });

  test('splits a purpose clause into concrete required capabilities', () => {
    const prompt = compile('Build an expense tracker for manually recording purchases, categories, dates, and monthly totals.', { buildType: 'app-web-app' });
    const features = prompt.features.map(x => x.toLowerCase());
    for (const expected of ['manually recording purchases', 'categories', 'dates', 'monthly totals']) {
      expect(features).toContain(expected);
    }
  });

  test('keeps a true audience separate from its purpose', () => {
    const lock = parseIdea('Create a meal planner for busy parents to plan dinners, save recipes, and build grocery lists.');
    expect(lock.targetUser).toBe('busy parents');
    expect(lock.primaryJob.toLowerCase()).toContain('plan dinners');
    expect(lock.requiredFeatures.join(' | ').toLowerCase()).toContain('save recipes');
  });

  test('recognizes another action-led for-clause as purpose, not audience', () => {
    const lock = parseIdea('Make a mileage log for automatically recording trip distance, dates, and totals.');
    expect(lock.targetUser).toBe('the intended user');
    expect(lock.primaryJob.toLowerCase()).toContain('automatically recording trip distance');
  });

  test('does not silently default an unspecified app platform to responsive web', () => {
    const output = generate('Build a simple checklist app for one person. Required features: checklist.', { buildType: 'app-web-app' });
    expect(output).toContain('Platform\n\nNot explicitly specified');
    expect(output).not.toContain('Platform\n\nresponsive web');
  });

  test('keeps explicit platform detection unchanged', () => {
    expect(parseIdea('Build a checklist app for one person on Android. Required features: checklist.').platform).toBe('Android');
    expect(parseIdea('Build a checklist app for one person on iOS. Required features: checklist.').platform).toBe('iOS');
    expect(parseIdea('Build a responsive web checklist for one person. Required features: checklist.').platform).toBe('responsive web');
  });
});
