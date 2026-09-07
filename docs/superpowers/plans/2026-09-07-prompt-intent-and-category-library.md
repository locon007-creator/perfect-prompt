# Prompt Intent & Category Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add deterministic build-type specialist routing, dedicated starter-category pages, useful hamburger navigation, and send-to-generator behavior without weakening the existing Idea Lock or compiler validation.

**Architecture:** Add a small typed intent-routing module and a separate starter-library module in front of the existing compiler. Keep navigation/state in the React shell, and pass only structured build intent into the compiler entry point. Preserve `parseIdea()` and immutable `IdeaLock`; adapt `compile()`/`generate()` only through an optional typed intent parameter so existing callers and tests remain valid.

**Tech Stack:** React, TypeScript, Zod, Vite, Vitest, localStorage, existing CSS.

**Spec:** `docs/superpowers/specs/2026-09-07-prompt-intent-and-category-library-design.md`

## Global Constraints

- Preserve the approved dark navy / cyan Perfect Prompt visual system.
- Mobile portrait first, 360–430 px.
- No device mockup frame.
- The existing deterministic compiler remains isolated and authoritative.
- The existing Idea Lock remains immutable.
- Starter content must never override the user's own idea.
- No autonomous agents, AI chat, fake integrations, marketplace behavior, account systems, cloud sync, social features, prompt scoring, unrelated dashboards, automatic app building, or `Accept & Build`.
- Every visible control must have a real purpose.
- No starter content may reference another project.

---

## File Structure

- Create `src/intent.ts` — build-type enum, specialist profiles, deterministic role lookup.
- Create `src/intent.test.ts` — routing tests for all six build types.
- Create `src/starter-library.ts` — category definitions and neutral 5–7 starter briefs per category.
- Create `src/starter-library.test.ts` — library integrity tests.
- Modify `src/compiler.ts` — accept optional structured intent and use its specialist role without altering `parseIdea()`/Idea Lock semantics.
- Modify `src/compiler.test.ts` — prove old behavior still works and build intent changes role only where intended.
- Modify `src/main.tsx` — app navigation, build-type selector, category pages, hamburger destinations, saved prompts, prompt basics, send-to-generator flow.
- Modify `src/styles.css` — mobile-native screens, collapsible selector/cards, menu and category page styling.

---

### Task 1: Deterministic Build-Type Specialist Router

**Files:**
- Create: `src/intent.ts`
- Test: `src/intent.test.ts`

**Interfaces:**
- Produces: `export type BuildType = 'app-web-app' | 'website' | 'game' | 'video' | 'image' | 'general'`
- Produces: `export type SpecialistProfile = Readonly<{ buildType: BuildType; label: string; role: string; emphasis: readonly string[] }>`
- Produces: `export function getSpecialistProfile(buildType: BuildType): SpecialistProfile`
- Produces: `export const buildTypeOptions: readonly SpecialistProfile[]`

- [ ] **Step 1: Write the failing router test**

```ts
import { describe, expect, it } from 'vitest';
import { buildTypeOptions, getSpecialistProfile } from './intent';

describe('build intent routing', () => {
  it('defines exactly six deterministic build types', () => {
    expect(buildTypeOptions.map(x => x.buildType)).toEqual([
      'app-web-app', 'website', 'game', 'video', 'image', 'general'
    ]);
  });

  it('maps each build type to the intended specialist role', () => {
    expect(getSpecialistProfile('app-web-app').role).toContain('Full-Stack Application Engineer');
    expect(getSpecialistProfile('website').role).toContain('Web Experience Engineer');
    expect(getSpecialistProfile('game').role).toContain('Gameplay Engineer');
    expect(getSpecialistProfile('video').role).toContain('Video Production Specialist');
    expect(getSpecialistProfile('image').role).toContain('Image Prompt Specialist');
    expect(getSpecialistProfile('general').role).toContain('Prompt Engineer');
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- src/intent.test.ts`

Expected: FAIL because `src/intent.ts` does not exist.

- [ ] **Step 3: Implement the typed specialist profiles**

Create `src/intent.ts` with immutable profiles matching the spec exactly. Use a record keyed by `BuildType`; do not infer specialists from free text.

```ts
export type BuildType = 'app-web-app' | 'website' | 'game' | 'video' | 'image' | 'general';

export type SpecialistProfile = Readonly<{
  buildType: BuildType;
  label: string;
  role: string;
  emphasis: readonly string[];
}>;

const profiles: Record<BuildType, SpecialistProfile> = {
  'app-web-app': {
    buildType: 'app-web-app',
    label: 'App / Web App',
    role: 'You are a senior product designer and Full-Stack Application Engineer.',
    emphasis: ['screens','workflows','interactions','state','persistence','responsive/mobile behavior','implementation constraints']
  },
  website: {
    buildType: 'website',
    label: 'Website',
    role: 'You are a Web Designer and Frontend / Web Experience Engineer.',
    emphasis: ['page hierarchy','responsive layout','navigation','content structure','branding','calls to action','accessibility','performance']
  },
  game: {
    buildType: 'game',
    label: 'Game',
    role: 'You are a Game Designer and Gameplay Engineer.',
    emphasis: ['core loop','controls','rules','game state','progression','feedback','platform behavior']
  },
  video: {
    buildType: 'video',
    label: 'Video',
    role: 'You are a Creative Director and Video Production Specialist.',
    emphasis: ['concept','scene direction','pacing','framing','visual continuity','audio / voice guidance when relevant']
  },
  image: {
    buildType: 'image',
    label: 'Image',
    role: 'You are an Art Director and Image Prompt Specialist.',
    emphasis: ['subject','composition','lighting','environment','visual style','framing','exclusions']
  },
  general: {
    buildType: 'general',
    label: 'General Prompt',
    role: 'You are a Prompt Engineer and context-appropriate domain specialist.',
    emphasis: ['user goal','constraints','desired output','domain context','completion criteria']
  }
};

export const buildTypeOptions = Object.freeze(Object.values(profiles));
export const getSpecialistProfile = (buildType: BuildType) => profiles[buildType];
```

- [ ] **Step 4: Run router tests**

Run: `npm test -- src/intent.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/intent.ts src/intent.test.ts
git commit -m "feat: add deterministic build intent routing"
```

---

### Task 2: Preserve Compiler Boundary While Accepting Structured Intent

**Files:**
- Modify: `src/compiler.ts`
- Modify: `src/compiler.test.ts`

**Interfaces:**
- Consumes: `BuildType`, `getSpecialistProfile()` from `src/intent.ts`
- Produces: `export type GenerateOptions = Readonly<{ buildType?: BuildType }>`
- Produces: `export function compile(raw: string, options?: GenerateOptions): Prompt`
- Produces: `export const generate = (raw: string, options?: GenerateOptions) => string`
- Preserves: `parseIdea(raw: string): IdeaLock` unchanged in behavior and signature.

- [ ] **Step 1: Add failing compiler intent tests**

Add tests proving the old entry point still works and explicit build intent only controls role routing:

```ts
it('keeps existing generate(raw) compatibility', () => {
  const output = generate('Build an Android checklist app for one person with a Home screen.');
  expect(output).toContain('Role');
  expect(output).toContain('Idea Lock');
});

it('uses structured website intent without mutating Idea Lock', () => {
  const raw = 'Build a responsive site called Northstar for homeowners. Screens: Home, Contact.';
  const lockBefore = parseIdea(raw);
  const output = generate(raw, { buildType: 'website' });
  const lockAfter = parseIdea(raw);
  expect(output).toContain('Web Designer and Frontend / Web Experience Engineer');
  expect(lockAfter).toEqual(lockBefore);
  expect(Object.isFrozen(lockAfter)).toBe(true);
});
```

- [ ] **Step 2: Run targeted compiler tests and verify failure**

Run: `npm test -- src/compiler.test.ts`

Expected: FAIL on the new two-argument calls.

- [ ] **Step 3: Add minimal optional structured intent support**

In `src/compiler.ts`:

```ts
import type { BuildType } from './intent';
import { getSpecialistProfile } from './intent';

export type GenerateOptions = Readonly<{ buildType?: BuildType }>;
```

Change `compile` to:

```ts
export function compile(raw: string, options: GenerateOptions = {}): Prompt {
  const lock = parseIdea(raw);
  const role = options.buildType
    ? getSpecialistProfile(options.buildType).role
    : 'You are a senior product designer and frontend engineer.';
  return { role, /* existing fields unchanged */ };
}
```

Change `generate` to pass options through:

```ts
export const generate = (raw: string, options: GenerateOptions = {}) => {
  const p = compile(raw, options);
  const out = assemble(p);
  validate(p, out);
  return out;
};
```

Do not modify `parseIdea`, `IdeaLock`, contradiction validation, section order, or locked-instruction behavior.

- [ ] **Step 4: Run all compiler tests**

Run: `npm test -- src/compiler.test.ts src/intent.test.ts`

Expected: PASS.

- [ ] **Step 5: Run typecheck**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/compiler.ts src/compiler.test.ts
git commit -m "feat: route structured build intent into compiler role"
```

---

### Task 3: Neutral Starter Category Library

**Files:**
- Create: `src/starter-library.ts`
- Test: `src/starter-library.test.ts`

**Interfaces:**
- Produces: `export type StarterCategoryId = 'app' | 'utility' | 'productivity' | 'finance' | 'trucking'`
- Produces: `export type StarterIdea = Readonly<{ id: string; title: string; brief: string }>`
- Produces: `export type StarterCategory = Readonly<{ id: StarterCategoryId; label: string; description: string; starters: readonly StarterIdea[] }>`
- Produces: `export const starterCategories: readonly StarterCategory[]`
- Produces: `export function getStarterCategory(id: StarterCategoryId): StarterCategory`

- [ ] **Step 1: Write failing library integrity tests**

```ts
import { describe, expect, it } from 'vitest';
import { starterCategories } from './starter-library';

describe('starter library', () => {
  it('contains the five approved categories', () => {
    expect(starterCategories.map(x => x.id)).toEqual(['app','utility','productivity','finance','trucking']);
  });

  it('contains 5 to 7 starters per category', () => {
    for (const category of starterCategories) {
      expect(category.starters.length).toBeGreaterThanOrEqual(5);
      expect(category.starters.length).toBeLessThanOrEqual(7);
    }
  });

  it('contains no unrelated project names', () => {
    const text = JSON.stringify(starterCategories).toLowerCase();
    for (const forbidden of ['trucklog','drop & hook assistant','relayai','budget flow','car care pro','specsmith']) {
      expect(text).not.toContain(forbidden);
    }
  });
});
```

- [ ] **Step 2: Run test and verify failure**

Run: `npm test -- src/starter-library.test.ts`

Expected: FAIL because module does not exist.

- [ ] **Step 3: Implement the five categories and seven neutral starters each**

Use exactly the starter titles from the approved spec. Each `brief` should be a short neutral idea (roughly 1–3 sentences), not a compiled final prompt, and must not import workflows from any other repository.

- [ ] **Step 4: Run library tests**

Run: `npm test -- src/starter-library.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/starter-library.ts src/starter-library.test.ts
git commit -m "feat: add neutral starter prompt library"
```

---

### Task 4: App Navigation, Build Selector, Category Pages, and Real Menu Destinations

**Files:**
- Modify: `src/main.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `BuildType`, `buildTypeOptions` from `src/intent.ts`
- Consumes: `StarterCategoryId`, `starterCategories`, `getStarterCategory()` from `src/starter-library.ts`
- Consumes: `generate(idea, { buildType })` from `src/compiler.ts`
- Internal screen union: `type Screen = 'generator' | 'category-index' | 'category' | 'saved' | 'basics' | 'settings'`

- [ ] **Step 1: Define navigation state and build-type state in `App()`**

Add:

```ts
const [screen, setScreen] = useState<Screen>('generator');
const [buildType, setBuildType] = useState<BuildType>('app-web-app');
const [buildPickerOpen, setBuildPickerOpen] = useState(false);
const [activeCategory, setActiveCategory] = useState<StarterCategoryId>('app');
const [expandedStarter, setExpandedStarter] = useState<string | null>(null);
```

Replace the current decorative `selected` category state.

- [ ] **Step 2: Route generation through the selected specialist**

Change `go()` to:

```ts
function go() {
  try {
    const next = generate(idea, { buildType });
    setPrompt(next);
    setError('');
    setSaved(false);
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Please add more detail.');
  }
}
```

- [ ] **Step 3: Add the compact collapsible build-type selector directly under the subtitle**

The closed control must show `What would you like to build?` and the active label. Opening it shows the six approved options. Selecting one updates `buildType` and closes the selector. Do not add a modal or full-screen setup step.

- [ ] **Step 4: Convert Home chips into category-page shortcuts**

Each existing Home chip must execute:

```ts
setActiveCategory(category.id);
setExpandedStarter(null);
setScreen('category');
```

The chips no longer affect compiler role selection.

- [ ] **Step 5: Implement category index and dedicated category screen**

`category-index` lists all five categories. `category` shows title, description, back control, and 5–7 compact collapsible starter cards. Only one starter is expanded at once:

```ts
setExpandedStarter(current => current === starter.id ? null : starter.id);
```

- [ ] **Step 6: Implement `Send to Generator` behavior**

On the expanded starter action:

```ts
setIdea(starter.brief);
setScreen('generator');
setExpandedStarter(null);
setError('');
```

Do not call `generate()` automatically. Preserve the current `buildType`.

- [ ] **Step 7: Replace hamburger content with real destinations**

Menu items:

- Generator → `setScreen('generator')`
- Prompt Categories → `setScreen('category-index')`
- Saved Prompts → `setScreen('saved')`
- Prompt Basics → `setScreen('basics')`
- Settings → `setScreen('settings')`

Every item must close the menu after navigation.

- [ ] **Step 8: Implement lightweight Saved Prompts screen**

Keep local persistence only. Replace one-value storage with a JSON array under `perfect-prompt:saved` while retaining backward compatibility with `perfect-prompt:last` for one release. Saving must append a unique prompt if it is not already present. Clear Prompt must not delete saved prompts.

- [ ] **Step 9: Implement Prompt Basics screen**

Use concise static guidance explaining:

1. Choose what you want to build.
2. Describe the idea clearly.
3. Optionally use a starter category.
4. Perfect Prompt assigns the matching specialist.
5. The deterministic compiler preserves the user's locked requirements.

Do not add prompt scoring, tutorials, progress meters, or external links.

- [ ] **Step 10: Implement minimal Settings screen**

Only include working local controls. For this release, include `Clear saved prompts` with an explicit confirmation inside the screen. Do not add theme controls unless they are wired and tested in this task.

- [ ] **Step 11: Style all new screens in the approved visual system**

In `src/styles.css` add focused classes for:

- build selector / dropdown
- internal page header and back control
- category index rows
- starter accordion cards
- Send to Generator button
- saved-prompt cards
- basics/settings list rows

At `max-width: 430px`, keep the app edge-to-edge with no desktop card frame. Preserve the existing viewport fix and current generator proportions.

- [ ] **Step 12: Run typecheck and production build**

Run:

```bash
npm run typecheck
npm run build
```

Expected: both PASS.

- [ ] **Step 13: Commit**

```bash
git add src/main.tsx src/styles.css
git commit -m "feat: add prompt categories and specialist-aware navigation"
```

---

### Task 5: Regression, Mobile QA, and Merge Gate

**Files:**
- Modify tests only if a discovered regression needs a minimal explicit test.
- No new product features in this task.

**Interfaces:**
- Verifies all interfaces from Tasks 1–4.

- [ ] **Step 1: Run the full Vitest suite**

Run: `npm test`

Expected: all existing compiler tests plus new intent/library tests PASS.

- [ ] **Step 2: Run Promptfoo regression evaluation**

Run: `npm run eval`

Expected: existing positive scenarios pass with no new errors. Do not rewrite evaluation fixtures with project-specific examples.

- [ ] **Step 3: Run typecheck and production build**

```bash
npm run typecheck
npm run build
```

Expected: PASS.

- [ ] **Step 4: Verify the six specialist routes manually**

For one neutral idea, select each build type and generate. Confirm the Role section changes to the correct specialist while Idea Lock preserves the same user idea.

- [ ] **Step 5: Verify category navigation manually**

For App, Utility, Productivity, Finance, and Trucking:

1. Open category from Home chip.
2. Expand a starter.
3. Collapse it.
4. Expand another starter.
5. Tap Send to Generator.
6. Confirm Home receives the starter brief.
7. Confirm no prompt is generated until Generate Prompt is pressed.

- [ ] **Step 6: Verify hamburger destinations**

Open Generator, Prompt Categories, Saved Prompts, Prompt Basics, and Settings. Confirm each destination is functional and no menu item is decorative.

- [ ] **Step 7: Verify state preservation**

Confirm Back/navigation preserves the idea and selected build type; Clear Idea clears only the idea; Clear Prompt clears only generated output; saved prompts remain intact until explicitly cleared in Settings.

- [ ] **Step 8: Verify mobile widths**

Render at 360, 390, 412, and 430 px widths. Confirm no horizontal page overflow, no desktop-width shrinking, no device frame, and the app remains edge-to-edge on mobile.

- [ ] **Step 9: Verify Vercel preview**

Push the branch and wait for the PR #2 Vercel status to report success. Inspect the preview URL on the same Android phone used for the prior viewport issue.

- [ ] **Step 10: Final PR scope check**

Confirm PR #2 contains only Perfect Prompt changes, no unrelated project names/content, and no changes to Idea Lock semantics.

- [ ] **Step 11: Commit any test-only corrections if needed**

```bash
git add src/*.test.ts
# only if files actually changed
git commit -m "test: cover prompt intent and category navigation regressions"
```

- [ ] **Step 12: Merge gate**

Do not merge PR #2 until:

- Vercel is green.
- Full tests/typecheck/build/eval are green.
- Mobile preview visually matches the approved Perfect Prompt direction.
- User explicitly approves the rendered upgrade.
