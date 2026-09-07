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
export type Prompt = { buildType?:BuildType; role:string; mission:string; lock:IdeaLock; targetUser:string; platform:string; workflow:string; screens:string[]; features:string[]; states:string[]; visual:string; constraints:string[]; doNotAdd:string[]; completion:string };
const freeze = <T>(value:T):Readonly<T> => { if(value && typeof value==='object' && !Object.isFrozen(value)){Object.freeze(value); for(const v of Object.values(value as object)) freeze(v);} return value as Readonly<T>; };
const clean=(s:string)=>s.replace(/[.!?]+$/,'').trim();
const list=(s:string|undefined)=>s? s.split(/,|;|\n|\band\b/gi).map(clean).filter(Boolean):[];
const sentenceBody='((?:[^.!?]|\\.(?=\\d))+)' ;
const section=(text:string, labels:string[])=>{const r=new RegExp(`(?:${labels.join('|')})\\s*[:\\-]\\s*${sentenceBody}`,'i');return r.exec(text)?.[1]?.trim()};
const purposeLead=/^(?:recording|tracking|managing|organizing|saving|calculating|logging|planning|monitoring|keeping|creating|entering|reviewing|showing|handling|using)\b/i;
const unique=(items:string[])=>items.filter((item,index)=>items.findIndex(other=>other.toLowerCase()===item.toLowerCase())===index);
const negativeLead=/^(?:do not|don't|without|no)\b/i;
const stripInlineNegative=(item:string)=>clean(item.replace(/\s+(?:(?:but\s+)?without|with\s+no|but\s+no)\s+.+$/i,''));
const positiveList=(value:string|undefined)=>unique(list(value).filter(item=>!negativeLead.test(item)).map(stripInlineNegative).filter(Boolean));
const positiveText=(value:string)=>stripInlineNegative(clean(value));
const buildLabel=(buildType?:BuildType)=>buildType?getSpecialistProfile(buildType).label:'Unspecified';
const explicitGamePlatform=(lock:IdeaLock)=>{
 const raw=lock.lockedInstructions.join(' ');
 if(lock.platform!=='responsive web')return lock.platform;
 if(/\b(web|browser)\b/i.test(raw))return'Web';
 if(/\bdesktop\b/i.test(raw))return'Desktop';
 return'Game platform not specified';
};
const effectivePlatform=(lock:IdeaLock,buildType?:BuildType)=>{
 if(!buildType||buildType==='app-web-app')return lock.platform;
 if(buildType==='website')return 'Web';
 if(buildType==='game')return explicitGamePlatform(lock);
 if(buildType==='video')return 'Video production';
 if(buildType==='image')return 'Image generation';
 return 'General prompt';
};
const missionFor=(lock:IdeaLock,buildType?:BuildType)=>{
 switch(buildType){
  case'app-web-app':return`Build ${lock.appName} for ${lock.targetUser}. Keep its primary job focused on ${lock.primaryJob}.`;
  case'website':return`Design and build ${lock.appName} for ${lock.targetUser}. Keep the site focused on ${lock.primaryJob}.`;
  case'game':return`Design ${lock.appName} for ${lock.targetUser}, preserving the locked gameplay goal and requirements.`;
  case'video':return`Create ${lock.appName} for ${lock.targetUser}, preserving the locked concept, sequence, and production requirements.`;
  case'image':return`Create ${lock.appName} for ${lock.targetUser}, preserving the locked subject, composition, and visual constraints.`;
  case'general':return`Produce ${lock.appName} for ${lock.targetUser}, following the locked goal, constraints, and desired output.`;
  default:return`Design ${lock.appName} to help ${lock.targetUser} ${lock.primaryJob}.`;
 }
};
const structureFallback=(buildType?:BuildType)=>{
 switch(buildType){
  case'website':return'Only pages explicitly required by the idea.';
  case'game':return'Only gameplay screens or views explicitly required by the idea.';
  case'video':return'Only scenes, shots, or sequence requirements explicitly required by the idea.';
  case'image':return'Only subject, composition, framing, lighting, or environment requirements explicitly required by the idea.';
  case'general':return'Only output format, content, or response structure explicitly required by the idea.';
  default:return'Only screens explicitly required by the idea.';
 }
};
const workflowFallback=(buildType?:BuildType)=>{
 switch(buildType){
  case'website':return'No page flow or navigation sequence was specified; do not invent one.';
  case'game':return'No gameplay loop or progression sequence was specified; do not invent one.';
  case'video':return'No scene or shot sequence was specified; do not invent one.';
  case'image':return'No process sequence applies; preserve only the requested image requirements.';
  case'general':return'No process or response sequence was specified; do not invent one.';
  default:return'No workflow was specified; do not invent one.';
 }
};
const stateFallback=(buildType?:BuildType)=>{
 switch(buildType){
  case'website':return'Implement only navigation and interaction behavior necessary for the locked page requirements; do not invent extra flows.';
  case'game':return'Implement only game state, controls, feedback, and progression behavior directly required by the locked idea.';
  case'video':return'Preserve only pacing, continuity, scene behavior, and audio direction directly required by the locked idea.';
  case'image':return'No interactive state is required unless the locked idea explicitly asks for it; preserve the requested visual composition.';
  case'general':return'Apply only response behavior and formatting necessary for the locked request; do not invent extra process steps.';
  default:return'Implement only interaction and state behavior necessary for the locked requirements; do not invent extra flows.';
 }
};
const doNotAddFallback=(buildType?:BuildType)=>{
 switch(buildType){
  case'website':return'Do not add unrequested pages, features, integrations, navigation, or account flows.';
  case'game':return'Do not add unrequested mechanics, gameplay screens, progression systems, modes, or integrations.';
  case'video':return'Do not add unrequested scenes, messages, effects, characters, or production elements.';
  case'image':return'Do not add unrequested objects, text, styles, characters, or scene elements.';
  case'general':return'Do not add unrequested content, tools, steps, claims, or output sections.';
  default:return'Do not add unrequested screens, features, integrations, roles, or workflows.';
 }
};
const completionFor=(buildType?:BuildType)=>{
 switch(buildType){
  case'website':return'Every locked requirement is implemented, requested page hierarchy and navigation are preserved, and no unrequested pages, features, or integrations are added.';
  case'game':return'Every locked requirement is implemented, requested gameplay rules and progression are preserved, and no unrequested mechanics, screens, or systems are added.';
  case'video':return'Every locked requirement is represented in the final video plan, requested sequence and continuity are preserved, and no unrequested scenes, messages, or production elements are added.';
  case'image':return'Every locked requirement is represented in the final image prompt, requested subject and composition are preserved, and no unrequested objects, styles, text, or scene elements are added.';
  case'general':return'Every locked requirement is represented in the requested output, requested structure and constraints are preserved, and no unrequested content or steps are added.';
  default:return'Every locked requirement is implemented, the stated workflow is preserved, and no unrequested screens or features are added.';
 }
};
export function parseIdea(raw:string):IdeaLock {
 const text=InputSchema.parse({idea:raw}).idea;
 const platform=/\b(ios|iphone|ipad)\b/i.test(text)?'iOS':/\bandroid\b/i.test(text)?'Android':/\bmobile|phone\b/i.test(text)?'mobile':'responsive web';
 const name=(/\b(?:called|named)\s+["“]?([^"”.,]+)/i.exec(text)?.[1]||'').trim();
 const product=clean((/\b(?:build|create|make|design)\s+(?:a|an|the)\s+(.+?)(?=\s+for\s+|\s+where\s+|\s+that\s+|\s+on\s+|\.|$)/i.exec(text)?.[1]||text));
 const targeted=(/\btarget(?:ed)?\s+at\s+([^.;]+?)(?=\s+(?:where|that|on|with|which)\b|[.!?]|$)/i.exec(text)?.[1]||'').trim();
 const forClause=(/\bfor\s+([^.;]+?)(?=\s+(?:where|on|with|which)\b|[.!?]|$)/i.exec(text)?.[1]||'').trim();
 const audiencePurposeMatch=/^(.+?)\s+(?:to|who|that)\s+(.+)$/i.exec(forClause);
 const audienceClause=(audiencePurposeMatch?.[1]||'').trim();
 const audiencePurpose=(audiencePurposeMatch?.[2]||'').trim();
 const purposeClause=purposeLead.test(forClause)?forClause:audiencePurpose;
 const target=clean(targeted||audienceClause||(!purposeClause&&forClause?forClause:'the intended user'));
 const workflow=positiveText(section(text,['workflow','flow','steps','process'])||(/\bwhere\s+(?:they|users?|people)\s+(.+?)(?=\.(?!\d)|[!?]|\s+It should|\s+No\b|$)/i.exec(text)?.[1]||''));
 const screenText=section(text,['screens','pages','views'])||[...text.matchAll(/\b([a-z][\w ]*?)\s+screen\b/gi)].map(m=>m[1].replace(/^(?:It should have|it has|include)\s+(?:a|an|the)\s+/i,'')).join(', ');
 const naturalFeatures=(/\bwhere\s+(?:they|users?|people)\s+(.+?)(?=\.(?!\d)|[!?]|\s+It should|\s+No\b|$)/i.exec(text)?.[1]||'').replace(/\b(and|then)\b/gi,',');
 const includeFeatures=(/\b(?:also\s+)?include(?:s|d)?\s+(.+?)(?=\.(?!\d)|[!?]|$)/i.exec(text)?.[1]||'');
 const hasFeatures=(/\b(?:also\s+)?(?:should\s+have|has)\s+(.+?)(?=\.(?!\d)|[!?]|$)/i.exec(text)?.[1]||'');
 const alsoFeatures=(/(?:^|[.!?]\s*)(?:and\s+)?also\s+(?!include\b)(.+?)(?=\.(?!\d)|[!?]|$)/i.exec(text)?.[1]||'');
 const explicitRequired=section(text,['required features','must have','required','features','include']);
 const requiredParts=explicitRequired?[explicitRequired]:[naturalFeatures,purposeClause,includeFeatures,hasFeatures,alsoFeatures].filter(Boolean);
 const requiredText=requiredParts.join(', ');
 const optionalText=section(text,['optional features','optional'])||((/\boptional(?:ly)?\s+(.+?)(?=\.(?!\d)|[!?]|$)/i.exec(text)?.[1])||'');
 const exclusionMatches=[...text.matchAll(/(?:do not|don't|without|no)\s+([^.;,]+)/gi)].map(m=>clean(m[1]));
 const rawRequired=positiveList(requiredText);const excludedRequired=rawRequired.filter(x=>exclusionMatches.some(e=>x.toLowerCase().includes(e.toLowerCase())||e.toLowerCase().includes(x.toLowerCase())));if(excludedRequired.length)throw Error(`Required feature excluded: ${excludedRequired.join(', ')}`);const required=rawRequired;
 const optional=positiveList(optionalText), duplicates=required.filter(x=>optional.some(y=>y.toLowerCase()===x.toLowerCase()));
 if(duplicates.length) throw Error(`Contradictory required and optional feature: ${duplicates.join(', ')}`);
 const persistence=section(text,['persistence','data','storage'])||((/\b(save|store|persist|keep)\s+(.+?)(?=\.(?!\d)|[!?]|$)/i.exec(text)?.[0])||'');
 return freeze({appName:name||clean(product.split(/\s+for\s+/i)[0]),primaryJob:product,targetUser:target,platform,workflow,screens:list(screenText),requiredFeatures:required,optionalFeatures:optional,stateRules:positiveList(section(text,['states','behavior','interactions'])||''),persistenceRules:positiveList(persistence),visualRequirements:positiveList(section(text,['visual','layout','style'])||''),constraints:positiveList(section(text,['constraints','constraint'])||''),explicitExclusions:exclusionMatches,lockedInstructions:[text]});
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
 return {buildType:options.buildType,role,mission:missionFor(lock,options.buildType),lock,targetUser:lock.targetUser,platform:effectivePlatform(lock,options.buildType),workflow:lock.workflow,screens:[...lock.screens],features:[...lock.requiredFeatures],states:[...lock.stateRules,...lock.persistenceRules],visual,constraints:[...lock.constraints],doNotAdd:[...lock.explicitExclusions],completion:completionFor(options.buildType)};
}
export function assemble(p:Prompt){
 const core=p.features.length?p.features.join('\n'):'Only features explicitly stated or directly required by the locked idea.';
 const states=p.states.length?p.states.join('\n'):stateFallback(p.buildType);
 const constraints=p.constraints.length?p.constraints.join('\n'):'Follow only constraints explicitly stated in the locked idea.';
 const doNotAdd=p.doNotAdd.length?p.doNotAdd.join('\n'):doNotAddFallback(p.buildType);
 const structure=p.screens.length?p.screens.map((s,i)=>`${i+1}. ${s}`).join('\n'):structureFallback(p.buildType);
 return ['Role',p.role,'Product Mission',p.mission,'Idea Lock',`Project type: ${buildLabel(p.buildType)}\nProject name: ${p.lock.appName}\nPrimary job: ${p.lock.primaryJob}\nTarget user: ${p.lock.targetUser}\nPlatform / medium: ${p.platform}\nLocked instruction: ${p.lock.lockedInstructions.join(' ')}`,'Target User',p.targetUser,'Platform',p.platform,'Main Workflow',p.workflow||workflowFallback(p.buildType),'Structure Requirements',structure,'Core Features',core,'Interaction & State Rules',states,'Visual Direction',p.visual||'Follow only visual requirements stated in the idea.','Constraints',constraints,'Do Not Add',doNotAdd,'Completion Standard',p.completion].join('\n\n');
}
export function validateContradictions(p:Prompt,output:string){const lock=p.lock, lower=output.toLowerCase(); const workflow=output.split('Main Workflow')[1]?.split('Structure Requirements')[0]||''; const structures=output.split('Structure Requirements')[1]?.split('Core Features')[0]||''; const core=output.split('Core Features')[1]?.split('Interaction & State Rules')[0]||''; const optional=lock.optionalFeatures.join(' ').toLowerCase();
 if(lock.workflow && !workflow.toLowerCase().includes(lock.workflow.toLowerCase())) throw Error('Workflow altered or missing');
 let cursor=-1; for(const step of lock.workflow.split(/,|;|\band\b|\bthen\b/gi).map(clean).filter(Boolean)){const at=workflow.toLowerCase().indexOf(step.toLowerCase());if(at<cursor)throw Error('Workflow reordered');if(at>=0)cursor=at;else throw Error(`Workflow step missing: ${step}`);}
 for(const screen of lock.screens)if(!structures.toLowerCase().includes(screen.toLowerCase()))throw Error(`Required structure missing: ${screen}`);
 const listed=[...structures.matchAll(/(?:^|\n)\s*\d+\.\s*([^\n]+)/g)].map(m=>clean(m[1])); const allowed=[...lock.screens,...lock.workflow.split(/,|;|\band\b|\bthen\b/gi).map(clean)]; for(const item of listed)if(!allowed.some(x=>x.toLowerCase()===item.toLowerCase()))throw Error(`Invented structure: ${item}`);
 const platformSection=output.split('Platform')[1]?.split('Main Workflow')[0]||'';if(!platformSection.includes(p.platform))throw Error('Platform conflict');
 for(const req of lock.persistenceRules)if(!lower.includes(req.toLowerCase()))throw Error(`Persistence requirement missing: ${req}`);
 for(const req of lock.requiredFeatures){if(lock.explicitExclusions.some(x=>x.toLowerCase().includes(req.toLowerCase())||req.toLowerCase().includes(x.toLowerCase())))throw Error(`Required feature excluded: ${req}`);if(optional.includes(req.toLowerCase()))throw Error(`Required feature optional: ${req}`);if(!core.toLowerCase().includes(req.toLowerCase()))throw Error(`Required feature missing: ${req}`);}
 for(const opt of lock.optionalFeatures)if(core.toLowerCase().includes(opt.toLowerCase()))throw Error(`Optional feature promoted: ${opt}`);
 for(const x of lock.explicitExclusions)if([workflow,structures,core].join(' ').toLowerCase().includes(x.toLowerCase()))throw Error(`Exclusion violation: ${x}`);
 for(const x of lock.lockedInstructions)if(!lower.includes(x.toLowerCase()))throw Error('Locked instruction contradicted');
 return true;}
export function validate(p:Prompt,output:string){const sections=['Role','Product Mission','Idea Lock','Target User','Platform','Main Workflow','Structure Requirements','Core Features','Interaction & State Rules','Visual Direction','Constraints','Do Not Add','Completion Standard'];const missing=sections.filter(x=>!output.includes(x));if(missing.length)throw Error(`Missing sections: ${missing.join(', ')}`);const positive=[p.workflow,...p.screens,...p.features,...p.states,p.visual,...p.constraints].join(' ').toLowerCase();for(const x of p.lock.explicitExclusions)if(positive.includes(x.toLowerCase()))throw Error(`Exclusion violation: ${x}`);for(const x of p.lock.requiredFeatures)if(!output.toLowerCase().includes(x.toLowerCase()))throw Error(`Missing locked requirement: ${x}`);return validateContradictions(p,output);}
export const generate=(raw:string,options:GenerateOptions={})=>{const p=compile(raw,options),out=assemble(p);validate(p,out);return out;};