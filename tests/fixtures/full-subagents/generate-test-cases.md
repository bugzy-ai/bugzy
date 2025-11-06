---
subcommand_name: generate-test-cases
description: Generate manual test case documentation AND automated Playwright test scripts from test plan
allowed-tools: 'Read, Write, MultiEdit, Task'
argument-hint: '--type [exploratory|functional|regression|smoke] --focus [optional-feature]'
---
# Generate Test Cases Command

## SECURITY NOTICE
**CRITICAL**: Never read the `.env` file. It contains ONLY secrets (passwords, API keys).
- **Read `.env.example`** for non-secret environment variables (TEST_BASE_URL, TEST_OWNER_EMAIL, etc.)
- `.env.example` contains actual values for test data, URLs, and non-sensitive configuration
- For secrets: Reference variable names only (TEST_OWNER_PASSWORD) - values are injected at runtime
- The `.env` file access is blocked by settings.json

Generate comprehensive test artifacts including BOTH manual test case documentation AND automated Playwright test scripts.

## Overview

This command generates:
1. **Manual Test Case Documentation** (in `./test-cases/`) - Human-readable test cases in markdown format
2. **Automated Playwright Tests** (in `./tests/specs/`) - Executable TypeScript test scripts
3. **Page Object Models** (in `./tests/pages/`) - Reusable page classes for automated tests
4. **Supporting Files** (fixtures, helpers, components) - As needed for test automation

## Arguments
Arguments: $ARGUMENTS

## Parse Arguments
Extract the following from arguments:
- **type**: Test type (exploratory, functional, regression, smoke) - defaults to functional
- **focus**: Optional specific feature or section to focus on

## Process

### Step 1: Gather Context

#### 1.1 Read Test Plan
Read the test plan from `test-plan.md` to understand:
- Test items and features
- Testing approach and automation strategy
- Test Automation Strategy section (automated vs exploratory)
- Pass/fail criteria
- Test environment and data requirements
- Automation decision criteria

#### 1.2 Read Testing Best Practices Guide
Read `.bugzy/runtime/testing-best-practices.md` to understand:
- Page Object Model patterns and structure
- Selector strategy (role-based → test IDs → CSS)
- Test organization conventions
- Authentication patterns
- Async operations and waiting strategies
- Common anti-patterns to avoid

#### 1.3 Check Existing Test Cases and Tests
- List all files in `./test-cases/` to understand existing manual test coverage
- List all files in `./tests/specs/` to understand existing automated tests
- Determine next test case ID (TC-XXX format)
- Identify existing Page Objects in `./tests/pages/`
- Avoid creating overlapping test cases or duplicate automation

#### 1.4 Gather Product Documentation

Use the documentation-researcher agent to gather comprehensive product documentation:

```
Use the documentation-researcher agent to explore all available product documentation, specifically focusing on:
- UI elements and workflows
- User interactions and navigation paths
- Form fields and validation rules
- Error messages and edge cases
- Authentication and authorization flows
- Business rules and constraints
- API endpoints for test data setup
```

### Step 1.5: Explore Features (If Needed)

If documentation is insufficient or ambiguous, perform adaptive exploration to understand actual feature behavior before creating test cases.


## Exploratory Testing Protocol

Before creating or running formal tests, perform exploratory testing to validate requirements and understand actual system behavior. The depth of exploration should adapt to the clarity of requirements.

### Step 1.5.1: Assess Requirement Clarity

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

### Step 1.5.2: Quick Exploration (1-2 min)

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

### Step 1.5.3: Moderate Exploration (3-5 min)

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

### Step 1.5.4: Deep Exploration (5-10 min)

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

### Step 1.5.5: Link Exploration to Clarification

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

### Step 1.5.6: Document Exploration Results

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

### Step 1.5.7: Integration with Test Creation

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


### Step 1.6: Clarify Ambiguities

If exploration or documentation review reveals ambiguous requirements, use the clarification protocol to resolve them before generating test cases.


## Clarification Protocol

Before proceeding with test creation or execution, ensure requirements are clear and testable. Use this protocol to detect ambiguity, assess its severity, and determine the appropriate action.

### Step 1.6.1: Detect Ambiguity

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

### Step 1.6.2: Assess Severity

If ambiguity is detected, assess its severity:

| Severity | Characteristics | Examples | Action |
|----------|----------------|----------|--------|
| 🔴 **CRITICAL** | Expected behavior undefined/contradictory; test outcome unpredictable; core functionality unclear; success criteria missing; multiple interpretations = different strategies | "Fix the issue" (what issue?), "Improve performance" (which metrics?), "Fix sorting in todo list" (by date? priority? completion status?) | **STOP** - Seek clarification before proceeding |
| 🟠 **HIGH** | Core underspecified but direction clear; affects majority of scenarios; vague success criteria; assumptions risky | "Fix ordering" (sequence OR visibility?), "Add validation" (what? messages?), "Update dashboard" (which widgets?) | **STOP** - Seek clarification before proceeding |
| 🟡 **MEDIUM** | Specific details missing; general requirements clear; affects subset of cases; reasonable low-risk assumptions possible; wrong assumption = test updates not strategy overhaul | Missing field labels, unclear error message text, undefined timeouts, button placement not specified, date formats unclear | **PROCEED** - (1) Moderate exploration, (2) Document assumptions: "Assuming X because Y", (3) Proceed with creation/execution, (4) Async clarification (team-communicator), (5) Mark [ASSUMED: description] |
| 🟢 **LOW** | Minor edge cases; documentation gaps don't affect execution; optional/cosmetic elements; minimal impact | Tooltip text, optional field validation, icon choice, placeholder text, tab order | **PROCEED** - (1) Mark [TO BE CLARIFIED: description], (2) Proceed, (3) Mention in report "Minor Details", (4) No blocking/async clarification |

### Step 1.6.3: Check Memory for Similar Clarifications

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

### Step 1.6.4: Formulate Clarification Questions

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

### Step 1.6.5: Communicate Clarification Request

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

### Step 1.6.6: Wait or Proceed Based on Severity

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

### Step 1.6.7: Document Clarification in Results

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


**Important Notes:**
- **CRITICAL/HIGH ambiguities:** STOP test case generation and seek clarification
- **MEDIUM ambiguities:** Document assumptions explicitly in test case with [ASSUMED: reason]
- **LOW ambiguities:** Mark with [TO BE CLARIFIED: detail] in test case notes section

### Step 2: Generate Manual Test Cases AND Automated Tests

Use the test-code-generator agent to generate both manual test case documentation and automated Playwright test scripts:

```
Use the test-code-generator agent to:
1. Analyze the test plan and identify test scenarios
2. For each test scenario:
   a. Generate manual test case documentation (markdown file in ./test-cases/)
   b. Decide if automation is warranted based on automation decision criteria
   c. If automating: Generate Playwright test script (.spec.ts file in ./tests/specs/)
   d. Create or update Page Objects as needed (in ./tests/pages/)
   e. Link manual test case to automated test (and vice versa)
3. Generate supporting files:
   - Fixtures for common setup (authenticated users, test data)
   - Helper functions for data generation
   - Component objects for reusable UI elements
   - TypeScript types as needed
4. Follow best practices from .bugzy/runtime/testing-best-practices.md:
   - Page Object Model pattern
   - Role-based selectors (getByRole, getByLabel, getByText)
   - Use environment variables for test data
   - API for test data setup (faster than UI)
   - Proper async/await patterns
   - Test independence (can run in parallel)
5. Update .env.example with any new environment variables

Arguments to pass:
- Test type: {type}
- Focus area: {focus or "all features"}
- Test plan: test-plan.md
- Existing test cases: ./test-cases/
- Existing automated tests: ./tests/specs/
- Best practices guide: .bugzy/runtime/testing-best-practices.md
```

The test-code-generator agent will:
- Generate manual test case files with proper frontmatter (id, title, automated, automated_test)
- Generate automated Playwright test scripts following best practices
- Create Page Object Models with semantic selectors
- Add fixtures and helpers as needed
- Link manual and automated tests bidirectionally
- Decide which scenarios to automate based on test plan criteria
- Follow the testing best practices guide meticulously

### Step 2.5: Validate Generated Artifacts

After the test-code-generator completes, verify:

1. **Manual Test Cases (in `./test-cases/`)**:
   - Each has unique TC-XXX ID
   - Frontmatter includes `automated: true/false` flag
   - If automated, includes `automated_test` path reference
   - Contains human-readable steps and expected results
   - References environment variables for test data

2. **Automated Tests (in `./tests/specs/`)**:
   - Organized by feature in subdirectories
   - Each test file references manual test case ID in comments
   - Uses Page Object Model pattern
   - Follows role-based selector priority
   - Uses environment variables for test data
   - Includes proper TypeScript typing

3. **Page Objects (in `./tests/pages/`)**:
   - Extend BasePage class
   - Use semantic selectors (getByRole, getByLabel, getByText)
   - Contain only actions, no assertions
   - Properly typed with TypeScript

4. **Supporting Files**:
   - Fixtures created for common setup (in `./tests/fixtures/`)
   - Helper functions for data generation (in `./tests/helpers/`)
   - Component objects for reusable UI elements (in `./tests/components/`)
   - Types defined as needed (in `./tests/types/`)

### Step 3: Create Directories if Needed

Ensure required directories exist:
```bash
mkdir -p ./test-cases
mkdir -p ./tests/specs
mkdir -p ./tests/pages
mkdir -p ./tests/components
mkdir -p ./tests/fixtures
mkdir -p ./tests/helpers
```

### Step 4: Update .env.example (if needed)

If new environment variables were introduced:
- Read current `.env.example`
- Add new TEST_* variables with empty values
- Group variables logically with comments
- Document what each variable is for

### Step 4.5: Team Communication

Use the team-communicator agent to notify the product team about the new test cases and automated tests:

```
Use the team-communicator agent to:
1. Post an update about test case and automation creation
2. Provide summary of coverage:
   - Number of manual test cases created
   - Number of automated tests created
   - Features covered by automation
   - Areas kept manual-only (and why)
3. Highlight key automated test scenarios
4. Share command to run automated tests: npx playwright test
5. Ask for team review and validation
6. Mention any areas needing exploration or clarification
7. Use appropriate channel and threading for the update
```

The team communication should include:
- **Test artifacts created**: Manual test cases + automated tests count
- **Automation coverage**: Which features are now automated
- **Manual-only areas**: Why some tests are kept manual (rare scenarios, exploratory)
- **Key automated scenarios**: Critical paths now covered by automation
- **Running tests**: Command to execute automated tests
- **Review request**: Ask team to validate scenarios and review test code
- **Next steps**: Plans for CI/CD integration or additional test coverage

**Update team communicator memory:**
- Record this communication
- Note test case and automation creation
- Track team feedback on automation approach
- Document any clarifications requested

### Step 5: Final Summary

Provide a comprehensive summary showing:

**Manual Test Cases:**
- Number of manual test cases created
- List of test case files with IDs and titles
- Automation status for each (automated: yes/no)

**Automated Tests:**
- Number of automated test scripts created
- List of spec files with test counts
- Page Objects created or updated
- Fixtures and helpers added

**Test Coverage:**
- Features covered by manual tests
- Features covered by automated tests
- Areas kept manual-only (and why)

**Next Steps:**
- Command to run automated tests: `npx playwright test`
- Instructions to run specific test file
- Note about copying .env.example to .env
- Mention any exploration needed for edge cases

### Important Notes

- **Both Manual AND Automated**: Generate both artifacts - they serve different purposes
- **Manual Test Cases**: Documentation, reference, can be executed manually when needed
- **Automated Tests**: Fast, repeatable, for CI/CD and regression testing
- **Automation Decision**: Not all test cases need automation - rare edge cases can stay manual
- **Linking**: Manual test cases reference automated tests; automated tests reference manual test case IDs
- **Best Practices**: Always follow `.bugzy/runtime/testing-best-practices.md` for automation patterns
- **Ambiguity Handling**: Use exploration (Step 1.5) and clarification (Step 1.6) protocols before generating
- **Environment Variables**: Use `process.env.VAR_NAME` in tests, update .env.example as needed
- **Test Independence**: Each test must be runnable in isolation and in parallel
