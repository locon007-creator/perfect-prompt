import {buildMinimalPrompt,type MinimalEngineOptions} from './minimal-engine';
import {validateAIPrompt} from './ai-generator';

export function buildInitialPrompt(idea:string,options:MinimalEngineOptions={}):string{
 return buildMinimalPrompt(idea,options);
}

export function chooseAIPrompt(fallback:string,aiPrompt:string,buildType:string):string{
 return validateAIPrompt(aiPrompt,buildType)?aiPrompt:fallback;
}
