import{describe,it,expect}from'vitest';
import{readFileSync}from'node:fs';

describe('Gemini semantic audit instruction',()=>{
 it('requires comparing raw idea against compiler output and restoring lost meaning',()=>{
  const source=readFileSync(new URL('../api/generate.js',import.meta.url),'utf8');
  expect(source).toContain('Compare the USER IDEA against the compiler output requirement-by-requirement');
  expect(source).toContain('Restore any requirement, workflow rule, state behavior, constraint, exclusion, or product logic');
  expect(source).toContain('Treat malformed, truncated, vague, or incomplete compiler fragments as defects to repair');
  expect(source).toContain('The compiler is guidance and guardrails, not a source that outranks the USER IDEA');
  expect(source).toContain('Do not merely polish or paraphrase the compiler output');
 });
});
