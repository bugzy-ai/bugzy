/**
 * MCP Configuration Generator
 * Generate MCP configuration for AI coding tools
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { buildMCPConfig, MCP_SERVERS } from '../../mcp';
import { ToolId, getToolProfile, DEFAULT_TOOL } from '../../core/tool-profile';

/**
 * Generate MCP configuration file
 * Format varies by tool: JSON for Claude/Cursor, CLI commands for Codex
 *
 * @param mcpServers - List of MCP server names needed
 * @param tool - AI coding tool (default: 'claude-code')
 */
export async function generateMCPConfig(mcpServers: string[], tool: ToolId = DEFAULT_TOOL): Promise<void> {
  const cwd = process.cwd();
  const toolProfile = getToolProfile(tool);

  if (toolProfile.mcpFormat === 'json') {
    // Claude Code and Cursor use JSON format
    const mcpConfigPath = path.join(cwd, toolProfile.mcpConfigPath!);

    // Ensure parent directory exists
    const mcpDir = path.dirname(mcpConfigPath);
    if (!fs.existsSync(mcpDir)) {
      fs.mkdirSync(mcpDir, { recursive: true });
    }

    // Build MCP configuration for local deployment (CLI usage)
    // Container deployments use buildMCPConfig(servers, 'container') directly
    const mcpConfig = buildMCPConfig(mcpServers, 'local');

    // Write to file
    const content = JSON.stringify(mcpConfig, null, 2);
    fs.writeFileSync(mcpConfigPath, content, 'utf-8');
  } else if (toolProfile.mcpFormat === 'toml') {
    // Codex uses TOML configuration via CLI commands
    // MCP servers are configured via `codex mcp add` commands in setup.ts
    // No file generation needed here - config stored in .codex/config.toml by codex CLI
    return;
  }
}

/**
 * Build codex mcp add command arguments for a server
 * Format: codex mcp add <name> --env VAR=VAL -- <command> <args...>
 *
 * @param serverName - MCP server name (e.g., 'slack', 'playwright')
 * @returns Object with args array and required env vars
 */
export function buildCodexMCPCommand(serverName: string): { args: string[]; envVars: string[] } {
  const serverTemplate = MCP_SERVERS[serverName];
  if (!serverTemplate) {
    throw new Error(`Unknown MCP server: ${serverName}`);
  }

  // Build args in correct order: mcp add <name> --env VAR=VAL -- <command> <args...>
  const args = ['mcp', 'add', `bugzy-${serverName}`];
  const envVars: string[] = [];

  // Add --env flags BEFORE the -- separator
  if (serverTemplate.config.env) {
    for (const [key, value] of Object.entries(serverTemplate.config.env)) {
      // Extract variable name from ${VAR} syntax
      const match = value.match(/\$\{([A-Z_]+)\}/);
      if (match) {
        args.push('--env', `${key}=$${match[1]}`);
        envVars.push(match[1]);
      }
    }
  }

  // Add -- separator then command and its args
  args.push('--', serverTemplate.config.command);
  if (serverTemplate.config.args?.length) {
    args.push(...serverTemplate.config.args);
  }

  return { args, envVars };
}

/**
 * Get list of configured MCP servers in Codex (project-local)
 * Checks for servers with 'bugzy-' prefix
 *
 * @returns List of server names (without 'bugzy-' prefix)
 */
export async function getConfiguredCodexMCPServers(): Promise<string[]> {
  try {
    const output = execSync('codex mcp list', {
      encoding: 'utf-8',
      env: { ...process.env, CODEX_HOME: path.join(process.cwd(), '.codex') },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Parse output to extract server names starting with 'bugzy-'
    const lines = output.split('\n');
    return lines
      .filter((line) => line.includes('bugzy-'))
      .map((line) => {
        const match = line.match(/bugzy-([a-z-]+)/);
        return match ? match[1] : null;
      })
      .filter((name): name is string => name !== null);
  } catch {
    // No servers configured, codex not available, or error parsing
    return [];
  }
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
