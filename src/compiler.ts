import * as legacy from './compiler-legacy';
import type { BuildType } from './intent';
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
    if (/^Target\b/i.test(unit) || /^Keep\s+it\s+strictly\b/i.test(unit)) found.push(clean(unit));
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

const sanitizeRole = (role: string) => role.replace(/([.!?]\s+)You are\s+/g, '$1Also act as ');
const missionFor = (base: Prompt, lock: IdeaLock, buildType?: BuildType) => {
  if (buildType === 'app-web-app') return `Build ${lock.appName} for ${lock.targetUser}. Primary job: ${clean(lock.primaryJob)}.`;
  return base.mission;
};

export function parseIdea(raw: string): IdeaLock {
  const text = InputSchema.parse({ idea: raw }).idea;
  const base = legacy.parseIdea(text);
  const screens = cleanStructures(text, base.screens);
  const continuity = extractContinuityRules(text);
  let baseRequired = [...base.requiredFeatures];
  if (continuity.length) {
    baseRequired = baseRequired.filter(item => !/pickup trailer|drop trailer|continues through the route/i.test(item));
  }
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
    role: sanitizeRole(base.role),
    mission: missionFor(base, lock, options.buildType),
    lock,
    targetUser: lock.targetUser,
    workflow: lock.workflow,
    screens: [...lock.screens],
    features: [...lock.requiredFeatures],
    states: [...lock.stateRules, ...lock.persistenceRules],
    constraints: [...lock.constraints],
    doNotAdd: [...lock.explicitExclusions],
  };
}

const replaceSection = (output: string, name: string, next: string, body: string) => {
  const start = `\n\n${name}\n\n`;
  const end = `\n\n${next}\n\n`;
  const before = output.split(start)[0];
  const rest = output.split(start)[1];
  if (rest === undefined) return output;
  const after = rest.split(end)[1];
  if (after === undefined) return output;
  return `${before}${start}${body}${end}${after}`;
};

export function assemble(prompt: Prompt) {
  let output = legacy.assemble(prompt);
  if (prompt.states.length) {
    output = replaceSection(output, 'Interaction & State Rules', 'Visual Direction', unique(prompt.states.map(sentenceLine).filter(Boolean)).join('\n'));
  }
  return output;
}

export function validateContradictions(prompt: Prompt, output: string) {
  return legacy.validateContradictions(prompt, output);
}

export function validate(prompt: Prompt, output: string) {
  return legacy.validate(prompt, output);
}

export const generate = (raw: string, options: GenerateOptions = {}) => {
  const prompt = compile(raw, options);
  const output = assemble(prompt);
  validate(prompt, output);
  return output;
};

export type { BuildType, CreationFormat, VisualStyle };
