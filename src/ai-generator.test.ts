import {afterEach,describe,expect,it,vi} from 'vitest';
import {requestAIGeneration,validateAIPrompt} from './ai-generator';

describe('requestAIGeneration',()=>{
 afterEach(()=>vi.unstubAllGlobals());

 it('returns the Gemini prompt from the server endpoint',async()=>{
  const fetchMock=vi.fn().mockResolvedValue({
   ok:true,
   json:async()=>({prompt:'AI-enhanced prompt'})
  });
  vi.stubGlobal('fetch',fetchMock);

  const result=await requestAIGeneration({
   idea:'Build a personal timesheet app',
   compiledPrompt:'Deterministic compiler output',
   buildType:'app',
   creationFormat:'mobile-app',
   visualStyle:'premium'
  });

  expect(result).toBe('AI-enhanced prompt');
  expect(fetchMock).toHaveBeenCalledWith('/api/generate',expect.objectContaining({method:'POST'}));
 });

 it('throws when the API does not return a usable prompt',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({
   ok:false,
   json:async()=>({error:'Gemini unavailable'})
  }));

  await expect(requestAIGeneration({
   idea:'Build a personal timesheet app',
   compiledPrompt:'Deterministic compiler output',
   buildType:'app',
   creationFormat:'mobile-app',
   visualStyle:'premium'
  })).rejects.toThrow('Gemini unavailable');
 });
});

describe('validateAIPrompt',()=>{
 const valid=`Creation Format\nBuild one complete self-contained index.html with inline CSS and JavaScript. No React, no framework, no build step, and no extra files. Target phone portrait only, approximately 360–430 px wide.\n\nProduct Brief\nBuild a personal finance assistant.`;

 it('accepts an app prompt that preserves every HTML hard invariant',()=>{
  expect(validateAIPrompt(valid,'app-web-app')).toBe(true);
 });

 it('accepts semantically equivalent hard-lock wording produced by Gemini',()=>{
  const liveStyle=`Build a complete, single-file mobile web application (index.html). Everything must be contained in the single index.html file with inline CSS and JavaScript. No frameworks, no React, and no build steps. Target a strict mobile viewport of 360px–430px wide.`;
  expect(validateAIPrompt(liveStyle,'app-web-app')).toBe(true);
 });

 it('rejects missing index.html or inline CSS/JavaScript requirements',()=>{
  expect(validateAIPrompt(valid.replace('index.html','app file'),'app-web-app')).toBe(false);
  expect(validateAIPrompt(valid.replace('inline CSS and JavaScript','styles and scripts'),'app-web-app')).toBe(false);
 });

 it('rejects missing mobile portrait width lock for app builds',()=>{
  expect(validateAIPrompt(valid.replace('360–430 px','responsive'),'app-web-app')).toBe(false);
 });

 it('accepts responsive website HTML without forcing the app-only phone width lock',()=>{
  const website=`Build one complete self-contained index.html with inline CSS and JavaScript. No React, no framework, no build step, and no extra files. Use a responsive browser layout.`;
  expect(validateAIPrompt(website,'website')).toBe(true);
 });

 it('rejects native and framework stack drift',()=>{
  expect(validateAIPrompt(`${valid}\nCreation format: iOS App using SwiftUI.`,'app-web-app')).toBe(false);
  expect(validateAIPrompt(`${valid}\nBuild the interface as a React app.`,'app-web-app')).toBe(false);
  expect(validateAIPrompt(`${valid}\nUse Kotlin and Jetpack Compose.`,'app-web-app')).toBe(false);
 });

 it('does not apply HTML validation to non-builder media modes',()=>{
  expect(validateAIPrompt('Create one cinematic image prompt.','image')).toBe(true);
 });
});
