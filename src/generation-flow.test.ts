import {describe,it,expect} from 'vitest';
import {buildInitialPrompt,chooseAIPrompt} from './generation-flow';

const idea=`Build a Personal Financial Assistant for one person.
Income can be Fixed or Variable.
For Friday paydays, ask Thursday night how much is expected.
Bills remind 2–3 days before due.
Bills paid by credit card must never be deducted twice.`;

describe('Minimal Engine generation flow',()=>{
 it('uses the raw-idea Minimal Engine wrapper instead of parser-generated sections',()=>{
  const out=buildInitialPrompt(idea,{buildType:'app-web-app',creationFormat:'ios-app',visualStyle:'figma-level'});
  expect(out).toContain('Product Brief');
  expect(out).toContain(idea);
  expect(out).toContain('index.html');
  expect(out).not.toContain('Structure Requirements');
  expect(out).not.toContain('Idea Lock');
 });

 it('keeps the deterministic prompt when AI output violates the HTML lock',()=>{
  const fallback=buildInitialPrompt(idea,{buildType:'app-web-app',creationFormat:'ios-app'});
  const badAI='Creation Format: iOS App. Build with SwiftUI.';
  expect(chooseAIPrompt(fallback,badAI,'app-web-app')).toBe(fallback);
 });

 it('accepts AI output only when it preserves every HTML invariant',()=>{
  const fallback=buildInitialPrompt(idea,{buildType:'app-web-app'});
  const goodAI=`Build one complete self-contained index.html with inline CSS and JavaScript. No React, no framework, no build step, and no extra files. Target phone portrait 360–430 px. Product Brief: ${idea}`;
  expect(chooseAIPrompt(fallback,goodAI,'app-web-app')).toBe(goodAI);
 });
});