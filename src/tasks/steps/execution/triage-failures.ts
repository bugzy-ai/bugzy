import type { TaskStep } from '../types';

export const triageFailuresStep: TaskStep = {
  id: 'triage-failures',
  title: 'Triage Failed Tests',
  category: 'execution',
  content: `## Triage Failed Tests

After analyzing test results, triage each failure to determine if it's a product bug or test issue.

**IMPORTANT: Do NOT report bugs without triaging first.**

### 1. Check Failure Classification

**Before triaging any failure**, read \`new_failures\` from the latest \`test-runs/*/manifest.json\`:

| \`new_failures\` State | Action |
|------------------------|--------|
| Non-empty array | Only triage failures listed in \`new_failures\`. Do not investigate, fix, or create issues for \`known_failures\`. |
| Empty array | No new failures to triage. Output "0 new failures to triage" and skip the rest of this step. |
| Field missing | Fall back: triage all failed tests (backward compatibility with older reporter versions). |

### 2. Triage Each Failure

For each failed test (from \`new_failures\` or all failures if field is missing):

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

### 3. Document Results

\`\`\`markdown
### Failure Triage Summary

**New failures triaged: N** | **Known failures skipped: M**

| Test ID | Test Name | Classification | Reason |
|---------|-----------|---------------|--------|
| TC-001 | Login test | TEST ISSUE | Selector brittle - uses CSS instead of role |
| TC-002 | Checkout | PRODUCT BUG | 500 error on form submit |

#### Skipped Known Failures
| Test ID | Test Name | Last Passed Run |
|---------|-----------|-----------------|
| TC-003 | Search | 20260210-103045 |
\`\`\``,
  tags: ['execution', 'triage', 'analysis'],
};
