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
 * All subagents including documentation-researcher and test-engineer
 */
export const FULL_SUBAGENTS_CONFIG: ProjectSubAgent[] = [
  { role: 'documentation-researcher', integration: 'notion' },
  { role: 'issue-tracker', integration: 'notion' },
  { role: 'team-communicator', integration: 'slack' },
  { role: 'browser-automation', integration: 'playwright' },
  { role: 'test-engineer', integration: 'default' },
];

/**
 * Partial Subagents Configuration
 * Configuration without documentation-researcher (no Notion)
 */
export const PARTIAL_SUBAGENTS_CONFIG: ProjectSubAgent[] = [
  { role: 'issue-tracker', integration: 'slack' },
  { role: 'team-communicator', integration: 'slack' },
  { role: 'browser-automation', integration: 'playwright' },
  { role: 'test-engineer', integration: 'default' },
];

/**
 * Minimal Subagents Configuration
 * Only browser-automation and test-engineer for basic scenarios
 */
export const MINIMAL_SUBAGENTS_CONFIG: ProjectSubAgent[] = [
  { role: 'browser-automation', integration: 'playwright' },
  { role: 'test-engineer', integration: 'default' },
];

/**
 * Empty Configuration
 * No subagents configured
 */
export const EMPTY_SUBAGENTS_CONFIG: ProjectSubAgent[] = [];
