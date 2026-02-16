/**
 * Explore Test Codebase Task (Composed)
 * Analyze an external test repository to understand framework, coverage, and conventions.
 * Used for BYOT (Bring Your Own Tests) projects during onboarding.
 */

import type { ComposedTaskTemplate } from '../steps/types';
import { TASK_SLUGS } from '../constants';

export const exploreTestCodebaseTask: ComposedTaskTemplate = {
  slug: TASK_SLUGS.EXPLORE_TEST_CODEBASE,
  name: 'Explore Test Codebase',
  description: 'Analyze external test repository to understand framework, coverage, and conventions',

  frontmatter: {
    description: 'Analyze external test codebase for BYOT onboarding',
    'argument-hint': '--focus [area]',
  },

  steps: [
    // Step 1: Overview (inline)
    {
      inline: true,
      title: 'Explore Test Codebase Overview',
      content: `Analyze the external test repository to understand the testing framework, test coverage, conventions, and codebase structure. This task is triggered during BYOT (Bring Your Own Tests) onboarding to help Bugzy understand the customer's existing test suite.`,
    },
    // Step 2: Security Notice
    'security-notice',
    // Step 3: Arguments (inline)
    {
      inline: true,
      title: 'Arguments',
      content: `**Arguments**: $ARGUMENTS

**Parse:**
- **focus**: specific area to analyze (default: comprehensive)`,
    },
    // Setup
    'load-project-context',
    'read-knowledge-base',

    // Core analysis
    'analyze-test-codebase',

    // Generate results parser for normalizing test output
    'create-results-parser',

    // Optional: explore the app itself if URL is available
    {
      inline: true,
      title: 'App Exploration (Optional)',
      content: `If the project has an app URL configured (check \`.bugzy/runtime/project-context.md\` or env vars for TEST_APP_HOST), {{INVOKE_BROWSER_AUTOMATION}} to briefly explore the application:

1. Navigate to the app URL
2. Identify main navigation and key pages
3. Map discovered features to test coverage from the codebase analysis
4. Note any features that appear untested

This step helps correlate what the tests cover with what the application actually contains. Skip if no app URL is available.`,
      conditionalOnSubagent: 'browser-automation',
    },

    // Generate output
    {
      inline: true,
      title: 'Commit Analysis Results',
      content: `Commit analysis artifacts to the **parent project repository** (the workspace root).

**IMPORTANT — Do NOT stage the \`tests\` submodule.** The \`tests/\` directory is an external git submodule. Any changes made inside it (e.g., \`reporters/parse-results.ts\`, \`tests/CLAUDE.md\`) will be committed and pushed to the external repo automatically by the post-execution handler. Staging the submodule in the parent would record a local-only commit SHA that doesn't exist on the remote, causing a broken reference.

**What to commit in the parent repo:**
1. \`git add .bugzy/\` — the test codebase analysis report and runtime files
2. Do NOT run \`git add .\` or \`git add tests\` — this would stage the submodule pointer
3. \`git commit -m "chore: analyze external test codebase"\`

These artifacts will be available to all future task executions for this project.`,
    },

    // Team Communication (conditional)
    {
      inline: true,
      title: 'Team Communication',
      content: `{{INVOKE_TEAM_COMMUNICATOR}} to notify the team about the test codebase analysis:

\`\`\`
1. Post a summary of the analysis findings
2. Include key information:
   - Test framework and runner identified
   - Number of test files and estimated test cases
   - Feature areas covered by existing tests
   - Any gaps or areas without test coverage
3. Ask if the analysis looks accurate
4. Use appropriate channel and threading
\`\`\``,
      conditionalOnSubagent: 'team-communicator',
    },

    // Maintenance
    'update-knowledge-base',
  ],

  requiredSubagents: ['browser-automation'],
  optionalSubagents: ['team-communicator'],
  dependentTasks: [],
};
