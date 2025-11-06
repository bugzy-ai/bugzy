/**
 * Task Generation Integration Tests
 * Compares buildTaskDefinition output against actual repository command files
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import matter from 'gray-matter';
import { describe, test, expect } from 'vitest';
import { buildTaskDefinition } from '../../src/core/task-builder';
import { TASK_SLUGS } from '../../src/tasks/constants';
import { FULL_SUBAGENTS_CONFIG, PARTIAL_SUBAGENTS_CONFIG } from '../fixtures/repo-configs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fixture paths (copied from actual repos)
const FULL_SUBAGENTS_PATH = '../fixtures/full-subagents';
const PARTIAL_SUBAGENTS_PATH = '../fixtures/partial-subagents';

/**
 * Read command file from fixtures
 */
function readFixtureCommand(fixturePath: string, taskSlug: string): { frontmatter: any; content: string } {
  const filePath = join(__dirname, fixturePath, `${taskSlug}.md`);
  const fileContent = readFileSync(filePath, 'utf-8');
  const parsed = matter(fileContent);
  return {
    frontmatter: parsed.data,
    content: parsed.content,
  };
}

/**
 * Normalize content for comparison
 * Removes extra whitespace and normalizes line endings
 */
function normalizeContent(content: string): string {
  return content
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n') // Collapse multiple blank lines
    .replace(/[ \t]+$/gm, ''); // Remove trailing whitespace
}

/**
 * Extract key sections from command content for structural comparison
 */
function extractKeySections(content: string): {
  hasSecurityNotice: boolean;
  hasDocs: boolean;
  hasTeamComm: boolean;
  stepCount: number;
} {
  const normalized = normalizeContent(content);

  return {
    hasSecurityNotice: normalized.includes('## SECURITY NOTICE') || normalized.includes('**CRITICAL**'),
    hasDocs: normalized.includes('documentation-researcher'),
    hasTeamComm: normalized.includes('team-communicator'),
    stepCount: (normalized.match(/### Step \d+:/g) || []).length,
  };
}

describe('Task Generation Integration - Full Subagents (all 4: docs, issue, team, test)', () => {
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

      test('frontmatter matches fixture', () => {
        const generated = buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG);
        const actual = readFixtureCommand(FULL_SUBAGENTS_PATH, taskSlug);

        expect(generated.frontmatter.description).toBe(actual.frontmatter.description);
        expect(generated.frontmatter['allowed-tools']).toBe(actual.frontmatter['allowed-tools']);
        expect(generated.frontmatter['argument-hint']).toBe(actual.frontmatter['argument-hint']);
      });

      test('has same structural sections', () => {
        const generated = buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG);
        const actual = readFixtureCommand(FULL_SUBAGENTS_PATH, taskSlug);

        const generatedSections = extractKeySections(generated.content);
        const actualSections = extractKeySections(actual.content);

        expect(generatedSections.hasSecurityNotice).toBe(actualSections.hasSecurityNotice);
        expect(generatedSections.hasDocs).toBe(actualSections.hasDocs);
        expect(generatedSections.hasTeamComm).toBe(actualSections.hasTeamComm);
      });

      test('content similarity check', () => {
        const generated = buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG);
        const actual = readFixtureCommand(FULL_SUBAGENTS_PATH, taskSlug);

        const generatedNorm = normalizeContent(generated.content);
        const actualNorm = normalizeContent(actual.content);

        // Check key instruction phrases are present in both
        const keyPhrases = [
          '## Process',
          'Step 1:',
        ];

        keyPhrases.forEach(phrase => {
          const inGenerated = generatedNorm.includes(phrase);
          const inActual = actualNorm.includes(phrase);
          expect(inGenerated).toBe(inActual);
        });
      });

      test('full content matches fixture', () => {
        const generated = buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG);
        const actual = readFixtureCommand(FULL_SUBAGENTS_PATH, taskSlug);

        const generatedNorm = normalizeContent(generated.content);
        const actualNorm = normalizeContent(actual.content);

        // Vitest will show a nice diff if this fails
        expect(generatedNorm).toBe(actualNorm);
      });
    });
  });
});

describe('Task Generation Integration - Partial Subagents (3: issue, team, test - no docs)', () => {
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
        // Skip if task requires documentation-researcher
        const task = buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG); // Test with full config first
        const requiresDocs = task.requiredSubAgentRoles.includes('documentation-researcher');

        if (!requiresDocs) {
          expect(() => {
            buildTaskDefinition(taskSlug, PARTIAL_SUBAGENTS_CONFIG);
          }).not.toThrow();
        }
      });

      test('does NOT include documentation-researcher instructions', () => {
        // Only test tasks that don't require docs
        const task = buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG);
        const requiresDocs = task.requiredSubAgentRoles.includes('documentation-researcher');

        if (!requiresDocs) {
          const generated = buildTaskDefinition(taskSlug, PARTIAL_SUBAGENTS_CONFIG);
          expect(generated.content).not.toContain('documentation-researcher agent');
        }
      });

      test('frontmatter matches regardless of optional subagents', () => {
        const task = buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG);
        const requiresDocs = task.requiredSubAgentRoles.includes('documentation-researcher');

        if (!requiresDocs) {
          const generated = buildTaskDefinition(taskSlug, PARTIAL_SUBAGENTS_CONFIG);
          const actual = readFixtureCommand(PARTIAL_SUBAGENTS_PATH, taskSlug);

          expect(generated.frontmatter.description).toBe(actual.frontmatter.description);
        }
      });

      test('matches actual fixture structure (no docs)', () => {
        const task = buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG);
        const requiresDocs = task.requiredSubAgentRoles.includes('documentation-researcher');

        if (!requiresDocs) {
          const generated = buildTaskDefinition(taskSlug, PARTIAL_SUBAGENTS_CONFIG);
          const actual = readFixtureCommand(PARTIAL_SUBAGENTS_PATH, taskSlug);

          const generatedSections = extractKeySections(generated.content);
          const actualSections = extractKeySections(actual.content);

          // Should NOT have docs in either
          expect(generatedSections.hasDocs).toBe(false);
          expect(actualSections.hasDocs).toBe(false);
        }
      });

      test('full content matches fixture (partial subagents)', () => {
        const task = buildTaskDefinition(taskSlug, FULL_SUBAGENTS_CONFIG);
        const requiresDocs = task.requiredSubAgentRoles.includes('documentation-researcher');

        if (!requiresDocs) {
          const generated = buildTaskDefinition(taskSlug, PARTIAL_SUBAGENTS_CONFIG);
          const actual = readFixtureCommand(PARTIAL_SUBAGENTS_PATH, taskSlug);

          const generatedNorm = normalizeContent(generated.content);
          const actualNorm = normalizeContent(actual.content);

          // Vitest will show a nice diff if this fails
          expect(generatedNorm).toBe(actualNorm);
        }
      });
    });
  });
});

describe('Specific Task Content Validation', () => {
  describe('generate-test-cases', () => {
    test('includes test-code-generator delegation in full config', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);
      expect(task.content).toContain('test-code-generator agent');
      expect(task.content).toContain('generate both manual test case documentation and automated Playwright test scripts');
    });

    test('includes documentation gathering step when configured', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);
      expect(task.content).toContain('#### 1.4 Gather Product Documentation');
      expect(task.content).toContain('Use the documentation-researcher agent');
    });

    test('skips documentation gathering step when not configured', () => {
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, PARTIAL_SUBAGENTS_CONFIG);
      expect(task.content).not.toContain('#### 1.4 Gather Product Documentation');
      expect(task.content).not.toContain('Use the documentation-researcher agent');
    });

    test('includes team communication section when configured', () => {
      const withTeamComm = PARTIAL_SUBAGENTS_CONFIG; // Has team-communicator
      const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, withTeamComm);

      // Note: generate-test-cases has team-communicator as optional, not required
      // So it should be included if configured
      if (withTeamComm.some(sa => sa.role === 'team-communicator')) {
        expect(task.content).toContain('team-communicator agent');
      }
    });
  });

  describe('handle-message', () => {
    test('requires team-communicator', () => {
      expect(() => {
        buildTaskDefinition(TASK_SLUGS.HANDLE_MESSAGE, [
          { role: 'test-runner', integration: 'playwright' },
        ]);
      }).toThrow('requires subagent "team-communicator"');
    });

    test('builds successfully with team-communicator', () => {
      const task = buildTaskDefinition(TASK_SLUGS.HANDLE_MESSAGE, FULL_SUBAGENTS_CONFIG);
      expect(task.slug).toBe(TASK_SLUGS.HANDLE_MESSAGE);
      expect(task.requiredSubAgentRoles).toContain('team-communicator');
    });
  });

  describe('run-tests', () => {
    test('includes test-runner instructions', () => {
      const task = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);
      expect(task.content).toContain('test');
      expect(task.requiredSubAgentRoles).toContain('test-runner');
    });

    test('derives playwright MCP requirement', () => {
      const task = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);
      expect(task.requiredMCPs).toContain('playwright');
    });
  });
});

describe('Difference Analysis', () => {
  test('security notice consistency - generated vs fixture', () => {
    const task = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);
    const actual = readFixtureCommand(FULL_SUBAGENTS_PATH, TASK_SLUGS.GENERATE_TEST_CASES);

    // Both should have security notice
    expect(task.content).toContain('SECURITY NOTICE');
    expect(actual.content).toContain('SECURITY NOTICE');
  });

  test('step numbering consistency when optional blocks present', () => {
    const withDocs = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);
    const withoutDocs = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, PARTIAL_SUBAGENTS_CONFIG);

    const withDocsSteps = (withDocs.content.match(/### Step \d+:/g) || []).length;
    const withoutDocsSteps = (withoutDocs.content.match(/### Step \d+:/g) || []).length;

    // Without docs should have same or fewer steps
    expect(withoutDocsSteps).toBeLessThanOrEqual(withDocsSteps);
  });

  test('placeholder removal completeness', () => {
    const tasks = [
      TASK_SLUGS.GENERATE_TEST_CASES,
      TASK_SLUGS.EXPLORE_APPLICATION,
      TASK_SLUGS.RUN_TESTS,
    ];

    tasks.forEach(taskSlug => {
      const task = buildTaskDefinition(taskSlug, PARTIAL_SUBAGENTS_CONFIG);

      // No placeholders should remain
      const placeholders = task.content.match(/\{\{[A-Z_]+_INSTRUCTIONS\}\}/g);
      expect(placeholders).toBeNull();
    });
  });
});
