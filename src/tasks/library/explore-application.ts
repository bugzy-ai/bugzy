/**
 * Explore Application Task (Composed)
 * Systematically explore application to discover UI elements, workflows, and behaviors
 */

import type { ComposedTaskTemplate } from '../steps/types';
import { TASK_SLUGS } from '../constants';

export const exploreApplicationTask: ComposedTaskTemplate = {
  slug: TASK_SLUGS.EXPLORE_APPLICATION,
  name: 'Explore Application',
  description: 'Systematically explore application to discover UI elements, workflows, and behaviors',

  frontmatter: {
    description: 'Explore application to discover UI, workflows, and behaviors',
    'argument-hint': '--focus [area] --depth [shallow|deep] --system [name]',
  },

  steps: [
    // Step 1: Overview (inline)
    {
      inline: true,
      title: 'Explore Application Overview',
      content: `Discover actual UI elements, workflows, and behaviors using the test-runner agent. Updates test plan and project documentation with findings.`,
    },
    // Step 2: Security Notice (from library)
    'security-notice',
    // Step 3: Arguments (inline)
    {
      inline: true,
      title: 'Arguments',
      content: `**Arguments**: $ARGUMENTS

**Parse:**
- **focus**: auth, navigation, search, content, admin (default: comprehensive)
- **depth**: shallow (15-20 min) or deep (45-60 min, default)
- **system**: target system (optional for multi-system setups)`,
    },
    // Setup
    'read-knowledge-base',
    'load-project-context',

    // Scope & Strategy
    'assess-requirements',
    'define-focus-area',
    'detect-ambiguity',
    'formulate-questions',

    // Exploration (adaptive depth)
    'quick-exploration',
    'moderate-exploration',
    'deep-exploration',

    // Execute
    'create-exploration-test-case',
    'run-exploration',
    'process-exploration-results',

    // Update
    'update-exploration-artifacts',
    'cleanup-temp-files',
    'update-knowledge-base',
  ],

  requiredSubagents: ['test-runner'],
  optionalSubagents: ['team-communicator'],
  dependentTasks: [],
};
