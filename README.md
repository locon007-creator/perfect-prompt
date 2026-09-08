# Perfect Prompt

A deterministic, TypeScript prompt compiler that turns a raw product idea into a complete, build-ready brief. Compiler logic is independent from the React interface.

## Architecture

`Raw Idea → Zod Input Schema → Parser → immutable Idea Lock → Role Selector → Product Mission → Workflow Compiler → Screen Compiler → Feature Compiler → State/Behavior Compiler → UI Rules → Constraint Compiler → Contradiction Check → Prompt Assembler → Output Validation → Final Prompt`

The Idea Lock preserves the primary job, target user, platform, workflow, required and optional features, constraints, exclusions, and user instructions. It is frozen and never rewritten or beautified after assembly. Validation checks required sections and exclusions before returning output.

## Local development

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

The generator is mobile-first and designed for 360–430px portrait layouts. It provides Generate, Copy Prompt, Clear Prompt, and Accept & Build actions.

## Prompt evaluation

Promptfoo is included for regression evaluation. Run `npm run eval` after installing dependencies; cases live in `promptfooconfig.yaml` and the provider is `src/eval-provider.ts`.

## Vercel deployment

Import this repository into Vercel. The framework is Vite; use `npm run build` as the build command and `dist` as the output directory. No server or environment variables are required. Vercel automatically serves the generated static app.

Deployment sync marker: purity and semantic survival gate verified on main — retry deployment trigger.
