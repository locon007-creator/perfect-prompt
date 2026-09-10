import{describe,it,expect}from'vitest';
import{readFileSync}from'node:fs';

describe('Gemini compiler audit instruction',()=>{
 it('keeps raw idea authority while auditing deterministic compiler output',()=>{
  const source=readFileSync(new URL('../api/generate.js',import.meta.url),'utf8');
  expect(source).toContain('USER IDEA — highest authority');
  expect(source).toContain('DETERMINISTIC PERFECT PROMPT COMPILER OUTPUT');
  expect(source).toContain('Compare the USER IDEA against the compiler output requirement-by-requirement');
  expect(source).toContain('Restore any requirement');
  expect(source).toContain('Preserve exact workflow order');
  expect(source).toContain('premium build quality');
 });
});