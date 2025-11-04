/**
 * Generate Test Cases Task
 * Generate E2E browser test cases from product documentation and test plan
 */

import { TaskTemplate } from '../types';
import { TASK_SLUGS } from '../constants';
import { EXPLORATION_INSTRUCTIONS } from '../templates/exploration-instructions';
import { CLARIFICATION_INSTRUCTIONS } from '../templates/clarification-instructions';

export const generateTestCasesTask: TaskTemplate = {
   slug: TASK_SLUGS.GENERATE_TEST_CASES,
   name: 'Generate Test Cases',
   description: 'Generate E2E browser test cases from product documentation and test plan',

   frontmatter: {
      description: 'Generate E2E browser test cases from product documentation and test plan',
      'allowed-tools': 'Read, Write, MultiEdit, Task',
      'argument-hint': '--type [exploratory|functional|regression|smoke] --focus [optional-feature]',
   },

   baseContent: `# Generate Test Cases Command

## SECURITY NOTICE
**CRITICAL**: Never read the \`.env\` file. It contains ONLY secrets (passwords, API keys).
- **Read \`.env.example\`** for non-secret environment variables (TEST_BASE_URL, TEST_OWNER_EMAIL, etc.)
- \`.env.example\` contains actual values for test data, URLs, and non-sensitive configuration
- For secrets: Reference variable names only (TEST_OWNER_PASSWORD) - values are injected at runtime
- The \`.env\` file access is blocked by settings.json

Generate comprehensive end-to-end browser test cases from product documentation and test plan.

## Arguments
Arguments: \$ARGUMENTS

## Parse Arguments
Extract the following from arguments:
- **type**: Test type (exploratory, functional, regression, smoke) - defaults to functional
- **focus**: Optional specific feature or section to focus on

## Process

### Step 1: Gather Context

#### 1.1 Read Test Plan
Read the test plan from \`test-plan.md\` to understand:
- Test items and features
- Testing approach and strategy
- Pass/fail criteria
- Test environment and data requirements

#### 1.2 Check Existing Test Cases and Build Capability Map
List all files in \`./test-cases/\` and analyze each test case to:
- Avoid creating overlapping test cases
- Determine next test case ID (TC-XXX format)
- Understand existing coverage
- Build a capability map for dependency detection

**Capability Map Analysis:**
For each existing test case file, extract:
1. **Test ID** from frontmatter (e.g., TC-001)
2. **Test title** from frontmatter
3. **Capabilities provided** by analyzing test steps:
   - \`login\` - Test performs login/authentication
   - \`logout\` - Test performs logout
   - \`create_project\` - Test creates a new project
   - \`navigate_dashboard\` - Test accesses dashboard
   - \`update_settings\` - Test modifies settings
   - \`session_management\` - Test manages session state
   - Other domain-specific capabilities based on test actions
4. **Authentication requirement**: Does test include login steps or start from authenticated state?
5. **Blocker potential**: Is this a foundational test (login, critical setup) that other tests might depend on?

Example capability map structure:
\`\`\`
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
\`\`\`

**Blocker Detection Heuristics:**
Mark as blocker if test:
- Provides login/authentication capability
- Creates critical test data (first project, first user)
- Sets up required system state
- Is explicitly marked as "smoke test" for login/auth

{{DOCUMENTATION_RESEARCHER_INSTRUCTIONS}}

### Step 1.5: Explore Features (If Needed)

If documentation is insufficient or ambiguous, perform adaptive exploration to understand actual feature behavior before creating test cases.

${EXPLORATION_INSTRUCTIONS.replace(/{{STEP_NUMBER}}/g, '1.5')}

### Step 1.6: Clarify Ambiguities

If exploration or documentation review reveals ambiguous requirements, use the clarification protocol to resolve them before generating test cases.

${CLARIFICATION_INSTRUCTIONS.replace(/{{STEP_NUMBER}}/g, '1.6')}

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
   - THEN depends on test that provides \`create_project\` capability
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
\`\`\`
Examples:
- "Click login button" → provides: [login, authentication]
- "Create new project" → provides: [create_project, project_data]
- "Navigate to settings" → provides: [navigate_settings]
- "Update user profile" → provides: [update_profile, user_data]
\`\`\`

**Output:**
For each new test case, determine:
- \`dependencies\`: Array of TC-IDs (e.g., ["TC-001"])
- \`blocker\`: Boolean (true/false)
- \`requires_auth\`: Boolean (true/false)
- \`capabilities\`: Array of strings (e.g., ["update_settings", "form_validation"])

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
   - Check existing files in \`./test-cases/\`
   - Use next available ID (TC-001, TC-002, etc.)
   - Format: TC-XXX-brief-description.md

2. **Create File with Frontmatter (with automatic dependency metadata)**:
   \`\`\`yaml
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
   \`\`\`

   **Auto-populated Dependency Fields:**
   - \`dependencies\`: Array of test case IDs this test depends on (e.g., ["TC-001"])
   - \`blocker\`: Boolean indicating if this test is a blocker for other tests
   - \`requires_auth\`: Boolean indicating if test requires authentication
   - \`capabilities\`: Array of capabilities this test provides (e.g., ["login", "authentication"])

   **Examples:**
   \`\`\`yaml
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
   \`\`\`

3. **Add Test Case Content**:
   \`\`\`markdown
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
   \`\`\`

### Step 4: Create Test Cases Directory if Needed

If \`./test-cases/\` doesn't exist, create it first:
\`\`\`bash
mkdir -p ./test-cases
\`\`\`

{{TEAM_COMMUNICATOR_INSTRUCTIONS}}

### Important Notes

- **Ambiguity Handling:** Use exploration (Step 1.5) and clarification (Step 1.6) protocols before generating test cases
  - CRITICAL/HIGH severity ambiguities → STOP and seek clarification
  - MEDIUM severity → Document assumptions with [ASSUMED: reason]
  - LOW severity → Mark gaps with [TO BE CLARIFIED: detail]
- Only use [TO BE EXPLORED] for LOW severity gaps that don't affect core test logic
- Group related test cases by feature area using consistent naming
- Ensure test case IDs are sequential and unique
- Link each test case to relevant test plan sections
- Consider external dependencies mentioned in documentation but only test UI interactions`,

   optionalSubagents: [
      {
         role: 'documentation-researcher',
         contentBlock: `#### 1.3 Gather Product Documentation

Use the documentation-researcher agent to gather comprehensive product documentation:

\`\`\`
Use the documentation-researcher agent to explore all available product documentation, specifically focusing on:
- UI elements and workflows
- User interactions and navigation paths
- Form fields and validation rules
- Error messages and edge cases
- Authentication and authorization flows
- Business rules and constraints
\`\`\``
      },
      {
         role: 'team-communicator',
         contentBlock: `### Step 4.5: Team Communication

Use the team-communicator agent to notify the product team about the new test cases:

\`\`\`
Use the team-communicator agent to:
1. Post an update about test case creation
2. Provide summary of test coverage and case count
3. Highlight any areas where clarification is needed
4. Share key test cases that validate critical functionality
5. Ask for team review and validation of test scenarios
6. Mention if any uncertainties were discovered that need exploration
7. Use appropriate channel and threading for the update
\`\`\`

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
- Document any areas where team clarification was requested`
      }
   ],
   requiredSubagents: ['test-runner']
};
