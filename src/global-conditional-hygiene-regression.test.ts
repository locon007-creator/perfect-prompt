import { describe, expect, it } from 'vitest';
import { compile, generate } from './compiler';

describe('global conditional survival and hygiene', () => {
  it('preserves conditional behavior without domain-specific rules', () => {
    const raw = `Build a simple personal app.\n\nPRIMARY WORKFLOW\nWelcome → Setup → Home\n\nSETUP\nIf Variable:\nAsk for the real value when needed.\nOtherwise use the saved expected value.\nOnly when action is required, show the question.\nWhen complete, return to Home.`;
    const prompt = compile(raw);
    const states = prompt.states.join('\n').toLowerCase();
    expect(states).toContain('if variable: ask for the real value when needed');
    expect(states).toContain('otherwise use the saved expected value');
    expect(states).toContain('only when action is required, show the question');
    expect(states).toContain('when complete, return to home');
  });

  it('removes orphaned parser fragments from final output', () => {
    const raw = `Build a personal utility.\n\nPRIMARY WORKFLOW\nHome → Add Item → Home\n\nADD ITEM\nAllow:\nInclude:\nShow:\nUse a date picker.\nAdd one item.`;
    const output = generate(raw);
    expect(output).not.toMatch(/^\s*(?:Allow|Include|Show|Add|Use|Provide|Ask)\s*[:.\-]?\s*$/gim);
    expect(output.toLowerCase()).toContain('date picker');
  });
});
