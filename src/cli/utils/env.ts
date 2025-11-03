/**
 * Environment Variable Management
 * Load and merge environment variables from multiple .env files
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

/**
 * Load environment variables from multiple .env files
 * Priority: .env.local > .env > .env.example
 *
 * @returns Merged environment variables
 */
export function loadEnvFiles(): Record<string, string> {
  const envVars: Record<string, string> = {};

  // Load in order of priority (later ones override earlier ones)
  const envFiles = [
    '.env.example',  // Template (structure only, usually no values)
    '.env',          // Team defaults or personal secrets
    '.env.local'     // Personal overrides (highest priority)
  ];

  for (const file of envFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      try {
        const parsed = dotenv.parse(fs.readFileSync(filePath, 'utf-8'));
        Object.assign(envVars, parsed);
      } catch (error) {
        console.warn(`Warning: Could not parse ${file}:`, error);
      }
    }
  }

  return envVars;
}

/**
 * Get required environment variables for MCP servers
 * @param mcpServers - List of MCP server names
 * @returns List of required environment variable names
 */
export function getRequiredEnvVars(mcpServers: string[]): string[] {
  const requiredVars: string[] = [];

  // Map MCP servers to their required environment variables
  const mcpEnvMap: Record<string, string[]> = {
    slack: ['SLACK_ACCESS_TOKEN'],
    notion: ['NOTION_TOKEN'],
    linear: ['LINEAR_API_KEY'],
    jira: ['JIRA_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'],
    confluence: ['CONFLUENCE_URL', 'CONFLUENCE_EMAIL', 'CONFLUENCE_API_TOKEN'],
    github: ['GITHUB_TOKEN'],
    // playwright has no required env vars (runs locally)
  };

  for (const server of mcpServers) {
    const vars = mcpEnvMap[server];
    if (vars) {
      requiredVars.push(...vars);
    }
  }

  return requiredVars;
}

/**
 * Check which required environment variables are missing
 * @param required - List of required variable names
 * @param available - Available environment variables
 * @returns List of missing variable names
 */
export function getMissingEnvVars(
  required: string[],
  available: Record<string, string>
): string[] {
  return required.filter(varName => !available[varName] || available[varName].trim() === '');
}

/**
 * Validate that all required environment variables are present
 * @param mcpServers - List of MCP server names
 * @param envVars - Available environment variables
 * @returns List of missing variables, empty if all present
 */
export function validateEnvVars(
  mcpServers: string[],
  envVars: Record<string, string>
): string[] {
  const required = getRequiredEnvVars(mcpServers);
  return getMissingEnvVars(required, envVars);
}
