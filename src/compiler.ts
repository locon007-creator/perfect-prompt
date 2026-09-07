import { z } from 'zod';
import type { BuildType } from './intent';
import { getSpecialistProfile } from './intent';
import type { VisualStyle } from './visual-style';
import { getVisualStyleProfile } from './visual-style';
import type { CreationFormat } from './creation-format';
import { getCreationFormatProfile } from './creation-format';

export const InputSchema = z.object({ idea: z.string().trim().min(10) });
export type Input = z.infer<typeof InputSchema>;
export type GenerateOptions = Readonly<{ buildType?: BuildType; creationFormat?: CreationFormat; visualStyle?: VisualStyle }>;
export type IdeaLock = Readonly<{
  appName: string; primaryJob: string; targetUser: string; platform: string; workflow: string;
  screens: readonly string[]; requiredFeatures: readonly string[]; optionalFeatures: readonly string[];
  stateRules: readonly string[]; persistenceRules: readonly string[]; visualRequirements: readonly string[];
  constraints: readonly string[]; explicitExclusions: readonly string[]; lockedInstructions: readonly string[];
}>;
export type Prompt = { buildType?:BuildType; creationFormat?:CreationFormat; formatLabel:string; formatGuidance:string[]; role:string; mission:string; lock:IdeaLock; targetUser:string; platform:string; workflow:string; screens:string[]; features:string[]; states:string[]; visual:string; quality:string[]; constraints:string[]; doNotAdd:string[]; completion:string };

const freeze = <T>(value:T):Readonly<T> => { if(value && typeof value==='object' && !Object.isFrozen(value)){Object.freeze(value); for(const v of Object.values(value as object)) freeze(v);} return value as Readonly<T>; };
const clean=(s:string)=>s.replace(/[.!?]+$/,'').trim();
const list=(s:string|undefined)=>s? s.split(/,|;|\n|\band\b/gi).map(clean).filter(Boolean):[];
const sentenceBody='((?:[^.!?]|\\.(?=\\d))+)' ;
const section=(text:string, labels:string[])=>{const r=new RegExp(`(?:${labels.join('|')})\\s*[:\\-]\\s*${sentenceBody}`,'i');return r.exec(text)?.[1]?.trim()};
const purposeLead=/^(?:(?:[a-z]+ly)\s+)*(?:recording|tracking|managing|organizing|saving|calculating|logging|planning|monitoring|keeping|creating|entering|reviewing|showing|handling|using|capturing|viewing|checking|remembering|comparing|measuring|listing|editing|storing|categorizing|budgeting|scheduling)\b/i;
const unique=(items:string[])=>items.filter((item,index)=>items.findIndex(other=>other.toLowerCase()===item.toLowerCase())===index);
const negativeLead=/^(?:do not|don't|without|no)\b/i;
const stripInlineNegative=(item:string)=>clean(item.replace(/\s*(?:[.;]\s*)?(?:(?:but\s+)?without|with\s+no|but\s+no|do not|don't|no)\s+.+$/i,''));
const positiveList=(value:string|undefined)=>{if(!value)return[];const positiveOnly=stripInlineNegative(value);return unique(list(positiveOnly).filter(item=>!negativeLead.test(item)).map(clean).filter(Boolean));};
const positiveText=(value:string)=>stripInlineNegative(clean(value));
const sentenceUnits=(text:string)=>unique([
  ...text.split(/\r?\n/).map(clean).filter(Boolean),
  ...(text.match(/(?:[^.!?]|\.(?=\d))+(?:[.!?]|$)/g)||[]).map(clean).filter(Boolean),
]);
const splitNegativeItems=(value:string)=>positiveList(value.replace(/\bor\b/gi,',').replace(/^(?:add|include|use|create|show|enable|allow)\s+/i,''))
  .map(item=>item.replace(/^(?:a|an|the)\s+/i,'').trim()).filter(Boolean);
const extractExclusions=(text:string)=>{
 const items:string[]=[];
 const patterns=[/\bwithout\s+([^.;]+)/gi,/\b(?:do not|don't)\s+([^.;]+)/gi,/\bno\s+([^.;]+)/gi];
 for(const pattern of patterns)for(const match of text.matchAll(pattern))items.push(...splitNegativeItems(match[1]||''));
 return unique(items);
};
const extractWorkflow=(text:string)=>{
 const nextLine=/(?:^|\n)\s*(?:main\s+)?(?:workflow|flow|steps|process)\s*:\s*\r?\n\s*([^\r\n]+)/i.exec(text)?.[1];
 if(nextLine)return positiveText(nextLine);
 return positiveText(section(text,['main workflow','workflow','flow','steps','process'])||(/\bwhere\s+(?:they|users?|people)\s+(.+?)(?=\.(?!\d)|[!?]|\s+It should|\s+No\b|$)/i.exec(text)?.[1]||''));
};
const transientWorkflowAction=/^(?:punch\s+(?:in|out)|start\s+(?:work|shift)|end\s+(?:work|shift)|save|submit|continue|cancel|finish|complete|confirm)$/i;
const extractStructures=(text:string,workflow:string)=>{
 const explicitSection=section(text,['screens','pages','views']);
 if(explicitSection)return positiveList(explicitSection);
 const found:string[]=[];
 const explicitMentions:string[]=[];
 for(const match of text.matchAll(/\b([a-z][\w ]*?)\s+(?:screen|page|view)\b/gi)){
  const value=match[1]
   .replace(/^(?:and\s+)?/i,'')
   .replace(/^(?:It should have|it has|include|also include)\s+(?:a|an|the)\s+/i,'')
   .replace(/^(?:a|an|the)\s+/i,'')
   .trim();
  if(value){explicitMentions.push(value);found.push(value);}
 }
 if(explicitMentions.length<2)for(const stage of workflow.split(/→|->|,|;|\bthen\b/gi).map(clean).filter(Boolean))if(!transientWorkflowAction.test(stage))found.push(stage);
 for(const unit of sentenceUnits(text)){
  const subject=/^([A-Z][A-Za-z0-9 &/+-]{0,48}?)\s+should\b/.exec(unit)?.[1]?.trim();
  if(subject && !/^(?:the app|the site|the game|the product|it)$/i.test(subject))found.push(subject);
  const include=/^(?:also\s+)?include\s+(.+?)(?:\s+so\b|$)/i.exec(unit)?.[1];
  if(include){
   for(const item of include.split(/,|\band\b/gi).map(clean).filter(Boolean)){
    const candidate=item.replace(/^(?:a|an|the)\s+/i,'').replace(/\s+(?:screen|page|view)\b.*$/i,'').trim();
    if(/^[A-Z]/.test(candidate))found.push(candidate);
   }
  }
  if(/^Allow\s+(?:the\s+)?user\s+to\s+(?:set|configure|choose|manage)\b/i.test(unit))found.push('Settings');
 }
 return unique(found.map(x=>clean(x)).filter(Boolean));
};
const requirementSentence=/^(?:when\b|during\b|show\b|allow\b|use\b|(?:also\s+)?include\b|[A-Z][A-Za-z0-9 &/+-]{0,48}\s+should\b)/i;
const extractNaturalRequirements=(text:string)=>sentenceUnits(text)
 .filter(unit=>requirementSentence.test(unit))
 .map(positiveText)
 .filter(unit=>unit && !negativeLead.test(unit));
const extractNaturalStates=(text:string)=>sentenceUnits(text)
 .filter(unit=>/^(?:when|during)\b/i.test(unit))
 .map(positiveText).filter(Boolean);
const extractPersistence=(text:string)=>{
 const explicit=section(text,['persistence','data','storage']);
 const found=explicit?[explicit]:sentenceUnits(text).filter(unit=>/^(?:use\b.*\bstorage\b|(?:save|store|persist|keep)\b)/i.test(unit)||/\b(?:save|store|persist)\b.+\b(?:entry|data|history|state|settings|totals?|records?)\b/i.test(unit));
 return unique(found.flatMap(value=>positiveList(value)));
};
const extractConstraints=(text:string)=>{
 const explicit=positiveList(section(text,['constraints','constraint'])||'');
 const natural=sentenceUnits(text).filter(unit=>/^Target\b/i.test(unit)||/^Keep\s+it\s+strictly\b/i.test(unit)).map(positiveText);
 return unique([...explicit,...natural]);
};
const buildLabel=(buildType?:BuildType)=>buildType?getSpecialistProfile(buildType).label:'Unspecified';
const explicitGamePlatform=(lock:IdeaLock)=>{
 const raw=lock.lockedInstructions.join(' ');
 if(lock.platform==='Not explicitly specified')return'Game platform not specified';
 if(lock.platform!=='responsive web')return lock.platform;
 if(/\b(web|browser)\b/i.test(raw))return'Web';
 if(/\bdesktop\b/i.test(raw))return'Desktop';
 return'Game platform not specified';
};
const baseEffectivePlatform=(lock:IdeaLock,buildType?:BuildType)=>{
 if(!buildType||buildType==='app-web-app')return lock.platform;
 if(buildType==='website')return 'Web';
 if(buildType==='game')return explicitGamePlatform(lock);
 if(buildType==='video')return 'Video production';
 if(buildType==='image')return 'Image generation';
 return 'General prompt';
};
const effectivePlatform=(lock:IdeaLock,buildType?:BuildType,creationFormat?:CreationFormat)=>{
 if(creationFormat&&creationFormat!=='idea-decides')return getCreationFormatProfile(creationFormat).medium||baseEffectivePlatform(lock,buildType);
 return baseEffectivePlatform(lock,buildType);
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

const sentenceLine=(value:string)=>{const line=clean(value);return line?`${line[0].toUpperCase()}${line.slice(1)}.`:'';};
const compactLines=(items:string[])=>unique(items.map(sentenceLine).filter(Boolean));
const gerundActions:Record<string,string>={recording:'Record',tracking:'Track',managing:'Manage',organizing:'Organize',saving:'Save',calculating:'Calculate',logging:'Log',planning:'Plan',monitoring:'Monitor',keeping:'Keep',creating:'Create',entering:'Enter',reviewing:'Review',showing:'Show',handling:'Handle',using:'Use',capturing:'Capture',viewing:'View',checking:'Check',remembering:'Remember',comparing:'Compare',measuring:'Measure',listing:'List',editing:'Edit',storing:'Store',categorizing:'Categorize',budgeting:'Budget',scheduling:'Schedule'};
const featureContext=(features:string[])=>{
 const first=clean(features[0]||'');
 const match=/^(?:recording|tracking|logging|saving|capturing)\s+(.+?)\s+start$/i.exec(first);
 return match?.[1]?.trim()||'';
};
const featureLine=(feature:string,features:string[],workflow='')=>{
 let raw=clean(feature);
 const context=featureContext(features);
 raw=raw.replace(/^one main job:\s*/i,'').trim();
 if(/^make it\s+(?:fast|easy|simple|quick|clear)(?:\b.*)?$/i.test(raw))return'';
 raw=raw.replace(/^easy to\s+/i,'').trim();
 const subjectRequirement=/^[A-Z][A-Za-z0-9 &/+-]{0,48}\s+should\s+(.+)$/i.exec(raw);
 if(subjectRequirement)raw=subjectRequirement[1].trim();
 const during=/^During\s+(.+?),\s*show\s+(.+)$/i.exec(raw);
 if(during){
  const object=during[2].replace(/^a real live\s+/i,'a live ').trim();
  if(/elapsed timer/i.test(object)&&/active shift/i.test(during[1]))return sentenceLine(`Show ${object.replace(/elapsed timer/i,'elapsed shift timer')}`);
  return sentenceLine(`Show ${object} during ${during[1]}`);
 }
 const when=/^When\s+(.+?),\s*(?:automatically\s+)?(.+)$/i.exec(raw);
 if(when){
  const consequence=when[2].trim();
  if(/calculate total hours worked/i.test(consequence)&&/save (?:the day|the entry)/i.test(consequence))return'Calculate and save total daily worked hours.';
  return sentenceLine(consequence);
 }
 if(/^punch in$/i.test(raw))return /Punch In\s*→\s*Active Shift/i.test(workflow)?'Punch in to start a work shift.':'Punch in.';
 if(/^punch out$/i.test(raw))return /Active Shift\s*→\s*Punch Out/i.test(workflow)?'Punch out to end the active shift.':'Punch out.';
 if(/^see\s+(.+)/i.test(raw))return sentenceLine(`Show ${raw.replace(/^see\s+/i,'')}`);
 const history=/^(?:Include|Provide)\s+History\s+so\s+(.+)$/i.exec(raw);
 if(history&&/previous workdays can be reviewed and edited/i.test(history[1]))return'Provide History for reviewing and editing previous workdays.';
 const timeFormat=/^Allow the user to set their preferred time format$/i.exec(raw);
 if(timeFormat)return'Allow the user to choose their preferred time format.';
 if(/^(?:show|include|provide|allow|use|save|persist|track|record|calculate|set|assign)\b/i.test(raw))return sentenceLine(raw);
 const gerund=/^([a-z]+)\s+(.+)$/i.exec(raw);
 if(gerund&&gerundActions[gerund[1].toLowerCase()]){
  let object=gerund[2];
  if(/\bstart$/i.test(object))object=`${object} time`;
  return `${gerundActions[gerund[1].toLowerCase()]} ${object}.`;
 }
 if(/^end times?$/i.test(raw)&&context)return`Record ${context} end times.`;
 if(/\b(?:weekly|monthly)\b.*\btotal\b/i.test(raw))return`Calculate and display ${raw}.`;
 if(/\bdaily hours?\b/i.test(raw))return`Calculate ${raw}.`;
 if(/\breminders?\b/i.test(raw))return`Set ${raw}.`;
 if(/\bcategories?\b/i.test(raw))return`Assign ${raw}.`;
 if(/\b(?:dates?|times?)\b/i.test(raw))return`Record ${raw}.`;
 return sentenceLine(raw);
};
const canonical=(value:string)=>value.toLowerCase()
 .replace(/\brecording\b/g,'record').replace(/\btracking\b/g,'track').replace(/\bsaving\b/g,'save')
 .replace(/\bcalculating\b/g,'calculate').replace(/\blogging\b/g,'log').replace(/\borganizing\b/g,'organize')
 .replace(/\bworked\b/g,'work').replace(/\bdaily\b/g,'day')
 .replace(/[^a-z0-9]+/g,' ').trim();
const conceptStop=new Set(['a','an','the','to','for','with','using','so','can','be','is','are','of','on','all','one','main','job','make','fast','easy','simple','real','large','preferred','should','automatically','user','worker','include','provide','show','display','allow','set']);
const conceptTokens=(value:string)=>canonical(value).split(' ').filter(token=>token&&!conceptStop.has(token));
const semanticallyCovered=(required:string,sectionText:string)=>{
 const requiredTokens=conceptTokens(required);
 if(!requiredTokens.length)return true;
 const sectionTokens=new Set(conceptTokens(sectionText));
 return requiredTokens.every(token=>sectionTokens.has(token));
};
const requirementCovered=(required:string,sectionText:string)=>canonical(sectionText).includes(canonical(required))||semanticallyCovered(required,sectionText);
const dedupeSemanticLines=(lines:string[])=>{
 const cleaned=unique(lines.filter(Boolean));
 return cleaned.filter((line,index)=>{
  const tokens=conceptTokens(line);
  if(tokens.length<2)return true;
  return !cleaned.some((other,otherIndex)=>{
   if(otherIndex===index||other.length<=line.length)return false;
   const otherTokens=new Set(conceptTokens(other));
   return tokens.every(token=>otherTokens.has(token));
  });
 });
};
const combineWeeklyView=(lines:string[])=>{
 const viewIndex=lines.findIndex(line=>/weekly view/i.test(line)&&/workweek/i.test(line));
 const totalIndex=lines.findIndex(line=>/each day/i.test(line)&&/weekly total/i.test(line));
 if(viewIndex<0||totalIndex<0||viewIndex===totalIndex)return lines;
 const workweek=/using a\s+(.+?)\s+workweek/i.exec(lines[viewIndex])?.[1]||'weekly';
 const combined=`Show a ${workweek} Weekly view with daily hours and the weekly total.`;
 return lines.filter((_,index)=>index!==viewIndex&&index!==totalIndex).concat(combined);
};
const semanticFeatureLines=(features:string[],workflow:string,constraints:string[])=>{
 const rawLines=features
  .filter(feature=>!constraints.some(constraint=>canonical(feature)===canonical(constraint)))
  .map(feature=>featureLine(feature,features,workflow))
  .filter(Boolean);
 const firstPass=dedupeSemanticLines(rawLines);
 return dedupeSemanticLines(combineWeeklyView(firstPass));
};
const semanticRequirementCovered=(required:string,core:string,states:string,features:string[],workflow:string)=>{
 const normalized=featureLine(required,features,workflow);
 if(!normalized)return true;
 return requirementCovered(normalized,core)||requirementCovered(required,core)||requirementCovered(required,states);
};
const visualLines=(visual:string)=>compactLines(visual.split(';').map(x=>x.trim()).filter(Boolean));
const audienceLines=(target:string)=>target.toLowerCase()==='the intended user'
 ? ['Primary audience: the intended user.','Do not invent a more specific persona unless the locked idea provides one.']
 : [`Primary audience: ${target}.`,'Keep product decisions grounded in this stated audience; do not broaden it to unrelated user groups.'];
const platformLines=(platform:string,formatLabel:string,formatGuidance:string[])=>{
 const base=platform==='Not explicitly specified'
  ? ['Not explicitly specified','Do not assume Android, iOS, or web unless the locked idea specifies it.']
  : [platform];
 return formatLabel==='Let the idea decide'?base:[...base,`Creation format: ${formatLabel}.`,...formatGuidance];
};

export function parseIdea(raw:string):IdeaLock {
 const text=InputSchema.parse({idea:raw}).idea;
 const platform=/\b(ios|iphone|ipad)\b/i.test(text)?'iOS':/\bandroid\b/i.test(text)?'Android':/\b(?:responsive\s+web|web\s+app|website|browser|web)\b/i.test(text)?'responsive web':/\bmobile|phone\b/i.test(text)?'mobile':'Not explicitly specified';
 const quotedName=/\b(?:called|named)\s+["“]([^"”]+)["”]/i.exec(text)?.[1];
 const unquotedName=/\b(?:called|named)\s+(.+?)(?=\s+for\b|\s+where\b|\s+that\b|\s+on\b|[.,;!?]|$)/i.exec(text)?.[1];
 const name=clean((quotedName||unquotedName||'').trim());
 const product=clean((/\b(?:build|create|make|design)\s+(?:a|an|the)\s+(.+?)(?=\s+for\s+|\s+where\s+|\s+that\s+|\s+on\s+|\.|$)/i.exec(text)?.[1]||text));
 const targeted=(/\btarget(?:ed)?\s+at\s+([^.;]+?)(?=\s+(?:where|that|on|with|which)\b|[.!?]|$)/i.exec(text)?.[1]||'').trim();
 const forClause=(/\bfor\s+([^.;]+?)(?=\s+(?:where|on|with|which)\b|[.!?]|$)/i.exec(text)?.[1]||'').trim();
 const directPurpose=purposeLead.test(forClause)?forClause:'';
 const audiencePurposeMatch=directPurpose?null:/^(.+?)\s+(?:to|who|that)\s+(.+)$/i.exec(forClause);
 const audienceClause=(audiencePurposeMatch?.[1]||'').trim();
 const audiencePurpose=(audiencePurposeMatch?.[2]||'').trim();
 const purposeClause=directPurpose||audiencePurpose;
 const target=clean(targeted||audienceClause||(!purposeClause&&forClause?forClause:'the intended user'))||'the intended user';
 const workflow=extractWorkflow(text);
 const screens=extractStructures(text,workflow);
 const naturalFeatures=(/\bwhere\s+(?:they|users?|people)\s+(.+?)(?=\.(?!\d)|[!?]|\s+It should|\s+No\b|$)/i.exec(text)?.[1]||'').replace(/\b(and|then)\b/gi,',');
 const includeFeatures=(/\b(?:also\s+)?include(?:s|d)?\s+(.+?)(?=\.(?!\d)|[!?]|$)/i.exec(text)?.[1]||'');
 const hasFeatures=(/\b(?:also\s+)?(?:should\s+have|has)\s+(.+?)(?=\.(?!\d)|[!?]|$)/i.exec(text)?.[1]||'');
 const alsoFeatures=(/(?:^|[.!?]\s*)(?:and\s+)?also\s+(?!include\b)(.+?)(?=\.(?!\d)|[!?]|$)/i.exec(text)?.[1]||'');
 const explicitRequired=section(text,['required features','must have','required','features','include']);
 const explicitMainJob=section(text,['one main job','main job','primary job','purpose']);
 const mainJob=positiveText(explicitMainJob||purposeClause||product);
 const requiredParts=explicitRequired?[explicitRequired]:[naturalFeatures,purposeClause,mainJob,includeFeatures,hasFeatures,alsoFeatures].filter(Boolean);
 const baselineRequired=positiveList(requiredParts.join(', '));
 const required=explicitRequired?baselineRequired:unique([...baselineRequired,...extractNaturalRequirements(text)]);
 const optionalText=section(text,['optional features','optional'])||((/\boptional(?:ly)?\s+(.+?)(?=\.(?!\d)|[!?]|$)/i.exec(text)?.[1])||'');
 const exclusions=extractExclusions(text);
 const excludedRequired=required.filter(x=>exclusions.some(e=>x.toLowerCase().includes(e.toLowerCase())||e.toLowerCase().includes(x.toLowerCase())));
 if(excludedRequired.length)throw Error(`Required feature excluded: ${excludedRequired.join(', ')}`);
 const optional=positiveList(optionalText), duplicates=required.filter(x=>optional.some(y=>y.toLowerCase()===x.toLowerCase()));
 if(duplicates.length) throw Error(`Contradictory required and optional feature: ${duplicates.join(', ')}`);
 const explicitStates=positiveList(section(text,['states','behavior','interactions'])||'');
 const stateRules=unique([...explicitStates,...extractNaturalStates(text)]);
 const persistenceRules=extractPersistence(text);
 const constraints=extractConstraints(text);
 return freeze({appName:name||clean(product.split(/\s+for\s+/i)[0]),primaryJob:mainJob,targetUser:target,platform,workflow,screens,requiredFeatures:required,optionalFeatures:optional,stateRules,persistenceRules,visualRequirements:positiveList(section(text,['visual','layout','style'])||''),constraints,explicitExclusions:exclusions,lockedInstructions:[text]});
}

export function compile(raw:string, options:GenerateOptions={}):Prompt {
 const lock=parseIdea(raw);
 const technicalRole=options.buildType?getSpecialistProfile(options.buildType).role:'You are a senior product designer and frontend engineer.';
 const designProfile=options.visualStyle?getVisualStyleProfile(options.visualStyle):null;
 const formatProfile=options.creationFormat?getCreationFormatProfile(options.creationFormat):getCreationFormatProfile('idea-decides');
 const role=designProfile?`${technicalRole} ${designProfile.role}`:technicalRole;
 const visual=lock.visualRequirements.length
  ? lock.visualRequirements.join('; ')
  : designProfile&&designProfile.visualStyle!=='custom'
   ? designProfile.emphasis.join('; ')
   : '';
 const quality=designProfile&&designProfile.visualStyle!=='custom'?[...designProfile.quality]:[];
 return {buildType:options.buildType,creationFormat:options.creationFormat,formatLabel:formatProfile.label,formatGuidance:[...formatProfile.guidance],role,mission:missionFor(lock,options.buildType),lock,targetUser:lock.targetUser,platform:effectivePlatform(lock,options.buildType,options.creationFormat),workflow:lock.workflow,screens:[...lock.screens],features:[...lock.requiredFeatures],states:[...lock.stateRules,...lock.persistenceRules],visual,quality,constraints:[...lock.constraints],doNotAdd:[...lock.explicitExclusions],completion:completionFor(options.buildType)};
}
export function assemble(p:Prompt){
 const coreLines=semanticFeatureLines(p.features,p.workflow,p.constraints);
 const core=coreLines.length?coreLines.join('\n'):'Only features explicitly stated or directly required by the locked idea.';
 const states=p.states.length?p.states.join('\n'):stateFallback(p.buildType);
 const quality=p.quality.length?compactLines(p.quality).join('\n'):'Follow only build-quality, branding, and motion requirements explicitly stated in the idea.';
 const constraints=p.constraints.length?compactLines(p.constraints).join('\n'):'Follow only constraints explicitly stated in the locked idea.';
 const doNotAdd=p.doNotAdd.length?compactLines(p.doNotAdd).join('\n'):doNotAddFallback(p.buildType);
 const structure=p.screens.length?p.screens.map((s,i)=>`${i+1}. ${s}`).join('\n'):structureFallback(p.buildType);
 const visual=p.visual?visualLines(p.visual).join('\n'):'Follow only visual requirements stated in the idea.';
 return ['Role',p.role,'Product Mission',p.mission,'Idea Lock',`Project type: ${buildLabel(p.buildType)}\nCreation format: ${p.formatLabel}\nProject name: ${p.lock.appName}\nPrimary job: ${p.lock.primaryJob}\nTarget user: ${p.lock.targetUser}\nPlatform / medium: ${p.platform}\nLocked instruction: ${p.lock.lockedInstructions.join(' ')}`,'Target User',audienceLines(p.targetUser).join('\n'),'Platform',platformLines(p.platform,p.formatLabel,p.formatGuidance).join('\n'),'Main Workflow',p.workflow||workflowFallback(p.buildType),'Structure Requirements',structure,'Core Features',core,'Interaction & State Rules',states,'Visual Direction',visual,'Build Quality & Brand Experience',quality,'Constraints',constraints,'Do Not Add',doNotAdd,'Completion Standard',p.completion].join('\n\n');
}
export function validateContradictions(p:Prompt,output:string){const lock=p.lock, lower=output.toLowerCase(); const workflow=output.split('Main Workflow')[1]?.split('Structure Requirements')[0]||''; const structures=output.split('Structure Requirements')[1]?.split('Core Features')[0]||''; const core=output.split('Core Features')[1]?.split('Interaction & State Rules')[0]||''; const states=output.split('Interaction & State Rules')[1]?.split('Visual Direction')[0]||''; const optional=lock.optionalFeatures.join(' ').toLowerCase();
 if(lock.workflow && !workflow.toLowerCase().includes(lock.workflow.toLowerCase())) throw Error('Workflow altered or missing');
 let cursor=-1; for(const step of lock.workflow.split(/→|->|,|;|\band\b|\bthen\b/gi).map(clean).filter(Boolean)){const at=workflow.toLowerCase().indexOf(step.toLowerCase());if(at<cursor)throw Error('Workflow reordered');if(at>=0)cursor=at;else throw Error(`Workflow step missing: ${step}`);}
 for(const screen of lock.screens)if(!structures.toLowerCase().includes(screen.toLowerCase()))throw Error(`Required structure missing: ${screen}`);
 const listed=[...structures.matchAll(/(?:^|\n)\s*\d+\.\s*([^\n]+)/g)].map(m=>clean(m[1])); const allowed=[...lock.screens,...lock.workflow.split(/→|->|,|;|\band\b|\bthen\b/gi).map(clean)]; for(const item of listed)if(!allowed.some(x=>x.toLowerCase()===item.toLowerCase()))throw Error(`Invented structure: ${item}`);
 const platformSection=output.split('Platform')[1]?.split('Main Workflow')[0]||'';if(!platformSection.includes(p.platform))throw Error('Platform conflict');
 for(const req of lock.persistenceRules)if(!lower.includes(req.toLowerCase()))throw Error(`Persistence requirement missing: ${req}`);
 for(const req of lock.requiredFeatures){if(lock.explicitExclusions.some(x=>x.toLowerCase().includes(req.toLowerCase())||req.toLowerCase().includes(x.toLowerCase())))throw Error(`Required feature excluded: ${req}`);if(optional.includes(req.toLowerCase()))throw Error(`Required feature optional: ${req}`);if(!semanticRequirementCovered(req,core,states,p.features,p.workflow))throw Error(`Required feature missing: ${req}`);}
 for(const opt of lock.optionalFeatures)if(core.toLowerCase().includes(opt.toLowerCase()))throw Error(`Optional feature promoted: ${opt}`);
 for(const x of lock.explicitExclusions)if([workflow,structures,core].join(' ').toLowerCase().includes(x.toLowerCase()))throw Error(`Exclusion violation: ${x}`);
 for(const x of lock.lockedInstructions)if(!lower.includes(x.toLowerCase()))throw Error('Locked instruction contradicted');
 return true;}
export function validate(p:Prompt,output:string){const sections=['Role','Product Mission','Idea Lock','Target User','Platform','Main Workflow','Structure Requirements','Core Features','Interaction & State Rules','Visual Direction','Build Quality & Brand Experience','Constraints','Do Not Add','Completion Standard'];const missing=sections.filter(x=>!output.includes(x));if(missing.length)throw Error(`Missing sections: ${missing.join(', ')}`);const positive=[p.workflow,...p.screens,...p.features,...p.states,p.visual,...p.constraints].join(' ').toLowerCase();for(const x of p.lock.explicitExclusions)if(positive.includes(x.toLowerCase()))throw Error(`Exclusion violation: ${x}`);const core=output.split('Core Features')[1]?.split('Interaction & State Rules')[0]||'';const states=output.split('Interaction & State Rules')[1]?.split('Visual Direction')[0]||'';for(const x of p.lock.requiredFeatures)if(!semanticRequirementCovered(x,core,states,p.features,p.workflow))throw Error(`Missing locked requirement: ${x}`);return validateContradictions(p,output);}
export const generate=(raw:string,options:GenerateOptions={})=>{const p=compile(raw,options),out=assemble(p);validate(p,out);return out;};
