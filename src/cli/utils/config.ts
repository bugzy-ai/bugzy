/**
 * Configuration Management Utilities
 * Handle loading, saving, and validating .bugzy/config.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { ToolId, DEFAULT_TOOL } from '../../core/tool-profile';

/**
 * Bugzy Project Configuration
 * Stored in .bugzy/config.json
 */
export interface BugzyConfig {
  version: string;
  /** AI coding tool to generate configuration for (default: 'claude-code') */
  tool?: ToolId;
  project: {
    name: string;
  };
  subagents: Record<string, string>; // role -> integration mapping
}

// Re-export DEFAULT_TOOL for convenience
export { DEFAULT_TOOL };

/**
 * Load configuration from .bugzy/config.json
 * @param configPath - Path to config file (default: .bugzy/config.json)
 * @returns Parsed configuration or null if file doesn't exist
 * @throws Error if config file exists but is invalid
 */
export async function loadConfig(configPath: string = '.bugzy/config.json'): Promise<BugzyConfig | null> {
  const fullPath = path.join(process.cwd(), configPath);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const config = JSON.parse(content) as BugzyConfig;

    // Apply default tool for backward compatibility with existing configs
    if (!config.tool) {
      config.tool = DEFAULT_TOOL;
    }

    return config;
  } catch (error) {
    console.error(`Error loading config from ${fullPath}:`, error);
    throw error;
  }
}

/**
 * Save configuration to .bugzy/config.json
 * @param config - Configuration to save
 * @param configPath - Path to config file (default: .bugzy/config.json)
 */
export async function saveConfig(config: BugzyConfig, configPath: string = '.bugzy/config.json'): Promise<void> {
  const fullPath = path.join(process.cwd(), configPath);
  const dirPath = path.dirname(fullPath);

  // Ensure directory exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  try {
    const content = JSON.stringify(config, null, 2);
    fs.writeFileSync(fullPath, content, 'utf-8');
  } catch (error) {
    console.error(`Error saving config to ${fullPath}:`, error);
    throw error;
  }
}

/**
 * Check if config file exists
 * @param configPath - Path to config file (default: .bugzy/config.json)
 * @returns True if config exists
 */
export function configExists(configPath: string = '.bugzy/config.json'): boolean {
  const fullPath = path.join(process.cwd(), configPath);
  return fs.existsSync(fullPath);
}

/**
 * Validate configuration structure
 * @param config - Configuration to validate
 * @returns True if valid, throws error if invalid
 */
export function validateConfig(config: BugzyConfig): boolean {
  if (!config.version) {
    throw new Error('Config missing required field: version');
  }

  if (!config.project || !config.project.name) {
    throw new Error('Config missing required field: project.name');
  }

  if (!config.subagents || typeof config.subagents !== 'object') {
    throw new Error('Config missing required field: subagents');
  }

  return true;
}

/**
 * Create default configuration
 * @param projectName - Name of the project
 * @param tool - AI coding tool (default: 'claude-code')
 * @returns Default configuration
 */
export function createDefaultConfig(projectName: string, tool: ToolId = DEFAULT_TOOL): BugzyConfig {
  return {
    version: '1.0.0',
    tool,
    project: {
      name: projectName
    },
    subagents: {}
  };
}

/**
 * Get tool from config with default fallback
 * @param config - Configuration object
 * @returns Tool ID
 */
export function getToolFromConfig(config: BugzyConfig): ToolId {
  return config.tool || DEFAULT_TOOL;
}
