import type { TaskStep } from '../types';

export const quickExplorationStep: TaskStep = {
  id: 'quick-exploration',
  title: 'Quick Exploration',
  category: 'exploration',
  content: `## Quick Exploration (1-2 min)

**When:** Target is clear and well-defined

**Steps:**
1. Navigate to target location, verify loads without errors
2. Verify key elements exist
3. Capture screenshot
4. Document:
   \`\`\`markdown
   **Quick Exploration**
   Target: [Name] | URL: [Path]
   Status: Accessible / Not found / Different than expected
   Screenshot: [filename]
   Notes: [Observations]
   \`\`\`

**Decision:** As expected → proceed | Not as expected → Moderate Exploration

**Time Limit:** 1-2 minutes`,
  tags: ['exploration', 'quick'],
};
