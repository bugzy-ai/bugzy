import type { TaskStep } from '../types';

export const deepExplorationStep: TaskStep = {
  id: 'deep-exploration',
  title: 'Deep Exploration',
  category: 'exploration',
  content: `## Deep Exploration (5-60 min)

**When:** Comprehensive discovery needed or critical gaps found

**Scaling:**
- **Feature exploration:** 5-10 min (single feature)
- **Area exploration:** 15-20 min (e.g., authentication)
- **Full app discovery:** 45-60 min (comprehensive)

**Steps:**
1. **Define Exploration Matrix:** Identify dimensions (roles, states, variations)

2. **Systematic Testing:** Test each combination methodically
   \`\`\`
   Matrix: [Dimension 1] x [Dimension 2]
   Test 1: [Condition] -> Navigate, document, screenshot
   Test 2: [Condition] -> Same flow, compare
   \`\`\`

3. **Document Patterns:** What's consistent? What varies?

4. **Report:**
   \`\`\`markdown
   **Deep Exploration**

   **Matrix:** [Dimensions] | **Tests:** [X combinations]

   **Findings:**
   - [Key discovery 1]
   - [Key discovery 2]

   **Patterns:** [Observed patterns]

   **Gaps/Ambiguities:** [What needs clarification]
   \`\`\`

**Decision:** Ambiguities critical → clarify | Clear enough → proceed`,
  tags: ['exploration', 'deep', 'thorough'],
};
