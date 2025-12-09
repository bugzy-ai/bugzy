import type { TaskStep } from '../types';

export const generateFinalReportStep: TaskStep = {
  id: 'generate-final-report',
  title: 'Generate Final Report',
  category: 'maintenance',
  content: `## Generate Final Report

Provide a comprehensive summary of the work completed:

**Workflow Summary:**
- Focus area: $ARGUMENTS
- Phases executed: [list]
- Phases skipped: [list with reasons]

**Artifacts Created:**
- Exploration report: [filename if created]
- Test plan: [created/updated/skipped]
- Manual test cases: [count created]
- Automated tests: [count created]
- Page Objects: [list]

**Test Results:**
- Tests passing: [count]
- Tests fixed automatically: [count]
- Tests blocked by product bugs: [count]
- Product bugs discovered: [list]

**Bug Summary:**
- New bugs reported: [count with IDs]
- Duplicate bugs found: [count]
- Bugs pending triage: [count]

**Next Steps:**
- Command to run tests: \`npx playwright test\`
- Areas for future coverage expansion
- Any clarifications still needed

**Recommendations:**
- [Any suggestions for improving test coverage]
- [Areas that need manual testing attention]
- [Technical debt or test maintenance items]`,
  tags: ['maintenance', 'reporting'],
};
