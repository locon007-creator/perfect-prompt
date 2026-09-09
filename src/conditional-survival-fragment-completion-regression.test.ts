import { describe, expect, it } from 'vitest';
import { generate } from './compiler';

const options = {
  buildType: 'app-web-app' as const,
  creationFormat: 'ios-app' as const,
  visualStyle: 'figma-product' as const,
};

const coreFeatures = (output: string) => output
  .split('Core Features\n\n')[1]
  ?.split('\n\nInteraction & State Rules\n\n')[0] || '';

describe('global conditional survival and fragment completion', () => {
  it('preserves multi-branch conditional behavior without broadening scoped exclusions', () => {
    const output = generate(`Example App\n\nMAIN WORKFLOW\nWelcome → Setup → Home\n\nSETUP\nIncome type: Fixed / Variable\n\nIf Variable:\nDo not ask for a permanent amount.\nOn payday, ask for the real amount received.\n\nIf Fixed:\nAsk for the expected amount during setup.\nPrefill it on payday and allow adjustment.`, options);

    expect(output).toContain('Welcome → Setup → Home');
    expect(output.toLowerCase()).toContain('if variable');
    expect(output.toLowerCase()).toContain('on payday');
    expect(output.toLowerCase()).toContain('real amount received');
    expect(output.toLowerCase()).toContain('if fixed');
    expect(output.toLowerCase()).toContain('expected amount during setup');
    expect(output.toLowerCase()).toContain('prefill it on payday');
    expect(output).not.toMatch(/Do Not Add[\s\S]*^Ask for a permanent amount\.$/im);
  });

  it('turns grouped screen requirements into complete build-ready instructions', () => {
    const output = generate(`Example App\n\nMAIN WORKFLOW\nSetup → Home\n\nSETUP\nFor each item ask:\n- Due date\n- Fixed or Variable\n- Expected amount only if Fixed\n\nHOME\nShow only what matters now:\n- Money received\n- Bills due soon\n- Money remaining`, options);
    const core = coreFeatures(output);

    expect(core).toMatch(/For each item, ask for Due date/i);
    expect(core).toMatch(/For each item, ask for Fixed or Variable/i);
    expect(core).toMatch(/For each item, ask for Expected amount only if Fixed/i);
    expect(core).toMatch(/Show Money received/i);
    expect(core).toMatch(/Show Bills due soon/i);
    expect(core).toMatch(/Show Money remaining/i);
    expect(core).not.toMatch(/^Show only what matters now:\s*(?:in Home)?\.?$/im);
  });

  it('does not emit low-signal sentence fragments as core features', () => {
    const output = generate(`Example App\n\nMAIN JOB\nHelp one person understand what has been paid and what remains.\n\nMAIN WORKFLOW\nHome`, options);
    const core = coreFeatures(output);
    expect(core).not.toMatch(/^Been paid\.$/im);
    expect(core).not.toMatch(/^What remains\.$/im);
  });
});
