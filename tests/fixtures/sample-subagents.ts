import { ProjectSubAgent } from '../../src/core/task-builder';

export const sampleSubAgents: ProjectSubAgent[] = [
  {
    role: 'browser-automation',
    integration: 'playwright'
  },
  {
    role: 'test-engineer',
    integration: 'default'
  },
  {
    role: 'team-communicator',
    integration: 'slack'
  },
  {
    role: 'documentation-researcher',
    integration: 'notion'
  }
];

export const minimalSubAgents: ProjectSubAgent[] = [
  {
    role: 'browser-automation',
    integration: 'playwright'
  },
  {
    role: 'test-engineer',
    integration: 'default'
  }
];
