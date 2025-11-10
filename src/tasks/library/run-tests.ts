/**
 * Run Tests Task
 * Select and run test cases using the test-runner agent
 */

import { TaskTemplate } from '../types';
import { TASK_SLUGS } from '../constants';

export const runTestsTask: TaskTemplate = {
  slug: TASK_SLUGS.RUN_TESTS,
  name: 'Run Tests',
  description: 'Execute automated Playwright tests, analyze failures, and fix test issues automatically',

  frontmatter: {
    description: 'Execute automated Playwright tests, analyze failures, and fix test issues automatically',
    'allowed-tools': 'Read, Bash, Glob, Grep, Task',
    'argument-hint': '[file-pattern|tag|all] (e.g., "auth", "@smoke", "tests/specs/login.spec.ts")',
  },

  baseContent: `# Run Tests Command

## SECURITY NOTICE
**CRITICAL**: Never read the \`.env\` file. It contains ONLY secrets (passwords, API keys).
- **Read \`.env.example\`** for non-secret environment variables (TEST_BASE_URL, TEST_OWNER_EMAIL, etc.)
- \`.env.example\` contains actual values for test data, URLs, and non-sensitive configuration
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

## Process

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
npx playwright test [selector] --reporter=json
\`\`\`

**For tag**:
\`\`\`bash
npx playwright test --grep "[tag]" --reporter=json
\`\`\`

**For all tests**:
\`\`\`bash
npx playwright test --reporter=json
\`\`\`

**Output**: JSON report will be written to \`test-results/.last-run.json\` or configure custom path with \`--reporter=json,outputFile=results.json\`

#### 2.2 Execute Tests via Bash
Run the Playwright command:
\`\`\`bash
npx playwright test [selector] --reporter=json --output=test-results/
\`\`\`

Wait for execution to complete. This may take several minutes depending on test count.

#### 2.3 Locate and Read JSON Report
After execution completes, find and read the JSON report:

1. Check for report file:
   \`\`\`bash
   ls test-results/.last-run.json
   # OR
   ls results.json
   \`\`\`

2. Read the JSON report file to analyze results

### Step 3: Analyze Test Results from JSON Report

#### 3.1 Parse JSON Report
The Playwright JSON reporter produces structured output with:
\`\`\`json
{
  "suites": [
    {
      "title": "Test suite name",
      "file": "tests/specs/auth/login.spec.ts",
      "specs": [
        {
          "title": "should login successfully",
          "ok": true,
          "tests": [
            {
              "status": "passed",
              "duration": 1234
            }
          ]
        },
        {
          "title": "should show error for invalid credentials",
          "ok": false,
          "tests": [
            {
              "status": "failed",
              "duration": 2345,
              "error": {
                "message": "expect(locator).toBeVisible()\\n\\nCall log:\\n- expect.toBeVisible with timeout 5000ms\\n- waiting for locator('.error-message')\\n\\nTimeout 5000ms exceeded.",
                "stack": "Error: expect(locator).toBeVisible()..."
              }
            }
          ]
        }
      ]
    }
  ],
  "stats": {
    "total": 10,
    "expected": 8,
    "unexpected": 2,
    "skipped": 0
  }
}
\`\`\`

#### 3.2 Extract Test Results
From the JSON report, extract:
- **Total tests**: Number of tests executed
- **Passed tests**: Tests with status "passed"
- **Failed tests**: Tests with status "failed" or "timedOut"
- **Skipped tests**: Tests with status "skipped"
- **Duration**: Total execution time

For each failed test, collect:
- Test file path
- Test title/name
- Error message
- Stack trace
- Duration
- Any attached screenshots or traces

#### 3.3 Generate Summary Statistics
\`\`\`markdown
## Test Execution Summary
- Total Tests: [count]
- Passed: [count] ([percentage]%)
- Failed: [count] ([percentage]%)
- Skipped: [count] ([percentage]%)
- Total Duration: [time]
\`\`\`

### Step 5: Learning Integration

**Extract and document learnings from test results:**

Based on test execution outcomes, identify and document key learnings:

#### 5.1 Analyze Test Results for Learnings
For each test result, identify:
- **New behaviors discovered**: Undocumented functionality or behaviors
- **Failure patterns**: Common failure points or error patterns
- **Performance insights**: Response times, loading issues
- **Browser compatibility**: Issues specific to certain browsers
- **User experience insights**: Usability issues or friction points
- **Test improvements**: Steps that need refinement

#### 5.2 Document Learnings
Update \`learnings.md\` with new insights:
\`\`\`markdown
## [Date] - Test Run Learnings

**Test Execution**: [Test selection criteria and count]
**Overall Results**: [Pass/fail summary]

**Key Learnings**:
1. [Learning about product behavior]
2. [Learning about test process]
3. [Learning about system reliability]

**Test Case Updates Needed**:
- [Test cases that need refinement]
- [New test scenarios discovered]

**Potential Issues for Investigation**:
- [Failures that might indicate bugs]
- [Unexpected behaviors to explore]
\`\`\`

### Step 6: Triage Failed Tests

After analyzing test results, triage each failure to determine if it's a product bug or test issue:

#### 6.0 Triage Failed Tests FIRST

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

#### 6.1 Fix Test Issues Automatically

For each test classified as **[TEST ISSUE]**, use the test-debugger-fixer agent to automatically fix the test:

\`\`\`
Use the test-debugger-fixer agent to fix test issues:

For each failed test classified as a test issue (not a product bug), provide:
- Test file path: [from JSON report]
- Test name/title: [from JSON report]
- Error message: [from JSON report]
- Stack trace: [from JSON report]
- Trace file path: [if available]

The agent will:
1. Read the failing test file
2. Analyze the failure details
3. Open browser via Playwright MCP to debug if needed
4. Identify the root cause (brittle selector, missing wait, race condition, etc.)
5. Apply appropriate fix to the test code
6. Rerun the test to verify the fix
7. Repeat up to 3 times if needed
8. Report success or escalate as likely product bug

After test-debugger-fixer completes:
- If fix succeeded: Mark test as fixed, add to "Tests Fixed" list
- If still failing after 3 attempts: Reclassify as potential product bug for Step 6.1
\`\`\`

**Track Fixed Tests:**
- Maintain list of tests fixed automatically
- Include fix description (e.g., "Updated selector from CSS to role-based")
- Note verification status (test now passes)

{{ISSUE_TRACKER_INSTRUCTIONS}}

{{TEAM_COMMUNICATOR_INSTRUCTIONS}}

### Step 8: Handle Special Cases

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

- Automated Playwright tests are executed via bash command, not through agents
- Test execution may take several minutes depending on the number and complexity of tests
- JSON reports provide structured test results for analysis
- Test failures are automatically triaged (product bugs vs test issues)
- Test issues are automatically fixed by the test-debugger-fixer subagent
- Product bugs are logged via issue tracker after triage
- All results are analyzed for learning opportunities and team communication
- Critical failures trigger immediate team notification
- Consider running smoke tests first (@smoke tag) for quick validation before full test suites
- Playwright automatically captures traces, screenshots, and videos on failures
- Test artifacts are stored in test-results/ directory
- Reference .bugzy/runtime/testing-best-practices.md for test patterns and anti-patterns
`,

  optionalSubagents: [
    {
      role: 'issue-tracker',
      contentBlock: `

#### 6.2 Log Product Bugs via Issue Tracker

After triage in Step 6.0, for tests classified as **[PRODUCT BUG]**, use the issue-tracker agent to log bugs:

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
     - Test environment URL (from .env.example BASE_URL)
     - Timestamp of failure
   - **Severity/Priority**: Based on:
     - Test type (smoke tests = high priority)
     - User impact
     - Frequency (always fails vs flaky)
   - **Additional Context**:
     - Error messages or stack traces from JSON report
     - Related test files (if part of test suite)
     - Relevant learnings from learnings.md

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
- TC-YYY: Known issue documented in learnings
\`\`\`

**Note**: The issue tracker agent handles all duplicate detection and system integration automatically. Simply provide the bug details and let it manage the rest.`
    },
    {
      role: 'team-communicator',
      contentBlock: `### Step 7: Team Communication

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
