import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { generateMCPConfig } from '../../src/cli/generators/mcp';
import { buildMCPConfig } from '../../src/mcp';

describe('generateMCPConfig', () => {
  const testDir = path.join(__dirname, '../temp-test-mcp');
  const mcpConfigPath = path.join(testDir, '.mcp.json');
  const originalCwd = process.cwd();

  beforeEach(() => {
    // Create test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    }
    fs.mkdirSync(testDir, { recursive: true });

    // Change to test directory
    process.chdir(testDir);
  });

  afterEach(() => {
    // Change back to original directory before cleanup
    process.chdir(originalCwd);
    // Clean up
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    }
  });

  it('should generate .mcp.json file in project root', async () => {
    await generateMCPConfig(['slack']);

    expect(fs.existsSync(mcpConfigPath)).toBe(true);
  });

  it('should generate valid JSON configuration', async () => {
    await generateMCPConfig(['slack', 'notion']);

    const content = fs.readFileSync(mcpConfigPath, 'utf-8');
    const config = JSON.parse(content);

    expect(config).toHaveProperty('mcpServers');
    expect(config.mcpServers).toHaveProperty('slack');
    expect(config.mcpServers).toHaveProperty('notion');
  });

  it('should handle empty MCP servers list', async () => {
    await generateMCPConfig([]);

    expect(fs.existsSync(mcpConfigPath)).toBe(true);

    const content = fs.readFileSync(mcpConfigPath, 'utf-8');
    const config = JSON.parse(content);

    expect(config).toHaveProperty('mcpServers');
    expect(Object.keys(config.mcpServers)).toHaveLength(0);
  });

  it('should generate configuration with correct structure', async () => {
    await generateMCPConfig(['slack']);

    const content = fs.readFileSync(mcpConfigPath, 'utf-8');
    const config = JSON.parse(content);

    expect(config.mcpServers.slack).toHaveProperty('command');
    expect(config.mcpServers.slack).toHaveProperty('args');
    expect(config.mcpServers.slack).toHaveProperty('env');
  });

  it('should format JSON with proper indentation', async () => {
    await generateMCPConfig(['slack']);

    const content = fs.readFileSync(mcpConfigPath, 'utf-8');

    // Check that it's formatted (contains newlines and indentation)
    expect(content).toContain('\n');
    expect(content).toMatch(/\s{2}/); // Contains 2-space indentation
  });

  it('should skip unknown MCP servers gracefully', async () => {
    await generateMCPConfig(['slack', 'playwright']);

    const content = fs.readFileSync(mcpConfigPath, 'utf-8');
    const config = JSON.parse(content);

    // Slack should be present
    expect(config.mcpServers.slack).toBeDefined();

    // Playwright is no longer an MCP server (uses CLI), should be skipped
    expect(config.mcpServers.playwright).toBeUndefined();
  });
});

describe('buildMCPConfig - Server Handling', () => {
  it('should not affect servers without container extensions', () => {
    const config = buildMCPConfig(['slack'], 'container');

    const slackConfig = config.mcpServers.slack;

    // Slack has no container extensions, should just use base config
    expect(slackConfig.env).toBeDefined();
    expect(slackConfig.env?.SLACK_BOT_TOKEN).toBe('${SLACK_ACCESS_TOKEN}');
  });

  it('should skip unknown servers with warning', () => {
    const config = buildMCPConfig(['playwright', 'slack']);

    // Playwright is no longer an MCP server
    expect(config.mcpServers.playwright).toBeUndefined();
    // Slack should still be present
    expect(config.mcpServers.slack).toBeDefined();
  });
});
