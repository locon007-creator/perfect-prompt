import { describe, expect, it } from 'vitest';
import { generate } from './compiler';

const section = (output: string, name: string, next?: string) => {
  const start = `${name}\n\n`;
  const body = output.split(start)[1] || '';
  return next ? (body.split(`\n\n${next}\n\n`)[0] || '') : body;
};

describe('global final prompt polish', () => {
  it('compresses app build mechanics to two constraint lines', () => {
    const output = generate('Build a simple loan tracker for one person. Required features: balance, payment dates, payment amounts, remaining balance.', { buildType: 'app-web-app', creationFormat: 'android-app', visualStyle: 'premium-modern' });
    const constraints = section(output, 'Constraints', 'Do Not Add').trim().split(/\r?\n/).filter(Boolean);
    const buildLines = constraints.filter(line => /index\.html|app views|build step|split into multiple files/i.test(line));
    expect(buildLines).toHaveLength(2);
    expect(buildLines.join(' ')).toContain('index.html');
    expect(buildLines.join(' ')).toContain('without a build step');
  });

  it('does not claim a workflow must be preserved when none exists', () => {
    const output = generate('Build a simple loan tracker for one person. Required features: balance, payment dates.', { buildType: 'app-web-app', creationFormat: 'android-app', visualStyle: 'premium-modern' });
    const completion = section(output, 'Completion Standard').trim();
    expect(completion).toContain('Implement every locked requirement');
    expect(completion).not.toContain('stated workflow is preserved');
    expect(completion).not.toContain('preserve the workflow');
  });

  it('preserves workflow language when a workflow is actually provided', () => {
    const output = generate('Build a timer for one worker. Workflow: Punch In → Active Shift → Punch Out. Required features: elapsed timer.', { buildType: 'app-web-app', creationFormat: 'android-app', visualStyle: 'premium-modern' });
    const completion = section(output, 'Completion Standard').trim();
    expect(completion.toLowerCase()).toContain('workflow');
    expect(completion.toLowerCase()).toContain('preserve');
  });

  it('keeps visual direction and build quality concise and non-repetitive', () => {
    const output = generate('Build a premium personal timesheet for one worker. Required features: punch in, punch out, weekly total.', { buildType: 'app-web-app', creationFormat: 'android-app', visualStyle: 'premium-modern' });
    const visual = section(output, 'Visual Direction', 'Build Quality & Brand Experience').trim().split(/\r?\n/).filter(Boolean);
    const quality = section(output, 'Build Quality & Brand Experience', 'Constraints').trim().split(/\r?\n/).filter(Boolean);
    expect(visual.length).toBeLessThanOrEqual(6);
    expect(quality.length).toBeLessThanOrEqual(4);
    const normalizedVisual = visual.map(x => x.toLowerCase().replace(/[^a-z0-9 ]/g, ''));
    const normalizedQuality = quality.map(x => x.toLowerCase().replace(/[^a-z0-9 ]/g, ''));
    for (const line of normalizedQuality) expect(normalizedVisual).not.toContain(line);
  });
});