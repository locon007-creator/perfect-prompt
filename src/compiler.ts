import { z } from 'zod';
import type { BuildType } from './intent';
import { getSpecialistProfile } from './intent';
import type { VisualStyle } from './visual-style';
import { getVisualStyleProfile } from './visual-style';

export const InputSchema = z.object({ idea: z.string().trim().min(10) });
export type Input = z.infer<typeof InputSchema>;
export type GenerateOptions = Readonly<{ buildType?: BuildType; visualStyle?: VisualStyle }>;
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
const purposeLead=/^(?:recording|tracking|managing|organizing|saving|calculating|logging|planning|monitoring|keeping|creating|entering|reviewing|showing|handling|using)\b/i;
const unique=(items:string[])=>items.filter((item,index)=>items.findIndex(other=>other.toLowerCase()===item.toLowerCase())===index);
export function parseIdea(raw:string):IdeaLock {
 const text=InputSchema.parse({idea:raw}).idea;
 const platform=/\b(ios|iphone|ipad)\b/i.test(text)?'iOS':/\bandroid\b/i.test(text)?'Android':/\bmobile|phone\b/i.test(text)?'mobile':'responsive web';
 const name=(/\b(?:called|named)\s+["“]?([^"”.,]+)/i.exec(text)?.[1]||'').trim();
 const product=clean((/\b(?:build|create|make|design)\s+(?:a|an|the)\s+(.+?)(?=\s+for\s+|\s+where\s+|\s+that\s+|\s+on\s+|\.|$)/i.exec(text)?.[1]||text));
 const targeted=(/\btarget(?:ed)?\s+at\s+([^.;]+?)(?=\s+(?:where|that|on|with|which)\b|[.!?]|$)/i.exec(text)?.[1]||'').trim();
 const forClause=(/\bfor\s+([^.;]+?)(?=\s+(?:where|that|on|with|which)\b|[.!?]|$)/i.exec(text)?.[1]||'').trim();
 const purposeClause=purposeLead.test(forClause)?forClause:'';
 const target=clean(targeted||(!purposeClause&&forClause?forClause:'the intended user'));
 const workflow=clean(section(text,['workflow','flow','steps','process'])||(/\bwhere\s+(?:they|users?|people)\s+(.+?)(?=\.|\s+It should|\s+No\b|$)/i.exec(text)?.[1]||''));
 const screenText=section(text,['screens','pages','views'])||[...text.matchAll(/\b([a-z][\w ]*?)\s+screen\b/gi)].map(m=>m[1].replace(/^(?:It should have|it has|include)\s+(?:a|an|the)\s+/i,'')).join(', ');
 const naturalFeatures=(/\bwhere\s+(?:they|users?|people)\s+(.+?)(?=\.|\s+It should|\s+No\b|$)/i.exec(text)?.[1]||'').replace(/\b(and|then)\b/gi,',');
 const includeFeatures=(/\b(?:also\s+)?include(?:s|d)?\s+(.+?)(?=\.|$)/i.exec(text)?.[1]||'');
 const hasFeatures=(/\b(?:also\s+)?(?:should\s+have|has)\s+(.+?)(?=\.|$)/i.exec(text)?.[1]||'');
 const explicitRequired=section(text,['required features','must have','required','features','include']);
 const requiredParts=explicitRequired?[explicitRequired]:[naturalFeatures,purposeClause,includeFeatures,hasFeatures].filter(Boolean);
 const requiredText=requiredParts.join(', ');
 const optionalText=section(text,['optional features','optional'])||((/\boptional(?:ly)?\s+(.+?)(?=\.|$)/i.exec(text)?.[1])||'');
 const exclusionMatches=[...text.matchAll(/(?:do not|don't|without|no)\s+([^.;,]+)/gi)].map(m=>clean(m[1]));
 const rawRequired=unique(list(requiredText));const excludedRequired=rawRequired.filter(x=>exclusionMatches.some(e=>x.toLowerCase().includes(e.toLowerCase())||e.toLowerCase().includes(x.toLowerCase())));if(excludedRequired.length)throw Error(`Required feature excluded: ${excludedRequired.join(', ')}`);const required=rawRequired;
 const optional=list(optionalText), duplicates=required.filter(x=>optional.some(y=>y.toLowerCase()===x.toLowerCase()));
 if(duplicates.length) throw Error(`Contradictory required and optional feature: ${duplicates.join(', ')}`);
 const persistence=section(text,['persistence','data','storage'])||((/\b(save|store|persist|keep)\s+([^.!?]+)/i.exec(text)?.[0])||'');
 return freeze({appName:name||clean(product.split(/\s+for\s+/i)[0]),primaryJob:product,targetUser:target,platform,workflow,screens:list(screenText),requiredFeatures:required,optionalFeatures:optional,stateRules:list(section(text,['states','behavior','interactions'])||''),persistenceRules:list(persistence),visualRequirements:list(section(text,['visual','layout','style'])||''),constraints:list(section(text,['constraints','constraint'])||''),explicitExclusions:exclusionMatches,lockedInstructions:[text]});
}
export function compile(raw:string, options:GenerateOptions={}):Prompt {
 const lock=parseIdea(raw);
 const technicalRole=options.buildType?getSpecialistProfile(options.buildType).role:'You are a senior product designer and frontend engineer.';
 const designProfile=options.visualStyle?getVisualStyleProfile(options.visualStyle):null;
 const role=designProfile?`${technicalRole} ${designProfile.role}`:technicalRole;
 const visual=lock.visualRequirements.length
  ? lock.visualRequirements.join('; ')
  : designProfile&&designProfile.visualStyle!=='custom'
   ? designProfile.emphasis.join('; ')
   : '';
 return {role,mission:`Design ${lock.appName} to help ${lock.targetUser} ${lock.primaryJob}.`,lock,targetUser:lock.targetUser,platform:lock.platform,workflow:lock.workflow,screens:[...lock.screens],features:[...lock.requiredFeatures],states:[...lock.stateRules,...lock.persistenceRules],visual,constraints:[...lock.constraints],doNotAdd:[...lock.explicitExclusions],completion:'Every locked requirement is implemented, the stated workflow is preserved, and no unrequested screens or features are added.'};
}
export function assemble(p:Prompt){return ['Role',p.role,'Product Mission',p.mission,'Idea Lock',`App name: ${p.lock.appName}\nPrimary job: ${p.lock.primaryJob}\nTarget user: ${p.lock.targetUser}\nPlatform: ${p.lock.platform}\nLocked instruction: ${p.lock.lockedInstructions.join(' ')}`,'Target User',p.targetUser,'Platform',p.platform,'Main Workflow',p.workflow||'No workflow was specified; do not invent one.','Screen Requirements',p.screens.length?p.screens.map((s,i)=>`${i+1}. ${s}`).join('\n'):'Only screens explicitly required by the idea.','Core Features',p.features.join('\n'),'Interaction & State Rules',p.states.join('\n'),'Visual Direction',p.visual||'Follow only visual requirements stated in the idea.','Constraints',p.constraints.join('\n'),'Do Not Add',p.doNotAdd.join('\n'),'Completion Standard',p.completion].join('\n\n');}
export function validateContradictions(p:Prompt,output:string){const lock=p.lock, lower=output.toLowerCase(); const workflow=output.split('Main Workflow')[1]?.split('Screen Requirements')[0]||''; const screens=output.split('Screen Requirements')[1]?.split('Core Features')[0]||''; const core=output.split('Core Features')[1]?.split('Interaction & State Rules')[0]||''; const optional=lock.optionalFeatures.join(' ').toLowerCase();
 if(lock.workflow && !workflow.toLowerCase().includes(lock.workflow.toLowerCase())) throw Error('Workflow altered or missing');
 let cursor=-1; for(const step of lock.workflow.split(/,|;|\band\b|\bthen\b/gi).map(clean).filter(Boolean)){const at=workflow.toLowerCase().indexOf(step.toLowerCase());if(at<cursor)throw Error('Workflow reordered');if(at>=0)cursor=at;else throw Error(`Workflow step missing: ${step}`);}
 for(const screen of lock.screens)if(!screens.toLowerCase().includes(screen.toLowerCase()))throw Error(`Required screen missing: ${screen}`);
 const listed=[...screens.matchAll(/(?:^|\n)\s*\d+\.\s*([^\n]+)/g)].map(m=>clean(m[1])); const allowed=[...lock.screens,...lock.workflow.split(/,|;|\band\b|\bthen\b/gi).map(clean)]; for(const screen of listed)if(!allowed.some(x=>x.toLowerCase()===screen.toLowerCase()))throw Error(`Invented screen: ${screen}`);
 const platformSection=output.split('Platform')[1]?.split('Main Workflow')[0]||'';if(!platformSection.includes(lock.platform))throw Error('Platform conflict');
 for(const req of lock.persistenceRules)if(!lower.includes(req.toLowerCase()))throw Error(`Persistence requirement missing: ${req}`);
 for(const req of lock.requiredFeatures){if(lock.explicitExclusions.some(x=>x.toLowerCase().includes(req.toLowerCase())||req.toLowerCase().includes(x.toLowerCase())))throw Error(`Required feature excluded: ${req}`);if(optional.includes(req.toLowerCase()))throw Error(`Required feature optional: ${req}`);if(!core.toLowerCase().includes(req.toLowerCase()))throw Error(`Required feature missing: ${req}`);}
 for(const opt of lock.optionalFeatures)if(core.toLowerCase().includes(opt.toLowerCase()))throw Error(`Optional feature promoted: ${opt}`);
 for(const x of lock.explicitExclusions)if([workflow,screens,core].join(' ').toLowerCase().includes(x.toLowerCase()))throw Error(`Exclusion violation: ${x}`);
 for(const x of lock.lockedInstructions)if(!lower.includes(x.toLowerCase()))throw Error('Locked instruction contradicted');
 return true;}
export function validate(p:Prompt,output:string){const sections=['Role','Product Mission','Idea Lock','Target User','Platform','Main Workflow','Screen Requirements','Core Features','Interaction & State Rules','Visual Direction','Constraints','Do Not Add','Completion Standard'];const missing=sections.filter(x=>!output.includes(x));if(missing.length)throw Error(`Missing sections: ${missing.join(', ')}`);const positive=[p.workflow,...p.screens,...p.features,...p.states,p.visual,...p.constraints].join(' ').toLowerCase();for(const x of p.lock.explicitExclusions)if(positive.includes(x.toLowerCase()))throw Error(`Exclusion violation: ${x}`);for(const x of p.lock.requiredFeatures)if(!output.toLowerCase().includes(x.toLowerCase()))throw Error(`Missing locked requirement: ${x}`);return validateContradictions(p,output);}
export const generate=(raw:string,options:GenerateOptions={})=>{const p=compile(raw,options),out=assemble(p);validate(p,out);return out;};
