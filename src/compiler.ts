import * as core from './compiler-core';

export const InputSchema = core.InputSchema;
export type Input = import('./compiler-core').Input;
export type GenerateOptions = import('./compiler-core').GenerateOptions;
export type IdeaLock = import('./compiler-core').IdeaLock;
export type Prompt = import('./compiler-core').Prompt;
export type { BuildType, CreationFormat, VisualStyle } from './compiler-core';

type PromptWithSettings = Prompt & { settings?: string[] };

const clean = (value: string) => value.replace(/[.!?]+$/, '').trim();
const normalized = (value: string) => clean(value)
  .replace(/^#+\s*/, '')
  .replace(/^[-*•]\s*/, '')
  .replace(/:\s*$/, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();
const unique = (items: string[]) => items.filter((item, index) =>
  items.findIndex(other => normalized(other) === normalized(item)) === index
);
const stripBullet = (value: string) => value.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim();
const stripInlineNegative = (value: string) => clean(value.replace(/\s*(?:[.;]\s*)?(?:(?:but\s+)?without|with\s+no|but\s+no|do not|don't|no)\s+.+$/i, ''));

const standaloneWorkflowHeading = /^\s*(?:(primary|main)\s+)?(workflow|flow|steps|process)\s*:?[\t ]*$/i;
const orphanInputFragment = /^\s*(?:allow|include|show|add|record|use|provide|ask)\s*:\s*[.\-]?[\t ]*$/i;
const workflowAction = /^(?:punch\s+(?:in|out)|start\s+my\s+day|start\s+route|day\s+complete|finish\s+day|start\s+(?:work|shift)|end\s+(?:work|shift)|save|submit|continue|cancel|finish|complete|confirm|delete|remove|done)$/i;
const actionableLead = /^(?:show|use|choose|allow|ask|set|save|record|display|provide|remember|support|enter|select|keep|default|open|tap|press|mark|update|calculate|track|add|edit|delete)\b/i;
const conditionalLabel = /^(?:if\b|when\b|whenever\b|only\s+when\b|otherwise\b|for\b)[^:]{0,100}:\s*$/i;
const conditionalInline = /^(?:only\s+when\b|otherwise\b)/i;
const negativeClause = /(?:^|[:;,.]\s*|\b)(?:do not|don't|never|without|with\s+no|but\s+no|no)\s+\S/i;

const normalizeBrief = (raw: string) => raw
  .split(/\r?\n/)
  .filter(line => !orphanInputFragment.test(line))
  .map(line => {
    const match = standaloneWorkflowHeading.exec(line);
    if (!match) return line;
    const label = match[2].toLowerCase();
    if (label === 'workflow') return 'MAIN WORKFLOW:';
    if (label === 'flow') return 'FLOW:';
    if (label === 'steps') return 'STEPS:';
    return 'PROCESS:';
  })
  .join('\n');

const workflowSteps = (workflow: string) => unique(workflow
  .split(/→|->|;|\bthen\b/gi)
  .flatMap(part => part.split(/\s*,\s*/))
  .map(clean)
  .filter(Boolean)
  .filter(step => !workflowAction.test(step))
);

const isHeading = (line: string, steps: readonly string[]) => {
  const raw = line.trim();
  if (!raw) return false;
  const value = raw.replace(/^#+\s*/, '').replace(/:\s*$/, '').trim();
  if (steps.some(step => normalized(step) === normalized(value))) return true;
  if (/^#{1,4}\s+\S/.test(raw)) return true;
  return value.length <= 56 && /^[A-Z0-9][A-Z0-9 &/+-]+$/.test(value) && value.split(/\s+/).length <= 8;
};

const hasStandaloneWorkflowBlock = (raw: string) => raw.split(/\r?\n/).some(line => standaloneWorkflowHeading.test(line));

const ownedInstruction = (step: string, body: string) => {
  const value = clean(body);
  if (!value) return '';
  return `${value[0].toUpperCase()}${value.slice(1)} in ${step}`;
};

const extractOwnedFeatures = (raw: string, workflow: string) => {
  if (!hasStandaloneWorkflowBlock(raw) || !workflow) return [];
  const steps = workflowSteps(workflow);
  const lines = raw.split(/\r?\n/);
  const found: string[] = [];

  for (const step of steps) {
    const start = lines.findIndex(line => normalized(line) === normalized(step));
    if (start < 0) continue;
    for (let index = start + 1; index < lines.length; index++) {
      const source = lines[index];
      if (!source.trim()) continue;
      if (isHeading(source, steps)) break;
      const value = stripBullet(source);
      if (!value || orphanInputFragment.test(value) || /^(?:no\b|do not\b|don't\b|without\b)/i.test(value)) continue;
      const fieldChoice = /^[A-Za-z][A-Za-z0-9 &/+-]{1,40}:\s*\S+/.test(value);
      if (!actionableLead.test(value) && !fieldChoice) continue;
      const body = stripInlineNegative(value);
      const instruction = ownedInstruction(step, body);
      if (instruction) found.push(instruction);
    }
  }

  return unique(found);
};

const extractConditionalExtras = (raw: string) => {
  const lines = raw.split(/\r?\n/);
  const found: string[] = [];

  for (let index = 0; index < lines.length; index++) {
    const value = stripBullet(lines[index]);
    if (!value) continue;

    if (conditionalLabel.test(value)) {
      const condition = value.replace(/:\s*$/, '');
      for (let next = index + 1; next < lines.length; next++) {
        const child = stripBullet(lines[next]);
        if (!child) continue;
        if (conditionalLabel.test(child) || /^[A-Z0-9][A-Z0-9 &/+-]{1,56}$/.test(child)) break;
        if (orphanInputFragment.test(child)) continue;
        found.push(`${condition}: ${clean(child)}`);
        break;
      }
      continue;
    }

    if (conditionalInline.test(value)) found.push(clean(value));
  }

  return unique(found);
};

const exclusionEcho = (value: string, exclusions: readonly string[]) => {
  const key = normalized(value);
  if (!key) return false;
  const negated = negativeClause.test(stripBullet(value));
  return exclusions.some(exclusion => {
    const excluded = normalized(exclusion);
    if (!excluded) return false;
    if (key === excluded) return true;
    return negated && key.includes(excluded);
  });
};

const removeExclusionEchoes = (items: string[], exclusions: readonly string[]) =>
  items.filter(item => !exclusionEcho(item, exclusions));

const freezeLock = (lock: IdeaLock): IdeaLock => Object.freeze({
  ...lock,
  screens: Object.freeze([...lock.screens]),
  requiredFeatures: Object.freeze([...lock.requiredFeatures]),
  optionalFeatures: Object.freeze([...lock.optionalFeatures]),
  stateRules: Object.freeze([...lock.stateRules]),
  persistenceRules: Object.freeze([...lock.persistenceRules]),
  visualRequirements: Object.freeze([...lock.visualRequirements]),
  constraints: Object.freeze([...lock.constraints]),
  explicitExclusions: Object.freeze([...lock.explicitExclusions]),
  lockedInstructions: Object.freeze([...lock.lockedInstructions]),
}) as IdeaLock;

export const parseIdea = (raw: string): IdeaLock => core.parseIdea(normalizeBrief(raw));

export function compile(raw: string, options: GenerateOptions = {}): PromptWithSettings {
  const normalizedRaw = normalizeBrief(`${raw}`);
  const base = core.compile(normalizedRaw, { ...options }) as PromptWithSettings;
  const exclusions = base.lock.explicitExclusions;
  const cleanedLock = freezeLock({
    ...base.lock,
    requiredFeatures: removeExclusionEchoes([...base.lock.requiredFeatures], exclusions),
    stateRules: removeExclusionEchoes([...base.lock.stateRules], exclusions),
    persistenceRules: removeExclusionEchoes([...base.lock.persistenceRules], exclusions),
    constraints: removeExclusionEchoes([...base.lock.constraints], exclusions),
  });
  const cleanedBase: PromptWithSettings = {
    ...base,
    lock: cleanedLock,
    features: removeExclusionEchoes([...base.features], exclusions),
    states: removeExclusionEchoes([...base.states], exclusions),
    constraints: removeExclusionEchoes([...base.constraints], exclusions),
  };
  const ownedFeatures = extractOwnedFeatures(raw, cleanedLock.workflow)
    .filter(item => !exclusionEcho(item, exclusions));
  const conditionalExtras = extractConditionalExtras(raw)
    .filter(item => !exclusionEcho(item, exclusions));

  if (!ownedFeatures.length && !conditionalExtras.length) return cleanedBase;

  return {
    ...cleanedBase,
    features: unique([...cleanedBase.features, ...ownedFeatures]),
    states: unique([...cleanedBase.states, ...conditionalExtras]),
  };
}

export const assemble = (prompt: PromptWithSettings) => core.assemble(prompt);
export const validateContradictions = (prompt: PromptWithSettings, output: string) => core.validateContradictions(prompt, output);
export const validate = (prompt: PromptWithSettings, output: string) => core.validate(prompt, output);

export const generate = (raw: string, options: GenerateOptions = {}) => {
  const prompt = compile(`${raw}`, { ...options });
  const output = assemble(prompt);
  validate(prompt, output);
  return output;
};
