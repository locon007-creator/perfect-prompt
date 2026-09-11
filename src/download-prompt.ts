function slugify(value:string){
 return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,48);
}

function findGeneratedActions():HTMLElement|null{
 const buttons=Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];
 for(const copy of buttons){
  if(copy.textContent?.trim()!=='Copy')continue;
  const parent=copy.parentElement;
  if(!parent)continue;
  const labels=Array.from(parent.querySelectorAll('button')).map(button=>button.textContent?.trim());
  if(labels.includes('Save')&&labels.includes('Clear'))return parent;
 }
 return null;
}

function findPromptText(actions:HTMLElement):string{
 let node:HTMLElement|null=actions;
 for(let depth=0;node&&depth<5;depth++,node=node.parentElement){
  const pre=node.querySelector('pre');
  if(pre?.textContent?.trim())return pre.textContent.trim();
  const textarea=node.querySelector('textarea') as HTMLTextAreaElement|null;
  if(textarea?.value?.trim()&&textarea.value.trim().length>80)return textarea.value.trim();
 }
 return '';
}

function promptFilename(){
 const textarea=document.querySelector('textarea') as HTMLTextAreaElement|null;
 const firstLine=textarea?.value?.trim().split(/\n+/)[0]||'';
 const hint=slugify(firstLine.split(/[:.]/)[0]);
 const date=new Date().toISOString().slice(0,10);
 return `${hint||'perfect-prompt'}-${date}.txt`;
}

function downloadPrompt(actions:HTMLElement){
 const text=findPromptText(actions);
 if(!text)return;
 const blob=new Blob([text],{type:'text/plain;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const anchor=document.createElement('a');
 anchor.href=url;
 anchor.download=promptFilename();
 document.body.appendChild(anchor);
 anchor.click();
 anchor.remove();
 setTimeout(()=>URL.revokeObjectURL(url),0);
}

function enhance(){
 const actions=findGeneratedActions();
 if(!actions||actions.querySelector('[data-download-prompt]'))return;
 const copy=Array.from(actions.querySelectorAll('button')).find(button=>button.textContent?.trim()==='Copy') as HTMLButtonElement|undefined;
 if(!copy)return;
 const button=document.createElement('button');
 button.type='button';
 button.className=copy.className;
 button.dataset.downloadPrompt='true';
 button.textContent='Download .txt';
 button.setAttribute('aria-label','Download generated prompt as a text file');
 button.addEventListener('click',()=>downloadPrompt(actions));
 copy.insertAdjacentElement('afterend',button);
}

const observer=new MutationObserver(enhance);
observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('DOMContentLoaded',enhance);
