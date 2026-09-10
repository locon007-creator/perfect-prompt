import {describe,it,expect} from 'vitest';
import {buildInitialPrompt,chooseAIPrompt} from './generation-flow';

const idea=`Build a Personal Financial Assistant for one person.
Income can be Fixed or Variable.
For Friday paydays, ask Thursday night how much is expected.
Bills remind 2–3 days before due.
Bills paid by credit card must never be deducted twice.`;

describe('compiler-first generation flow',()=>{
 it('runs the full deterministic compiler before Gemini receives the prompt',()=>{
  const out=buildInitialPrompt(idea,{buildType:'app-web-app',creationFormat:'ios-app',visualStyle:'figma-level'});
  expect(out).toContain('Role');
  expect(out).toContain('Product Mission');
  expect(out).toContain('Idea Lock');
  expect(out).toContain('Structure Requirements');
  expect(out).toContain('index.html');
  expect(out).toContain('Friday paydays');
 });

 it('keeps the deterministic compiler prompt when AI output violates the HTML lock',()=>{
  const fallback=buildInitialPrompt(idea,{buildType:'app-web-app',creationFormat:'ios-app'});
  const badAI='Creation Format: iOS App. Build with SwiftUI.';
  expect(chooseAIPrompt(fallback,badAI,'app-web-app')).toBe(fallback);
 });

 it('accepts audited AI output only when it preserves every HTML invariant',()=>{
  const fallback=buildInitialPrompt(idea,{buildType:'app-web-app'});
  const goodAI=`Build one complete self-contained index.html with inline CSS and JavaScript. No React, no framework, no build step, and no extra files. Target phone portrait 360–430 px. Product Brief: ${idea}`;
  expect(chooseAIPrompt(fallback,goodAI,'app-web-app')).toBe(goodAI);
 });
});