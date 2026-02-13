---
subcommand_name: verify-changes-manual
description: 'Manually verify changes from PR, issue, or feature description'
allowed-tools: 'Read, Write, Edit, Bash, Grep, Glob, Task'
argument-hint: <PR-URL | issue-ID | description>
---
# Verify Changes - Manual Trigger

## SECURITY NOTICE
**CRITICAL**: Never read the `.env` file. It contains ONLY secrets (passwords, API keys).
- **Read `.env.testdata`** for non-secret environment variables (TEST_BASE_URL, TEST_OWNER_EMAIL, etc.)
- `.env.testdata` contains actual values for test data, URLs, and non-sensitive configuration
- For secrets: Reference variable names only (TEST_OWNER_PASSWORD) - values are injected at runtime
- The `.env` file access is blocked by settings.json

## Context

This task is manually triggered to verify changes described by:
- **Pull Request URL**: GitHub PR link to analyze changes
- **Issue/Ticket ID**: Jira, Linear, or GitHub issue identifier
- **Feature Description**: Text description of what changed
- **Deployment URL**: Preview or staging environment to test

## Input

**Arguments**: $ARGUMENTS

Parse the arguments to extract:
- URLs (GitHub PR, deployment preview, issue tracker)
- Issue identifiers (PROJ-123, #456)
- Descriptive text about the change

If the input is a GitHub PR URL, you can fetch PR details including:
- Title and description
- Changed files and diff
- Comments and review feedback
- Linked issues


## Verify Changes - Core Workflow

### Step 1: Gather Information

Review the provided context about what changed. This may include:
- Pull request details and diff
- Issue/ticket information
- Feature description or bug report
- Deployment URL or environment details
- User feedback or testing request

Extract key information:
- **What changed**: Features added, bugs fixed, code refactored
- **Scope**: Which parts of the application are affected
- **Environment**: Where to test (production, preview, staging)
- **Context**: Why the change was made

### Step 2: Understand the Change - Detect Ambiguity and Explore



Before proceeding with test creation or execution, ensure requirements are clear through ambiguity detection and adaptive exploration.


## Exploratory Testing Protocol

Before creating or running formal tests, perform exploratory testing to validate requirements and understand actual system behavior. The depth of exploration should adapt to the clarity of requirements.

### Step 2.1: Assess Requirement Clarity

Determine exploration depth based on requirement quality:

| Clarity | Indicators | Exploration Depth | Goal |
|---------|-----------|-------------------|------|
| **Clear** | Detailed acceptance criteria, screenshots/mockups, specific field names/URLs/roles, unambiguous behavior, consistent patterns | Quick (1-2 min) | Confirm feature exists, capture evidence |
| **Vague** | General direction clear but specifics missing, incomplete examples, assumed details, relative terms ("fix", "better") | Moderate (3-5 min) | Document current behavior, identify ambiguities, generate clarification questions |
| **Unclear** | Contradictory info, multiple interpretations, no examples/criteria, ambiguous scope ("the page"), critical details missing | Deep (5-10 min) | Systematically test scenarios, document patterns, identify all ambiguities, formulate comprehensive questions |

**Examples:**
- **Clear:** "Change 'Submit' button from blue (#007BFF) to green (#28A745) on /auth/login. Verify hover effect."
- **Vague:** "Fix the sorting in todo list page. The items are mixed up for premium users."
- **Unclear:** "Improve the dashboard performance. Users say it's slow."

### Step 2.2: Quick Exploration (1-2 min)

**When:** Requirements CLEAR

**Steps:**
1. Navigate to feature (use provided URL), verify loads without errors
2. Verify key elements exist (buttons, fields, sections mentioned)
3. Capture screenshot of initial state
4. Document:
   ```markdown
   **Quick Exploration (1 min)**
   Feature: [Name] | URL: [Path]
   Status: ✅ Accessible / ❌ Not found / ⚠️ Different
   Screenshot: [filename]
   Notes: [Immediate observations]
   ```
5. **Decision:** ✅ Matches → Test creation | ❌/⚠️ Doesn't match → Moderate Exploration

**Time Limit:** 1-2 minutes

### Step 2.3: Moderate Exploration (3-5 min)

**When:** Requirements VAGUE or Quick Exploration revealed discrepancies

**Steps:**
1. Navigate using appropriate role(s), set up preconditions, ensure clean state
2. Test primary user flow, document steps and behavior, note unexpected behavior
3. Capture before/after screenshots, document field values/ordering/visibility
4. Compare to requirement: What matches? What differs? What's absent?
5. Identify specific ambiguities:
   ```markdown
   **Moderate Exploration (4 min)**

   **Explored:** Role: [Admin], Path: [Steps], Behavior: [What happened]

   **Current State:** [Specific observations with examples]
   - Example: "Admin view shows 8 sort options: By Title, By Due Date, By Priority..."

   **Requirement Says:** [What requirement expected]

   **Discrepancies:** [Specific differences]
   - Example: "Premium users see 5 fewer sorting options than admins"

   **Ambiguities:**
   1. [First ambiguity with concrete example]
   2. [Second if applicable]

   **Clarification Needed:** [Specific questions]
   ```
6. Assess severity using Clarification Protocol
7. **Decision:** 🟢 Minor → Proceed with assumptions | 🟡 Medium → Async clarification, proceed | 🔴 Critical → Stop, escalate

**Time Limit:** 3-5 minutes

### Step 2.4: Deep Exploration (5-10 min)

**When:** Requirements UNCLEAR or critical ambiguities found

**Steps:**
1. **Define Exploration Matrix:** Identify dimensions (user roles, feature states, input variations, browsers)

2. **Systematic Testing:** Test each matrix cell methodically
   ```
   Example for "Todo List Sorting":
   Matrix: User Roles × Feature Observations

   Test 1: Admin Role → Navigate, document sort options (count, names, order), screenshot
   Test 2: Basic User Role → Same todo list, document options, screenshot
   Test 3: Compare → Side-by-side table, identify missing/reordered options
   ```

3. **Document Patterns:** Consistent behavior? Role-based differences? What varies vs constant?

4. **Comprehensive Report:**
   ```markdown
   **Deep Exploration (8 min)**

   **Matrix:** [Dimensions] | **Tests:** [X combinations]

   **Findings:**

   ### Test 1: Admin
   - Setup: [Preconditions] | Steps: [Actions]
   - Observations: Sort options=8, Options=[list], Ordering=[sequence]
   - Screenshot: [filename-admin.png]

   ### Test 2: Basic User
   - Setup: [Preconditions] | Steps: [Actions]
   - Observations: Sort options=3, Missing vs Admin=[5 options], Ordering=[sequence]
   - Screenshot: [filename-user.png]

   **Comparison Table:**
   | Sort Option | Admin Pos | User Pos | Notes |
   |-------------|-----------|----------|-------|
   | By Title | 1 | 1 | Match |
   | By Priority | 3 | Not visible | Missing |

   **Patterns:**
   - Role-based feature visibility
   - Consistent relative ordering for visible fields

   **Critical Ambiguities:**
   1. Option Visibility: Intentional basic users see 5 fewer sort options?
   2. Sort Definition: (A) All roles see all options in same order, OR (B) Roles see permitted options in same relative order?

   **Clarification Questions:** [Specific, concrete based on findings]
   ```

5. **Next Action:** Critical ambiguities → STOP, clarify | Patterns suggest answer → Validate assumption | Behavior clear → Test creation

**Time Limit:** 5-10 minutes

### Step 2.5: Link Exploration to Clarification

**Flow:** Requirement Analysis → Exploration → Clarification

1. Requirement analysis detects vague language → Triggers exploration
2. Exploration documents current behavior → Identifies discrepancies
3. Clarification uses findings → Asks specific questions referencing observations

**Example:**
```
"Fix the sorting in todo list"
  ↓ Ambiguity: "sorting" = by date, priority, or completion status?
  ↓ Moderate Exploration: Admin=8 sort options, User=3 sort options
  ↓ Question: "Should basic users see all 8 sort options (bug) or only 3 with consistent sequence (correct)?"
```

### Step 2.6: Document Exploration Results

**Template:**
```markdown
## Exploration Summary

**Date:** [YYYY-MM-DD] | **Explorer:** [Agent/User] | **Depth:** [Quick/Moderate/Deep] | **Duration:** [X min]

### Feature: [Name and description]

### Observations: [Key findings]

### Current Behavior: [What feature does today]

### Discrepancies: [Requirement vs observation differences]

### Assumptions Made: [If proceeding with assumptions]

### Artifacts: Screenshots: [list], Video: [if captured], Notes: [detailed]
```

**Memory Storage:** Feature behavior patterns, common ambiguity types, resolution approaches

### Step 2.7: Integration with Test Creation

**Quick Exploration → Direct Test:**
- Feature verified → Create test matching requirement → Reference screenshot

**Moderate Exploration → Assumption-Based Test:**
- Document behavior → Create test on best interpretation → Mark assumptions → Plan updates after clarification

**Deep Exploration → Clarification-First:**
- Block test creation until clarification → Use exploration as basis for questions → Create test after answer → Reference both exploration and clarification

---

## Adaptive Exploration Decision Tree

```
Start: Requirement Received
    ↓
Are requirements clear with specifics?
    ├─ YES → Quick Exploration (1-2 min)
    │         ↓
    │      Does feature match description?
    │         ├─ YES → Proceed to Test Creation
    │         └─ NO → Escalate to Moderate Exploration
    │
    └─ NO → Is general direction clear but details missing?
          ├─ YES → Moderate Exploration (3-5 min)
          │         ↓
          │      Are ambiguities MEDIUM severity or lower?
          │         ├─ YES → Document assumptions, proceed with test creation
          │         └─ NO → Escalate to Deep Exploration or Clarification
          │
          └─ NO → Deep Exploration (5-10 min)
                    ↓
                 Document comprehensive findings
                    ↓
                 Assess ambiguity severity
                    ↓
                 Seek clarification for CRITICAL/HIGH
```

---

## Remember:

🔍 **Explore before assuming** | 📊 **Concrete observations > abstract interpretation** | ⏱️ **Adaptive depth: time ∝ uncertainty** | 🎯 **Exploration findings → specific clarifications** | 📝 **Always document** | 🔗 **Link exploration → ambiguity → clarification**



## Clarification Protocol

Before proceeding with test creation or execution, ensure requirements are clear and testable. Use this protocol to detect ambiguity, assess its severity, and determine the appropriate action.

### Step 2.1: Detect Ambiguity

Scan for ambiguity signals:

**Language:** Vague terms ("fix", "improve", "better", "like", "mixed up"), relative terms without reference ("faster", "more"), undefined scope ("the ordering", "the fields", "the page"), modal ambiguity ("should", "could" vs "must", "will")

**Details:** Missing acceptance criteria (no clear PASS/FAIL), no examples/mockups, incomplete field/element lists, unclear role behavior differences, unspecified error scenarios

**Interpretation:** Multiple valid interpretations, contradictory information (description vs comments), implied vs explicit requirements

**Context:** No reference documentation, "RELEASE APPROVED" without criteria, quick ticket creation, assumes knowledge ("as you know...", "obviously...")

**Quick Check:**
- [ ] Success criteria explicitly defined? (PASS if X, FAIL if Y)
- [ ] All affected elements specifically listed? (field names, URLs, roles)
- [ ] Only ONE reasonable interpretation?
- [ ] Examples, screenshots, or mockups provided?
- [ ] Consistent with existing system patterns?
- [ ] Can write test assertions without assumptions?

### Step 2.2: Assess Severity

If ambiguity is detected, assess its severity:

| Severity | Characteristics | Examples | Action |
|----------|----------------|----------|--------|
| 🔴 **CRITICAL** | Expected behavior undefined/contradictory; test outcome unpredictable; core functionality unclear; success criteria missing; multiple interpretations = different strategies | "Fix the issue" (what issue?), "Improve performance" (which metrics?), "Fix sorting in todo list" (by date? priority? completion status?) | **STOP** - Seek clarification before proceeding |
| 🟠 **HIGH** | Core underspecified but direction clear; affects majority of scenarios; vague success criteria; assumptions risky | "Fix ordering" (sequence OR visibility?), "Add validation" (what? messages?), "Update dashboard" (which widgets?) | **STOP** - Seek clarification before proceeding |
| 🟡 **MEDIUM** | Specific details missing; general requirements clear; affects subset of cases; reasonable low-risk assumptions possible; wrong assumption = test updates not strategy overhaul | Missing field labels, unclear error message text, undefined timeouts, button placement not specified, date formats unclear | **PROCEED** - (1) Moderate exploration, (2) Document assumptions: "Assuming X because Y", (3) Proceed with creation/execution, (4) Async clarification (team-communicator), (5) Mark [ASSUMED: description] |
| 🟢 **LOW** | Minor edge cases; documentation gaps don't affect execution; optional/cosmetic elements; minimal impact | Tooltip text, optional field validation, icon choice, placeholder text, tab order | **PROCEED** - (1) Mark [TO BE CLARIFIED: description], (2) Proceed, (3) Mention in report "Minor Details", (4) No blocking/async clarification |

### Step 2.3: Check Memory for Similar Clarifications

Before asking, check if similar question was answered:

**Process:**
1. **Query team-communicator memory** - Search by feature name, ambiguity pattern, ticket keywords
2. **Review past Q&A** - Similar question asked? What was answer? Applicable now?
3. **Assess reusability:**
   - Directly applicable → Use answer, no re-ask
   - Partially applicable → Adapt and reference ("Previously for X, clarified Y. Same here?")
   - Not applicable → Ask as new
4. **Update memory** - Store Q&A with task type, feature, pattern tags

**Example:** Query "todo sorting priority" → Found 2025-01-15: "Should completed todos appear in main list?" → Answer: "No, move to separate archive view" → Directly applicable → Use, no re-ask needed

### Step 2.4: Formulate Clarification Questions

If clarification needed (CRITICAL/HIGH severity), formulate specific, concrete questions:

**Good Questions:** Specific and concrete, provide context, offer options, reference examples, tie to test strategy

**Bad Questions:** Too vague/broad, assumptive, multiple questions in one, no context

**Template:**
```
**Context:** [Current understanding]
**Ambiguity:** [Specific unclear aspect]
**Question:** [Specific question with options]
**Why Important:** [Testing strategy impact]

Example:
Context: TODO-456 "Fix the sorting in the todo list so items appear in the right order"
Ambiguity: "sorting" = (A) by creation date, (B) by due date, (C) by priority level, or (D) custom user-defined order
Question: Should todos be sorted by due date (soonest first) or priority (high to low)? Should completed items appear in the list or move to archive?
Why Important: Different sort criteria require different test assertions. Current app shows 15 active todos + 8 completed in mixed order.
```

### Step 2.5: Communicate Clarification Request

**For Slack-Triggered Tasks:** Use team-communicator subagent:
```
Ask clarification in Slack thread:
Context: [From ticket/description]
Ambiguity: [Describe ambiguity]
Severity: [CRITICAL/HIGH]
Questions:
1. [First specific question]
2. [Second if needed]

Clarification needed to proceed. I'll wait for response before testing.
```

**For Manual/API Triggers:** Include in task output:
```markdown
## ⚠️ Clarification Required Before Testing

**Ambiguity:** [Description]
**Severity:** [CRITICAL/HIGH]

### Questions:
1. **Question:** [First question]
   - Context: [Provide context]
   - Options: [If applicable]
   - Impact: [Testing impact]

**Action Required:** Provide clarification. Testing cannot proceed.
**Current Observation:** [What exploration revealed - concrete examples]
```

### Step 2.6: Wait or Proceed Based on Severity

**CRITICAL/HIGH → STOP and Wait:**
- Do NOT create tests, run tests, or make assumptions
- Wait for clarification, resume after answer
- *Rationale: Wrong assumptions = incorrect tests, false results, wasted time*

**MEDIUM → Proceed with Documented Assumptions:**
- Perform moderate exploration, document assumptions, proceed with creation/execution
- Ask clarification async (team-communicator), mark results "based on assumptions"
- Update tests after clarification received
- *Rationale: Waiting blocks progress; documented assumptions allow forward movement with later corrections*

**LOW → Proceed and Mark:**
- Proceed with creation/execution, mark gaps [TO BE CLARIFIED] or [ASSUMED]
- Mention in report but don't prioritize, no blocking
- *Rationale: Details don't affect strategy/results significantly*

### Step 2.7: Document Clarification in Results

When reporting test results, always include an "Ambiguities" section if clarification occurred:

```markdown
## Ambiguities Encountered

### Clarification: [Topic]
- **Severity:** [CRITICAL/HIGH/MEDIUM/LOW]
- **Question Asked:** [What was asked]
- **Response:** [Answer received, or "Awaiting response"]
- **Impact:** [How this affected testing]
- **Assumption Made:** [If proceeded with assumption]
- **Risk:** [What could be wrong if assumption is incorrect]

### Resolution:
[How the clarification was resolved and incorporated into testing]
```

---

## Remember:

🛑 **Block for CRITICAL/HIGH** | ✅ **Ask correctly > guess poorly** | 📝 **Document MEDIUM assumptions** | 🔍 **Check memory first** | 🎯 **Specific questions → specific answers**


After clarification and exploration, analyze the change to determine the verification approach:

#### 2.7 Identify Test Scope
Based on the change description, exploration findings, and clarified requirements:
- **Direct impact**: Which features/functionality are directly modified
- **Indirect impact**: What else might be affected (dependencies, integrations)
- **Regression risk**: Existing functionality that should be retested
- **New functionality**: Features that need new test coverage

#### 2.8 Determine Verification Strategy
Plan your testing approach based on validated requirements:
- **Priority areas**: Critical paths that must work
- **Test types needed**: Functional, regression, integration, UI/UX
- **Test data requirements**: What test accounts, data, or scenarios needed
- **Success criteria**: What determines the change is working correctly (now clearly defined)

### Step 3: Search for Existing Test Cases

Look in the `./test-cases/` directory for relevant test coverage:

#### 3.1 Identify Applicable Test Cases
Search for test cases that cover:
- Features mentioned in the change
- User flows affected by the change
- Regression tests for the modified area
- Related functionality that might break

Use grep/glob to find test cases by:
- Feature names or keywords
- File paths mentioned in changes
- User role or persona
- Test tags or categories

#### 3.2 Evaluate Coverage
For each relevant test case found:
- **Does it cover the change?** Is the new/modified functionality tested?
- **Is it sufficient?** Does it test edge cases and error conditions?
- **Is it current?** Does it reflect the latest changes?

Document:
- Test cases that should be run as-is
- Test cases that need updates
- Coverage gaps that need new test cases

### Step 4: Create New Test Cases

If coverage gaps exist, create new test cases using the `generate-test-cases` task:

#### 4.1 Determine What's Missing
Identify specific scenarios that aren't covered by existing test cases:
- New user flows introduced by the change
- Edge cases for new functionality
- Error handling and validation
- Integration points with other features
- Different user roles or permissions

#### 4.2 Generate Test Cases
Use the Task tool to invoke generate-test-cases:

```
Use the generate-test-cases task with the following context:
- Feature/change description: [specific description]
- Scope: [what needs testing]
- Existing coverage: [what's already tested]
- Gap areas: [what's missing]
```

The task will create new test case files in `./test-cases/` following the standard format.

### Step 5: Run Tests

### Step 5: Execute Tests Using Test-Runner

Use the browser-automation agent to execute both existing and newly created test cases:

```
Use the browser-automation agent to execute test cases for verifying the changes.

**Test Run Configuration**:
- test_run_folder: ./test-runs/[YYYYMMDD-HHMMSS]
- Test cases: [list of test case file paths from Steps 3 and 4]

The agent will:
1. Execute each test case in the appropriate order (considering dependencies)
2. Record video of test execution (automatic with --save-video)
3. Generate structured test artifacts per schema (.bugzy/runtime/templates/test-result-schema.md):
   - summary.json (outcome, video filename, failure details)
   - steps.json (structured steps with timestamps and video times)
4. Handle blocker test failures (skip dependent tests)
5. Return detailed execution report

Expected output:
- Pass/fail status for each test
- Execution time and statistics
- Failed steps and error details
- Video file locations
- Artifact locations in test-run folder
```

**After test execution**:
- Analyze results for patterns and critical issues
- Identify any unexpected behaviors requiring clarification
- Prepare findings for team communication

Execute the relevant test cases and collect results:

#### 5.1 Prepare Test Execution
- **List test cases to run**: Both existing and newly created
- **Set environment**: Ensure TEST_BASE_URL and other variables are set correctly
- **Check test data**: Verify test accounts and data are available
- **Create test run folder**: ./test-runs/[YYYYMMDD-HHMMSS]

#### 5.2 Analyze Results
For each test run, note:
- **Status**: Pass, Fail, Error, Blocked
- **Key findings**: What worked, what didn't
- **Screenshots**: Visual evidence of issues
- **Error messages**: Specific failures encountered
- **Duration**: How long testing took

Aggregate results across all test cases:
- Total test cases run
- Passed vs. failed count
- Critical issues found
- Recommendations for next steps

### Step 6: Communicate Results

### Step 6: Communicate Verification Results

Use the team-communicator agent to share verification results and gather clarifications:

#### 6.1 Post Verification Results

After completing verification, communicate results to the team:

```
Use the team-communicator agent to post verification results.

**Context**: Manual verification request for [change description]

**Message Content**:
### ✅ Change Verification Complete

**What was verified**: [Brief description of the change]
**Environment**: [URL or environment name]

**Results Summary**:
• ✅ [X] tests passed
• ❌ [Y] tests failed
• ⏭️ [Z] tests skipped (if any blocker failures)
• 📝 [Total] test cases (existing + new)

[If all tests passed:]
All tests passed successfully! ✨

[If tests failed:]
**Issues Found**:
• [Critical issue 1 with severity]
• [Critical issue 2 with severity]
• [Total count] issues discovered

**Test Coverage**:
• Existing test cases: [list key ones run]
• New test cases created: [list new ones]

**Details**: Test artifacts in ./test-runs/[timestamp]/
**Next Steps**: [Recommended actions based on results]

---
🤖 Full test report available in test-runs folder
```

#### 6.2 Request Clarifications (if needed)

If exploration revealed ambiguities during verification (Step 2.5 - MEDIUM severity):

```
Use the team-communicator agent to ask clarification questions.

**Check memory first**: Query for similar past clarifications about this feature

**If no answer in memory, ask**:
### ⚠️ Clarification Needed for Verification

While verifying [change description], I encountered ambiguity:

**Ambiguity**: [Specific unclear aspect with concrete example]

**Options**:
1. [Option A with implications]
2. [Option B with implications]

**Context**: [Exploration findings - what you observed]
**Impact**: [How this affects test results/coverage]

Which approach should I use for testing?
```

**Wait for response** before finalizing verification results.

#### 6.3 Update Memory

After communication, update team-communicator memory:
- Record this verification interaction
- Note any clarifications received
- Track response patterns and team preferences
- Document decisions for future similar requests

**Communication Guidelines**:
- Keep messages clear and scannable
- Use severity indicators (🔴 🟠 🟡 🟢) for issues
- Provide links to detailed artifacts
- Highlight critical items needing immediate attention
- Offer to provide more details if needed
- Tag relevant team members for critical issues

Structure your findings clearly with:
- **Executive Summary**: Overall result (✅ Pass / ❌ Fail / ⚠️ Partial)
- **Test Coverage**: What was tested
- **Results Detail**: Pass/fail for each test case
- **Issues Found**: List any problems discovered
- **Screenshots/Evidence**: Link to test run folders
- **Recommendations**: Next steps or actions needed


## Output Format

Provide a comprehensive markdown summary with the following structure:

### Test Verification Report

#### Change Summary
- **What Changed**: [Brief description]
- **Scope**: [Affected features/areas]
- **Environment Tested**: [URL or environment]

#### Test Coverage
- **Existing Test Cases Run**: [Count and list]
- **New Test Cases Created**: [Count and list]
- **Total Test Scenarios**: [Number]

#### Test Results
- ✅ **Passed**: [Count] test cases
- ❌ **Failed**: [Count] test cases
- ⚠️ **Blocked**: [Count] test cases (if any)

#### Detailed Results
For each test case:
- **Test Case**: [Name/path]
- **Status**: [Pass/Fail/Blocked]
- **Key Findings**: [What was observed]
- **Issues**: [Problems found, if any]
- **Evidence**: [Link to test run folder]

#### Issues Found
[List any problems discovered with severity and details]

#### Recommendations
- [Next steps]
- [Actions needed]
- [Follow-up testing required]

#### Test Artifacts
- Test run folders: `./test-runs/[timestamps]`
- Screenshots and logs available in run folders
- New test cases: `./test-cases/[new-files]`

---
🤖 Automated verification completed
