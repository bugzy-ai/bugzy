# Feedback Message Handler

Instructions for processing bug reports, test observations, and user feedback.

## Detection Criteria

This handler applies when:
- User reports an issue, bug, or unexpected behavior
- User shares test results or observations
- User provides information (not asking a question or requesting action)
- Keywords present: "found", "issue", "bug", "doesn't work", "broken", "observed", "noticed", "failed", "error"
- Intent field from LLM layer is `feedback`
- Re-routed from clarification handler (thread reply with no blocked task)

## Processing Steps

### Step 1: Parse Feedback

Extract the following from the message:

| Field | Description | Examples |
|-------|-------------|----------|
| **Type** | Category of feedback | `bug_report`, `test_result`, `observation`, `suggestion`, `general` |
| **Severity** | Impact level | `critical`, `high`, `medium`, `low` |
| **Component** | Affected area | "login", "checkout", "search", etc. |
| **Description** | Core issue description | What happened |
| **Expected** | What should happen (if stated) | Expected behavior |
| **Steps** | How to reproduce (if provided) | Reproduction steps |

**Type Detection**:
- `bug_report`: "bug", "broken", "doesn't work", "error", "crash"
- `test_result`: "test passed", "test failed", "ran tests", "testing showed"
- `observation`: "noticed", "observed", "found that", "saw that"
- `suggestion`: "should", "could we", "what if", "idea"
- `general`: Default for unclassified feedback

### Step 2: Check for Duplicates

Search the knowledge base for similar entries:

1. Read `.bugzy/runtime/knowledge-base.md`
2. Search for:
   - Same component + similar symptoms
   - Matching keywords from the description
   - Recent entries (last 30 days) with similar patterns
3. If duplicate found:
   - Reference the existing entry
   - Note any new information provided
   - Update existing entry if new details are valuable

### Step 3: Update Knowledge Base

Add or update entry in `.bugzy/runtime/knowledge-base.md`:

**For Bug Reports**:
```markdown
### Bug Report: [Brief Description]
**Reported**: [ISO date]
**Source**: Slack - [username if available]
**Component**: [component]
**Severity**: [severity]
**Status**: Under investigation

**Description**: [full description]

**Expected Behavior**: [if provided]

**Steps to Reproduce**: [if provided]
1. Step one
2. Step two

**Related**: [links to related issues/test cases if any]
```

**For Observations**:
```markdown
### Observation: [Brief Description]
**Reported**: [ISO date]
**Source**: Slack - [username if available]
**Component**: [component]
**Context**: [what was being done when observed]

**Details**: [full observation]

**Impact**: [potential impact on testing]
```

**For Test Results**:
```markdown
### Manual Test Result: [Test/Feature Name]
**Reported**: [ISO date]
**Source**: Slack - [username if available]
**Result**: [passed/failed]
**Component**: [component]

**Details**: [what was tested, outcome]

**Notes**: [any additional observations]
```

### Step 4: Determine Follow-up Actions

Based on feedback type, consider additional actions:

| Type | Potential Actions |
|------|-------------------|
| **bug_report (critical/high)** | Consider creating issue via issue-tracker if configured |
| **bug_report (medium/low)** | Log in knowledge base, may inform future test cases |
| **test_result** | Update relevant test case status if identifiable |
| **observation** | May inform test plan updates |
| **suggestion** | Log for future consideration |

**Issue Tracker Integration** (if configured):
- For critical/high severity bugs, check if issue-tracker agent is available
- If so, create or link to an issue in the configured system
- Reference the issue in the knowledge base entry

### Step 5: Acknowledge and Confirm

Respond to the user confirming:
1. Feedback was received and understood
2. Summary of what was captured
3. What actions will be taken
4. Any follow-up questions if needed

## Response Guidelines

**Structure**:
```
Thanks for reporting this. Here's what I've captured:

[Summary of the feedback]

I've logged this in the knowledge base under [category].
[Any follow-up actions being taken]

[Optional: Follow-up questions if clarification needed]
```

**Examples**:

For bug report:
```
Thanks for reporting this. I've logged the following:

Bug: Checkout fails when cart has more than 10 items
- Severity: High
- Component: Checkout
- Status: Under investigation

I've added this to the knowledge base. This may affect our checkout test coverage - I'll review TC-045 through TC-048 for related scenarios.

Can you confirm which browser this occurred in?
```

For observation:
```
Good catch - I've noted this observation:

The loading spinner on the dashboard takes longer than expected after the recent update.

I've added this to the knowledge base under performance observations. This might be worth adding to our performance test suite.
```

## Context Loading Requirements

Required:
- [x] Knowledge base (`.bugzy/runtime/knowledge-base.md`) - for duplicate check and updates

Conditional:
- [ ] Test cases (`./test-cases/`) - if feedback relates to specific test
- [ ] Test runs (`./test-runs/`) - if feedback relates to recent results

## Memory Updates

Required updates:
- Knowledge base (`.bugzy/runtime/knowledge-base.md`) - add new entry or update existing
- Optionally team communicator memory if tracking feedback sources
