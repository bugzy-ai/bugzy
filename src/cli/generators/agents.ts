/**
 * Subagent Configuration Generator
 * Generate .claude/agents/*.md files
 */

import * as fs from 'fs';
import * as path from 'path';
import { buildSubagentConfig } from '../../subagents';

/**
 * Generate subagent configuration files
 * Only generates files for configured subagents
 *
 * @param subagents - Subagent role -> integration mapping
 */
export async function generateAgents(subagents: Record<string, string>): Promise<void> {
  const cwd = process.cwd();
  const agentsDir = path.join(cwd, '.claude', 'agents');

  // Ensure agents directory exists
  if (!fs.existsSync(agentsDir)) {
    fs.mkdirSync(agentsDir, { recursive: true });
  }

  // Clear existing agent files
  const existingFiles = fs.readdirSync(agentsDir);
  for (const file of existingFiles) {
    if (file.endsWith('.md')) {
      fs.unlinkSync(path.join(agentsDir, file));
    }
  }

  // Generate agent files for each configured subagent
  for (const [role, integration] of Object.entries(subagents)) {
    const config = buildSubagentConfig(role, integration);

    if (!config) {
      console.warn(`Warning: Could not load template for ${role} with ${integration}`);
      continue;
    }

    // Format as markdown with frontmatter
    const content = formatAgentMarkdown(config.frontmatter, config.content);

    // Write to file
    const filePath = path.join(agentsDir, `${role}.md`);
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}

/**
 * Format agent configuration as markdown with frontmatter
 * @param frontmatter - Agent frontmatter
 * @param content - Agent content
 * @returns Formatted markdown
 */
function formatAgentMarkdown(frontmatter: Record<string, any>, content: string): string {
  const lines: string[] = ['---'];

  // Format frontmatter
  for (const [key, value] of Object.entries(frontmatter)) {
    if (value !== undefined && value !== null) {
      // Handle arrays (e.g., tools)
      if (Array.isArray(value)) {
        lines.push(`${key}: ${value.join(', ')}`);
      } else {
        // Quote string values
        const formattedValue = typeof value === 'string' ? `"${value}"` : value;
        lines.push(`${key}: ${formattedValue}`);
      }
    }
  }

  lines.push('---');
  lines.push('');
  lines.push(content);

  return lines.join('\n');
}
