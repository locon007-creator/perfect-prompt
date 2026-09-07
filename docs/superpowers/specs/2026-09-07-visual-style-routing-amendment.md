# Perfect Prompt — Visual Style Routing Amendment

Date: 2026-09-07
Status: Approved
Branch: `visual/approved-generator-layout`
Parent spec: `docs/superpowers/specs/2026-09-07-prompt-intent-and-category-library-design.md`

## Purpose

Add a second compact structured selector directly below `What would you like to build?` so Perfect Prompt can route both a technical specialist and a visual-design specialist before compiling the final prompt.

## Home Addition

Add a collapsible selector titled:

### How should it look?

Options:

1. Premium Modern — default
2. Apple-Level Minimal
3. Figma-Level Product Design
4. Bold / Cinematic
5. Clean Utility
6. Custom / Let the idea decide

Only one visual style is active at a time. The selected style remains visible when collapsed.

## Deterministic Design Specialist Routing

Each visual style maps to a fixed design profile. No free-form AI routing.

- Premium Modern → Senior Product UI/UX Designer + Design Systems Specialist
- Apple-Level Minimal → Senior Mobile UI/UX Designer + Interaction Design Specialist
- Figma-Level Product Design → Product Design Lead + Design Systems Specialist
- Bold / Cinematic → Creative UI Director + Motion / Visual Experience Designer
- Clean Utility → Utility UX Designer + Information Hierarchy Specialist
- Custom / Let the idea decide → Design specialist follows only the visual direction explicitly present in the user's idea

## Compiler Boundary

New routing flow:

`Build Type → Technical Specialist + Visual Style → Design Specialist → User Idea → Optional Starter Context → Existing Parser / Idea Lock / Compiler → Final Prompt`

Rules:

- Visual style is structured input only.
- Visual routing may affect design role, typography, spacing, hierarchy, surfaces, motion, visual polish, responsive presentation, and visual completion language.
- Visual routing must never change workflow, screens, required/optional features, persistence, exclusions, or locked instructions.
- Idea Lock remains immutable.
- Explicit visual instructions in the user's idea override generic style defaults where they conflict.
- Custom / Let the idea decide must not invent a style when none is stated.

## UI Rules

- Place the visual selector immediately below the build-type selector and above the idea panel.
- Keep both selectors compact; they must not dominate the generator.
- Use the existing dark navy / cyan Perfect Prompt visual system.
- Do not add a setup wizard, modal, progress step, or extra dashboard.
- Premium Modern is the default selection.

## Testing Requirements

Before merge:

1. All six visual styles route deterministically.
2. Existing `generate(raw)` and `generate(raw,{buildType})` calls remain backward compatible.
3. Visual selection changes design-specialist context without mutating Idea Lock.
4. Workflow, screens, features, persistence, and exclusions are identical for the same idea across visual styles.
5. The Home selector works at 360, 390, 412, and 430 px without horizontal overflow.
6. Existing compiler, Promptfoo, typecheck, build, and Vercel checks remain green.

## Completion Standard

Perfect Prompt exposes two clear routing decisions before the idea box: what the user wants to build and how they want it to look. Both selections strengthen the generated prompt while the user's explicit product requirements remain authoritative.