import type { TaskStep } from '../types';

export const loadProjectContextStep: TaskStep = {
  id: 'load-project-context',
  title: 'Load Project Context',
  category: 'setup',
  content: `## Load Project Context

Check for existing project context to inform your work:

**1. Check Project Context**
- Read \`.bugzy/runtime/project-context.md\` if it exists
- Check if it contains information relevant to: $ARGUMENTS
- This file contains:
  - Application overview and architecture
  - Key user flows and features
  - Technical patterns discovered
  - Environment details

**2. Check Test Execution Strategy**
- Read \`.bugzy/runtime/test-execution-strategy.md\` if it exists
- Understand available test tiers and when to use them
- Note default behaviors and time/coverage trade-offs

**3. Document Findings**
Note what context is available:
\`\`\`
Project Context: [exists/missing] - [relevant to focus area: yes/no/partial]
Test Strategy: [exists/missing]
\`\`\``,
  tags: ['setup', 'context'],
};
