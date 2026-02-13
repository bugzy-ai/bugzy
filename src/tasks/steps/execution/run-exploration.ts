import type { TaskStep } from '../types';

export const runExplorationStep: TaskStep = {
  id: 'run-exploration',
  title: 'Run Exploration',
  category: 'execution',
  content: `## Run Exploration

{{INVOKE_BROWSER_AUTOMATION}}

Execute the exploration test case with the following focus:

**Special exploration mode instructions:**
1. Take screenshots of EVERY significant UI element and page
2. Document all clickable elements with their selectors
3. Note all URL patterns and parameters
4. Test variations and edge cases where possible
5. Document load times and performance observations
6. Note any console errors or warnings
7. Organize screenshots by functional area
8. Document which features are accessible vs restricted

**Execute:**
\`\`\`
Run ./test-cases/EXPLORATION-TEMP.md with exploration focus.
Generate comprehensive findings report.
\`\`\`

**Output location:** \`./test-runs/[timestamp]/EXPLORATION-TEMP/\`
- \`findings.md\` - Main findings document
- \`test-log.md\` - Detailed execution log
- \`screenshots/\` - Visual documentation
- \`summary.json\` - Execution summary`,
  invokesSubagents: ['browser-automation'],
  tags: ['execution', 'exploration'],
};
