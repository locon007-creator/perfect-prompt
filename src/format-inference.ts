import type { CreationFormat } from './creation-format';

export type MinimumInference = Readonly<{
  features: readonly string[];
  screens: readonly string[];
  states: readonly string[];
}>;

type LockShape = Readonly<{
  appName: string;
  primaryJob: string;
  workflow: string;
  screens: readonly string[];
  requiredFeatures: readonly string[];
  optionalFeatures: readonly string[];
  explicitExclusions: readonly string[];
}>;

type Archetype = Readonly<{
  match: RegExp;
  features: readonly string[];
  primaryScreens: readonly string[];
  richerScreens: readonly string[];
  states?: readonly string[];
}>;

const archetypes: readonly Archetype[] = [
  {
    match: /\b(?:daily\s+)?routine\b/i,
    features: [
      'Create routine items',
      "Show today's routine clearly",
      'Mark routine items complete for the day',
      "Save routine items and today's completion state locally",
    ],
    primaryScreens: ['Today'],
    richerScreens: ['Today', 'Routine'],
    states: ['Reset daily completion state for a new day while keeping saved routine items'],
  },
  {
    match: /\bhabit(?:\s+tracker)?\b/i,
    features: ['Create habits', "Show today's habits", 'Mark habits complete for the day', 'Save habits and completion state locally'],
    primaryScreens: ['Today'],
    richerScreens: ['Today', 'Habits'],
  },
  {
    match: /\bchecklist\b/i,
    features: ['Add checklist items', 'Mark checklist items complete', 'Edit or remove checklist items', 'Save checklist state locally'],
    primaryScreens: ['Checklist'],
    richerScreens: ['Checklist'],
  },
  {
    match: /\b(?:task|to[- ]?do)(?:\s+(?:manager|tracker|list))?\b/i,
    features: ['Add tasks', 'Mark tasks complete', 'Edit or remove tasks', 'Save task state locally'],
    primaryScreens: ['Tasks'],
    richerScreens: ['Tasks'],
  },
  {
    match: /\bnotes?(?:\s+(?:app|utility))?\b/i,
    features: ['Create notes', 'Edit notes', 'Delete notes', 'Save notes locally'],
    primaryScreens: ['Notes'],
    richerScreens: ['Notes', 'Editor'],
  },
  {
    match: /\bshopping\s+list\b/i,
    features: ['Add shopping items', 'Mark items complete', 'Edit or remove items', 'Save the list locally'],
    primaryScreens: ['List'],
    richerScreens: ['List'],
  },
  {
    match: /\bappointment(?:\s+(?:manager|tracker|app))?\b/i,
    features: ['Add appointments', 'Record appointment date and time', 'Edit or remove appointments', 'Save appointments locally'],
    primaryScreens: ['Appointments'],
    richerScreens: ['Appointments', 'Appointment'],
  },
  {
    match: /\bloan\s+tracker\b/i,
    features: ['Record the starting balance', 'Record payment dates and payment amounts', 'Update the remaining balance after each payment', 'Save loan records locally'],
    primaryScreens: ['Loan'],
    richerScreens: ['Loan', 'Payments'],
  },
  {
    match: /\btimesheet\b|\btime\s*(?:sheet|tracker)\b/i,
    features: ['Record work start time', 'Record work end time', 'Calculate daily worked hours', 'Save recorded workdays locally'],
    primaryScreens: ['Today'],
    richerScreens: ['Today', 'Week'],
  },
  {
    match: /\bbudget(?:ing)?\b/i,
    features: ['Set a budget amount', 'Record spending against the budget', 'Show the remaining budget', 'Save budget data locally'],
    primaryScreens: ['Budget'],
    richerScreens: ['Budget', 'Activity'],
  },
];

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const isGenericFeature = (feature: string, lock: LockShape) => {
  const value = normalize(feature);
  const name = normalize(lock.appName);
  const job = normalize(lock.primaryJob);
  return !value || value === name || value === job || value === `${name} app` || value === `${job} app`;
};

const isVague = (raw: string, lock: LockShape) => {
  const meaningfulFeatures = lock.requiredFeatures.filter(feature => !isGenericFeature(feature, lock));
  const hasExplicitStructure = Boolean(lock.workflow || lock.screens.length || lock.optionalFeatures.length || lock.explicitExclusions.length);
  const directiveCount = (raw.match(/\b(?:show|allow|include|record|save|add|create|mark|edit|delete|remove|calculate|track|use|provide|require)\b/gi) || []).length;
  return meaningfulFeatures.length === 0 && !hasExplicitStructure && directiveCount <= 1;
};

const depthFor = (format: CreationFormat) => {
  if (format === 'multi-screen-app' || format === 'dashboard') return 'rich' as const;
  if (format === 'mobile-utility' || format === 'single-purpose-tool') return 'lean' as const;
  return 'standard' as const;
};

export function inferMinimumViableProduct(raw: string, lock: LockShape, format: CreationFormat = 'idea-decides'): MinimumInference {
  if (!isVague(raw, lock) || format === 'website-landing') return { features: [], screens: [], states: [] };
  const source = `${lock.appName} ${lock.primaryJob} ${raw}`;
  const archetype = archetypes.find(item => item.match.test(source));
  if (!archetype) return { features: [], screens: [], states: [] };
  const depth = depthFor(format);
  return {
    features: archetype.features,
    screens: depth === 'rich' ? archetype.richerScreens : depth === 'standard' ? archetype.primaryScreens : [],
    states: archetype.states || [],
  };
}
