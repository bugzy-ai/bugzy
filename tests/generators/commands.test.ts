import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { generateCommands } from '../../src/cli/generators/commands';
import { sampleSubAgents, minimalSubAgents } from '../fixtures/sample-subagents';

describe('generateCommands', () => {
  const testDir = path.join(__dirname, '../temp-test-commands');
  const commandsDir = path.join(testDir, '.claude/commands');

  beforeEach(() => {
    // Create test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    fs.mkdirSync(commandsDir, { recursive: true });

    // Change to test directory
    process.chdir(testDir);
  });

  afterEach(() => {
    // Clean up
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  it('should generate command files for all tasks', async () => {
    await generateCommands(sampleSubAgents);

    const files = fs.readdirSync(commandsDir);

    expect(files).toContain('generate-test-plan.md');
    expect(files).toContain('generate-test-cases.md');
    expect(files).toContain('explore-application.md');
    expect(files).toContain('run-tests.md');
    expect(files).toContain('handle-message.md');
    expect(files).toContain('process-event.md');
    expect(files).toContain('verify-changes-manual.md');
    expect(files).toContain('verify-changes-slack.md');
  });

  it('should generate valid markdown files with frontmatter', async () => {
    await generateCommands(sampleSubAgents);

    const filePath = path.join(commandsDir, 'generate-test-plan.md');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check frontmatter
    expect(content).toMatch(/^---\n/);
    expect(content).toContain('description:');

    // Check content
    expect(content).toContain('# ');
  });

  it('should handle tasks without optional subagents', async () => {
    await generateCommands(minimalSubAgents);

    const files = fs.readdirSync(commandsDir);
    expect(files.length).toBeGreaterThan(0);
  });

  it('should create directory if it does not exist', async () => {
    fs.rmSync(commandsDir, { recursive: true });

    await generateCommands(sampleSubAgents);

    expect(fs.existsSync(commandsDir)).toBe(true);
  });
});
