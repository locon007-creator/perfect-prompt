import { describe, expect, it } from 'vitest';
import { buildTypeOptions, getSpecialistProfile } from './intent';

describe('build intent routing', () => {
  it('defines exactly six deterministic build types', () => {
    expect(buildTypeOptions.map(x => x.buildType)).toEqual([
      'app-web-app', 'website', 'game', 'video', 'image', 'general'
    ]);
  });

  it('maps each build type to the intended specialist role', () => {
    expect(getSpecialistProfile('app-web-app').role).toContain('Full-Stack Application Engineer');
    expect(getSpecialistProfile('website').role).toContain('Web Experience Engineer');
    expect(getSpecialistProfile('game').role).toContain('Gameplay Engineer');
    expect(getSpecialistProfile('video').role).toContain('Video Production Specialist');
    expect(getSpecialistProfile('image').role).toContain('Image Prompt Specialist');
    expect(getSpecialistProfile('general').role).toContain('Prompt Engineer');
  });
});
