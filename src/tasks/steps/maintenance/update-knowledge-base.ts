import type { TaskStep } from '../types';

export const updateKnowledgeBaseStep: TaskStep = {
  id: 'update-knowledge-base',
  title: 'Update Knowledge Base',
  category: 'maintenance',
  content: `## Knowledge Base Maintenance

After completing your work, update the knowledge base with new insights.

**Location:** \`.bugzy/runtime/knowledge-base.md\`

**Process:**

1. **Read the maintenance guide** at \`.bugzy/runtime/knowledge-maintenance-guide.md\` to understand when to ADD, UPDATE, or REMOVE entries and how to maintain a curated knowledge base (not an append-only log)

2. **Review the current knowledge base** to check for overlaps, contradictions, or opportunities to consolidate existing knowledge

3. **Update the knowledge base** following the maintenance guide principles:
   - Favor consolidation over addition
   - Update rather than append
   - Resolve contradictions immediately
   - Focus on quality over completeness

**What to Add:**
- New patterns discovered about the application
- Behaviors that differ from expectations
- Technical constraints or requirements
- Useful selectors or navigation patterns
- Error handling patterns

**Remember:** Every entry should answer "Will this help someone working on this project in 6 months?"`,
  tags: ['maintenance', 'knowledge'],
};
