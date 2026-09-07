import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./selector-layout.css', import.meta.url), 'utf8');
const dropdownRule = css.match(/\.selector-stack-item \.build-options\{([^}]*)\}/)?.[1] ?? '';

describe('selector dropdown mobile layout', () => {
  it('keeps open selector menus in document flow so the next selector cannot overlap them', () => {
    expect(dropdownRule).toContain('position:relative');
    expect(dropdownRule).toContain('left:auto');
    expect(dropdownRule).toContain('right:auto');
    expect(dropdownRule).toContain('top:auto');
  });
});
