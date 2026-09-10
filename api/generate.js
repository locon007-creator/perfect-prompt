const DEFAULT_MODEL='gemini-3.6-flash';
const MAX_IDEA_LENGTH=5000;
const MAX_COMPILED_LENGTH=20000;

function send(res,status,body){
 res.status(status).setHeader('Content-Type','application/json; charset=utf-8');
 res.end(JSON.stringify(body));
}

export function buildAIInstruction({idea,compiledPrompt,buildType='',creationFormat='',visualStyle=''}){
 const normalizedType=(buildType||'').toLowerCase();
 const isApp=['app-web-app','app','web-app'].includes(normalizedType);
 const appArchitecture=isApp?`\n\nAPP PROMPT ARCHITECTURE — FINISHED-APP DNA:\n- Do not shorten the final prompt to satisfy an arbitrary word count. Use as much detail as needed to preserve useful requirements; remove only repetition, filler, and wording that does not change the build.\n- Organize the App prompt so an AI builder receives, in a natural professional order: Role → Product and its one job → primary workflow → concrete behavior rules → required screens and controls → persistence/state requirements → premium mobile experience direction → explicit exclusions → build contract. Do not add empty headings merely to satisfy the order; each section must carry useful build information.\n- Translate important product logic into executable behavior. When the USER IDEA describes timing, conditions, state, or dependencies, express it as condition/trigger → action → save or persist the resulting state → immediately update the affected UI, calculation, workflow, or next state. Preserve the user's exact semantics rather than forcing this pattern where it does not apply.\n- Preserve fixed-versus-variable rules, current-cycle versus historical values, exact workflow order, validation, timing, dependencies, calculations, local persistence, and scoped exclusions whenever the USER IDEA contains them.\n- Give enough visual and interaction direction for the first rendered screen and the rest of the product to feel like a finished premium consumer app, not a wireframe, admin dashboard, generic generated interface, or unfinished prototype. Favor strong hierarchy, intentional typography, clean spacing, coherent component geometry, restrained styling, polished states, and one obvious primary action when appropriate.\n- Do not invent unrelated features, screens, dashboards, accounts, analytics, backends, or systems just to make the prompt look more complete. Completeness means faithfully expressing the user's product, not expanding its scope.\n- Keep this architecture internal to the generated prompt. Do not expose compiler commentary, scoring, or explanations.`:'';

 return `You are the primary reasoning and final writing engine inside Perfect Prompt.\n\nSOURCE OF TRUTH:\n1. USER IDEA is the highest authority for purpose, audience, workflow, features, conditions, timing, persistence, exclusions, relationships, and product behavior.\n2. The MINIMAL ENGINE WRAPPER contains non-negotiable creation-format and execution guardrails. When it contains the HTML hard lock, preserve it exactly even if a selector label suggests iOS, Android, or another native platform.\n3. Selected build type and visual style provide routing and presentation context only. They must never override the USER IDEA or the MINIMAL ENGINE WRAPPER.\n\nREASON BEFORE WRITING:\n- Understand the USER IDEA requirement-by-requirement before composing the final prompt.\n- Preserve every stated workflow step and its exact order when one is given.\n- Preserve conditions, timing rules, validation, persistence, exclusions, relationships, calculations, and state behavior.\n- Never summarize away meaningful product logic or weaken specific requirements into generic language.\n- Do not invent unrelated features, screens, accounts, dashboards, analytics, backends, or complexity.\n- Resolve contradictions in favor of the USER IDEA, except that explicit hard creation-format guardrails in the MINIMAL ENGINE WRAPPER remain mandatory.\n- Organize the result into a clear, professional, copy-ready builder prompt.${appArchitecture}\n\nHTML HARD LOCK:\nWhen the MINIMAL ENGINE WRAPPER requires HTML, the final prompt must explicitly require one self-contained index.html with inline CSS and JavaScript, no React, no framework, no build step, and no extra files. It must retain the strict phone portrait target of approximately 360–430 px and reject desktop/wide-layout drift.\n\nFINAL WRITING RULES:\n- Keep the user's real product outcome obvious.\n- Make behavior concrete and executable rather than relying on vague adjectives.\n- Preserve the selected visual direction only as styling guidance.\n- Produce a prompt that an AI builder can execute correctly on the first build.\n- Return ONLY the final prompt. No analysis, score, preamble, markdown fence, or explanation.\n\nSelected build type: ${buildType}\nSelected format label: ${creationFormat}\nSelected visual style: ${visualStyle}\n\nUSER IDEA:\n${idea}\n\nMINIMAL ENGINE WRAPPER:\n${compiledPrompt}`;
}

export default async function handler(req,res){
 const apiKey=process.env.GEMINI_API_KEY;
 const model=process.env.GEMINI_MODEL||DEFAULT_MODEL;
 if(req.method==='GET')return send(res,200,{configured:Boolean(apiKey),model});
 if(req.method!=='POST')return send(res,405,{error:'Method not allowed.'});
 if(!apiKey)return send(res,503,{error:'Gemini is not configured on this deployment.'});

 const body=req.body&&typeof req.body==='object'?req.body:{};
 const idea=typeof body.idea==='string'?body.idea.trim():'';
 const compiledPrompt=typeof body.compiledPrompt==='string'?body.compiledPrompt.trim():'';
 const buildType=typeof body.buildType==='string'?body.buildType:'';
 const creationFormat=typeof body.creationFormat==='string'?body.creationFormat:'';
 const visualStyle=typeof body.visualStyle==='string'?body.visualStyle:'';

 if(!idea||!compiledPrompt)return send(res,400,{error:'Idea and prompt wrapper are required.'});
 if(idea.length>MAX_IDEA_LENGTH||compiledPrompt.length>MAX_COMPILED_LENGTH)return send(res,413,{error:'Prompt input is too large.'});

 const instruction=buildAIInstruction({idea,compiledPrompt,buildType,creationFormat,visualStyle});

 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),25000);
 try{
  const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{
   method:'POST',
   headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},
   body:JSON.stringify({
    contents:[{role:'user',parts:[{text:instruction}]}],
    generationConfig:{temperature:0.25,maxOutputTokens:8192}
   }),
   signal:controller.signal
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok){
   const message=data?.error?.message;
   console.error('Gemini request failed',{status:response.status,model,message});
   return send(res,502,{error:'Gemini could not generate a prompt. Perfect Prompt can use its Minimal Engine prompt instead.'});
  }
  const parts=data?.candidates?.[0]?.content?.parts;
  const prompt=Array.isArray(parts)?parts.map(part=>typeof part?.text==='string'?part.text:'').join('').trim():'';
  if(!prompt)return send(res,502,{error:'Gemini returned an empty response.'});
  return send(res,200,{prompt,model});
 }catch(error){
  const timedOut=error instanceof Error&&error.name==='AbortError';
  console.error('Gemini endpoint error',timedOut?'timeout':error);
  return send(res,502,{error:timedOut?'Gemini timed out. Perfect Prompt can use its Minimal Engine prompt instead.':'Gemini is temporarily unavailable.'});
 }finally{
  clearTimeout(timer);
 }
}
