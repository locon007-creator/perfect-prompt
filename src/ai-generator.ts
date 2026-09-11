export type AIGenerationRequest={
 idea:string;
};

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
