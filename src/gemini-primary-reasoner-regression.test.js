import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source=fs.readFileSync(path.resolve(process.cwd(),'api/generate.js'),'utf8');

describe('Gemini verifier instruction',()=>{
 it('positions Gemini after the deterministic compiler',()=>{
  expect(source).toContain('semantic quality-control');
  expect(source).toContain('deterministic compiler gives you structure');
  expect(source).toContain('DETERMINISTIC PERFECT PROMPT COMPILER OUTPUT');
 });

 it('requires a requirement-by-requirement audit and repair',()=>{
  expect(source).toContain('Compare the USER IDEA against the compiler output requirement-by-requirement');
  expect(source).toContain('Restore any requirement');
  expect(source).toContain('Remove compiler-generated filler');
 });

 it('preserves workflow, timing, conditions, persistence, exclusions, relationships, and hard format rules',()=>{
  expect(source).toContain('workflow');
  expect(source).toContain('timing');
  expect(source).toContain('conditions');
  expect(source).toContain('persistence');
  expect(source).toContain('exclusions');
  expect(source).toContain('relationships');
  expect(source).toContain('Preserve hard creation-format constraints');
 });
});