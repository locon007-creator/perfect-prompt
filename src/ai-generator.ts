export type AIGenerationRequest={
 idea:string;
 compiledPrompt?:string;
 buildType?:string;
 creationFormat?:string;
 visualStyle?:string;
};

// Legacy compatibility only. The live generator no longer uses compiler validation.
export function validateAIPrompt(prompt:string,_buildType=''):boolean{
 return typeof prompt==='string'&&Boolean(prompt.trim());
}

export async function requestAIGeneration(payload:AIGenerationRequest):Promise<string>{
 const response=await fetch('/api/generate',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({idea:payload.idea})
 });
 const data=await response.json().catch(()=>({}));
 if(!response.ok){throw new Error(typeof data?.error==='string'?data.error:'Gemini generation is unavailable.');}
 const prompt=typeof data?.prompt==='string'?data.prompt.trim():'';
 if(!prompt)throw new Error('Gemini returned an empty prompt.');
 return prompt;
}
