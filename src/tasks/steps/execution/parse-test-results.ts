import type { TaskStep } from '../types';

export const parseTestResultsStep: TaskStep = {
  id: 'parse-test-results',
  title: 'Parse Test Results',
  category: 'execution',
  content: `## Parse Test Results from Manifest

After test execution, read and parse the manifest.json for structured results.

**Read the manifest.json file:**
\`\`\`bash
cat test-runs/[timestamp]/manifest.json
\`\`\`

**Manifest Structure:**
\`\`\`json
{
  "bugzyExecutionId": "70a59676-cfd0-4ffd-b8ad-69ceff25c31d",
  "timestamp": "20251115-123456",
  "startTime": "2025-11-15T12:34:56.789Z",
  "endTime": "2025-11-15T12:45:23.456Z",
  "status": "completed",
  "stats": {
    "totalTests": 10,
    "passed": 8,
    "failed": 2,
    "totalExecutions": 10
  },
  "testCases": [
    {
      "id": "TC-001-login",
      "name": "Login functionality",
      "totalExecutions": 1,
      "finalStatus": "passed",
      "executions": [...]
    }
  ]
}
\`\`\`

**Extract Results:**
From the manifest, extract:
- **Total tests**: stats.totalTests
- **Passed tests**: stats.passed
- **Failed tests**: stats.failed
- **Total executions**: stats.totalExecutions (includes re-runs)
- **Duration**: Calculate from startTime and endTime

For each failed test, collect from testCases array:
- Test ID (id field)
- Test name (name field)
- Final status (finalStatus field)
- Latest execution details:
  - Error message (executions[last].error)
  - Duration (executions[last].duration)
  - Video file location (test-runs/{timestamp}/{id}/exec-{num}/{videoFile})
  - Trace availability (executions[last].hasTrace)
  - Screenshots availability (executions[last].hasScreenshots)

**Generate Summary Statistics:**
\`\`\`markdown
## Test Execution Summary
- Total Tests: [count]
- Passed: [count] ([percentage]%)
- Failed: [count] ([percentage]%)
- Skipped: [count] ([percentage]%)
- Total Duration: [time]
\`\`\``,
  tags: ['execution', 'results', 'analysis'],
};
