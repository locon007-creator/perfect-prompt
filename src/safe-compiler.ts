import {getSpecialistProfile} from './intent';
import {getCreationFormatProfile} from './creation-format';
import {getVisualStyleProfile} from './visual-style';
import type {GenerateOptions} from './compiler';

export function buildSafeCompilerPrompt(raw:string,options:GenerateOptions={}):string{
 const idea=`${raw}`.trim();
 if(idea.length<10)throw new Error('Please add more detail.');

 const buildProfile=options.buildType?getSpecialistProfile(options.buildType):null;
 const formatProfile=getCreationFormatProfile(options.creationFormat||'idea-decides');
 const visualProfile=options.visualStyle?getVisualStyleProfile(options.visualStyle):null;
 const isApp=options.buildType==='app-web-app';

 const role=[
  buildProfile?.role||'You are a Senior Product Designer and Full-Stack Application Engineer.',
  visualProfile?.role||''
 ].filter(Boolean).join(' ');

 const buildContext=[
  `Project type: ${buildProfile?.label||'Unspecified'}.`,
  `Creation format: ${formatProfile.label}.`,
  visualProfile?`Visual style: ${visualProfile.label}.`:''
 ].filter(Boolean).join('\n');

 const formatRules=formatProfile.guidance.length
  ? formatProfile.guidance.map(rule=>`- ${rule}`).join('\n')
  : '- Follow the creation format selected by the user without changing the product brief.';

 const visualRules=visualProfile&&visualProfile.visualStyle!=='custom'
  ? [
     ...visualProfile.emphasis.map(item=>`- ${item}.`),
     ...visualProfile.quality.map(item=>`- ${item}`)
    ].join('\n')
  : '- Follow only visual requirements stated in the Product Brief and selected presentation context.';

 const appRules=isApp?`\nAPP FINISHED-PRODUCT RULES\n- Make the first rendered screen look like a finished premium consumer mobile product, not a prototype, wireframe, generic dashboard, or template.\n- Do not invent KPI cards, counters, route metrics, analytics, dashboards, extra navigation, or decorative status panels unless the Product Brief explicitly asks for them.\n- Preserve exact workflow order, screen behavior, state transitions, search behavior, navigation behavior, collapsible/toggleable sections, persistence, validation, timing, and conditional logic stated in the Product Brief.\n- When a rule describes a trigger or condition, keep the behavior executable: condition/trigger → action → save/persist the resulting state → update the affected UI/workflow/state.\n- Keep every screen focused on the next user action; avoid crowding the interface with secondary information.\n- If the selected creation format requires a single HTML app, preserve that technical contract exactly even when the experience target references iOS or Android presentation.`:'';

 return `${role}\n\nBUILD CONTEXT\n${buildContext}\n\nCREATION FORMAT RULES\n${formatRules}\n\nPRODUCT BRIEF — SOURCE OF TRUTH\n${idea}\n\nCOMPILER EXECUTION RULES\n- The Product Brief above is the product truth. Preserve every stated purpose, workflow step, feature, field, condition, timing rule, validation rule, persistence rule, exclusion, relationship, and interaction detail.\n- Preserve explicit workflow order. Do not summarize away product logic or convert detailed requirements into vague fragments.\n- Negative requirements are valid product rules. Phrases such as “do not,” “no,” “without losing,” “without crowding,” and “when no … is active” must be interpreted in context and must never be misclassified as contradictions.\n- Do not add unrelated screens, features, accounts, dashboards, analytics, backends, metrics, roles, or complexity.\n- Do not reinterpret the user's intent to fit a template.\n- Make all visible controls and navigation functional.\n- Persist state whenever the Product Brief requires it.\n- Keep the final prompt complete first and concise second. Never drop useful requirements to satisfy an arbitrary word count.\n- Before completion, verify the entire stated workflow against the Product Brief and repair omissions, broken navigation, state errors, persistence errors, validation errors, and interaction mismatches.${appRules}\n\nVISUAL QUALITY RULES\n${visualRules}\n\nFINAL OUTPUT RULE\nReturn one complete, copy-ready builder prompt. Preserve the selected creation format and all Product Brief requirements. Do not include compiler commentary, audit notes, scores, or explanations.`;
}
