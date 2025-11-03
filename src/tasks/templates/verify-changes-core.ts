/**
 * Verify Changes - Core Instructions
 * Shared workflow logic for verifying changes across different trigger types
 */

import { CLARIFICATION_INSTRUCTIONS } from './clarification-instructions';
import { EXPLORATION_INSTRUCTIONS } from './exploration-instructions';

export const VERIFY_CHANGES_CORE_INSTRUCTIONS = `
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

{{DOCUMENTATION_RESEARCHER_INSTRUCTIONS}}

Before proceeding with test creation or execution, ensure requirements are clear through ambiguity detection and adaptive exploration.

${EXPLORATION_INSTRUCTIONS.replace(/{{STEP_NUMBER}}/g, '2')}

${CLARIFICATION_INSTRUCTIONS.replace(/{{STEP_NUMBER}}/g, '2')}

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

Look in the \`./test-cases/\` directory for relevant test coverage:

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

If coverage gaps exist, create new test cases using the \`generate-test-cases\` task:

#### 4.1 Determine What's Missing
Identify specific scenarios that aren't covered by existing test cases:
- New user flows introduced by the change
- Edge cases for new functionality
- Error handling and validation
- Integration points with other features
- Different user roles or permissions

#### 4.2 Generate Test Cases
Use the Task tool to invoke generate-test-cases:

\`\`\`
Use the generate-test-cases task with the following context:
- Feature/change description: [specific description]
- Scope: [what needs testing]
- Existing coverage: [what's already tested]
- Gap areas: [what's missing]
\`\`\`

The task will create new test case files in \`./test-cases/\` following the standard format.

### Step 5: Run Tests

{{TEST_RUNNER_INSTRUCTIONS}}

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

{{TEAM_COMMUNICATOR_INSTRUCTIONS}}

Structure your findings clearly with:
- **Executive Summary**: Overall result (✅ Pass / ❌ Fail / ⚠️ Partial)
- **Test Coverage**: What was tested
- **Results Detail**: Pass/fail for each test case
- **Issues Found**: List any problems discovered
- **Screenshots/Evidence**: Link to test run folders
- **Recommendations**: Next steps or actions needed
`;
