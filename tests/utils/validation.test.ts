import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { validateProjectStructure, validateSecrets } from '../../src/cli/utils/validation';

describe('validation utilities', () => {
  const testDir = path.join(__dirname, '../temp-test-validation');

  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  describe('validateProjectStructure', () => {
    it('should validate complete project structure', () => {
      // Create expected structure
      fs.mkdirSync('.bugzy/runtime', { recursive: true });
      fs.mkdirSync('.claude/commands', { recursive: true });
      fs.mkdirSync('.claude/agents', { recursive: true });
      fs.writeFileSync('.bugzy/config.json', '{}');
      fs.writeFileSync('.bugzy/runtime/project-context.md', '# Project Context');

      expect(validateProjectStructure()).toBe(true);
    });

    it('should return false if .bugzy directory is missing', () => {
      fs.mkdirSync('.claude/commands', { recursive: true });

      expect(validateProjectStructure()).toBe(false);
    });

    it('should return false if .claude directory is missing', () => {
      fs.mkdirSync('.bugzy', { recursive: true });
      fs.writeFileSync('.bugzy/config.json', '{}');

      expect(validateProjectStructure()).toBe(false);
    });

    it('should return false if config.json is missing', () => {
      fs.mkdirSync('.bugzy', { recursive: true });
      fs.mkdirSync('.claude/commands', { recursive: true });

      expect(validateProjectStructure()).toBe(false);
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
