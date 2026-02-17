/**
 * Triage Results Task (Composed)
 * Analyze externally-submitted test results and triage failures
 */

import type { ComposedTaskTemplate } from '../steps/types';
import { TASK_SLUGS } from '../constants';

export const triageResultsTask: ComposedTaskTemplate = {
  slug: TASK_SLUGS.TRIAGE_RESULTS,
  name: 'Triage Results',
  description: 'Analyze externally-submitted test results and triage failures as product bugs or test issues',

  frontmatter: {
    description: 'Analyze externally-submitted test results and triage failures as product bugs or test issues',
    'argument-hint': '[event payload with test results]',
  },

  steps: [
    // Step 1: Overview (inline)
    {
      inline: true,
      title: 'Triage Results Overview',
      content: `# Triage External Test Results

Analyze test results submitted from an external CI pipeline. The results were sent via webhook and are available in the event payload — either as inline data or a URL to download.

**Goal**: Normalize the results into the standard manifest format, classify each failure as a PRODUCT BUG or TEST ISSUE, and generate a triage report.

This task is triggered automatically when test results are submitted to the Bugzy webhook from a CI system (GitHub Actions, GitLab CI, etc.).`,
    },
    // Step 2: Security Notice (library)
    'security-notice',
    // Step 3: Arguments (inline)
    {
      inline: true,
      title: 'Arguments',
      content: `Arguments: $ARGUMENTS`,
    },
    // Step 5: Normalize Test Results (library — handles URL/inline results + manifest creation)
    'normalize-test-results',
    // Step 7: Triage Failures (existing library step)
    'triage-failures',
    // Step 8: Fix Test Issues (library — uses test-engineer)
    'fix-test-issues',
    // Step 9: Log Product Bugs (conditional — requires issue-tracker)
    {
      stepId: 'log-product-bugs',
      conditionalOnSubagent: 'issue-tracker',
    },
    // Step 10: Notify Team (conditional — requires team-communicator)
    {
      stepId: 'notify-team',
      conditionalOnSubagent: 'team-communicator',
    },
    // Step 11: Knowledge Base Update (library)
    'update-knowledge-base',
  ],

  requiredSubagents: ['browser-automation', 'test-engineer'],
  optionalSubagents: ['issue-tracker', 'team-communicator'],
  dependentTasks: [],
};
