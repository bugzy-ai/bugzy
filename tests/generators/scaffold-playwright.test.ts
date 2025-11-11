/**
 * Tests for Playwright project scaffolding
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { scaffoldPlaywrightProject, isPlaywrightScaffolded } from '../../src/cli/generators/scaffold-playwright';
import type { BugzyConfig } from '../../src/cli/utils/config';

// Test directory setup
const TEST_DIR = path.join(__dirname, '../temp-scaffold-test');

describe('scaffoldPlaywrightProject', () => {
  beforeEach(() => {
    // Clean up test directory before each test
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    // Clean up after tests
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it('should create all required directories', async () => {
    const config: BugzyConfig = {
      version: '1.0.0',
      project: { name: 'test-project' },
      subagents: { 'test-runner': 'playwright' }
    };

    await scaffoldPlaywrightProject({
      projectName: 'test-project',
      targetDir: TEST_DIR,
      config,
      skipInstall: true
    });

    // Check directories exist
    const expectedDirs = [
      'tests/specs',
      'tests/pages',
      'tests/components',
      'tests/fixtures',
      'tests/helpers',
      'tests/types',
      'tests/setup',
      'tests/data',
      'tests/.auth'
    ];

    for (const dir of expectedDirs) {
      const fullPath = path.join(TEST_DIR, dir);
      expect(fs.existsSync(fullPath), `Directory ${dir} should exist`).toBe(true);
      expect(fs.statSync(fullPath).isDirectory(), `${dir} should be a directory`).toBe(true);
    }
  });

  it('should create playwright.config.ts file', async () => {
    const config: BugzyConfig = {
      version: '1.0.0',
      project: { name: 'test-project' },
      subagents: { 'test-runner': 'playwright' }
    };

    await scaffoldPlaywrightProject({
      projectName: 'test-project',
      targetDir: TEST_DIR,
      config,
      skipInstall: true
    });

    const configPath = path.join(TEST_DIR, 'playwright.config.ts');
    expect(fs.existsSync(configPath), 'playwright.config.ts should exist').toBe(true);

    const content = fs.readFileSync(configPath, 'utf-8');
    expect(content).toContain('defineConfig');
    expect(content).toContain('testDir: \'./tests/specs\'');
    expect(content).toContain('fullyParallel: true');
  });

  it('should create BasePage.ts in tests/pages', async () => {
    const config: BugzyConfig = {
      version: '1.0.0',
      project: { name: 'test-project' },
      subagents: { 'test-runner': 'playwright' }
    };

    await scaffoldPlaywrightProject({
      projectName: 'test-project',
      targetDir: TEST_DIR,
      config,
      skipInstall: true
    });

    const basePagePath = path.join(TEST_DIR, 'tests/pages/BasePage.ts');
    expect(fs.existsSync(basePagePath), 'BasePage.ts should exist').toBe(true);

    const content = fs.readFileSync(basePagePath, 'utf-8');
    expect(content).toContain('export class BasePage');
    expect(content).toContain('readonly page: Page');
  });

  it('should create fixture and setup files', async () => {
    const config: BugzyConfig = {
      version: '1.0.0',
      project: { name: 'test-project' },
      subagents: { 'test-runner': 'playwright' }
    };

    await scaffoldPlaywrightProject({
      projectName: 'test-project',
      targetDir: TEST_DIR,
      config,
      skipInstall: true
    });

    // Check fixture file
    const fixturePath = path.join(TEST_DIR, 'tests/fixtures/pages.fixture.ts');
    expect(fs.existsSync(fixturePath), 'pages.fixture.ts should exist').toBe(true);

    // Check setup file
    const setupPath = path.join(TEST_DIR, 'tests/setup/auth.setup.ts');
    expect(fs.existsSync(setupPath), 'auth.setup.ts should exist').toBe(true);
  });

  it('should create helper files', async () => {
    const config: BugzyConfig = {
      version: '1.0.0',
      project: { name: 'test-project' },
      subagents: { 'test-runner': 'playwright' }
    };

    await scaffoldPlaywrightProject({
      projectName: 'test-project',
      targetDir: TEST_DIR,
      config,
      skipInstall: true
    });

    const dateUtilsPath = path.join(TEST_DIR, 'tests/helpers/dateUtils.ts');
    expect(fs.existsSync(dateUtilsPath), 'dateUtils.ts should exist').toBe(true);

    const dataGenPath = path.join(TEST_DIR, 'tests/helpers/dataGenerators.ts');
    expect(fs.existsSync(dataGenPath), 'dataGenerators.ts should exist').toBe(true);
  });

  it('should NOT create .env.example file (managed by setup command)', async () => {
    const config: BugzyConfig = {
      version: '1.0.0',
      project: { name: 'test-project' },
      subagents: { 'test-runner': 'playwright' }
    };

    await scaffoldPlaywrightProject({
      projectName: 'test-project',
      targetDir: TEST_DIR,
      config,
      skipInstall: true
    });

    const envExamplePath = path.join(TEST_DIR, '.env.example');
    // .env.example should NOT be created by scaffolding
    // It's created by the setup command for MCP secrets
    // Test data goes to .env.testdata (created by /generate-test-plan task)
    expect(fs.existsSync(envExamplePath), '.env.example should NOT be created by scaffolding').toBe(false);
  });

  it('should update .gitignore with Playwright entries', async () => {
    const config: BugzyConfig = {
      version: '1.0.0',
      project: { name: 'test-project' },
      subagents: { 'test-runner': 'playwright' }
    };

    // Create a .gitignore file first
    const gitignorePath = path.join(TEST_DIR, '.gitignore');
    fs.writeFileSync(gitignorePath, 'node_modules/\n', 'utf-8');

    await scaffoldPlaywrightProject({
      projectName: 'test-project',
      targetDir: TEST_DIR,
      config,
      skipInstall: true
    });

    const content = fs.readFileSync(gitignorePath, 'utf-8');
    expect(content).toContain('# Playwright');
    expect(content).toContain('test-results/');
    expect(content).toContain('playwright-report/');
    expect(content).toContain('tests/.auth/');
    expect(content).toContain('.env');
  });

  it('should create .gitignore if it does not exist', async () => {
    const config: BugzyConfig = {
      version: '1.0.0',
      project: { name: 'test-project' },
      subagents: { 'test-runner': 'playwright' }
    };

    await scaffoldPlaywrightProject({
      projectName: 'test-project',
      targetDir: TEST_DIR,
      config,
      skipInstall: true
    });

    const gitignorePath = path.join(TEST_DIR, '.gitignore');
    expect(fs.existsSync(gitignorePath), '.gitignore should be created').toBe(true);

    const content = fs.readFileSync(gitignorePath, 'utf-8');
    expect(content).toContain('# Playwright');
  });
});

describe('isPlaywrightScaffolded', () => {
  beforeEach(() => {
    // Clean up test directory before each test
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    // Clean up after tests
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it('should return false if playwright.config.ts does not exist', () => {
    const result = isPlaywrightScaffolded(TEST_DIR);
    expect(result).toBe(false);
  });

  it('should return false if tests/ directory does not exist', () => {
    // Create playwright.config.ts but not tests/
    const configPath = path.join(TEST_DIR, 'playwright.config.ts');
    fs.writeFileSync(configPath, 'export default {}', 'utf-8');

    const result = isPlaywrightScaffolded(TEST_DIR);
    expect(result).toBe(false);
  });

  it('should return true if both playwright.config.ts and tests/ exist', () => {
    // Create both required items
    const configPath = path.join(TEST_DIR, 'playwright.config.ts');
    fs.writeFileSync(configPath, 'export default {}', 'utf-8');

    const testsPath = path.join(TEST_DIR, 'tests');
    fs.mkdirSync(testsPath, { recursive: true });

    const result = isPlaywrightScaffolded(TEST_DIR);
    expect(result).toBe(true);
  });
});
