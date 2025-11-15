/**
 * Knowledge Base Template
 * Provides instructions for reading and maintaining the curated knowledge base
 * Used across all tasks to maintain a living reference of factual knowledge
 */

export const KNOWLEDGE_BASE_READ_INSTRUCTIONS = `
## Knowledge Base Context

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

**Note:** The knowledge base may not exist yet or may be empty. If it doesn't exist or is empty, proceed without this context and help build it as you work.
`;

export const KNOWLEDGE_BASE_UPDATE_INSTRUCTIONS = `
## Knowledge Base Maintenance

After completing your work, update the knowledge base with new insights.

**Location:** \`.bugzy/runtime/knowledge-base.md\`

**Process:**

1. **Read the maintenance guide** at \`.bugzy/runtime/knowledge-maintenance-guide.md\` to understand when to ADD, UPDATE, or REMOVE entries and how to maintain a curated knowledge base (not an append-only log)

2. **Review the current knowledge base** to check for overlaps, contradictions, or opportunities to consolidate existing knowledge

3. **Update the knowledge base** following the maintenance guide principles: favor consolidation over addition, update rather than append, resolve contradictions immediately, and focus on quality over completeness

**Remember:** Every entry should answer "Will this help someone working on this project in 6 months?"
`;
