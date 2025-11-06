/**
 * Generate Test Cases Task
 * Generate both manual test case documentation AND automated Playwright test scripts
 */

import { TaskTemplate } from '../types';
import { TASK_SLUGS } from '../constants';
import { EXPLORATION_INSTRUCTIONS } from '../templates/exploration-instructions';
import { CLARIFICATION_INSTRUCTIONS } from '../templates/clarification-instructions';

export const generateTestCasesTask: TaskTemplate = {
  slug: TASK_SLUGS.GENERATE_TEST_CASES,
  name: 'Generate Test Cases',
  description: 'Generate manual test case documentation AND automated Playwright test scripts from test plan',

  frontmatter: {
    description: 'Generate manual test case documentation AND automated Playwright test scripts from test plan',
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

Generate comprehensive test artifacts including BOTH manual test case documentation AND automated Playwright test scripts.

## Overview

This command generates:
1. **Manual Test Case Documentation** (in \`./test-cases/\`) - Human-readable test cases in markdown format
2. **Automated Playwright Tests** (in \`./tests/specs/\`) - Executable TypeScript test scripts
3. **Page Object Models** (in \`./tests/pages/\`) - Reusable page classes for automated tests
4. **Supporting Files** (fixtures, helpers, components) - As needed for test automation

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
- Testing approach and automation strategy
- Test Automation Strategy section (automated vs exploratory)
- Pass/fail criteria
- Test environment and data requirements
- Automation decision criteria

#### 1.2 Read Testing Best Practices Guide
Read \`.bugzy/runtime/testing-best-practices.md\` to understand:
- Page Object Model patterns and structure
- Selector strategy (role-based → test IDs → CSS)
- Test organization conventions
- Authentication patterns
- Async operations and waiting strategies
- Common anti-patterns to avoid

#### 1.3 Check Existing Test Cases and Tests
- List all files in \`./test-cases/\` to understand existing manual test coverage
- List all files in \`./tests/specs/\` to understand existing automated tests
- Determine next test case ID (TC-XXX format)
- Identify existing Page Objects in \`./tests/pages/\`
- Avoid creating overlapping test cases or duplicate automation

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

### Step 2: Generate Manual Test Cases AND Automated Tests

Use the test-code-generator agent to generate both manual test case documentation and automated Playwright test scripts:

\`\`\`
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
\`\`\`

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

1. **Manual Test Cases (in \`./test-cases/\`)**:
   - Each has unique TC-XXX ID
   - Frontmatter includes \`automated: true/false\` flag
   - If automated, includes \`automated_test\` path reference
   - Contains human-readable steps and expected results
   - References environment variables for test data

2. **Automated Tests (in \`./tests/specs/\`)**:
   - Organized by feature in subdirectories
   - Each test file references manual test case ID in comments
   - Uses Page Object Model pattern
   - Follows role-based selector priority
   - Uses environment variables for test data
   - Includes proper TypeScript typing

3. **Page Objects (in \`./tests/pages/\`)**:
   - Extend BasePage class
   - Use semantic selectors (getByRole, getByLabel, getByText)
   - Contain only actions, no assertions
   - Properly typed with TypeScript

4. **Supporting Files**:
   - Fixtures created for common setup (in \`./tests/fixtures/\`)
   - Helper functions for data generation (in \`./tests/helpers/\`)
   - Component objects for reusable UI elements (in \`./tests/components/\`)
   - Types defined as needed (in \`./tests/types/\`)

### Step 3: Create Directories if Needed

Ensure required directories exist:
\`\`\`bash
mkdir -p ./test-cases
mkdir -p ./tests/specs
mkdir -p ./tests/pages
mkdir -p ./tests/components
mkdir -p ./tests/fixtures
mkdir -p ./tests/helpers
\`\`\`

### Step 4: Update .env.example (if needed)

If new environment variables were introduced:
- Read current \`.env.example\`
- Add new TEST_* variables with empty values
- Group variables logically with comments
- Document what each variable is for

{{TEAM_COMMUNICATOR_INSTRUCTIONS}}

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
- Command to run automated tests: \`npx playwright test\`
- Instructions to run specific test file
- Note about copying .env.example to .env
- Mention any exploration needed for edge cases

### Important Notes

- **Both Manual AND Automated**: Generate both artifacts - they serve different purposes
- **Manual Test Cases**: Documentation, reference, can be executed manually when needed
- **Automated Tests**: Fast, repeatable, for CI/CD and regression testing
- **Automation Decision**: Not all test cases need automation - rare edge cases can stay manual
- **Linking**: Manual test cases reference automated tests; automated tests reference manual test case IDs
- **Best Practices**: Always follow \`.bugzy/runtime/testing-best-practices.md\` for automation patterns
- **Ambiguity Handling**: Use exploration (Step 1.5) and clarification (Step 1.6) protocols before generating
- **Environment Variables**: Use \`process.env.VAR_NAME\` in tests, update .env.example as needed
- **Test Independence**: Each test must be runnable in isolation and in parallel`,

  optionalSubagents: [
    {
      role: 'documentation-researcher',
      contentBlock: `#### 1.4 Gather Product Documentation

Use the documentation-researcher agent to gather comprehensive product documentation:

\`\`\`
Use the documentation-researcher agent to explore all available product documentation, specifically focusing on:
- UI elements and workflows
- User interactions and navigation paths
- Form fields and validation rules
- Error messages and edge cases
- Authentication and authorization flows
- Business rules and constraints
- API endpoints for test data setup
\`\`\``
    },
    {
      role: 'team-communicator',
      contentBlock: `### Step 4.5: Team Communication

Use the team-communicator agent to notify the product team about the new test cases and automated tests:

\`\`\`
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
\`\`\`

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
- Document any clarifications requested`
    }
  ],
  requiredSubagents: ['test-runner', 'test-code-generator']
};
