import {generate,type GenerateOptions} from './compiler';
import {validateAIPrompt} from './ai-generator';

const negativeRule=/^\s*(?:do not|don't|never|no\b|there is no\b|it is not\b|home is not\b)/i;

function recoverFromFalseExclusionConflict(idea:string,options:GenerateOptions,error:unknown):string{
 const message=error instanceof Error?error.message:'';
 if(!message.startsWith('Required feature excluded:'))throw error;
 const lines=idea.split(/\r?\n/);
 const negatives=lines.filter(line=>negativeRule.test(line.trim())).map(line=>line.trim()).filter(Boolean);
 const positiveIdea=lines.filter(line=>!negativeRule.test(line.trim())).join('\n').trim();
 if(!positiveIdea||!negatives.length)throw error;
 const compiled=generate(positiveIdea,options);
 return `${compiled}\n\nLocked Negative Requirements\n${negatives.map(rule=>`- ${rule}`).join('\n')}`;
}

export function buildInitialPrompt(idea:string,options:GenerateOptions={}):string{
 try{return generate(idea,options)}catch(error){return recoverFromFalseExclusionConflict(idea,options,error)}
}

export function chooseAIPrompt(fallback:string,aiPrompt:string,buildType:string):string{
 return validateAIPrompt(aiPrompt,buildType)?aiPrompt:fallback;
}
