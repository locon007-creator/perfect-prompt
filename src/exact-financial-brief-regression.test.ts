import { describe, expect, it } from 'vitest';
import { generate } from './compiler';

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
  visualStyle: 'figma-product' as const,
};

describe('exact financial assistant brief', () => {
  it('generates without an exclusion violation and preserves fixed/variable income logic', () => {
    expect(() => generate(brief, options)).not.toThrow();
    const output = generate(brief, options);
    expect(output).toContain('Welcome → Income Setup → Bills Setup → Credit Cards → Setup Complete → Home → Ongoing Financial Assistant');
    expect(output.toLowerCase()).toContain('fixed');
    expect(output.toLowerCase()).toContain('variable');
    expect(output.toLowerCase()).toContain('expected amount');
    expect(output).not.toContain('Exclusion violation');
  });
});
