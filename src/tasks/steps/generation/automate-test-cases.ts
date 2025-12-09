import type { TaskStep } from '../types';

export const automateTestCasesStep: TaskStep = {
  id: 'automate-test-cases',
  title: 'Automate Test Cases',
  category: 'generation',
  content: `## Automate Test Cases

For each test case marked \`automated: true\`:

{{INVOKE_TEST_CODE_GENERATOR}} with the following context:

"Automate test cases for the focus area: $ARGUMENTS

**Context:**
- Manual test case files: [list TC-XXX files created]
- Test plan: test-plan.md
- Exploration findings: ./exploration-reports/

**The agent should:**
1. Read manual test case files
2. Explore the feature to gather selectors
3. Create Page Objects and automated tests
4. Run each test and iterate until passing (max 3 attempts)
5. Update manual test case with automated_test reference
6. Document any product bugs discovered

**For each test:**
- Run: \`npx playwright test [test-file]\`
- If fails, classify as product bug or test issue
- If test issue: Apply fix patterns and retry
- If product bug: Document and mark test as blocked
- Continue until test passes or is blocked"

**Output Location:**
- Page Objects: \`./tests/pages/\`
- Test specs: \`./tests/specs/\`

**Update Manual Test Cases:**
After automation, update the manual test case frontmatter:
\`\`\`yaml
automated: true
automated_test: tests/specs/feature/test-name.spec.ts
\`\`\``,
  invokesSubagents: ['test-code-generator'],
  tags: ['generation', 'automation'],
};
