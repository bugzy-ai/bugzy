/**
 * Generate Test Cases Task (Composed)
 * Generate both manual test case documentation AND automated Playwright test scripts
 */

import type { ComposedTaskTemplate } from '../steps/types';
import { TASK_SLUGS } from '../constants';

export const generateTestCasesTask: ComposedTaskTemplate = {
  slug: TASK_SLUGS.GENERATE_TEST_CASES,
  name: 'Generate Test Cases',
  description: 'Generate manual test case documentation AND automated Playwright test scripts from test plan',

  frontmatter: {
    description: 'Generate manual test case documentation AND automated Playwright test scripts from test plan',
    'argument-hint': '--type [exploratory|functional|regression|smoke] --focus [optional-feature]',
  },

  steps: [
    // Step 1: Overview (inline)
    {
      inline: true,
      title: 'Generate Test Cases Overview',
      content: `Generate comprehensive test artifacts including BOTH manual test case documentation AND automated Playwright test scripts.

This command generates:
1. **Manual Test Case Documentation** (in \`./test-cases/\`) - Human-readable test cases in markdown format
2. **Automated Playwright Tests** (in \`./tests/specs/\`) - Executable TypeScript test scripts
3. **Page Object Models** (in \`./tests/pages/\`) - Reusable page classes for automated tests
4. **Supporting Files** (fixtures, helpers, components) - As needed for test automation`,
    },
    // Step 2: Security Notice (library)
    'security-notice',
    // Step 3: Arguments (inline)
    {
      inline: true,
      title: 'Arguments',
      content: `Arguments: $ARGUMENTS

**Parse Arguments:**
Extract the following from arguments:
- **type**: Test type (exploratory, functional, regression, smoke) - defaults to functional
- **focus**: Optional specific feature or section to focus on`,
    },
    // Step 4: Load Project Context (library)
    'load-project-context',
    // Step 5: Knowledge Base Read (library)
    'read-knowledge-base',
    // Step 5: Gather Context (inline)
    {
      inline: true,
      title: 'Gather Context',
      content: `**1.1 Read Test Plan**
Read the test plan from \`test-plan.md\` to understand:
- Test items and features
- Testing approach and automation strategy
- Test Automation Strategy section (automated vs exploratory)
- Pass/fail criteria
- Test environment and data requirements
- Automation decision criteria

**1.2 Check Existing Test Cases and Tests**
- List all files in \`./test-cases/\` to understand existing manual test coverage
- List all files in \`./tests/specs/\` to understand existing automated tests
- Determine next test case ID (TC-XXX format)
- Identify existing Page Objects in \`./tests/pages/\`
- Avoid creating overlapping test cases or duplicate automation`,
    },
    // Step 6: Documentation Researcher (conditional library step)
    {
      stepId: 'gather-documentation',
      conditionalOnSubagent: 'documentation-researcher',
    },
    // Step 7: Exploration Protocol (from library)
    'exploration-protocol',
    // Step 8: Clarification Protocol (from library)
    'clarification-protocol',
    // Step 9: Organize Test Scenarios (inline - task-specific)
    {
      inline: true,
      title: 'Organize Test Scenarios by Area',
      content: `Based on exploration and documentation, organize test scenarios by feature area/component:

**Group scenarios into areas** (e.g., Authentication, Dashboard, Checkout, Profile Management):
- Each area should be a logical feature grouping
- Areas should be relatively independent for parallel test execution
- Consider the application's navigation structure and user flows

**For each area, identify scenarios**:

1. **Critical User Paths** (must automate as smoke tests):
   - Login/authentication flows
   - Core feature workflows
   - Data creation/modification flows
   - Critical business transactions

2. **Happy Path Scenarios** (automate for regression):
   - Standard user workflows
   - Common use cases
   - Typical data entry patterns

3. **Error Handling Scenarios** (evaluate automation ROI):
   - Validation error messages
   - Network error handling
   - Permission/authorization errors

4. **Edge Cases** (consider manual testing):
   - Rare scenarios (<1% occurrence)
   - Complex exploratory scenarios
   - Visual/UX validation requiring judgment
   - Features in heavy flux

**Output**: Test scenarios organized by area with automation decisions for each

Example structure:
- **Authentication**: TC-001 Valid login (smoke, automate), TC-002 Invalid password (automate), TC-003 Password reset (automate)
- **Dashboard**: TC-004 View dashboard widgets (smoke, automate), TC-005 Filter data by date (automate), TC-006 Export data (manual - rare use)`,
    },
    // Step 10: Generate Manual Test Cases (inline)
    {
      inline: true,
      title: 'Generate All Manual Test Case Files',
      content: `Generate ALL manual test case markdown files in the \`./test-cases/\` directory BEFORE invoking the test-code-generator agent.

**For each test scenario from the previous step:**

1. **Create test case file** in \`./test-cases/\` with format \`TC-XXX-feature-description.md\`
2. **Include frontmatter** with:
   - \`id:\` TC-XXX (sequential ID)
   - \`title:\` Clear, descriptive title
   - \`automated:\` true/false (based on automation decision)
   - \`automated_test:\` (leave empty - will be filled by subagent when automated)
   - \`type:\` exploratory/functional/regression/smoke
   - \`area:\` Feature area/component
3. **Write test case content**:
   - **Objective**: Clear description of what is being tested
   - **Preconditions**: Setup requirements, test data needed
   - **Test Steps**: Numbered, human-readable steps
   - **Expected Results**: What should happen at each step
   - **Test Data**: Environment variables to use (e.g., \${TEST_BASE_URL}, \${TEST_OWNER_EMAIL})
   - **Notes**: Any assumptions, clarifications needed, or special considerations

**Output**: All manual test case markdown files created in \`./test-cases/\` with automation flags set`,
    },
    // Step 11: Automate Test Cases (inline - detailed instructions for test-code-generator)
    {
      inline: true,
      title: 'Automate Test Cases Area by Area',
      content: `**IMPORTANT**: Process each feature area separately to enable incremental, focused test creation.

**For each area**, invoke the test-code-generator agent:

**Prepare Area Context:**
Before invoking the agent, identify the test cases for the current area:
- Current area name
- Test case files for this area (e.g., TC-001-valid-login.md, TC-002-invalid-password.md)
- Which test cases are marked for automation (automated: true)
- Test type from arguments
- Test plan reference: test-plan.md
- Existing automated tests in ./tests/specs/
- Existing Page Objects in ./tests/pages/

**Invoke test-code-generator Agent:**

{{INVOKE_TEST_CODE_GENERATOR}} for the current area with the following context:

"Automate test cases for the [AREA_NAME] area.

**Context:**
- Area: [AREA_NAME]
- Manual test case files to automate: [list TC-XXX files marked with automated: true]
- Test type: {type}
- Test plan: test-plan.md
- Manual test cases directory: ./test-cases/
- Existing automated tests: ./tests/specs/
- Existing Page Objects: ./tests/pages/

**The agent should:**
1. Read the manual test case files for this area
2. Check existing Page Object infrastructure for this area
3. Explore the feature area to understand implementation (gather selectors, URLs, flows)
4. Build missing Page Objects and supporting code
5. For each test case marked \`automated: true\`:
   - Create automated Playwright test in ./tests/specs/
   - Update the manual test case file to reference the automated test path
6. Run and iterate on each test until it passes or fails with a product bug
7. Update .env.testdata with any new variables

**Focus only on the [AREA_NAME] area** - do not automate tests for other areas yet."

**Verify Area Completion:**
After the agent completes the area, verify:
- Manual test case files updated with automated_test references
- Automated tests created for all test cases marked automated: true
- Tests are passing (or failing with documented product bugs)
- Page Objects created/updated for the area

**Repeat for Next Area:**
Move to the next area and repeat until all areas are complete.

**Benefits of area-by-area approach**:
- Agent focuses on one feature at a time
- POMs built incrementally as needed
- Tests verified before moving to next area
- Easier to manage and track progress
- Can pause/resume between areas if needed`,
    },
    // Step 12: Validate Artifacts (library)
    'validate-test-artifacts',
    // Step 13: Create Directories (inline)
    {
      inline: true,
      title: 'Create Directories if Needed',
      content: `Ensure required directories exist:
\`\`\`bash
mkdir -p ./test-cases
mkdir -p ./tests/specs
mkdir -p ./tests/pages
mkdir -p ./tests/components
mkdir -p ./tests/fixtures
mkdir -p ./tests/helpers
\`\`\``,
    },
    // Step 14: Extract Env Variables (library)
    'extract-env-variables',
    // Step 15: Knowledge Base Update (library)
    'update-knowledge-base',
    // Step 16: Team Communication (conditional inline)
    {
      inline: true,
      title: 'Team Communication',
      content: `{{INVOKE_TEAM_COMMUNICATOR}} to notify the product team about the new test cases and automated tests:

\`\`\`
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
- Document any clarifications requested`,
      conditionalOnSubagent: 'team-communicator',
    },
    // Step 17: Final Summary (inline)
    {
      inline: true,
      title: 'Final Summary',
      content: `Provide a comprehensive summary showing:

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
- Note about copying .env.testdata to .env
- Mention any exploration needed for edge cases

**Important Notes:**
- **Both Manual AND Automated**: Generate both artifacts - they serve different purposes
- **Manual Test Cases**: Documentation, reference, can be executed manually when needed
- **Automated Tests**: Fast, repeatable, for CI/CD and regression testing
- **Automation Decision**: Not all test cases need automation - rare edge cases can stay manual
- **Linking**: Manual test cases reference automated tests; automated tests reference manual test case IDs
- **Two-Phase Workflow**: First generate all manual test cases, then automate area-by-area
- **Ambiguity Handling**: Use exploration and clarification protocols before generating
- **Environment Variables**: Use \`process.env.VAR_NAME\` in tests, update .env.testdata as needed
- **Test Independence**: Each test must be runnable in isolation and in parallel`,
    },
  ],

  requiredSubagents: ['test-runner', 'test-code-generator'],
  optionalSubagents: ['documentation-researcher', 'team-communicator'],
  dependentTasks: [],
};
