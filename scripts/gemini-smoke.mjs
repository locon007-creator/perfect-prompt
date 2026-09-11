const apiKey=process.env.GEMINI_API_KEY;
const model=process.env.GEMINI_MODEL||'gemini-3.6-flash';
if(!apiKey){console.error('GEMINI_API_KEY missing during smoke test');process.exit(1)}
const instruction=`Create one concise copy-ready builder prompt for this brief. Visual direction: Apple-Level Minimal. Brief: Build a premium mobile-first personal checklist app with local persistence and one clear daily workflow. Return only the prompt.`;
const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{
 method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},
 body:JSON.stringify({contents:[{role:'user',parts:[{text:instruction}]}],generationConfig:{temperature:0.2,maxOutputTokens:512}})
});
const data=await response.json().catch(()=>({}));
const text=data?.candidates?.[0]?.content?.parts?.map?.(p=>p?.text||'').join('').trim();
if(!response.ok||!text){console.error('Gemini smoke test failed',response.status,data?.error?.message||'empty response');process.exit(1)}
console.log('Gemini smoke test passed:',model,'chars=',text.length);
