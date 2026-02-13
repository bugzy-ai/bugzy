import type { TaskStep } from '../types';

export const createExplorationTestCaseStep: TaskStep = {
  id: 'create-exploration-test-case',
  title: 'Create Exploration Test Case',
  category: 'execution',
  content: `## Create Exploration Test Case

Generate a temporary exploration test case for the browser-automation agent.

**Create file:** \`./test-cases/EXPLORATION-TEMP.md\`

\`\`\`markdown
---
id: EXPLORATION-TEMP
title: Application Exploration - [Focus Area or Comprehensive]
type: exploratory
priority: high
---

## Preconditions
- Browser with cleared cookies and cache
- Access to target environment
- Credentials configured per .env.testdata

## Exploration Steps
[Generated based on focus area and depth]

## Expected Output
- UI element locations and selectors
- Navigation patterns and URLs
- Feature behaviors and workflows
- Screenshots of all key areas
- Console errors or warnings
\`\`\`

**Note:** This is a temporary file that will be cleaned up after exploration.`,
  tags: ['execution', 'exploration'],
};
