import { describe, expect, it } from 'vitest';
import { assemble, compile, generate } from './compiler';

const brief = `APP BRIEF — PERSONAL FINANCIAL ASSISTANT

Build a premium personal financial assistant for one person.

QUALITY BAR
Create a top-tier polished mobile experience with premium UI/UX, refined spacing, calm surfaces, strong hierarchy, subtle motion, excellent touch ergonomics, and a finished production-level visual system.
Avoid generic AI layouts, spreadsheet-style screens, cluttered dashboards, excessive cards, and decorative noise.

MAIN JOB
Help the user set up their regular money schedule once, then understand what money is coming in, what must be paid, what has been paid, and what remains.

PRIMARY WORKFLOW
Welcome → Income Setup → Bills Setup → Credit Cards → Setup Complete → Home → Ongoing Financial Assistant

FIRST-RUN SETUP
Do not drop the user directly onto Home.

WELCOME
Briefly explain:
“Set up your regular money schedule once. After that, the app asks for the real amount only when it matters.”

INCOME SETUP
Ask:
- Income type: Fixed / Variable
- Pay frequency: Weekly / Every 2 Weeks / Twice Monthly / Monthly / Custom
- Payday or paydays
- Expected amount if Fixed

If Variable:
Do not ask for a permanent amount.
On payday, Home asks:
“How much did you receive today?”

If Fixed:
Prefill the expected amount on payday and allow quick confirmation or adjustment.

Support more than one income source if needed, but keep setup simple.

BILLS SETUP
Use a tap-based bill selector instead of typed bill names.

Include:
Rent
Mortgage
Electricity
Gas
Water
Internet
Mobile Phone
Car Payment
Car Insurance
Health Insurance
Credit Card
Loan
Streaming
Subscriptions
Childcare
Other

For each bill ask:
- Due date
- Fixed or Variable
- Expected amount only if Fixed

For Variable bills, ask for the real amount when that bill becomes relevant.

CREDIT CARDS
Allow card name, payment date, and usual payment behavior.
Before the payment date, ask:
“How much are you paying this card this month?”

HOME
Show only what matters now:
- Money received
- Bills due soon
- Card payments coming up
- Completed payments
- Money remaining after known obligations

Only show questions when action is needed.

INTERACTION EFFICIENCY
Minimize typing.
Use selectors, chips, date pickers, numeric keypads, remembered values, defaults, and recent selections.

STATE
Persist setup, schedules, actual amounts, due dates, payment statuses, and history after refresh/reopen.

KEEP IT SIMPLE
No investments.
No taxes.
No bank syncing.
No teams.
No business accounting.
No spreadsheet-style budgeting.
No analytics dashboard.`;

const options = {
  buildType: 'app-web-app' as const,
  creationFormat: 'ios-app' as const,
  visualStyle: 'figma-level-product-design' as const,
};

describe('exact financial assistant brief', () => {
  it('generates without an exclusion violation and preserves fixed/variable income logic', () => {
    const prompt = compile(brief, options);
    const output = assemble(prompt);
    const needle = 'ask for a permanent amount';
    const surfaces = {
      workflow: prompt.workflow,
      screens: prompt.screens,
      features: prompt.features,
      states: prompt.states,
      visual: prompt.visual,
      constraints: prompt.constraints,
      lockRequired: prompt.lock.requiredFeatures,
      lockStates: prompt.lock.stateRules,
      lockConstraints: prompt.lock.constraints,
      outputCore: output.split('Core Features')[1]?.split('Interaction & State Rules')[0] || '',
      outputStates: output.split('Interaction & State Rules')[1]?.split('Visual Direction')[0] || '',
    };
    const contaminated = Object.entries(surfaces).filter(([, value]) => JSON.stringify(value).toLowerCase().includes(needle));
    console.log('EXCLUSION_CONTAMINATION', JSON.stringify(contaminated, null, 2));

    expect(() => generate(brief, options)).not.toThrow();
    const generated = generate(brief, options);
    expect(generated).toContain('Welcome → Income Setup → Bills Setup → Credit Cards → Setup Complete → Home → Ongoing Financial Assistant');
    expect(generated.toLowerCase()).toContain('fixed');
    expect(generated.toLowerCase()).toContain('variable');
    expect(generated.toLowerCase()).toContain('expected amount');
  });
});
