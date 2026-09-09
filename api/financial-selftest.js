import generate from './generate.js';

const idea=`Build a premium mobile-first Personal Financial Assistant for one person.

Its main job is to help the user manage real income received, bills due and paid, credit card payments, and money remaining without spreadsheets or accounting language.

Core rule: Remember the schedule. Ask for the real amount when it matters.

Primary workflow: Welcome → Income Setup → Bills Setup → Credit Cards → Setup Complete → Home

Income Setup: Save payday frequency and payday schedule. On payday, Home should ask: “How much did you get paid today?” Save the actual amount received.

Bills Setup: Add regular bills with bill name and due date. At the beginning of each billing period, ask for the actual bill amount when needed. Track upcoming, due, and paid status.

Credit Cards: Save card names and payment dates. A few days before payment, ask: “How much are you paying [card] this month?”

Home: Show only what needs attention now: today’s income question, upcoming bills, card payments, money available after known payments, and the next important financial event.

Include a simple monthly calendar showing paydays, bill due dates, and card payment dates.

Every setup screen must have one clear Continue button that validates, saves, and immediately moves forward. Back preserves entered information.

Keep it private, calm, simple, and personal. No investing, taxes, business accounting, teams, payroll processing, or complicated dashboards.`;

const compiledPrompt=`Role

You are a senior product designer and Full-Stack Application Engineer. Also act as a Product Design Lead and Design Systems Specialist.

Product Mission

Build premium mobile-first Personal Financial Assistant for one person. Primary job: premium mobile-first Personal Financial Assistant.

Idea Lock

Project type: App / Web App
Creation format: iOS App
Project name: premium mobile-first Personal Financial Assistant
Primary job: premium mobile-first Personal Financial Assistant
Target user: one person
Platform / medium: iOS

Target User

Primary audience: one person.
Keep product decisions grounded in this stated audience; do not broaden it to unrelated user groups.

Platform

iOS
Creation format: iOS App.
Use iOS/mobile interaction conventions with touch-friendly controls and clear navigation hierarchy.
Prefer native-feeling sheets, navigation bars, safe-area spacing, and portrait-first layouts.
Avoid desktop dashboard patterns unless explicitly requested.

Main Workflow

Welcome → Income Setup → Bills Setup → Credit Cards → Setup Complete → Home

Structure Requirements

1. Every setup
2. Welcome
3. Income Setup
4. Bills Setup
5. Credit Cards
6. Setup Complete
7. Home

Core Features

Record bill due dates.
Record card payment dates.
Include a simple monthly calendar showing paydays, bill due dates, and card payment dates.
Add regular bills with bill name and due date. At the beginning of each billing period, ask for the actual bill amount when needed. Track upcoming, due, and paid status in Bills Setup.
Show only what needs attention now: today’s income question, upcoming bills, card payments, money available after known payments, and the next important financial event in Home.
Keep it private, calm, simple, and personal in Home.

Interaction & State Rules

Save payday frequency and payday schedule. On payday, Home should ask: “How much did you get paid today?” Save the actual amount received.
Save card names and payment dates. A few days before payment, ask: “How much are you paying [card] this month?”.

Settings

Theme: Light / Dark / Automatic.
Manage recurring financial items.
Income schedule.
Data management.

Visual Direction

Systematic hierarchy.
Component consistency.
Layout rhythm.
Responsive product UI.
Design tokens.
Handoff-ready polish.

Build Quality & Brand Experience

Create a coherent visual identity and product-specific brand language that can be expressed through a simple mark, wordmark, icon system, and reusable design tokens.
Make the first screen a polished design-system showcase that communicates the primary job without unnecessary dashboard density.
Use component consistency, deliberate interaction states, and polished micro-interactions across controls, sheets, dialogs, and navigation.
Reject generic template patterns and placeholder styling; every reusable component should look production-ready and product-specific.

Constraints

Build the first version as one complete single self-contained index.html with inline CSS and JavaScript unless the locked idea explicitly requests another stack; Multiple screens must behave as fully functional app views with the navigation, interaction, state, persistence, forms, sheets, dialogs, and timers the locked requirements need.
Keep the first version directly runnable and previewable without a build step, with logic organized so it can be split into multiple files later if the product grows.

Do Not Add

Spreadsheets.
Accounting language.
Investing.
Taxes.
Business accounting.
Teams.
Payroll processing.
Complicated dashboards.

Completion Standard

Implement every locked requirement, preserve the explicitly provided workflow, and add no unrequested screens or features.`;

export default async function handler(req,res){
 if(req.method!=='GET'){res.status(405).end('Method not allowed');return;}
 let status=200;let headers={};let body='';
 const fakeRes={status(code){status=code;return this;},setHeader(k,v){headers[k]=v;return this;},end(value=''){body=String(value);return this;}};
 await generate({method:'POST',body:{idea,compiledPrompt,buildType:'App / Web App',creationFormat:'iOS App',visualStyle:'premium mobile-first'}},fakeRes);
 res.status(status);Object.entries(headers).forEach(([k,v])=>res.setHeader(k,v));res.end(body);
}
