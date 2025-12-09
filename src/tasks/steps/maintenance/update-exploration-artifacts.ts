import type { TaskStep } from '../types';

export const updateExplorationArtifactsStep: TaskStep = {
  id: 'update-exploration-artifacts',
  title: 'Update Exploration Artifacts',
  category: 'maintenance',
  content: `## Update Exploration Artifacts

Update project artifacts with exploration findings.

### Update Test Plan
Read and update \`test-plan.md\`:
- Replace [TO BE EXPLORED] markers with concrete findings
- Add newly discovered features to test items
- Update navigation patterns and URL structures
- Document actual authentication methods
- Update environment variables if new ones discovered

### Create Exploration Report
Create \`./exploration-reports/[timestamp]-[focus]-exploration.md\`:

\`\`\`markdown
# Exploration Report

**Date:** [timestamp]
**Focus:** [area or comprehensive]
**Duration:** [time]

## Key Discoveries
- [Discovery 1]
- [Discovery 2]

## Feature Inventory
[Categorized list of discovered features]

## Navigation Map
[URL patterns and structure]

## Recommendations
[Next steps and areas needing attention]
\`\`\``,
  tags: ['maintenance', 'exploration'],
};
