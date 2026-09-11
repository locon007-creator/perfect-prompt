export {};

function slugify(value:string){
 return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,48);
}

function findGeneratedActionRow():HTMLElement|null{
 const buttons=Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];
 const marker=buttons.find(button=>{
  const label=button.textContent?.trim();
  return label==='Save'||label==='Download .txt';
 });
 if(!marker)return null;
 const row=marker.parentElement;
 if(!row)return null;
 const labels=Array.from(row.querySelectorAll('button')).map(button=>button.textContent?.trim());
 const hasCopy=labels.includes('Copy')||labels.includes('Copy Prompt');
 return hasCopy&&labels.includes('Clear')?row:null;
}

function findPromptText(row:HTMLElement):string{
 let node:HTMLElement|null=row;
 for(let depth=0;node&&depth<6;depth++,node=node.parentElement){
  const pre=node.querySelector('pre');
  if(pre?.textContent?.trim())return pre.textContent.trim();
  const textareas=Array.from(node.querySelectorAll('textarea')) as HTMLTextAreaElement[];
  const output=textareas.find(area=>area.value.trim().length>0);
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
 anchor.style.display='none';
 document.body.appendChild(anchor);
 anchor.click();
 anchor.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function syncDownloadAction(){
 const row=findGeneratedActionRow();
 if(!row)return;
 let button=Array.from(row.querySelectorAll('button')).find(item=>{
  const label=item.textContent?.trim();
  return label==='Save'||label==='Download .txt';
 }) as HTMLButtonElement|undefined;
 if(!button)return;

 if(button.textContent?.trim()==='Save'){
  const replacement=button.cloneNode(true) as HTMLButtonElement;
  replacement.dataset.downloadPrompt='true';
  replacement.textContent='Download .txt';
  replacement.setAttribute('aria-label','Download generated prompt as a text file');
  replacement.removeAttribute('disabled');
  replacement.disabled=false;
  replacement.onclick=null;
  replacement.addEventListener('click',event=>{
   event.preventDefault();
   event.stopPropagation();
   if(replacement.disabled)return;
   downloadPrompt(row);
  });
  button.replaceWith(replacement);
  button=replacement;
 }

 const ready=Boolean(findPromptText(row));
 button.disabled=!ready;
 button.setAttribute('aria-disabled',String(!ready));
}

const downloadObserver=new MutationObserver(syncDownloadAction);
downloadObserver.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
window.addEventListener('DOMContentLoaded',syncDownloadAction);
setTimeout(syncDownloadAction,0);
