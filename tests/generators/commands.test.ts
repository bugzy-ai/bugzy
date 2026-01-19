import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { generateCommands } from '../../src/cli/generators/commands';
import { sampleSubAgents, minimalSubAgents } from '../fixtures/sample-subagents';

// Convert ProjectSubAgent[] to Record<string, string>
const toSubagentRecord = (subagents: typeof sampleSubAgents): Record<string, string> =>
  Object.fromEntries(subagents.map(s => [s.role, s.integration]));

describe('generateCommands', () => {
  const testDir = path.join(__dirname, '../temp-test-commands');
  const commandsDir = path.join(testDir, '.claude/commands');
  const originalCwd = process.cwd();

  beforeEach(() => {
    // Create test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    }
    fs.mkdirSync(commandsDir, { recursive: true });

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

  it('should generate command files for all tasks', async () => {
    await generateCommands(toSubagentRecord(sampleSubAgents));

    const files = fs.readdirSync(commandsDir);

    // Only non-cloud commands should be generated
    expect(files).toContain('generate-test-plan.md');
    expect(files).toContain('generate-test-cases.md');
    expect(files).toContain('explore-application.md');
    expect(files).toContain('run-tests.md');
    expect(files).toContain('verify-changes.md'); // Renamed from verify-changes-manual

    // Cloud-only commands should not be generated
    expect(files).not.toContain('handle-message.md');
    expect(files).not.toContain('process-event.md');
    expect(files).not.toContain('verify-changes-slack.md');
  });

  it('should generate valid markdown files with frontmatter', async () => {
    await generateCommands(toSubagentRecord(sampleSubAgents));

    const filePath = path.join(commandsDir, 'generate-test-plan.md');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check frontmatter
    expect(content).toMatch(/^---\n/);
    expect(content).toContain('description:');

    // Check content
    expect(content).toContain('# ');
  });

  it('should handle tasks without optional subagents', async () => {
    await generateCommands(toSubagentRecord(minimalSubAgents));

    const files = fs.readdirSync(commandsDir);
    expect(files.length).toBeGreaterThan(0);
  });

  it('should create directory if it does not exist', async () => {
    fs.rmSync(commandsDir, { recursive: true, force: true });

    await generateCommands(toSubagentRecord(sampleSubAgents));

    expect(fs.existsSync(commandsDir)).toBe(true);
  });
});
