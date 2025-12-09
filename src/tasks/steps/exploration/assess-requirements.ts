import type { TaskStep } from '../types';

export const assessRequirementsStep: TaskStep = {
  id: 'assess-requirements',
  title: 'Assess Exploration Scope',
  category: 'exploration',
  content: `## Assess Exploration Scope

Determine what needs to be explored and the appropriate depth of exploration.

| Clarity | Indicators | Exploration Depth | Goal |
|---------|-----------|-------------------|------|
| **Clear** | Known features, specific URLs, documented behavior | Quick (1-2 min) | Confirm exists, capture evidence |
| **Vague** | General area known, specifics unclear | Moderate (3-5 min) | Document behavior, identify gaps |
| **Unclear** | Unknown features, new area, comprehensive discovery needed | Deep (5-60 min) | Systematic discovery, document patterns |

**Use Cases:**
- **Requirement validation:** Explore to verify feature before testing
- **App discovery:** Explore to understand application capabilities
- **Change verification:** Explore to confirm changes work correctly

**Decision:** Based on scope assessment, proceed to appropriate exploration depth.`,
  tags: ['exploration', 'assessment'],
};
