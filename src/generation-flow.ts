import {generate,type GenerateOptions} from './compiler';
import {validateAIPrompt} from './ai-generator';

export function buildInitialPrompt(idea:string,options:GenerateOptions={}):string{
 return generate(idea,options);
}

export function chooseAIPrompt(fallback:string,aiPrompt:string,buildType:string):string{
 return validateAIPrompt(aiPrompt,buildType)?aiPrompt:fallback;
}
