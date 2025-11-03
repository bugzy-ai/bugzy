/**
 * Task Slug Constants
 * Single source of truth for all task identifiers
 *
 * These constants should be used throughout the codebase instead of hardcoded strings
 * to ensure type safety and prevent typos.
 */
export const TASK_SLUGS = {
  EXPLORE_APPLICATION: 'explore-application',
  GENERATE_TEST_CASES: 'generate-test-cases',
  GENERATE_TEST_PLAN: 'generate-test-plan',
  HANDLE_MESSAGE: 'handle-message',
  PROCESS_EVENT: 'process-event',
  RUN_TESTS: 'run-tests',
  VERIFY_CHANGES_MANUAL: 'verify-changes-manual',
  VERIFY_CHANGES_SLACK: 'verify-changes-slack',
} as const;

/**
 * Type for task slugs
 * Ensures only valid task slugs can be used
 */
export type TaskSlug = typeof TASK_SLUGS[keyof typeof TASK_SLUGS];
