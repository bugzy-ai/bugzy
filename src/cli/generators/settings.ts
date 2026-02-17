/**
 * Settings Generator
 * Generate .claude/settings.json with hooks, permissions, and MCP server references
 */

import * as fs from 'fs';
import * as path from 'path';
import { ToolId, DEFAULT_TOOL } from '../../core/tool-profile';
import { getMCPServersFromSubagents } from './mcp';

/**
 * Claude Code hooks configuration structure
 */
interface HookEntry {
  type: 'command';
  command: string;
}

interface HookMatcher {
  hooks: HookEntry[];
}

interface HooksConfig {
  SessionStart?: HookMatcher[];
  PreCompact?: HookMatcher[];
}

interface SettingsJson {
  hooks: HooksConfig;
  permissions: {
    allow: string[];
    deny: string[];
    ask: string[];
  };
  enabledMcpjsonServers: string[];
}

/**
 * Build the static permissions allow list based on configured subagents
 */
function buildAllowPermissions(subagents: Record<string, string>): string[] {
  const allow: string[] = [
    // Common permissions
    'Bash(mkdir:*)',
    'Bash(git grep:*)',
    'Bash(git init:*)',
    'Bash(git --no-pager status --porcelain)',
    'Bash(git --no-pager diff --stat HEAD)',
    'Bash(git --no-pager log --oneline -5)',
    'Bash(git --no-pager status)',
    'Bash(git --no-pager diff HEAD)',
  ];

  // Add subagent-specific permissions
  if (subagents['browser-automation']) {
    allow.push('Bash(playwright-cli:*)');
  }

  if (subagents['team-communicator'] === 'slack') {
    allow.push('mcp__slack__slack_list_channels');
    allow.push('mcp__slack__slack_post_rich_message');
  }

  if (subagents['documentation-researcher'] === 'notion') {
    allow.push('mcp__notion__API-post-database-query');
    allow.push('mcp__notion__API-retrieve-a-database');
  }

  return allow;
}

/**
 * Generate .claude/settings.json with hooks, permissions, and MCP server references
 * Only generates for claude-code tool (other tools don't support settings.json)
 *
 * @param subagents - Subagent role -> integration mapping
 * @param tool - AI coding tool (default: 'claude-code')
 */
export async function generateSettings(
  subagents: Record<string, string>,
  tool: ToolId = DEFAULT_TOOL
): Promise<void> {
  // Only generate for claude-code
  if (tool !== 'claude-code') {
    return;
  }

  const cwd = process.cwd();
  const settingsPath = path.join(cwd, '.claude', 'settings.json');

  // Ensure .claude directory exists
  const claudeDir = path.dirname(settingsPath);
  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
  }

  // Build hooks configuration
  const hooks: HooksConfig = {
    SessionStart: [{
      hooks: [{
        type: 'command',
        command: 'bash .bugzy/runtime/hooks/session-start.sh',
      }],
    }],
    PreCompact: [{
      hooks: [{
        type: 'command',
        command: 'bash .bugzy/runtime/hooks/pre-compact.sh',
      }],
    }],
  };

  // Build permissions
  const allow = buildAllowPermissions(subagents);

  // Build enabled MCP servers list
  const mcpServers = getMCPServersFromSubagents(subagents);

  const settings: SettingsJson = {
    hooks,
    permissions: {
      allow,
      deny: ['Read(.env)'],
      ask: [],
    },
    enabledMcpjsonServers: mcpServers,
  };

  // Write settings file (always overwrite — this is a generated file)
  const content = JSON.stringify(settings, null, 2);
  fs.writeFileSync(settingsPath, content, 'utf-8');
}
