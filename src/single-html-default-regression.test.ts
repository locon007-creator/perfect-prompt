import { describe, expect, it } from 'vitest';
import { generate } from './compiler';

describe('single HTML default build contract', () => {
  it('defaults app/web-app prompts to one self-contained index.html', () => {
    const output = generate(
      'Build a personal timesheet utility for recording work start and end times, daily hours, and a simple weekly total.',
      { buildType: 'app-web-app' },
    );

    expect(output).toContain('single self-contained index.html');
    expect(output).toContain('inline CSS and JavaScript');
    expect(output).toContain('Multiple screens');
    expect(output).toContain('without a build step');
    expect(output).toContain('unless the locked idea explicitly requests another stack');
  });

  it('does not force the HTML contract onto non-app outputs', () => {
    const output = generate('Create a cinematic product image of a premium wristwatch.', { buildType: 'image' });
    expect(output).not.toContain('single self-contained index.html');
  });
});
