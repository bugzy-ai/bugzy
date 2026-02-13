/**
 * Generate Test Cases Task (Composed)
 * Generate both manual test case documentation AND automated test scripts
 */

import type { ComposedTaskTemplate } from '../steps/types';
import { TASK_SLUGS } from '../constants';

export const generateTestCasesTask: ComposedTaskTemplate = {
  slug: TASK_SLUGS.GENERATE_TEST_CASES,
  name: 'Generate Test Cases',
  description: 'Generate manual test case documentation AND automated test scripts from test plan',

  frontmatter: {
    description: 'Generate manual test case documentation AND automated test scripts from test plan',
    'argument-hint': '--type [exploratory|functional|regression|smoke] --focus [optional-feature]',
  },

  steps: [
    // Step 1: Overview (inline)
    {
      inline: true,
      title: 'Generate Test Cases Overview',
      content: `Generate comprehensive test artifacts including BOTH manual test case documentation AND automated test scripts. Read \`./tests/CLAUDE.md\` for framework-specific conventions, directory structure, and commands.

This command generates:
1. **Manual Test Case Documentation** (in \`./test-cases/\`) - Human-readable test cases in markdown format
2. **Automated Test Scripts** (in directory from \`./tests/CLAUDE.md\`) - Executable test scripts
3. **Page Objects** (in directory from \`./tests/CLAUDE.md\`) - Reusable page classes for automated tests
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
- List existing automated tests in the test directory (see \`./tests/CLAUDE.md\` for structure)
- Determine next test case ID (TC-XXX format)
- Identify existing page objects (see \`./tests/CLAUDE.md\` for directory)
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
      content: `Generate ALL manual test case markdown files in \`./test-cases/\` BEFORE invoking the test-code-generator agent.

Create files using \`TC-XXX-feature-description.md\` format. Follow the format of existing test cases in the directory. If no existing cases exist, include:
- Frontmatter with test case metadata (id, title, type, area, \`automated: true/false\`, \`automated_test:\` empty)
- Clear test steps with expected results
- Required test data references (use env var names, not values)`,
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
- Existing automated tests: [directory from ./tests/CLAUDE.md]
- Existing page objects: [directory from ./tests/CLAUDE.md]

**Knowledge Base Patterns (MUST APPLY):**
Include ALL relevant testing patterns from the knowledge base that apply to this area. For example, if the KB documents timing behaviors (animation delays, loading states), selector gotchas, or recommended assertion approaches — list them here explicitly and instruct the agent to use the specific patterns described (e.g., specific assertion methods with specific timeouts). The test-code-generator does not have access to the knowledge base, so you MUST relay the exact patterns and recommended code approaches.

**The agent should:**
1. Read the manual test case files for this area
2. Check existing Page Object infrastructure for this area
3. Explore the feature area to understand implementation (gather selectors, URLs, flows)
4. Build missing Page Objects and supporting code
5. For each test case marked \`automated: true\`:
   - Create automated test in the test directory (from ./tests/CLAUDE.md)
   - Update the manual test case file to reference the automated test path
   - Apply ALL knowledge base patterns listed above (timing, selectors, assertions)
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
      content: `Ensure required directories exist. Create the \`./test-cases/\` directory for manual test cases, and create the test directories specified in \`./tests/CLAUDE.md\` (test specs, page objects, components, fixtures, helpers).`,
    },
    // Step 14: Extract Env Variables (library)
    'extract-env-variables',
    // Step 15: Knowledge Base Update (library)
    'update-knowledge-base',
    // Step 16: Team Communication (conditional inline)
    {
      inline: true,
      title: 'Team Communication',
      content: `{{INVOKE_TEAM_COMMUNICATOR}} to share test case and automation results with the team, highlighting coverage areas, automation vs manual-only decisions, and any unresolved clarifications. Ask for team review.`,
      conditionalOnSubagent: 'team-communicator',
    },
    // Step 17: Final Summary (inline)
    {
      inline: true,
      title: 'Final Summary',
      content: `Provide a summary of created artifacts: manual test cases (count, IDs), automated tests (count, spec files), page objects and supporting files, coverage by area, and command to run tests (from \`./tests/CLAUDE.md\`).`,
    },
  ],

  requiredSubagents: ['browser-automation', 'test-code-generator'],
  optionalSubagents: ['documentation-researcher', 'team-communicator'],
  dependentTasks: [],
};
