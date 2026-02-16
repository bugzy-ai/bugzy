import type { TaskStep } from '../types';

export const syncAutomationFromFeedbackStep: TaskStep = {
  id: 'sync-automation-from-feedback',
  title: 'Sync Automation Code with Test Case Changes',
  category: 'maintenance',
  requiresSubagent: 'test-engineer',
  invokesSubagents: ['test-engineer'],
  content: `## Sync Automation Code with Test Case Changes

After processing feedback that modified test case files, ensure automation code stays in sync.

**When to apply:** Only if you modified test case markdown files during this task.

For each modified test case:
1. Read frontmatter — check for \`automated_test\` field
2. If exists → {{INVOKE_TEST_ENGINEER}} to update the spec to match the updated markdown
3. If not → skip (no automation to sync)

**CRITICAL:** Both specification (markdown) AND implementation (automation code) MUST stay in sync.`,
  tags: ['maintenance', 'automation', 'feedback'],
};
