import { generate } from './compiler';
export default class CompilerProvider { id(){ return 'perfect-prompt-compiler'; } async callApi(prompt:string) { return { output: generate(prompt) }; } }
