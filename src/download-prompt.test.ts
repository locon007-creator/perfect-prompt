// @vitest-environment jsdom
import{beforeEach,describe,expect,it,vi}from'vitest';

function mountGeneratedPrompt(){
 document.body.innerHTML=`
  <section>
   <textarea>Build a premium mobile app</textarea>
   <pre>ROLE\nBuild the finished prompt output.</pre>
   <div class="actions">
    <button>Copy Prompt</button>
    <button disabled>Save</button>
    <button>Clear</button>
   </div>
  </section>`;
}

describe('TXT download action',()=>{
 beforeEach(()=>{
  vi.resetModules();
  document.body.innerHTML='';
  Object.defineProperty(URL,'createObjectURL',{value:vi.fn(()=> 'blob:test'),configurable:true});
  Object.defineProperty(URL,'revokeObjectURL',{value:vi.fn(),configurable:true});
  vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{});
 });

 it('replaces Save, enables Download after output exists, and downloads the generated prompt',async()=>{
  mountGeneratedPrompt();
  await import('./download-prompt');
  await new Promise(resolve=>setTimeout(resolve,0));

  const download=Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='Download .txt') as HTMLButtonElement;
  expect(download).toBeTruthy();
  expect(download.disabled).toBe(false);

  download.click();
  expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1);
 });
});
