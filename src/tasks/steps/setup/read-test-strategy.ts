import type { TaskStep } from '../types';

export const readTestStrategyStep: TaskStep = {
  id: 'read-test-strategy',
  title: 'Read Test Execution Strategy',
  category: 'setup',
  content: `## Read Test Execution Strategy

**IMPORTANT**: Before selecting tests, read \`./tests/docs/test-execution-strategy.md\` to understand:
- Available test tiers (Smoke, Component, Full Regression)
- When to use each tier (commit, PR, release, debug)
- Default behavior (default to @smoke unless user specifies otherwise)
- How to interpret user intent from context keywords
- Time/coverage trade-offs
- Tag taxonomy

Apply the strategy guidance when determining which tests to run.

**First**, consult \`./tests/docs/test-execution-strategy.md\` decision tree to determine appropriate test tier based on user's selector and context.`,
  tags: ['setup', 'test-execution', 'strategy'],
};
