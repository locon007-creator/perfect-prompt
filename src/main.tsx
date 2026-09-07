import React,{useEffect,useState}from'react';
import{createRoot}from'react-dom/client';
import{generate}from'./compiler';
import'./styles.css';

type IconName='menu'|'pencil'|'paste'|'trash'|'sparkle'|'copy'|'save'|'bulb'|'phone'|'tool'|'chart'|'finance'|'truck'|'chevron';

function Icon({name}: {name:IconName}){
 const common={width:22,height:22,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.9,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true};
 const paths:Record<IconName,React.ReactNode>={
  menu:<><path d="M4 6h16M4 12h16M4 18h16"/></>,
  pencil:<><path d="M4 20l4.2-1 10.7-10.7a2.1 2.1 0 0 0-3-3L5.2 16 4 20z"/><path d="M14.7 6.5l3 3"/></>,
  paste:<><path d="M9 5h6M9 3h6v4H9z"/><path d="M7 6H5v15h14V6h-2"/></>,
  trash:<><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></>,
  sparkle:<><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z"/></>,
  copy:<><rect x="8" y="8" width="11" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2"/></>,
  save:<><path d="M6 3h12v18l-6-4-6 4V3z"/></>,
  bulb:<><path d="M9 18h6M10 22h4"/><path d="M8.5 14.5A6 6 0 1 1 15.5 14.5c-.9.8-1.5 1.7-1.5 3h-4c0-1.3-.6-2.2-1.5-3z"/><path d="M12 2V.8M4.9 4.9 4 4M19.1 4.9 20 4M3 12H1.7M22.3 12H21"/></>,
  phone:<><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M10 18h4"/></>,
  tool:<><path d="M14.7 6.3a4 4 0 0 0-5 5L4 17l3 3 5.7-5.7a4 4 0 0 0 5-5l-2.2 2.2-3-3 2.2-2.2z"/></>,
  chart:<><path d="M5 20V10M12 20V4M19 20v-7"/></>,
  finance:<><path d="M4 7c0-2 3.6-3 8-3s8 1 8 3-3.6 3-8 3-8-1-8-3z"/><path d="M4 7v5c0 2 3.6 3 8 3s8-1 8-3V7M4 12v5c0 2 3.6 3 8 3s8-1 8-3v-5"/></>,
  truck:<><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></>,
  chevron:<><path d="M9 5l7 7-7 7"/></>
 };
 return <svg {...common}>{paths[name]}</svg>;
}

const categories=[
 {name:'App',icon:'phone' as IconName},
 {name:'Utility',icon:'tool' as IconName},
 {name:'Productivity',icon:'chart' as IconName},
 {name:'Finance',icon:'finance' as IconName},
 {name:'Trucking',icon:'truck' as IconName}
];

function App(){
 const[idea,setIdea]=useState('');
 const[prompt,setPrompt]=useState('');
 const[error,setError]=useState('');
 const[selected,setSelected]=useState('App');
 const[saved,setSaved]=useState(false);
 const[menuOpen,setMenuOpen]=useState(false);

 useEffect(()=>{const last=localStorage.getItem('perfect-prompt:last');if(last)setPrompt(last)},[]);

 function go(){try{const next=generate(idea);setPrompt(next);setError('');setSaved(false)}catch(e){setError(e instanceof Error?e.message:'Please add more detail.')}}
 async function paste(){try{const text=await navigator.clipboard.readText();setIdea(text);setError('')}catch{setError('Clipboard access was blocked. Tap and hold in the idea box to paste.')}}
 function clearIdea(){setIdea('');setError('')}
 function clearPrompt(){setPrompt('');setSaved(false);localStorage.removeItem('perfect-prompt:last')}
 async function copyPrompt(){if(prompt)await navigator.clipboard.writeText(prompt)}
 function savePrompt(){if(!prompt)return;localStorage.setItem('perfect-prompt:last',prompt);setSaved(true)}

 return <main className="app-shell">
  <header className="topbar">
   <div className="brand-block"><h1>Perfect <span>Prompt</span></h1><p>Turn your ideas into powerful prompts.</p></div>
   <button className="icon-button menu-button" onClick={()=>setMenuOpen(v=>!v)} aria-label="Open menu"><Icon name="menu"/></button>
   {menuOpen&&<div className="menu-popover"><button onClick={()=>{setSelected('App');setMenuOpen(false)}}>Generator</button><button onClick={()=>setMenuOpen(false)}>Saved Prompt</button></div>}
  </header>

  <section className="idea-panel" aria-label="Describe your app idea">
   <div className="idea-heading">
    <div className="idea-title"><span className="idea-icon"><Icon name="pencil"/></span><strong>Describe your app idea</strong></div>
    <div className="idea-tools"><button onClick={paste}><Icon name="paste"/>Paste</button><button onClick={clearIdea}><Icon name="trash"/>Clear</button></div>
   </div>
   <textarea value={idea} maxLength={2000} onChange={e=>setIdea(e.target.value)} placeholder="Type or paste your idea here..." aria-label="App idea"/>
   {!idea&&<p className="example">Example: A budgeting app for personal use<br/>with a clean mobile design, offline support,<br/>and spending insights...</p>}
   <span className="counter">{idea.length}/2000</span>
  </section>
  {error&&<div className="error" role="alert">{error}</div>}

  <section className="category-section">
   <div className="category-label"><strong>Choose a category <span>(swipe to explore)</span></strong><button onClick={()=>document.querySelector('.category-row')?.scrollTo({left:999,behavior:'smooth'})}>See all <span>→</span></button></div>
   <div className="category-row">
    {categories.map(category=><button key={category.name} className={selected===category.name?'category active':'category'} onClick={()=>setSelected(category.name)}><Icon name={category.icon}/>{category.name}</button>)}
   </div>
  </section>

  <button className="generate" onClick={go} disabled={!idea.trim()}><span className="generate-label"><Icon name="sparkle"/>Generate Prompt</span><span className="generate-arrow"><Icon name="chevron"/></span></button>

  <section className={prompt?'output-panel has-output':'output-panel'} aria-live="polite">
   {prompt?<pre>{prompt}</pre>:<div className="empty-state"><div className="bulb"><Icon name="bulb"/></div><h2>Your generated prompt<br/>will appear here after you generate.</h2><p>Turn your ideas into detailed, ready-to-use prompts<br/>for amazing apps.</p></div>}
  </section>

  <div className="output-actions">
   <button className="copy-action" onClick={copyPrompt} disabled={!prompt}><Icon name="copy"/>Copy Prompt</button>
   <button className={saved?'save-action saved':'save-action'} onClick={savePrompt} disabled={!prompt}><Icon name="save"/>{saved?'Saved':'Save'}</button>
   <button className="clear-action" onClick={clearPrompt} disabled={!prompt}><Icon name="trash"/>Clear</button>
  </div>

  <footer>Better ideas. Better apps. Perfect Prompts.</footer>
 </main>
}

createRoot(document.getElementById('root')!).render(<App/>);
