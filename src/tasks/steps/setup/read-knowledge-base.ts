import type { TaskStep } from '../types';

export const readKnowledgeBaseStep: TaskStep = {
  id: 'read-knowledge-base',
  title: 'Read Knowledge Base',
  category: 'setup',
  content: `## Knowledge Base Context

Before proceeding, read the curated knowledge base to inform your work:

**Location:** \`.bugzy/runtime/knowledge-base.md\`

**Purpose:** The knowledge base is a living collection of factual knowledge - what we currently know and believe to be true about this project, its patterns, and its context. This is NOT a historical log, but a curated snapshot that evolves as understanding improves.

**How to Use:**
1. Read the knowledge base to understand:
   - Project-specific patterns and conventions
   - Known behaviors and system characteristics
   - Relevant context from past work
   - Documented decisions and approaches

2. Apply this knowledge to:
   - Make informed decisions aligned with project patterns
   - Avoid repeating past mistakes
   - Build on existing understanding
   - Maintain consistency with established practices

3. **Relay to subagents**: Subagents do NOT read the knowledge base directly. When delegating work, you MUST include relevant KB patterns in your delegation message — especially testing patterns (timing, selectors, assertion approaches) that affect test reliability.

**Note:** The knowledge base may not exist yet or may be empty. If it doesn't exist or is empty, proceed without this context and help build it as you work.`,
  tags: ['setup', 'context'],
};
