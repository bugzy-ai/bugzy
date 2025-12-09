import type { TaskStep } from '../types';

export const moderateExplorationStep: TaskStep = {
  id: 'moderate-exploration',
  title: 'Moderate Exploration',
  category: 'exploration',
  content: `## Moderate Exploration (3-5 min)

**When:** Target area known but details unclear, or quick exploration found discrepancies

**Steps:**
1. Navigate using appropriate role(s), ensure clean state
2. Test primary user flows, document steps and behavior
3. Capture before/after screenshots
4. Document findings:
   \`\`\`markdown
   **Moderate Exploration**

   **Explored:** Role: [Role], Path: [Steps], Behavior: [What happened]

   **Findings:**
   - [Specific observations with examples]

   **Discrepancies:** [Differences from expected]

   **Questions:** [Clarifications needed]
   \`\`\`

**Decision:** Clear enough → proceed | Needs deeper analysis → Deep Exploration

**Time Limit:** 3-5 minutes`,
  tags: ['exploration', 'moderate'],
};
