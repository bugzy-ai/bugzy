# Question Message Handler

Instructions for processing questions about the project, tests, coverage, or testing status.

## Detection Criteria

This handler applies when:
- Message contains question words (what, how, which, where, why, when, do, does, is, are, can)
- Question relates to tests, test plan, coverage, test results, or project artifacts
- User is seeking information, NOT requesting an action
- Intent field from LLM layer is `question`

## Processing Steps

### Step 1: Classify Question Type

Analyze the question to determine the primary type:

| Type | Indicators | Primary Context Sources |
|------|------------|------------------------|
| **Coverage** | "what tests", "do we have", "is there a test for", "covered" | test-cases/, test-plan.md |
| **Results** | "did tests pass", "what failed", "test results", "how many" | test-runs/ |
| **Knowledge** | "how does", "what is", "explain", feature/component questions | knowledge-base.md |
| **Plan** | "what's in scope", "test plan", "testing strategy", "priorities" | test-plan.md |
| **Process** | "how do I", "when should", "what's the workflow" | project-context.md |

### Step 2: Load Relevant Context

Based on question type, load the appropriate files:

**For Coverage questions**:
1. Read `test-plan.md` for overall test strategy
2. List files in `./test-cases/` directory
3. Search test case files for relevant keywords

**For Results questions**:
1. List directories in `./test-runs/` (sorted by date, newest first)
2. Read `summary.json` from relevant test run directories
3. Extract pass/fail counts, failure reasons

**For Knowledge questions**:
1. Read `.bugzy/runtime/knowledge-base.md`
2. Search for relevant entries
3. Also check test-plan.md for feature descriptions

**For Plan questions**:
1. Read `test-plan.md`
2. Extract relevant sections (scope, priorities, features)

**For Process questions**:
1. Read `.bugzy/runtime/project-context.md`
2. Check for workflow documentation

### Step 3: Formulate Answer

Compose the answer following these guidelines:

1. **Be specific**: Quote relevant sections from source files
2. **Cite sources**: Mention which files contain the information
3. **Structure clearly**: Use bullet points for multiple items
4. **Quantify when possible**: "We have 12 test cases covering login..."
5. **Acknowledge gaps**: If information is incomplete, say so

### Step 4: Offer Follow-up

End responses with:
- Offer to provide more detail if needed
- Suggest related information that might be helpful
- For coverage gaps, offer to create test cases

## Response Guidelines

**Structure**:
```
[Direct answer to the question]

[Supporting details/evidence with file references]

[Optional: Related information or follow-up offer]
```

**Examples**:

For "Do we have tests for login?":
```
Yes, we have 4 test cases covering the login feature:
- TC-001: Successful login with valid credentials
- TC-002: Login failure with invalid password
- TC-003: Login with remember me option
- TC-004: Password reset flow

These are documented in ./test-cases/TC-001.md through TC-004.md.
Would you like details on any specific test case?
```

For "How many tests passed in the last run?":
```
The most recent test run (2024-01-15 14:30) results:
- Total: 24 tests
- Passed: 21 (87.5%)
- Failed: 3

Failed tests:
- TC-012: Checkout timeout (performance issue)
- TC-015: Image upload failed (file size validation)
- TC-018: Search pagination broken

Results are in ./test-runs/20240115-143000/summary.json
```

## Context Loading Requirements

Required (based on question type):
- [ ] Test plan (`test-plan.md`) - for coverage, plan, knowledge questions
- [ ] Test cases (`./test-cases/`) - for coverage questions
- [ ] Test runs (`./test-runs/`) - for results questions
- [ ] Knowledge base (`.bugzy/runtime/knowledge-base.md`) - for knowledge questions
- [ ] Project context (`.bugzy/runtime/project-context.md`) - for process questions

## Memory Updates

None required - questions are read-only operations. No state changes needed.
