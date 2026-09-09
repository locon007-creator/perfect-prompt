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

export function validateAIPrompt(prompt:string,buildType:string):boolean{
 const text=typeof prompt==='string'?prompt.trim():'';
 if(!text)return false;
 if(!isHtmlBuilderType(buildType))return true;

 const hasIndex=/\bindex\.html\b/i.test(text);
 const hasInlineAssets=/inline\s+css[\s\S]{0,100}\band\s+javascript\b/i.test(text);
 const excludesFrameworks=/\bno\s+frameworks?\b/i.test(text);
 const excludesReact=/\bno\s+react\b/i.test(text)||/\bno\s+frameworks?\b[^.\n]{0,100}\breact\b/i.test(text);
 const excludesBuild=/\bno\s+build\s+steps?\b/i.test(text);
 const singleFile=/\bno\s+extra\s+files\b/i.test(text)||/\bsingle[- ]file\b/i.test(text)||/everything\b[^.\n]{0,100}\bcontained\b[^.\n]{0,100}\bindex\.html\b/i.test(text);
 if(!hasIndex||!hasInlineAssets||!excludesFrameworks||!excludesReact||!excludesBuild||!singleFile)return false;
 if(isMobileAppType(buildType)&&!/360\s*(?:px\s*)?[–-]\s*430\s*px/i.test(text))return false;

 const nativeCreationFormat=/creation\s+format\s*:\s*(?:ios|android)\s+app/i;
 const positiveStackDrift=/(?:build|create|implement|develop|use|using)\b[^.\n]{0,60}\b(?:react(?:\s+native)?|next\.?js|swiftui|swift|kotlin|jetpack\s+compose|flutter)\b/i;
 return !nativeCreationFormat.test(text)&&!positiveStackDrift.test(text);
}

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
