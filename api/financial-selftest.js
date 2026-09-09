import generate from './generate.js';

const idea=`Build a premium mobile-first Personal Financial Assistant for one person.

Core rule: Remember the schedule. Ask for the real amount when it matters.

Primary workflow: Welcome → Income Setup → Bills Setup → Credit Cards → Setup Complete → Home.

Income: Fixed or Variable. Save payday frequency and schedule. Fixed stores the normal amount. Variable stores the schedule only and never assumes an amount. For Friday paydays, Thursday night ask how much is expected. On payday ask for and save the actual amount received.

Bills: Save name, due date, Fixed/Variable amount type, and payment method. Fixed stores the recurring amount. Variable asks for the actual amount each billing cycle. Remind 2–3 days before due. Every bill is Paid Directly or Paid by Credit Card; if paid by card, assign it to one specific saved card.

Credit Cards: Save card name and payment date and show assigned bills. Card-paid bills must never be deducted twice; they become part of the card obligation only. A few days before payment ask how much the user is paying.

Home: Show only what needs attention now: expected/actual income, upcoming direct bills, upcoming card payments, amount reminders, money remaining, next important event, and a simple monthly calendar.

Every setup Continue validates, saves, and advances. Back preserves entered information. Persist state and history with localStorage. No spreadsheets, accounting jargon, complicated dashboards, investing, taxes, business accounting, teams, or payroll.`;

const compiledPrompt=`Role
You are a Senior Product Designer and Full-Stack Application Engineer.

Build Context
Project type: App / Web App
Experience target: iOS App. This is interaction and presentation guidance only; it does not override the Creation Format above.
Visual style: Figma-Level Product Design.

Creation Format
Build one complete self-contained index.html with inline CSS and JavaScript. No React, no framework, no build step, and no extra files. The result must open and run directly in a modern browser. Target a strict mobile-first phone portrait layout approximately 360–430 px wide. No desktop dashboard layout, sidebar, wide-screen composition, multi-column desktop grid, or horizontal overflow.

Product Brief
${idea}

Execution Rules
- Treat the Product Brief as the source of truth.
- Preserve every stated purpose, workflow step, feature, condition, timing rule, validation rule, persistence rule, exclusion, and relationship.
- Preserve explicitly stated workflow order.
- Do not summarize away product logic or turn requirements into fragments.
- Do not add unrelated screens, features, accounts, dashboards, analytics, backends, or complexity.
- Make all visible controls and navigation functional.
- Before completion, test the full stated workflow.

Deliverable
Return one complete working index.html and nothing else.`;

export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 let statusCode=200;
 let payload='';
 const capture={
  status(code){statusCode=code;return this;},
  setHeader(){return this;},
  end(body){payload=body||'';return this;}
 };
 await generate({method:'POST',body:{idea,compiledPrompt,buildType:'app-web-app',creationFormat:'ios-app',visualStyle:'figma-product'}},capture);
 let parsed;
 try{parsed=JSON.parse(payload)}catch{parsed={raw:payload}}
 return res.status(statusCode).json(parsed);
}
