import { describe, expect, test } from 'vitest';
import { generate } from './compiler';
import { buildTypeOptions } from './intent';
import { creationFormatOptions } from './creation-format';
import { visualStyleOptions } from './visual-style';

const section = (output: string, name: string, next: string) => output.split(`${name}\n\n`)[1]?.split(`\n\n${next}\n\n`)[0] || '';
const healthy = (output: string) => {
  for (const heading of ['Role','Product Mission','Idea Lock','Target User','Platform','Main Workflow','Structure Requirements','Core Features','Interaction & State Rules','Visual Direction','Build Quality & Brand Experience','Constraints','Do Not Add','Completion Standard']) expect(output).toContain(heading);
  expect(output).not.toMatch(/undefined|\[object Object\]/);
};

const cases = [
  {
    name: 'Android loan tracker without invented workflow',
    idea: 'Build a simple loan tracker for one person on Android. Record a balance, payment dates, payment amounts, and remaining balance. Do not add teams, payments processing, or lender dashboards.',
    options: { buildType: 'app-web-app', creationFormat: 'android-app', visualStyle: 'premium-modern' } as const,
    check: (out: string) => {
      expect(out).toContain('Platform / medium: Android');
      expect(section(out,'Main Workflow','Structure Requirements')).toContain('No workflow was specified; do not invent one.');
      expect(section(out,'Completion Standard','')).not.toContain('preserve the explicitly provided workflow');
      expect(out).toContain('single self-contained index.html');
    }
  },
  {
    name: 'Mobile utility with explicit workflow and persistence',
    idea: 'Drop & Hook Assistant\nBuild a personal mobile utility for one truck driver. Main workflow: Home → Day Setup → Create Route → Work Mode → Finish Day. Save active-day state locally. No in-app map. No notes field.',
    options: { buildType: 'app-web-app', creationFormat: 'mobile-utility', visualStyle: 'figma-product' } as const,
    check: (out: string) => {
      expect(section(out,'Main Workflow','Structure Requirements')).toContain('Home → Day Setup → Create Route → Work Mode → Finish Day');
      expect(section(out,'Completion Standard','')).toContain('preserve the explicitly provided workflow');
      expect(section(out,'Do Not Add','Completion Standard').toLowerCase()).toContain('in-app map');
    }
  },
  {
    name: 'Responsive web app with optional feature',
    idea: 'Build a responsive personal budgeting app. Workflow: Home → Budget → Saved Budget. Required features: monthly budget and remaining balance. Optional: category labels. Save data locally. No social features.',
    options: { buildType: 'app-web-app', creationFormat: 'responsive-web-app', visualStyle: 'apple-minimal' } as const,
    check: (out: string) => {
      expect(out).toContain('Optional: Category labels.');
      expect(out).toContain('responsive');
      expect(section(out,'Core Features','Interaction & State Rules')).toContain('monthly budget');
    }
  },
  {
    name: 'Timesheet workflow remains ordered',
    idea: 'Build a personal timesheet for one worker on Android. Main workflow: Home → Punch In → Active Shift → Punch Out → Saved Day. Show a live elapsed timer, save entries locally, and show a Sunday–Friday weekly total. No teams or GPS.',
    options: { buildType: 'app-web-app', creationFormat: 'android-app', visualStyle: 'clean-utility' } as const,
    check: (out: string) => {
      const flow = section(out,'Main Workflow','Structure Requirements');
      expect(flow).toContain('Home → Punch In → Active Shift → Punch Out → Saved Day');
      expect(out.toLowerCase()).toContain('weekly total');
      expect(out.toLowerCase()).toContain('gps');
    }
  },
  {
    name: 'General prompt keeps non-app framing',
    idea: 'Create a prompt that summarizes meeting notes into decisions, owners, and next actions. Keep it concise.',
    options: { buildType: 'general', creationFormat: 'idea-decides', visualStyle: 'custom' } as const,
    check: (out: string) => {
      expect(out.toLowerCase()).toContain('requested output');
      expect(out).not.toContain('single self-contained index.html');
    }
  }
];

describe('temporary global acceptance suite', () => {
  test.each(cases)('$name', ({ idea, options, check }) => {
    const out = generate(idea, options);
    healthy(out);
    check(out);
  });

  test('full option registries still generate healthy output', () => {
    const idea = 'Build a personal checklist utility for one person. Workflow: Home → Checklist. Save locally. No sharing.';
    for (const b of buildTypeOptions) healthy(generate(idea, { buildType: b.buildType, creationFormat: 'idea-decides', visualStyle: 'custom' }));
    for (const f of creationFormatOptions) healthy(generate(idea, { buildType: 'app-web-app', creationFormat: f.creationFormat, visualStyle: 'custom' }));
    for (const v of visualStyleOptions) healthy(generate(idea, { buildType: 'app-web-app', creationFormat: 'idea-decides', visualStyle: v.visualStyle }));
  });
});
