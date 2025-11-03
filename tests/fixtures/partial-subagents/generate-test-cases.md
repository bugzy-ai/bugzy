---
allowed-tools: Read, Write, MultiEdit, Task
argument-hint: "--type [exploratory|functional|regression|smoke] --focus [optional-feature]"
description: Generate E2E browser test cases from product documentation and test plan
---

# Generate Test Cases Command

## SECURITY NOTICE
**CRITICAL**: Never read the `.env` file. It contains ONLY secrets (passwords, API keys).
- **Read `.env.example`** for non-secret environment variables (TEST_BASE_URL, TEST_OWNER_EMAIL, etc.)
- `.env.example` contains actual values for test data, URLs, and non-sensitive configuration
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

#### 1.2 Check Existing Test Cases
List all files in `./test-cases/` to:
- Avoid creating overlapping test cases
- Determine next test case ID (TC-XXX format)
- Understand existing coverage

### Step 2: Generate Test Cases

Generate test cases following these STRICT RULES:

#### Core Requirements
1. **Browser-only scope** – Include only actions visible in a web browser; no API, DB, log, or file checks
2. **No hallucination** – Never invent UI labels, flows, data, or dependency details not present in documentation
3. **Reuse exact terminology** from product documentation
4. **Each test starts from clean browser session**
5. **Include login steps** at the beginning if authentication is required
6. **Keep steps atomic** – One user action or system response per step
7. **No ambiguous steps** – Be specific (e.g., "Click on 'Submit'" not "Click on 'Submit' or 'Save'")
8. **Use KEY format** for credentials and test data defined in the .env.example file (e.g., TEST_USERNAME, TEST_PASSWORD)
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

### Step 2.5: Detect Dependencies and Capabilities

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
- Is a prerequisite for a large number of other test cases

**Capability Extraction:**
For each test, identify capabilities it provides to other tests:
- Login/authentication tests: ["login", "authentication", "session_creation"]
- Navigation tests: ["navigate_dashboard", "navigate_settings"]
- Data creation tests: ["create_project", "create_user"]
- Feature tests: ["update_settings", "create_test_case"]

### Step 3: Create Test Case Files

For each generated test case:

1. **Determine Test Case ID**:
   - Check existing files in `./test-cases/`
   - Use next available ID (TC-001, TC-002, etc.)
   - Format: TC-XXX-brief-description.md

2. **Create File with Frontmatter**:
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

### Step 5: Team Communication

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

- If documentation is insufficient, create test cases for what is known and mark gaps with `[TO BE EXPLORED]`
- Group related test cases by feature area using consistent naming
- Ensure test case IDs are sequential and unique
- Link each test case to relevant test plan sections
- Consider external dependencies mentioned in documentation but only test UI interactions