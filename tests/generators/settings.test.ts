import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { generateSettings } from '../../src/cli/generators/settings';

describe('generateSettings', () => {
  const testDir = path.join(__dirname, '../temp-test-settings');
  const settingsPath = path.join(testDir, '.claude', 'settings.json');
  const originalCwd = process.cwd();

  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    }
    fs.mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    }
  });

  it('should generate .claude/settings.json with hooks configuration', async () => {
    await generateSettings({ 'browser-automation': 'playwright', 'test-engineer': 'playwright' });

    expect(fs.existsSync(settingsPath)).toBe(true);

    const content = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    expect(content).toHaveProperty('hooks');
    expect(content.hooks).toHaveProperty('SessionStart');
    expect(content.hooks).toHaveProperty('PreCompact');
    expect(content.hooks).not.toHaveProperty('Stop');
  });

  it('should include correct hook script paths', async () => {
    await generateSettings({ 'browser-automation': 'playwright', 'test-engineer': 'playwright' });

    const content = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

    expect(content.hooks.SessionStart[0].hooks[0].command).toBe('bash .bugzy/runtime/hooks/session-start.sh');
    expect(content.hooks.PreCompact[0].hooks[0].command).toBe('bash .bugzy/runtime/hooks/pre-compact.sh');
  });

  it('should include permissions with deny list', async () => {
    await generateSettings({ 'browser-automation': 'playwright', 'test-engineer': 'playwright' });

    const content = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

    expect(content.permissions.deny).toContain('Read(.env)');
    expect(content.permissions.allow).not.toContain('Bash(jq:*)');
    expect(content.permissions.ask).toEqual([]);
  });

  it('should include subagent-specific permissions', async () => {
    await generateSettings({
      'browser-automation': 'playwright',
      'test-engineer': 'playwright',
      'team-communicator': 'slack',
      'documentation-researcher': 'notion',
    });

    const content = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

    expect(content.permissions.allow).toContain('Bash(playwright-cli:*)');
    expect(content.permissions.allow).toContain('mcp__slack__slack_list_channels');
    expect(content.permissions.allow).toContain('mcp__slack__slack_post_rich_message');
    expect(content.permissions.allow).toContain('mcp__notion__API-post-database-query');
    expect(content.permissions.allow).toContain('mcp__notion__API-retrieve-a-database');
  });

  it('should include enabledMcpjsonServers from subagents', async () => {
    await generateSettings({
      'browser-automation': 'playwright',
      'test-engineer': 'playwright',
      'team-communicator': 'slack',
    });

    const content = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

    expect(content.enabledMcpjsonServers).toContain('slack');
  });

  it('should not generate for non-claude-code tools', async () => {
    await generateSettings({ 'browser-automation': 'playwright' }, 'cursor');

    expect(fs.existsSync(settingsPath)).toBe(false);
  });

  it('should handle minimal subagent configuration', async () => {
    await generateSettings({
      'browser-automation': 'playwright',
      'test-engineer': 'playwright',
      'team-communicator': 'local',
    });

    const content = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

    // Should not include slack or notion permissions
    expect(content.permissions.allow).not.toContain('mcp__slack__slack_list_channels');
    expect(content.permissions.allow).not.toContain('mcp__notion__API-post-database-query');
    // Should have basic permissions
    expect(content.permissions.allow).toContain('Bash(playwright-cli:*)');
  });

  it('should produce valid JSON', async () => {
    await generateSettings({ 'browser-automation': 'playwright', 'test-engineer': 'playwright' });

    const raw = fs.readFileSync(settingsPath, 'utf-8');
    expect(() => JSON.parse(raw)).not.toThrow();
  });
});
