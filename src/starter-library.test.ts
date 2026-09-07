import { describe, expect, it } from 'vitest';
import { starterCategories } from './starter-library';

const approvedTitles = [
  'Personal Organizer','Simple Tracker','Private Notes App','Daily Routine App','Appointment Manager','Personal Inventory','Simple Record Keeper',
  'Grocery List','Bill Reminder','Habit Tracker','Simple Timesheet','Appointment Planner','Inventory Tracker','Mileage Tracker',
  'Daily Planner','Task List','Notes Organizer','Project Checklist','Focus Timer','Routine Tracker','Personal Calendar',
  'Budget Tracker','Expense Tracker','Bill Organizer','Savings Goal','Loan Tracker','Subscription Tracker','Paycheck Planner',
  'Mileage Log','Fuel Tracker','Stop Organizer','Equipment Log','Trailer Tracker','Route Checklist','Daily Driver Log'
];

describe('starter library', () => {
  it('contains the five approved categories', () => {
    expect(starterCategories.map(x => x.id)).toEqual(['app','utility','productivity','finance','trucking']);
  });

  it('contains 5 to 7 starters per category', () => {
    for (const category of starterCategories) {
      expect(category.starters.length).toBeGreaterThanOrEqual(5);
      expect(category.starters.length).toBeLessThanOrEqual(7);
    }
  });

  it('contains only approved starter titles and complete neutral briefs', () => {
    const starters = starterCategories.flatMap(category => category.starters);
    expect(starters.map(starter => starter.title)).toEqual(approvedTitles);
    for (const starter of starters) {
      expect(starter.brief.trim().length).toBeGreaterThan(30);
      expect(starter.brief).toMatch(/^Build /);
    }
  });
});
