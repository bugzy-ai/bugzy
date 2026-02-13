import type { TaskStep } from '../types';

export const normalizeTestResultsStep: TaskStep = {
  id: 'normalize-test-results',
  title: 'Normalize Test Results',
  category: 'execution',
  content: `## Normalize Test Results

Convert test results into the standard Bugzy \`test-runs/\` manifest format. This step handles both external CI results (via webhook) and local BYOT test output. In managed mode (bugzy-reporter already created the manifest), this step is skipped.

### 1. Check for Existing Manifest

Look for a \`test-runs/*/manifest.json\` from the most recent run. If a manifest already exists from the bugzy-reporter (managed mode), **skip this step entirely** — the results are already normalized.

### 2. Determine Input Source

Check how test results are available:

**From event payload** (external CI — \`$ARGUMENTS\` contains event data):
- \`data.results_url\` — URL to download results from (the parse script handles the download)
- \`data.results\` — inline results (write to a temp file first: \`/tmp/bugzy-results-<random>.json\`)

**From local test run** (agent executed BYOT tests):
- Read \`./tests/CLAUDE.md\` for the native test output location
- Find the most recent test output file

### 3. Locate and Run Parse Script

Look for the parse script at \`reporters/parse-results.ts\`.

**If the parse script exists:**
\`\`\`bash
npx tsx reporters/parse-results.ts --input <source>
\`\`\`
Where \`<source>\` is the file path, temp file path, or URL determined in step 2.

**If the parse script is missing** (fallback for robustness):
Create the manifest inline using the same approach — parse the results format by inspecting the data structure:
- JSON with \`suites\` or \`specs\` arrays: Likely Playwright JSON report
- XML with \`<testsuites>\` or \`<testsuite>\` root: JUnit XML format
- JSON with \`results\` array and \`stats\` object: Likely Cypress/Mocha JSON
- Other: Inspect structure and adapt

Then create:
1. \`test-runs/{timestamp}/manifest.json\` with the standard Bugzy schema
2. \`test-runs/{timestamp}/{testCaseId}/exec-1/result.json\` for each failed test

Save the inline parse logic to \`reporters/parse-results.ts\` for future reuse.

### 4. Verify Manifest

Confirm \`manifest.json\` was created:
- Read the manifest and validate the structure
- Check that \`stats\` counts match the \`testCases\` array

### 5. Generate Summary

Read the manifest and produce a summary:

\`\`\`markdown
## Test Results Summary

- Total Tests: [count]
- Passed: [count] ([percentage]%)
- Failed: [count] ([percentage]%)
- Skipped: [count] ([percentage]%)
- Duration: [time if available]
\`\`\`

### 6. Include CI Metadata (if from event payload)

If the results came from an external CI event (\`$ARGUMENTS\` contains \`data.metadata\`), include:
- **Pipeline URL**: \`data.metadata.pipeline_url\`
- **Commit**: \`data.metadata.commit_sha\`
- **Branch**: \`data.metadata.branch\`

### 7. All Tests Passed?

If there are **no failures**, note that all tests passed. Downstream triage and fix steps can be skipped.`,
  tags: ['execution', 'results', 'normalization', 'byot'],
};
