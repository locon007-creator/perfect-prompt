import React,{useMemo,useState}from'react';
import{createRoot}from'react-dom/client';
import{generate}from'./compiler';
import{requestAIGeneration}from'./ai-generator';
import{buildTypeOptions,type BuildType}from'./intent';
import{creationFormatOptions,type CreationFormat}from'./creation-format';
import{getStarterCategory,starterCategories,type StarterCategoryId}from'./starter-library';
import{visualStyleOptions,type VisualStyle}from'./visual-style';
import{IDEA_CHARACTER_LIMIT}from'./generator-limits';
import'./styles.css';

type Screen='generator'|'category-index'|'category'|'saved'|'basics'|'settings';
type IconName='menu'|'pencil'|'paste'|'trash'|'sparkle'|'copy'|'save'|'bulb'|'phone'|'tool'|'chart'|'finance'|'truck'|'chevron'|'back'|'layers'|'book'|'settings';

function Icon({name}:{name:IconName}){
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
  chevron:<><path d="M9 5l7 7-7 7"/></>,
  back:<><path d="M15 18l-6-6 6-6"/></>,
  layers:<><path d="M12 2 3 7l9 5 9-5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/></>,
  book:<><path d="M4 4h6a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4V4zM20 4h-6a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h6V4z"/></>,
  settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1z"/></>
 };
 return <svg {...common}>{paths[name]}</svg>;
}

const categoryIcons:Record<StarterCategoryId,IconName>={app:'phone',utility:'tool',productivity:'chart',finance:'finance',trucking:'truck'};
const savedKey='perfect-prompt:saved';
const legacySavedKey='perfect-prompt:last';
const readSaved=():string[]=>{try{const parsed=JSON.parse(localStorage.getItem(savedKey)||'[]');const current=Array.isArray(parsed)?parsed.filter(x=>typeof x==='string'):[];const legacy=localStorage.getItem(legacySavedKey);return legacy&&!current.includes(legacy)?[legacy,...current]:current}catch{return[]}};

function App(){
 const[idea,setIdea]=useState('');
 const[prompt,setPrompt]=useState('');
 const[error,setError]=useState('');
 const[saved,setSaved]=useState<string[]>(()=>readSaved());
 const[menuOpen,setMenuOpen]=useState(false);
 const[screen,setScreen]=useState<Screen>('generator');
 const[buildType,setBuildType]=useState<BuildType|null>(null);
 const[creationFormat,setCreationFormat]=useState<CreationFormat|null>(null);
 const[visualStyle,setVisualStyle]=useState<VisualStyle|null>(null);
 const[buildPickerOpen,setBuildPickerOpen]=useState(false);
 const[formatPickerOpen,setFormatPickerOpen]=useState(false);
 const[visualPickerOpen,setVisualPickerOpen]=useState(false);
 const[activeCategory,setActiveCategory]=useState<StarterCategoryId>('app');
 const[expandedStarter,setExpandedStarter]=useState<string|null>(null);
 const[confirmClear,setConfirmClear]=useState(false);
 const profile=useMemo(()=>buildType?buildTypeOptions.find(x=>x.buildType===buildType):null,[buildType]);
 const formatProfile=useMemo(()=>creationFormat?creationFormatOptions.find(x=>x.creationFormat===creationFormat):null,[creationFormat]);
 const visualProfile=useMemo(()=>visualStyle?visualStyleOptions.find(x=>x.visualStyle===visualStyle):null,[visualStyle]);
 const category=getStarterCategory(activeCategory);

 function navigate(next:Screen){setScreen(next);setMenuOpen(false);setBuildPickerOpen(false);setFormatPickerOpen(false);setVisualPickerOpen(false);setConfirmClear(false)}
 function go(){if(!buildType||!creationFormat||!visualStyle){setError('Choose what to build, the format, and the visual style first.');return}try{const compiled=generate(idea,{buildType,creationFormat,visualStyle});setPrompt(compiled);setError('');void requestAIGeneration({idea,compiledPrompt:compiled,buildType,creationFormat,visualStyle}).then(next=>{setPrompt(next);setError('')}).catch(()=>{})}catch(e){setError(e instanceof Error?e.message:'Please add more detail.')}}
 async function paste(){try{const text=await navigator.clipboard.readText();setIdea(text.slice(0,IDEA_CHARACTER_LIMIT));setError('')}catch{setError('Clipboard access was blocked. Tap and hold in the idea box to paste.')}}
 function clearIdea(){setIdea('');setError('')}
 function clearPrompt(){setPrompt('')}
 async function copyPrompt(){if(prompt)await navigator.clipboard.writeText(prompt)}
 function savePrompt(){if(!prompt)return;const next=[prompt,...saved.filter(x=>x!==prompt)];setSaved(next);localStorage.setItem(savedKey,JSON.stringify(next))}
 function removeSaved(index:number){const next=saved.filter((_,i)=>i!==index);setSaved(next);localStorage.setItem(savedKey,JSON.stringify(next))}
 function clearSaved(){setSaved([]);localStorage.removeItem(savedKey);localStorage.removeItem(legacySavedKey);setConfirmClear(false)}
 function openCategory(id:StarterCategoryId){setActiveCategory(id);setExpandedStarter(null);setScreen('category');setMenuOpen(false)}

 const header=<header className="topbar">
  <div className="brand-block"><h1>Perfect <span>Prompt</span></h1><p>Turn your ideas into powerful prompts.</p></div>
  <button className="icon-button menu-button" onClick={()=>setMenuOpen(v=>!v)} aria-label="Open menu"><Icon name="menu"/></button>
  {menuOpen&&<div className="menu-popover">
   <button onClick={()=>navigate('generator')}>Generator</button>
   <button onClick={()=>navigate('category-index')}>Prompt Categories</button>
   <button onClick={()=>navigate('saved')}>Saved Prompts</button>
   <button onClick={()=>navigate('basics')}>Prompt Basics</button>
   <button onClick={()=>navigate('settings')}>Settings</button>
  </div>}
 </header>;

 if(screen!=='generator')return <main className="app-shell">{header}<div className="screen-toolbar"><button className="back-button" onClick={()=>navigate('generator')}><Icon name="back"/>Generator</button></div>{screen==='category-index'&&<section className="page-card"><div className="page-heading"><Icon name="layers"/><div><h2>Prompt Categories</h2><p>Choose a practical starter category.</p></div></div><div className="category-list">{starterCategories.map(item=><button key={item.id} onClick={()=>openCategory(item.id)}><span className="list-icon"><Icon name={categoryIcons[item.id]}/></span><span><strong>{item.label}</strong><small>{item.description}</small></span><Icon name="chevron"/></button>)}</div></section>}{screen==='category'&&<section className="page-card"><div className="page-heading"><Icon name={categoryIcons[category.id]}/><div><h2>{category.label}</h2><p>{category.description}</p></div></div><div className="starter-list">{category.starters.map(starter=>{const open=expandedStarter===starter.id;return <article className={open?'starter-card open':'starter-card'} key={starter.id}><button className="starter-toggle" onClick={()=>setExpandedStarter(current=>current===starter.id?null:starter.id)}><span>{starter.title}</span><span className={open?'rotate':''}>⌄</span></button>{open&&<div className="starter-body"><p>{starter.brief}</p><button className="send-button" onClick={()=>{setIdea(starter.brief);setScreen('generator');setExpandedStarter(null);setError('')}}>Send to Generator <Icon name="chevron"/></button></div>}</article>})}</div></section>}{screen==='saved'&&<section className="page-card"><div className="page-heading"><Icon name="save"/><div><h2>Saved Prompts</h2><p>Your intentionally saved prompts stay on this device.</p></div></div>{saved.length?<div className="saved-list">{saved.map((item,index)=><article className="saved-card" key={`${item.slice(0,20)}-${index}`}><pre>{item}</pre><div><button onClick={()=>navigator.clipboard.writeText(item)}><Icon name="copy"/>Copy</button><button onClick={()=>removeSaved(index)}><Icon name="trash"/>Delete</button></div></article>)}</div>:<div className="simple-empty"><Icon name="save"/><strong>No saved prompts yet.</strong><p>Generate a prompt, then tap Save.</p></div>}</section>}{screen==='basics'&&<section className="page-card"><div className="page-heading"><Icon name="book"/><div><h2>Prompt Basics</h2><p>Give Perfect Prompt the information that matters.</p></div></div><div className="basics-list"><article><strong>1. Choose what you want to build</strong><p>This selects the technical specialist used by the compiler.</p></article><article><strong>2. Choose the format</strong><p>This tells the compiler whether you intend Android, iOS, responsive web, desktop, dashboard, mobile utility, multi-screen, a single-purpose tool, a website, or want the idea to decide.</p></article><article><strong>3. Choose how it should look</strong><p>This selects the design specialist and visual language without changing your product requirements.</p></article><article><strong>4. Describe the real job</strong><p>Say who it is for, what it should do, the workflow, and anything it must not add.</p></article><article><strong>5. Use a starter only when useful</strong><p>Starter ideas fill the idea box first. You stay in control and can edit before generating.</p></article><article><strong>6. Generate and review</strong><p>Your idea still passes through the deterministic Idea Lock and validation before the final prompt appears.</p></article></div></section>}{screen==='settings'&&<section className="page-card"><div className="page-heading"><Icon name="settings"/><div><h2>Settings</h2><p>Only controls that actually change local app behavior.</p></div></div><div className="settings-row"><div><strong>Clear saved prompts</strong><p>Deletes saved prompts from this browser only.</p></div>{confirmClear?<div className="confirm-actions"><button className="cancel-clear" onClick={()=>setConfirmClear(false)}>Cancel</button><button onClick={clearSaved}>Confirm</button></div>:<button onClick={()=>setConfirmClear(true)} disabled={!saved.length}>Clear</button>}</div></section>}</main>;

 return <main className="app-shell">{header}
  <section className="build-picker selector-stack-item">
   <button className="build-picker-trigger" onClick={()=>{setBuildPickerOpen(v=>!v);setFormatPickerOpen(false);setVisualPickerOpen(false)}} aria-expanded={buildPickerOpen}><span><strong>{profile?.label||'What would you like to build?'}</strong></span><span className={buildPickerOpen?'picker-arrow open':'picker-arrow'}>⌄</span></button>
   {buildPickerOpen&&<div className="build-options">{buildTypeOptions.map(option=><button key={option.buildType} className={buildType===option.buildType?'selected':''} onClick={()=>{setBuildType(option.buildType);setBuildPickerOpen(false)}}><span><strong>{option.label}</strong><small>{option.emphasis.slice(0,3).join(' · ')}</small></span>{buildType===option.buildType&&<span className="check">✓</span>}</button>)}</div>}
  </section>

  <section className="build-picker format-picker selector-stack-item">
   <button className="build-picker-trigger format-trigger" onClick={()=>{setFormatPickerOpen(v=>!v);setBuildPickerOpen(false);setVisualPickerOpen(false)}} aria-expanded={formatPickerOpen}><span><strong>{formatProfile?.label||'What format do you want?'}</strong></span><span className={formatPickerOpen?'picker-arrow open':'picker-arrow'}>⌄</span></button>
   {formatPickerOpen&&<div className="build-options format-options">{creationFormatOptions.map(option=><button key={option.creationFormat} className={creationFormat===option.creationFormat?'selected':''} onClick={()=>{setCreationFormat(option.creationFormat);setFormatPickerOpen(false)}}><span><strong>{option.label}</strong><small>{option.guidance[0]||'Use the format explicitly stated in the idea.'}</small></span>{creationFormat===option.creationFormat&&<span className="check">✓</span>}</button>)}</div>}
  </section>

  <section className="build-picker visual-picker selector-stack-item">
   <button className="build-picker-trigger visual-trigger" onClick={()=>{setVisualPickerOpen(v=>!v);setBuildPickerOpen(false);setFormatPickerOpen(false)}} aria-expanded={visualPickerOpen}><span><strong>{visualProfile?.label||'How should it look?'}</strong></span><span className={visualPickerOpen?'picker-arrow open':'picker-arrow'}>⌄</span></button>
   {visualPickerOpen&&<div className="build-options visual-options">{visualStyleOptions.map(option=><button key={option.visualStyle} className={visualStyle===option.visualStyle?'selected':''} onClick={()=>{setVisualStyle(option.visualStyle);setVisualPickerOpen(false)}}><span><strong>{option.label}</strong><small>{option.emphasis.slice(0,3).join(' · ')}</small></span>{visualStyle===option.visualStyle&&<span className="check">✓</span>}</button>)}</div>}
  </section>

  <section className="idea-panel" aria-label="Describe your idea"><div className="idea-heading"><div className="idea-title"><span className="idea-icon"><Icon name="pencil"/></span><strong>Describe your idea</strong></div><div className="idea-tools"><button onClick={paste}><Icon name="paste"/>Paste</button><button onClick={clearIdea}><Icon name="trash"/>Clear</button></div></div><textarea value={idea} maxLength={IDEA_CHARACTER_LIMIT} onChange={e=>setIdea(e.target.value)} placeholder="Type or paste your idea here..." aria-label="Idea"/>{!idea&&<p className="example">Example: A budgeting app for personal use<br/>with a clean mobile design, offline support,<br/>and spending insights...</p>}<span className="counter">{idea.length}/{IDEA_CHARACTER_LIMIT}</span></section>
  {error&&<div className="error" role="alert">{error}</div>}

  <section className="category-section"><div className="category-label"><strong>Need a starting point? <span>Choose a category</span></strong><button onClick={()=>navigate('category-index')}>See all <span>→</span></button></div><div className="category-row">{starterCategories.map(item=><button key={item.id} className="category" onClick={()=>openCategory(item.id)}><Icon name={categoryIcons[item.id]}/>{item.label}</button>)}</div></section>

  <button className="generate" onClick={go} disabled={!idea.trim()||!buildType||!creationFormat||!visualStyle}><span className="generate-label"><Icon name="sparkle"/>Generate Prompt</span><span className="generate-arrow"><Icon name="chevron"/></span></button>
  <section className={prompt?'output-panel has-output':'output-panel'} aria-live="polite">{prompt?<pre>{prompt}</pre>:<div className="empty-state"><div className="bulb"><Icon name="bulb"/></div><h2>Your generated prompt<br/>will appear here after you generate.</h2><p>Choose what to build, its format, and how it should look,<br/>then Perfect Prompt routes the right specialists.</p></div>}</section>
  <div className="output-actions"><button className="copy-action" onClick={copyPrompt} disabled={!prompt}><Icon name="copy"/>Copy Prompt</button><button className="save-action" onClick={savePrompt} disabled={!prompt}><Icon name="save"/>Save</button><button className="clear-action" onClick={clearPrompt} disabled={!prompt}><Icon name="trash"/>Clear</button></div>
 </main>
}

createRoot(document.getElementById('root')!).render(<App/>);