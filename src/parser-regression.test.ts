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
});
