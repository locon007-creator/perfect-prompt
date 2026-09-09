# Global Semantic Survival and Fresh-Generation Reset Design

## Goal
Improve Perfect Prompt globally so every generation preserves the source brief's semantics without app-specific contamination, and refreshing/resetting the generator clears all transient state from the prior generation.

## Scope
This is domain-agnostic. No finance-, task-, trucking-, recipe-, or other app-specific rules may be introduced.

## Global Compiler Behavior
1. Preserve explicit workflows exactly when present.
2. Keep requirements owned by their source screen/section instead of flattening them into generic Core Features.
3. Preserve conditional behavior such as if/when/only when/otherwise.
4. Remove malformed fragments such as `Allow:.`, `Include:.`, orphaned labels, duplicated list headers, and incomplete requirements.
5. Prevent cross-generation/domain contamination: output may contain only current-brief semantics plus global compiler rules.
6. Before output, verify semantic survival for workflow, screens, state, persistence, exclusions, and required interactions.

## Fresh-Generation Reset
On explicit reset/refresh of the generator workspace, clear all transient generation data: current idea text, generated prompt, parsed idea lock, inferred screens/features, transient compiler state, cached generation output, and previous-generation UI state. Preserve only intentional persistent user settings such as theme or other app preferences.

## Testing
Add domain-agnostic regression tests plus unrelated representative briefs covering at least four categories. Tests must prove workflow survival, section ownership, conditional logic, malformed-fragment cleanup, semantic isolation, and reset behavior.

## Non-Goals
Do not redesign Perfect Prompt. Do not add app-specific templates or examples to production compiler logic. Do not change the five-mode product model unless required by existing behavior.