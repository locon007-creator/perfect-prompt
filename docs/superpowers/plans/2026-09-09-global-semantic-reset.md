# Global Semantic Survival and Fresh-Generation Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Perfect Prompt preserve current-brief semantics globally and fully clear transient generation state on reset/refresh without app-specific contamination.

**Architecture:** Extend the existing compiler extraction/assembly pipeline in `src/compiler.ts` with domain-agnostic semantic ownership and hygiene guards, then add a UI reset boundary in `src/main.tsx`. Protect behavior with focused regression tests across unrelated app domains.

**Tech Stack:** TypeScript, React, Vite, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-09-global-semantic-reset-design.md`

## Global Constraints
- No finance-, task-, trucking-, recipe-, or other app-specific production rules.
- Preserve explicit workflow, screen ownership, conditional behavior, state, persistence, exclusions, and required interactions.
- Reset clears transient generation state but preserves intentional user settings.
- Do not redesign the Perfect Prompt UI.

---

### Task 1: Workflow and section-ownership survival

**Files:**
- Modify: `src/compiler.ts`
- Create: `src/global-semantic-survival-regression.test.ts`

**Interfaces:**
- Consumes: existing `parseIdea(raw: string)` and prompt-generation pipeline.
- Produces: domain-agnostic workflow/section extraction that survives into generated prompts.

- [ ] Write failing Vitest cases with four unrelated briefs containing explicit workflows and named sections.
- [ ] Run `npm test -- src/global-semantic-survival-regression.test.ts` and confirm failures show workflow/ownership loss.
- [ ] Implement minimal workflow and section-ownership preservation in `src/compiler.ts`.
- [ ] Run the focused test until green.
- [ ] Run `npm test` and confirm no regression.

### Task 2: Conditional logic and fragment hygiene

**Files:**
- Modify: `src/compiler.ts`
- Create: `src/global-conditional-hygiene-regression.test.ts`

**Interfaces:**
- Consumes: parsed requirement units.
- Produces: complete conditional requirements and sanitized output fragments.

- [ ] Write failing tests for `if`, `when`, `only when`, `otherwise`, and malformed fragments such as `Allow:.` / `Include:.`.
- [ ] Run focused test and verify RED.
- [ ] Add minimal conditional preservation and fragment rejection/cleanup helpers.
- [ ] Re-run focused test to GREEN.
- [ ] Run full suite.

### Task 3: Cross-app semantic isolation gate

**Files:**
- Modify: `src/compiler.ts`
- Modify: `src/global-compiler-hygiene-regression.test.ts`

**Interfaces:**
- Consumes: current `IdeaLock`, inferred features/settings, and generated prompt sections.
- Produces: final prompt containing current-brief semantics plus global compiler rules only.

- [ ] Add failing sequential-generation tests using unrelated domains.
- [ ] Verify the second generation cannot inherit domain terms from the first.
- [ ] Implement a final semantic-isolation/survival check without hard-coded domain vocabulary in production.
- [ ] Run focused and full regression suites.

### Task 4: Fresh-generation reset boundary

**Files:**
- Modify: `src/main.tsx`
- Create: `src/generation-reset-regression.test.tsx`

**Interfaces:**
- Consumes: current React state for idea input, generated output, parsed/inferred transient state, and user settings.
- Produces: one reset action that clears generation-session state while retaining intentional preferences.

- [ ] Write a failing UI regression test that generates content, triggers reset/refresh behavior, and checks all transient fields are empty while settings remain.
- [ ] Run focused test and verify RED.
- [ ] Centralize reset logic in one function and wire existing Clear/refresh entry points to it.
- [ ] Re-run focused test to GREEN.
- [ ] Run `npm test`, `npm run typecheck`, and `npm run build`.

### Task 5: Final global verification

**Files:**
- Modify only tests if verification exposes a missing global case.

- [ ] Run `npm test`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Verify representative finance, task, trucking, and utility/recipe briefs preserve their own semantics without cross-contamination.
- [ ] Confirm reset erases the prior generation's idea/output/transient state and leaves settings intact.
