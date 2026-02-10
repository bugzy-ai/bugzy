import { describe, it, expect } from 'vitest';
import { getSubAgent } from '../../src/subagents/metadata';
import * as path from 'path';
import * as fs from 'fs';

describe('test-debugger-fixer subagent', () => {
  it('should be registered in metadata', () => {
    const subagent = getSubAgent('test-debugger-fixer');

    expect(subagent).toBeDefined();
    expect(subagent?.name).toBe('Test Debugger & Fixer');
    expect(subagent?.role).toBe('test-debugger-fixer');
  });

  it('should have correct metadata', () => {
    const subagent = getSubAgent('test-debugger-fixer');

    expect(subagent?.description).toContain('Debug and fix failing automated tests');
    expect(subagent?.icon).toBe('wrench');
    expect(subagent?.model).toBe('sonnet');
    expect(subagent?.color).toBe('yellow');
  });

  it('should be marked as required', () => {
    const subagent = getSubAgent('test-debugger-fixer');

    expect(subagent?.isRequired).toBe(true);
  });

  it('should have Playwright integration', () => {
    const subagent = getSubAgent('test-debugger-fixer');

    expect(subagent?.integrations).toHaveLength(1);
    expect(subagent?.integrations[0].id).toBe('playwright');
    expect(subagent?.integrations[0].name).toBe('Playwright');
    expect(subagent?.integrations[0].isLocal).toBe(true);
  });

  it('should have template file', () => {
    const templatePath = path.join(
      __dirname,
      '../../src/subagents/templates/test-debugger-fixer/playwright.ts'
    );

    expect(fs.existsSync(templatePath)).toBe(true);
  });

  it('should have valid template with frontmatter and content', async () => {
    const template = await import('../../src/subagents/templates/test-debugger-fixer/playwright');

    expect(template.FRONTMATTER).toBeDefined();
    expect(template.CONTENT).toBeDefined();
    expect(template.FRONTMATTER.name).toBe('test-debugger-fixer');
    expect(template.CONTENT).toBeTruthy();
    expect(template.CONTENT.length).toBeGreaterThan(100);
  });

  it('should include key debugging instructions', async () => {
    const template = await import('../../src/subagents/templates/test-debugger-fixer/playwright');

    const content = template.CONTENT;

    // Check for core responsibilities
    expect(content).toContain('Best Practices Reference');
    expect(content).toContain('Failure Analysis');
    expect(content).toContain('Triage Decision');
    expect(content).toContain('Debug Using Browser');
    expect(content).toContain('Fix Test Issues');
  });

  it('should include fix types for common test issues', async () => {
    const template = await import('../../src/subagents/templates/test-debugger-fixer/playwright');

    const content = template.CONTENT;

    expect(content).toContain('Brittle Selectors');
    expect(content).toContain('Missing Wait Conditions');
    expect(content).toContain('Race Conditions');
    expect(content).toContain('Wrong Assertions');
    expect(content).toContain('Test Isolation Issues');
    expect(content).toContain('Flaky Tests');
  });

  it('should reference testing best practices guide', async () => {
    const template = await import('../../src/subagents/templates/test-debugger-fixer/playwright');

    expect(template.CONTENT).toContain('testing-best-practices.md');
  });

  it('should include fixing workflow steps', async () => {
    const template = await import('../../src/subagents/templates/test-debugger-fixer/playwright');

    const content = template.CONTENT;

    expect(content).toContain('Read Test File');
    expect(content).toContain('Read Failure Report');
    expect(content).toContain('Reproduce and Debug');
    expect(content).toContain('Classify Failure');
    expect(content).toContain('Apply Fix');
    expect(content).toContain('Verify Fix');
  });

  it('should include JSON report handling', async () => {
    const template = await import('../../src/subagents/templates/test-debugger-fixer/playwright');

    expect(template.CONTENT).toContain('JSON test report');
    expect(template.CONTENT).toContain('manifest.json');
  });

  it('should include playwright-cli usage instructions', async () => {
    const template = await import('../../src/subagents/templates/test-debugger-fixer/playwright');

    const content = template.CONTENT;

    expect(content).toContain('playwright-cli');
    expect(content).toContain('Open browser');
    expect(content).toContain('Inspect elements');
  });

  it('should distinguish between product bugs and test issues', async () => {
    const template = await import('../../src/subagents/templates/test-debugger-fixer/playwright');

    const content = template.CONTENT;

    expect(content).toContain('Product Bug Indicators');
    expect(content).toContain('Test Issue Indicators');
    expect(content).toContain('product-bug');
    expect(content).toContain('test-issue');
  });

  it('should include anti-patterns to avoid', async () => {
    const template = await import('../../src/subagents/templates/test-debugger-fixer/playwright');

    const content = template.CONTENT;

    expect(content).toContain('Anti-Patterns to Avoid');
    expect(content).toContain('DO NOT');
    expect(content).toContain('waitForTimeout');
  });
});
