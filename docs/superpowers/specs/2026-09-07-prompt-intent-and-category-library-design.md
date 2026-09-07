# Perfect Prompt — Prompt Intent & Category Library Design

Date: 2026-09-07
Status: Approved design, pending implementation
Branch: `visual/approved-generator-layout`

## Purpose

Upgrade Perfect Prompt so the generator understands what the user wants to build before compiling the final prompt, while keeping the approved mobile-first home screen clean and easy to operate.

The existing deterministic compiler remains isolated and authoritative. This upgrade adds structured intent and library inputs before compilation; it does not replace the compiler or allow unrestricted AI rewriting.

## Home Screen Structure

The approved Perfect Prompt visual remains the source of truth.

At the top:

- `Perfect Prompt`
- Subtitle: `Turn your ideas into powerful prompts.`
- Top-right hamburger menu

Directly below the subtitle, add a compact collapsible control:

### What would you like to build?

Options:

1. App / Web App
2. Website
3. Game
4. Video
5. Image
6. General Prompt

Only one build type is active at a time. The selected value is clearly visible when the section is collapsed.

The rest of Home stays focused on the existing workflow:

Build Type → Idea → Starter Category if desired → Generate → Review → Copy / Save / Clear

## Specialist Role Routing

Each build type maps to a deterministic specialist profile used as structured compiler input.

### App / Web App
Role emphasis:
- Senior Product Designer
- Full-Stack Application Engineer

Prompt emphasis:
- screens
- workflows
- interactions
- state
- persistence
- responsive/mobile behavior
- implementation constraints

### Website
Role emphasis:
- Web Designer
- Frontend / Web Experience Engineer

Prompt emphasis:
- page hierarchy
- responsive layout
- navigation
- content structure
- branding
- calls to action
- accessibility
- performance

### Game
Role emphasis:
- Game Designer
- Gameplay Engineer

Prompt emphasis:
- core loop
- controls
- rules
- game state
- progression
- feedback
- platform behavior

### Video
Role emphasis:
- Creative Director
- Video Production Specialist

Prompt emphasis:
- concept
- scene direction
- pacing
- framing
- visual continuity
- audio / voice guidance when relevant

### Image
Role emphasis:
- Art Director
- Image Prompt Specialist

Prompt emphasis:
- subject
- composition
- lighting
- environment
- visual style
- framing
- exclusions

### General Prompt
Role emphasis:
- Prompt Engineer
- Context-appropriate domain specialist

Prompt emphasis:
- user goal
- constraints
- desired output
- domain context
- completion criteria

## Compiler Boundary

New flow:

`Build Type → Specialist Profile → User Idea → Optional Starter Context → Existing Parser / Idea Lock / Compiler → Final Prompt`

Rules:

- The selected build type is structured input, not free-form decoration.
- Specialist selection is deterministic.
- The existing Idea Lock remains immutable.
- No downstream stage may contradict explicit user instructions.
- Build type may guide role, terminology, output structure, and completion standard, but may not invent unrelated features.
- Starter content is optional and must never override the user's own idea.

## Starter Category Library

The existing Home chips are repurposed as shortcuts into a starter-prompt library:

- App
- Utility
- Productivity
- Finance
- Trucking

They are not build-type selectors.

Tapping a chip opens that category's dedicated page.

A second route to the same pages exists through the hamburger menu under `Prompt Categories`.

## Category Page Pattern

Every category page uses the same clean mobile pattern:

- Page title and concise description
- Back navigation
- 5–7 collapsible starter cards
- Only one card needs to be expanded at a time
- Each card contains a practical starter idea / brief
- Expanded card exposes a single action: `Send to Generator`

`Send to Generator` returns to Home and places that starter idea into the main idea field. It does not automatically generate the final prompt. The user can edit the idea first and then press Generate Prompt.

This preserves user control and prevents accidental generation.

## Initial Starter Library

### App
- Personal Organizer
- Simple Tracker
- Private Notes App
- Daily Routine App
- Appointment Manager
- Personal Inventory
- Simple Record Keeper

### Utility
- Grocery List
- Bill Reminder
- Habit Tracker
- Simple Timesheet
- Appointment Planner
- Inventory Tracker
- Mileage Tracker

### Productivity
- Daily Planner
- Task List
- Notes Organizer
- Project Checklist
- Focus Timer
- Routine Tracker
- Personal Calendar

### Finance
- Budget Tracker
- Expense Tracker
- Bill Organizer
- Savings Goal
- Loan Tracker
- Subscription Tracker
- Paycheck Planner

### Trucking
- Mileage Log
- Fuel Tracker
- Stop Organizer
- Equipment Log
- Trailer Tracker
- Route Checklist
- Daily Driver Log

These are neutral starter ideas for this repository and must not import logic, wording, workflows, or assumptions from unrelated projects.

## Hamburger Navigation

Replace the current minimal menu with:

- Generator
- Prompt Categories
- Saved Prompts
- Prompt Basics
- Settings

### Generator
Returns to Home.

### Prompt Categories
Opens a simple category index containing App, Utility, Productivity, Finance, and Trucking. Selecting one opens its dedicated category page.

### Saved Prompts
Shows prompts the user intentionally saved. Keep this local and lightweight unless a future persistence requirement is approved.

### Prompt Basics
Provides concise guidance explaining how to describe an idea clearly and how Perfect Prompt uses build type, user idea, and optional starter context.

### Settings
Keep minimal. Only include controls that actually work. No decorative or fake integrations.

## Navigation & State

Required state:

- selected build type
- current idea text
- current generated prompt
- saved prompt state
- current category page
- currently expanded starter card

Behavior:

- Back preserves the user's idea and selected build type.
- Sending a starter to Generator preserves the selected build type.
- Generating a prompt never erases the source idea.
- Clear Idea only clears idea input.
- Clear Prompt only clears generated output.
- Saved prompts are never deleted by Clear Prompt.

## Visual Rules

- Preserve the approved dark navy / cyan Perfect Prompt visual system.
- Mobile portrait first, 360–430 px.
- No device mockup frame.
- Category pages should feel like native app screens, not dashboards.
- Collapsible starter cards should be compact when closed.
- Avoid progress bars, step counters, analytics, or decorative metrics.
- One obvious primary action per expanded starter card.
- Build-type selector should be visually compact and subordinate to the main idea panel.

## Non-Goals

Do not add:

- autonomous agents
- AI chat
- fake integrations
- marketplace behavior
- account systems
- cloud sync
- social features
- prompt scoring
- unrelated dashboards
- automatic app building
- `Accept & Build`

## Testing Requirements

Before merge:

1. Build succeeds on Vercel.
2. Existing compiler tests remain green.
3. Build-type routing is deterministic and separately testable.
4. Each build type maps to the intended specialist profile.
5. Category chips navigate to their correct pages.
6. Each category contains 5–7 starter cards.
7. Expand / collapse works correctly.
8. `Send to Generator` returns to Home and fills the idea field without auto-generating.
9. Back navigation preserves idea and build type.
10. Mobile viewport works correctly at 360, 390, 412, and 430 px.
11. No compiler files are modified except where strictly required to accept structured intent input; Idea Lock behavior must remain unchanged.
12. No starter content references another project.

## Completion Standard

The upgrade is complete only when every visible control has a real purpose, the selected build type reliably triggers the correct specialist profile, category pages are clean and self-explanatory, starter ideas can be sent back to the generator without clutter, and the final prompt still passes through the existing deterministic compiler architecture without contamination.