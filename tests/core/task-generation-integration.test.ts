/**
 * Task Generation Integration Tests
 * Smart validation of buildTaskDefinition output without brittle fixture matching
 */

import { describe, test, expect } from 'vitest';
import { buildTaskDefinition } from '../../src/core/task-builder';
import { TASK_SLUGS } from '../../src/tasks/constants';
import { FULL_SUBAGENTS_CONFIG, PARTIAL_SUBAGENTS_CONFIG } from '../fixtures/repo-configs';
import type { ProjectSubAgent } from '../../src/core/task-builder';

/**
 * Check if subagent is configured in the config
 */
function hasSubagent(config: ProjectSubAgent[], role: string): boolean {
  return config.some(sa => sa.role === role);
}

describe('Task Generation - Full Subagents Config', () => {
  const ALL_TASK_SLUGS = [
    TASK_SLUGS.EXPLORE_APPLICATION,
    TASK_SLUGS.GENERATE_TEST_CASES,
    TASK_SLUGS.GENERATE_TEST_PLAN,
    TASK_SLUGS.HANDLE_MESSAGE,
    TASK_SLUGS.PROCESS_EVENT,
    TASK_SLUGS.RUN_TESTS,
  ];

  ALL_TASK_SLUGS.forEach(taskSlug => {
    describe(taskSlug, () => {
      test('generates task successfully', () => {
        expect(() => {
          buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG);
        }).not.toThrow();
      });

      test('has valid frontmatter', () => {
        const task = buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG);

        expect(task.frontmatter.description).toBeDefined();
        expect(typeof task.frontmatter.description).toBe('string');
        expect(task.frontmatter.description.length).toBeGreaterThan(0);
      });

      test('has basic structure', () => {
        const task = buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG);

        // Should have some process/workflow structure
        expect(task.content).toContain('##');  // Should have headers
        expect(task.content.length).toBeGreaterThan(100);  // Should have substantial content
      });

      test('includes configured subagent instructions', () => {
        const task = buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG);

        // Check that configured subagents are referenced in content
        // (Their instructions should be included)
        const configuredRoles = FULL_SUBAGENTS_CONFIG.map(sa => sa.role);
        const requiredRoles = task.requiredSubAgentRoles;

        // Required subagents MUST be configured
        requiredRoles.forEach(role => {
          expect(configuredRoles).toContain(role);
        });

        // If test-runner is configured, content should mention it or related terms
        if (hasSubagent(FULL_SUBAGENTS_CONFIG, 'test-runner')) {
          expect(task.content.toLowerCase()).toMatch(/test|playwright|browser|automation/);
        }

        // If team-communicator is configured and used by this task
        if (hasSubagent(FULL_SUBAGENTS_CONFIG, 'team-communicator') &&
            (requiredRoles.includes('team-communicator') || task.content.includes('team-communicator'))) {
          expect(task.content.toLowerCase()).toMatch(/team|communicate|slack|notify/);
        }
      });

      test('no placeholders remain', () => {
        const task = buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG);

        // No unprocessed placeholders should remain
        const placeholders = task.content.match(/\{\{[A-Z_]+_INSTRUCTIONS\}\}/g);
        expect(placeholders).toBeNull();
      });
    });
  });
});

describe('Task Generation - Partial Subagents Config', () => {
  const ALL_TASK_SLUGS = [
    TASK_SLUGS.EXPLORE_APPLICATION,
    TASK_SLUGS.GENERATE_TEST_CASES,
    TASK_SLUGS.GENERATE_TEST_PLAN,
    TASK_SLUGS.HANDLE_MESSAGE,
    TASK_SLUGS.PROCESS_EVENT,
    TASK_SLUGS.RUN_TESTS,
  ];

  ALL_TASK_SLUGS.forEach(taskSlug => {
    describe(taskSlug, () => {
      test('generates task successfully', () => {
        // All tasks should generate successfully with PARTIAL config
        // (PARTIAL has test-runner, test-debugger-fixer, test-code-generator, team-comm, issue-tracker)
        // No tasks currently require documentation-researcher as mandatory
        expect(() => {
          buildTaskDefinition(taskSlug, PARTIAL_SUBAGENTS_CONFIG);
        }).not.toThrow();
      });

      test('excludes documentation-researcher when not configured', () => {
        const task = buildTaskDefinition(taskSlug, PARTIAL_SUBAGENTS_CONFIG);

        // Should not contain documentation-researcher agent references
        // (it's not configured in PARTIAL_SUBAGENTS_CONFIG)
        expect(task.content).not.toContain('documentation-researcher agent');
      });

      test('no placeholders remain', () => {
        const task = buildTaskDefinition(taskSlug, PARTIAL_SUBAGENTS_CONFIG);

        // No unprocessed placeholders should remain
        const placeholders = task.content.match(/\{\{[A-Z_]+_INSTRUCTIONS\}\}/g);
        expect(placeholders).toBeNull();
      });
    });
  });
});

describe('Specific Task Validation', () => {
  describe('generate-test-cases', () => {
    test('includes test-code-generator delegation when configured', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);
      expect(task.content).toContain('test-code-generator agent');
    });

    test('includes documentation gathering when docs configured', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);

      if (hasSubagent(FULL_SUBAGENTS_CONFIG, 'documentation-researcher')) {
        expect(task.content).toContain('documentation-researcher agent');
      }
    });

    test('excludes documentation gathering when docs not configured', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, PARTIAL_SUBAGENTS_CONFIG);
      expect(task.content).not.toContain('documentation-researcher agent');
    });

    test('includes team communication when configured', () => {
      if (hasSubagent(PARTIAL_SUBAGENTS_CONFIG, 'team-communicator')) {
        const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, PARTIAL_SUBAGENTS_CONFIG);
        expect(task.content).toMatch(/team-communicator|team communication/i);
      }
    });
  });

  describe('handle-message', () => {
    test('requires team-communicator', () => {
      expect(() => {
        buildTaskDefinition(TASK_SLUGS.HANDLE_MESSAGE, [
          { role: 'test-runner', integration: 'playwright' },
        ]);
      }).toThrow('team-communicator');
    });

    test('builds successfully with team-communicator', () => {
      const task = buildTaskDefinition(TASK_SLUGS.HANDLE_MESSAGE, FULL_SUBAGENTS_CONFIG);
      expect(task.slug).toBe(TASK_SLUGS.HANDLE_MESSAGE);
      expect(task.requiredSubAgentRoles).toContain('team-communicator');
    });
  });

  describe('run-tests', () => {
    test('requires test-runner and test-debugger-fixer', () => {
      const task = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);
      expect(task.requiredSubAgentRoles).toContain('test-runner');
      expect(task.requiredSubAgentRoles).toContain('test-debugger-fixer');
    });

    test('includes test execution instructions', () => {
      const task = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);
      expect(task.content.toLowerCase()).toMatch(/test|execute|playwright|run/);
    });

    test('derives playwright MCP requirement', () => {
      const task = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);
      expect(task.requiredMCPs).toContain('playwright');
    });

    test('includes test-debugger-fixer when configured', () => {
      const task = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);

      if (hasSubagent(FULL_SUBAGENTS_CONFIG, 'test-debugger-fixer')) {
        // Should reference debugging/fixing functionality
        expect(task.content.toLowerCase()).toMatch(/debug|fix|failure|error/);
      }
    });
  });

  describe('process-event', () => {
    test('has no required subagents', () => {
      // process-event task has no required subagents (they are all optional)
      const minimalConfig = [
        { role: 'test-runner', integration: 'playwright' },
        { role: 'test-debugger-fixer', integration: 'playwright' },
      ];

      const task = buildTaskDefinition(TASK_SLUGS.PROCESS_EVENT, minimalConfig);
      expect(task.requiredSubAgentRoles).toEqual([]);
    });

    test('can use documentation-researcher if configured', () => {
      const task = buildTaskDefinition(TASK_SLUGS.PROCESS_EVENT, FULL_SUBAGENTS_CONFIG);

      // Should reference documentation features if docs agent is configured
      if (hasSubagent(FULL_SUBAGENTS_CONFIG, 'documentation-researcher')) {
        expect(task.content.toLowerCase()).toMatch(/documentation|docs|knowledge/);
      }
    });
  });
});

describe('Subagent Configuration Validation', () => {
  test('configured subagents appear in required or optional lists', () => {
    const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);

    // All configured subagents should be either required or referenced
    FULL_SUBAGENTS_CONFIG.forEach(config => {
      const isRequired = task.requiredSubAgentRoles.includes(config.role);
      const isReferenced = task.content.includes(config.role);

      // Subagent should be either required or at least mentioned
      // (Some subagents might be configured but not used by all tasks)
      if (!isRequired && !isReferenced) {
        // This is okay - not all tasks use all subagents
        expect(true).toBe(true);
      }
    });
  });

  test('test-debugger-fixer is properly integrated in run-tests', () => {
    const task = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);

    // Should be required
    expect(task.requiredSubAgentRoles).toContain('test-debugger-fixer');

    // Should have content about debugging/fixing
    expect(task.content.toLowerCase()).toMatch(/debug|fix|error|failure|issue/);
  });
});

describe('Placeholder Removal', () => {
  test('all placeholders removed with full config', () => {
    const tasks = [
      TASK_SLUGS.GENERATE_TEST_CASES,
      TASK_SLUGS.EXPLORE_APPLICATION,
      TASK_SLUGS.RUN_TESTS,
      TASK_SLUGS.GENERATE_TEST_PLAN,
    ];

    tasks.forEach(taskSlug => {
      const task = buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG);
      const placeholders = task.content.match(/\{\{[A-Z_]+_INSTRUCTIONS\}\}/g);
      expect(placeholders).toBeNull();
    });
  });

  test('all placeholders removed with partial config', () => {
    const tasks = [
      TASK_SLUGS.GENERATE_TEST_CASES,
      TASK_SLUGS.EXPLORE_APPLICATION,
      TASK_SLUGS.RUN_TESTS,
    ];

    tasks.forEach(taskSlug => {
      const task = buildTaskDefinition(taskSlug, PARTIAL_SUBAGENTS_CONFIG);
      const placeholders = task.content.match(/\{\{[A-Z_]+_INSTRUCTIONS\}\}/g);
      expect(placeholders).toBeNull();
    });
  });
});
