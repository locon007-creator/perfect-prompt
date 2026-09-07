import { describe, expect, test } from 'vitest';
import { generate, parseIdea } from './compiler';
import { creationFormatOptions, type CreationFormat } from './creation-format';

const raw = 'Build a personal timesheet utility for recording work start and end times, daily hours, and a simple weekly total.';

const cases: Array<[CreationFormat,string,string]> = [
  ['android-app','Android App','Android'],
  ['ios-app','iOS App','iOS'],
  ['responsive-web-app','Responsive Web App','Responsive web'],
  ['desktop-app','Desktop App','Desktop'],
  ['dashboard','Dashboard','Dashboard'],
  ['mobile-utility','Mobile Utility','Mobile utility'],
  ['multi-screen-app','Multi-Screen App','Multi-screen app'],
  ['single-purpose-tool','Single-Purpose Tool','Single-purpose tool'],
  ['website-landing','Website / Landing Page','Website / landing page'],
  ['idea-decides','Let the idea decide','Not explicitly specified'],
];

describe('creation format routing', () => {
  test('exports every approved format option', () => {
    expect(creationFormatOptions.map(x => x.creationFormat)).toEqual(cases.map(x => x[0]));
  });

  test.each(cases)('%s changes format guidance without mutating Idea Lock', (creationFormat,label,medium) => {
    const before = parseIdea(raw);
    const output = generate(raw, { buildType: 'app-web-app', creationFormat, visualStyle: 'figma-product' });
    const after = parseIdea(raw);

    expect(after).toEqual(before);
    expect(output).toContain(`Creation format: ${label}`);
    expect(output).toContain(`Platform / medium: ${medium}`);
    expect(output).toContain('Locked instruction: Build a personal timesheet utility');
  });

  test('android format adds Android-specific execution guidance without inventing product features', () => {
    const output = generate(raw, { buildType: 'app-web-app', creationFormat: 'android-app', visualStyle: 'figma-product' });
    expect(output).toContain('Use Android/mobile interaction conventions');
    expect(output).toContain('thumb-friendly controls');
    expect(output).not.toContain('payroll');
    expect(output).not.toContain('employee management');
  });

  test('dashboard format does not become the default', () => {
    const output = generate(raw, { buildType: 'app-web-app', creationFormat: 'idea-decides', visualStyle: 'figma-product' });
    expect(output).not.toContain('Creation format: Dashboard');
    expect(output).not.toContain('dashboard layout');
  });

  test('explicit platform in the idea wins when format is let the idea decide', () => {
    const output = generate('Build an Android checklist app for one person. Required features: checklist.', { buildType: 'app-web-app', creationFormat: 'idea-decides', visualStyle: 'clean-utility' });
    expect(output).toContain('Platform / medium: Android');
  });
});
