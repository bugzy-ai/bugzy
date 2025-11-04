/**
 * Clarification and Exploration Protocol Tests
 * Validates that exploration and clarification templates are properly integrated
 */

import { describe, test, expect } from 'vitest';
import { buildTaskDefinition } from '../../src/core/task-builder';
import { TASK_SLUGS } from '../../src/tasks/constants';
import { FULL_SUBAGENTS_CONFIG } from '../fixtures/repo-configs';

describe('Exploration Protocol Integration', () => {
  describe('generate-test-cases', () => {
    test('includes exploration instructions (Step 1.5)', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('### Step 1.5: Explore Features (If Needed)');
      expect(task.content).toContain('adaptive exploration');
      expect(task.content).toContain('understand actual feature behavior');
    });

    test('includes clarification instructions (Step 1.6)', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('### Step 1.6: Clarify Ambiguities');
      expect(task.content).toContain('CRITICAL/HIGH ambiguities');
      expect(task.content).toContain('STOP test case generation');
    });

    test('exploration comes before clarification', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);

      const explorationIndex = task.content.indexOf('Step 1.5: Explore Features');
      const clarificationIndex = task.content.indexOf('Step 1.6: Clarify Ambiguities');

      expect(explorationIndex).toBeLessThan(clarificationIndex);
      expect(explorationIndex).toBeGreaterThan(-1);
      expect(clarificationIndex).toBeGreaterThan(-1);
    });

    test('includes severity-based handling instructions', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('[ASSUMED: reason]');
      expect(task.content).toContain('[TO BE CLARIFIED: detail]');
      expect(task.content).toContain('MEDIUM ambiguities');
      expect(task.content).toContain('LOW ambiguities');
    });
  });

  describe('generate-test-plan', () => {
    test('includes exploration instructions (Step 1.7)', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_PLAN, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('### Step 1.7: Explore Product (If Needed)');
      expect(task.content).toContain('understand actual product features');
    });

    test('includes clarification instructions (Step 1.8)', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_PLAN, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('### Step 1.8: Clarify Ambiguities');
      expect(task.content).toContain('STOP test plan generation');
    });

    test('includes example ambiguities by severity', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_PLAN, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('Undefined core features');
      expect(task.content).toContain('Missing field lists');
      expect(task.content).toContain('Optional features');
    });
  });

  describe('explore-application', () => {
    test('includes Step 0 referencing exploration protocol', () => {
      const task = buildTaskDefinition(TASK_SLUGS.EXPLORE_APPLICATION, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('### Step 0: Understand Exploration Protocol');
      expect(task.content).toContain('implements the exploration protocol');
    });

    test('documents depth alignment with template', () => {
      const task = buildTaskDefinition(TASK_SLUGS.EXPLORE_APPLICATION, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('Shallow exploration (15-20 min)');
      expect(task.content).toContain('Deep exploration (45-60 min)');
      expect(task.content).toContain('Aligns with');
    });

    test('includes full exploration protocol reference', () => {
      const task = buildTaskDefinition(TASK_SLUGS.EXPLORE_APPLICATION, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('Full Exploration Protocol Reference');
      expect(task.content).toContain('Step {{STEP_NUMBER}}.1');
    });
  });

  describe('run-tests (Triage)', () => {
    test('includes Step 6.0 triage with exploration and clarification', () => {
      const task = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('#### 6.0');
      expect(task.content).toContain('Triage Failed Tests');
      expect(task.content).toContain('exploration and clarification');
    });

    test('triage includes exploration step', () => {
      const task = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('**Step 1: Quick Exploration**');
      expect(task.content).toContain('actual vs. expected behavior');
    });

    test('triage includes clarification step', () => {
      const task = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('**Step 2: Assess Ambiguity and Clarify**');
      expect(task.content).toContain('whether this is a bug');
    });

    test('triage includes classification step', () => {
      const task = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('**Step 3: Classify the Failure**');
      expect(task.content).toContain('Confirmed Bug');
      expect(task.content).toContain('Test Needs Update');
      expect(task.content).toContain('Known Issue');
      expect(task.content).toContain('Unclear/Blocked');
    });

    test('references TODO-456 case as example', () => {
      const task = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('TODO-456');
      expect(task.content).toContain('fix sorting');
    });
  });

  describe('process-event', () => {
    test('includes Step 1.5 for clarifying unclear events', () => {
      const task = buildTaskDefinition(TASK_SLUGS.PROCESS_EVENT, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('### Step 1.5: Clarify Unclear Events');
      expect(task.content).toContain('incomplete or ambiguous');
    });

    test('includes ambiguity severity classification', () => {
      const task = buildTaskDefinition(TASK_SLUGS.PROCESS_EVENT, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('🔴 CRITICAL');
      expect(task.content).toContain('🟠 HIGH');
      expect(task.content).toContain('🟡 MEDIUM');
      expect(task.content).toContain('🟢 LOW');
    });

    test('includes clarification examples for events', () => {
      const task = buildTaskDefinition(TASK_SLUGS.PROCESS_EVENT, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('login issue');
      expect(task.content).toContain('Login button not responding');
      expect(task.content).toContain('Authentication service failure');
    });
  });

  describe('handle-message', () => {
    test('includes updated memory format with severity tracking', () => {
      const task = buildTaskDefinition(TASK_SLUGS.HANDLE_MESSAGE, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('**Severity**: [CRITICAL/HIGH/MEDIUM/LOW]');
      expect(task.content).toContain('Original uncertainty/ambiguity');
    });

    test('includes Step 6.4 for clarification history', () => {
      const task = buildTaskDefinition(TASK_SLUGS.HANDLE_MESSAGE, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('#### 6.4 Update Clarification History');
      expect(task.content).toContain('support the clarification protocol');
    });

    test('includes clarification effectiveness tracking', () => {
      const task = buildTaskDefinition(TASK_SLUGS.HANDLE_MESSAGE, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('Clarification effectiveness by severity');
      expect(task.content).toContain('Most effective question formats per severity');
    });

    test('includes example indexing by topic', () => {
      const task = buildTaskDefinition(TASK_SLUGS.HANDLE_MESSAGE, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('Authentication & Login');
      expect(task.content).toContain('Ordering & Sorting');
      expect(task.content).toContain('TODO-456');
    });
  });
});

describe('Template Variable Replacement', () => {
  test('EXPLORATION_INSTRUCTIONS template is properly replaced', () => {
    const tasks = [
      TASK_SLUGS.GENERATE_TEST_CASES,
      TASK_SLUGS.GENERATE_TEST_PLAN,
    ];

    tasks.forEach(taskSlug => {
      const task = buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG);

      // Should contain step numbers (replaced from {{STEP_NUMBER}})
      // Format: Step X.Y.1, Step X.Y.2, etc.
      expect(task.content).toMatch(/Step \d+\.\d+\.\d+:/);

      // Should NOT contain unreplaced template variables
      expect(task.content).not.toContain('{{STEP_NUMBER}}');
    });

    // run-tests uses a different numbering format in triage (Step 1, Step 2, Step 3)
    const runTestsTask = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);
    expect(runTestsTask.content).toContain('**Step 1: Quick Exploration**');
    expect(runTestsTask.content).not.toContain('{{STEP_NUMBER}}');
  });

  test('CLARIFICATION_INSTRUCTIONS template is properly replaced', () => {
    const tasks = [
      TASK_SLUGS.GENERATE_TEST_CASES,
      TASK_SLUGS.GENERATE_TEST_PLAN,
      TASK_SLUGS.RUN_TESTS,
    ];

    tasks.forEach(taskSlug => {
      const task = buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG);

      // Should contain clarification content
      expect(task.content).toContain('Ambiguity');
      expect(task.content).toContain('Severity');

      // Should NOT contain unreplaced template variables
      expect(task.content).not.toContain('{{STEP_NUMBER}}');
    });
  });
});

describe('Backwards Compatibility', () => {
  test('tasks without exploration/clarification still work', () => {
    // verify-changes tasks use core template which includes exploration/clarification
    const task = buildTaskDefinition(TASK_SLUGS.VERIFY_CHANGES_MANUAL, FULL_SUBAGENTS_CONFIG);

    expect(task).toBeDefined();
    expect(task.slug).toBe(TASK_SLUGS.VERIFY_CHANGES_MANUAL);
    // Should contain core workflow content
    expect(task.content).toContain('Verify Changes');
    expect(task.content).toContain('## Context');
  });

  test('all tasks still build without errors', () => {
    const allTasks = Object.values(TASK_SLUGS);

    allTasks.forEach(taskSlug => {
      expect(() => {
        buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG);
      }).not.toThrow();
    });
  });
});

describe('Protocol Flow Validation', () => {
  test('generate-test-cases: exploration → clarification → generation', () => {
    const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);

    const exploration = task.content.indexOf('Step 1.5: Explore Features');
    const clarification = task.content.indexOf('Step 1.6: Clarify Ambiguities');
    const generation = task.content.indexOf('### Step 2: Generate Test Cases');

    expect(exploration).toBeGreaterThan(-1);
    expect(clarification).toBeGreaterThan(exploration);
    expect(generation).toBeGreaterThan(clarification);
  });

  test('run-tests: triage → report bugs', () => {
    const task = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);

    const triage = task.content.indexOf('#### 6.0');
    const report = task.content.indexOf('#### 6.1 Identify Bugs to Report');

    expect(triage).toBeGreaterThan(-1);
    expect(report).toBeGreaterThan(triage);
  });
});
