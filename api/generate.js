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
 const appAudit=isApp?`\n\nAPP QUALITY AUDIT:\n- Do not shorten the final prompt to satisfy an arbitrary word count. Keep every requirement that changes the build; remove only repetition and filler.\n- Confirm the final App prompt carries useful information in this natural order when applicable: Role → Product and its one job → primary workflow → concrete behavior → screens and controls → persistence/state → premium mobile experience → exclusions → build contract.\n- When the USER IDEA contains timing, conditions, state, or dependencies, preserve them as executable behavior: condition/trigger → action → save or persist state → update the affected UI, calculation, workflow, or next state.\n- Reject invented dashboard/KPI patterns, counters, cards, screens, metrics, analytics, or features that are not supported by the USER IDEA.\n- Strengthen visual direction enough that the first rendered screen and the full product can look like a finished premium consumer app, not a wireframe, generic dashboard template, or prototype. Preserve the chosen visual style without changing product behavior.\n- Preserve product-specific interaction details such as collapsible sections, search behavior, navigation behavior, and exact state transitions when the USER IDEA states them.`:'';

 return `You are the semantic quality-control, reasoning, repair, and final writing engine inside Perfect Prompt.\n\nThe deterministic compiler gives you structure, categorization, constraints, and guardrails. Your job is to verify and improve that compiled output before it reaches the AI builder. Do not replace the compiler with your own interpretation.\n\nSOURCE-OF-TRUTH ORDER:\n1. USER IDEA — highest authority for product intent, workflow, requirements, behavior, exclusions, and constraints.\n2. Selected build type, creation format, and visual style — authoritative routing and presentation constraints.\n3. DETERMINISTIC PERFECT PROMPT COMPILER OUTPUT — structured guidance that must be audited for omissions, weakening, malformed fragments, duplication, or accidental additions.\n\nSEMANTIC AUDIT — DO THIS INTERNALLY BEFORE WRITING THE FINAL PROMPT:\n- Compare the USER IDEA against the compiler output requirement-by-requirement.\n- Restore any requirement, workflow rule, state behavior, constraint, exclusion, interaction detail, or product logic that the compiler omitted, weakened, shortened incorrectly, or made ambiguous.\n- Treat malformed, truncated, vague, or incomplete compiler fragments as defects to repair using the USER IDEA.\n- Preserve exact workflow order when the USER IDEA specifies one.\n- Preserve conditional behavior, timing rules, persistence expectations, validation rules, relationships, calculations, and negative constraints when present.\n- Remove compiler-generated filler, redundancy, generic template language, accidental features, or anything not supported by the USER IDEA.\n- Do not merely polish or paraphrase compiler output. Verify semantic fidelity first, repair defects second, then improve clarity and builder usefulness.${appAudit}\n\nFINAL WRITING RULES:\n- Produce one excellent, copy-ready prompt for an AI builder.\n- Keep the USER IDEA as the product truth and the compiler rules as the enforced structure.\n- Never change the main purpose, intended audience, required workflow, or explicit behavior.\n- Do not invent unrelated features, screens, accounts, dashboards, analytics, backends, metrics, or complexity.\n- Improve clarity, ordering, completeness, implementation usefulness, and premium build quality.\n- Convert weak fragments into complete actionable instructions.\n- Keep meaningful requirements even when removing repetition.\n- Prefer concrete behavior over vague adjectives.\n- Preserve hard creation-format constraints from the compiler output exactly.\n- Return ONLY the final prompt. No analysis, audit notes, score, preamble, markdown fence, or explanation.\n\nSelected build type: ${buildType}\nSelected format: ${creationFormat}\nSelected visual style: ${visualStyle}\n\nUSER IDEA:\n${idea}\n\nDETERMINISTIC PERFECT PROMPT COMPILER OUTPUT:\n${compiledPrompt}`;
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

 if(!idea||!compiledPrompt)return send(res,400,{error:'Idea and compiled prompt are required.'});
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
   return send(res,502,{error:'Gemini could not verify the prompt. Perfect Prompt can use its deterministic compiler output instead.'});
  }
  const parts=data?.candidates?.[0]?.content?.parts;
  const prompt=Array.isArray(parts)?parts.map(part=>typeof part?.text==='string'?part.text:'').join('').trim():'';
  if(!prompt)return send(res,502,{error:'Gemini returned an empty response.'});
  return send(res,200,{prompt,model});
 }catch(error){
  const timedOut=error instanceof Error&&error.name==='AbortError';
  console.error('Gemini endpoint error',timedOut?'timeout':error);
  return send(res,502,{error:timedOut?'Gemini timed out. Perfect Prompt can use its deterministic compiler output instead.':'Gemini is temporarily unavailable.'});
 }finally{
  clearTimeout(timer);
 }
}
