import type { TaskStep } from '../types';

/**
 * Analyze Test Codebase - Step for BYOT (Bring Your Own Tests) projects
 * Inspects the external test repository to understand framework, coverage, and conventions.
 */
export const analyzeTestCodebaseStep: TaskStep = {
  id: 'analyze-test-codebase',
  title: 'Analyze Test Codebase',
  category: 'exploration',
  content: `## Analyze External Test Codebase

Thoroughly analyze the customer's external test repository to understand their testing framework, conventions, coverage, and codebase structure.

### Step 1: Check for CLAUDE.md

Look for a \`CLAUDE.md\` file in the test repository root (\`./tests/CLAUDE.md\` or \`./CLAUDE.md\`). If it exists, read it to understand the project's documented conventions, setup instructions, and testing patterns.

### Step 2: Scan Directory Structure

Examine the repository structure to understand organization:
- List top-level directories and files
- Identify test directories (e.g., \`tests/\`, \`__tests__/\`, \`e2e/\`, \`spec/\`, \`cypress/\`)
- Note configuration files (e.g., \`playwright.config.ts\`, \`cypress.config.ts\`, \`jest.config.js\`, \`vitest.config.ts\`)
- Check \`package.json\` for test scripts and dependencies

### Step 3: Identify Test Framework

Determine the testing framework from configuration files and dependencies:
- **Playwright**: \`playwright.config.ts\`, \`@playwright/test\` in dependencies
- **Cypress**: \`cypress.config.ts\`, \`cypress\` in dependencies
- **Jest**: \`jest.config.js\`, \`jest\` in dependencies
- **Vitest**: \`vitest.config.ts\`, \`vitest\` in dependencies
- **Other**: Check for \`mocha\`, \`ava\`, \`tap\`, custom runners

Note the test runner, assertion library, and any additional tooling (e.g., \`msw\`, \`testing-library\`, page objects).

### Step 4: Catalog Test Coverage

Analyze test files to understand what's being tested:
- Read test file names and directory organization
- Parse \`describe()\` / \`it()\` / \`test()\` blocks to understand test structure
- Group tests by feature area (e.g., authentication, checkout, user management)
- Count total test files and approximate number of test cases
- Note any skipped or pending tests

### Step 5: Document Conventions

Identify testing patterns and conventions:
- **Naming patterns**: How test files are named (e.g., \`*.spec.ts\`, \`*.test.ts\`, \`*.e2e.ts\`)
- **Page Objects / Fixtures**: Look for page object patterns, custom fixtures, or helper utilities
- **Data management**: How test data is handled (fixtures, factories, seeds)
- **Environment configuration**: How environments are configured (.env files, config objects)
- **CI integration**: Check for CI config files (GitHub Actions, CircleCI, etc.)

### Step 6: Generate Summary

Create a structured summary of findings and commit it to the project repository:

\`\`\`
File: .bugzy/runtime/test-codebase-analysis.md

Contents:
- Framework: [name and version]
- Test runner: [runner]
- Total test files: [count]
- Estimated test cases: [count]
- Feature areas covered: [list]
- Key conventions: [summary]
- Directory structure: [overview]
- Notable patterns: [page objects, fixtures, etc.]
\`\`\`

### Step 7: Generate CLAUDE.md (if missing)

If the external test repository does NOT have a \`CLAUDE.md\`, generate a framework-appropriate draft based on the analysis findings:
- Include discovered framework and runner
- Document build/run commands from package.json
- Note key conventions discovered
- Include directory structure overview
- Save as a draft for customer review

**Important**: Do NOT use the Playwright-specific template — generate content based on what was actually discovered in the repository.

Commit the analysis results to the project repo so they are available for future task executions.`,
  tags: ['exploration', 'byot', 'analysis'],
};
