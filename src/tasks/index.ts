/**
 * Tasks Module
 * Central registry and utilities for all task templates
 */

// Export types and constants
export * from './types';
export * from './constants';

// Import all task templates
import { exploreApplicationTask } from './library/explore-application';
import { generateTestCasesTask } from './library/generate-test-cases';
import { generateTestPlanTask } from './library/generate-test-plan';
import { handleMessageTask } from './library/handle-message';
import { processEventTask } from './library/process-event';
import { runTestsTask } from './library/run-tests';
import { verifyChangesTask } from './library/verify-changes';

import type { TaskTemplate } from './types';
import { TASK_SLUGS } from './constants';

/**
 * Task Templates Registry
 * Single source of truth for all available tasks
 */
export const TASK_TEMPLATES: Record<string, TaskTemplate> = {
  [TASK_SLUGS.EXPLORE_APPLICATION]: exploreApplicationTask,
  [TASK_SLUGS.GENERATE_TEST_CASES]: generateTestCasesTask,
  [TASK_SLUGS.GENERATE_TEST_PLAN]: generateTestPlanTask,
  [TASK_SLUGS.HANDLE_MESSAGE]: handleMessageTask,
  [TASK_SLUGS.PROCESS_EVENT]: processEventTask,
  [TASK_SLUGS.RUN_TESTS]: runTestsTask,
  [TASK_SLUGS.VERIFY_CHANGES]: verifyChangesTask,
};

/**
 * Get task template by slug
 */
export function getTaskTemplate(slug: string): TaskTemplate | undefined {
  return TASK_TEMPLATES[slug];
}

/**
 * Get all registered task slugs
 */
export function getAllTaskSlugs(): string[] {
  return Object.keys(TASK_TEMPLATES);
}

/**
 * Check if a task slug is registered
 */
export function isTaskRegistered(slug: string): boolean {
  return TASK_TEMPLATES[slug] !== undefined;
}

/**
 * Slash Command Configuration for Cloud Run
 * Format expected by cloudrun-claude-code API
 */
export interface SlashCommandConfig {
  frontmatter: Record<string, any>;
  content: string;
}

/**
 * Build slash commands configuration for Cloud Run
 * Converts task templates to the format expected by cloudrun-claude-code API
 *
 * @param slugs - Array of task slugs to include
 * @returns Record of slash command configurations
 */
export function buildSlashCommandsConfig(slugs: string[]): Record<string, SlashCommandConfig> {
  const configs: Record<string, SlashCommandConfig> = {};

  for (const slug of slugs) {
    const task = TASK_TEMPLATES[slug];
    if (!task) {
      console.warn(`Unknown task slug: ${slug}, skipping`);
      continue;
    }

    configs[slug] = {
      frontmatter: task.frontmatter,
      content: task.baseContent,
    };

    console.log(`✓ Added slash command: /${slug}`);
  }

  return configs;
}

/**
 * Get required MCP servers from task templates
 * Extracts MCP requirements from task slugs
 *
 * @param slugs - Array of task slugs
 * @returns Array of required MCP server names
 */
export function getRequiredMCPsFromTasks(slugs: string[]): string[] {
  const mcps = new Set<string>();

  for (const slug of slugs) {
    const task = TASK_TEMPLATES[slug];
    if (!task) continue;

    // Extract MCPs from required subagents
    for (const subagent of task.requiredSubagents) {
      // Map subagent roles to MCPs
      const mcpMap: Record<string, string> = {
        'test-runner': 'playwright',
        'team-communicator': 'slack',
        'documentation-researcher': 'notion',
        'issue-tracker': 'linear',
      };

      const mcp = mcpMap[subagent];
      if (mcp) {
        mcps.add(mcp);
      }
    }
  }

  return Array.from(mcps);
}
