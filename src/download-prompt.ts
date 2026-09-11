export {};

function slugify(value:string){
 return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,48);
}

function findGeneratedActionRow():HTMLElement|null{
 const buttons=Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];
 const save=buttons.find(button=>button.textContent?.trim()==='Save');
 if(!save)return null;
 const row=save.parentElement;
 if(!row)return null;
 const labels=Array.from(row.querySelectorAll('button')).map(button=>button.textContent?.trim());
 return labels.includes('Copy')&&labels.includes('Clear')?row:null;
}

function findPromptText(row:HTMLElement):string{
 let node:HTMLElement|null=row;
 for(let depth=0;node&&depth<6;depth++,node=node.parentElement){
  const pre=node.querySelector('pre');
  if(pre?.textContent?.trim())return pre.textContent.trim();
  const textareas=Array.from(node.querySelectorAll('textarea')) as HTMLTextAreaElement[];
  const output=textareas.find(area=>area.value.trim().length>80);
  if(output)return output.value.trim();
 }
 return '';
}

function promptFilename(){
 const textareas=Array.from(document.querySelectorAll('textarea')) as HTMLTextAreaElement[];
 const source=textareas.find(area=>area.value.trim())?.value||'';
 const firstLine=source.trim().split(/\n+/)[0]||'';
 const hint=slugify(firstLine.split(/[:.]/)[0]);
 const date=new Date().toISOString().slice(0,10);
 return `${hint||'perfect-prompt'}-${date}.txt`;
}

function downloadPrompt(row:HTMLElement){
 const text=findPromptText(row);
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

function replaceSaveWithDownload(){
 const row=findGeneratedActionRow();
 if(!row)return;
 const save=Array.from(row.querySelectorAll('button')).find(button=>button.textContent?.trim()==='Save') as HTMLButtonElement|undefined;
 if(!save||save.dataset.downloadPrompt==='true')return;
 const replacement=save.cloneNode(true) as HTMLButtonElement;
 replacement.dataset.downloadPrompt='true';
 replacement.textContent='Download .txt';
 replacement.setAttribute('aria-label','Download generated prompt as a text file');
 replacement.onclick=null;
 replacement.addEventListener('click',event=>{
  event.preventDefault();
  event.stopPropagation();
  downloadPrompt(row);
 });
 save.replaceWith(replacement);
}

const downloadObserver=new MutationObserver(replaceSaveWithDownload);
downloadObserver.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('DOMContentLoaded',replaceSaveWithDownload);
setTimeout(replaceSaveWithDownload,0);
