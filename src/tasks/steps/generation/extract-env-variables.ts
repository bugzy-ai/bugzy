import type { TaskStep } from '../types';

export const extractEnvVariablesStep: TaskStep = {
  id: 'extract-env-variables',
  title: 'Extract Environment Variables',
  category: 'generation',
  content: `## Extract Environment Variables

Parse test plan and test cases for TEST_* variable references.

**CRITICAL - Secret Detection:**
Before adding ANY variable to .env.testdata, check if it's a secret:
- Contains PASSWORD, SECRET, TOKEN, KEY, CREDENTIALS, API_KEY in the name -> **DO NOT ADD to .env.testdata**
- Secrets go in .env only, referenced by variable name in test cases

**Process:**
1. Scan for TEST_* variable references in test plan and test cases
2. For each variable found:
   - If name contains PASSWORD/SECRET/TOKEN/KEY -> Skip (it's a secret, goes in .env only)
   - If actual value is known -> Add to .env.testdata with value
   - If actual value is unknown -> Add to .env.testdata with empty value and \`# TODO: team to configure\` comment
3. Preserve existing variables in .env.testdata

**Example .env.testdata (non-secrets only):**
\`\`\`bash
# URLs and endpoints
TEST_BASE_URL=https://example.com
TEST_API_URL=https://api.example.com

# Non-sensitive user data (emails, names)
TEST_OWNER_EMAIL=owner@test.com
TEST_USER_EMAIL=user@test.com
TEST_CHECKOUT_FIRST_NAME=Test
TEST_DEFAULT_TIMEOUT=30000
\`\`\`

**Example .env (secrets only - NEVER commit):**
\`\`\`bash
TEST_USER_PASSWORD=actual_password_here
TEST_API_KEY=secret_key_here
\`\`\`

**Rule**: Any variable with PASSWORD, SECRET, TOKEN, or KEY in the name is a secret.`,
  tags: ['generation', 'environment'],
};
