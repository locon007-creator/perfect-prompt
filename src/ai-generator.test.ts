import {afterEach,describe,expect,it,vi} from 'vitest';
import {requestAIGeneration} from './ai-generator';

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
