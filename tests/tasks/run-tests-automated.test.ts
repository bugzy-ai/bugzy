import { describe, it, expect } from 'vitest';
import { buildTaskDefinition } from '../../src/core/task-builder';
import { replaceInvocationPlaceholders } from '../../src/core/tool-strings';
import type { ProjectSubAgent } from '../../src/core/task-builder';

/**
 * Helper to build task and replace placeholders (simulates final generated content)
 */
function buildAndProcessTask(slug: string, subagents: ProjectSubAgent[]) {
  const task = buildTaskDefinition(slug, subagents);
  return {
    ...task,
    content: replaceInvocationPlaceholders(task.content, 'claude-code'),
  };
}

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

    expect(result.content).toContain('npm test');
    expect(result.content).toContain('Bugzy reporter');
  });

  it('should include test results structure instructions', () => {
    const result = buildTaskDefinition('run-tests', minimalSubAgents);

    expect(result.content).toContain('manifest.json');
    expect(result.content).toContain('test-runs');
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
    const result = buildAndProcessTask('run-tests', minimalSubAgents);

    expect(result.content).toContain('subagent_type: "test-debugger-fixer"');
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
    const result = buildAndProcessTask('run-tests', fullSubAgents);

    expect(result.content).toContain('Log Product Bugs');
    expect(result.content).toContain('subagent_type: "issue-tracker"');
  });

  it('should include team communication instructions when configured', () => {
    const result = buildAndProcessTask('run-tests', fullSubAgents);

    expect(result.content).toContain('Team Communication');
    expect(result.content).toContain('subagent_type: "team-communicator"');
  });

  it('should NOT include blocker/dependency logic for automated tests', () => {
    const result = buildTaskDefinition('run-tests', minimalSubAgents);

    // Automated tests don't use manual test case dependencies
    expect(result.content).not.toContain('blocker: true');
    expect(result.content).not.toContain('Dependency Graph');
  });

  it('should reference best practices guide', () => {
    const result = buildTaskDefinition('run-tests', minimalSubAgents);

    expect(result.content).toContain('testing-best-practices.md');
  });

  it('should have correct frontmatter for automated testing', () => {
    const result = buildTaskDefinition('run-tests', minimalSubAgents);

    expect(result.frontmatter.description).toContain('automated');
    expect(result.frontmatter.description).toBeDefined();
  });

  it('should derive playwright MCP from both required subagents', () => {
    const result = buildTaskDefinition('run-tests', minimalSubAgents);

    expect(result.requiredMCPs).toContain('playwright');
  });
});
