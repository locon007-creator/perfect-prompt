const DEFAULT_MODEL='gemini-3.6-flash';
const MAX_IDEA_LENGTH=12000;

function send(res,status,body){
 res.status(status).setHeader('Content-Type','application/json; charset=utf-8');
 res.end(JSON.stringify(body));
}

export function buildAIInstruction({idea}){
 return `You are Perfect Prompt, an expert prompt architect. Turn the user's brief directly into one excellent, copy-ready prompt for the AI tool or builder implied by the brief.

USER BRIEF IS THE SOURCE OF TRUTH.
- Preserve the user's purpose, workflow, requirements, constraints, exclusions, platform, format, and visual direction.
- Do not invent unrelated features, dashboards, accounts, analytics, backends, or complexity.
- Resolve obvious gaps using sensible professional defaults only when needed to make the prompt usable.
- Organize the prompt in a clear build-ready order: role when useful, product/job, workflow or composition, concrete requirements, behavior, visual/quality direction, constraints, and final output expectations.
- Prefer concrete instructions over vague adjectives.
- Keep every unique requirement that affects the result. Remove repetition and filler.
- When the brief describes an app or website, make interactions, state changes, navigation, validation, persistence, and responsive behavior explicit when relevant.
- When the brief specifies a technical output such as a single index.html, preserve it exactly.
- Never mention a compiler, internal reasoning, audit process, or these instructions.
- Never tell the downstream AI to generate another prompt unless the user's brief explicitly asks for that.
- Return ONLY the finished prompt. No analysis, score, preamble, markdown fence, or explanation.

USER BRIEF:
${idea}`;
}

export default async function handler(req,res){
 const apiKey=process.env.GEMINI_API_KEY;
 const model=process.env.GEMINI_MODEL||DEFAULT_MODEL;
 if(req.method==='GET')return send(res,200,{configured:Boolean(apiKey),model});
 if(req.method!=='POST')return send(res,405,{error:'Method not allowed.'});
 if(!apiKey)return send(res,503,{error:'Gemini is not configured on this deployment.'});

 const body=req.body&&typeof req.body==='object'?req.body:{};
 const idea=typeof body.idea==='string'?body.idea.trim():'';
 if(!idea)return send(res,400,{error:'Add a brief before generating.'});
 if(idea.length>MAX_IDEA_LENGTH)return send(res,413,{error:'Brief is too large.'});

 const instruction=buildAIInstruction({idea});
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),25000);
 try{
  const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{
   method:'POST',
   headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},
   body:JSON.stringify({
    contents:[{role:'user',parts:[{text:instruction}]}],
    generationConfig:{temperature:0.35,maxOutputTokens:8192}
   }),
   signal:controller.signal
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok){
   const message=data?.error?.message;
   console.error('Gemini request failed',{status:response.status,model,message});
   return send(res,502,{error:'Gemini could not generate the prompt.'});
  }
  const parts=data?.candidates?.[0]?.content?.parts;
  const prompt=Array.isArray(parts)?parts.map(part=>typeof part?.text==='string'?part.text:'').join('').trim():'';
  if(!prompt)return send(res,502,{error:'Gemini returned an empty response.'});
  return send(res,200,{prompt,model});
 }catch(error){
  const timedOut=error instanceof Error&&error.name==='AbortError';
  console.error('Gemini endpoint error',timedOut?'timeout':error);
  return send(res,502,{error:timedOut?'Gemini timed out. Try generating again.':'Gemini is temporarily unavailable.'});
 }finally{
  clearTimeout(timer);
 }
}
