import{describe,it,expect}from'vitest';
import{readFileSync}from'node:fs';

describe('Gemini Minimal Engine reasoning instruction',()=>{
 it('keeps raw idea authority and preserves hard creation-format guardrails',()=>{
  const source=readFileSync(new URL('../api/generate.js',import.meta.url),'utf8');
  expect(source).toContain('USER IDEA is the highest authority');
  expect(source).toContain('MINIMAL ENGINE WRAPPER contains non-negotiable creation-format and execution guardrails');
  expect(source).toContain('Preserve every stated workflow step');
  expect(source).toContain('Never summarize away meaningful product logic');
  expect(source).toContain('one self-contained index.html');
 });
});
