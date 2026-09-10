import type {GenerateOptions} from './compiler';
import {validateAIPrompt} from './ai-generator';
import {buildSafeCompilerPrompt} from './safe-compiler';

export function buildInitialPrompt(idea:string,options:GenerateOptions={}):string{
 return buildSafeCompilerPrompt(idea,options);
}

export function chooseAIPrompt(fallback:string,aiPrompt:string,buildType:string):string{
 return validateAIPrompt(aiPrompt,buildType)?aiPrompt:fallback;
}
