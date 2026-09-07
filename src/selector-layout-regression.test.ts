import { describe, expect, it } from 'vitest';
import css from './selector-layout.css?raw';

describe('selector dropdown mobile layout', () => {
  it('keeps open selector menus in document flow so the next selector cannot overlap them', () => {
    expect(css).toContain('.selector-stack-item .build-options');
    expect(css).toContain('position:relative');
    expect(css).toContain('left:auto');
    expect(css).toContain('right:auto');
    expect(css).toContain('top:auto');
  });
});
