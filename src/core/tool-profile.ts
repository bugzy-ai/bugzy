/**
 * Tool Profile System
 *
 * Defines configuration profiles for different AI coding tools:
 * - Claude Code (default) - CLI and Cloud execution
 * - Cursor - Local editor with cursor-agent CLI
 * - Codex CLI - OpenAI's terminal-based agent
 */

/**
 * Supported AI coding tools
 */
export type ToolId = 'claude-code' | 'cursor' | 'codex';

/**
 * Default AI coding tool
 */
export const DEFAULT_TOOL: ToolId = 'claude-code';

/**
 * MCP configuration format
 * - json: Standard JSON format (.mcp.json or .cursor/mcp.json)
 * - toml: TOML format configured via CLI (project-local with CODEX_HOME)
 */
export type MCPFormat = 'json' | 'toml';

/**
 * Tool profile configuration
 * Defines how to generate configuration files for each AI coding tool
 */
export interface ToolProfile {
  /** Unique tool identifier */
  id: ToolId;

  /** Display name for the tool */
  name: string;

  /** CLI command to invoke the tool */
  cliCommand: string;

  /** Directory for command/prompt files (relative to project root) */
  commandsDir: string;

  /** Directory for subagent files (relative to project root) */
  agentsDir: string;

  /** Path for MCP config file (null if global config like Codex) */
  mcpConfigPath: string | null;

  /** MCP configuration format */
  mcpFormat: MCPFormat;

  /** Environment variable to set tool's home directory (for project-local config) */
  homeEnvVar?: string;

  /** Project memory file name */
  memoryFile: string;

  /** Whether command files require YAML frontmatter */
  commandFrontmatter: boolean;

  /** Whether agent files require YAML frontmatter */
  agentFrontmatter: boolean;

  /** Command invocation prefix (/, /prompts:, etc.) */
  commandInvocationPrefix: string;

  /** File extension for command files */
  commandExtension: string;

  /** File extension for agent files */
  agentExtension: string;
}

/**
 * Claude Code tool profile (default)
 */
export const CLAUDE_CODE_PROFILE: ToolProfile = {
  id: 'claude-code',
  name: 'Claude Code',
  cliCommand: 'claude',
  commandsDir: '.claude/commands',
  agentsDir: '.claude/agents',
  mcpConfigPath: '.mcp.json',
  mcpFormat: 'json',
  memoryFile: 'CLAUDE.md',
  commandFrontmatter: true,
  agentFrontmatter: true,
  commandInvocationPrefix: '/',
  commandExtension: '.md',
  agentExtension: '.md',
};

/**
 * Cursor tool profile
 */
export const CURSOR_PROFILE: ToolProfile = {
  id: 'cursor',
  name: 'Cursor',
  cliCommand: 'cursor-agent',
  commandsDir: '.cursor/commands',
  agentsDir: '.cursor/agents',
  mcpConfigPath: '.cursor/mcp.json',
  mcpFormat: 'json',
  memoryFile: 'AGENTS.md', // Cursor now uses AGENTS.md (.cursorrules deprecated as of v0.45+)
  commandFrontmatter: false, // Cursor uses plain markdown
  agentFrontmatter: false, // Agent files are plain markdown for CLI invocation
  commandInvocationPrefix: '/',
  commandExtension: '.md',
  agentExtension: '.md',
};

/**
 * Codex CLI tool profile
 */
export const CODEX_PROFILE: ToolProfile = {
  id: 'codex',
  name: 'Codex CLI',
  cliCommand: 'codex',
  commandsDir: '.codex/prompts', // Codex uses prompts directory
  agentsDir: '.codex/agents',
  mcpConfigPath: '.codex/config.toml', // Project-local via CODEX_HOME
  mcpFormat: 'toml',
  homeEnvVar: 'CODEX_HOME', // Set to project root for project-local config
  memoryFile: 'AGENTS.md',
  commandFrontmatter: true, // Codex prompts support frontmatter
  agentFrontmatter: false, // Agent files are plain markdown for CLI invocation
  commandInvocationPrefix: '/prompts:',
  commandExtension: '.md',
  agentExtension: '.md',
};

/**
 * Tool profiles registry
 */
export const TOOL_PROFILES: Record<ToolId, ToolProfile> = {
  'claude-code': CLAUDE_CODE_PROFILE,
  'cursor': CURSOR_PROFILE,
  'codex': CODEX_PROFILE,
};

/**
 * Get tool profile by ID
 * @param toolId - Tool identifier
 * @returns Tool profile or undefined if not found
 */
export function getToolProfile(toolId: ToolId): ToolProfile {
  const profile = TOOL_PROFILES[toolId];
  if (!profile) {
    throw new Error(`Unknown tool: ${toolId}`);
  }
  return profile;
}

/**
 * Get default tool profile (Claude Code)
 * @returns Default tool profile
 */
export function getDefaultToolProfile(): ToolProfile {
  return CLAUDE_CODE_PROFILE;
}

/**
 * Get all available tool options for selection prompts
 * @returns Array of tool options with value and label
 */
export function getToolOptions(): Array<{ value: ToolId; label: string; hint?: string }> {
  return [
    {
      value: 'claude-code',
      label: 'Claude Code (CLI or Cloud)',
      hint: 'Anthropic\'s official CLI - recommended',
    },
    {
      value: 'cursor',
      label: 'Cursor (Experimental)',
      hint: 'VS Code-based AI editor - experimental support',
    },
    {
      value: 'codex',
      label: 'Codex CLI (Experimental)',
      hint: 'OpenAI\'s terminal-based agent - experimental support',
    },
  ];
}

/**
 * Check if a tool supports MCP configuration in project directory
 * @param toolId - Tool identifier
 * @returns True if MCP config is project-local
 */
export function hasLocalMCPConfig(toolId: ToolId): boolean {
  const profile = getToolProfile(toolId);
  return profile.mcpConfigPath !== null;
}

/**
 * Check if a tool uses the same command invocation pattern as Claude Code
 * @param toolId - Tool identifier
 * @returns True if tool uses / prefix for commands
 */
export function usesSlashCommands(toolId: ToolId): boolean {
  const profile = getToolProfile(toolId);
  return profile.commandInvocationPrefix === '/';
}
