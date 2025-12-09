import type { TaskStep } from '../types';

export const generateTestCasesStep: TaskStep = {
  id: 'generate-test-cases',
  title: 'Generate Manual Test Cases',
  category: 'generation',
  content: `## Generate Manual Test Case Files

Based on exploration and test plan, identify test scenarios for $ARGUMENTS:

1. **Critical User Paths** (automate as smoke tests)
2. **Happy Path Scenarios** (automate for regression)
3. **Error Handling** (evaluate automation ROI)
4. **Edge Cases** (consider manual testing)

For each scenario, create manual test case in \`./test-cases/TC-XXX-description.md\`:

\`\`\`markdown
---
id: TC-XXX
title: [Test Title]
automated: true
automated_test:
type: functional
area: [Feature Area]
---

## Objective
[What this test verifies]

## Preconditions
[Setup requirements]

## Test Steps
1. Step 1 - Expected result
2. Step 2 - Expected result

## Test Data
- URL: \${TEST_BASE_URL}
- User: \${TEST_USER_EMAIL}
\`\`\`

**Naming Convention:**
- TC-001-login-valid-credentials.md
- TC-002-login-invalid-password.md
- TC-003-checkout-happy-path.md`,
  tags: ['generation', 'test-cases'],
};
