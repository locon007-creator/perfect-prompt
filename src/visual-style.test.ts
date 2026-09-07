import { describe, expect, it } from 'vitest';
import { getVisualStyleProfile, visualStyleOptions } from './visual-style';

describe('visual style routing', () => {
  it('defines exactly six approved visual styles with Premium Modern first', () => {
    expect(visualStyleOptions.map(x => x.visualStyle)).toEqual([
      'premium-modern','apple-minimal','figma-product','bold-cinematic','clean-utility','custom'
    ]);
    expect(visualStyleOptions[0].label).toBe('Premium Modern');
  });

  it('maps each style to the intended design specialist', () => {
    expect(getVisualStyleProfile('premium-modern').role).toContain('Design Systems Specialist');
    expect(getVisualStyleProfile('apple-minimal').role).toContain('Interaction Design Specialist');
    expect(getVisualStyleProfile('figma-product').role).toContain('Product Design Lead');
    expect(getVisualStyleProfile('bold-cinematic').role).toContain('Creative UI Director');
    expect(getVisualStyleProfile('clean-utility').role).toContain('Information Hierarchy Specialist');
    expect(getVisualStyleProfile('custom').role).toContain('explicit visual direction');
  });
});