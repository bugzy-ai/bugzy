/**
 * Run Tests Task (Composed)
 * Select and run test cases using the browser-automation agent
 */

import type { ComposedTaskTemplate } from '../steps/types';
import { TASK_SLUGS } from '../constants';

export const runTestsTask: ComposedTaskTemplate = {
  slug: TASK_SLUGS.RUN_TESTS,
  name: 'Run Tests',
  description: 'Execute automated tests, analyze failures, and fix test issues automatically',

  frontmatter: {
    description: 'Execute automated tests, analyze failures, and fix test issues automatically',
    'argument-hint': '[file-pattern|tag|all] (e.g., "auth", "@smoke", or a specific test file path)',
  },

  steps: [
    // Step 1: Overview (inline)
    {
      inline: true,
      title: 'Run Tests Overview',
      content: `# Run Tests Command

Execute automated tests, analyze failures using JSON reports, automatically fix test issues, and log product bugs. Read \`./tests/CLAUDE.md\` for framework-specific conventions and commands.`,
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
  - File pattern: "auth" → find matching test files (see \`./tests/CLAUDE.md\` for directory structure)
  - Tag: "@smoke" → runs tests with tag annotation
  - Specific file: path to a specific test file
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

Read \`./tests/CLAUDE.md\` for the test directory structure, file patterns, and execution commands.

Parse the selector argument to determine which tests to run:

**File Pattern** (e.g., "auth", "login"):
- Find matching test files in the test directory specified by \`./tests/CLAUDE.md\`
- Example: "auth" → finds all test files with "auth" in the name

**Tag** (e.g., "@smoke", "@regression"):
- Run tests with specific tag annotation using the tag command from \`./tests/CLAUDE.md\`

**Specific File**:
- Run that specific test file using the single-file command from \`./tests/CLAUDE.md\`

**All Tests** ("all" or no selector):
- Run entire test suite using the run-all command from \`./tests/CLAUDE.md\`

#### Find Matching Test Files
Use glob patterns to find test files in the directory structure defined by \`./tests/CLAUDE.md\`.

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
    'run-tests',
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

#### If Browser Automation Agent Fails
If the browser-automation agent encounters issues:
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
- **Always read** \`./tests/docs/test-execution-strategy.md\` before selecting tests
- Default to \`@smoke\` tests for fast validation unless user explicitly requests otherwise
- Smoke tests provide 100% manual test case coverage with zero redundancy (~2-5 min)
- Full regression includes intentional redundancy for diagnostic value (~10-15 min)
- Use context keywords from user request to choose appropriate tier

**Test Execution**:
- Automated tests are executed via bash command, not through agents
- Test execution time varies by tier (see strategy document for details)
- JSON reports provide structured test results for analysis
- Test framework may capture traces, screenshots, and videos on failures (see \`./tests/CLAUDE.md\`)
- Test artifacts are stored as defined in \`./tests/CLAUDE.md\`

**Failure Handling**:
- Test failures are automatically triaged (product bugs vs test issues)
- Test issues are automatically fixed by the test-debugger-fixer subagent
- Product bugs are logged via issue tracker after triage
- All results are analyzed for learning opportunities and team communication
- Critical failures trigger immediate team notification

**Related Documentation**:
- \`./tests/docs/test-execution-strategy.md\` - When and why to run specific tests
- \`./tests/docs/testing-best-practices.md\` - How to write tests (patterns and anti-patterns)`,
    },
  ],

  requiredSubagents: ['browser-automation', 'test-debugger-fixer'],
  optionalSubagents: ['issue-tracker', 'team-communicator'],
  dependentTasks: [],
};
