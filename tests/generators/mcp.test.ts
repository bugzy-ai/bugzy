import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { generateMCPConfig } from '../../src/cli/generators/mcp';

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
});
