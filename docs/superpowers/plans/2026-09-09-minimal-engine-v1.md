# Minimal Engine v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Perfect Prompt produce reliable minimalist app-builder prompts by preserving the raw idea, enforcing HTML hard locks, and using Gemini as the reasoning/final-writing layer instead of repairing a heavy parser output.

**Architecture:** Add a focused deterministic Minimal Engine module and route app/web-app generation through it. Keep the current UI unchanged. Validate AI output against hard HTML invariants and fall back to the deterministic Minimal Engine prompt if AI drifts.

**Tech Stack:** TypeScript, React, Vitest, Vite, Vercel serverless JavaScript, Gemini 3.6 Flash

**Spec:** `docs/superpowers/specs/2026-09-09-minimal-engine-v1-design.md`

## Global Constraints
- No visual/UI redesign.
- Raw user idea is highest authority.
- App/web-app output defaults to one self-contained `index.html` with inline CSS and JavaScript.
- No React/framework/build step/extra files in generated app prompts.
- Target mobile portrait 360–430 px.
- No project-specific hardcoding.
- Preserve deterministic fallback when Gemini is unavailable or invalid.

---

### Task 1: Minimal deterministic wrapper

**Files:**
- Create: `src/minimal-engine.ts`
- Create: `src/minimal-engine.test.ts`

**Interfaces:**
- Produces: `buildMinimalPrompt(idea: string, options: { buildType?: string; creationFormat?: string; visualStyle?: string }): string`

- [ ] **Step 1: Write failing tests** verifying the output contains the raw financial brief's fixed/variable rules, Thursday-night reminder, 2–3 day bill reminder, credit-card assignment and double-count rule; contains the HTML lock; and does not manufacture parser fragments.
- [ ] **Step 2: Run `npm test -- src/minimal-engine.test.ts`** and confirm failure because `minimal-engine.ts` does not exist.
- [ ] **Step 3: Implement the smallest wrapper** with Role, Creation Format, Product Brief, Execution Rules, optional Visual Direction, and Deliverable. Preserve the raw idea text instead of parsing it.
- [ ] **Step 4: Run the focused test** and confirm it passes.
- [ ] **Step 5: Commit** `feat: add minimalist deterministic prompt engine`.

### Task 2: Validate AI output hard invariants

**Files:**
- Modify: `src/ai-generator.ts`
- Modify: `src/ai-generator.test.ts`

**Interfaces:**
- Produces: `validateAIPrompt(prompt: string, buildType: string): boolean`

- [ ] **Step 1: Add failing tests** for rejecting native iOS/Android stack drift, React/framework/build-step output, missing `index.html`, missing inline CSS/JS, and missing 360–430 mobile portrait constraint for app/web-app generation.
- [ ] **Step 2: Run focused tests** and verify they fail because validation does not exist.
- [ ] **Step 3: Add minimal validator** and keep request behavior unchanged.
- [ ] **Step 4: Run focused tests** and verify pass.
- [ ] **Step 5: Commit** `feat: reject AI prompt stack drift`.

### Task 3: Route Generate through Minimal Engine

**Files:**
- Modify: `src/main.tsx`
- Add/modify relevant regression test for Generate flow.

**Interfaces:**
- Consumes: `buildMinimalPrompt`, `requestAIGeneration`, `validateAIPrompt`.
- Behavior: deterministic Minimal Engine prompt is shown immediately; AI may replace it only if validation passes.

- [ ] **Step 1: Write failing integration/regression test** proving app/web-app generation does not use parser-produced `Structure Requirements` fragments and sends the Minimal Engine wrapper to AI.
- [ ] **Step 2: Run test and verify expected failure.**
- [ ] **Step 3: Modify Generate flow minimally** without changing UI markup or styles.
- [ ] **Step 4: Run focused and full test suite.**
- [ ] **Step 5: Commit** `feat: route app prompts through Minimal Engine`.

### Task 4: Simplify Gemini instruction

**Files:**
- Modify: `api/generate.js`
- Create/modify API instruction regression test.

**Interfaces:**
- Input remains `{ idea, compiledPrompt, buildType, creationFormat, visualStyle }` for compatibility; `compiledPrompt` now contains the Minimal Engine wrapper.

- [ ] **Step 1: Write a failing regression test** requiring raw-idea-first authority, explicit HTML hard-lock preservation, and removal of language that tells Gemini to repair parser fragments as its primary job.
- [ ] **Step 2: Verify red.**
- [ ] **Step 3: Replace the server instruction** with concise reasoning/final-writing guidance: preserve raw idea, retain hard locks, organize clearly, add no unsupported product logic, return final prompt only.
- [ ] **Step 4: Verify green.**
- [ ] **Step 5: Commit** `refactor: make Gemini the primary prompt reasoner`.

### Task 5: Full verification and production rollout

**Files:**
- No production code unless failures require a scoped fix.

- [ ] **Step 1: Run `npm test`.**
- [ ] **Step 2: Run `npm run typecheck`.**
- [ ] **Step 3: Run `npm run build`.**
- [ ] **Step 4: Run `npm run eval`.**
- [ ] **Step 5: Open PR and verify GitHub Actions are green.**
- [ ] **Step 6: Review diff for accidental UI/style changes and confirm none.**
- [ ] **Step 7: Merge to `main`.**
- [ ] **Step 8: Verify Vercel production deployment reaches READY.**
- [ ] **Step 9: Test production generation path with the complex financial brief and confirm the returned prompt preserves fixed/variable logic, reminder timing, card-paid bill handling, double-count prevention, and HTML format lock.