/**
 * Multi-Tool Generation Tests
 *
 * Tests that verify correct configuration generation for all supported AI coding tools:
 * - Claude Code (with regression protection)
 * - Cursor
 * - Codex CLI
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { generateCommands } from '../../src/cli/generators/commands';
import { generateAgents } from '../../src/cli/generators/agents';
import { generateMCPConfig, buildCodexMCPCommand } from '../../src/cli/generators/mcp';
import { FULL_SUBAGENTS_CONFIG } from '../fixtures/repo-configs';

// Convert ProjectSubAgent[] to Record<string, string> for generators
const subagentsRecord: Record<string, string> = {};
FULL_SUBAGENTS_CONFIG.forEach(sa => {
  subagentsRecord[sa.role] = sa.integration;
});

describe('Multi-Tool Generation Tests', () => {
  const testDir = path.join(__dirname, '../temp-multi-tool-test');
  const originalCwd = process.cwd();

  beforeEach(() => {
    // Create test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  describe('Cursor Generation', () => {
    describe('Directory Structure', () => {
      it('should create .cursor/commands/ directory', async () => {
        await generateCommands(subagentsRecord, 'cursor');
        expect(fs.existsSync(path.join(testDir, '.cursor', 'commands'))).toBe(true);
      });

      it('should create .cursor/agents/ directory', async () => {
        await generateAgents(subagentsRecord, 'cursor');
        expect(fs.existsSync(path.join(testDir, '.cursor', 'agents'))).toBe(true);
      });

      it('should create .cursor/mcp.json', async () => {
        await generateMCPConfig(['slack', 'notion'], 'cursor');
        expect(fs.existsSync(path.join(testDir, '.cursor', 'mcp.json'))).toBe(true);
      });
    });

    describe('Command Files Format (No Frontmatter)', () => {
      it('should generate command files without YAML frontmatter', async () => {
        await generateCommands(subagentsRecord, 'cursor');

        const filePath = path.join(testDir, '.cursor', 'commands', 'run-tests.md');
        const content = fs.readFileSync(filePath, 'utf-8');

        // Should NOT start with ---
        expect(content.startsWith('---\n')).toBe(false);

        // Should start with a header or description
        expect(content.startsWith('#')).toBe(true);
      });

      it('should include description as markdown header', async () => {
        await generateCommands(subagentsRecord, 'cursor');

        const filePath = path.join(testDir, '.cursor', 'commands', 'run-tests.md');
        const content = fs.readFileSync(filePath, 'utf-8');

        // Should have a level 1 header at the start
        expect(content).toMatch(/^# /);
      });
    });

    describe('Agent Files Format (No Frontmatter)', () => {
      it('should generate agent files without YAML frontmatter', async () => {
        await generateAgents(subagentsRecord, 'cursor');

        const filePath = path.join(testDir, '.cursor', 'agents', 'test-runner.md');
        const content = fs.readFileSync(filePath, 'utf-8');

        // Should NOT start with ---
        expect(content.startsWith('---\n')).toBe(false);
      });
    });

    describe('Subagent Invocation Patterns', () => {
      it('should use cursor-agent CLI invocation patterns', async () => {
        await generateCommands(subagentsRecord, 'cursor');

        const filePath = path.join(testDir, '.cursor', 'commands', 'run-tests.md');
        const content = fs.readFileSync(filePath, 'utf-8');

        // Should contain cursor-agent CLI patterns
        expect(content).toContain('cursor-agent -p');
        expect(content).toContain('.cursor/agents/');
      });
    });

    describe('MCP Configuration', () => {
      it('should generate JSON format like Claude Code', async () => {
        await generateMCPConfig(['slack', 'notion'], 'cursor');

        const content = fs.readFileSync(path.join(testDir, '.cursor', 'mcp.json'), 'utf-8');
        const config = JSON.parse(content);

        expect(config).toHaveProperty('mcpServers');
        expect(config.mcpServers).toHaveProperty('slack');
        expect(config.mcpServers).toHaveProperty('notion');
      });
    });
  });

  describe('Codex CLI Generation', () => {
    describe('Directory Structure', () => {
      it('should create .codex/prompts/ directory', async () => {
        await generateCommands(subagentsRecord, 'codex');
        expect(fs.existsSync(path.join(testDir, '.codex', 'prompts'))).toBe(true);
      });

      it('should create .codex/agents/ directory', async () => {
        await generateAgents(subagentsRecord, 'codex');
        expect(fs.existsSync(path.join(testDir, '.codex', 'agents'))).toBe(true);
      });

      it('should NOT create MCP config file (uses CLI commands instead)', async () => {
        await generateMCPConfig(['slack', 'notion'], 'codex');
        // Codex uses `codex mcp add` CLI commands, not file generation
        expect(fs.existsSync(path.join(testDir, '.codex', 'config.toml'))).toBe(false);
        expect(fs.existsSync(path.join(testDir, '.bugzy', 'setup-codex-mcp.sh'))).toBe(false);
      });
    });

    describe('Prompt Files Format (With Frontmatter)', () => {
      it('should generate prompt files with YAML frontmatter', async () => {
        await generateCommands(subagentsRecord, 'codex');

        const filePath = path.join(testDir, '.codex', 'prompts', 'run-tests.md');
        const content = fs.readFileSync(filePath, 'utf-8');

        // Codex prompts support frontmatter
        expect(content.startsWith('---\n')).toBe(true);

        // Must have closing ---
        const frontmatterEnd = content.indexOf('\n---\n', 4);
        expect(frontmatterEnd).toBeGreaterThan(4);
      });

      it('should include description in frontmatter', async () => {
        await generateCommands(subagentsRecord, 'codex');

        const filePath = path.join(testDir, '.codex', 'prompts', 'run-tests.md');
        const content = fs.readFileSync(filePath, 'utf-8');

        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        expect(frontmatterMatch).not.toBeNull();

        const frontmatter = frontmatterMatch![1];
        expect(frontmatter).toContain('description:');
      });
    });

    describe('Agent Files Format (No Frontmatter)', () => {
      it('should generate agent files without YAML frontmatter', async () => {
        await generateAgents(subagentsRecord, 'codex');

        const filePath = path.join(testDir, '.codex', 'agents', 'test-runner.md');
        const content = fs.readFileSync(filePath, 'utf-8');

        // Should NOT start with --- (Codex agents are plain markdown for CLI invocation)
        expect(content.startsWith('---\n')).toBe(false);
      });
    });

    describe('Subagent Invocation Patterns', () => {
      it('should use codex CLI invocation patterns', async () => {
        await generateCommands(subagentsRecord, 'codex');

        const filePath = path.join(testDir, '.codex', 'prompts', 'run-tests.md');
        const content = fs.readFileSync(filePath, 'utf-8');

        // Should contain codex CLI patterns
        expect(content).toContain('codex -p');
        expect(content).toContain('.codex/agents/');
      });
    });

    describe('MCP Configuration (CLI Commands)', () => {
      it('should build codex mcp add command with server name and -- separator', () => {
        const { args } = buildCodexMCPCommand('slack');

        expect(args).toContain('mcp');
        expect(args).toContain('add');
        expect(args).toContain('bugzy-slack');
        // Should use -- separator before command (not --stdio)
        expect(args).toContain('--');
        expect(args).not.toContain('--stdio');
      });

      it('should include environment variables in command args before -- separator', () => {
        const { args, envVars } = buildCodexMCPCommand('slack');

        // Slack requires SLACK_BOT_TOKEN (mapped to SLACK_ACCESS_TOKEN)
        expect(args.some(arg => arg.includes('--env'))).toBe(true);
        expect(envVars.length).toBeGreaterThan(0);
        expect(envVars.some(v => v.includes('SLACK'))).toBe(true);

        // --env should appear before --
        const envIndex = args.findIndex(arg => arg === '--env');
        const separatorIndex = args.indexOf('--');
        expect(envIndex).toBeLessThan(separatorIndex);
      });

      it('should include command args after -- separator', () => {
        const { args } = buildCodexMCPCommand('notion');

        // Should have -- separator followed by command and args
        const separatorIndex = args.indexOf('--');
        expect(separatorIndex).toBeGreaterThan(0);
        // Command should be right after --
        expect(args[separatorIndex + 1]).toBe('notion-mcp-server');
        // Args should follow the command (not use --args flag)
        expect(args).not.toContain('--args');
      });

      it('should throw error for unknown server', () => {
        expect(() => buildCodexMCPCommand('unknown-server')).toThrow('Unknown MCP server');
      });
    });
  });

  describe('Tool-Specific Directory Structure', () => {
    it('should create .claude/ for Claude Code', async () => {
      await generateCommands(subagentsRecord, 'claude-code');
      expect(fs.existsSync(path.join(testDir, '.claude', 'commands'))).toBe(true);
    });

    it('should create .cursor/ for Cursor', async () => {
      await generateCommands(subagentsRecord, 'cursor');
      expect(fs.existsSync(path.join(testDir, '.cursor', 'commands'))).toBe(true);
    });

    it('should create .codex/ for Codex', async () => {
      await generateCommands(subagentsRecord, 'codex');
      expect(fs.existsSync(path.join(testDir, '.codex', 'prompts'))).toBe(true);
    });
  });

  describe('Subagent Invocation Pattern Validation', () => {
    it('should keep Claude Code patterns unchanged for claude-code tool', async () => {
      await generateCommands(subagentsRecord, 'claude-code');

      const filePath = path.join(testDir, '.claude', 'commands', 'run-tests.md');
      const content = fs.readFileSync(filePath, 'utf-8');

      // Claude Code pattern: explicit Task tool invocation
      expect(content).toContain('DELEGATE TO SUBAGENT');
      expect(content).toContain('subagent_type: "test-debugger-fixer"');

      // Should NOT contain CLI patterns
      expect(content).not.toContain('cursor-agent -p');
      expect(content).not.toContain('codex -p');
    });

    it('should transform to cursor-agent patterns for cursor tool', async () => {
      await generateCommands(subagentsRecord, 'cursor');

      const filePath = path.join(testDir, '.cursor', 'commands', 'run-tests.md');
      const content = fs.readFileSync(filePath, 'utf-8');

      // Should contain Cursor CLI patterns
      expect(content).toContain('cursor-agent -p');
      expect(content).toContain('$(cat .cursor/agents/');
    });

    it('should transform to codex patterns for codex tool', async () => {
      await generateCommands(subagentsRecord, 'codex');

      const filePath = path.join(testDir, '.codex', 'prompts', 'run-tests.md');
      const content = fs.readFileSync(filePath, 'utf-8');

      // Should contain Codex CLI patterns
      expect(content).toContain('codex -p');
      expect(content).toContain('$(cat .codex/agents/');
    });
  });
});
