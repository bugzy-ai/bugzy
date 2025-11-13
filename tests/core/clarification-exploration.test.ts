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
    test('includes exploration instructions (Step 1.4)', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('### Step 1.4: Explore Features (If Needed)');
      expect(task.content).toContain('adaptive exploration');
      expect(task.content).toContain('understand actual feature behavior');
    });

    test('includes clarification instructions (Step 1.5)', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('### Step 1.5: Clarify Ambiguities');
      expect(task.content).toContain('CRITICAL/HIGH ambiguities');
      expect(task.content).toContain('STOP test case generation');
    });

    test('exploration comes before clarification', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);

      const explorationIndex = task.content.indexOf('Step 1.4: Explore Features');
      const clarificationIndex = task.content.indexOf('Step 1.5: Clarify Ambiguities');

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
    test('includes triage and debugging workflow', () => {
      const task = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);

      // Should have test execution and analysis workflow
      expect(task.content.toLowerCase()).toMatch(/triage|debug|fix|failure|error|analyze/);
      expect(task.content.toLowerCase()).toMatch(/step \d+/);
    });

    test('includes test-debugger-fixer integration', () => {
      const task = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);

      // Should require test-debugger-fixer
      expect(task.requiredSubAgentRoles).toContain('test-debugger-fixer');

      // Should reference debugging/fixing concepts
      expect(task.content.toLowerCase()).toMatch(/debug|fix|error|failure/);
    });

    test('includes test execution and analysis steps', () => {
      const task = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);

      // Should have structured workflow steps
      expect(task.content).toMatch(/### Step \d+:/);
      expect(task.content.toLowerCase()).toMatch(/execute|run|test/);
      expect(task.content.toLowerCase()).toMatch(/result|failure|pass|fail/);
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
  test('no unreplaced placeholder variables in operational content', () => {
    const tasks = [
      TASK_SLUGS.GENERATE_TEST_CASES,
      TASK_SLUGS.GENERATE_TEST_PLAN,
      TASK_SLUGS.RUN_TESTS,
      TASK_SLUGS.PROCESS_EVENT,
    ];

    tasks.forEach(taskSlug => {
      const task = buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG);

      // Should NOT contain unreplaced subagent instruction placeholders
      expect(task.content).not.toMatch(/\{\{[A-Z_]+_INSTRUCTIONS\}\}/);
    });

    // EXPLORE_APPLICATION may contain {{STEP_NUMBER}} in reference/documentation sections
    // but should not have unreplaced subagent placeholders
    const exploreTask = buildTaskDefinition(TASK_SLUGS.EXPLORE_APPLICATION, FULL_SUBAGENTS_CONFIG);
    expect(exploreTask.content).not.toMatch(/\{\{[A-Z_]+_INSTRUCTIONS\}\}/);
  });

  test('tasks have proper step structure', () => {
    const tasks = [
      TASK_SLUGS.GENERATE_TEST_CASES,
      TASK_SLUGS.GENERATE_TEST_PLAN,
      TASK_SLUGS.RUN_TESTS,
    ];

    tasks.forEach(taskSlug => {
      const task = buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG);

      // Should have structured steps
      expect(task.content).toMatch(/### Step \d+:/);
      expect(task.content).toContain('## Process');
    });
  });
});

describe('Backwards Compatibility', () => {
  test('tasks without exploration/clarification still work', () => {
    // verify-changes task uses core template which includes exploration/clarification
    const task = buildTaskDefinition(TASK_SLUGS.VERIFY_CHANGES, FULL_SUBAGENTS_CONFIG);

    expect(task).toBeDefined();
    expect(task.slug).toBe(TASK_SLUGS.VERIFY_CHANGES);
    // Should contain core workflow content
    expect(task.content).toContain('Verify Changes');
    expect(task.content).toContain('## Overview');
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

    const exploration = task.content.indexOf('Step 1.4: Explore Features');
    const clarification = task.content.indexOf('Step 1.5: Clarify Ambiguities');
    const generation = task.content.indexOf('### Step 1.7: Generate All Manual Test Case Files');

    expect(exploration).toBeGreaterThan(-1);
    expect(clarification).toBeGreaterThan(exploration);
    expect(generation).toBeGreaterThan(clarification);
  });

  test('run-tests: has test execution → bug reporting workflow', () => {
    const task = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);

    // Should have workflow steps
    expect(task.content).toMatch(/### Step \d+:/);

    // Should contain test execution and debugging concepts
    expect(task.content.toLowerCase()).toMatch(/execute|run|test/);
    expect(task.content.toLowerCase()).toMatch(/debug|fix|error|failure/);

    // Should mention bug reporting/tracking
    expect(task.content.toLowerCase()).toMatch(/bug|issue|report/);
  });
});
