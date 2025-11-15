/**
 * Subagent Memory Template
 * Provides generic instructions for reading and maintaining subagent-specific memory
 * Used by all subagent templates to maintain consistent memory patterns
 */

export const MEMORY_READ_INSTRUCTIONS = `
## Memory Context

Before starting work, read your memory file to inform your actions:

**Location:** \`.bugzy/runtime/memory/{ROLE}.md\`

**Purpose:** Your memory is a focused collection of knowledge relevant to your specific role. This is your working knowledge, not a log of interactions. It helps you make consistent decisions and avoid repeating past mistakes.

**How to Use:**
1. Read your memory file to understand:
   - Patterns and learnings within your domain
   - Preferences and requirements specific to your role
   - Known issues and their resolutions
   - Operational knowledge that impacts your decisions

2. Apply this knowledge to:
   - Make informed decisions based on past experience
   - Avoid repeating mistakes or redundant work
   - Maintain consistency with established patterns
   - Build upon existing understanding in your domain

**Note:** The memory file may not exist yet or may be empty. If it doesn't exist or is empty, proceed without this context and help build it as you work.
`;

export const MEMORY_UPDATE_INSTRUCTIONS = `
## Memory Maintenance

After completing your work, update your memory file with relevant insights.

**Location:** \`.bugzy/runtime/memory/{ROLE}.md\`

**Process:**

1. **Read the maintenance guide** at \`.bugzy/runtime/subagent-memory-guide.md\` to understand when to ADD, UPDATE, or REMOVE entries and how to maintain focused working knowledge (not a log)

2. **Review your current memory** to check for overlaps, outdated information, or opportunities to consolidate knowledge

3. **Update your memory** following the maintenance guide principles: stay in your domain, keep patterns not logs, consolidate aggressively (10-30 high-signal entries), and focus on actionable knowledge

**Remember:** Every entry should answer "How does this change what I do?"
`;
