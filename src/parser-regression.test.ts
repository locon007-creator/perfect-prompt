import { describe, expect, it } from 'vitest';
import { compile } from './compiler';

describe('natural language parser regression', () => {
  it('keeps purpose text out of target user and extracts unlabeled capabilities', () => {
    const prompt = compile('Build a personal shift tracker with clock in and clock out for recording work start and end times, daily hours, and a simple weekly total. Also include a monthly calendar with holidays and settings for hourly rate, extra pay after 40 hours at 1.5x, and percentage deductions.');
    expect(prompt.targetUser).toBe('the intended user');
    const features = prompt.features.join(' ').toLowerCase();
    expect(features).toContain('monthly calendar');
    expect(features).toContain('hourly rate');
    expect(features).toContain('extra pay');
    expect(features).toContain('deductions');
  });

  it('extracts an unlabeled and-also sentence like a normal user would write', () => {
    const prompt = compile('Build a personal work-hours utility with clock in and clock out for recording start time, end time, daily hours, and a weekly total. And also monthly calendar with holidays and in settings hourly rate, extra pay after 40 hours at 1.5x, and percentage deductions.');
    const features = prompt.features.join(' ').toLowerCase();
    expect(features).toContain('monthly calendar');
    expect(features).toContain('hourly rate');
    expect(features).toContain('deductions');
  });

  it('separates an audience from its to-purpose clause', () => {
    const prompt = compile('Build a personal expense tracker for one person to record purchases, see daily and weekly spending totals, and review a monthly summary. And also category filters, recurring expense reminders, and settings for a monthly budget.');
    expect(prompt.targetUser).toBe('one person');
    const features = prompt.features.join(' ').toLowerCase();
    expect(features).toContain('record purchases');
    expect(features).toContain('daily');
    expect(features).toContain('monthly summary');
    expect(features).toContain('category filters');
  });

  it('separates plural audiences from a who-purpose clause', () => {
    const prompt = compile('Create a home maintenance log for homeowners who want to record repairs and review maintenance history.');
    expect(prompt.targetUser).toBe('homeowners');
    expect(prompt.features.join(' ').toLowerCase()).toContain('record repairs');
  });

  it('separates an audience from a that-purpose clause', () => {
    const prompt = compile('Create a household planner for families that want to organize chores and review weekly responsibilities.');
    expect(prompt.targetUser).toBe('families');
    expect(prompt.features.join(' ').toLowerCase()).toContain('organize chores');
  });
});
