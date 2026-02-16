import type { TaskStep } from '../types';

export const automateTestCasesStep: TaskStep = {
  id: 'automate-test-cases',
  title: 'Automate Test Cases',
  category: 'generation',
  content: `## Automate Test Cases

For each test case marked \`automated: true\`:

{{INVOKE_TEST_ENGINEER}} with the following context:

"Automate test cases for the focus area: $ARGUMENTS

**Context:**
- Manual test case files: [list TC-XXX files created]
- Test plan: test-plan.md
- Exploration findings: ./exploration-reports/

**The agent should:**
1. Read \`./tests/CLAUDE.md\` for framework conventions, directory structure, and commands
2. Read manual test case files
3. Explore the feature to gather selectors
4. Create page objects and automated tests following conventions from CLAUDE.md
5. Run each test using the command from CLAUDE.md and iterate until passing (max 3 attempts)
6. Update manual test case with automated_test reference
7. Document any product bugs discovered

**For each test:**
- Run using the test execution command from \`./tests/CLAUDE.md\`
- If fails, classify as product bug or test issue
- If test issue: Apply fix patterns from CLAUDE.md and retry
- If product bug: Document and mark test as blocked
- Continue until test passes or is blocked"

**Output Location:** As specified in \`./tests/CLAUDE.md\` Directory Structure section.

**Update Manual Test Cases:**
After automation, update the manual test case frontmatter:
\`\`\`yaml
automated: true
automated_test: tests/specs/feature/test-name.spec.ts
\`\`\``,
  invokesSubagents: ['test-engineer'],
  tags: ['generation', 'automation'],
};
