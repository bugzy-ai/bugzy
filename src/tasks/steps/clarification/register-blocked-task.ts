import type { TaskStep } from '../types';

export const registerBlockedTaskStep: TaskStep = {
  id: 'register-blocked-task',
  title: 'Register Blocked Task',
  category: 'clarification',
  content: `## Register Blocked Task (CRITICAL/HIGH only)

When asking a CRITICAL or HIGH severity question that blocks progress, register the task in the blocked queue so it can be automatically re-triggered when clarification arrives.

**Update \`.bugzy/runtime/blocked-task-queue.md\`:**

1. Read the current file (create if doesn't exist)
2. Add a new row to the Queue table

\`\`\`markdown
# Blocked Task Queue

Tasks waiting for clarification responses.

| Task Slug | Question | Original Args |
|-----------|----------|---------------|
| generate-test-plan | Should todos be sorted by date or priority? | \`{"ticketId": "TODO-456"}\` |
\`\`\`

**Entry Fields:**
- **Task Slug**: The task slug (e.g., \`generate-test-plan\`) - used for re-triggering
- **Question**: The clarification question asked (so LLM can match responses)
- **Original Args**: JSON-serialized \`$ARGUMENTS\` wrapped in backticks

**Purpose**: The LLM processor reads this file and matches user responses to pending questions. When a match is found, it re-queues the task with the clarification.

**After Registration:**
- **CRITICAL/HIGH -> STOP and Wait:**
  - Do NOT create tests, run tests, or make assumptions
  - Wait for clarification, resume after answer
  - *Rationale: Wrong assumptions = incorrect tests, false results, wasted time*`,
  tags: ['clarification', 'blocking'],
};
