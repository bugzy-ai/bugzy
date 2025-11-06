import { ProjectSubAgent } from '../../src/core/task-builder';

export const sampleSubAgents: ProjectSubAgent[] = [
  {
    role: 'test-runner',
    integration: 'playwright'
  },
  {
    role: 'team-communicator',
    integration: 'slack'
  },
  {
    role: 'documentation-researcher',
    integration: 'notion'
  },
  {
    role: 'test-code-generator',
    integration: 'playwright'
  }
];

export const minimalSubAgents: ProjectSubAgent[] = [
  {
    role: 'test-runner',
    integration: 'playwright'
  },
  {
    role: 'test-code-generator',
    integration: 'playwright'
  }
];
