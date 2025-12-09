import type { TaskStep } from '../types';

export const checkMemoryStep: TaskStep = {
  id: 'check-memory',
  title: 'Check Memory for Similar Clarifications',
  category: 'clarification',
  content: `## Check Memory for Similar Clarifications

Before asking a clarification question, check if similar question was answered:

{{INVOKE_TEAM_COMMUNICATOR}}

Query memory for similar past clarifications:

**Process:**
1. **Search memory** - Query by feature name, ambiguity pattern, ticket keywords
2. **Review past Q&A** - Similar question asked? What was answer? Applicable now?
3. **Assess reusability:**
   - Directly applicable -> Use answer, no re-ask
   - Partially applicable -> Adapt and reference ("Previously for X, clarified Y. Same here?")
   - Not applicable -> Ask as new
4. **Update memory** - Store Q&A with task type, feature, pattern tags

**Example:**
Query "todo sorting priority" -> Found 2025-01-15: "Should completed todos appear in main list?" -> Answer: "No, move to separate archive view" -> Directly applicable -> Use, no re-ask needed`,
  requiresSubagent: 'team-communicator',
  invokesSubagents: ['team-communicator'],
  tags: ['clarification', 'memory'],
};
