/**
 * Regenerate test fixtures from source templates
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import { buildTaskDefinition } from '../src/core/task-builder';
import { TASK_SLUGS } from '../src/tasks/constants';
import type { ProjectSubAgent } from '../src/types';

// Full subagents config
const FULL_SUBAGENTS_CONFIG: ProjectSubAgent[] = [
  { role: 'browser-automation', integration: 'playwright' },
  { role: 'team-communicator', integration: 'slack' },
  { role: 'documentation-researcher', integration: 'notion' },
  { role: 'issue-tracker', integration: 'linear' },
];

// Partial subagents config (no docs)
const PARTIAL_SUBAGENTS_CONFIG: ProjectSubAgent[] = [
  { role: 'browser-automation', integration: 'playwright' },
  { role: 'team-communicator', integration: 'slack' },
  { role: 'issue-tracker', integration: 'linear' },
];

function generateFixture(taskSlug: string, config: ProjectSubAgent[], outputDir: string) {
  try {
    const task = buildTaskDefinition(taskSlug, config);

    // Build frontmatter from task definition
    const frontmatterObj = {
      subcommand_name: taskSlug,
      ...task.frontmatter,
    };

    // Use gray-matter to properly serialize frontmatter with YAML
    const fileContent = matter.stringify(task.content, frontmatterObj);

    const outputPath = join(outputDir, `${taskSlug}.md`);
    writeFileSync(outputPath, fileContent, 'utf-8');
    console.log(`✓ Generated ${taskSlug}.md`);
  } catch (error) {
    console.error(`✗ Failed to generate ${taskSlug}:`, error);
  }
}

// Create output directories
const fullDir = join(process.cwd(), 'tests/fixtures/full-subagents');
const partialDir = join(process.cwd(), 'tests/fixtures/partial-subagents');

mkdirSync(fullDir, { recursive: true });
mkdirSync(partialDir, { recursive: true });

console.log('\nRegenerating full-subagents fixtures...');
Object.values(TASK_SLUGS).forEach((slug) => {
  generateFixture(slug, FULL_SUBAGENTS_CONFIG, fullDir);
});

console.log('\nRegenerating partial-subagents fixtures...');
Object.values(TASK_SLUGS).forEach((slug) => {
  generateFixture(slug, PARTIAL_SUBAGENTS_CONFIG, partialDir);
});

console.log('\n✅ Fixture regeneration complete!\n');
