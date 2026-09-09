export type MinimalEngineOptions={
 buildType?:string;
 creationFormat?:string;
 visualStyle?:string;
};

const clean=(value:string)=>value.trim();

const isHtmlBuilderType=(buildType?:string)=>{
 const value=(buildType||'').toLowerCase();
 return !value||value==='app-web-app'||value==='app'||value==='website'||value==='web-app'||value==='game';
};

const visualDirection=(style?:string)=>{
 const value=clean(style||'');
 if(!value)return '';
 return `\n\nVisual Direction\nUse the selected visual direction as presentation guidance only: ${value}. It may shape hierarchy, spacing, typography, motion, and finish, but it must never change the Product Brief, workflow, behavior, or Creation Format.`;
};

export function buildMinimalPrompt(idea:string,options:MinimalEngineOptions={}):string{
 const brief=clean(idea);
 if(!brief)throw new Error('Idea is required.');
 const htmlLocked=isHtmlBuilderType(options.buildType);
 const format=htmlLocked
  ?`Build one complete self-contained index.html with inline CSS and JavaScript. No React, no framework, no build step, and no extra files. The result must open and run directly in a modern browser. Target a strict mobile-first phone portrait layout approximately 360–430 px wide. No desktop dashboard layout, sidebar, wide-screen composition, multi-column desktop grid, or horizontal overflow.`
  :`Preserve the user's requested creation medium exactly. Do not substitute another stack or platform unless the Product Brief explicitly asks for it.`;
 const deliverable=htmlLocked?'Return one complete working index.html and nothing else.':'Return one complete, copy-ready builder prompt and nothing else.';

 return `Role\nYou are a Senior Product Designer and Full-Stack Application Engineer. Build polished, production-minded experiences with clear product logic, functional interactions, reliable state, and premium visual quality.\n\nCreation Format\n${format}\n\nProduct Brief\n${brief}\n\nExecution Rules\n- Treat the Product Brief as the source of truth.\n- Preserve every stated purpose, workflow step, feature, condition, timing rule, validation rule, persistence rule, exclusion, and relationship.\n- Preserve explicitly stated workflow order.\n- Do not summarize away product logic or turn requirements into fragments.\n- Do not add unrelated screens, features, accounts, dashboards, analytics, backends, or complexity.\n- Organize the implementation clearly, but do not reinterpret the user's intent.\n- Make all visible controls and navigation functional.\n- Persist state when the Product Brief requires it.\n- Make the first rendered screen and the full experience look finished and product-specific rather than generic or template-like.\n- Before completion, test the full stated workflow and correct broken navigation, state, validation, calculations, or persistence.${visualDirection(options.visualStyle)}\n\nDeliverable\n${deliverable}`;
}
