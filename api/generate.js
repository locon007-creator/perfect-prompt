const DEFAULT_MODEL='gemini-3.6-flash';
const MAX_IDEA_LENGTH=12000;
const VISUAL_STYLES={
 'premium-modern':'Premium Modern: intentional hierarchy, elegant composition and refined product finish; leave palette, motion and components to the designer.',
 'apple-minimal':'Apple-inspired minimal: restrained, intuitive, precise and accessible; select visual details creatively rather than prescribing a palette.',
 'figma-product':'Systematic product design: coherent components, spacing, hierarchy, responsive layouts and interaction states.',
 'bold-cinematic':'Bold cinematic: distinctive composition and confident visual hierarchy without harming readability or usability.',
 'clean-utility':'Clean utility: focused, fast, practical, readable and thumb-friendly.',
 'custom':'Honor the visual direction supplied by the user without inventing a conflicting aesthetic.'
};
const OUTPUT_MODES={quick:'Concise implementation brief.',premium:'Polished flagship implementation brief.',developer:'Polished implementation brief with robust behavior and validation.',launch:'Polished launch-oriented implementation brief with coherent identity and practical QA.'};
function send(res,status,body){res.status(status).setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(body));}
export function buildAIInstruction({idea,visualStyle='',outputMode='premium'}){
 const styleGuide=VISUAL_STYLES[visualStyle]||'';
 return `You are Perfect Prompt, an expert prompt architect. Convert the brief into ONE finished, copy-ready Arena implementation prompt. Output level: ${OUTPUT_MODES[outputMode]||OUTPUT_MODES.premium}

MANDATORY SEVEN-SECTION OUTPUT, IN ORDER:
1 Role & Expertise
2 Product Vision & Requirements
3 Workflow & Navigation
4 Layout & Architecture
5 Visual Design & Flagship Quality
6 Functionality & Data Logic
7 Testing & Quality Assurance
Each section must contribute distinct, app-specific implementation guidance. Do not add an eighth section or split into multiple prompts.

UNIVERSAL COMPILER METHOD — APPLY TO ALL APP TYPES, NOT JUST THE EXAMPLES:
- Internally map the complete journey, explicit requirements, dependencies, state transitions, shared information, important edge cases and technical feasibility. Resolve genuine gaps using consistent professional defaults while preserving explicit instructions. Do not invent integrations or imply browser capabilities that are unavailable.
- Build a single coherent source of truth for shared state, rules and calculations wherever relevant, so changes propagate correctly across screens. Describe the rule ONCE in its natural section and refer to its result elsewhere only when essential. Do not duplicate onboarding, constraints, persistence, formulas or QA directions in multiple sections.
- Compress intelligently: remove repeated requirements, verbose role titles, hype, generic adjectives, filler and redundant examples. Prioritize actionable verbs, concrete workflows, necessary technical boundaries and testable outcomes. No arbitrary word count or length limit: expand ONLY when material requirements or ambiguities demand it; do not omit user requirements to make the text shorter.
- Specify outcomes and design intent rather than dictating arbitrary hex colors, pixel values, animation durations, fonts, icons or component arrangements. Preserve exact visual specifications ONLY if the user supplied them. Give the builder freedom to devise distinctive, premium layouts and interactions within user constraints.
- Preserve every unique user feature, label, exclusion, preference and workflow. Resolve noncritical ambiguities consistently; if explicit requirements genuinely conflict, state the unresolved decision rather than silently dropping one. Add no unrelated app-specific features.
- Prior to output, internally check coverage and consistency across every section, then revise once for unnecessary repetition, feasibility and missing dependencies. Do not expose internal analysis, a score or an audit report.
- In section seven require the downstream builder to run available real checks, fix discovered failures and retest affected and related paths. Report concrete test evidence and clearly identify untested or unavailable checks. Never instruct it to declare all features verified by assertion or produce fabricated test results. The prompt compiler itself has NOT tested the eventual app.

DEFAULT TARGET: ONE directly runnable self-contained index.html with HTML5, embedded CSS3 and vanilla JavaScript; no frameworks, external dependencies or APK unless explicitly requested otherwise. Use responsive browser-native features and local persistence where appropriate. Honor all explicit user constraints over defaults. Mobile-first when relevant. Selected visual direction: ${styleGuide||'Follow the user brief.'} This direction is guidance, not a fixed palette or blueprint.

OUTPUT ONLY the complete seven-section build prompt. No preface, scoring, meta-commentary, code fence or second prompt.

AUTHORITATIVE USER BRIEF:\n${idea}`;
}
export default async function handler(req,res){
 const apiKey=process.env.GEMINI_API_KEY,model=process.env.GEMINI_MODEL||DEFAULT_MODEL;
 if(req.method==='GET')return send(res,200,{configured:Boolean(apiKey),model});
 if(req.method!=='POST')return send(res,405,{error:'Method not allowed.'});
 if(!apiKey)return send(res,503,{error:'Gemini is not configured on this deployment.'});
 const body=req.body&&typeof req.body==='object'?req.body:{};
 const idea=typeof body.idea==='string'?body.idea.trim():'';
 if(!idea)return send(res,400,{error:'Add a brief before generating.'});
 if(idea.length>MAX_IDEA_LENGTH)return send(res,413,{error:'Brief is too large.'});
 const instruction=buildAIInstruction({idea,visualStyle:body.visualStyle,outputMode:body.outputMode});
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),25000);
 try{
  const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},body:JSON.stringify({contents:[{role:'user',parts:[{text:instruction}]}],generationConfig:{temperature:0.35,maxOutputTokens:8192}}),signal:controller.signal});
  const data=await response.json().catch(()=>({}));
  if(!response.ok){console.error('Gemini request failed',{status:response.status,model,message:data?.error?.message});return send(res,502,{error:'Gemini could not generate the prompt.'});}
  const parts=data?.candidates?.[0]?.content?.parts;
  const prompt=Array.isArray(parts)?parts.map(part=>typeof part?.text==='string'?part.text:'').join('').trim():'';
  if(!prompt)return send(res,502,{error:'Gemini returned an empty response.'});
  return send(res,200,{prompt,model,outputMode:body.outputMode||'premium'});
 }catch(error){const timedOut=error instanceof Error&&error.name==='AbortError';console.error('Gemini endpoint error',timedOut?'timeout':error);return send(res,502,{error:timedOut?'Gemini timed out. Try generating again.':'Gemini is temporarily unavailable.'});}
 finally{clearTimeout(timer);}
}
