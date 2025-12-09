import type { TaskStep } from '../types';

export const cleanupTempFilesStep: TaskStep = {
  id: 'cleanup-temp-files',
  title: 'Cleanup Temporary Files',
  category: 'maintenance',
  content: `## Cleanup Temporary Files

Remove temporary files created during exploration.

**Delete:**
\`\`\`bash
rm ./test-cases/EXPLORATION-TEMP.md
\`\`\`

**Note:** Test run results in \`./test-runs/\` are preserved for reference.`,
  tags: ['maintenance', 'cleanup'],
};
