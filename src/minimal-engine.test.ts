import {describe,it,expect} from 'vitest';
import {buildMinimalPrompt} from './minimal-engine';

const financeBrief=`Create a premium mobile-first Personal Financial Assistant for one person.

Core rule: Remember the schedule. When the time comes, ask for the real amount.

Income Setup
- Income type: Fixed or Variable.
- Fixed: store the normal paycheck amount.
- Variable: store only the schedule; never assume an amount.
- For Friday paydays: Thursday-night reminder asking expected amount.

Bills Setup
- Remind 2–3 days before due date.
- Every bill is either “Paid Directly” or “Paid by Credit Card”.
- If paid by card → assign it to one specific saved card.

Credit Cards
- Critical rule: credit-card-paid bills are never deducted twice. They become part of the card’s obligation only.`;

describe('Minimal Engine v1',()=>{
 it('preserves complex product logic instead of parsing it into fragments',()=>{
  const out=buildMinimalPrompt(financeBrief,{buildType:'app-web-app',creationFormat:'ios-app',visualStyle:'figma-level'});
  expect(out).toContain('Fixed or Variable');
  expect(out).toContain('Thursday-night reminder');
  expect(out).toContain('2–3 days before due date');
  expect(out).toContain('Paid Directly');
  expect(out).toContain('Paid by Credit Card');
  expect(out).toContain('never deducted twice');
  expect(out).not.toContain('1. Every setup');
  expect(out).not.toContain('\nPaid.');
 });

 it('locks app/web-app output to one directly runnable HTML file even when a native selector is supplied',()=>{
  const out=buildMinimalPrompt(financeBrief,{buildType:'app-web-app',creationFormat:'ios-app',visualStyle:'figma-level'});
  expect(out).toContain('one complete self-contained index.html');
  expect(out).toContain('inline CSS and JavaScript');
  expect(out).toContain('No React');
  expect(out).toContain('no framework');
  expect(out).toContain('no build step');
  expect(out).toContain('no extra files');
  expect(out).toContain('360–430 px');
  expect(out).not.toMatch(/Creation Format\s*\n(?:.*\n){0,2}iOS App/i);
 });

 it('keeps the raw idea as the source-of-truth product brief',()=>{
  const out=buildMinimalPrompt(financeBrief,{buildType:'app-web-app'});
  expect(out).toContain('Product Brief');
  expect(out).toContain(financeBrief);
  expect(out).toContain('Treat the Product Brief as the source of truth');
 });
});