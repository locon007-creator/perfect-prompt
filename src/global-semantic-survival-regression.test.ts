import { describe, expect, it } from 'vitest';
import { compile, generate } from './compiler';

const cases = [
  {
    name: 'finance-style setup flow',
    raw: `Build a personal assistant for one person.\n\nPRIMARY WORKFLOW\nWelcome → Income Setup → Bills Setup → Home\n\nINCOME SETUP\nChoose Fixed or Variable.\nChoose pay frequency.\n\nBILLS SETUP\nUse tap-based bill choices.\nSave due dates.`,
    workflow: 'Welcome → Income Setup → Bills Setup → Home',
    owned: 'In Income Setup, choose Fixed or Variable',
  },
  {
    name: 'task flow',
    raw: `Build a daily task app for one person.\n\nPRIMARY WORKFLOW\nHome → Add Task → Today → Focus Task → Complete → Daily Summary\n\nADD TASK\nUse minimal typing.\nChoose Today, Tomorrow, or Pick Date.\n\nFOCUS TASK\nShow one task and one Complete action.`,
    workflow: 'Home → Add Task → Today → Focus Task → Complete → Daily Summary',
    owned: 'In Add Task, use minimal typing',
  },
  {
    name: 'recipe flow',
    raw: `Build a weeknight recipe helper.\n\nMAIN WORKFLOW\nHome → Choose Recipe → Cook → Finish\n\nCHOOSE RECIPE\nShow quick filters.\nRemember recent choices.\n\nCOOK\nShow one step at a time.`,
    workflow: 'Home → Choose Recipe → Cook → Finish',
    owned: 'In Choose Recipe, show quick filters',
  },
  {
    name: 'driver flow',
    raw: `Build a personal route helper.\n\nWORKFLOW\nHome → Create Route → Work Mode → Day Complete\n\nCREATE ROUTE\nAdd and reorder stops.\n\nWORK MODE\nShow the active stop.`,
    workflow: 'Home → Create Route → Work Mode → Day Complete',
    owned: 'In Create Route, add and reorder stops',
  },
];

describe('global semantic survival', () => {
  for (const testCase of cases) {
    it(testCase.name, () => {
      const prompt = compile(testCase.raw);
      const output = generate(testCase.raw);
      expect(prompt.workflow).toBe(testCase.workflow);
      expect(prompt.features.some(feature => feature.toLowerCase().includes(testCase.owned.toLowerCase()))).toBe(true);
      expect(output).toContain(testCase.workflow);
      expect(output).not.toContain('No workflow was specified; do not invent one.');
    });
  }
});
