import type { TaskStep } from '../types';

export const createResultsParserStep: TaskStep = {
  id: 'create-results-parser',
  title: 'Create Results Parser Script',
  category: 'generation',
  content: `## Create Results Parser Script

Create a reusable script that normalizes test results from the project's test framework into Bugzy's standard \`test-runs/\` manifest format. This script is used at runtime by both external CI events and agent-executed BYOT test runs.

### Inspect the Test Project

1. Read \`./tests/CLAUDE.md\` to understand:
   - Which test framework is used (Playwright, Cypress, Jest, Mocha, etc.)
   - How tests are run and where output goes
   - The native report format (JSON, JUnit XML, etc.)
2. Check the test runner config file (e.g., \`playwright.config.ts\`, \`cypress.config.ts\`, \`jest.config.ts\`) for report settings
3. If a sample test output exists, read it to understand the exact structure

### Create the Parse Script

Create \`reporters/parse-results.ts\` — a Node.js/TypeScript CLI script.

**Interface:**
\`\`\`
npx tsx reporters/parse-results.ts --input <file-or-url> [--timestamp <existing>] [--test-id <id>]
\`\`\`

**Arguments:**
- \`--input\` (required): file path or URL to the test results
  - If URL (starts with \`http://\` or \`https://\`): download with 30s timeout
  - If file path: read directly from disk
- \`--timestamp\` (optional): existing run timestamp for incremental updates
- \`--test-id\` (optional): specific test case ID for incremental updates (used with \`--timestamp\`)

**Normal mode** (no \`--timestamp\`):
1. Parse the project-specific test output format
2. Generate a timestamp: \`YYYYMMDD-HHmmss\`
3. Create \`test-runs/{timestamp}/manifest.json\` with the standard Bugzy schema:
\`\`\`json
{
  "bugzyExecutionId": "<from BUGZY_EXECUTION_ID env var or 'local'>",
  "timestamp": "<YYYYMMDD-HHmmss>",
  "startTime": "<ISO8601>",
  "endTime": "<ISO8601>",
  "status": "completed",
  "stats": {
    "totalTests": 0,
    "passed": 0,
    "failed": 0,
    "totalExecutions": 0
  },
  "testCases": [
    {
      "id": "<slugified test name, e.g. TC-001-login>",
      "name": "<original test name>",
      "totalExecutions": 1,
      "finalStatus": "passed|failed",
      "executions": [
        {
          "executionNumber": 1,
          "status": "passed|failed",
          "error": "<error message if failed, null if passed>",
          "duration": null,
          "hasTrace": false,
          "hasScreenshots": false
        }
      ]
    }
  ],
  "new_failures": [
    {
      "id": "<test case id>",
      "name": "<test name>",
      "error": "<error message or null>",
      "lastPassedRun": "<timestamp of last passing run or null>"
    }
  ],
  "known_failures": [
    {
      "id": "<test case id>",
      "name": "<test name>",
      "error": "<error message or null>",
      "lastPassedRun": null
    }
  ]
}
\`\`\`
4. **Classify failures** — after building the manifest, classify each failed test as new or known:
   - Read \`BUGZY_FAILURE_LOOKBACK\` env var (default: 5)
   - List previous \`test-runs/*/manifest.json\` files sorted by timestamp descending (skip current run)
   - For each failed test in the manifest:
     - If it passed in any of the last N runs → \`new_failures\` (include the timestamp of the last passing run in \`lastPassedRun\`)
     - If it failed in ALL of the last N runs → \`known_failures\`
     - If the test doesn't exist in any previous run → \`new_failures\` (new test)
     - If no previous runs exist at all (first run) → all failures go to \`new_failures\`
   - Write the \`new_failures\` and \`known_failures\` arrays into the manifest

5. For each failed test, create:
   - Directory: \`test-runs/{timestamp}/{testCaseId}/exec-1/\`
   - File: \`test-runs/{timestamp}/{testCaseId}/exec-1/result.json\` containing:
\`\`\`json
{
  "status": "failed",
  "error": "<full error message>",
  "stackTrace": "<stack trace if available>",
  "duration": null,
  "testFile": "<file path if available>"
}
\`\`\`
6. Print the manifest path to stdout
7. Exit code 0 on success, non-zero on failure

**Incremental mode** (\`--timestamp\` + \`--test-id\` provided):
1. Read existing \`test-runs/{timestamp}/manifest.json\`
2. Parse the new test results for the specified test case
3. Find the next execution number (e.g., if exec-2 exists, create exec-3)
4. Create \`test-runs/{timestamp}/{testCaseId}/exec-N/result.json\`
5. Update the manifest: add execution entry, update \`totalExecutions\`, update \`finalStatus\` and stats
6. Print the manifest path to stdout

### Test the Script

1. Run the project's tests to generate a sample output (or use an existing one)
2. Run the parse script: \`npx tsx reporters/parse-results.ts --input <sample-output>\`
3. Verify \`test-runs/\` was created with correct manifest.json structure
4. Check that failed test directories have result.json files

### Document in CLAUDE.md

Add to \`./tests/CLAUDE.md\`:
- Location: \`reporters/parse-results.ts\`
- Usage: \`npx tsx reporters/parse-results.ts --input <file-or-url> [--timestamp <ts>] [--test-id <id>]\`
- Where the project's native test output is located (for local runs)`,
  tags: ['generation', 'byot', 'results', 'parser'],
};
