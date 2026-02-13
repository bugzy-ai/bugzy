import type { TaskStep } from '../types';

export const triageFailuresStep: TaskStep = {
  id: 'triage-failures',
  title: 'Triage Failed Tests',
  category: 'execution',
  content: `## Triage Failed Tests

After analyzing test results, triage each failure to determine if it's a product bug or test issue.

**IMPORTANT: Do NOT report bugs without triaging first.**

For each failed test:

1. **Read failure details** from JSON report (error message, stack trace)
2. **Classify the failure:**
   - **Product bug**: Application behaves incorrectly
   - **Test issue**: Test code needs fixing (selector, timing, assertion)
3. **Document classification** for next steps

**Classification Guidelines:**

| Classification | Indicators | Examples |
|---------------|------------|----------|
| **Product Bug** | Correct test code, unexpected application behavior | Button click leads to wrong page, Form submission returns 500 error, Feature missing or broken |
| **Test Issue** | Test code needs fixing | Selector not found but element exists, Timeout on existing element, Race condition, Wrong assertion |

**Common Test Issues** (refer to \`./tests/CLAUDE.md\` "Common Fix Patterns" for framework-specific guidance):
- Brittle selectors (not following selector priority from CLAUDE.md)
- Missing waits for async operations
- Race conditions with animations
- Incorrect expected values
- Stale element references

**Common Product Bugs:**
- Unexpected error responses (500, 404)
- Missing UI elements that should exist
- Incorrect data displayed
- Broken navigation flows
- Validation not working as expected

**Document Classification:**
\`\`\`markdown
### Failure Triage

| Test ID | Test Name | Classification | Reason |
|---------|-----------|---------------|--------|
| TC-001 | Login test | TEST ISSUE | Selector brittle - uses CSS instead of role |
| TC-002 | Checkout | PRODUCT BUG | 500 error on form submit |
\`\`\``,
  tags: ['execution', 'triage', 'analysis'],
};
