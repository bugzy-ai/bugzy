import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { validateProjectStructure, validateSecrets } from '../../src/cli/utils/validation';

describe('validation utilities', () => {
  const testDir = path.join(__dirname, '../temp-test-validation');
  const originalCwd = process.cwd();

  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    }
    fs.mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
  });

  afterEach(() => {
    // Change back to original directory before cleanup
    process.chdir(originalCwd);
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    }
  });

  describe('validateProjectStructure', () => {
    it('should validate complete project structure for claude-code', async () => {
      // Create expected structure for claude-code (default tool)
      fs.mkdirSync('.bugzy/runtime', { recursive: true });
      fs.mkdirSync('.claude/commands', { recursive: true });
      fs.mkdirSync('.claude/agents', { recursive: true });
      fs.writeFileSync('.bugzy/config.json', JSON.stringify({ version: '1.0.0', tool: 'claude-code', project: { name: 'test' }, subagents: {} }));
      fs.writeFileSync('.bugzy/runtime/project-context.md', '# Project Context');

      expect(await validateProjectStructure()).toBe(true);
    });

    it('should validate complete project structure for cursor', async () => {
      // Create expected structure for cursor
      fs.mkdirSync('.bugzy/runtime', { recursive: true });
      fs.mkdirSync('.cursor/commands', { recursive: true });
      fs.mkdirSync('.cursor/agents', { recursive: true });
      fs.writeFileSync('.bugzy/config.json', JSON.stringify({ version: '1.0.0', tool: 'cursor', project: { name: 'test' }, subagents: {} }));
      fs.writeFileSync('.bugzy/runtime/project-context.md', '# Project Context');

      expect(await validateProjectStructure()).toBe(true);
    });

    it('should validate complete project structure for codex', async () => {
      // Create expected structure for codex
      fs.mkdirSync('.bugzy/runtime', { recursive: true });
      fs.mkdirSync('.codex/prompts', { recursive: true });
      fs.mkdirSync('.codex/agents', { recursive: true });
      fs.writeFileSync('.bugzy/config.json', JSON.stringify({ version: '1.0.0', tool: 'codex', project: { name: 'test' }, subagents: {} }));
      fs.writeFileSync('.bugzy/runtime/project-context.md', '# Project Context');

      expect(await validateProjectStructure()).toBe(true);
    });

    it('should return false if .bugzy directory is missing', async () => {
      fs.mkdirSync('.claude/commands', { recursive: true });

      expect(await validateProjectStructure()).toBe(false);
    });

    it('should return false if tool-specific directory is missing', async () => {
      fs.mkdirSync('.bugzy/runtime', { recursive: true });
      fs.writeFileSync('.bugzy/config.json', JSON.stringify({ version: '1.0.0', tool: 'claude-code', project: { name: 'test' }, subagents: {} }));
      fs.writeFileSync('.bugzy/runtime/project-context.md', '# Project Context');
      // Missing .claude/ directory

      expect(await validateProjectStructure()).toBe(false);
    });

    it('should return false if config.json is missing', async () => {
      fs.mkdirSync('.bugzy', { recursive: true });
      fs.mkdirSync('.claude/commands', { recursive: true });

      expect(await validateProjectStructure()).toBe(false);
    });
  });

  describe('validateSecrets', () => {
    it('should return empty array when all secrets are present', () => {
      const required = ['SECRET_1', 'SECRET_2'];
      const env = { SECRET_1: 'value1', SECRET_2: 'value2' };

      const missing = validateSecrets(required, env);

      expect(missing).toEqual([]);
    });

    it('should return missing secrets', () => {
      const required = ['SECRET_1', 'SECRET_2', 'SECRET_3'];
      const env = { SECRET_1: 'value1' };

      const missing = validateSecrets(required, env);

      expect(missing).toEqual(['SECRET_2', 'SECRET_3']);
    });

    it('should handle empty required secrets', () => {
      const required: string[] = [];
      const env = { SECRET_1: 'value1' };

      const missing = validateSecrets(required, env);

      expect(missing).toEqual([]);
    });

    it('should handle empty env object', () => {
      const required = ['SECRET_1', 'SECRET_2'];
      const env = {};

      const missing = validateSecrets(required, env);

      expect(missing).toEqual(['SECRET_1', 'SECRET_2']);
    });

    it('should ignore empty string values as missing', () => {
      const required = ['SECRET_1', 'SECRET_2'];
      const env = { SECRET_1: '', SECRET_2: 'value2' };

      const missing = validateSecrets(required, env);

      expect(missing).toContain('SECRET_1');
      expect(missing).not.toContain('SECRET_2');
    });
  });
});
