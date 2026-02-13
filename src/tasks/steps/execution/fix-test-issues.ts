import type { TaskStep } from '../types';

export const fixTestIssuesStep: TaskStep = {
  id: 'fix-test-issues',
  title: 'Fix Test Issues Automatically',
  category: 'execution',
  content: `## Fix Test Issues Automatically

For each test classified as **[TEST ISSUE]**, use the test-debugger-fixer agent to automatically fix the test:

{{INVOKE_TEST_DEBUGGER_FIXER}}

For each failed test classified as a test issue (not a product bug), provide:
- Test run timestamp: [from manifest.timestamp]
- Test case ID: [from testCases[].id in manifest]
- Test name/title: [from testCases[].name in manifest]
- Error message: [from testCases[].executions[last].error]
- Execution details path: test-runs/{timestamp}/{testCaseId}/exec-1/

The agent will:
1. Read the execution details from result.json
2. Analyze the failure (error message, trace if available)
3. Identify the root cause (brittle selector, missing wait, race condition, etc.)
4. Apply appropriate fix pattern from \`./tests/CLAUDE.md\`
5. Rerun the test
6. The custom reporter will automatically create the next exec-N/ folder
6b. If no custom reporter (BYOT mode — check for \`reporters/bugzy-reporter.ts\`):
   Run the parse script to update the manifest with re-run results:
   \`npx tsx reporters/parse-results.ts --input <re-run-output> --timestamp <current> --test-id <testCaseId>\`
   This creates exec-N+1/ and updates the manifest.
7. Repeat up to 3 times if needed (exec-1, exec-2, exec-3)
8. Report success or escalate as likely product bug

**After test-debugger-fixer completes:**
- If fix succeeded: Mark test as fixed, add to "Tests Fixed" list
- If still failing after 3 attempts: Reclassify as potential product bug

**Track Fixed Tests:**
- Maintain list of tests fixed automatically
- Include fix description (e.g., "Applied selector fix pattern from CLAUDE.md")
- Note verification status (test now passes)`,
  invokesSubagents: ['test-debugger-fixer'],
  tags: ['execution', 'fixing', 'automation'],
};
