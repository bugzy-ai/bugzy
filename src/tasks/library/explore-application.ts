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
      content: `Discover actual UI elements, workflows, and behaviors using the browser-automation agent. Updates test plan and project documentation with findings.`,
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
    'load-project-context',
    'read-knowledge-base',

    // Exploration Protocol (adaptive depth)
    'exploration-protocol',

    // Execute
    'create-exploration-test-case',
    'run-exploration',
    'process-exploration-results',

    // Update
    'update-exploration-artifacts',
    // Team Communication (conditional inline)
    {
      inline: true,
      title: 'Team Communication',
      content: `{{INVOKE_TEAM_COMMUNICATOR}} to notify the product team about exploration findings:

\`\`\`
1. Post an update about exploration completion
2. Summarize key discoveries:
   - UI elements and workflows identified
   - Behaviors documented
   - Areas needing further investigation
3. Share exploration report location
4. Ask for team feedback on findings
5. Use appropriate channel and threading
\`\`\``,
      conditionalOnSubagent: 'team-communicator',
    },
    'cleanup-temp-files',
    'update-knowledge-base',
  ],

  requiredSubagents: ['browser-automation'],
  optionalSubagents: ['team-communicator'],
  dependentTasks: [],
};
