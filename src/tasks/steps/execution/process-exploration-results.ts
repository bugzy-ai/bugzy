import type { TaskStep } from '../types';

export const processExplorationResultsStep: TaskStep = {
  id: 'process-exploration-results',
  title: 'Process Exploration Results',
  category: 'execution',
  content: `## Process Exploration Results

Read and parse the browser-automation agent output from exploration.

**Locate results:**
\`\`\`bash
ls -t test-runs/ | head -1
\`\`\`

**Read from:** \`./test-runs/[timestamp]/EXPLORATION-TEMP/\`
- \`findings.md\` - Main findings
- \`test-log.md\` - Detailed log
- \`screenshots/\` - Visual evidence
- \`summary.json\` - Summary

**Extract and organize:**
- Discovered features and capabilities
- UI element selectors and patterns
- Navigation structure and URLs
- Authentication flow details
- Performance observations
- Areas requiring further investigation

**Output:** Structured findings ready for artifact updates.`,
  tags: ['execution', 'exploration'],
};
