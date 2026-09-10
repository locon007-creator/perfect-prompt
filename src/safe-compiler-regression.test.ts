import {describe,it,expect} from 'vitest';
import {buildInitialPrompt} from './generation-flow';

describe('lossless compiler path',()=>{
 it('preserves contextual negatives without false exclusion conflicts',()=>{
  const idea=`Drop & Hook Assistant\n\nHome\nShow one clear Start My Day action when no workday is active.\n\nWork Mode\nThe active stop should keep the important information together without making the page crowded.\nRoute details can be edited without losing the active workday.\nEquipment details can be edited without losing the active workday.\nCompleted stops should be easy to review without overwhelming the active-stop screen.\nDo not show route-mile statistics.`;
  const output=buildInitialPrompt(idea,{buildType:'app-web-app',creationFormat:'ios-app',visualStyle:'figma-product'});
  expect(output).toContain(idea);
  expect(output).toContain('PRODUCT BRIEF — SOURCE OF TRUTH');
  expect(output).toContain('Negative requirements are valid product rules');
  expect(output).not.toContain('Required feature excluded:');
 });
});
