type OutputMode='quick'|'premium'|'developer'|'launch';

const STORAGE_KEY='perfect-prompt:output-mode';
const modes:{id:OutputMode;label:string;description:string}[]=[
 {id:'quick',label:'Quick',description:'Fast core build'},
 {id:'premium',label:'Premium',description:'Polished UI + UX'},
 {id:'developer',label:'Developer',description:'Production behavior'},
 {id:'launch',label:'Launch',description:'Brand + release finish'}
];

function readMode():OutputMode{
 const value=localStorage.getItem(STORAGE_KEY) as OutputMode|null;
 return modes.some(mode=>mode.id===value)?value!:'premium';
}

function setMode(mode:OutputMode){
 localStorage.setItem(STORAGE_KEY,mode);
 document.querySelectorAll<HTMLButtonElement>('[data-output-mode]').forEach(button=>{
  const selected=button.dataset.outputMode===mode;
  button.classList.toggle('selected',selected);
  button.setAttribute('aria-checked',String(selected));
 });
}

function ensureControls(){
 const shell=document.querySelector('.app-shell');
 const visualPicker=document.querySelector('.visual-picker');
 if(!shell||!visualPicker||document.querySelector('.pp-output-mode'))return;

 const section=document.createElement('section');
 section.className='pp-output-mode selector-stack-item';
 section.innerHTML=`
  <div class="pp-output-heading">
   <span>Output level</span>
   <small>Premium is the recommended default</small>
  </div>
  <div class="pp-output-grid" role="radiogroup" aria-label="Prompt output level">
   ${modes.map(mode=>`<button type="button" data-output-mode="${mode.id}" role="radio"><strong>${mode.label}</strong><small>${mode.description}</small></button>`).join('')}
  </div>
  <div class="pp-generation-progress" aria-live="polite" hidden>
   <div class="pp-progress-copy"><span class="pp-progress-dot"></span><strong>Gemini is building your prompt…</strong></div>
   <div class="pp-progress-track" aria-hidden="true"><span></span></div>
  </div>`;
 visualPicker.parentElement?.insertBefore(section,visualPicker);
 section.querySelectorAll<HTMLButtonElement>('[data-output-mode]').forEach(button=>{
  button.addEventListener('click',()=>setMode(button.dataset.outputMode as OutputMode));
 });
 setMode(readMode());
}

function setGenerating(active:boolean){
 ensureControls();
 const progress=document.querySelector<HTMLElement>('.pp-generation-progress');
 if(progress)progress.hidden=!active;
 document.documentElement.classList.toggle('pp-is-generating',active);
}

const nativeFetch=window.fetch.bind(window);
window.fetch=async(input:RequestInfo|URL,init?:RequestInit)=>{
 const url=typeof input==='string'?input:input instanceof URL?input.toString():input.url;
 const isGeneration=url.includes('/api/generate')&&String(init?.method||'GET').toUpperCase()==='POST';
 let nextInit=init;
 if(isGeneration&&typeof init?.body==='string'){
  try{
   const parsed=JSON.parse(init.body);
   nextInit={...init,body:JSON.stringify({...parsed,outputMode:readMode()})};
  }catch{}
 }
 if(!isGeneration)return nativeFetch(input,nextInit);
 setGenerating(true);
 try{return await nativeFetch(input,nextInit)}finally{setGenerating(false)}
};

const observer=new MutationObserver(()=>ensureControls());
observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('DOMContentLoaded',ensureControls);
