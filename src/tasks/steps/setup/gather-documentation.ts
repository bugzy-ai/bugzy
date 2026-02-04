import type { TaskStep } from '../types';

export const gatherDocumentationStep: TaskStep = {
  id: 'gather-documentation',
  title: 'Gather Project Documentation',
  category: 'setup',
  content: `## Gather Project Documentation

{{INVOKE_DOCUMENTATION_RESEARCHER}} to explore and gather all available project information.

Specifically gather:
- Product specifications and requirements
- User stories and acceptance criteria
- Technical architecture documentation
- API documentation and endpoints
- User roles and permissions
- Business rules and validations
- UI/UX specifications
- Known limitations or constraints
- Existing test documentation
- Bug reports or known issues

The agent will:
1. Check its memory for previously discovered documentation
2. Explore workspace for relevant pages and databases
3. Build comprehensive understanding of the product
4. Return synthesized information about all discovered documentation

Use this information to inform testing strategy and identify comprehensive scenarios.`,
  requiresSubagent: 'documentation-researcher',
  invokesSubagents: ['documentation-researcher'],
  tags: ['setup', 'context', 'documentation'],
};
