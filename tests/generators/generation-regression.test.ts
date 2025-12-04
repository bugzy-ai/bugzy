/**
 * Claude Code Generation Regression Tests
 *
 * These tests ensure that the current Claude Code generation behavior is preserved
 * when adding multi-tool support (Cursor, Codex CLI).
 *
 * IMPORTANT: These tests should pass before and after multi-tool changes.
 * Do not modify these tests unless intentionally changing Claude Code output format.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { generateCommands } from '../../src/cli/generators/commands';
import { generateAgents } from '../../src/cli/generators/agents';
import { generateMCPConfig } from '../../src/cli/generators/mcp';
import { buildMCPConfig } from '../../src/mcp';
import { FULL_SUBAGENTS_CONFIG } from '../fixtures/repo-configs';

// Convert ProjectSubAgent[] to Record<string, string> for generators
const subagentsRecord: Record<string, string> = {};
FULL_SUBAGENTS_CONFIG.forEach(sa => {
  subagentsRecord[sa.role] = sa.integration;
});

describe('Claude Code Generation Regression Tests', () => {
  const testDir = path.join(__dirname, '../temp-regression-test');
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

  describe('Directory Structure', () => {
    it('should create .claude/commands/ directory', async () => {
      await generateCommands(subagentsRecord);
      expect(fs.existsSync(path.join(testDir, '.claude', 'commands'))).toBe(true);
    });

    it('should create .claude/agents/ directory', async () => {
      await generateAgents(subagentsRecord);
      expect(fs.existsSync(path.join(testDir, '.claude', 'agents'))).toBe(true);
    });

    it('should create .mcp.json at project root (not in .claude/)', async () => {
      await generateMCPConfig(['playwright', 'slack']);
      expect(fs.existsSync(path.join(testDir, '.mcp.json'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, '.claude', '.mcp.json'))).toBe(false);
    });
  });

  describe('Command Files Format (YAML Frontmatter)', () => {
    it('should generate command files with YAML frontmatter delimiters', async () => {
      await generateCommands(subagentsRecord);

      const filePath = path.join(testDir, '.claude', 'commands', 'run-tests.md');
      const content = fs.readFileSync(filePath, 'utf-8');

      // Must start with ---
      expect(content.startsWith('---\n')).toBe(true);

      // Must have closing ---
      const frontmatterEnd = content.indexOf('\n---\n', 4);
      expect(frontmatterEnd).toBeGreaterThan(4);
    });

    it('should include description in frontmatter', async () => {
      await generateCommands(subagentsRecord);

      const filePath = path.join(testDir, '.claude', 'commands', 'run-tests.md');
      const content = fs.readFileSync(filePath, 'utf-8');

      // Extract frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      expect(frontmatterMatch).not.toBeNull();

      const frontmatter = frontmatterMatch![1];
      expect(frontmatter).toContain('description:');
    });

    it('should include argument-hint in frontmatter when present', async () => {
      await generateCommands(subagentsRecord);

      const filePath = path.join(testDir, '.claude', 'commands', 'run-tests.md');
      const content = fs.readFileSync(filePath, 'utf-8');

      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      const frontmatter = frontmatterMatch![1];

      // run-tests has an argument-hint
      expect(frontmatter).toContain('argument-hint:');
    });

    it('should quote string values in frontmatter', async () => {
      await generateCommands(subagentsRecord);

      const filePath = path.join(testDir, '.claude', 'commands', 'run-tests.md');
      const content = fs.readFileSync(filePath, 'utf-8');

      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      const frontmatter = frontmatterMatch![1];

      // Description value should be quoted
      expect(frontmatter).toMatch(/description:\s*".*"/);
    });

    it('should have markdown content after frontmatter', async () => {
      await generateCommands(subagentsRecord);

      const filePath = path.join(testDir, '.claude', 'commands', 'run-tests.md');
      const content = fs.readFileSync(filePath, 'utf-8');

      // Content after frontmatter should have markdown headers
      const afterFrontmatter = content.split('\n---\n')[1];
      expect(afterFrontmatter).toContain('#');
    });
  });

  describe('Agent Files Format (YAML Frontmatter)', () => {
    it('should generate agent files with YAML frontmatter', async () => {
      await generateAgents(subagentsRecord);

      const filePath = path.join(testDir, '.claude', 'agents', 'test-runner.md');
      const content = fs.readFileSync(filePath, 'utf-8');

      // Must start with ---
      expect(content.startsWith('---\n')).toBe(true);

      // Must have closing ---
      const frontmatterEnd = content.indexOf('\n---\n', 4);
      expect(frontmatterEnd).toBeGreaterThan(4);
    });

    it('should include name and description in agent frontmatter', async () => {
      await generateAgents(subagentsRecord);

      const filePath = path.join(testDir, '.claude', 'agents', 'test-runner.md');
      const content = fs.readFileSync(filePath, 'utf-8');

      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      expect(frontmatterMatch).not.toBeNull();

      const frontmatter = frontmatterMatch![1];
      expect(frontmatter).toContain('name:');
      expect(frontmatter).toContain('description:');
    });

    it('should include model and color when specified', async () => {
      await generateAgents(subagentsRecord);

      const filePath = path.join(testDir, '.claude', 'agents', 'test-runner.md');
      const content = fs.readFileSync(filePath, 'utf-8');

      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      const frontmatter = frontmatterMatch![1];

      // test-runner has model and color in metadata
      expect(frontmatter).toMatch(/model:/);
    });
  });

  describe('MCP Configuration Format', () => {
    it('should generate valid JSON with mcpServers key', async () => {
      await generateMCPConfig(['playwright', 'slack']);

      const content = fs.readFileSync(path.join(testDir, '.mcp.json'), 'utf-8');
      const config = JSON.parse(content);

      expect(config).toHaveProperty('mcpServers');
      expect(typeof config.mcpServers).toBe('object');
    });

    it('should include configured MCP servers', async () => {
      await generateMCPConfig(['playwright', 'slack']);

      const content = fs.readFileSync(path.join(testDir, '.mcp.json'), 'utf-8');
      const config = JSON.parse(content);

      expect(config.mcpServers).toHaveProperty('playwright');
      expect(config.mcpServers).toHaveProperty('slack');
    });

    it('should use ${VAR} syntax for environment variables', async () => {
      await generateMCPConfig(['slack']);

      const content = fs.readFileSync(path.join(testDir, '.mcp.json'), 'utf-8');
      const config = JSON.parse(content);

      // Slack requires SLACK_BOT_TOKEN environment variable
      const slackEnv = config.mcpServers.slack.env;
      expect(slackEnv).toBeDefined();

      // Should use ${VAR} syntax (Claude Code's runtime expansion)
      const envValue = Object.values(slackEnv)[0] as string;
      expect(envValue).toMatch(/\$\{[A-Z_]+\}/);
    });

    it('should include command and args for MCP servers', async () => {
      await generateMCPConfig(['playwright']);

      const content = fs.readFileSync(path.join(testDir, '.mcp.json'), 'utf-8');
      const config = JSON.parse(content);

      expect(config.mcpServers.playwright).toHaveProperty('command');
      expect(config.mcpServers.playwright).toHaveProperty('args');
      expect(Array.isArray(config.mcpServers.playwright.args)).toBe(true);
    });

    it('should format JSON with 2-space indentation', async () => {
      await generateMCPConfig(['playwright']);

      const content = fs.readFileSync(path.join(testDir, '.mcp.json'), 'utf-8');

      // Should have newlines (formatted, not minified)
      expect(content).toContain('\n');
      // Should have 2-space indentation
      expect(content).toMatch(/\n {2}"/);
    });
  });

  describe('Placeholder Injection', () => {
    it('should inject optional subagent content when configured', async () => {
      await generateCommands(subagentsRecord);

      // run-tests has optional issue-tracker and team-communicator
      const filePath = path.join(testDir, '.claude', 'commands', 'run-tests.md');
      const content = fs.readFileSync(filePath, 'utf-8');

      // Should include issue-tracker instructions (configured in FULL_SUBAGENTS_CONFIG)
      expect(content).toContain('issue-tracker');

      // Should include team-communicator instructions (configured in FULL_SUBAGENTS_CONFIG)
      expect(content).toContain('team-communicator');
    });

    it('should remove unprocessed placeholders', async () => {
      await generateCommands(subagentsRecord);

      const filePath = path.join(testDir, '.claude', 'commands', 'run-tests.md');
      const content = fs.readFileSync(filePath, 'utf-8');

      // No {{PLACEHOLDER}} patterns should remain
      expect(content).not.toMatch(/\{\{[A-Z_]+_INSTRUCTIONS\}\}/);
    });
  });

  describe('File Naming Conventions', () => {
    it('should use kebab-case for command filenames', async () => {
      await generateCommands(subagentsRecord);

      const files = fs.readdirSync(path.join(testDir, '.claude', 'commands'));

      files.forEach(file => {
        if (file.endsWith('.md')) {
          const name = file.replace('.md', '');
          // Should be lowercase with hyphens
          expect(name).toMatch(/^[a-z][a-z0-9-]*$/);
        }
      });
    });

    it('should use kebab-case for agent filenames matching role', async () => {
      await generateAgents(subagentsRecord);

      const files = fs.readdirSync(path.join(testDir, '.claude', 'agents'));

      // Each configured subagent should have a file
      Object.keys(subagentsRecord).forEach(role => {
        expect(files).toContain(`${role}.md`);
      });
    });
  });

  describe('Cloud Run API Compatibility', () => {
    it('should produce MCP config matching Cloud Run expected format', () => {
      // Cloud Run expects this exact structure
      const config = buildMCPConfig(['playwright', 'slack'], 'container');

      expect(config).toHaveProperty('mcpServers');

      // Each server should have command, args
      Object.values(config.mcpServers).forEach(server => {
        expect(server).toHaveProperty('command');
        expect(server).toHaveProperty('args');
      });
    });

    it('should support both local and container targets', () => {
      const localConfig = buildMCPConfig(['playwright'], 'local');
      const containerConfig = buildMCPConfig(['playwright'], 'container');

      // Local should not have headless arg
      expect(localConfig.mcpServers.playwright.args).not.toContain('--headless');

      // Container should have headless arg
      expect(containerConfig.mcpServers.playwright.args).toContain('--headless');
    });
  });
});

describe('Subagent Invocation Patterns (Claude Code)', () => {
  /**
   * These tests verify that Claude Code uses Task tool patterns for subagent invocation.
   * When multi-tool support is added, each tool will have its own invocation pattern.
   */

  it('should reference subagents by role name in task content', async () => {
    const testDir = path.join(__dirname, '../temp-invocation-test');
    const originalCwd = process.cwd();

    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);

    try {
      const subagentsRecord: Record<string, string> = {
        'test-runner': 'playwright',
        'test-debugger-fixer': 'playwright',
        'team-communicator': 'slack',
        'issue-tracker': 'notion',
      };

      await generateCommands(subagentsRecord);

      const filePath = path.join(testDir, '.claude', 'commands', 'run-tests.md');
      const content = fs.readFileSync(filePath, 'utf-8');

      // Claude Code pattern: "Use the {role} agent to..."
      // Should reference agents by their role name
      expect(content.toLowerCase()).toMatch(/test-debugger-fixer|issue-tracker|team-communicator/);
    } finally {
      process.chdir(originalCwd);
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true });
      }
    }
  });
});
