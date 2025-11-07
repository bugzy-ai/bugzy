import { describe, it, expect } from 'vitest';
import { buildTaskDefinition } from '../../src/core/task-builder';
import type { ProjectSubAgent } from '../../src/core/task-builder';

describe('run-tests task (automated execution)', () => {
  const minimalSubAgents: ProjectSubAgent[] = [
    { role: 'test-runner', integration: 'playwright' },
    { role: 'test-debugger-fixer', integration: 'playwright' }
  ];

  const fullSubAgents: ProjectSubAgent[] = [
    ...minimalSubAgents,
    { role: 'issue-tracker', integration: 'linear' },
    { role: 'team-communicator', integration: 'slack' }
  ];

  it('should require both test-runner and test-debugger-fixer subagents', () => {
    const result = buildTaskDefinition('run-tests', minimalSubAgents);

    expect(result.requiredSubAgentRoles).toContain('test-runner');
    expect(result.requiredSubAgentRoles).toContain('test-debugger-fixer');
  });

  it('should throw error if test-runner is missing', () => {
    const missingTestRunner: ProjectSubAgent[] = [
      { role: 'test-debugger-fixer', integration: 'playwright' }
    ];

    expect(() => {
      buildTaskDefinition('run-tests', missingTestRunner);
    }).toThrow(/requires subagent "test-runner"/);
  });

  it('should throw error if test-debugger-fixer is missing', () => {
    const missingDebugger: ProjectSubAgent[] = [
      { role: 'test-runner', integration: 'playwright' }
    ];

    expect(() => {
      buildTaskDefinition('run-tests', missingDebugger);
    }).toThrow(/requires subagent "test-debugger-fixer"/);
  });

  it('should include Playwright command execution instructions', () => {
    const result = buildTaskDefinition('run-tests', minimalSubAgents);

    expect(result.content).toContain('npx playwright test');
    expect(result.content).toContain('--reporter=json');
  });

  it('should include JSON report parsing instructions', () => {
    const result = buildTaskDefinition('run-tests', minimalSubAgents);

    expect(result.content).toContain('JSON report');
    expect(result.content).toContain('test-results');
    expect(result.content).toContain('Parse JSON Report');
  });

  it('should include test file selection instructions', () => {
    const result = buildTaskDefinition('run-tests', minimalSubAgents);

    expect(result.content).toContain('.spec.ts');
    expect(result.content).toContain('tests/specs');
    expect(result.content).toContain('@smoke');
  });

  it('should NOT include test-debugger-fixer instructions when not configured', () => {
    const onlyTestRunner: ProjectSubAgent[] = [
      { role: 'test-runner', integration: 'playwright' }
    ];

    // This should fail because test-debugger-fixer is required
    expect(() => {
      buildTaskDefinition('run-tests', onlyTestRunner);
    }).toThrow();
  });

  it('should include test-debugger-fixer instructions when configured', () => {
    const result = buildTaskDefinition('run-tests', minimalSubAgents);

    expect(result.content).toContain('test-debugger-fixer agent');
    expect(result.content).toContain('fix test issues');
    expect(result.content).toContain('[TEST ISSUE]');
  });

  it('should include triage instructions for test failures', () => {
    const result = buildTaskDefinition('run-tests', minimalSubAgents);

    expect(result.content).toContain('Triage Failed Tests');
    expect(result.content).toContain('Product bug');
    expect(result.content).toContain('Test issue');
  });

  it('should include issue tracker instructions when configured', () => {
    const result = buildTaskDefinition('run-tests', fullSubAgents);

    expect(result.content).toContain('Log Product Bugs');
    expect(result.content).toContain('issue-tracker agent');
  });

  it('should include team communication instructions when configured', () => {
    const result = buildTaskDefinition('run-tests', fullSubAgents);

    expect(result.content).toContain('Team Communication');
    expect(result.content).toContain('team-communicator agent');
  });

  it('should NOT include blocker/dependency logic for automated tests', () => {
    const result = buildTaskDefinition('run-tests', minimalSubAgents);

    // Automated tests don't use manual test case dependencies
    expect(result.content).not.toContain('blocker: true');
    expect(result.content).not.toContain('Dependency Graph');
    expect(result.content).not.toContain('TC-001');
  });

  it('should reference best practices guide', () => {
    const result = buildTaskDefinition('run-tests', minimalSubAgents);

    expect(result.content).toContain('testing-best-practices.md');
  });

  it('should have correct frontmatter for automated testing', () => {
    const result = buildTaskDefinition('run-tests', minimalSubAgents);

    expect(result.frontmatter.description).toContain('automated');
    expect(result.frontmatter['allowed-tools']).toContain('Bash');
  });

  it('should derive playwright MCP from both required subagents', () => {
    const result = buildTaskDefinition('run-tests', minimalSubAgents);

    expect(result.requiredMCPs).toContain('playwright');
  });
});
