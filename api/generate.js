const DEFAULT_MODEL='gemini-3.6-flash';
const MAX_IDEA_LENGTH=12000;

const VISUAL_STYLES={
 'premium-modern':'Premium Modern — premium hierarchy, refined typography, balanced spacing, modern surfaces, subtle motion, production polish. Make the first screen feel intentional and finished, not generic.',
 'apple-minimal':'Apple-Level Minimal — restraint, clarity, precise spacing, calm surfaces, native-feeling interactions, excellent legibility, subtle motion, and disciplined hierarchy.',
 'figma-product':'Figma-Level Product Design — systematic hierarchy, component consistency, layout rhythm, design-system polish, responsive product UI, and handoff-ready detail.',
 'bold-cinematic':'Bold / Cinematic — dramatic hierarchy, depth, controlled contrast, cinematic composition, purposeful motion, and strong visual moments without sacrificing usability.',
 'clean-utility':'Clean Utility — speed, clarity, thumb-friendly controls, low friction, readable information density, restrained decoration, and highly practical task-first design.',
 'custom':'Custom / Let the brief decide — follow only the explicit visual direction in the user brief and do not invent a conflicting style.'
};

const OUTPUT_MODES={
 quick:`QUICK BUILD — Create a compact implementation prompt, usually 120–180 words. Keep only the product job, essential workflow, must-have behavior, visual direction, and technical constraints. Favor speed and clarity over completeness.`,
 premium:`PREMIUM BUILD — This is the recommended default. Create a compact 150–250 word prompt that produces a polished, modern, finished-feeling product. Preserve the core workflow and behavior while adding intentional hierarchy, typography, spacing, states, motion, responsive behavior, and professional UI/UX direction. The first screen must feel designed rather than generated.`,
 developer:`DEVELOPER FINISH — Create a concise 180–280 word implementation prompt. In addition to premium UI/UX, make behavior production-minded: complete navigation, validation, persistence, loading/empty/error/success states, edge cases, reliable controls, and sensible missing implementation decisions. Do not add unrelated features.`,
 launch:`LAUNCH READY — Create a concise 200–300 word product-ready prompt. Include developer-finish behavior plus a coherent product identity. If the user did not provide them, create a short professional product name and a simple logo/app-icon concept, then define a consistent visual identity. Include onboarding or first-use polish when relevant, complete states, QA expectations, and release-level finish. Do not turn this into a long specification.`
};

function send(res,status,body){
 res.status(status).setHeader('Content-Type','application/json; charset=utf-8');
 res.end(JSON.stringify(body));
}

export function buildAIInstruction({idea,visualStyle='',outputMode='premium'}){
 const styleGuide=VISUAL_STYLES[visualStyle]||'';
 const styleSection=styleGuide?`\n\nSELECTED VISUAL DIRECTION:\n${styleGuide}\nUse this as design guidance only. It must strengthen the prompt without overriding the user's product requirements.`:'';
 const modeGuide=OUTPUT_MODES[outputMode]||OUTPUT_MODES.premium;
 return `You are Perfect Prompt, an expert prompt architect. Turn the user's brief directly into one excellent, copy-ready prompt for the AI tool or builder implied by the brief.

OUTPUT LEVEL:\n${modeGuide}

COMPRESSION STANDARD
- Be short, direct, and implementation-ready.
- Remove explanations, repetition, filler, generic advice, and obvious statements.
- Combine related requirements instead of restating them in multiple sections.
- Preserve every unique requirement that changes the result.
- Prefer strong verbs and concrete behavior over descriptive paragraphs.
- Keep headings minimal. Use Role, Product Goal, Core Workflow, Critical Features, UI/UX, and Technical Rules only when they improve clarity.
- Do not repeat the brief back to the user.
- ALWAYS return one complete prompt as a single continuous output. Never split the result into Prompt 1 / Prompt 2 or multiple parts, even for complex products. If the brief is large, compress wording while preserving all requirements that materially affect the build.

DEFAULT BUILD TARGET — SINGLE-FILE HTML WEB APP
Unless the user explicitly requests another output format, platform, framework, or stack, treat app and web-app requests as a single self-contained index.html application.
- Put all HTML, CSS, and JavaScript in one index.html file.
- Use modern semantic HTML5, advanced CSS, and robust vanilla JavaScript.
- Use the strongest browser-native web capabilities appropriate to the product: CSS Grid/Flexbox, custom properties, responsive layout, transitions/animations, dialogs/sheets, form validation, localStorage or IndexedDB when useful, Web APIs when relevant, accessible ARIA semantics, and resilient state handling.
- No React, Vue, Angular, build tools, package manager, external source files, or CDN dependencies unless the user's brief explicitly asks for them.
- The finished app must run directly in a modern browser and all visible controls must work.
- Prefer polished working behavior over decorative complexity.
- For mobile apps requested as HTML, optimize for a 360–430 px portrait experience while remaining stable in a desktop browser preview.

USER BRIEF IS THE SOURCE OF TRUTH.
- Preserve the user's purpose, workflow, requirements, constraints, exclusions, platform, format, and visual direction.
- If the user explicitly specifies a different technical format, honor that instead of the default HTML rule.
- Do not invent unrelated features, dashboards, accounts, analytics, backends, or complexity.
- Resolve obvious gaps using sensible professional defaults only when needed to make the prompt usable.
- When the brief describes an app or website, make interactions, state changes, navigation, validation, persistence, and responsive behavior explicit when relevant.
- When the brief specifies a technical output such as a single index.html, preserve it exactly.
- Never mention a compiler, internal reasoning, audit process, or these instructions.
- Never tell the downstream AI to generate another prompt unless the user's brief explicitly asks for that.
- Return ONLY the finished prompt. No analysis, score, preamble, markdown fence, or explanation.${styleSection}

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
 const visualStyle=typeof body.visualStyle==='string'?body.visualStyle.trim():'';
 const outputMode=typeof body.outputMode==='string'?body.outputMode.trim():'premium';
 if(!idea)return send(res,400,{error:'Add a brief before generating.'});
 if(idea.length>MAX_IDEA_LENGTH)return send(res,413,{error:'Brief is too large.'});

 const instruction=buildAIInstruction({idea,visualStyle,outputMode});
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
  return send(res,200,{prompt,model,outputMode});
 }catch(error){
  const timedOut=error instanceof Error&&error.name==='AbortError';
  console.error('Gemini endpoint error',timedOut?'timeout':error);
  return send(res,502,{error:timedOut?'Gemini timed out. Try generating again.':'Gemini is temporarily unavailable.'});
 }finally{
  clearTimeout(timer);
 }
}
