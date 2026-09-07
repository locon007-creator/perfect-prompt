export type StarterCategoryId = 'app' | 'utility' | 'productivity' | 'finance' | 'trucking';

export type StarterIdea = Readonly<{ id: string; title: string; brief: string }>;
export type StarterCategory = Readonly<{
  id: StarterCategoryId;
  label: string;
  description: string;
  starters: readonly StarterIdea[];
}>;

const category = (id: StarterCategoryId, label: string, description: string, starters: readonly StarterIdea[]): StarterCategory =>
  Object.freeze({ id, label, description, starters: Object.freeze([...starters]) });

export const starterCategories: readonly StarterCategory[] = Object.freeze([
  category('app','App','Simple personal app ideas you can customize before generating.',[
    {id:'personal-organizer',title:'Personal Organizer',brief:'Build a personal organizer that keeps everyday tasks, reminders, and simple notes in one calm place with a clear mobile-first flow.'},
    {id:'simple-tracker',title:'Simple Tracker',brief:'Build a simple tracker for one person to record an item, update its status, and review recent history without unnecessary complexity.'},
    {id:'private-notes',title:'Private Notes App',brief:'Build a private notes app for one person with quick note creation, editing, search, and local persistence.'},
    {id:'daily-routine',title:'Daily Routine App',brief:'Build a daily routine app that lets one person create recurring routine items, mark them complete, and review today at a glance.'},
    {id:'appointment-manager',title:'Appointment Manager',brief:'Build a personal appointment manager for saving appointments, dates, times, and simple reminders in a clean mobile interface.'},
    {id:'personal-inventory',title:'Personal Inventory',brief:'Build a personal inventory app for recording household items, quantities, locations, and simple search.'},
    {id:'record-keeper',title:'Simple Record Keeper',brief:'Build a simple personal record keeper for saving dated entries, editing them, and reviewing history in a clear list.'}
  ]),
  category('utility','Utility','Practical everyday tools designed around one clear job.',[
    {id:'grocery-list',title:'Grocery List',brief:'Build a grocery list utility that lets one person quickly add items, group them, mark them complete, and reuse recent entries.'},
    {id:'bill-reminder',title:'Bill Reminder',brief:'Build a bill reminder utility for saving bill names, due dates, expected amounts, and showing what is coming up next.'},
    {id:'habit-tracker',title:'Habit Tracker',brief:'Build a simple habit tracker for one person to add habits, mark daily completion, and review streaks without social features.'},
    {id:'simple-timesheet',title:'Simple Timesheet',brief:'Build a personal timesheet utility for recording work start and end times, daily hours, and a simple weekly total.'},
    {id:'appointment-planner',title:'Appointment Planner',brief:'Build an appointment planner that saves upcoming appointments, times, locations, and basic reminders in one place.'},
    {id:'inventory-tracker',title:'Inventory Tracker',brief:'Build a lightweight inventory tracker for adding items, quantities, locations, and low-stock notes.'},
    {id:'mileage-tracker',title:'Mileage Tracker',brief:'Build a mileage tracker that records starting and ending mileage, date, purpose, and total miles for each trip.'}
  ]),
  category('productivity','Productivity','Focused tools for planning, organizing, and getting everyday work done.',[
    {id:'daily-planner',title:'Daily Planner',brief:'Build a daily planner that helps one person organize today into a short list of priorities, tasks, and appointments.'},
    {id:'task-list',title:'Task List',brief:'Build a clean personal task list with quick entry, completion, simple priorities, and a clear today view.'},
    {id:'notes-organizer',title:'Notes Organizer',brief:'Build a notes organizer with folders or tags, search, quick editing, and local persistence for one person.'},
    {id:'project-checklist',title:'Project Checklist',brief:'Build a project checklist for creating small projects, adding steps, marking progress, and reviewing what remains.'},
    {id:'focus-timer',title:'Focus Timer',brief:'Build a focus timer with a simple work timer, optional break timer, session history, and minimal distractions.'},
    {id:'routine-tracker',title:'Routine Tracker',brief:'Build a routine tracker that lets one person define repeatable routines, check off steps, and see today’s progress.'},
    {id:'personal-calendar',title:'Personal Calendar',brief:'Build a personal calendar for creating events, viewing upcoming dates, and keeping a simple private schedule.'}
  ]),
  category('finance','Finance','Personal money tools that stay simple, private, and easy to understand.',[
    {id:'budget-tracker',title:'Budget Tracker',brief:'Build a personal budget tracker for setting a monthly budget, recording spending, and seeing how much remains.'},
    {id:'expense-tracker',title:'Expense Tracker',brief:'Build an expense tracker for manually recording purchases, categories, dates, and monthly totals.'},
    {id:'bill-organizer',title:'Bill Organizer',brief:'Build a bill organizer that stores recurring bill schedules, due dates, expected amounts, and paid status.'},
    {id:'savings-goal',title:'Savings Goal',brief:'Build a savings goal tracker where one person sets a target, records contributions, and sees progress toward the goal.'},
    {id:'loan-tracker',title:'Loan Tracker',brief:'Build a simple loan tracker for recording a balance, payment dates, payment amounts, and remaining balance.'},
    {id:'subscription-tracker',title:'Subscription Tracker',brief:'Build a subscription tracker that records recurring services, renewal dates, costs, and monthly subscription totals.'},
    {id:'paycheck-planner',title:'Paycheck Planner',brief:'Build a paycheck planner that records expected paydays, actual pay received, planned bills, and money remaining.'}
  ]),
  category('trucking','Trucking','Simple personal tools for everyday driving and equipment records.',[
    {id:'mileage-log',title:'Mileage Log',brief:'Build a personal mileage log for recording date, start mileage, end mileage, trip purpose, and total miles.'},
    {id:'fuel-tracker',title:'Fuel Tracker',brief:'Build a fuel tracker for recording fuel stops, gallons, price, mileage, and recent fuel history.'},
    {id:'stop-organizer',title:'Stop Organizer',brief:'Build a simple stop organizer for saving business names, addresses, stop order, arrival status, and completion.'},
    {id:'equipment-log',title:'Equipment Log',brief:'Build an equipment log for recording truck or trailer identifiers, basic condition notes, and dated updates.'},
    {id:'trailer-tracker',title:'Trailer Tracker',brief:'Build a personal trailer tracker for saving trailer numbers, current status, location notes, and recent changes.'},
    {id:'route-checklist',title:'Route Checklist',brief:'Build a route checklist for organizing a day’s stops, checking them off in order, and reviewing what remains.'},
    {id:'daily-driver-log',title:'Daily Driver Log',brief:'Build a simple daily driver log for recording date, equipment, mileage, stops completed, and a short end-of-day summary.'}
  ])
]);

export function getStarterCategory(id: StarterCategoryId): StarterCategory {
  const found = starterCategories.find(category => category.id === id);
  if (!found) throw new Error(`Unknown starter category: ${id}`);
  return found;
}
