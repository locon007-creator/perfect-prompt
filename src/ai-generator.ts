export type AIGenerationRequest={
 idea:string;
 compiledPrompt:string;
 buildType:string;
 creationFormat:string;
 visualStyle:string;
};

const isHtmlBuilderType=(buildType:string)=>{
 const value=(buildType||'').toLowerCase();
 return ['app-web-app','app','web-app','website','game'].includes(value);
};

const isMobileAppType=(buildType:string)=>{
 const value=(buildType||'').toLowerCase();
 return ['app-web-app','app','web-app'].includes(value);
};

function setAIGenerating(active:boolean){
 if(typeof document==='undefined')return;
 const root=document.documentElement;
 if(active){
  root.dataset.aiGenerating='true';
  if(!document.getElementById('perfect-prompt-ai-state-style')){
   const style=document.createElement('style');
   style.id='perfect-prompt-ai-state-style';
   style.textContent=`
    [data-ai-generating="true"] .output-panel.has-output pre{display:none}
    [data-ai-generating="true"] .output-panel.has-output::before{content:"Generating with Gemini…";display:block;padding:24px 18px;text-align:center;font-weight:700;letter-spacing:-.01em}
    [data-ai-generating="true"] .output-actions{pointer-events:none;opacity:.45}
   `;
   document.head.appendChild(style);
  }
 }else{
  root.removeAttribute('data-ai-generating');
 }
}

export function validateAIPrompt(prompt:string,buildType:string):boolean{
 const text=typeof prompt==='string'?prompt.trim():'';
 if(!text)return false;
 if(!isHtmlBuilderType(buildType))return true;

 const required=[
  /\bindex\.html\b/i,
  /inline\s+css\s+and\s+javascript/i,
  /\bno\s+react\b/i,
  /\bno\s+framework\b/i,
  /\bno\s+build\s+step\b/i,
  /\bno\s+extra\s+files\b/i,
 ];
 if(required.some(pattern=>!pattern.test(text)))return false;
 if(isMobileAppType(buildType)&&!/360\s*[–-]\s*430\s*px/i.test(text))return false;

 const nativeCreationFormat=/creation\s+format\s*:\s*(?:ios|android)\s+app/i;
 const positiveStackDrift=/(?:build|create|implement|develop|use|using)\b[^.\n]{0,60}\b(?:react(?:\s+native)?|next\.?js|swiftui|swift|kotlin|jetpack\s+compose|flutter)\b/i;
 return !nativeCreationFormat.test(text)&&!positiveStackDrift.test(text);
}

export async function requestAIGeneration(payload:AIGenerationRequest):Promise<string>{
 setAIGenerating(true);
 try{
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
 }finally{
  setAIGenerating(false);
 }
}
