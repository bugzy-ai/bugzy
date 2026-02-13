/**
 * Test Fixtures: Repository Configurations
 * Real configurations from bugzy-org repos for integration testing
 */

import { ProjectSubAgent } from '../../src/core/task-builder';

// Satisfy vitest - this is a config file, not a test file
describe('repo-configs (config file)', () => {
  test('exports configurations', () => {
    expect(true).toBe(true);
  });
});

/**
 * Full Subagents Configuration
 * All 6 subagents including documentation-researcher and test-code-generator
 */
export const FULL_SUBAGENTS_CONFIG: ProjectSubAgent[] = [
  { role: 'documentation-researcher', integration: 'notion' },
  { role: 'issue-tracker', integration: 'notion' },
  { role: 'team-communicator', integration: 'slack' },
  { role: 'browser-automation', integration: 'playwright' },
  { role: 'test-debugger-fixer', integration: 'playwright' },
  { role: 'test-code-generator', integration: 'playwright' },
];

/**
 * Partial Subagents Configuration
 * Configuration without documentation-researcher (no Notion)
 */
export const PARTIAL_SUBAGENTS_CONFIG: ProjectSubAgent[] = [
  { role: 'issue-tracker', integration: 'slack' },
  { role: 'team-communicator', integration: 'slack' },
  { role: 'browser-automation', integration: 'playwright' },
  { role: 'test-debugger-fixer', integration: 'playwright' },
  { role: 'test-code-generator', integration: 'playwright' },
];

/**
 * Minimal Subagents Configuration
 * Only browser-automation, test-debugger-fixer, and test-code-generator for basic scenarios
 */
export const MINIMAL_SUBAGENTS_CONFIG: ProjectSubAgent[] = [
  { role: 'browser-automation', integration: 'playwright' },
  { role: 'test-debugger-fixer', integration: 'playwright' },
  { role: 'test-code-generator', integration: 'playwright' },
];

/**
 * Empty Configuration
 * No subagents configured
 */
export const EMPTY_SUBAGENTS_CONFIG: ProjectSubAgent[] = [];
