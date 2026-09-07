import { describe, expect, test } from 'vitest';
import { generate } from './compiler';
import { buildTypeOptions } from './intent';
import { creationFormatOptions } from './creation-format';
import { visualStyleOptions } from './visual-style';

const appIdea = 'Build a personal checklist app for one person. Main workflow: Home → Checklist. Home should show the checklist. Save checklist data locally. No sharing.';

const assertHealthy = (output: string) => {
  for (const section of ['Role', 'Product Mission', 'Idea Lock', 'Target User', 'Platform', 'Main Workflow', 'Structure Requirements', 'Core Features', 'Interaction & State Rules', 'Constraints', 'Do Not Add', 'Completion Standard']) {
    expect(output).toContain(section);
  }
  expect(output).not.toContain('undefined');
  expect(output).not.toContain('[object Object]');
};

describe('all Perfect Prompt options smoke matrix', () => {
  test.each(buildTypeOptions.map(option => [option.label, option.buildType] as const))('build type: %s', (_label, buildType) => {
    const output = generate(appIdea, { buildType, creationFormat: 'idea-decides', visualStyle: 'custom' });
    assertHealthy(output);
  });

  test.each(creationFormatOptions.map(option => [option.label, option.creationFormat] as const))('creation format: %s', (_label, creationFormat) => {
    const output = generate(appIdea, { buildType: 'app-web-app', creationFormat, visualStyle: 'custom' });
    assertHealthy(output);
  });

  test.each(visualStyleOptions.map(option => [option.label, option.visualStyle] as const))('visual style: %s', (_label, visualStyle) => {
    const output = generate(appIdea, { buildType: 'app-web-app', creationFormat: 'idea-decides', visualStyle });
    assertHealthy(output);
  });
});
