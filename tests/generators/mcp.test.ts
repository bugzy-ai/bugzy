import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { generateMCPConfig } from '../../src/cli/generators/mcp';
import { buildMCPConfig } from '../../src/mcp';

describe('generateMCPConfig', () => {
  const testDir = path.join(__dirname, '../temp-test-mcp');
  const mcpConfigPath = path.join(testDir, '.mcp.json');

  beforeEach(() => {
    // Create test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    fs.mkdirSync(testDir, { recursive: true });

    // Change to test directory
    process.chdir(testDir);
  });

  afterEach(() => {
    // Clean up
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  it('should generate .mcp.json file in project root', async () => {
    await generateMCPConfig(['slack', 'playwright']);

    expect(fs.existsSync(mcpConfigPath)).toBe(true);
  });

  it('should generate valid JSON configuration', async () => {
    await generateMCPConfig(['slack', 'playwright']);

    const content = fs.readFileSync(mcpConfigPath, 'utf-8');
    const config = JSON.parse(content);

    expect(config).toHaveProperty('mcpServers');
    expect(config.mcpServers).toHaveProperty('slack');
    expect(config.mcpServers).toHaveProperty('playwright');
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

  it('should generate local-friendly Playwright config (CLI uses local target)', async () => {
    await generateMCPConfig(['playwright']);

    const content = fs.readFileSync(mcpConfigPath, 'utf-8');
    const config = JSON.parse(content);

    const playwrightConfig = config.mcpServers.playwright;

    // Should not have --headless arg in local deployment
    expect(playwrightConfig.args).not.toContain('--headless');

    // Should not have env section in local deployment
    expect(playwrightConfig).not.toHaveProperty('env');

    // Should still have other args
    expect(playwrightConfig.args).toContain('--browser');
    expect(playwrightConfig.args).toContain('chromium');
    expect(playwrightConfig.args).toContain('--no-sandbox');
  });

  it('should not affect other MCP servers without container extensions', async () => {
    await generateMCPConfig(['slack', 'playwright']);

    const content = fs.readFileSync(mcpConfigPath, 'utf-8');
    const config = JSON.parse(content);

    // Slack should still have its env section (base config)
    expect(config.mcpServers.slack).toHaveProperty('env');
    expect(config.mcpServers.slack.env).toHaveProperty('SLACK_BOT_TOKEN');

    // Playwright should use base config only (local target)
    expect(config.mcpServers.playwright).not.toHaveProperty('env');
    expect(config.mcpServers.playwright.args).not.toContain('--headless');
  });
});

describe('buildMCPConfig - Container Extensions', () => {
  it('should merge container extensions when target is container', () => {
    const config = buildMCPConfig(['playwright'], 'container');

    const playwrightConfig = config.mcpServers.playwright;

    // Should have base args plus container extension args
    expect(playwrightConfig.args).toContain('--browser');
    expect(playwrightConfig.args).toContain('chromium');
    expect(playwrightConfig.args).toContain('--headless'); // Added by container extensions

    // Should have container env vars
    expect(playwrightConfig.env).toBeDefined();
    expect(playwrightConfig.env?.PLAYWRIGHT_BROWSERS_PATH).toBe('/opt/ms-playwright');
  });

  it('should use base config only when target is local', () => {
    const config = buildMCPConfig(['playwright'], 'local');

    const playwrightConfig = config.mcpServers.playwright;

    // Should have base args only
    expect(playwrightConfig.args).toContain('--browser');
    expect(playwrightConfig.args).toContain('chromium');
    expect(playwrightConfig.args).not.toContain('--headless'); // Not added for local

    // Should not have container env vars
    expect(playwrightConfig.env).toBeUndefined();
  });

  it('should default to container target when no target specified', () => {
    const config = buildMCPConfig(['playwright']); // No target param

    const playwrightConfig = config.mcpServers.playwright;

    // Should have container extensions applied (default behavior)
    expect(playwrightConfig.args).toContain('--headless');
    expect(playwrightConfig.env).toBeDefined();
    expect(playwrightConfig.env?.PLAYWRIGHT_BROWSERS_PATH).toBe('/opt/ms-playwright');
  });

  it('should not affect servers without container extensions', () => {
    const config = buildMCPConfig(['slack'], 'container');

    const slackConfig = config.mcpServers.slack;

    // Slack has no container extensions, should just use base config
    expect(slackConfig.env).toBeDefined();
    expect(slackConfig.env?.SLACK_BOT_TOKEN).toBe('${SLACK_ACCESS_TOKEN}');
  });
});
