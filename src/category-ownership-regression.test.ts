import { describe, expect, test } from 'vitest';
import { generate } from './compiler';

const section = (output: string, name: string, next: string) => {
  const start = `${name}\n`;
  const body = output.startsWith(start) ? output.slice(start.length) : output.split(`\n\n${name}\n\n`)[1] || '';
  return (body.split(`\n\n${next}\n\n`)[0] || '').trim();
};

const dropHook = `Drop & Hook Assistant

Build a premium mobile-first personal work app for one truck driver completing multiple drop-and-hook stops during a single workday.

Primary job:
Keep the driver’s truck, route, stops, trailer changes, arrival/departure times, and mileage organized with minimal friction.

Main workflow:
Home → Start My Day → Day Setup → Create Route → Start Route → Work Mode → Day Complete → Ending Mileage → Finish Day.

Day Setup:
Truck number required, starting mileage required, trailer number optional. Save previously used trailer numbers for quick reuse.

Create Route:
Use an OSM-powered stop search connected to StopSearch so location search is already functional in the downloaded build. Pressing + Add Stop opens a search page for businesses/facilities and addresses. Allow adding, editing, deleting, and reordering stops.

Work Mode:
Show the active business name and address, arrival time, departure time, and a Drop & Hook label. Include one collapsible Drop & Hook section attached directly to the active stop card.

The collapsible section must contain only these four fields:
- Drop Trailer
- Pickup Trailer
- Reference Number
- Seal Number

Trailer continuity is required: the trailer entered as Pickup Trailer at one stop automatically becomes the Drop Trailer at the next stop and continues through the route until changed.

Route & Equipment:
Provide a top-right control that opens a compact bottom sheet for editing the route or current equipment.

Rules:
No notes field. No extra drop-and-hook fields. No in-app map. Navigation can open externally. Keep the interface optimized for 360–430 px portrait Android screens with large touch targets, persistent active-day state, and a clean premium visual hierarchy.`;

describe('category ownership audit', () => {
  test('keeps product mission grammatical and role concise', () => {
    const output = generate(dropHook, { buildType: 'app-web-app', creationFormat: 'responsive-web-app', visualStyle: 'apple-minimal' });
    const role = section(output, 'Role', 'Product Mission');
    const mission = section(output, 'Product Mission', 'Idea Lock');
    expect(role.match(/You are /g)?.length ?? 0).toBe(1);
    expect(mission).not.toMatch(/focused on\s+Keep\b/i);
    expect(mission).toContain('Keep the driver’s truck, route, stops, trailer changes, arrival/departure times, and mileage organized with minimal friction');
  });

  test('keeps behavior out of Structure Requirements', () => {
    const output = generate(dropHook, { buildType: 'app-web-app', creationFormat: 'responsive-web-app', visualStyle: 'apple-minimal' });
    const structure = section(output, 'Structure Requirements', 'Core Features');
    expect(structure).not.toContain('Add Stop opens a search');
    expect(structure).not.toContain('Start My Day');
    expect(structure).not.toContain('Start Route');
    expect(structure).toContain('Home');
    expect(structure).toContain('Day Setup');
    expect(structure).toContain('Create Route');
    expect(structure).toContain('Work Mode');
    expect(structure).toContain('Ending Mileage');
  });

  test('routes functional requirements into Core Features instead of losing them', () => {
    const output = generate(dropHook, { buildType: 'app-web-app', creationFormat: 'responsive-web-app', visualStyle: 'apple-minimal' });
    const core = section(output, 'Core Features', 'Interaction & State Rules');
    expect(core).toContain('OSM-powered stop search connected to StopSearch');
    expect(core).toMatch(/Add Stop.*search/i);
    expect(core).toMatch(/adding, editing, deleting, and reordering stops/i);
    expect(core).toMatch(/collapsible Drop & Hook section/i);
    expect(core).toMatch(/Drop Trailer/i);
    expect(core).toMatch(/Pickup Trailer/i);
    expect(core).toMatch(/Reference Number/i);
    expect(core).toMatch(/Seal Number/i);
    expect(core).toMatch(/Pickup Trailer.*Drop Trailer.*next stop/i);
  });

  test('keeps state, persistence, and mobile constraints as complete instructions', () => {
    const output = generate(dropHook, { buildType: 'app-web-app', creationFormat: 'responsive-web-app', visualStyle: 'apple-minimal' });
    const states = section(output, 'Interaction & State Rules', 'Visual Direction');
    const constraints = section(output, 'Constraints', 'Do Not Add');
    expect(states).toMatch(/Save previously used trailer numbers for quick reuse/i);
    expect(states).toMatch(/persistent active-day state/i);
    expect(states.split('\n')).not.toContain('route');
    expect(states.split('\n')).not.toContain('stops');
    expect(constraints).toMatch(/360–430 px portrait Android/i);
    expect(constraints).toMatch(/large touch targets/i);
  });

  test('preserves compound exclusions without splitting hyphenated words', () => {
    const output = generate(dropHook, { buildType: 'app-web-app', creationFormat: 'responsive-web-app', visualStyle: 'apple-minimal' });
    const exclusions = section(output, 'Do Not Add', 'Completion Standard');
    expect(exclusions).toContain('Extra drop-and-hook fields.');
    expect(exclusions).toContain('Notes field.');
    expect(exclusions).toContain('In-app map.');
    expect(exclusions).not.toContain('Extra drop-.');
    expect(exclusions).not.toContain('Hook fields.');
  });
});
