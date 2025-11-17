/**
 * Run Tests Task
 * Select and run test cases using the test-runner agent
 */

import { TaskTemplate } from '../types';
import { TASK_SLUGS } from '../constants';
import { KNOWLEDGE_BASE_READ_INSTRUCTIONS, KNOWLEDGE_BASE_UPDATE_INSTRUCTIONS } from '../templates/knowledge-base.js';

export const runTestsTask: TaskTemplate = {
  slug: TASK_SLUGS.RUN_TESTS,
  name: 'Run Tests',
  description: 'Execute automated Playwright tests, analyze failures, and fix test issues automatically',

  frontmatter: {
    description: 'Execute automated Playwright tests, analyze failures, and fix test issues automatically',
    'argument-hint': '[file-pattern|tag|all] (e.g., "auth", "@smoke", "tests/specs/login.spec.ts")',
  },

  baseContent: `# Run Tests Command

## SECURITY NOTICE
**CRITICAL**: Never read the \`.env\` file. It contains ONLY secrets (passwords, API keys).
- **Read \`.env.testdata\`** for non-secret environment variables (TEST_BASE_URL, TEST_OWNER_EMAIL, etc.)
- \`.env.testdata\` contains actual values for test data, URLs, and non-sensitive configuration
- For secrets: Reference variable names only (TEST_OWNER_PASSWORD) - values are injected at runtime
- The \`.env\` file access is blocked by settings.json

Execute automated Playwright tests, analyze failures using JSON reports, automatically fix test issues, and log product bugs.

## Arguments
Arguments: \$ARGUMENTS

## Parse Arguments
Extract the following from arguments:
- **selector**: Test selection criteria
  - File pattern: "auth" → finds tests/specs/**/*auth*.spec.ts
  - Tag: "@smoke" → runs tests with @smoke annotation
  - Specific file: "tests/specs/login.spec.ts"
  - All tests: "all" or "" → runs entire test suite

${KNOWLEDGE_BASE_READ_INSTRUCTIONS}

## Test Execution Strategy

**IMPORTANT**: Before selecting tests, read \`.bugzy/runtime/test-execution-strategy.md\` to understand:
- Available test tiers (Smoke, Component, Full Regression)
- When to use each tier (commit, PR, release, debug)
- Default behavior (default to @smoke unless user specifies otherwise)
- How to interpret user intent from context keywords
- Time/coverage trade-offs
- Tag taxonomy

Apply the strategy guidance when determining which tests to run.

## Process

**First**, consult \`.bugzy/runtime/test-execution-strategy.md\` decision tree to determine appropriate test tier based on user's selector and context.

### Step 1: Identify Automated Tests to Run

#### 1.1 Understand Test Selection
Parse the selector argument to determine which tests to run:

**File Pattern** (e.g., "auth", "login"):
- Find matching test files: \`tests/specs/**/*[pattern]*.spec.ts\`
- Example: "auth" → finds all test files with "auth" in the name

**Tag** (e.g., "@smoke", "@regression"):
- Run tests with specific Playwright tag annotation
- Use Playwright's \`--grep\` option

**Specific File** (e.g., "tests/specs/auth/login.spec.ts"):
- Run that specific test file

**All Tests** ("all" or no selector):
- Run entire test suite: \`tests/specs/**/*.spec.ts\`

#### 1.2 Find Matching Test Files
Use glob patterns to find test files:
\`\`\`bash
# For file pattern
ls tests/specs/**/*[pattern]*.spec.ts

# For specific file
ls tests/specs/auth/login.spec.ts

# For all tests
ls tests/specs/**/*.spec.ts
\`\`\`

#### 1.3 Validate Test Files Exist
Check that at least one test file was found:
- If no tests found, inform user and suggest available tests
- List available test files if selection was unclear

### Step 2: Execute Automated Playwright Tests

#### 2.1 Build Playwright Command
Construct the Playwright test command based on the selector:

**For file pattern or specific file**:
\`\`\`bash
BUGZY_EXECUTION_NUM=1 npx playwright test [selector]
\`\`\`

**For tag**:
\`\`\`bash
BUGZY_EXECUTION_NUM=1 npx playwright test --grep "[tag]"
\`\`\`

**For all tests**:
\`\`\`bash
BUGZY_EXECUTION_NUM=1 npx playwright test
\`\`\`

**Output**: Custom Bugzy reporter will create hierarchical test-runs/YYYYMMDD-HHMMSS/ structure with manifest.json

#### 2.2 Execute Tests via Bash
Run the Playwright command with BUGZY_EXECUTION_NUM set:
\`\`\`bash
BUGZY_EXECUTION_NUM=1 npx playwright test [selector]
\`\`\`

Wait for execution to complete. This may take several minutes depending on test count.

**Note**: The custom Bugzy reporter will automatically:
- Generate timestamp in YYYYMMDD-HHMMSS format
- Create test-runs/{timestamp}/ directory structure
- Record execution-id.txt with BUGZY_EXECUTION_ID
- Save results per test case in TC-{id}/exec-1/ folders
- Generate manifest.json with complete execution summary

#### 2.3 Locate and Read Test Results
After execution completes, find and read the manifest:

1. Find the test run directory (most recent):
   \`\`\`bash
   ls -t test-runs/ | head -1
   \`\`\`

2. Read the manifest.json file:
   \`\`\`bash
   cat test-runs/[timestamp]/manifest.json
   \`\`\`

3. Store the timestamp for use in test-debugger-fixer if needed

### Step 3: Analyze Test Results from Manifest

#### 3.1 Parse Manifest
The Bugzy custom reporter produces structured output in manifest.json:
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
      "executions": [
        {
          "number": 1,
          "status": "passed",
          "duration": 1234,
          "videoFile": "video.webm",
          "hasTrace": false,
          "hasScreenshots": false,
          "error": null
        }
      ]
    },
    {
      "id": "TC-002-invalid-credentials",
      "name": "Invalid credentials error",
      "totalExecutions": 1,
      "finalStatus": "failed",
      "executions": [
        {
          "number": 1,
          "status": "failed",
          "duration": 2345,
          "videoFile": "video.webm",
          "hasTrace": true,
          "hasScreenshots": true,
          "error": "expect(locator).toBeVisible()..."
        }
      ]
    }
  ]
}
\`\`\`

#### 3.2 Extract Test Results
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

#### 3.3 Generate Summary Statistics
\`\`\`markdown
## Test Execution Summary
- Total Tests: [count]
- Passed: [count] ([percentage]%)
- Failed: [count] ([percentage]%)
- Skipped: [count] ([percentage]%)
- Total Duration: [time]
\`\`\`

### Step 5: Triage Failed Tests

After analyzing test results, triage each failure to determine if it's a product bug or test issue:

#### 5.1 Triage Failed Tests FIRST

**⚠️ IMPORTANT: Do NOT report bugs without triaging first.**

For each failed test:

1. **Read failure details** from JSON report (error message, stack trace)
2. **Classify the failure:**
   - **Product bug**: Application behaves incorrectly
   - **Test issue**: Test code needs fixing (selector, timing, assertion)
3. **Document classification** for next steps

**Classification Guidelines:**
- **Product Bug**: Correct test code, unexpected application behavior
- **Test Issue**: Selector not found, timeout, race condition, wrong assertion

#### 5.2 Fix Test Issues Automatically

For each test classified as **[TEST ISSUE]**, use the test-debugger-fixer agent to automatically fix the test:

\`\`\`
Use the test-debugger-fixer agent to fix test issues:

For each failed test classified as a test issue (not a product bug), provide:
- Test run timestamp: [from manifest.timestamp]
- Test case ID: [from testCases[].id in manifest]
- Test name/title: [from testCases[].name in manifest]
- Error message: [from testCases[].executions[last].error]
- Execution details path: test-runs/{timestamp}/{testCaseId}/exec-1/

The agent will:
1. Read the execution details from result.json
2. Analyze the failure (error message, trace if available)
3. Identify the root cause (brittle selector, missing wait, race condition, etc.)
4. Apply appropriate fix to the test code
5. Rerun the test with BUGZY_EXECUTION_NUM incremented
6. The custom reporter will automatically create exec-2/ folder
7. Repeat up to 3 times if needed (exec-1, exec-2, exec-3)
8. Report success or escalate as likely product bug

After test-debugger-fixer completes:
- If fix succeeded: Mark test as fixed, add to "Tests Fixed" list
- If still failing after 3 attempts: Reclassify as potential product bug for Step 5.3
\`\`\`

**Track Fixed Tests:**
- Maintain list of tests fixed automatically
- Include fix description (e.g., "Updated selector from CSS to role-based")
- Note verification status (test now passes)

{{ISSUE_TRACKER_INSTRUCTIONS}}

${KNOWLEDGE_BASE_UPDATE_INSTRUCTIONS}

{{TEAM_COMMUNICATOR_INSTRUCTIONS}}

### Step 6: Handle Special Cases

#### If No Test Cases Found
If no test cases match the selection criteria:
1. Inform user that no matching test cases were found
2. List available test cases or suggest running \`/generate-test-cases\` first
3. Provide examples of valid selection criteria

#### If Test Runner Agent Fails
If the test-runner agent encounters issues:
1. Report the specific error
2. Suggest troubleshooting steps
3. Offer to run tests individually if batch execution failed

#### If Test Cases Are Invalid
If selected test cases have formatting issues:
1. Report which test cases are invalid
2. Specify what's missing or incorrect
3. Offer to fix the issues or skip invalid tests

### Important Notes

**Test Selection Strategy**:
- **Always read** \`.bugzy/runtime/test-execution-strategy.md\` before selecting tests
- Default to \`@smoke\` tests for fast validation unless user explicitly requests otherwise
- Smoke tests provide 100% manual test case coverage with zero redundancy (~2-5 min)
- Full regression includes intentional redundancy for diagnostic value (~10-15 min)
- Use context keywords from user request to choose appropriate tier

**Test Execution**:
- Automated Playwright tests are executed via bash command, not through agents
- Test execution time varies by tier (see strategy document for details)
- JSON reports provide structured test results for analysis
- Playwright automatically captures traces, screenshots, and videos on failures
- Test artifacts are stored in test-results/ directory

**Failure Handling**:
- Test failures are automatically triaged (product bugs vs test issues)
- Test issues are automatically fixed by the test-debugger-fixer subagent
- Product bugs are logged via issue tracker after triage
- All results are analyzed for learning opportunities and team communication
- Critical failures trigger immediate team notification

**Related Documentation**:
- \`.bugzy/runtime/test-execution-strategy.md\` - When and why to run specific tests
- \`.bugzy/runtime/testing-best-practices.md\` - How to write tests (patterns and anti-patterns)

`,

  optionalSubagents: [
    {
      role: 'issue-tracker',
      contentBlock: `

#### 5.3 Log Product Bugs via Issue Tracker

After triage in Step 5.1, for tests classified as **[PRODUCT BUG]**, use the issue-tracker agent to log bugs:

For each bug to report, use the issue-tracker agent:

\`\`\`
Use issue-tracker agent to:
1. Check for duplicate bugs in the tracking system
   - The agent will automatically search for similar existing issues
   - It maintains memory of recently reported issues
   - Duplicate detection happens automatically - don't create manual checks

2. For each new bug (non-duplicate):
   Create detailed bug report with:
   - **Title**: Clear, descriptive summary (e.g., "Login button fails with timeout on checkout page")
   - **Description**:
     - What happened vs. what was expected
     - Impact on users
     - Test reference: [file path] › [test title]
   - **Reproduction Steps**:
     - List steps from the failing test
     - Include specific test data used
     - Note any setup requirements from test file
   - **Test Execution Details**:
     - Test file: [file path from JSON report]
     - Test name: [test title from JSON report]
     - Error message: [from JSON report]
     - Stack trace: [from JSON report]
     - Trace file: [path if available]
     - Screenshots: [paths if available]
   - **Environment Details**:
     - Browser and version (from Playwright config)
     - Test environment URL (from .env.testdata BASE_URL)
     - Timestamp of failure
   - **Severity/Priority**: Based on:
     - Test type (smoke tests = high priority)
     - User impact
     - Frequency (always fails vs flaky)
   - **Additional Context**:
     - Error messages or stack traces from JSON report
     - Related test files (if part of test suite)
     - Relevant knowledge from knowledge-base.md

3. Track created issues:
   - Note the issue ID/number returned
   - Update issue tracker memory with new bugs
   - Prepare issue references for team communication
\`\`\`

#### 6.3 Summary of Bug Reporting

After issue tracker agent completes, create a summary:
\`\`\`markdown
### Bug Reporting Summary
- Total bugs found: [count of FAIL tests]
- New bugs reported: [count of newly created issues]
- Duplicate bugs found: [count of duplicates detected]
- Issues not reported: [count of skipped/known issues]

**New Bug Reports**:
- [Issue ID]: [Bug title] (Test: TC-XXX, Priority: [priority])
- [Issue ID]: [Bug title] (Test: TC-YYY, Priority: [priority])

**Duplicate Bugs** (already tracked):
- [Existing Issue ID]: [Bug title] (Matches test: TC-XXX)

**Not Reported** (skipped or known):
- TC-XXX: Skipped due to blocker failure
- TC-YYY: Known issue documented in knowledge base
\`\`\`

**Note**: The issue tracker agent handles all duplicate detection and system integration automatically. Simply provide the bug details and let it manage the rest.`
    },
    {
      role: 'team-communicator',
      contentBlock: `### Step 6: Team Communication

Use the team-communicator agent to notify the product team about test execution:

\`\`\`
Use the team-communicator agent to:
1. Post test execution summary with key statistics
2. Highlight critical failures that need immediate attention
3. Share important learnings about product behavior
4. Report any potential bugs discovered during testing
5. Ask for clarification on unexpected behaviors
6. Provide recommendations for areas needing investigation
7. Use appropriate urgency level based on failure severity
\`\`\`

The team communication should include:
- **Execution summary**: Overall pass/fail statistics and timing
- **Critical issues**: High-priority failures that need immediate attention
- **Key learnings**: Important discoveries about product behavior
- **Potential bugs**: Issues that may require bug reports
- **Clarifications needed**: Unexpected behaviors requiring team input
- **Recommendations**: Suggested follow-up actions

**Communication strategy based on results**:
- **All tests passed**: Brief positive update, highlight learnings
- **Minor failures**: Standard update with failure details and plans
- **Critical failures**: Urgent notification with detailed analysis
- **New discoveries**: Separate message highlighting interesting findings

**Update team communicator memory**:
- Record test execution communication
- Track team response patterns to test results
- Document any clarifications provided by the team
- Note team priorities based on their responses`
    }
  ],
  requiredSubagents: ['test-runner', 'test-debugger-fixer']
};
