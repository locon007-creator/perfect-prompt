import { describe, expect, it } from 'vitest';
import { generate, parseIdea } from './compiler';
import type { BuildType } from './intent';

const cases: Array<{ type: BuildType; idea: string; medium: string; structure: string; completion: string }> = [
  { type: 'app-web-app', idea: 'Build a checklist app for one person. Required features: checklist.', medium: 'responsive web', structure: 'Only screens explicitly required by the idea.', completion: 'locked requirement' },
  { type: 'website', idea: 'Build a website called Northstar for homeowners. Required features: contact form.', medium: 'Web', structure: 'Only pages explicitly required by the idea.', completion: 'page' },
  { type: 'game', idea: 'Build a puzzle game for casual players. Required features: score tracking.', medium: 'Game platform not specified', structure: 'Only gameplay screens or views explicitly required by the idea.', completion: 'gameplay' },
  { type: 'video', idea: 'Create a short launch video for small businesses. Required features: voiceover.', medium: 'Video production', structure: 'Only scenes, shots, or sequence requirements explicitly required by the idea.', completion: 'sequence' },
  { type: 'image', idea: 'Create an image of a glass cabin at sunrise. Required features: mountain background.', medium: 'Image generation', structure: 'Only subject, composition, framing, lighting, or environment requirements explicitly required by the idea.', completion: 'composition' },
  { type: 'general', idea: 'Create a prompt for summarizing meeting notes. Required features: concise summary.', medium: 'General prompt', structure: 'Only output format, content, or response structure explicitly required by the idea.', completion: 'requested output' }
];

describe('build type output framing', () => {
  for (const item of cases) {
    it(`uses ${item.type} terminology without mutating Idea Lock`, () => {
      const before = parseIdea(item.idea);
      const output = generate(item.idea, { buildType: item.type });
      const after = parseIdea(item.idea);
      expect(after).toEqual(before);
      expect(output).toContain(`Project type: ${item.type}`);
      expect(output).toContain(`Platform\n\n${item.medium}`);
      expect(output).toContain(item.structure);
      expect(output.toLowerCase()).toContain(item.completion.toLowerCase());
    });
  }

  it('does not leak responsive-web defaults into video, image, or general output', () => {
    for (const type of ['video', 'image', 'general'] as const) {
      const output = generate('Create a simple concept for one person. Required features: clear output.', { buildType: type });
      expect(output).not.toContain('Platform\n\nresponsive web');
    }
  });
});
