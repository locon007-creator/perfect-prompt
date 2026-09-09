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
const sentenceLine = (value: string) => {
  const line = clean(value);
  return line ? `${line[0].toUpperCase()}${line.slice(1)}.` : '';
};

const workflowLabel = /^(?:(?:primary|main)\s+)?(?:workflow|flow|steps|process)\s*:?(.*)$/i;
const workflowSeparator = /→|->|;|\bthen\b/gi;
const transientAction = /^(?:save|submit|continue|cancel|finish|complete|confirm|delete|remove|done)$/i;
const malformedFragment = /^(?:allow|include|record|show|add|use|provide|ask|then asking|bill schedules?)\s*[:.\-]?\s*$/i;
const genericEmptyLabel = /^[A-Za-z][A-Za-z /&+-]{0,36}:\s*$/;
const negativeLead = /^(?:no\b|do not\b|don't\b|without\b)/i;

const extractExplicitWorkflow = (raw: string) => {
  const lines = raw.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const candidate = lines[index].trim().replace(/^#+\s*/, '');
    const match = workflowLabel.exec(candidate);
    if (!match) continue;
    const inline = clean(match[1] || '');
    if (inline) return inline;
    for (let next = index + 1; next < lines.length; next++) {
      const value = stripBullet(lines[next]);
      if (!value) continue;
      return clean(value);
    }
  }
  return '';
};

const workflowViews = (workflow: string) => unique(workflow
  .split(workflowSeparator)
  .flatMap(part => part.split(/\s*,\s*/))
  .map(clean)
  .filter(Boolean)
  .filter(step => !transientAction.test(step))
);

const looksLikeHeading = (line: string, workflowSteps: readonly string[]) => {
  const raw = line.trim();
  if (!raw) return false;
  const value = raw.replace(/^#+\s*/, '').replace(/:\s*$/, '').trim();
  if (workflowSteps.some(step => normalized(step) === normalized(value))) return true;
  if (/^#{1,4}\s+\S/.test(raw)) return true;
  if (value.length <= 56 && /^[A-Z0-9][A-Z0-9 &/+-]+$/.test(value) && value.split(/\s+/).length <= 8) return true;
  return false;
};

const isMalformedFragment = (line: string) => {
  const value = stripBullet(line);
  return !value || malformedFragment.test(value) || genericEmptyLabel.test(value);
};

const extractOwnedSectionRequirements = (raw: string, workflowSteps: readonly string[]) => {
  const lines = raw.split(/\r?\n/);
  const found: string[] = [];

  for (const step of workflowSteps) {
    const headingIndex = lines.findIndex(line => normalized(line) === normalized(step));
    if (headingIndex < 0) continue;

    for (let index = headingIndex + 1; index < lines.length; index++) {
      const rawLine = lines[index];
      if (!rawLine.trim()) continue;
      if (looksLikeHeading(rawLine, workflowSteps)) break;
      const value = stripBullet(rawLine);
      if (isMalformedFragment(value) || negativeLead.test(value)) continue;
      found.push(`${step}: ${clean(value)}`);
    }
  }

  return unique(found);
};

const conditionalLead = /^(?:if\b|when\b|whenever\b|only\s+when\b|once\b|otherwise\b|before\b|after\b|on\b|for\s+.+?,)/i;
const conditionalLabel = /^(?:if\b|when\b|whenever\b|only\s+when\b|otherwise\b|for\b)[^:]{0,80}:\s*$/i;

const extractConditionalRules = (raw: string, workflowSteps: readonly string[]) => {
  const lines = raw.split(/\r?\n/);
  const rules: string[] = [];

  for (let index = 0; index < lines.length; index++) {
    const value = stripBullet(lines[index]);
    if (!value) continue;

    if (conditionalLabel.test(value)) {
      const prefix = value.replace(/:\s*$/, '');
      for (let next = index + 1; next < lines.length; next++) {
        const childRaw = lines[next];
        if (!childRaw.trim()) continue;
        if (looksLikeHeading(childRaw, workflowSteps) || conditionalLabel.test(stripBullet(childRaw))) break;
        const child = stripBullet(childRaw);
        if (isMalformedFragment(child)) continue;
        rules.push(`${prefix}: ${clean(child)}`);
      }
      continue;
    }

    if (conditionalLead.test(value)) rules.push(clean(value));
  }

  return unique(rules);
};

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

export function parseIdea(raw: string): IdeaLock {
  const base = core.parseIdea(raw);
  const explicitWorkflow = extractExplicitWorkflow(raw);
  const workflow = explicitWorkflow || base.workflow;
  const views = workflowViews(workflow);
  const owned = extractOwnedSectionRequirements(raw, views);
  const conditional = extractConditionalRules(raw, views);

  return freezeLock({
    ...base,
    workflow,
    screens: unique([...base.screens, ...views]),
    requiredFeatures: unique([...base.requiredFeatures, ...owned]).filter(item => !isMalformedFragment(item)),
    stateRules: unique([...base.stateRules, ...conditional]).filter(item => !isMalformedFragment(item)),
  });
}

export function compile(raw: string, options: GenerateOptions = {}): PromptWithSettings {
  const snapshot = `${raw}`;
  const base = core.compile(snapshot, { ...options });
  const lock = parseIdea(snapshot);
  const views = workflowViews(lock.workflow);
  const owned = extractOwnedSectionRequirements(snapshot, views);
  const conditional = extractConditionalRules(snapshot, views);

  return {
    ...base,
    lock,
    workflow: lock.workflow,
    screens: unique([...base.screens, ...lock.screens, ...views]),
    features: unique([...base.features, ...owned]).filter(item => !isMalformedFragment(item)),
    states: unique([...base.states, ...lock.stateRules, ...lock.persistenceRules, ...conditional]).filter(item => !isMalformedFragment(item)),
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

const sectionBody = (output: string, name: string, next: string) =>
  output.split(`${name}\n\n`)[1]?.split(`\n\n${next}\n\n`)[0] || '';

const sanitizeOutput = (output: string) => output
  .split(/\r?\n/)
  .filter(line => !isMalformedFragment(line))
  .join('\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

export function assemble(prompt: PromptWithSettings) {
  let output = core.assemble(prompt);
  if (prompt.lock.workflow) {
    output = replaceSection(output, 'Main Workflow', 'Structure Requirements', prompt.lock.workflow);
  }
  return sanitizeOutput(output);
}

const validateWorkflow = (prompt: PromptWithSettings, output: string) => {
  if (!prompt.lock.workflow) return;
  const body = sectionBody(output, 'Main Workflow', 'Structure Requirements');
  if (normalized(body) !== normalized(prompt.lock.workflow)) {
    throw Error('Workflow altered or missing');
  }
};

const validateHygiene = (output: string) => {
  for (const line of output.split(/\r?\n/)) {
    if (isMalformedFragment(line)) throw Error(`Malformed output fragment: ${line.trim()}`);
  }
};

export function validateContradictions(prompt: PromptWithSettings, output: string) {
  validateWorkflow(prompt, output);
  validateHygiene(output);
  return core.validateContradictions(prompt, output);
}

export function validate(prompt: PromptWithSettings, output: string) {
  validateWorkflow(prompt, output);
  validateHygiene(output);
  return core.validate(prompt, output);
}

export const generate = (raw: string, options: GenerateOptions = {}) => {
  const snapshot = `${raw}`;
  const prompt = compile(snapshot, { ...options });
  const output = assemble(prompt);
  validate(prompt, output);
  return output;
};
