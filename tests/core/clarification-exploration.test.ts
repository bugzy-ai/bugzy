/**
 * Clarification and Exploration Protocol Tests
 * Validates that exploration and clarification templates are properly integrated
 */

import { describe, test, expect } from 'vitest';
import { buildTaskDefinition } from '../../src/core/task-builder';
import { TASK_SLUGS } from '../../src/tasks/constants';
import { FULL_SUBAGENTS_CONFIG } from '../fixtures/repo-configs';

describe('Exploration Protocol Integration', () => {
  describe('generate-test-cases (composed)', () => {
    test('includes exploration instructions', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);

      // Step number is auto-generated, use regex to match
      expect(task.content).toMatch(/### Step \d+: Explore Features \(If Needed\)/);
      expect(task.content).toContain('adaptive exploration');
      expect(task.content).toContain('understand actual feature behavior');
    });

    test('includes clarification instructions', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);

      // Step number is auto-generated, use regex to match
      expect(task.content).toMatch(/### Step \d+: Clarify Ambiguities/);
      expect(task.content).toContain('CRITICAL/HIGH ambiguities');
      expect(task.content).toContain('STOP test case generation');
    });

    test('exploration comes before clarification', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);

      const explorationIndex = task.content.indexOf('Explore Features (If Needed)');
      const clarificationIndex = task.content.indexOf('Clarify Ambiguities');

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

  describe('generate-test-plan (composed)', () => {
    test('includes exploration instructions', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_PLAN, FULL_SUBAGENTS_CONFIG);

      // Step number is auto-generated, use regex to match
      expect(task.content).toMatch(/### Step \d+: Explore Product \(If Needed\)/);
      expect(task.content).toContain('understand actual product features');
    });

    test('includes clarification instructions', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_PLAN, FULL_SUBAGENTS_CONFIG);

      // Step number is auto-generated, use regex to match
      expect(task.content).toMatch(/### Step \d+: Clarify Ambiguities/);
      expect(task.content).toContain('STOP test plan generation');
    });

    test('includes example ambiguities by severity', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_PLAN, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('Undefined core features');
      expect(task.content).toContain('Missing field lists');
      expect(task.content).toContain('Optional features');
    });
  });

  describe('explore-application (composed)', () => {
    test('includes overview and description', () => {
      const task = buildTaskDefinition(TASK_SLUGS.EXPLORE_APPLICATION, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('Explore Application Overview');
      expect(task.content).toContain('test-runner agent');
    });

    test('includes focus area strategy step', () => {
      const task = buildTaskDefinition(TASK_SLUGS.EXPLORE_APPLICATION, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('Define Focus Area');
      expect(task.content).toContain('auth');
      expect(task.content).toContain('navigation');
      expect(task.content).toContain('search');
    });

    test('includes exploration steps at various depths', () => {
      const task = buildTaskDefinition(TASK_SLUGS.EXPLORE_APPLICATION, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('Quick Exploration');
      expect(task.content).toContain('Moderate Exploration');
      expect(task.content).toContain('Deep Exploration');
    });

    test('includes execution and update steps', () => {
      const task = buildTaskDefinition(TASK_SLUGS.EXPLORE_APPLICATION, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('Create Exploration Test Case');
      expect(task.content).toContain('Run Exploration');
      expect(task.content).toContain('Process Exploration Results');
      expect(task.content).toContain('Update Exploration Artifacts');
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

  describe('process-event (composed)', () => {
    test('includes clarify unclear events step', () => {
      const task = buildTaskDefinition(TASK_SLUGS.PROCESS_EVENT, FULL_SUBAGENTS_CONFIG);

      // Step number is auto-generated, use regex to match
      expect(task.content).toMatch(/### Step \d+: Clarify Unclear Events/);
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

  describe('handle-message (composed)', () => {
    test('includes intent detection step', () => {
      const task = buildTaskDefinition(TASK_SLUGS.HANDLE_MESSAGE, FULL_SUBAGENTS_CONFIG);

      // Step number is auto-generated, use regex to match
      expect(task.content).toMatch(/### Step \d+: Detect Message Intent and Load Handler/);
      expect(task.content).toContain('intent');
    });

    test('includes valid intent values', () => {
      const task = buildTaskDefinition(TASK_SLUGS.HANDLE_MESSAGE, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('`question`');
      expect(task.content).toContain('`feedback`');
      expect(task.content).toContain('`status`');
    });

    test('includes handler file loading', () => {
      const task = buildTaskDefinition(TASK_SLUGS.HANDLE_MESSAGE, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('.bugzy/runtime/handlers/messages/{intent}.md');
      expect(task.content).toContain('question.md');
      expect(task.content).toContain('feedback.md');
      expect(task.content).toContain('status.md');
    });

    test('includes fallback intent detection table', () => {
      const task = buildTaskDefinition(TASK_SLUGS.HANDLE_MESSAGE, FULL_SUBAGENTS_CONFIG);

      expect(task.content).toContain('Fallback Intent Detection');
      expect(task.content).toContain('| Condition | Intent |');
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

  test('all tasks are now composed and have proper step structure', () => {
    // All tasks have been migrated to composed format
    // Composed tasks have sequential Step N headers, not "## Process\n" as standalone header
    const composedTasks = [
      TASK_SLUGS.GENERATE_TEST_CASES,
      TASK_SLUGS.GENERATE_TEST_PLAN,
      TASK_SLUGS.HANDLE_MESSAGE,
      TASK_SLUGS.PROCESS_EVENT,
      TASK_SLUGS.RUN_TESTS,
      TASK_SLUGS.VERIFY_CHANGES,
      TASK_SLUGS.EXPLORE_APPLICATION,
      TASK_SLUGS.ONBOARD_TESTING,
    ];

    composedTasks.forEach(taskSlug => {
      const task = buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG);

      // Should have auto-numbered step headers
      expect(task.content).toMatch(/### Step \d+:/);
      // Should NOT have legacy "## Process\n" standalone header (but "## Process Exploration Results" is OK)
      expect(task.content).not.toMatch(/## Process\n/);
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

    // Use step titles without hardcoded numbers (composed tasks use auto-numbering)
    const exploration = task.content.indexOf('Explore Features (If Needed)');
    const clarification = task.content.indexOf('Clarify Ambiguities');
    const generation = task.content.indexOf('Generate All Manual Test Case Files');

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
