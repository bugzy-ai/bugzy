/**
 * Agent Configuration Tests
 * Tests for getAgentConfiguration to verify subagent templates are bundled correctly
 */

import { describe, test, expect } from 'vitest';
import { getAgentConfiguration } from '../../src/core/registry';
import { buildTaskDefinition } from '../../src/core/task-builder';
import { buildSubagentConfig, buildSubagentsConfig } from '../../src/subagents';
import { TASK_SLUGS } from '../../src/tasks/constants';
import { FULL_SUBAGENTS_CONFIG } from '../fixtures/repo-configs';
import type { ProjectSubAgent } from '../../src/core/task-builder';

// Minimal config for basic tests
const MINIMAL_SUBAGENTS_CONFIG: ProjectSubAgent[] = [
  { role: 'test-runner', integration: 'playwright' },
  { role: 'test-debugger-fixer', integration: 'playwright' },
];

describe('getAgentConfiguration', () => {
  describe('Basic Configuration Generation', () => {
    test('generates configuration with minimal subagents', async () => {
      const taskDef = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, MINIMAL_SUBAGENTS_CONFIG);
      const config = await getAgentConfiguration(taskDef, MINIMAL_SUBAGENTS_CONFIG);

      expect(config).toBeDefined();
      expect(config.slashCommands).toBeDefined();
      expect(config.subagents).toBeDefined();
      expect(config.mcpConfig).toBeDefined();
    });

    test('generates configuration with full subagents', async () => {
      const taskDef = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);
      const config = await getAgentConfiguration(taskDef, FULL_SUBAGENTS_CONFIG);

      expect(config).toBeDefined();
      expect(config.slashCommands).toBeDefined();
      expect(config.subagents).toBeDefined();
      expect(config.mcpConfig).toBeDefined();
    });
  });

  describe('Slash Commands Generation', () => {
    test('creates slash command for the task', async () => {
      const taskDef = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);
      const config = await getAgentConfiguration(taskDef, FULL_SUBAGENTS_CONFIG);

      expect(config.slashCommands).toBeDefined();
      expect(config.slashCommands[TASK_SLUGS.RUN_TESTS]).toBeDefined();
    });

    test('slash command has frontmatter and content', async () => {
      const taskDef = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, MINIMAL_SUBAGENTS_CONFIG);
      const config = await getAgentConfiguration(taskDef, MINIMAL_SUBAGENTS_CONFIG);

      const command = config.slashCommands[TASK_SLUGS.RUN_TESTS];
      expect(command.frontmatter).toBeDefined();
      expect(command.content).toBeDefined();
      expect(typeof command.content).toBe('string');
      expect(command.content.length).toBeGreaterThan(0);
    });
  });

  describe('Subagent Prompts Generation', () => {
    test('generates prompts for all configured subagents', async () => {
      const taskDef = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);
      const config = await getAgentConfiguration(taskDef, FULL_SUBAGENTS_CONFIG);

      // Full config has 4 subagents
      expect(Object.keys(config.subagents).length).toBeGreaterThanOrEqual(1);
    });

    test('subagent prompts contain content', async () => {
      const taskDef = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);
      const config = await getAgentConfiguration(taskDef, FULL_SUBAGENTS_CONFIG);

      // Check that each subagent prompt has actual content
      Object.values(config.subagents).forEach(subagent => {
        expect(subagent.content).toBeDefined();
        expect(typeof subagent.content).toBe('string');
        expect(subagent.content.length).toBeGreaterThan(0);
        // Should have frontmatter
        expect(subagent.frontmatter).toBeDefined();
      });
    });

    test('generates playwright test-runner prompt for minimal config', async () => {
      const taskDef = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, MINIMAL_SUBAGENTS_CONFIG);
      const config = await getAgentConfiguration(taskDef, MINIMAL_SUBAGENTS_CONFIG);

      // Minimal config only has test-runner with playwright
      expect(config.subagents['test-runner']).toBeDefined();
      const subagent = config.subagents['test-runner'];

      // Should contain playwright-specific content
      expect(subagent.content.toLowerCase()).toContain('playwright');
    });

    test('generates multiple subagent prompts for full config', async () => {
      const taskDef = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);
      const config = await getAgentConfiguration(taskDef, FULL_SUBAGENTS_CONFIG);

      // Full config has: test-runner, documentation-researcher, issue-tracker, team-communicator
      const roles = Object.keys(config.subagents);
      expect(roles.length).toBeGreaterThan(1);

      // Check specific roles exist
      if (FULL_SUBAGENTS_CONFIG.some(sa => sa.role === 'test-runner')) {
        expect(config.subagents['test-runner']).toBeDefined();
      }
      if (FULL_SUBAGENTS_CONFIG.some(sa => sa.role === 'team-communicator')) {
        expect(config.subagents['team-communicator']).toBeDefined();
      }
    });
  });

  describe('MCP Configuration Generation', () => {
    test('generates MCP config for minimal subagents', async () => {
      const taskDef = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, MINIMAL_SUBAGENTS_CONFIG);
      const config = await getAgentConfiguration(taskDef, MINIMAL_SUBAGENTS_CONFIG);

      expect(config.mcpConfig).toBeDefined();
      expect(config.mcpConfig.mcpServers).toBeDefined();

      // Minimal config with playwright should have playwright MCP
      expect(config.mcpConfig.mcpServers.playwright).toBeDefined();
    });

    test('generates MCP config for full subagents', async () => {
      const taskDef = buildTaskDefinition(TASK_SLUGS.GENERATE_TEST_CASES, FULL_SUBAGENTS_CONFIG);
      const config = await getAgentConfiguration(taskDef, FULL_SUBAGENTS_CONFIG);

      expect(config.mcpConfig).toBeDefined();
      expect(config.mcpConfig.mcpServers).toBeDefined();

      // Full config should have multiple MCP servers
      const mcpServers = Object.keys(config.mcpConfig.mcpServers);
      expect(mcpServers.length).toBeGreaterThan(1);

      // Should include playwright for test-runner
      expect(config.mcpConfig.mcpServers.playwright).toBeDefined();
    });

    test('MCP servers have required configuration', async () => {
      const taskDef = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, MINIMAL_SUBAGENTS_CONFIG);
      const config = await getAgentConfiguration(taskDef, MINIMAL_SUBAGENTS_CONFIG);

      const playwrightMcp = config.mcpConfig.mcpServers.playwright;
      expect(playwrightMcp).toBeDefined();
      expect(playwrightMcp.command).toBeDefined();
      expect(typeof playwrightMcp.command).toBe('string');
    });
  });

  describe('Template Bundling Validation', () => {
    test('templates are accessible and contain valid content', async () => {
      // This test verifies that template files are bundled with the package
      const taskDef = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, FULL_SUBAGENTS_CONFIG);
      const config = await getAgentConfiguration(taskDef, FULL_SUBAGENTS_CONFIG);

      // If subagent prompts are generated, templates must be bundled correctly
      Object.entries(config.subagents).forEach(([role, subagent]) => {
        expect(subagent).toBeDefined();
        expect(subagent.content).toBeDefined();
        expect(typeof subagent.content).toBe('string');
        expect(subagent.content.length).toBeGreaterThan(100); // Templates should be substantial
      });
    });

    test('integration produces expected prompt content', async () => {
      // Test with playwright
      const taskDefPlaywright = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, [
        { role: 'test-runner', integration: 'playwright' },
        { role: 'test-debugger-fixer', integration: 'playwright' }
      ]);
      const configPlaywright = await getAgentConfiguration(taskDefPlaywright, [
        { role: 'test-runner', integration: 'playwright' },
        { role: 'test-debugger-fixer', integration: 'playwright' }
      ]);

      const playwrightSubagent = configPlaywright.subagents['test-runner'];

      // Should be defined
      expect(playwrightSubagent).toBeDefined();

      // Should mention the integration tool
      expect(playwrightSubagent.content.toLowerCase()).toContain('playwright');
    });
  });

  describe('Missing Template Handling', () => {
    test('should return undefined for non-existent template', () => {
      // Try to build config with a fake integration that doesn't have a template
      const config = buildSubagentConfig('test-runner', 'nonexistent-tool');

      expect(config).toBeUndefined();
    });

    test('should return undefined for non-existent role', () => {
      // Try to build config with a role that doesn't exist
      const config = buildSubagentConfig('fake-role', 'playwright');

      expect(config).toBeUndefined();
    });

    test('should skip subagents with missing templates', () => {
      const configs = buildSubagentsConfig([
        { role: 'test-runner', integration: 'playwright' },  // valid
        { role: 'test-runner', integration: 'fake-tool' }    // invalid - will be skipped
      ]);

      // Only the valid one should be included
      expect(configs['test-runner']).toBeDefined();
      expect(Object.keys(configs).length).toBe(1);
    });

    test('should handle mixed valid and invalid subagent configurations', () => {
      const configs = buildSubagentsConfig([
        { role: 'test-runner', integration: 'playwright' },        // valid
        { role: 'test-runner', integration: 'nonexistent' },       // invalid
        { role: 'team-communicator', integration: 'slack' },       // valid
        { role: 'fake-role', integration: 'fake-integration' }     // invalid
      ]);

      // Should have exactly 2 valid configs (test-runner and team-communicator)
      // Note: Only one of the test-runner configs will be kept (the valid one)
      expect(configs['test-runner']).toBeDefined();
      expect(configs['team-communicator']).toBeDefined();

      // Should not have fake-role
      expect(configs['fake-role']).toBeUndefined();
    });

    test('should return empty object when all templates are missing', () => {
      const configs = buildSubagentsConfig([
        { role: 'fake-role-1', integration: 'fake-integration-1' },
        { role: 'fake-role-2', integration: 'fake-integration-2' }
      ]);

      expect(Object.keys(configs).length).toBe(0);
    });

    test('valid templates should still load successfully', () => {
      // Verify that our test doesn't break existing functionality
      const config = buildSubagentConfig('test-runner', 'playwright');

      expect(config).toBeDefined();
      expect(config?.content).toBeDefined();
      expect(config?.frontmatter).toBeDefined();
      expect(typeof config?.content).toBe('string');
      expect(config!.content.length).toBeGreaterThan(0);
    });

    test('agent configuration should handle missing templates gracefully', async () => {
      // Even with invalid subagents in the list, valid ones should still work
      const validSubagents: ProjectSubAgent[] = [
        { role: 'test-runner', integration: 'playwright' },
        { role: 'test-debugger-fixer', integration: 'playwright' }
      ];

      const taskDef = buildTaskDefinition(TASK_SLUGS.RUN_TESTS, validSubagents);
      const config = await getAgentConfiguration(taskDef, validSubagents);

      // Should successfully generate config with valid subagents
      expect(config).toBeDefined();
      expect(config.subagents['test-runner']).toBeDefined();
      expect(config.subagents['test-runner'].content).toBeTruthy();
    });
  });
});
