/**
 * Subagent Configuration Generator
 * Generate agent/subagent files for AI coding tools
 */

import * as fs from 'fs';
import * as path from 'path';
import { buildSubagentConfig } from '../../subagents';
import { ToolId, getToolProfile, DEFAULT_TOOL } from '../../core/tool-profile';

/**
 * Generate subagent configuration files
 * Only generates files for configured subagents
 *
 * @param subagents - Subagent role -> integration mapping
 * @param tool - AI coding tool (default: 'claude-code')
 */
export async function generateAgents(subagents: Record<string, string>, tool: ToolId = DEFAULT_TOOL): Promise<void> {
  const cwd = process.cwd();
  const toolProfile = getToolProfile(tool);
  const agentsDir = path.join(cwd, toolProfile.agentsDir);

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

    // Format as markdown with or without frontmatter based on tool
    const content = formatAgentMarkdown(config.frontmatter, config.content, toolProfile.agentFrontmatter);

    // Write to file
    const fileName = `${role}${toolProfile.agentExtension}`;
    const filePath = path.join(agentsDir, fileName);
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}

/**
 * Format agent configuration as markdown with optional frontmatter
 * @param frontmatter - Agent frontmatter
 * @param content - Agent content
 * @param includeFrontmatter - Whether to include YAML frontmatter
 * @returns Formatted markdown
 */
function formatAgentMarkdown(frontmatter: Record<string, any>, content: string, includeFrontmatter: boolean): string {
  if (!includeFrontmatter) {
    // For tools like Cursor and Codex that invoke agents via CLI,
    // we don't need frontmatter - just the content
    return content;
  }

  // For tools like Claude Code that use frontmatter
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
