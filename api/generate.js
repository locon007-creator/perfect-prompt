const DEFAULT_MODEL='gemini-2.5-flash';
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

 const instruction=`You are the final reasoning and writing engine inside Perfect Prompt.\n\nYour job is to improve the supplied deterministic compiler output into one excellent, copy-ready prompt for an AI builder.\n\nNON-NEGOTIABLE RULES:\n- The user's idea is the source of truth. Preserve its purpose, workflow, requirements, exclusions, and constraints.\n- Do not invent unrelated features, screens, accounts, dashboards, analytics, backends, or complexity.\n- Preserve the selected build type, format, and visual direction.\n- Improve clarity, ordering, completeness, usability, and implementation guidance.\n- Keep the result practical for an AI builder and focused on producing a finished, premium result.\n- Resolve redundancy and weak wording without deleting meaningful requirements.\n- Return ONLY the final prompt. No analysis, score, preamble, markdown fence, or explanation.\n\nSelected build type: ${buildType}\nSelected format: ${creationFormat}\nSelected visual style: ${visualStyle}\n\nUSER IDEA:\n${idea}\n\nDETERMINISTIC PERFECT PROMPT COMPILER OUTPUT:\n${compiledPrompt}`;

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
