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
1. **Phase 1**: Read project context and explore application
2. **Phase 2**: Generate lightweight test plan
3. **Phase 3**: Generate and verify test cases (create + fix until passing)
4. **Phase 4**: Triage failures and fix test issues
5. **Phase 5**: Log product bugs
6. **Phase 6**: Final report`,
    },
    // Step 2: Security Notice (from library)
    'security-notice',
    // Step 3: Arguments (inline)
    {
      inline: true,
      title: 'Arguments',
      content: `Focus area: $ARGUMENTS`,
    },
    // Phase 1: Setup
    'load-project-context',
    'read-knowledge-base',

    // Phase 2: Exploration Protocol
    'exploration-protocol',

    // Execute exploration via test-runner
    'create-exploration-test-case',
    'run-exploration',
    'process-exploration-results',

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
