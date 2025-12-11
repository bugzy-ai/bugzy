import type { TaskStep } from '../types';

export const securityNoticeStep: TaskStep = {
  id: 'security-notice',
  title: 'Security Notice',
  category: 'security',
  content: `## SECURITY NOTICE

**CRITICAL**: Never read the \`.env\` file. It contains ONLY secrets.

**SECRETS** (go in .env ONLY - never in .env.testdata):
- Variables containing: PASSWORD, SECRET, TOKEN, KEY, CREDENTIALS, API_KEY
- Examples: TEST_USER_PASSWORD, TEST_API_KEY, TEST_AUTH_TOKEN, TEST_SECRET

**TEST DATA** (go in .env.testdata - safe to commit):
- URLs: TEST_BASE_URL, TEST_API_URL
- Emails: TEST_USER_EMAIL, TEST_OWNER_EMAIL
- Non-sensitive inputs: TEST_CHECKOUT_FIRST_NAME, TEST_DEFAULT_TIMEOUT

**Rule**: If a variable name contains PASSWORD, SECRET, TOKEN, or KEY - it's a secret.
Reference secret variable names only (e.g., \${TEST_USER_PASSWORD}) - values injected at runtime.
The \`.env\` file access is blocked by settings.json.`,
  tags: ['security', 'required'],
};
