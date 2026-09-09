import {getCreationFormatProfile,type CreationFormat} from './creation-format';
import {getVisualStyleProfile,type VisualStyle} from './visual-style';

export type MinimalEngineOptions={
 buildType?:string;
 creationFormat?:string;
 visualStyle?:string;
};

const clean=(value:string)=>value.trim();

const buildLabels:Record<string,string>={
 'app-web-app':'App / Web App',
 website:'Website',
 game:'Game',
 video:'Video',
 image:'Image',
 general:'General Prompt'
};

const buildRoles:Record<string,string>={
 'app-web-app':'You are a Senior Product Designer and Full-Stack Application Engineer.',
 website:'You are a Web Designer and Frontend / Web Experience Engineer.',
 game:'You are a Game Designer and Gameplay Engineer.',
 video:'You are a Creative Director and Video Production Specialist.',
 image:'You are an Art Director and Image Prompt Specialist.',
 general:'You are a Prompt Engineer and context-appropriate domain specialist.'
};

const isHtmlBuilderType=(buildType?:string)=>['app-web-app','app','web-app','website','game'].includes((buildType||'').toLowerCase());
const isMobileAppType=(buildType?:string)=>['app-web-app','app','web-app'].includes((buildType||'').toLowerCase());

const formatLabel=(format?:string)=>{
 if(!format)return '';
 try{return getCreationFormatProfile(format as CreationFormat).label}catch{return format}
};

const visualProfile=(style?:string)=>{
 if(!style)return null;
 try{return getVisualStyleProfile(style as VisualStyle)}catch{return null}
};

export function buildMinimalPrompt(idea:string,options:MinimalEngineOptions={}):string{
 const brief=clean(idea);
 if(!brief)throw new Error('Idea is required.');
 const buildType=clean(options.buildType||'app-web-app');
 const htmlLocked=isHtmlBuilderType(buildType);
 const mobileLocked=isMobileAppType(buildType);
 const selectedFormat=formatLabel(options.creationFormat);
 const selectedVisual=visualProfile(options.visualStyle);
 const role=buildRoles[buildType]||buildRoles['app-web-app'];
 const format=htmlLocked
  ?mobileLocked
   ?`Build one complete self-contained index.html with inline CSS and JavaScript. No React, no framework, no build step, and no extra files. The result must open and run directly in a modern browser. Target a strict mobile-first phone portrait layout approximately 360–430 px wide. No desktop dashboard layout, sidebar, wide-screen composition, multi-column desktop grid, or horizontal overflow.`
   :`Build one complete self-contained index.html with inline CSS and JavaScript. No React, no framework, no build step, and no extra files. The result must open and run directly in a modern browser. Use the Product Brief and experience target to determine the appropriate responsive layout without changing the HTML stack.`
  :`Preserve the user's requested creation medium exactly. Do not substitute another stack or platform unless the Product Brief explicitly asks for it.`;
 const deliverable=htmlLocked?'Return one complete working index.html and nothing else.':'Return one complete, copy-ready builder prompt and nothing else.';
 const context=[`Project type: ${buildLabels[buildType]||buildType}`];
 if(selectedFormat)context.push(`Experience target: ${selectedFormat}. This is interaction and presentation guidance only; it does not override the Creation Format above.`);
 if(selectedVisual)context.push(`Visual style: ${selectedVisual.label}.`);
 const visual=selectedVisual?`\n${selectedVisual.role}\nUse ${selectedVisual.label} as presentation guidance only. It may shape hierarchy, spacing, typography, motion, and finish, but it must never change the Product Brief, workflow, behavior, or Creation Format.`:'';

 return `Role\n${role}${visual}\n\nBuild Context\n${context.join('\n')}\n\nCreation Format\n${format}\n\nProduct Brief\n${brief}\n\nExecution Rules\n- Treat the Product Brief as the source of truth.\n- Preserve every stated purpose, workflow step, feature, condition, timing rule, validation rule, persistence rule, exclusion, and relationship.\n- Preserve explicitly stated workflow order.\n- Do not summarize away product logic or turn requirements into fragments.\n- Do not add unrelated screens, features, accounts, dashboards, analytics, backends, or complexity.\n- Organize the implementation clearly, but do not reinterpret the user's intent.\n- Make all visible controls and navigation functional.\n- Persist state when the Product Brief requires it.\n- Make the first rendered screen and the full experience look finished and product-specific rather than generic or template-like.\n- Before completion, test the full stated workflow and correct broken navigation, state, validation, calculations, or persistence.\n\nDeliverable\n${deliverable}`;
}
