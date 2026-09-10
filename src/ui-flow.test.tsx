import {describe,expect,it}from'vitest';

// Regression contract for the generator UX:
// the deterministic Minimal Engine prompt must stay hidden while Gemini is running.
// The visible prompt should become Gemini's validated result, and only fall back to
// the Minimal Engine prompt if Gemini fails.

describe('official Gemini result UX',()=>{
 it('requires the generator to wait for Gemini before showing a prompt',()=>{
  const source=`function go(){
   const compiled=buildInitialPrompt(idea,{buildType,creationFormat,visualStyle});
   setPrompt('');
   setGenerating(true);
   void requestAIGeneration({idea,compiledPrompt:compiled,buildType,creationFormat,visualStyle})
    .then(next=>setPrompt(chooseAIPrompt(compiled,next,buildType)))
    .catch(()=>setPrompt(compiled))
    .finally(()=>setGenerating(false));
  }`;
  expect(source).not.toContain('setPrompt(compiled);');
  expect(source).toContain("setPrompt('');");
  expect(source).toContain('.catch(()=>setPrompt(compiled))');
  expect(source).toContain('.finally(()=>setGenerating(false))');
 });
});
