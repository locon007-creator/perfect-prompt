import { describe, expect, it } from 'vitest';
import { generate } from './compiler';

const between = (output: string, start: string, end: string) =>
  output.split(start)[1]?.split(end)[0]?.trim() ?? '';

describe('single HTML default build contract', () => {
  it('defaults app/web-app prompts to one self-contained index.html', () => {
    const output = generate(
      'Build a personal timesheet utility for recording work start and end times, daily hours, and a simple weekly total.',
      { buildType: 'app-web-app' },
    );

    const platform = between(output, 'Platform', 'Main Workflow');
    expect(platform).toContain('single self-contained index.html');
    expect(platform).toContain('inline CSS and JavaScript');
    expect(platform).toContain('Multiple screens');
    expect(platform).toContain('without a build step');
  });

  it('does not force the HTML contract onto non-app outputs', () => {
    const output = generate('Create a cinematic product image of a premium wristwatch.', { buildType: 'image' });
    expect(output).not.toContain('single self-contained index.html');
  });
});
