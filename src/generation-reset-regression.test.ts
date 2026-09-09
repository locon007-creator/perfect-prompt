// @ts-nocheck
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('fresh generation reset boundary', () => {
  it('clears transient generation keys on page refresh without clearing saved prompts', () => {
    const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
    const transient = [
      'perfect-prompt:last',
      'perfect-prompt:idea',
      'perfect-prompt:prompt',
      'perfect-prompt:generation',
      'perfect-prompt:session',
      'perfect-prompt:parsed-lock',
      'perfect-prompt:inference',
    ];
    for (const key of transient) expect(html).toContain(`'${key}'`);
    expect(html).not.toContain("localStorage.removeItem('perfect-prompt:saved')");
    expect(html).not.toContain("sessionStorage.removeItem('perfect-prompt:saved')");
  });
});
