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

**2. Automated Tests** (in directory specified by \`./tests/CLAUDE.md\`):
- Organized by feature in subdirectories
- Each test file references manual test case ID in comments
- Follows conventions defined in \`./tests/CLAUDE.md\`
- Follows selector priority from \`./tests/CLAUDE.md\`
- Uses environment variables for test data
- Includes proper TypeScript typing

**3. Page Objects** (in directory specified by \`./tests/CLAUDE.md\`):
- Follow page object conventions from \`./tests/CLAUDE.md\`
- Contain only actions, no assertions
- Properly typed with TypeScript

**4. Supporting Files** (in directories specified by \`./tests/CLAUDE.md\`):
- Fixtures created for common setup
- Helper functions for data generation
- Component objects for reusable UI elements
- Types defined as needed

**Validation Checklist:**
- [ ] All manual test cases have proper frontmatter
- [ ] Automated tests reference their manual test case IDs
- [ ] Test artifacts follow conventions from \`./tests/CLAUDE.md\`
- [ ] No hardcoded test data (uses environment variables)
- [ ] Tests are syntactically valid TypeScript`,
  tags: ['maintenance', 'validation', 'test-artifacts'],
};
