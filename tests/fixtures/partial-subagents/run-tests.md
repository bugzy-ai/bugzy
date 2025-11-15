---
subcommand_name: run-tests
description: Select and run test cases using the test-runner agent
allowed-tools: 'Read, LS, Glob, Grep, Task'
argument-hint: '[test-id|tag|type|all] --filter [optional-filter]'
---
# Run Tests Command

## SECURITY NOTICE
**CRITICAL**: Never read the `.env` file. It contains ONLY secrets (passwords, API keys).
- **Read `.env.testdata`** for non-secret environment variables (TEST_BASE_URL, TEST_OWNER_EMAIL, etc.)
- `.env.testdata` contains actual values for test data, URLs, and non-sensitive configuration
- For secrets: Reference variable names only (TEST_OWNER_PASSWORD) - values are injected at runtime
- The `.env` file access is blocked by settings.json

Select and execute test cases using the test-runner agent based on various criteria.

## Arguments
Arguments: $ARGUMENTS

## Parse Arguments
Extract the following from arguments:
- **selector**: Test selection criteria (test ID, tag, type, or "all")
- **filter**: Optional additional filter (e.g., priority, status)

## Process

### Step 1: Identify Test Cases to Run

#### 1.1 List Available Test Cases
Check the `./test-cases/` directory for available test case files:
```bash
ls ./test-cases/
```

#### 1.2 Parse Selection Criteria
Based on the provided arguments, determine which test cases to run:

**If specific test ID provided** (e.g., TC-001, TC-002):
- Look for exact match: `./test-cases/TC-XXX-*.md`

**If test type provided** (exploratory, functional, regression, smoke):
- Search for all test cases with matching type in frontmatter
- Use grep to find files with `type: [specified-type]`

**If tag provided**:
- Search for test cases containing the specified tag in frontmatter
- Use grep to find files with the tag in the `tags:` field

**If "all" specified**:
- Select all test cases in the directory

**If priority filter provided**:
- Further filter selected test cases by priority (high, medium, low)

### Step 2: Validate Selected Test Cases

For each selected test case:
1. Read the file to ensure it exists and is valid
2. Check that the test case has:
   - Valid frontmatter with required fields (id, title, type, status)
   - Test steps section
   - Expected result section
3. Collect test case metadata (ID, title, priority, type, **dependencies, blocker, requires_auth**)

### Step 2.5: Parse Dependencies and Build Execution Order

🚨 **BLOCKER TESTS**: Tests with `blocker: true` will stop dependent tests if they fail, saving time and preventing cascading false failures

Analyze dependencies and sort tests for optimal execution:

#### 2.5.1 Extract Dependency Information
For each selected test case, extract from frontmatter:
- `id`: Test case ID (e.g., TC-001)
- `dependencies`: Array of TC-IDs this test depends on
- `blocker`: Boolean indicating if failure blocks dependent tests
- `requires_auth`: Boolean indicating authentication requirement

#### 2.5.2 Build Dependency Graph
Create a directed graph structure:
```
Example:
TC-001 (blocker=true) → [TC-003, TC-004, TC-005, TC-006]
TC-003 (blocker=false) → []
TC-004 (blocker=false) → []
```

#### 2.5.3 Topological Sort for Execution Order
Sort tests so that:
1. **Blocker tests run first** (tests with blocker=true)
2. **Dependencies run before dependents**
3. **Independent tests can run in any order**

Algorithm:
```
1. Identify all tests with no dependencies → add to execution list
2. For remaining tests, add to list only after all dependencies are added
3. Result: Tests in dependency-respecting order
```

Example ordering:
```
Input: TC-005, TC-003, TC-001, TC-004
Dependencies:
  TC-001: [] (no deps, blocker=true)
  TC-003: [TC-001]
  TC-004: [TC-001]
  TC-005: [TC-001]

Output: TC-001, TC-003, TC-004, TC-005
```

#### 2.5.4 Identify Blocker Tests

🚨 **Critical**: Create a blocker tracking list:
```
blocker_tests = {
  "TC-001": {
    name: "Login and Authentication",
    dependents: ["TC-003", "TC-004", "TC-005", "TC-006"]
  }
}
```

**Why this matters:**
- If TC-001 fails, ALL dependent tests (TC-003, TC-004, TC-005, TC-006) will be automatically skipped
- This prevents wasting time (~8-10 minutes) on tests that cannot succeed without login
- Skipped tests are tracked separately from failures in the final report
- Time savings are calculated and reported (assume ~2 min per skipped test)

This list will be used to track failed blockers during execution and generate skip analysis.

### Step 3: Execute Test Cases

#### 3.1 Create Test Run Folder
Create a single test-run folder for this entire test execution session:

1. Generate a timestamp for this test run:
   ```bash
   date +"%Y%m%d-%H%M%S"
   ```

2. Create the test-run folder:
   ```bash
   mkdir -p ./test-runs/[YYYYMMDD-HHMMSS]
   ```

3. Store the folder path for use in all test executions.

**Important**: This folder will be shared across ALL test cases in this run to keep results organized together.

#### 3.2 Prepare Test Execution
Create a summary of test cases to be executed:
```
Test Execution Plan:
- Total test cases: [count]
- Types: [list of types]
- Priorities: [distribution]
- Test IDs: [list of IDs]
- Test Run Folder: ./test-runs/[YYYYMMDD-HHMMSS]
```

#### 3.3 Run Tests with Blocker Evaluation

Before each test execution, evaluate if test should be skipped due to blocker failures:

Initialize tracking variables:
```
failed_tests = []        # List of test IDs that failed
failed_blockers = []     # List of blocker test IDs that failed
skipped_tests = []       # List of test IDs that were skipped
```

For each test case (in dependency-sorted order from Step 2.5):

**STEP 3.3.1: Evaluate Dependencies Before Execution**
```
Check if test should be skipped:

IF test has dependencies:
  FOR each dependency_id in test.dependencies:
    IF dependency_id in failed_tests OR dependency_id in skipped_tests:
      # This test must be skipped
      SKIP_ACTION = true

      # Find the root cause (blocker failure)
      IF dependency_id in failed_blockers:
        SKIP_REASON = "Dependency failed: {dependency_id} ({test_name}) - {failure_reason}"
      ELSE:
        SKIP_REASON = "Dependency skipped: {dependency_id} ({test_name})"

      # Generate skip result without execution
      GO TO Step 3.3.3 (Generate Skip Result)
```

**STEP 3.3.2: Execute Test (if not skipped)**
If test should NOT be skipped, invoke the test-runner agent:

```
Use the test-runner agent to execute the test case at [test-case-file-path].

**CRITICAL**: Provide the test-run folder path as a parameter:
- test_run_folder: ./test-runs/[YYYYMMDD-HHMMSS]

The agent MUST use this folder and should NOT create a new timestamped folder.
All test artifacts must be stored in: [test_run_folder]/[TEST-ID]/

The agent should:
1. Parse the test case file to get the test ID
2. Create a subfolder: [test_run_folder]/[TEST-ID]/
3. Execute the browser automation steps (video recording is automatic with --save-video)
4. After test execution, record video filename from .playwright-mcp/ folder:
   - Find the latest video file in .playwright-mcp/ folder (look for .webm files)
   - Store ONLY the filename in summary.json (do NOT copy or move the video)
   - Record video metadata (size, duration)
5. Generate structured test artifacts following the schema in `.bugzy/runtime/templates/test-result-schema.md`:
   - summary.json (test outcome with video filename reference and failure details)
   - steps.json (structured steps with timestamps, video times, and detailed descriptions)
   - Video file remains in .playwright-mcp/ folder (external service uploads to GCS)
6. Return detailed execution report including:
   - Pass/fail status
   - Execution time
   - Failed steps (if any)
   - Video file location and size
   - Any errors or issues encountered (should be in summary.json's failureReason)
   - Artifact location: [test_run_folder]/[TEST-ID]/

Note: All test information must go into the 3 required files. Do not generate test-log.md or findings.md - this information belongs in steps.json and summary.json respectively.
```

**STEP 3.3.3: Generate Skip Result (no execution)**

If test is being skipped (from Step 3.3.1):

1. Create test case folder: `[test_run_folder]/[TEST-ID]/`

2. Generate `summary.json` with SKIP status:
   ```json
   {
     "testRun": {
       "id": "TC-XXX",
       "testCaseName": "[Test case name]",
       "status": "SKIP",
       "type": "[test type]",
       "priority": "[priority]",
       "skipReason": "[SKIP_REASON from Step 3.3.1]",
       "duration": { "minutes": 0, "seconds": 0 }
     },
     "executionSummary": {
       "totalPhases": 0,
       "phasesCompleted": 0,
       "overallResult": "Test skipped due to dependency failure"
     },
     "metadata": {
       "executionId": "[from BUGZY_EXECUTION_ID env var]",
       "startTime": "[current timestamp]",
       "endTime": "[current timestamp]",
       "testRunFolder": "[test_run_folder]"
     }
   }
   ```

3. Generate `steps.json` with empty steps:
   ```json
   {
     "steps": [],
     "summary": {
       "totalSteps": 0,
       "successfulSteps": 0,
       "failedSteps": 0,
       "skippedSteps": 0,
       "skipNote": "Test was not executed because dependency [DEP-ID] failed or was skipped"
     }
   }
   ```

4. Add test ID to `skipped_tests` list
5. Report: "SKIPPED TC-XXX: [test name] (Reason: [SKIP_REASON])"
6. Continue to next test

**STEP 3.3.4: Post-Execution Tracking**
After test-runner agent completes (or after generating skip result):

1. **Record test outcome:**
   ```
   IF test was executed (Step 3.3.2):
     - Parse test result from agent output
     - status = PASS or FAIL
     - IF status is FAIL:
       - Add test.id to failed_tests list
       - IF test.blocker is true:
         - Add test.id to failed_blockers list
         - Report: "⚠️ BLOCKER FAILURE: {test.id} - Dependent tests will be skipped"
     - ELSE:
       - Report: "✅ PASSED: {test.id}"

   IF test was skipped (Step 3.3.3):
     - Add test.id to skipped_tests list
     - Report: "⏭️ SKIPPED: {test.id}"
   ```

2. **Continue to next test** in execution order

### Step 4: Aggregate Results with Skip Analysis

After all test cases have been executed:

#### 4.1 Collect Results
Gather all test execution results from the test-runner agent outputs

#### 4.2 Generate Enhanced Summary Report with Skip Analysis
Create a comprehensive test execution summary:
```markdown
## Test Execution Summary

### Overall Statistics
- Total Tests: [count]
- **Executed: [count]**
- Passed: [count] ([percentage]%)
- Failed: [count] ([percentage]%)
- **Skipped: [count] ([percentage]%)**
- **Time Saved by Skipping: [estimated minutes]** (assume ~2 min per skipped test)
- Total Execution Time: [actual time spent]

### Results by Type
- Smoke Tests: [passed]/[executed] (skipped: [count])
- Functional Tests: [passed]/[executed] (skipped: [count])
- Regression Tests: [passed]/[executed] (skipped: [count])
- Exploratory Tests: [passed]/[executed] (skipped: [count])

### Blocker Analysis

Show blocker impact if any blockers failed:

IF any blocker tests failed:
  ```
  ⚠️ Critical Blocker Failure Detected

  Failed Blocker: TC-XXX ([Test name])
  Failure Reason: [failure reason from summary.json]
  Impact: [N] dependent tests were automatically skipped
  Affected Tests: [list of skipped test IDs]

  Dependency Impact Visualization:
  TC-XXX ([Test name]) [FAILED] ❌
    ├── TC-YYY ([Test name]) [SKIPPED] ⏭️
    ├── TC-ZZZ ([Test name]) [SKIPPED] ⏭️
    └── TC-AAA ([Test name]) [SKIPPED] ⏭️
  ```

### Failed Tests
[List each failed test with:
- Test ID and title
- Failure reason (from summary.json failureReason)
- Failed step
- Whether this is a blocker test
- Link to detailed report in test-runs folder]

### Skipped Tests

List skipped tests with skip reasons:

[For each skipped test:
- Test ID and title
- Skip reason (from summary.json skipReason)
- Which dependency caused the skip
- Estimated time saved]

### Passed Tests
[List of passed test IDs and titles]

### Recommendations
[Based on results, suggest:
- **If blocker failed: Fix the blocker test first, then re-run dependent tests**
- Tests that need investigation
- Potential bugs to report
- Areas needing more test coverage
- Suggested re-run command for skipped tests after fixing blocker]

Example:
"Fix TC-001 (Login) first, then re-run with: /run-tests TC-003 TC-004 TC-005 TC-006"
```

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
Update `knowledge-base.md` with new insights:
```markdown
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
```

### Step 6: Issue Tracking

After analyzing test results, report any bugs discovered during test execution:

#### 6.0 ⚠️ CRITICAL: Triage Failed Tests FIRST

**⚠️ IMPORTANT: Do NOT report bugs without triaging first. The TODO-456 incident showed how untriaged test failures can lead to reporting expected behavior as bugs.**

Before reporting bugs, understand why tests failed through exploration and clarification:

**For each failed test (status: FAIL):**

**Step 1: Quick Exploration** (if failure reason unclear)

Understand actual vs. expected behavior through adaptive exploration:

**Assess Clarity:**
- Clear failure reason → Quick exploration (1-2 min)
- Vague failure → Moderate exploration (3-5 min)
- Unclear/ambiguous → Deep exploration (5-10 min)

**Exploration Steps:**
1. Navigate and manually test the failed scenario
2. Capture screenshots and document observations
3. Compare actual behavior vs. test expectations
4. Key questions:
   - What actually happened vs. what the test expected?
   - Has behavior changed recently (deployment, feature update)?
   - Is this failure a bug or an expected change?
   - Can you reproduce the failure manually?

**Document Findings:**
- Current behavior observed (with concrete examples)
- Expected behavior per test case
- Discrepancies identified
- Screenshots/evidence captured

**Step 2: Assess Ambiguity and Clarify**

If exploration reveals ambiguity about whether this is a bug:

**Detect Ambiguity Signals:**
- Vague expectations in test case
- Missing acceptance criteria
- Multiple valid interpretations
- Contradictory information
- Quick check: Can you determine PASS/FAIL without assumptions?

**Assess Severity:**

| Severity | When to Use | Action |
|----------|------------|--------|
| 🔴 **CRITICAL** | Expected behavior completely undefined; cannot determine if bug or feature | **STOP** - Seek clarification before reporting |
| 🟠 **HIGH** | Core functionality unclear; failure could be bug OR intentional change | **STOP** - Seek clarification before reporting |
| 🟡 **MEDIUM** | Specific details missing but general direction clear; low-risk assumptions possible | **DOCUMENT** assumptions, proceed with classification, ask async clarification |
| 🟢 **LOW** | Minor edge case or cosmetic difference; minimal impact | **MARK** for future clarification, proceed with classification |

**Check Memory First:**
- Query team-communicator memory for similar past clarifications
- Search by feature name, ambiguity pattern, or ticket keywords
- If similar question was answered before, use that answer

**Clarify if Needed (for CRITICAL/HIGH):**
- Formulate specific, concrete questions with context
- Provide exploration findings as evidence
- Offer options if possible
- Use team-communicator for Slack triggers
- **WAIT** for response before proceeding

**Common triage ambiguity scenarios:**
- **CRITICAL**: Test expects specific behavior but unclear what's correct (e.g., TODO-456 "fix sorting" - should completed todos appear in main list or archive?)
- **HIGH**: Failure might be due to intentional changes not documented in test plan
- **MEDIUM**: Unclear if edge case bug or expected behavior for that scenario
- **LOW**: Minor visual differences that might be acceptable

**Step 3: Classify the Failure**

Based on exploration and clarification, categorize each failure:

1. **Confirmed Bug** → Proceed to Step 6.1 to report via issue tracker
   - Actual product defect confirmed
   - Behavior doesn't match requirements
   - Not an expected change

2. **Test Needs Update** → Update test case instead of reporting bug
   - Behavior changed intentionally
   - Test expectations are outdated
   - Document in learnings and update test

3. **Known Issue** → Skip reporting
   - Already documented in knowledge-base.md
   - Already tracked in issue system (check issue-tracker memory)
   - Accepted limitation or won't-fix

4. **Unclear/Blocked** → Wait for clarification
   - Team needs to confirm expected behavior
   - Cannot determine if bug or feature
   - Document uncertainty and pause bug reporting

**Document Triage Results:**

For each failed test, create quick classification:
```
TC-XXX: [CONFIRMED BUG] - Actual defect verified via exploration
  Reason: [Brief description of why this is a bug]
  Evidence: [Observation from exploration]

TC-YYY: [TEST UPDATE NEEDED] - Intentional change, update test
  Reason: [Why test needs updating]
  Evidence: [What changed]

TC-ZZZ: [KNOWN ISSUE] - Already tracked/documented
  Reason: [Reference to existing issue or learning]

TC-AAA: [UNCLEAR - BLOCKED] - Awaiting clarification
  Reason: [What is ambiguous]
  Question Asked: [Clarification question]
```

**⚠️ Only proceed to Step 6.1 with tests classified as [CONFIRMED BUG]**

This triage ensures we only report legitimate bugs and avoid noise from expected changes or test issues (lesson from TODO-456).

#### 6.1 Identify Bugs to Report

Review the **triaged** failed tests from Step 6.0 and report only those classified as **Confirmed Bugs**:

**Report bugs for** (from triage Step 6.0, classification: "Confirmed Bug"):
- Tests classified as actual product defects after exploration
- Unexpected errors or exceptions confirmed to be product bugs
- Incorrect behavior that doesn't match clarified requirements
- Performance issues confirmed as regressions (not infrastructure)
- UI rendering problems verified as bugs (not expected changes)
- Data validation failures confirmed as product defects

**Do NOT report bugs for** (these should be handled in triage Step 6.0):
- Tests with status SKIP (skipped due to blocker failures, not bugs)
- Failures classified as "Test Needs Update" (handle via test case updates)
- Failures classified as "Known Issue" (already documented or tracked)
- Failures classified as "Unclear" (wait for clarification before reporting)
- Test infrastructure issues (not product bugs)

**Note**: Step 6.0 triage uses exploration + clarification to ensure we only report legitimate bugs. This prevents the issue from TODO-456 where a test failure was treated as a bug without understanding whether the behavior was expected.

#### 6.2 Use Issue Tracker Agent

For each bug to report, use the issue-tracker agent:

```
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
     - Test case reference: TC-XXX
   - **Reproduction Steps**:
     - Copy steps from the test case file
     - Include specific test data used
     - Note any preconditions (e.g., "requires_auth: true")
   - **Test Execution Details**:
     - Test run folder: [test_run_folder]/[TEST-ID]/
     - Failure reason from summary.json
     - Failed step information from steps.json
     - Video file reference (if available)
   - **Environment Details**:
     - Browser and version
     - Test environment URL
     - Timestamp of failure
   - **Severity/Priority**: Based on:
     - Test priority (high/medium/low)
     - User impact
     - Blocker status (if this is a blocker test)
   - **Additional Context**:
     - Error messages or stack traces
     - Related test cases (dependencies)
     - Relevant learnings from knowledge-base.md

3. Track created issues:
   - Note the issue ID/number returned
   - Update issue tracker memory with new bugs
   - Prepare issue references for team communication
```

#### 6.3 Summary of Bug Reporting

After issue tracker agent completes, create a summary:
```markdown
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
```

**Note**: The issue tracker agent handles all duplicate detection and system integration automatically. Simply provide the bug details and let it manage the rest.

### Step 7: Team Communication

Use the team-communicator agent to notify the product team about test execution:

```
Use the team-communicator agent to:
1. Post test execution summary with key statistics
2. Highlight critical failures that need immediate attention
3. Share important learnings about product behavior
4. Report any potential bugs discovered during testing
5. Ask for clarification on unexpected behaviors
6. Provide recommendations for areas needing investigation
7. Use appropriate urgency level based on failure severity
```

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
- Note team priorities based on their responses

### Step 8: Handle Special Cases

#### If No Test Cases Found
If no test cases match the selection criteria:
1. Inform user that no matching test cases were found
2. List available test cases or suggest running `/generate-test-cases` first
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

- The test-runner agent handles all browser automation and result capture
- Test execution may take significant time depending on the number and complexity of tests
- All results are analyzed for learning opportunities and team communication
- Critical failures trigger immediate team notification
- Test results feed back into the learning system for continuous improvement
- Consider running smoke tests first for quick validation before full test suites
- Video recording is automatic with --save-video flag (already configured in MCP)
- Videos remain in .playwright-mcp/ folder - external service uploads to GCS (do NOT copy or move)
- Test results follow the schema defined in `.bugzy/runtime/templates/test-result-schema.md`
- Steps must include video timestamps for UI synchronization
