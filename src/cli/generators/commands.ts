/**
 * Slash Commands Generator
 * Generate command/prompt files for AI coding tools
 */

import * as fs from 'fs';
import * as path from 'path';
import { TASK_TEMPLATES } from '../../tasks';
import { buildTaskDefinition, type ProjectSubAgent } from '../../core/task-builder';
import { ToolId, getToolProfile, DEFAULT_TOOL } from '../../core/tool-profile';
import { replaceInvocationPlaceholders } from '../../core/tool-strings';

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
 * Generates one file per task in the library
 *
 * @param subagents - Subagent role -> integration mapping
 * @param tool - AI coding tool (default: 'claude-code')
 */
export async function generateCommands(subagents: Record<string, string>, tool: ToolId = DEFAULT_TOOL): Promise<void> {
  const cwd = process.cwd();
  const toolProfile = getToolProfile(tool);
  const commandsDir = path.join(cwd, toolProfile.commandsDir);

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

      // Replace {{INVOKE_*}} placeholders with tool-specific invocation strings
      const processedContent = replaceInvocationPlaceholders(taskDef.content, tool);

      // Format as markdown with or without frontmatter based on tool
      const content = formatCommandMarkdown(taskDef.frontmatter, processedContent, toolProfile.commandFrontmatter);

      // Write to file with potentially renamed slug
      const fileName = `${outputSlug}${toolProfile.commandExtension}`;
      const filePath = path.join(commandsDir, fileName);
      fs.writeFileSync(filePath, content, 'utf-8');
    } catch (error) {
      // Task requires subagents that aren't configured
      // Still generate the file with base content so users can see what's available
      const processedContent = replaceInvocationPlaceholders(template.baseContent, tool);
      const content = formatCommandMarkdown(template.frontmatter, processedContent, toolProfile.commandFrontmatter);
      const fileName = `${outputSlug}${toolProfile.commandExtension}`;
      const filePath = path.join(commandsDir, fileName);
      fs.writeFileSync(filePath, content, 'utf-8');

      console.warn(`Warning: Generated ${outputSlug} without required subagents: ${(error as Error).message}`);
    }
  }
}

/**
 * Format command configuration as markdown with optional frontmatter
 * @param frontmatter - Command frontmatter
 * @param content - Command content
 * @param includeFrontmatter - Whether to include YAML frontmatter
 * @returns Formatted markdown
 */
function formatCommandMarkdown(frontmatter: Record<string, any>, content: string, includeFrontmatter: boolean): string {
  if (!includeFrontmatter) {
    // For tools like Cursor that don't use frontmatter, just return the content
    // But add a header with the description if available
    const lines: string[] = [];

    if (frontmatter.description) {
      lines.push(`# ${frontmatter.description}`);
      lines.push('');
    }

    if (frontmatter['argument-hint']) {
      lines.push(`**Arguments**: ${frontmatter['argument-hint']}`);
      lines.push('');
    }

    lines.push(content);
    return lines.join('\n');
  }

  // For tools like Claude Code and Codex that use frontmatter
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
