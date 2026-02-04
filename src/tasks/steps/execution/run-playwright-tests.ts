import type { TaskStep } from '../types';

export const runPlaywrightTestsStep: TaskStep = {
  id: 'run-playwright-tests',
  title: 'Execute Playwright Tests',
  category: 'execution',
  content: `## Execute Playwright Tests

Run automated Playwright tests and capture results.

**Build Playwright Command** based on selector:

The playwright.config.ts automatically loads environment variables from .env.testdata and .env files.
Use npm scripts to run tests - no manual env export needed.

**For file pattern or specific file**:
\`\`\`bash
npm test -- [selector]
\`\`\`

**For tag**:
\`\`\`bash
npm test -- --grep "[tag]"
\`\`\`

**For all tests**:
\`\`\`bash
npm test
\`\`\`

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
  invokesSubagents: ['test-runner'],
  tags: ['execution', 'tests'],
};
