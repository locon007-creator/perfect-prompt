import { describe, expect, it } from 'vitest';
import { generate } from './compiler';
import { IDEA_CHARACTER_LIMIT } from './generator-limits';

describe('global context-aware exclusions', () => {
  it('does not treat a negative exclusion as a positive requirement when conditional behavior is explicitly allowed', () => {
    const raw = `Build a personal assistant for one person.\n\nMAIN WORKFLOW:\nWelcome → Setup → Home\n\nSETUP\nChoose Fixed or Variable.\nIf Fixed, enter the normal expected amount.\nIf Variable, do not assume an amount; ask for the real amount when needed.\n\nDO NOT ADD\nAsk for a permanent amount.`;

    const output = generate(raw);
    expect(output).toContain('Welcome → Setup → Home');
    expect(output).toMatch(/Fixed/i);
    expect(output).toMatch(/Variable/i);
    expect(output).toContain('Ask for a permanent amount');
  });

  it('supports detailed briefs up to 5000 characters', () => {
    expect(IDEA_CHARACTER_LIMIT).toBe(5000);
  });
});
