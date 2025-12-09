import type { TaskStep } from '../types';

export const formulateQuestionsStep: TaskStep = {
  id: 'formulate-questions',
  title: 'Formulate Clarification Questions',
  category: 'clarification',
  content: `## Formulate Clarification Questions

If clarification needed (CRITICAL/HIGH severity), formulate specific, concrete questions:

**Good Questions:** Specific and concrete, provide context, offer options, reference examples, tie to test strategy

**Bad Questions:** Too vague/broad, assumptive, multiple questions in one, no context

**Template:**
\`\`\`
**Context:** [Current understanding]
**Ambiguity:** [Specific unclear aspect]
**Question:** [Specific question with options]
**Why Important:** [Testing strategy impact]

Example:
Context: TODO-456 "Fix the sorting in the todo list so items appear in the right order"
Ambiguity: "sorting" = (A) by creation date, (B) by due date, (C) by priority level, or (D) custom user-defined order
Question: Should todos be sorted by due date (soonest first) or priority (high to low)? Should completed items appear in the list or move to archive?
Why Important: Different sort criteria require different test assertions. Current app shows 15 active todos + 8 completed in mixed order.
\`\`\`

**For Slack-Triggered Tasks:** {{INVOKE_TEAM_COMMUNICATOR}} to post the clarification questions in the Slack thread

**For Manual/API Triggers:** Include in task output:
\`\`\`markdown
## Clarification Required Before Testing

**Ambiguity:** [Description]
**Severity:** [CRITICAL/HIGH]

### Questions:
1. **Question:** [First question]
   - Context: [Provide context]
   - Options: [If applicable]
   - Impact: [Testing impact]

**Action Required:** Provide clarification. Testing cannot proceed.
**Current Observation:** [What exploration revealed - concrete examples]
\`\`\``,
  invokesSubagents: ['team-communicator'],
  tags: ['clarification', 'questions'],
};
