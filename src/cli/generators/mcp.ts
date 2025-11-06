/**
 * MCP Configuration Generator
 * Generate .mcp.json for Claude Code
 */

import * as fs from 'fs';
import * as path from 'path';
import { buildMCPConfig } from '../../mcp';

/**
 * Generate .mcp.json file
 * @param mcpServers - List of MCP server names needed
 */
export async function generateMCPConfig(mcpServers: string[]): Promise<void> {
  const cwd = process.cwd();
  const mcpConfigPath = path.join(cwd, '.mcp.json');

  // Build MCP configuration using core library
  const mcpConfig = buildMCPConfig(mcpServers);

  // Write to file
  const content = JSON.stringify(mcpConfig, null, 2);
  fs.writeFileSync(mcpConfigPath, content, 'utf-8');
}

/**
 * Get list of MCP servers from subagent configuration
 * @param subagents - Subagent role -> integration mapping
 * @returns List of MCP server names
 */
export function getMCPServersFromSubagents(subagents: Record<string, string>): string[] {
  const mcps = new Set<string>();

  for (const [_role, integration] of Object.entries(subagents)) {
    // Map integrations to MCP servers
    // Usually the integration name matches the MCP name
    mcps.add(integration);
  }

  return Array.from(mcps);
}
