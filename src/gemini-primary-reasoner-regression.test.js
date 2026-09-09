import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source=fs.readFileSync(path.resolve(process.cwd(),'api/generate.js'),'utf8');

describe('Gemini primary reasoning instruction',()=>{
 it('treats the raw idea as highest authority and the Minimal Engine wrapper as hard guardrails',()=>{
  expect(source).toContain('USER IDEA is the highest authority');
  expect(source).toContain('MINIMAL ENGINE WRAPPER');
  expect(source).toContain('HTML hard lock');
  expect(source).toContain('one self-contained index.html');
  expect(source).toContain('360–430 px');
 });

 it('does not position Gemini as a repair bot for parser/compiler fragments',()=>{
  expect(source).not.toContain('repair malformed fragments');
  expect(source).not.toContain('compiler output is guidance, not authority');
  expect(source).not.toContain('The compiler gives you structure');
 });

 it('requires preservation of workflow, timing, conditions, persistence, exclusions, and relationships',()=>{
  expect(source).toContain('workflow');
  expect(source).toContain('timing');
  expect(source).toContain('conditions');
  expect(source).toContain('persistence');
  expect(source).toContain('exclusions');
  expect(source).toContain('relationships');
 });

 it('forbids relabeling requested screens with terminology the user explicitly excluded',()=>{
  expect(source).toContain('Do not relabel a requested screen with terminology or UI patterns the USER IDEA explicitly excludes');
  expect(source).toContain('if the USER IDEA rejects dashboards, keep Home as Home rather than renaming it a dashboard');
 });
});