import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { loadConfig, saveConfig } from '../../src/cli/utils/config';

describe('config utilities', () => {
  const testDir = path.join(__dirname, '../temp-test-config');
  const configPath = path.join(testDir, '.bugzy/config.json');

  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    fs.mkdirSync(path.join(testDir, '.bugzy'), { recursive: true });
    process.chdir(testDir);
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  describe('loadConfig', () => {
    it('should load valid config file', async () => {
      const sampleConfig = {
        version: '1.0.0',
        project: { name: 'test-project' },
        subagents: { 'test-runner': 'playwright' }
      };

      fs.writeFileSync(configPath, JSON.stringify(sampleConfig, null, 2));

      const config = await loadConfig();

      // loadConfig adds default tool for backward compatibility
      expect(config).toEqual({
        ...sampleConfig,
        tool: 'claude-code' // Default tool applied for configs without tool field
      });
    });

    it('should preserve tool field when present', async () => {
      const sampleConfig = {
        version: '1.0.0',
        tool: 'cursor',
        project: { name: 'test-project' },
        subagents: { 'test-runner': 'playwright' }
      };

      fs.writeFileSync(configPath, JSON.stringify(sampleConfig, null, 2));

      const config = await loadConfig();

      expect(config).toEqual(sampleConfig);
    });

    it('should return null if config file does not exist', async () => {
      const config = await loadConfig();
      expect(config).toBeNull();
    });

    it('should throw error if config file is invalid JSON', async () => {
      fs.writeFileSync(configPath, 'invalid json');

      await expect(loadConfig()).rejects.toThrow();
    });
  });

  describe('saveConfig', () => {
    it('should save config to file', async () => {
      const config = {
        version: '1.0.0',
        project: { name: 'test-project' },
        subagents: { 'test-runner': 'playwright' }
      };

      await saveConfig(config);

      expect(fs.existsSync(configPath)).toBe(true);

      const saved = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      expect(saved).toEqual(config);
    });

    it('should create directory if it does not exist', async () => {
      fs.rmSync(path.join(testDir, '.bugzy'), { recursive: true });

      const config = {
        version: '1.0.0',
        project: { name: 'test-project' },
        subagents: {}
      };

      await saveConfig(config);

      expect(fs.existsSync(configPath)).toBe(true);
    });

    it('should overwrite existing config', async () => {
      const initialConfig = {
        version: '1.0.0',
        project: { name: 'initial' },
        subagents: {}
      };

      await saveConfig(initialConfig);

      const updatedConfig = {
        version: '1.0.0',
        project: { name: 'updated' },
        subagents: { 'test-runner': 'playwright' }
      };

      await saveConfig(updatedConfig);

      const saved = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      expect(saved.project.name).toBe('updated');
    });
  });
});
