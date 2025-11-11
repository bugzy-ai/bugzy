---
subcommand_name: generate-test-cases
description: Generate E2E browser test cases from product documentation and test plan
allowed-tools: 'Read, Write, MultiEdit, Task'
argument-hint: '--type [exploratory|functional|regression|smoke] --focus [optional-feature]'
---
# Generate Test Cases Command

## SECURITY NOTICE
**CRITICAL**: Never read the `.env` file. It contains ONLY secrets (passwords, API keys).
- **Read `.env.testdata`** for non-secret environment variables (TEST_BASE_URL, TEST_OWNER_EMAIL, etc.)
- `.env.testdata` contains actual values for test data, URLs, and non-sensitive configuration
- For secrets: Reference variable names only (TEST_OWNER_PASSWORD) - values are injected at runtime
- The `.env` file access is blocked by settings.json

Generate comprehensive end-to-end browser test cases from product documentation and test plan.

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
- Testing approach and strategy
- Pass/fail criteria
- Test environment and data requirements

#### 1.2 Check Existing Test Cases and Build Capability Map
List all files in `./test-cases/` and analyze each test case to:
- Avoid creating overlapping test cases
- Determine next test case ID (TC-XXX format)
- Understand existing coverage
- Build a capability map for dependency detection

**Capability Map Analysis:**
For each existing test case file, extract:
1. **Test ID** from frontmatter (e.g., TC-001)
2. **Test title** from frontmatter
3. **Capabilities provided** by analyzing test steps:
   - `login` - Test performs login/authentication
   - `logout` - Test performs logout
   - `create_project` - Test creates a new project
   - `navigate_dashboard` - Test accesses dashboard
   - `update_settings` - Test modifies settings
   - `session_management` - Test manages session state
   - Other domain-specific capabilities based on test actions
4. **Authentication requirement**: Does test include login steps or start from authenticated state?
5. **Blocker potential**: Is this a foundational test (login, critical setup) that other tests might depend on?

Example capability map structure:
```
TC-001:
  title: "Login and Basic Navigation"
  capabilities: [login, authentication, navigate_dashboard]
  provides_auth: true
  is_blocker: true  (foundational - many tests depend on login)

TC-003:
  title: "Project Settings Update"
  capabilities: [update_settings, form_validation]
  requires_auth: true
  is_blocker: false
```

**Blocker Detection Heuristics:**
Mark as blocker if test:
- Provides login/authentication capability
- Creates critical test data (first project, first user)
- Sets up required system state
- Is explicitly marked as "smoke test" for login/auth



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

### Step 2: Generate Test Cases

**After ensuring requirements are clear through exploration and clarification:**

Generate test cases following these STRICT RULES:

#### Core Requirements
1. **Browser-only scope** – Include only actions visible in a web browser; no API, DB, log, or file checks
2. **No hallucination** – Never invent UI labels, flows, data, or dependency details not present in documentation
3. **Reuse exact terminology** from product documentation
4. **Each test starts from clean browser session**
5. **Include login steps** at the beginning if authentication is required
6. **Keep steps atomic** – One user action or system response per step
7. **No ambiguous steps** – Be specific (e.g., "Click on 'Submit'" not "Click on 'Submit' or 'Save'")
8. **Use KEY format** for credentials and test data defined in the .env.testdata file (e.g., TEST_USERNAME, TEST_PASSWORD)
9. **Tests must be independent** – Can run in parallel without dependencies
10. **NO OVERLAPPING TEST CASES** – Each test must cover unique scenarios

#### Test Case Structure
Each test case must include:
- **title**: One-line purpose describing what is being tested
- **steps**: Numbered list of atomic actions
- **expected**: One-line description of expected outcome
- **priority**: high, medium, or low (based on criticality)
- **type**: Match the --type parameter or determine from context

#### Test Type Guidelines

**Exploratory Tests**:
- Focus on discovering undocumented behaviors
- Test boundary conditions and edge cases
- Try unusual user paths and workflows
- Test error handling and recovery

**Functional Tests**:
- Cover core business functionality
- Test happy paths and main workflows
- Validate business rules and requirements
- Ensure features work as documented

**Regression Tests**:
- Cover previously fixed bugs
- Test critical paths that must not break
- Validate core functionality after changes

**Smoke Tests**:
- Basic sanity checks
- Verify application is accessible
- Test most critical functionality briefly
- Quick health check of the system

### Step 2.5: Automatic Dependency Detection

For each generated test case, automatically detect dependencies:

Use the capability map from Step 1.2 to identify which existing tests this new test depends on.

**Dependency Detection Rules:**

1. **Authentication Dependency**
   - IF test steps include "login" OR "enter credentials" OR "authenticate"
   - AND test is NOT itself the login test
   - THEN depends on the login test (typically TC-001)
   - SET requires_auth = true

2. **Data Dependency**
   - IF test steps require "existing project" OR "project must exist"
   - THEN depends on test that provides `create_project` capability
   - Example: "Update project settings" depends on project creation test

3. **Navigation Dependency**
   - IF test assumes specific starting page (e.g., "From dashboard...")
   - THEN depends on test that provides navigation to that page
   - Example: Test starting at dashboard depends on login test

4. **Feature Dependency**
   - IF test builds upon another feature (e.g., "Edit saved test case")
   - THEN depends on test that creates that feature
   - Example: Edit test case depends on create test case

**Blocker Determination:**
Mark new test as blocker if it:
- Provides login/authentication functionality
- Creates foundational test data needed by multiple other tests
- Sets up critical system state
- Is a smoke test for core functionality

**Capability Extraction:**
Analyze new test steps to extract capabilities it provides:
```
Examples:
- "Click login button" → provides: [login, authentication]
- "Create new project" → provides: [create_project, project_data]
- "Navigate to settings" → provides: [navigate_settings]
- "Update user profile" → provides: [update_profile, user_data]
```

**Output:**
For each new test case, determine:
- `dependencies`: Array of TC-IDs (e.g., ["TC-001"])
- `blocker`: Boolean (true/false)
- `requires_auth`: Boolean (true/false)
- `capabilities`: Array of strings (e.g., ["update_settings", "form_validation"])

### Step 2.6: Validate Dependency Graph

After detecting dependencies, validate the dependency graph:

1. **Check for Circular Dependencies**
   - Ensure no test depends on itself (directly or indirectly)
   - Example invalid: TC-005 → TC-003 → TC-005

2. **Verify Referenced Tests Exist**
   - All dependency TC-IDs must reference existing test cases
   - Warn if dependency references non-existent test

3. **Check Blocker Test Ordering**
   - Blocker tests should not depend on non-blocker tests
   - Blockers should be executable independently

4. **Validate Authentication Logic**
   - If requires_auth = true, must have dependency on login test
   - Login test itself should have requires_auth = false

**Validation Output:**
- Report any validation errors or warnings
- Suggest fixes for detected issues
- Continue with valid dependencies even if some validation fails

### Step 3: Create Test Case Files

For each generated test case:

1. **Determine Test Case ID**:
   - Check existing files in `./test-cases/`
   - Use next available ID (TC-001, TC-002, etc.)
   - Format: TC-XXX-brief-description.md

2. **Create File with Frontmatter (with automatic dependency metadata)**:
   ```yaml
   ---
   id: TC-XXX
   title: [Test case title]
   priority: [high|medium|low]
   type: [exploratory|functional|regression|smoke]
   status: draft
   dependencies: [Array of TC-IDs from Step 2.5 dependency detection]
   blocker: [true|false, from Step 2.5 blocker determination]
   requires_auth: [true|false, from Step 2.5 auth detection]
   capabilities: [Array of capabilities from Step 2.5 capability extraction]
   created_at: [current date]
   updated_at: [current date]
   tags: [relevant tags]
   related_plan_section: [section from test plan]
   ---
   ```

   **Auto-populated Dependency Fields:**
   - `dependencies`: Array of test case IDs this test depends on (e.g., ["TC-001"])
   - `blocker`: Boolean indicating if this test is a blocker for other tests
   - `requires_auth`: Boolean indicating if test requires authentication
   - `capabilities`: Array of capabilities this test provides (e.g., ["login", "authentication"])

   **Examples:**
   ```yaml
   # Login test (blocker)
   dependencies: []
   blocker: true
   requires_auth: false
   capabilities: ["login", "authentication", "session_creation"]

   # Settings update test (depends on login)
   dependencies: ["TC-001"]
   blocker: false
   requires_auth: true
   capabilities: ["update_settings", "form_validation"]
   ```

3. **Add Test Case Content**:
   ```markdown
   ## Test Case: [Title]
   
   ### Preconditions
   - [Any setup requirements]
   
   ### Test Steps
   1. [Step 1]
   2. [Step 2]
   ...
   
   ### Expected Result
   [Expected outcome]
   
   ### Test Data
   - [Any specific test data requirements]
   ```

### Step 4: Create Test Cases Directory if Needed

If `./test-cases/` doesn't exist, create it first:
```bash
mkdir -p ./test-cases
```

### Step 4.5: Team Communication

Use the team-communicator agent to notify the product team about the new test cases:

```
Use the team-communicator agent to:
1. Post an update about test case creation
2. Provide summary of test coverage and case count
3. Highlight any areas where clarification is needed
4. Share key test cases that validate critical functionality
5. Ask for team review and validation of test scenarios
6. Mention if any uncertainties were discovered that need exploration
7. Use appropriate channel and threading for the update
```

The team communication should include:
- **Test cases created**: Number and types of test cases generated
- **Coverage areas**: Features and workflows now covered by tests
- **Key scenarios**: Important test cases that validate critical functionality
- **Clarification needed**: Any uncertainties or gaps that need team input
- **Review request**: Ask team to validate test scenarios are realistic
- **Next steps**: Mention plans for test execution or further exploration

**Update team communicator memory:**
- Record this communication in the team-communicator memory
- Note this as a test case creation communication
- Track team response to test coverage updates
- Document any areas where team clarification was requested

### Important Notes

- **Ambiguity Handling:** Use exploration (Step 1.5) and clarification (Step 1.6) protocols before generating test cases
  - CRITICAL/HIGH severity ambiguities → STOP and seek clarification
  - MEDIUM severity → Document assumptions with [ASSUMED: reason]
  - LOW severity → Mark gaps with [TO BE CLARIFIED: detail]
- Only use [TO BE EXPLORED] for LOW severity gaps that don't affect core test logic
- Group related test cases by feature area using consistent naming
- Ensure test case IDs are sequential and unique
- Link each test case to relevant test plan sections
- Consider external dependencies mentioned in documentation but only test UI interactions
