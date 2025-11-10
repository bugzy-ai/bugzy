/**
 * Slash Commands Generator
 * Generate .claude/commands/*.md files
 */

import * as fs from 'fs';
import * as path from 'path';
import { TASK_TEMPLATES } from '../../tasks';
import { buildTaskDefinition, type ProjectSubAgent } from '../../core/task-builder';

/**
 * Command filter for local vs cloud environments
 * - false: skip generation (cloud-only commands)
 * - string: rename command (use string as new filename)
 * - undefined/not present: generate with original slug
 */
const COMMAND_FILTER: Record<string, boolean | string> = {
  // Cloud-only commands (skip in local environment)
  'handle-message': false,
  'process-event': false,
};

/**
 * Generate all task command files
 * Generates one .md file per task in the library
 *
 * @param subagents - Subagent role -> integration mapping
 */
export async function generateCommands(subagents: Record<string, string>): Promise<void> {
  const cwd = process.cwd();
  const commandsDir = path.join(cwd, '.claude', 'commands');

  // Ensure commands directory exists
  if (!fs.existsSync(commandsDir)) {
    fs.mkdirSync(commandsDir, { recursive: true });
  }

  // Clear existing command files
  const existingFiles = fs.readdirSync(commandsDir);
  for (const file of existingFiles) {
    if (file.endsWith('.md')) {
      fs.unlinkSync(path.join(commandsDir, file));
    }
  }

  // Convert subagents config to ProjectSubAgent format
  const projectSubAgents: ProjectSubAgent[] = Object.entries(subagents).map(
    ([role, integration]) => ({ role, integration })
  );

  // Generate command files for all tasks
  for (const [slug, template] of Object.entries(TASK_TEMPLATES)) {
    // Apply command filter
    const filterValue = COMMAND_FILTER[slug];

    // Skip if explicitly filtered out (false)
    if (filterValue === false) {
      continue;
    }

    // Use renamed slug if specified, otherwise use original
    const outputSlug = typeof filterValue === 'string' ? filterValue : slug;

    try {
      // Try to build task definition with current subagent config
      // Tasks with missing required subagents will throw an error
      const taskDef = buildTaskDefinition(slug, projectSubAgents);

      // Format as markdown with frontmatter
      const content = formatCommandMarkdown(taskDef.frontmatter, taskDef.content);

      // Write to file with potentially renamed slug
      const filePath = path.join(commandsDir, `${outputSlug}.md`);
      fs.writeFileSync(filePath, content, 'utf-8');
    } catch (error) {
      // Task requires subagents that aren't configured
      // Still generate the file with base content so users can see what's available
      const content = formatCommandMarkdown(template.frontmatter, template.baseContent);
      const filePath = path.join(commandsDir, `${outputSlug}.md`);
      fs.writeFileSync(filePath, content, 'utf-8');

      console.warn(`Warning: Generated ${outputSlug} without required subagents: ${(error as Error).message}`);
    }
  }
}

/**
 * Format command configuration as markdown with frontmatter
 * @param frontmatter - Command frontmatter
 * @param content - Command content
 * @returns Formatted markdown
 */
function formatCommandMarkdown(frontmatter: Record<string, any>, content: string): string {
  const lines: string[] = ['---'];

  // Format frontmatter
  for (const [key, value] of Object.entries(frontmatter)) {
    if (value !== undefined && value !== null) {
      // Quote string values
      const formattedValue = typeof value === 'string' ? `"${value}"` : value;
      lines.push(`${key}: ${formattedValue}`);
    }
  }

  lines.push('---');
  lines.push('');
  lines.push(content);

  return lines.join('\n');
}
