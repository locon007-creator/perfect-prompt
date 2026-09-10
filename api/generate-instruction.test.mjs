import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAIInstruction } from './generate.js';

const payload = {
  idea: 'Build a personal finance app with Welcome → Income Setup → Bills Setup → Setup Complete → Home. Before payday, if the amount is missing, ask for it, save it for the current cycle, and update calculations.',
  compiledPrompt: 'Build one self-contained index.html with inline CSS and JavaScript, no React, no framework, no build step, no extra files, strict 360–430 px phone portrait.',
  buildType: 'app',
  creationFormat: 'Android App',
  visualStyle: 'premium calm Android-style mobile interface'
};

test('app generation instruction preserves the finished-app prompt DNA', () => {
  const instruction = buildAIInstruction(payload);

  assert.match(instruction, /no arbitrary word count|do not shorten.*word count/i);
  assert.match(instruction, /Role.*Product.*one job.*workflow.*behavior.*screen.*persistence.*experience.*exclusions.*build contract/is);
  assert.match(instruction, /condition.*action.*save.*update/is);
  assert.match(instruction, /finished consumer app|finished premium consumer app/i);
  assert.match(instruction, /do not invent unrelated/i);
  assert.match(instruction, /USER IDEA:[\s\S]*Welcome → Income Setup → Bills Setup → Setup Complete → Home/);
  assert.match(instruction, /MINIMAL ENGINE WRAPPER:[\s\S]*index\.html/);
});
