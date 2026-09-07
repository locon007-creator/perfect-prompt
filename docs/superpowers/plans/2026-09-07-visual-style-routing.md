# Visual Style Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a second deterministic visual-style selector that routes a design specialist into prompt compilation without changing Idea Lock semantics or product requirements.

**Architecture:** Add a focused `visual-style.ts` module containing the six approved style profiles. Extend the compiler's optional structured options with `visualStyle`, combine technical and design specialist roles at compile time, and keep `parseIdea()` unchanged. Add one compact Home selector directly below build type.

**Tech Stack:** React, TypeScript, Vite, Vitest, existing deterministic compiler.

**Spec:** `docs/superpowers/specs/2026-09-07-visual-style-routing-amendment.md`

## Global Constraints

- Premium Modern is the default visual style.
- Visual routing may affect design role and visual language only.
- It must never change workflow, screens, features, persistence, exclusions, or locked instructions.
- Idea Lock remains immutable.
- Explicit user visual instructions remain authoritative.
- Preserve the approved dark navy / cyan mobile layout and 360–430 px target.

---

### Task 1: Visual Style Router

**Files:**
- Create: `src/visual-style.test.ts`
- Create: `src/visual-style.ts`

**Interfaces:**
- Produces: `VisualStyle = 'premium-modern' | 'apple-minimal' | 'figma-product' | 'bold-cinematic' | 'clean-utility' | 'custom'`
- Produces: `visualStyleOptions`
- Produces: `getVisualStyleProfile(style)`

- [ ] Write tests asserting exactly six styles, Premium Modern first/default, and deterministic specialist mappings.
- [ ] Verify the tests fail because the module does not exist.
- [ ] Implement immutable profiles matching the approved spec.
- [ ] Verify targeted tests pass.

### Task 2: Compiler Boundary

**Files:**
- Modify: `src/compiler.test.ts`
- Modify: `src/compiler.ts`

**Interfaces:**
- Extend `GenerateOptions` with `visualStyle?: VisualStyle`.
- Preserve `parseIdea(raw)` unchanged.

- [ ] Add tests proving visual style changes role/design context while Idea Lock stays equal and frozen.
- [ ] Add a test comparing workflow/screens/features/states/constraints across two visual styles for the same idea.
- [ ] Extend optional compiler input only after tests are present.
- [ ] Preserve backward compatibility for existing one-argument and build-type-only calls.

### Task 3: Home Selector

**Files:**
- Modify: `src/main.tsx`
- Modify: `src/styles.css`

- [ ] Add `visualStyle` state defaulting to `premium-modern`.
- [ ] Add compact `How should it look?` selector directly below build type.
- [ ] Route `generate(idea,{buildType,visualStyle})`.
- [ ] Reuse the existing visual language and spacing; no modal, wizard, or new screen.
- [ ] Ensure opening one selector closes the other to keep the Home screen compact.

### Task 4: Regression Gate

- [ ] Run full Vitest suite.
- [ ] Run Promptfoo.
- [ ] Run typecheck.
- [ ] Run production build.
- [ ] Confirm Vercel preview is READY.
- [ ] Confirm PR #2 remains unmerged until the user approves the rendered visual.