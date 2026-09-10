import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAIInstruction } from './generate.js';

const payload = {
  idea: 'Build a personal finance app with Welcome → Income Setup → Bills Setup → Setup Complete → Home. Before payday, if the amount is missing, ask for it, save it for the current cycle, and update calculations.',
  compiledPrompt: 'Role\nSenior Product Designer\nProduct Mission\nKeep the real money picture accurate.\nIdea Lock\nWelcome → Income Setup → Bills Setup → Setup Complete → Home.\nCreation Format\nBuild one self-contained index.html with inline CSS and JavaScript, no React, no framework, no build step, no extra files, strict 360–430 px phone portrait.',
  buildType: 'app',
  creationFormat: 'Android App',
  visualStyle: 'premium calm Android-style mobile interface'
};

test('Gemini audits and repairs deterministic compiler output instead of replacing the compiler', () => {
  const instruction = buildAIInstruction(payload);

  assert.match(instruction, /semantic quality-control|semantic verifier|audit/i);
  assert.match(instruction, /compiler gives you structure|compiler output/i);
  assert.match(instruction, /compare the USER IDEA against the compiler output requirement-by-requirement/i);
  assert.match(instruction, /restore any requirement|restore anything/i);
  assert.match(instruction, /remove.*accidental features|remove.*not supported/i);
  assert.match(instruction, /finished premium consumer app|premium build quality/i);
  assert.match(instruction, /no arbitrary word count|do not shorten.*word count/i);
  assert.match(instruction, /USER IDEA:[\s\S]*Welcome → Income Setup → Bills Setup → Setup Complete → Home/);
  assert.match(instruction, /DETERMINISTIC PERFECT PROMPT COMPILER OUTPUT:[\s\S]*Idea Lock/);
});
