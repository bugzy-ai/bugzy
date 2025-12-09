import type { TaskStep } from '../types';

export const validateTestArtifactsStep: TaskStep = {
  id: 'validate-test-artifacts',
  title: 'Validate Generated Test Artifacts',
  category: 'maintenance',
  content: `## Validate Generated Test Artifacts

After test generation completes, verify all artifacts meet quality standards:

**1. Manual Test Cases (in \`./test-cases/\`):**
- Each has unique TC-XXX ID
- Frontmatter includes \`automated: true/false\` flag
- If automated, includes \`automated_test\` path reference
- Contains human-readable steps and expected results
- References environment variables for test data

**2. Automated Tests (in \`./tests/specs/\`):**
- Organized by feature in subdirectories
- Each test file references manual test case ID in comments
- Uses Page Object Model pattern
- Follows role-based selector priority
- Uses environment variables for test data
- Includes proper TypeScript typing

**3. Page Objects (in \`./tests/pages/\`):**
- Extend BasePage class
- Use semantic selectors (getByRole, getByLabel, getByText)
- Contain only actions, no assertions
- Properly typed with TypeScript

**4. Supporting Files:**
- Fixtures created for common setup (in \`./tests/fixtures/\`)
- Helper functions for data generation (in \`./tests/helpers/\`)
- Component objects for reusable UI elements (in \`./tests/components/\`)
- Types defined as needed (in \`./tests/types/\`)

**Validation Checklist:**
- [ ] All manual test cases have proper frontmatter
- [ ] Automated tests reference their manual test case IDs
- [ ] Page Objects follow the BasePage pattern
- [ ] No hardcoded test data (uses environment variables)
- [ ] Tests are syntactically valid TypeScript`,
  tags: ['maintenance', 'validation', 'test-artifacts'],
};
