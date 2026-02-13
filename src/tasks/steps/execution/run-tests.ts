import type { TaskStep } from '../types';

export const runTestsStep: TaskStep = {
  id: 'run-tests',
  title: 'Execute Automated Tests',
  category: 'execution',
  content: `## Execute Automated Tests

Run automated tests and capture results.

**Read \`./tests/CLAUDE.md\`** for the test execution commands specific to this project's test framework.

Use the commands defined in \`./tests/CLAUDE.md\` to run tests based on selector:

- **For file pattern or specific file**: Use the framework's file selection command
- **For tag**: Use the framework's tag/grep filtering command
- **For all tests**: Use the default run-all command

Wait for execution to complete. This may take several minutes depending on test count.

**Note**: The custom Bugzy reporter will automatically:
- Generate timestamp in YYYYMMDD-HHMMSS format
- Create test-runs/{timestamp}/ directory structure
- Record execution-id.txt with BUGZY_EXECUTION_ID
- Save results per test case in TC-{id}/exec-1/ folders
- Generate manifest.json with complete execution summary

**Locate Results** after execution:
1. Find the test run directory (most recent):
   \`\`\`bash
   ls -t test-runs/ | head -1
   \`\`\`

2. Store the timestamp for use in subsequent steps`,
  invokesSubagents: ['browser-automation'],
  tags: ['execution', 'tests'],
};
