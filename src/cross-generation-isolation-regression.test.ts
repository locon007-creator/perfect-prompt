import { describe, expect, it } from 'vitest';
import { generate } from './compiler';

describe('cross-generation isolation', () => {
  it('does not carry unique terms from one generation into the next', () => {
    const first = generate(`Build HarborLedger for one person.\nWORKFLOW\nHome → Dock Log → Home\nDOCK LOG\nTrack berth code ZEPHYR-917 and mooring notes.`);
    expect(first).toContain('ZEPHYR-917');

    const second = generate(`Build PantryPulse for one person.\nWORKFLOW\nHome → Add Ingredient → Pantry\nADD INGREDIENT\nTrack ingredient name and expiry date.`);
    expect(second).not.toContain('ZEPHYR-917');
    expect(second).not.toMatch(/berth|mooring/i);
    expect(second).toMatch(/ingredient|expiry/i);
  });

  it('isolates three sequential unrelated generations', () => {
    const outputs = [
      generate('Build AlphaNote for one person. Workflow: Home → Note → Home. Required features: COBALT-441 note marker.'),
      generate('Build BetaTimer for one person. Workflow: Home → Timer → Home. Required features: AMBER-552 timer marker.'),
      generate('Build GammaList for one person. Workflow: Home → List → Home. Required features: IVORY-663 list marker.'),
    ];
    expect(outputs[1]).not.toContain('COBALT-441');
    expect(outputs[2]).not.toContain('COBALT-441');
    expect(outputs[2]).not.toContain('AMBER-552');
    expect(outputs[2]).toContain('IVORY-663');
  });
});
