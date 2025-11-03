/**
 * Project Structure Validation
 * Validate that Bugzy project structure is correct
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Validate that project structure exists and is correct
 * Checks for required directories and files
 *
 * @returns True if structure is valid, false otherwise
 */
export function validateProjectStructure(): boolean {
  const requiredDirs = [
    '.bugzy',
    '.bugzy/runtime',
    '.claude',
    '.claude/commands',
    '.claude/agents'
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
 * Check if Claude Code CLI is available
 * @returns True if claude command is available
 */
export async function checkClaudeAvailable(): Promise<boolean> {
  const { spawn } = await import('child_process');

  return new Promise((resolve) => {
    const proc = spawn('which', ['claude']);
    proc.on('close', (code) => {
      resolve(code === 0);
    });
    proc.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Get required MCP servers from subagent configuration
 * @param subagents - Subagent role -> integration mapping
 * @returns List of required MCP server names
 */
export function getRequiredMCPs(subagents: Record<string, string>): string[] {
  const mcps = new Set<string>();

  for (const [_role, integration] of Object.entries(subagents)) {
    // Map integrations to MCP servers
    // Usually the integration name matches the MCP name
    mcps.add(integration);
  }

  return Array.from(mcps);
}
