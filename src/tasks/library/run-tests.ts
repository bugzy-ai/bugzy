/**
 * Run Tests Task (Composed)
 * Select and run test cases using the test-runner agent
 */

import type { ComposedTaskTemplate } from '../steps/types';
import { TASK_SLUGS } from '../constants';

export const runTestsTask: ComposedTaskTemplate = {
  slug: TASK_SLUGS.RUN_TESTS,
  name: 'Run Tests',
  description: 'Execute automated Playwright tests, analyze failures, and fix test issues automatically',

  frontmatter: {
    description: 'Execute automated Playwright tests, analyze failures, and fix test issues automatically',
    'argument-hint': '[file-pattern|tag|all] (e.g., "auth", "@smoke", "tests/specs/login.spec.ts")',
  },

  steps: [
    // Step 1: Overview (inline)
    {
      inline: true,
      title: 'Run Tests Overview',
      content: `# Run Tests Command

Execute automated Playwright tests, analyze failures using JSON reports, automatically fix test issues, and log product bugs.`,
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
- **selector**: Test selection criteria
  - File pattern: "auth" → finds tests/specs/**/*auth*.spec.ts
  - Tag: "@smoke" → runs tests with @smoke annotation
  - Specific file: "tests/specs/login.spec.ts"
  - All tests: "all" or "" → runs entire test suite`,
    },
    // Step 4: Load Project Context (library)
    'load-project-context',
    // Step 5: Knowledge Base Read (library)
    'read-knowledge-base',
    // Step 5: Test Execution Strategy (library)
    'read-test-strategy',
    // Step 6: Clarification Protocol (library)
    'clarification-protocol',
    // Step 7: Identify Tests (inline - task-specific)
    {
      inline: true,
      title: 'Identify Automated Tests to Run',
      content: `#### Understand Test Selection
Parse the selector argument to determine which tests to run:

**File Pattern** (e.g., "auth", "login"):
- Find matching test files: \`tests/specs/**/*[pattern]*.spec.ts\`
- Example: "auth" → finds all test files with "auth" in the name

**Tag** (e.g., "@smoke", "@regression"):
- Run tests with specific Playwright tag annotation
- Use Playwright's \`--grep\` option

**Specific File** (e.g., "tests/specs/auth/login.spec.ts"):
- Run that specific test file

**All Tests** ("all" or no selector):
- Run entire test suite: \`tests/specs/**/*.spec.ts\`

#### Find Matching Test Files
Use glob patterns to find test files:
\`\`\`bash
# For file pattern
ls tests/specs/**/*[pattern]*.spec.ts

# For specific file
ls tests/specs/auth/login.spec.ts

# For all tests
ls tests/specs/**/*.spec.ts
\`\`\`

#### Validate Test Files Exist
Check that at least one test file was found:
- If no tests found, inform user and suggest available tests
- List available test files if selection was unclear

#### Confirm Selection Before Execution
Before running tests, confirm the selection with the user if ambiguous:
- **Clear selection** (specific file or tag): Proceed immediately
- **Pattern match** (multiple files): List matching files and ask for confirmation if count > 5
- **No selector** (all tests): Confirm running full suite before executing`,
    },
    // Step 7-10: Test Execution (library steps)
    'run-playwright-tests',
    'parse-test-results',
    'triage-failures',
    'fix-test-issues',
    // Step 11: Log Product Bugs (conditional - library step)
    {
      stepId: 'log-product-bugs',
      conditionalOnSubagent: 'issue-tracker',
    },
    // Step 12: Knowledge Base Update (library)
    'update-knowledge-base',
    // Step 13: Team Communication (conditional - library step)
    {
      stepId: 'notify-team',
      conditionalOnSubagent: 'team-communicator',
    },
    // Step 14: Handle Special Cases (inline - task-specific)
    {
      inline: true,
      title: 'Handle Special Cases',
      content: `#### If No Test Cases Found
If no test cases match the selection criteria:
1. Inform user that no matching test cases were found
2. List available test cases or suggest running \`/generate-test-cases\` first
3. Provide examples of valid selection criteria

#### If Test Runner Agent Fails
If the test-runner agent encounters issues:
1. Report the specific error
2. Suggest troubleshooting steps
3. Offer to run tests individually if batch execution failed

#### If Test Cases Are Invalid
If selected test cases have formatting issues:
1. Report which test cases are invalid
2. Specify what's missing or incorrect
3. Offer to fix the issues or skip invalid tests

### Important Notes

**Test Selection Strategy**:
- **Always read** \`.bugzy/runtime/test-execution-strategy.md\` before selecting tests
- Default to \`@smoke\` tests for fast validation unless user explicitly requests otherwise
- Smoke tests provide 100% manual test case coverage with zero redundancy (~2-5 min)
- Full regression includes intentional redundancy for diagnostic value (~10-15 min)
- Use context keywords from user request to choose appropriate tier

**Test Execution**:
- Automated Playwright tests are executed via bash command, not through agents
- Test execution time varies by tier (see strategy document for details)
- JSON reports provide structured test results for analysis
- Playwright automatically captures traces, screenshots, and videos on failures
- Test artifacts are stored in test-results/ directory

**Failure Handling**:
- Test failures are automatically triaged (product bugs vs test issues)
- Test issues are automatically fixed by the test-debugger-fixer subagent
- Product bugs are logged via issue tracker after triage
- All results are analyzed for learning opportunities and team communication
- Critical failures trigger immediate team notification

**Related Documentation**:
- \`.bugzy/runtime/test-execution-strategy.md\` - When and why to run specific tests
- \`.bugzy/runtime/testing-best-practices.md\` - How to write tests (patterns and anti-patterns)`,
    },
  ],

  requiredSubagents: ['test-runner', 'test-debugger-fixer'],
  optionalSubagents: ['issue-tracker', 'team-communicator'],
  dependentTasks: [],
};
