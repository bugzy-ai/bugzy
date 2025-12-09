import type { TaskStep } from '../types';

export const extractEnvVariablesStep: TaskStep = {
  id: 'extract-env-variables',
  title: 'Extract Environment Variables',
  category: 'generation',
  content: `## Extract Environment Variables

Parse test plan and test cases for TEST_* variable references and update .env.testdata.

**Process:**
1. Scan test plan for environment variable references (TEST_*)
2. Scan test case files for \${TEST_*} patterns
3. Create/update \`.env.testdata\` with discovered variables

**Common Variables:**
\`\`\`bash
# Base configuration
TEST_BASE_URL=https://example.com
TEST_API_URL=https://api.example.com

# User credentials (non-secret test data)
TEST_OWNER_EMAIL=owner@test.com
TEST_USER_EMAIL=user@test.com

# Test data
TEST_DEFAULT_TIMEOUT=30000
\`\`\`

**Update .env.testdata:**
- Add new variables with actual test values (not secrets)
- Preserve existing variables
- Add comments for new sections

**Note:** Secret values (passwords, API keys) should NOT be in .env.testdata. They go in .env only.`,
  tags: ['generation', 'environment'],
};
