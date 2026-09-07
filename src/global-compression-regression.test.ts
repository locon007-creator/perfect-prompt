import { describe, expect, test } from 'vitest';
import { generate } from './compiler';

const section = (output: string, name: string, next?: string) => {
  const marker = `${name}\n\n`;
  const start = output.indexOf(marker);
  if (start < 0) return '';
  const bodyStart = start + marker.length;
  if (!next) return output.slice(bodyStart).trim();
  const endMarker = `\n\n${next}\n\n`;
  const end = output.indexOf(endMarker, bodyStart);
  return output.slice(bodyStart, end < 0 ? undefined : end).trim();
};

const samples = [
  `Drop & Hook Assistant\n\nBuild a premium mobile-first personal work app for one truck driver completing multiple drop-and-hook stops during a single workday.\n\nPrimary job:\nKeep the driver’s truck, route, stops, trailer changes, arrival/departure times, and mileage organized with minimal friction.\n\nMain workflow:\nHome → Start My Day → Day Setup → Create Route → Start Route → Work Mode → Day Complete → Ending Mileage → Finish Day.\n\nDay Setup:\nTruck number required, starting mileage required, trailer number optional. Save previously used trailer numbers for quick reuse.\n\nRules:\nNo notes field. No extra drop-and-hook fields. No in-app map.`,
  `Personal Timesheet\n\nBuild a premium personal timesheet for one worker. Main workflow: Home → Punch In → Active Shift → Punch Out → Saved Day. Home shows today’s date, shift status, live elapsed timer, today’s hours, and one large Punch In or Punch Out action. Weekly uses Sunday–Friday. Include History and local persistence. No teams, GPS, scheduling, employer dashboard, or payroll processing.`,
  `Budget Flow\n\nBuild a premium mobile-first budgeting app for one person. Primary job: set a monthly budget, track spending, and show money remaining. Main workflow: Set Budget → Budgets → Budget. Save budgets locally. No bank sync, teams, or accounting dashboard.`
];

describe('global prompt compression', () => {
  for (const idea of samples) {
    test('keeps Role concise and moves implementation rules out of role', () => {
      const output = generate(idea, { buildType: 'app-web-app', creationFormat: 'mobile-utility', visualStyle: 'premium-modern' });
      const role = section(output, 'Role', 'Product Mission');
      expect(role.split('\n').filter(Boolean).length).toBeLessThanOrEqual(3);
      expect(role).not.toContain('single self-contained index.html');
      expect(role).not.toContain('without a build step');
      const platform = section(output, 'Platform', 'Main Workflow');
      const constraints = section(output, 'Constraints', 'Do Not Add');
      expect(`${platform}\n${constraints}`).toContain('single self-contained index.html');
    });

    test('compresses Idea Lock to essential facts instead of replaying the source brief', () => {
      const output = generate(idea, { buildType: 'app-web-app', creationFormat: 'mobile-utility', visualStyle: 'premium-modern' });
      const lock = section(output, 'Idea Lock', 'Target User');
      const nonEmpty = lock.split('\n').filter(line => line.trim());
      expect(nonEmpty.length).toBeLessThanOrEqual(7);
      expect(lock).not.toContain('Locked instruction:');
      expect(lock).not.toContain('Main workflow:');
      expect(lock).not.toContain('Rules:');
    });

    test('keeps detailed workflow and requirements in their owned sections', () => {
      const output = generate(idea, { buildType: 'app-web-app', creationFormat: 'mobile-utility', visualStyle: 'premium-modern' });
      const lock = section(output, 'Idea Lock', 'Target User');
      const workflow = section(output, 'Main Workflow', 'Structure Requirements');
      const features = section(output, 'Core Features', 'Interaction & State Rules');
      expect(lock).not.toContain('→');
      expect(`${workflow}\n${features}`).toMatch(/Home|Set Budget|Punch In|Drop Trailer/i);
    });
  }
});
