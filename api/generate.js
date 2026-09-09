const DEFAULT_MODEL='gemini-3.6-flash';
const MAX_IDEA_LENGTH=5000;
const MAX_COMPILED_LENGTH=20000;

function send(res,status,body){
 res.status(status).setHeader('Content-Type','application/json; charset=utf-8');
 res.end(JSON.stringify(body));
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

 const instruction=`You are the semantic quality-control, reasoning, repair, and final writing engine inside Perfect Prompt.\n\nThe compiler gives you structure, categorization, constraints, and guardrails. Your job is to make that output more accurate, complete, efficient, and effective before it reaches the AI builder. The compiler is guidance and guardrails, not a source that outranks the USER IDEA.\n\nSOURCE-OF-TRUTH ORDER:\n1. USER IDEA — highest authority for product intent, workflow, requirements, behavior, exclusions, and constraints.\n2. Selected build type, creation format, and visual style — authoritative routing constraints.\n3. Compiler output — useful structured guidance that must be audited for omissions, weakening, malformed fragments, duplication, or accidental additions.\n\nSEMANTIC AUDIT — DO THIS INTERNALLY BEFORE WRITING THE FINAL PROMPT:\n- Compare the USER IDEA against the compiler output requirement-by-requirement.\n- Restore any requirement, workflow rule, state behavior, constraint, exclusion, or product logic that the compiler omitted, weakened, shortened incorrectly, or made ambiguous.\n- Treat malformed, truncated, vague, or incomplete compiler fragments as defects to repair using the USER IDEA.\n- Detect when a product mission or primary job has been reduced to a repeated product name; rewrite it to express the actual user outcome stated in the USER IDEA.\n- Preserve exact workflow order when the USER IDEA specifies one.\n- Preserve conditional behavior, timing rules, persistence expectations, validation rules, and negative constraints when present.\n- Remove compiler-generated filler, redundancy, generic template language, or accidental features that are not supported by the USER IDEA.\n- Do not merely polish or paraphrase the compiler output. Reason about whether it faithfully represents the USER IDEA, repair it first, then optimize it.\n\nFINAL WRITING RULES:\n- Produce one excellent, copy-ready prompt for an AI builder.\n- Keep the user's idea as the source of truth. Never change the main purpose or intended audience.\n- Do not invent unrelated features, screens, accounts, dashboards, analytics, backends, or complexity.\n- Preserve the selected build type, format, and visual direction.\n- Improve clarity, ordering, completeness, implementation usefulness, and premium build quality.\n- Convert weak fragments into complete actionable instructions.\n- Keep meaningful requirements even when compressing repetition.\n- Prefer concrete behavior over vague adjectives.\n- Make the final prompt internally consistent and easy for an AI builder to execute correctly on the first build.\n- Return ONLY the final prompt. No analysis, audit notes, score, preamble, markdown fence, or explanation.\n\nSelected build type: ${buildType}\nSelected format: ${creationFormat}\nSelected visual style: ${visualStyle}\n\nUSER IDEA:\n${idea}\n\nDETERMINISTIC PERFECT PROMPT COMPILER OUTPUT:\n${compiledPrompt}`;

 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),25000);
 try{
  const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{
   method:'POST',
   headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},
   body:JSON.stringify({
    contents:[{role:'user',parts:[{text:instruction}]}],
    generationConfig:{temperature:0.3,maxOutputTokens:8192}
   }),
   signal:controller.signal
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok){
   const message=data?.error?.message;
   console.error('Gemini request failed',{status:response.status,model,message});
   return send(res,502,{error:'Gemini could not generate a prompt. Perfect Prompt can use its local compiler instead.'});
  }
  const parts=data?.candidates?.[0]?.content?.parts;
  const prompt=Array.isArray(parts)?parts.map(part=>typeof part?.text==='string'?part.text:'').join('').trim():'';
  if(!prompt)return send(res,502,{error:'Gemini returned an empty response.'});
  return send(res,200,{prompt,model});
 }catch(error){
  const timedOut=error instanceof Error&&error.name==='AbortError';
  console.error('Gemini endpoint error',timedOut?'timeout':error);
  return send(res,502,{error:timedOut?'Gemini timed out. Perfect Prompt can use its local compiler instead.':'Gemini is temporarily unavailable.'});
 }finally{
  clearTimeout(timer);
 }
}
