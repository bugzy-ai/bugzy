import { describe, it, expect } from 'vitest';
import { getAgentConfiguration } from '../../src/core/registry';
import { buildTaskDefinition } from '../../src/core/task-builder';
import { sampleSubAgents, minimalSubAgents } from '../fixtures/sample-subagents';
import { FULL_SUBAGENTS_CONFIG } from '../fixtures/repo-configs';

describe('getAgentConfiguration', () => {
  it('should return configuration for valid task slug', async () => {
    const taskDefinition = buildTaskDefinition('generate-test-plan', sampleSubAgents);
    const config = await getAgentConfiguration([taskDefinition], sampleSubAgents);

    expect(config).toBeDefined();
    expect(config.mcpConfig).toBeDefined();
    expect(config.slashCommands).toBeDefined();
    expect(config.subagents).toBeDefined();
  });

  it('should work with minimal subagents', async () => {
    const taskDefinition = buildTaskDefinition('run-tests', minimalSubAgents);
    const config = await getAgentConfiguration([taskDefinition], minimalSubAgents);

    expect(config.slashCommands['run-tests']).toBeDefined();
    expect(config.slashCommands['run-tests'].content).toBeTruthy();
  });

  it('should work for all valid task slugs', async () => {
    const validSlugs = [
      'generate-test-plan',
      'generate-test-cases',
      'explore-application',
      'run-tests',
      'handle-message',
      'process-event',
      'verify-changes'
    ];

    for (const slug of validSlugs) {
      const taskDefinition = buildTaskDefinition(slug, sampleSubAgents);
      const config = await getAgentConfiguration([taskDefinition], sampleSubAgents);

      expect(config.slashCommands[slug]).toBeDefined();
    }
  });
});

describe('getAgentConfiguration - INVOKE placeholder replacement', () => {
  it('should replace {{INVOKE_*}} placeholders with Claude Code strings', async () => {
    // run-tests task contains {{INVOKE_TEST_DEBUGGER_FIXER}} in its content
    const taskDefinition = buildTaskDefinition('run-tests', sampleSubAgents);
    const config = await getAgentConfiguration([taskDefinition], sampleSubAgents);

    const content = config.slashCommands['run-tests'].content;

    // Should contain Claude Code invocation string
    expect(content).toContain('Use the test-debugger-fixer subagent');

    // Should NOT contain raw placeholder
    expect(content).not.toContain('{{INVOKE_TEST_DEBUGGER_FIXER}}');
  });

  it('should not have any {{INVOKE_*}} placeholders remaining in any task', async () => {
    const validSlugs = [
      'generate-test-plan',
      'generate-test-cases',
      'explore-application',
      'run-tests',
      'handle-message',
      'process-event',
      'verify-changes'
    ];

    for (const slug of validSlugs) {
      const taskDefinition = buildTaskDefinition(slug, FULL_SUBAGENTS_CONFIG);
      const config = await getAgentConfiguration([taskDefinition], FULL_SUBAGENTS_CONFIG);

      const content = config.slashCommands[slug].content;
      const invokeMatches = content.match(/\{\{INVOKE_[A-Z_]+\}\}/g);

      expect(invokeMatches, `Task ${slug} should have no {{INVOKE_*}} placeholders`).toBeNull();
    }
  });

  it('verify-changes should have all INVOKE placeholders replaced', async () => {
    // verify-changes has many placeholders:
    // {{INVOKE_TEST_DEBUGGER_FIXER}}, {{INVOKE_ISSUE_TRACKER}},
    // {{INVOKE_TEAM_COMMUNICATOR}}, {{INVOKE_DOCUMENTATION_RESEARCHER}}
    const taskDefinition = buildTaskDefinition('verify-changes', FULL_SUBAGENTS_CONFIG);
    const config = await getAgentConfiguration([taskDefinition], FULL_SUBAGENTS_CONFIG);

    const content = config.slashCommands['verify-changes'].content;

    // Should contain Claude Code invocation strings (not raw placeholders)
    expect(content).toContain('Use the test-debugger-fixer subagent');
    expect(content).toContain('Use the issue-tracker subagent');
    expect(content).toContain('Use the team-communicator subagent');
    expect(content).toContain('Use the documentation-researcher subagent');
  });

  it('generate-test-cases should replace INVOKE_TEST_CODE_GENERATOR', async () => {
    const taskDefinition = buildTaskDefinition('generate-test-cases', FULL_SUBAGENTS_CONFIG);
    const config = await getAgentConfiguration([taskDefinition], FULL_SUBAGENTS_CONFIG);

    const content = config.slashCommands['generate-test-cases'].content;

    // Should contain Claude Code invocation string
    expect(content).toContain('Use the test-code-generator subagent');

    // Should NOT contain raw placeholder
    expect(content).not.toContain('{{INVOKE_TEST_CODE_GENERATOR}}');
  });
});
