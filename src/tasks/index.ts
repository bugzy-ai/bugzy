/**
 * Tasks Module
 * Central registry and utilities for all task templates
 */

// Export types and constants
export * from './types';
export * from './constants';

// Import task templates
import { generateTestCasesTask } from './library/generate-test-cases';
import { generateTestPlanTask } from './library/generate-test-plan';
import { handleMessageTask } from './library/handle-message';
import { processEventTask } from './library/process-event';
import { runTestsTask } from './library/run-tests';
import { verifyChangesTask } from './library/verify-changes';
import { onboardTestingTask } from './library/onboard-testing';
import { exploreApplicationTask } from './library/explore-application';

import type { ComposedTaskTemplate } from './types';
import { TASK_SLUGS } from './constants';

/**
 * Task Templates Registry
 * All tasks use the step-based composition format
 */
export const TASK_TEMPLATES: Record<string, ComposedTaskTemplate> = {
  [TASK_SLUGS.GENERATE_TEST_CASES]: generateTestCasesTask,
  [TASK_SLUGS.GENERATE_TEST_PLAN]: generateTestPlanTask,
  [TASK_SLUGS.HANDLE_MESSAGE]: handleMessageTask,
  [TASK_SLUGS.PROCESS_EVENT]: processEventTask,
  [TASK_SLUGS.RUN_TESTS]: runTestsTask,
  [TASK_SLUGS.VERIFY_CHANGES]: verifyChangesTask,
  [TASK_SLUGS.ONBOARD_TESTING]: onboardTestingTask,
  [TASK_SLUGS.EXPLORE_APPLICATION]: exploreApplicationTask,
};

/**
 * Get task template by slug
 */
export function getTaskTemplate(slug: string): ComposedTaskTemplate | undefined {
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

