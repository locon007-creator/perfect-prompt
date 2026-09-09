export type AIGenerationRequest={
 idea:string;
 compiledPrompt:string;
 buildType:string;
 creationFormat:string;
 visualStyle:string;
};

export async function requestAIGeneration(payload:AIGenerationRequest):Promise<string>{
 const response=await fetch('/api/generate',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify(payload)
 });
 const data=await response.json().catch(()=>({}));
 if(!response.ok){throw new Error(typeof data?.error==='string'?data.error:'AI generation is unavailable.');}
 const prompt=typeof data?.prompt==='string'?data.prompt.trim():'';
 if(!prompt)throw new Error('AI generation returned an empty prompt.');
 return prompt;
}
