/** @vitest-environment jsdom */
import { act } from 'react';
import { beforeAll, describe, expect, it } from 'vitest';

const buttonWithText = (text: string) => [...document.querySelectorAll('button')].find(button => button.textContent?.includes(text));
const click = async (button: Element | null | undefined) => {
  expect(button).toBeTruthy();
  await act(async () => {
    button!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
};

describe('Perfect Prompt primary UI flow', () => {
  beforeAll(async () => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    document.body.innerHTML = '<div id="root"></div>';
    localStorage.clear();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { readText: async () => '', writeText: async () => undefined }
    });
    await act(async () => {
      await import('./main');
    });
  });

  it('preserves selectors through starter routing, generates, saves, and reopens the prompt', async () => {
    expect(document.body.textContent).toContain('What would you like to build?');
    expect(document.body.textContent).toContain('How should it look?');

    await click(document.querySelector('.build-picker-trigger'));
    await click(buttonWithText('Website'));
    expect(document.querySelector('.build-picker-trigger strong')?.textContent).toBe('Website');

    await click(document.querySelector('.visual-trigger'));
    await click(buttonWithText('Apple-Level Minimal'));
    expect(document.querySelector('.visual-trigger strong')?.textContent).toBe('Apple-Level Minimal');

    await click(buttonWithText('Utility'));
    expect(document.querySelector('.page-heading h2')?.textContent).toBe('Utility');

    await click(buttonWithText('Grocery List'));
    expect(document.body.textContent).toContain('reuse recent entries');
    await click(buttonWithText('Send to Generator'));

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toContain('grocery list utility');
    expect(document.querySelector('.build-picker-trigger strong')?.textContent).toBe('Website');
    expect(document.querySelector('.visual-trigger strong')?.textContent).toBe('Apple-Level Minimal');

    await click(buttonWithText('Generate Prompt'));
    const output = document.querySelector('.output-panel pre')?.textContent || '';
    expect(output).toContain('Web Experience Engineer');
    expect(output).toContain('Interaction Design Specialist');
    expect(output).toContain('Project type: website');

    await click(buttonWithText('Save'));
    expect(JSON.parse(localStorage.getItem('perfect-prompt:saved') || '[]')).toHaveLength(1);

    await click(document.querySelector('[aria-label="Open menu"]'));
    await click(buttonWithText('Saved Prompts'));
    expect(document.querySelector('.saved-card pre')?.textContent).toContain('Project type: website');
  });
});
