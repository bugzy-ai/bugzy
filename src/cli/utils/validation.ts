/**
 * Project Structure Validation
 * Validate that Bugzy project structure is correct
 */

import * as fs from 'fs';
import * as path from 'path';
import { loadConfig, getToolFromConfig } from './config';
import { getToolProfile, DEFAULT_TOOL } from '../../core/tool-profile';
import { getIntegration } from '../../subagents/metadata';

/**
 * Validate that project structure exists and is correct
 * Checks for required directories and files based on configured tool
 *
 * @returns True if structure is valid, false otherwise
 */
export async function validateProjectStructure(): Promise<boolean> {
  // Load config to determine tool-specific directories
  const config = await loadConfig();
  const tool = config ? getToolFromConfig(config) : DEFAULT_TOOL;
  const toolProfile = getToolProfile(tool);

  const requiredDirs = [
    '.bugzy',
    '.bugzy/runtime',
    path.dirname(toolProfile.commandsDir),  // .claude, .cursor, or .codex
    toolProfile.commandsDir,                 // .claude/commands, .cursor/commands, .codex/prompts
    toolProfile.agentsDir                    // .claude/agents, .cursor/agents, .codex/agents
  ];

  const requiredFiles = [
    '.bugzy/config.json',
    '.bugzy/runtime/project-context.md'
  ];

  // Check directories
  for (const dir of requiredDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      return false;
    }

    if (!fs.statSync(dirPath).isDirectory()) {
      return false;
    }
  }

  // Check files
  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      return false;
    }

    if (!fs.statSync(filePath).isFile()) {
      return false;
    }
  }

  return true;
}

/**
 * Validate that required secrets are present in environment
 * @param required - List of required secret names
 * @param env - Environment variables object
 * @returns Array of missing secret names
 */
export function validateSecrets(required: string[], env: Record<string, string | undefined>): string[] {
  const missing: string[] = [];

  for (const secret of required) {
    const value = env[secret];
    if (!value || value.trim() === '') {
      missing.push(secret);
    }
  }

  return missing;
}

/**
 * Check if a CLI tool is available
 * @param command - The CLI command to check for (e.g., 'claude', 'cursor-agent', 'codex')
 * @returns Always true - prints warning if check fails but continues anyway
 */
export async function checkToolAvailable(command: string): Promise<boolean> {
  const { spawn } = await import('child_process');
  const isWindows = process.platform === 'win32';
  const checkCommand = isWindows ? 'where' : 'which';

  return new Promise((resolve) => {
    const proc = spawn(checkCommand, [command], {
      shell: isWindows  // Windows needs shell for 'where'
    });
    proc.on('close', (code) => {
      if (code !== 0) {
        console.warn(`Warning: Could not verify '${command}' is installed (${checkCommand} check failed). Continuing anyway...`);
      }
      resolve(true);
    });
    proc.on('error', () => {
      console.warn(`Warning: Could not verify '${command}' is installed (${checkCommand} not available). Continuing anyway...`);
      resolve(true);
    });
  });
}

/**
 * Get required MCP servers from subagent configuration
 * Only includes integrations that have a requiredMCP defined
 * @param subagents - Subagent role -> integration mapping
 * @returns List of required MCP server names
 */
export function getRequiredMCPs(subagents: Record<string, string>): string[] {
  const mcps = new Set<string>();

  for (const [_role, integration] of Object.entries(subagents)) {
    const integrationMeta = getIntegration(integration);
    if (integrationMeta?.requiredMCP) {
      mcps.add(integration);
    }
  }

  return Array.from(mcps);
}
