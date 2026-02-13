# Status Message Handler

Instructions for processing status requests about tests, tasks, or executions.

## Detection Criteria

This handler applies when:
- User asks about progress or status
- Keywords present: "status", "progress", "how is", "what happened", "results", "how did", "update on"
- Questions about test runs, task completion, or execution state
- Intent field from LLM layer is `status`

## Processing Steps

### Step 1: Identify Status Scope

Determine what the user is asking about:

| Scope | Indicators | Data Sources |
|-------|------------|--------------|
| **Latest test run** | "last run", "recent tests", "how did tests go" | Most recent test-runs/ directory |
| **Specific test** | Test ID mentioned (TC-XXX), specific feature name | test-runs/*/TC-XXX/, test-cases/TC-XXX.md |
| **All tests / Overall** | "overall", "all tests", "test coverage", "pass rate" | All test-runs/ summaries |
| **Specific feature** | Feature name mentioned | Filter test-runs by feature |
| **Task progress** | "is the task done", "what's happening with" | team-communicator memory |

### Step 2: Gather Status Data

**For Latest Test Run**:
1. List directories in `./test-runs/` sorted by name (newest first)
2. Read `summary.json` from the most recent directory
3. Extract: total tests, passed, failed, skipped, execution time
4. For failures, extract brief failure reasons

**For Specific Test**:
1. Find test case file in `./test-cases/TC-XXX.md`
2. Search test-runs for directories containing this test ID
3. Get most recent result for this specific test
4. Include: last run date, result, failure reason if failed

**For Overall Status**:
1. Read all `summary.json` files in test-runs/
2. Calculate aggregate statistics:
   - Total runs in period (last 7 days, 30 days, etc.)
   - Overall pass rate
   - Most commonly failing tests
   - Trend (improving/declining)

**For Task Progress**:
1. Read `.bugzy/runtime/memory/team-communicator.md`
2. Check for active tasks, blocked tasks, recently completed tasks
3. Extract relevant task status

### Step 3: Format Status Report

Present status clearly and concisely:

**For Latest Test Run**:
```
Test Run: [YYYYMMDD-HHMMSS]
Status: [Completed/In Progress]

Results:
- Total: [N] tests
- Passed: [N] ([%])
- Failed: [N] ([%])
- Skipped: [N]

[If failures exist:]
Failed Tests:
- [TC-XXX]: [Brief failure reason]
- [TC-YYY]: [Brief failure reason]

Duration: [X minutes]
```

**For Specific Test**:
```
Test: [TC-XXX] - [Test Name]

Latest Result: [Passed/Failed]
Run Date: [Date/Time]

[If failed:]
Failure Reason: [reason]
Last Successful: [date if known]

[If passed:]
Consecutive Passes: [N] (since [date])
```

**For Overall Status**:
```
Test Suite Overview (Last [N] Days)

Total Test Runs: [N]
Average Pass Rate: [%]

Trend: [Improving/Stable/Declining]

Most Reliable Tests:
- [TC-XXX]: [100%] pass rate
- [TC-YYY]: [100%] pass rate

Flaky/Failing Tests:
- [TC-ZZZ]: [40%] pass rate - [common failure reason]
- [TC-AAA]: [60%] pass rate - [common failure reason]

Last Run: [date/time] - [X/Y passed]
```

### Step 4: Provide Context and Recommendations

Based on the status:

**For failing tests**:
- Suggest reviewing the test case
- Mention if this is a new failure or recurring
- Link to relevant knowledge base entries if they exist

**For overall declining trends**:
- Highlight which tests are causing the decline
- Suggest investigation areas

**For good results**:
- Acknowledge the healthy state
- Mention any tests that were previously failing and are now passing

## Response Guidelines

- Lead with the most important information (pass/fail summary)
- Use clear formatting (bullet points, percentages)
- Include timestamps so users know data freshness
- Offer to drill down into specifics if summary was given
- Keep responses scannable - use structure over paragraphs

## Context Loading Requirements

Required (based on scope):
- [ ] Test runs (`./test-runs/`) - for any test status
- [ ] Test cases (`./test-cases/`) - for specific test details
- [ ] Team communicator memory (`.bugzy/runtime/memory/team-communicator.md`) - for task status

## Memory Updates

None required - status checks are read-only operations. No state changes needed.
