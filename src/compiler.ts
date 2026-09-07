import * as legacy from './compiler-legacy';
import { getSpecialistProfile, type BuildType } from './intent';
import type { CreationFormat } from './creation-format';
import type { VisualStyle } from './visual-style';

export const InputSchema = legacy.InputSchema;
export type Input = import('./compiler-legacy').Input;
export type GenerateOptions = import('./compiler-legacy').GenerateOptions;
export type IdeaLock = import('./compiler-legacy').IdeaLock;
export type Prompt = import('./compiler-legacy').Prompt;

const clean = (value: string) => value.replace(/[.!?]+$/, '').trim();
const unique = (items: string[]) => items.filter((item, index) => items.findIndex(other => other.toLowerCase() === item.toLowerCase()) === index);
const sentenceLine = (value: string) => {
  const line = clean(value);
  return line ? `${line[0].toUpperCase()}${line.slice(1)}.` : '';
};
const freeze = <T>(value: T): Readonly<T> => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as object)) freeze(child);
  }
  return value as Readonly<T>;
};
const sentenceUnits = (text: string) => unique([
  ...text.split(/\r?\n/).map(clean).filter(Boolean),
  ...(text.match(/(?:[^.!?]|\.(?=\d))+(?:[.!?]|$)/g) || []).map(clean).filter(Boolean),
]);
const splitHumanList = (value: string) => value
  .replace(/\s+\bor\b\s+/gi, ',')
  .split(/,|;|\r?\n|\s+\band\b\s+/gi)
  .map(clean)
  .filter(Boolean);
const stripNegativeLead = (value: string) => value
  .replace(/^(?:do not|don't)\s+(?:add|include|use|create|show|enable|allow)?\s*/i, '')
  .replace(/^without\s+/i, '')
  .replace(/^no\s+/i, '')
  .replace(/^(?:a|an|the)\s+/i, '')
  .trim();
const stripInlineNegative = (value: string) => clean(value.replace(/\s*(?:[.;]\s*)?(?:(?:but\s+)?without|with\s+no|but\s+no|do not|don't|no)\s+.+$/i, ''));

const extractExclusions = (text: string) => {
  const found: string[] = [];
  const patterns = [/\bwithout\s+([^.;]+)/gi, /\b(?:do not|don't)\s+([^.;]+)/gi, /\bno\s+([^.;]+)/gi];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const body = (match[1] || '').replace(/^(?:add|include|use|create|show|enable|allow)\s+/i, '');
      found.push(...splitHumanList(body).map(stripNegativeLead));
    }
  }
  return unique(found.filter(Boolean));
};

const explicitStructureHeading = (text: string) => /(?:^|\n)\s*(?:screens|pages|views)\s*:/i.test(text);
const workflowAction = /^(?:punch\s+(?:in|out)|start\s+my\s+day|start\s+route|day\s+complete|finish\s+day|start\s+(?:work|shift)|end\s+(?:work|shift)|save|submit|continue|cancel|finish|complete|confirm)$/i;
const behaviorLikeStructure = /\b(?:opens?|shows?|allows?|pressing|tapping|tap|clicking|use|provide)\b/i;
const cleanStructures = (text: string, screens: readonly string[]) => {
  if (explicitStructureHeading(text)) return [...screens];
  return unique([...screens].filter(screen => !workflowAction.test(clean(screen)) && !behaviorLikeStructure.test(screen)));
};

const requirementLead = /^(?:when\b|during\b|pressing\b|show\b|allow\b|use\b|provide\b|(?:also\s+)?include\b|[A-Z][A-Za-z0-9 &/+-]{0,48}\s+should\b)/i;
const extractNaturalRequirements = (text: string) => sentenceUnits(text)
  .filter(unit => requirementLead.test(unit))
  .filter(unit => !/^(?:no\b|do not\b|don't\b|without\b)/i.test(unit));

const extractDeclaredFields = (text: string, kind: 'required' | 'optional') => {
  const fields: string[] = [];
  for (const unit of sentenceUnits(text)) {
    for (const part of unit.split(/,|\s+\band\b\s+/i).map(clean).filter(Boolean)) {
      const match = new RegExp(`^(.+?)\\s+${kind}$`, 'i').exec(part);
      if (match?.[1]) fields.push(clean(match[1]));
    }
  }
  return unique(fields);
};

const extractContainedFields = (text: string) => {
  const match = /(?:must\s+contain|contains?)\s+(?:only\s+)?(?:these\s+)?(?:\w+\s+)?fields?\s*:\s*((?:\r?\n\s*[-*]\s*[^\r\n]+)+)/i.exec(text);
  if (!match?.[1]) return [];
  const fields = match[1].split(/\r?\n/)
    .map(line => clean(line.replace(/^\s*[-*]\s*/, '')))
    .filter(Boolean);
  return fields.length ? [`Use only these fields: ${fields.join(', ')}`] : [];
};

const extractContinuityRules = (text: string) => {
  const found: string[] = [];
  for (const match of text.matchAll(/\b[^:\n]{0,48}continuity\s+is\s+required\s*:\s*([^.!?]+(?:[.!?]|$))/gi)) {
    if (match[1]) found.push(clean(match[1]));
  }
  return unique(found);
};

const extractPersistence = (text: string) => unique(sentenceUnits(text)
  .filter(unit => /^(?:save|store|persist)\b/i.test(unit) || /^use\b.*\bstorage\b/i.test(unit))
  .map(clean));

const extractPersistentState = (text: string) => unique(
  [...text.matchAll(/\bpersistent\s+[^,.;]*?\bstate\b/gi)]
    .map(match => clean(match[0]))
    .filter(Boolean)
    .map(value => `Maintain ${value}`)
);

const extractExtraStates = (text: string) => unique([
  ...sentenceUnits(text).filter(unit => /^(?:navigation\b.*\bopen externally|navigation can open externally)$/i.test(unit)).map(clean),
  ...extractPersistentState(text),
]);

const extractMobileConstraints = (text: string) => {
  const found: string[] = [];
  for (const unit of sentenceUnits(text)) {
    if (/^Target\b/i.test(unit) || /^Keep\s+it\s+strictly\b/i.test(unit)) {
      const safe = stripInlineNegative(unit);
      if (safe) found.push(safe);
    }
    const match = /\b(?:optimized|designed)\s+for\s+(\d+\s*[–-]\s*\d+\s*px[^,.;]*?(?:large|thumb|touch)[^,.;]*?targets?)/i.exec(unit);
    if (match?.[1]) found.push(`Keep the interface optimized for ${clean(match[1])}`);
  }
  return unique(found);
};

const titleFromFirstLine = (text: string, fallback: string) => {
  const first = clean(text.split(/\r?\n/)[0] || '');
  if (!first || first.length > 64 || /^(?:build|create|make|design|role|product|primary|main)\b/i.test(first)) return fallback;
  return first;
};
const compactPrimaryJob = (value: string, appName: string) => {
  let job = clean(value.split(/\b(?:Workflow|Screens?|Pages?|Views?|Required features?|Optional features?|Rules?)\s*:/i)[0] || value);
  job = job.replace(/^(?:build|create|make|design)\s+/i, '').trim();
  const escaped = appName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  job = job.replace(new RegExp(`^${escaped}\\s+(?:for|to)\\s+`, 'i'), '').trim();
  return job || clean(value);
};

const sanitizeRole = (role: string) => role.replace(/([.!?]\s+)You are\s+/g, '$1Also act as ');
const conciseRole = (role: string, buildType?: BuildType) => {
  const sanitized = sanitizeRole(role);
  if (buildType !== 'app-web-app') return sanitized;
  const first = sanitized.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || 'You are a senior product designer and Full-Stack Application Engineer.';
  const design = sanitized.match(/Also act as .+$/)?.[0];
  return design ? `${first} ${design}` : first;
};
const appBuildConstraints = (buildType?: BuildType) => buildType === 'app-web-app' ? [
  'Build the first version as one complete self-contained index.html with inline CSS and JavaScript; represent required screens as fully functional app views with the needed navigation, interaction, state, persistence, forms, sheets, dialogs, and timers unless another stack is explicitly locked.',
  'Keep it directly runnable and previewable without a build step, with logic organized so it can be split into multiple files later if the product grows.',
] : [];
const missionFor = (base: Prompt, lock: IdeaLock, buildType?: BuildType) => {
  if (buildType === 'app-web-app') return `Build ${lock.appName} for ${lock.targetUser}. Primary job: ${compactPrimaryJob(lock.primaryJob, lock.appName)}.`;
  return base.mission;
};

export function parseIdea(raw: string): IdeaLock {
  const text = InputSchema.parse({ idea: raw }).idea;
  const base = legacy.parseIdea(text);
  const screens = cleanStructures(text, base.screens);
  const continuity = extractContinuityRules(text);
  let baseRequired = [...base.requiredFeatures];
  if (continuity.length) baseRequired = baseRequired.filter(item => !/pickup trailer|drop trailer|continues through the route/i.test(item));
  const declaredRequired = extractDeclaredFields(text, 'required');
  const declaredOptional = extractDeclaredFields(text, 'optional');
  const requiredDeclaration = declaredRequired.length ? [`Require ${declaredRequired.join(' and ')}`] : [];
  const requiredFeatures = unique([
    ...baseRequired,
    ...extractNaturalRequirements(text),
    ...requiredDeclaration,
    ...extractContainedFields(text),
    ...continuity,
  ]).filter(feature => !/^(?:no\b|do not\b|don't\b|without\b)/i.test(feature));
  const optionalFeatures = unique([...base.optionalFeatures, ...declaredOptional]);
  const persistenceRules = extractPersistence(text);
  const stateRules = unique([...base.stateRules, ...extractExtraStates(text)]);
  const constraints = unique([...base.constraints, ...extractMobileConstraints(text)]);
  const explicitExclusions = extractExclusions(text);
  const lock = {
    ...base,
    appName: titleFromFirstLine(text, base.appName),
    screens,
    requiredFeatures,
    optionalFeatures,
    stateRules,
    persistenceRules,
    constraints,
    explicitExclusions,
  } satisfies IdeaLock;
  return freeze(lock) as IdeaLock;
}

export function compile(raw: string, options: GenerateOptions = {}): Prompt {
  const base = legacy.compile(raw, options);
  const lock = parseIdea(raw);
  return {
    ...base,
    role: conciseRole(base.role, options.buildType),
    mission: missionFor(base, lock, options.buildType),
    lock,
    targetUser: lock.targetUser,
    workflow: lock.workflow,
    screens: [...lock.screens],
    features: [...lock.requiredFeatures],
    states: [...lock.stateRules, ...lock.persistenceRules],
    constraints: unique([...lock.constraints, ...appBuildConstraints(options.buildType)]),
    doNotAdd: [...lock.explicitExclusions],
  };
}

const replaceSection = (output: string, name: string, next: string, body: string) => {
  const start = `${name}\n\n`;
  const end = `\n\n${next}\n\n`;
  const startAt = output.indexOf(start);
  if (startAt < 0) return output;
  const bodyAt = startAt + start.length;
  const endAt = output.indexOf(end, bodyAt);
  if (endAt < 0) return output;
  return `${output.slice(0, bodyAt)}${body}${output.slice(endAt)}`;
};
const replaceTailSection = (output: string, name: string, body: string) => {
  const start = `${name}\n\n`;
  const startAt = output.indexOf(start);
  if (startAt < 0) return output;
  return `${output.slice(0, startAt + start.length)}${body}`;
};
const sectionBody = (output: string, name: string, next: string) => output.split(`${name}\n\n`)[1]?.split(`\n\n${next}\n\n`)[0] || '';
const compactLock = (prompt: Prompt) => [
  `Project type: ${getSpecialistProfile(prompt.buildType || 'general').label}`,
  `Creation format: ${prompt.formatLabel}`,
  `Project name: ${prompt.lock.appName}`,
  `Primary job: ${compactPrimaryJob(prompt.lock.primaryJob, prompt.lock.appName)}`,
  `Target user: ${prompt.lock.targetUser}`,
  `Platform / medium: ${prompt.platform}`,
].join('\n');
const compactQuality = (output: string) => unique(sectionBody(output, 'Build Quality & Brand Experience', 'Constraints').split(/\r?\n/).map(line => line.trim()).filter(Boolean)).slice(0, 4).join('\n');
const completionFor = (prompt: Prompt) => prompt.lock.workflow
  ? 'Implement every locked requirement, preserve the explicitly provided workflow, and add no unrequested screens or features.'
  : 'Implement every locked requirement exactly and add no unrequested screens, features, integrations, roles, or workflows.';

export function assemble(prompt: Prompt) {
  let output = legacy.assemble(prompt);
  output = replaceSection(output, 'Idea Lock', 'Target User', compactLock(prompt));
  if (prompt.lock.optionalFeatures.length) {
    const core = sectionBody(output, 'Core Features', 'Interaction & State Rules').trim();
    const optional = prompt.lock.optionalFeatures.map(item => `Optional: ${sentenceLine(item)}`).join('\n');
    output = replaceSection(output, 'Core Features', 'Interaction & State Rules', [core, optional].filter(Boolean).join('\n'));
  }
  if (prompt.states.length) output = replaceSection(output, 'Interaction & State Rules', 'Visual Direction', unique(prompt.states.map(sentenceLine).filter(Boolean)).join('\n'));
  output = replaceSection(output, 'Build Quality & Brand Experience', 'Constraints', compactQuality(output));
  output = replaceTailSection(output, 'Completion Standard', completionFor(prompt));
  return output;
}

const validateCompactLock = (prompt: Prompt, output: string) => {
  for (const fact of compactLock(prompt).split('\n')) if (!output.toLowerCase().includes(fact.toLowerCase())) throw Error(`Locked fact missing: ${fact.split(':')[0]}`);
};
const validateWorkflow = (prompt: Prompt, output: string) => {
  if (!prompt.lock.workflow) return;
  const lower = sectionBody(output, 'Main Workflow', 'Structure Requirements').toLowerCase();
  if (!lower.includes(prompt.lock.workflow.toLowerCase())) throw Error('Workflow altered or missing');
  let from = 0;
  for (const step of prompt.lock.workflow.split(/→|->|,|;|\band\b|\bthen\b/gi).map(clean).filter(Boolean)) {
    const at = lower.indexOf(step.toLowerCase(), from);
    if (at < 0) throw Error(`Workflow step missing or reordered: ${step}`);
    from = at + step.length;
  }
};
const validateOptional = (prompt: Prompt, output: string) => {
  const core = sectionBody(output, 'Core Features', 'Interaction & State Rules');
  const requiredOnly = core.split(/\r?\n/).filter(line => !/^Optional:\s*/i.test(line)).join('\n').toLowerCase();
  for (const opt of prompt.lock.optionalFeatures) {
    const marker = `Optional: ${sentenceLine(opt)}`;
    if (!core.toLowerCase().includes(marker.toLowerCase())) throw Error(`Optional requirement missing: ${opt}`);
    if (requiredOnly.includes(opt.toLowerCase())) throw Error(`Optional feature promoted: ${opt}`);
  }
};
const validationPrompt = (prompt: Prompt): Prompt => ({
  ...prompt,
  workflow: '',
  features: [],
  lock: { ...prompt.lock, workflow: '', lockedInstructions: [], optionalFeatures: [] },
});

export function validateContradictions(prompt: Prompt, output: string) {
  validateCompactLock(prompt, output);
  validateWorkflow(prompt, output);
  validateOptional(prompt, output);
  return legacy.validateContradictions(validationPrompt(prompt), output);
}

export function validate(prompt: Prompt, output: string) {
  validateCompactLock(prompt, output);
  validateWorkflow(prompt, output);
  validateOptional(prompt, output);
  return legacy.validate(validationPrompt(prompt), output);
}

export const generate = (raw: string, options: GenerateOptions = {}) => {
  const prompt = compile(raw, options);
  const output = assemble(prompt);
  validate(prompt, output);
  return output;
};

export type { BuildType, CreationFormat, VisualStyle };
