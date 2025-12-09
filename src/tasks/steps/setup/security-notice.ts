import type { TaskStep } from '../types';

export const securityNoticeStep: TaskStep = {
  id: 'security-notice',
  title: 'Security Notice',
  category: 'security',
  content: `## SECURITY NOTICE

**CRITICAL**: Never read the \`.env\` file. It contains ONLY secrets (passwords, API keys).
- **Read \`.env.testdata\`** for non-secret environment variables (TEST_BASE_URL, TEST_OWNER_EMAIL, etc.)
- \`.env.testdata\` contains actual values for test data, URLs, and non-sensitive configuration
- For secrets: Reference variable names only (TEST_OWNER_PASSWORD) - values are injected at runtime
- The \`.env\` file access is blocked by settings.json`,
  tags: ['security', 'required'],
};
