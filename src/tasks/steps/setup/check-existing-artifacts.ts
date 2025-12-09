import type { TaskStep } from '../types';

export const checkExistingArtifactsStep: TaskStep = {
  id: 'check-existing-artifacts',
  title: 'Assess Existing Artifacts',
  category: 'setup',
  content: `## Assess Existing Artifacts

Before proceeding, check what already exists to determine which phases to skip.

**1. Check Project Context**
- Read \`.bugzy/runtime/project-context.md\` if it exists
- Check if it contains information relevant to: $ARGUMENTS
- **Decision**: If project context exists and covers the focus area -> Skip exploration

**2. Check Test Plan**
- Read \`test-plan.md\` if it exists
- Check if it contains features related to: $ARGUMENTS
- **Decision**: If test plan exists and covers the focus area -> Skip test plan generation

**3. Check Existing Test Cases**
- List files in \`./test-cases/\` for tests related to focus area
- List files in \`./tests/specs/\` for automated tests
- **Decision**: If test cases already exist for the focus area -> Skip to verification only

**4. Document Assessment**
Create a brief assessment summary:
\`\`\`
Assessment for: $ARGUMENTS
- Project context: [exists/missing] - [covers focus area: yes/no]
- Test plan: [exists/missing] - [covers focus area: yes/no]
- Test cases: [count] existing for focus area
- Phases to run: [list phases]
\`\`\``,
  tags: ['setup', 'assessment'],
};
