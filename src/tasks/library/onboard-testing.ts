/**
 * Onboard Testing Task (Composed)
 * End-to-end workflow: explore → plan → cases → test → fix → report
 * Renamed from full-test-coverage to better reflect its purpose as a setup/onboarding task
 */

import type { ComposedTaskTemplate } from '../steps/types';
import { TASK_SLUGS } from '../constants';

export const onboardTestingTask: ComposedTaskTemplate = {
  slug: TASK_SLUGS.ONBOARD_TESTING,
  name: 'Onboard Testing',
  description:
    'Complete workflow: explore application, generate test plan, create test cases, run tests, fix issues, and report results',

  frontmatter: {
    description: 'Complete test coverage workflow - from exploration to passing tests',
    'argument-hint': '<focus-area-or-feature-description>',
  },

  steps: [
    // Step 1: Overview (inline)
    {
      inline: true,
      title: 'Onboard Testing Overview',
      content: `## Overview

This command orchestrates the complete test coverage workflow in a single execution:
1. **Phase 1**: Assess existing artifacts (skip phases if artifacts exist)
2. **Phase 2**: Explore application (if no project context)
3. **Phase 3**: Generate lightweight test plan (if no test plan or doesn't cover focus)
4. **Phase 4**: Generate and verify test cases (create + fix until passing)
5. **Phase 5**: Triage failures and fix test issues
6. **Phase 6**: Log product bugs
7. **Phase 7**: Final report

The workflow is **fully automatic** - the agent decides what to skip based on existing context.`,
    },
    // Step 2: Security Notice (from library)
    'security-notice',
    // Step 3: Arguments (inline)
    {
      inline: true,
      title: 'Arguments',
      content: `Focus area: $ARGUMENTS`,
    },
    // Phase 1: Setup and Assessment
    'read-knowledge-base',
    'check-existing-artifacts',

    // Phase 2: Clarification and Exploration
    'assess-requirements',
    'define-focus-area',
    'detect-ambiguity',
    'formulate-questions',
    'quick-exploration',
    'moderate-exploration',
    'deep-exploration',

    // Phase 3: Test Plan Generation
    'generate-test-plan',
    'extract-env-variables',

    // Phase 4: Test Case Generation
    'generate-test-cases',
    'automate-test-cases',

    // Phase 5: Test Execution
    'run-playwright-tests',
    'parse-test-results',

    // Phase 6: Triage and Fix (NEW - was missing from full-test-coverage)
    'triage-failures',
    'fix-test-issues',
    {
      stepId: 'log-product-bugs',
      conditionalOnSubagent: 'issue-tracker',
    },

    // Phase 7: Reporting and Communication
    'update-knowledge-base',
    {
      stepId: 'notify-team',
      conditionalOnSubagent: 'team-communicator',
    },
    'generate-final-report',
  ],

  requiredSubagents: ['test-runner', 'test-code-generator', 'test-debugger-fixer'],
  optionalSubagents: ['documentation-researcher', 'team-communicator', 'issue-tracker'],
  dependentTasks: ['run-tests', 'generate-test-cases'],
};
