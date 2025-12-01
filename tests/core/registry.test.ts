import { describe, it, expect } from 'vitest';
import { getAgentConfiguration } from '../../src/core/registry';
import { buildTaskDefinition } from '../../src/core/task-builder';
import { sampleSubAgents, minimalSubAgents } from '../fixtures/sample-subagents';

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
