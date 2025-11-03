import { TaskTemplate } from '../../src/tasks/types';

export const sampleTask: TaskTemplate = {
  slug: 'test-task',
  frontmatter: {
    title: 'Test Task',
    description: 'A test task for unit testing',
    requiredSubAgents: ['test-runner'],
    optionalSubAgents: ['team-communicator']
  },
  promptTemplate: (subagents) => `# Test Task Prompt

This is a test task.

${subagents['test-runner']?.block || ''}
${subagents['team-communicator']?.block || ''}

Execute the test task.`
};

export const sampleTaskWithoutOptional: TaskTemplate = {
  slug: 'simple-task',
  frontmatter: {
    title: 'Simple Task',
    description: 'A simple task without optional subagents',
    requiredSubAgents: ['test-runner']
  },
  promptTemplate: (subagents) => `# Simple Task

${subagents['test-runner']?.block || ''}

Execute the simple task.`
};
