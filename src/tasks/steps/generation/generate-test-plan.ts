import type { TaskStep } from '../types';

export const generateTestPlanStep: TaskStep = {
  id: 'generate-test-plan',
  title: 'Generate Test Plan',
  category: 'generation',
  content: `## Generate Lightweight Test Plan

Generate a **concise feature checklist** (~50-100 lines) using this format:

\`\`\`markdown
---
version: 1.0.0
created_at: [DATE]
updated_at: [DATE]
status: draft
---

# Test Plan: [PROJECT_NAME]

## Overview
[2-3 sentences about testing focus]

## Features to Test

### [Feature Area - based on $ARGUMENTS]
- [ ] Feature 1 - Brief description
- [ ] Feature 2 - Brief description

## Out of Scope
- Items not being tested

## Test Environment
- URL: TEST_BASE_URL
- Credentials: TEST_USER_EMAIL / TEST_USER_PASSWORD

## Notes
- See ./exploration-reports/ for detailed UI discovery
\`\`\`

**Save Test Plan:**
- Save to \`test-plan.md\` in project root
- Keep document under 100 lines`,
  tags: ['generation', 'planning'],
};
