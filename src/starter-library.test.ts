import { describe, expect, it } from 'vitest';
import { starterCategories } from './starter-library';

describe('starter library', () => {
  it('contains the five approved categories', () => {
    expect(starterCategories.map(x => x.id)).toEqual(['app','utility','productivity','finance','trucking']);
  });

  it('contains 5 to 7 starters per category', () => {
    for (const category of starterCategories) {
      expect(category.starters.length).toBeGreaterThanOrEqual(5);
      expect(category.starters.length).toBeLessThanOrEqual(7);
    }
  });

  it('contains no unrelated project names', () => {
    const text = JSON.stringify(starterCategories).toLowerCase();
    for (const forbidden of ['trucklog','drop & hook assistant','relayai','budget flow','car care pro','specsmith']) {
      expect(text).not.toContain(forbidden);
    }
  });
});
