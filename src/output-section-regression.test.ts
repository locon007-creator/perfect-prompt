import { describe, expect, it } from 'vitest';
import { generate } from './compiler';

const between = (output: string, start: string, end: string) =>
  output.split(start)[1]?.split(end)[0]?.trim() ?? '';

describe('final prompt section fallbacks', () => {
  it('does not emit empty structured sections for a sparse natural idea', () => {
    const output = generate('Build a simple personal timer for one person to track focused work sessions.');
    expect(between(output, 'Core Features', 'Interaction & State Rules')).not.toBe('');
    expect(between(output, 'Interaction & State Rules', 'Visual Direction')).not.toBe('');
    expect(between(output, 'Constraints', 'Do Not Add')).not.toBe('');
    expect(between(output, 'Do Not Add', 'Completion Standard')).not.toBe('');
  });
});
