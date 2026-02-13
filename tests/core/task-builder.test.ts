import { describe, it, expect } from 'vitest';
import { buildTaskDefinition } from '../../src/core/task-builder';
import { sampleSubAgents, minimalSubAgents } from '../fixtures/sample-subagents';

describe('buildTaskDefinition', () => {
  it('should build task definition for generate-test-plan', () => {
    const result = buildTaskDefinition('generate-test-plan', sampleSubAgents);

    expect(result.slug).toBe('generate-test-plan');
    expect(result.name).toBe('Generate Test Plan');
    expect(result.content).toBeTruthy();
    expect(result.content.length).toBeGreaterThan(0);
  });

  it('should build task definition with only required subagents', () => {
    const result = buildTaskDefinition('run-tests', minimalSubAgents);

    expect(result.slug).toBe('run-tests');
    expect(result.content).toBeTruthy();
  });

  it('should throw error if required subagent is missing', () => {
    const noSubAgents: any[] = [];

    expect(() => {
      buildTaskDefinition('run-tests', noSubAgents);
    }).toThrow(/requires subagent/);
  });

  it('should throw error for unknown task slug', () => {
    expect(() => {
      buildTaskDefinition('invalid-task', sampleSubAgents);
    }).toThrow(/Unknown task slug/);
  });

  it('should include required subagent roles', () => {
    const result = buildTaskDefinition('run-tests', sampleSubAgents);

    expect(result.requiredSubAgentRoles).toContain('browser-automation');
  });

  it('should work for all valid task slugs', () => {
    const validSlugs = [
      'generate-test-plan',
      'generate-test-cases',
      'explore-application',
      'run-tests',
      'handle-message',
      'process-event',
      'verify-changes',
      'triage-results'
    ];

    for (const slug of validSlugs) {
      const result = buildTaskDefinition(slug, sampleSubAgents);
      expect(result.slug).toBe(slug);
      expect(result.content).toBeTruthy();
    }
  });
});
