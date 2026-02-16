import { describe, it, expect } from 'vitest';
import { getSubAgent } from '../../src/subagents/metadata';
import * as path from 'path';
import * as fs from 'fs';

describe('test-engineer subagent', () => {
  it('should be registered in metadata', () => {
    const subagent = getSubAgent('test-engineer');

    expect(subagent).toBeDefined();
    expect(subagent?.name).toBe('Test Engineer');
    expect(subagent?.role).toBe('test-engineer');
  });

  it('should have correct metadata', () => {
    const subagent = getSubAgent('test-engineer');

    expect(subagent?.description).toContain('Create, update, debug, and fix automated tests');
    expect(subagent?.icon).toBe('code');
    expect(subagent?.model).toBe('sonnet');
    expect(subagent?.color).toBe('purple');
  });

  it('should be marked as required', () => {
    const subagent = getSubAgent('test-engineer');

    expect(subagent?.isRequired).toBe(true);
  });

  it('should have default integration', () => {
    const subagent = getSubAgent('test-engineer');

    expect(subagent?.integrations).toHaveLength(1);
    expect(subagent?.integrations[0].id).toBe('default');
    expect(subagent?.integrations[0].name).toBe('Default');
    expect(subagent?.integrations[0].isLocal).toBe(true);
  });

  it('should have template file', () => {
    const templatePath = path.join(
      __dirname,
      '../../src/subagents/templates/test-engineer/default.ts'
    );

    expect(fs.existsSync(templatePath)).toBe(true);
  });

  it('should have valid template with frontmatter and content', async () => {
    const template = await import('../../src/subagents/templates/test-engineer/default');

    expect(template.FRONTMATTER).toBeDefined();
    expect(template.CONTENT).toBeDefined();
    expect(template.FRONTMATTER.name).toBe('test-engineer');
    expect(template.CONTENT).toBeTruthy();
    expect(template.CONTENT.length).toBeGreaterThan(100);
  });

  it('should include all three modes', async () => {
    const template = await import('../../src/subagents/templates/test-engineer/default');

    const content = template.CONTENT;

    expect(content).toContain('Mode A: CREATE');
    expect(content).toContain('Mode B: UPDATE');
    expect(content).toContain('Mode C: FIX');
  });

  it('should include key debugging instructions', async () => {
    const template = await import('../../src/subagents/templates/test-engineer/default');

    const content = template.CONTENT;

    expect(content).toContain('testing-best-practices.md');
    expect(content).toContain('Classify failure');
    expect(content).toContain('product bug');
    expect(content).toContain('test issue');
  });

  it('should reference CLAUDE.md for conventions and fix patterns', async () => {
    const template = await import('../../src/subagents/templates/test-engineer/default');

    const content = template.CONTENT;

    expect(content).toContain('./tests/CLAUDE.md');
    expect(content).toContain('fix patterns');
  });

  it('should reference testing best practices guide', async () => {
    const template = await import('../../src/subagents/templates/test-engineer/default');

    expect(template.CONTENT).toContain('testing-best-practices.md');
  });

  it('should include creation workflow steps', async () => {
    const template = await import('../../src/subagents/templates/test-engineer/default');

    const content = template.CONTENT;

    expect(content).toContain('Check existing infrastructure');
    expect(content).toContain('Build missing infrastructure');
    expect(content).toContain('Create automated test');
    expect(content).toContain('Verify and fix');
  });

  it('should include fixing workflow steps', async () => {
    const template = await import('../../src/subagents/templates/test-engineer/default');

    const content = template.CONTENT;

    expect(content).toContain('Read test file');
    expect(content).toContain('Read failure report');
    expect(content).toContain('Debug');
    expect(content).toContain('Apply fix');
    expect(content).toContain('Verify fix');
  });

  it('should include JSON report handling', async () => {
    const template = await import('../../src/subagents/templates/test-engineer/default');

    expect(template.CONTENT).toContain('JSON test report');
    expect(template.CONTENT).toContain('manifest.json');
  });

  it('should distinguish between product bugs and test issues', async () => {
    const template = await import('../../src/subagents/templates/test-engineer/default');

    const content = template.CONTENT;

    expect(content).toContain('Product bug');
    expect(content).toContain('Test issue');
    expect(content).toContain('product bug');
    expect(content).toContain('test issue');
  });

  it('should include critical rules', async () => {
    const template = await import('../../src/subagents/templates/test-engineer/default');

    const content = template.CONTENT;

    expect(content).toContain('Critical Rules');
    expect(content).toContain('NEVER');
    expect(content).toContain('ALWAYS');
  });
});
