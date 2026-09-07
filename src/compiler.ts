import { z } from 'zod';

export const InputSchema = z.object({ idea: z.string().trim().min(10) });
export type Input = z.infer<typeof InputSchema>;
export type IdeaLock = Readonly<{
  appName: string; primaryJob: string; targetUser: string; platform: string; workflow: string;
  screens: readonly string[]; requiredFeatures: readonly string[]; optionalFeatures: readonly string[];
  stateRules: readonly string[]; persistenceRules: readonly string[]; visualRequirements: readonly string[];
  constraints: readonly string[]; explicitExclusions: readonly string[]; lockedInstructions: readonly string[];
}>;
export type Prompt = { role:string; mission:string; lock:IdeaLock; targetUser:string; platform:string; workflow:string; screens:string[]; features:string[]; states:string[]; visual:string; constraints:string[]; doNotAdd:string[]; completion:string };
const freeze = <T>(value:T):Readonly<T> => { if(value && typeof value==='object' && !Object.isFrozen(value)){Object.freeze(value); for(const v of Object.values(value as object)) freeze(v);} return value as Readonly<T>; };
const clean=(s:string)=>s.replace(/[.!?]+$/,'').trim();
const list=(s:string|undefined)=>s? s.split(/,|;|\n|\band\b/gi).map(clean).filter(Boolean):[];
const section=(text:string, labels:string[])=>{const r=new RegExp(`(?:${labels.join('|')})\\s*[:\\-]\\s*([^.!?]+)`,'i');return r.exec(text)?.[1]?.trim()};
export function parseIdea(raw:string):IdeaLock {
 const text=InputSchema.parse({idea:raw}).idea;
 const platform=/\b(ios|iphone|ipad)\b/i.test(text)?'iOS':/\bandroid\b/i.test(text)?'Android':/\bmobile|phone\b/i.test(text)?'mobile':'responsive web';
 const name=(/\b(?:called|named)\s+["“]?([^"”.,]+)/i.exec(text)?.[1]||'').trim();
 const product=clean((/\b(?:build|create|make|design)\s+(?:a|an|the)\s+(.+?)(?=\s+for\s+|\s+where\s+|\s+that\s+|\s+on\s+|\.|$)/i.exec(text)?.[1]||text));
 const target=clean((/(?:for|target(?:ed)?\s+at)\s+([^.;]+?)(?=\s+(?:where|that|on|with|which)\b|[.!?]|$)/i.exec(text)?.[1]||'the intended user'));
 const workflow=clean(section(text,['workflow','flow','steps','process'])||(/\bwhere\s+(?:they|users?|people)\s+(.+?)(?=\.|\s+It should|\s+No\b|$)/i.exec(text)?.[1]||''));
 const screenText=section(text,['screens','pages','views'])||[...text.matchAll(/\b([a-z][\w ]*?)\s+screen\b/gi)].map(m=>m[1].replace(/^(?:It should have|it has|include)\s+(?:a|an|the)\s+/i,'')).join(', ');
 const naturalFeatures=(/\bwhere\s+(?:they|users?|people)\s+(.+?)(?=\.|\s+It should|\s+No\b|$)/i.exec(text)?.[1]||'').replace(/\b(and|then)\b/gi,',');
 const requiredText=section(text,['required features','must have','required','features','include'])||naturalFeatures;
 const optionalText=section(text,['optional features','optional'])||((/\boptional(?:ly)?\s+(.+?)(?=\.|$)/i.exec(text)?.[1])||'');
 const exclusionMatches=[...text.matchAll(/(?:do not|don't|without|no)\s+([^.;,]+)/gi)].map(m=>clean(m[1]));
 const required=list(requiredText).filter(x=>x&&!exclusionMatches.some(e=>x.toLowerCase().includes(e.toLowerCase())));
 const optional=list(optionalText), duplicates=required.filter(x=>optional.some(y=>y.toLowerCase()===x.toLowerCase()));
 if(duplicates.length) throw Error(`Contradictory required and optional feature: ${duplicates.join(', ')}`);
 const persistence=section(text,['persistence','data','storage'])||((/\b(save|store|persist|keep)\s+([^.!?]+)/i.exec(text)?.[0])||'');
 return freeze({appName:name||clean(product.split(/\s+for\s+/i)[0]),primaryJob:product,targetUser:target,platform,workflow,screens:list(screenText),requiredFeatures:required,optionalFeatures:optional,stateRules:list(section(text,['states','behavior','interactions'])||''),persistenceRules:list(persistence),visualRequirements:list(section(text,['visual','layout','style'])||''),constraints:list(section(text,['constraints','constraint'])||''),explicitExclusions:exclusionMatches,lockedInstructions:[text]});
}
export function compile(raw:string):Prompt {const lock=parseIdea(raw); return {role:'You are a senior product designer and frontend engineer.',mission:`Design ${lock.appName} to help ${lock.targetUser} ${lock.primaryJob}.`,lock,targetUser:lock.targetUser,platform:lock.platform,workflow:lock.workflow,screens:[...lock.screens],features:[...lock.requiredFeatures],states:[...lock.stateRules],visual:lock.visualRequirements.join('; '),constraints:[...lock.constraints],doNotAdd:[...lock.explicitExclusions],completion:'Every locked requirement is implemented, the stated workflow is preserved, and no unrequested screens or features are added.'};}
export function assemble(p:Prompt){return ['Role',p.role,'Product Mission',p.mission,'Idea Lock',`App name: ${p.lock.appName}\nPrimary job: ${p.lock.primaryJob}\nTarget user: ${p.lock.targetUser}\nPlatform: ${p.lock.platform}\nLocked instruction: ${p.lock.lockedInstructions.join(' ')}`,'Target User',p.targetUser,'Platform',p.platform,'Main Workflow',p.workflow||'No workflow was specified; do not invent one.','Screen Requirements',p.screens.length?p.screens.map((s,i)=>`${i+1}. ${s}`).join('\n'):'Only screens explicitly required by the idea.','Core Features',p.features.join('\n'),'Interaction & State Rules',p.states.join('\n'),'Visual Direction',p.visual||'Follow only visual requirements stated in the idea.','Constraints',p.constraints.join('\n'),'Do Not Add',p.doNotAdd.join('\n'),'Completion Standard',p.completion].join('\n\n');}
export function validate(p:Prompt,output:string){const sections=['Role','Product Mission','Idea Lock','Target User','Platform','Main Workflow','Screen Requirements','Core Features','Interaction & State Rules','Visual Direction','Constraints','Do Not Add','Completion Standard'];const missing=sections.filter(x=>!output.includes(x));if(missing.length)throw Error(`Missing sections: ${missing.join(', ')}`);const positive=[p.workflow,...p.screens,...p.features,...p.states,p.visual,...p.constraints].join(' ').toLowerCase();for(const x of p.lock.explicitExclusions)if(positive.includes(x.toLowerCase()))throw Error(`Exclusion violation: ${x}`);for(const x of p.lock.requiredFeatures)if(!output.toLowerCase().includes(x.toLowerCase()))throw Error(`Missing locked requirement: ${x}`);return true;}
export const generate=(raw:string)=>{const p=compile(raw),out=assemble(p);validate(p,out);return out;};
