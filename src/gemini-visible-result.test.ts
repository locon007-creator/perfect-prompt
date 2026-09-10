// @vitest-environment jsdom
import {afterEach,describe,expect,it,vi} from 'vitest';
import {requestAIGeneration} from './ai-generator';

const payload={idea:'Build a simple personal timesheet.',compiledPrompt:'Minimal Engine fallback prompt',buildType:'app-web-app',creationFormat:'android-app',visualStyle:'premium-minimal'};

afterEach(()=>{
 vi.restoreAllMocks();
 document.documentElement.removeAttribute('data-ai-generating');
});

describe('Gemini official visible result state',()=>{
 it('marks generation active until Gemini returns',async()=>{
  let resolveFetch!:(value:Response)=>void;
  vi.stubGlobal('fetch',vi.fn(()=>new Promise<Response>(resolve=>{resolveFetch=resolve})));
  const pending=requestAIGeneration(payload);
  expect(document.documentElement.dataset.aiGenerating).toBe('true');
  resolveFetch(new Response(JSON.stringify({prompt:'Gemini final prompt'}),{status:200,headers:{'Content-Type':'application/json'}}));
  await expect(pending).resolves.toBe('Gemini final prompt');
  expect(document.documentElement.dataset.aiGenerating).toBeUndefined();
 });

 it('clears generation state when Gemini fails so the fallback can show',async()=>{
  vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({error:'Gemini unavailable'}),{status:502,headers:{'Content-Type':'application/json'}})));
  await expect(requestAIGeneration(payload)).rejects.toThrow('Gemini unavailable');
  expect(document.documentElement.dataset.aiGenerating).toBeUndefined();
 });
});
