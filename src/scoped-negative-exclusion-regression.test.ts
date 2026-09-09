import { describe, expect, it } from 'vitest';
import { generate } from './compiler';

describe('scoped negative exclusion validation', () => {
  it('does not treat a conditional prohibition as positive functionality', () => {
    const raw = `Build a personal assistant.\n\nMAIN WORKFLOW\nWelcome → Income Setup → Home\n\nINCOME SETUP\nIncome Type: Fixed / Variable.\nFixed: ask for an expected amount.\nVariable: do not ask for a permanent amount.\nOn payday ask for the real amount.\n\nDO NOT ADD\nAsk for a permanent amount for variable income.`;
    expect(() => generate(raw, { buildType: 'app-web-app', creationFormat: 'ios-app' })).not.toThrow();
  });

  it('still rejects a real positive use of an excluded capability', () => {
    const raw = `Build a notes app.\nWorkflow: Home → Editor.\nRequired features: sharing.\nDo not add sharing.`;
    expect(() => generate(raw)).toThrow();
  });
});
