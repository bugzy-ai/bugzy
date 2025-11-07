/**
 * Sub-Agents Metadata
 * Client-safe metadata without file system access
 */

/**
 * Integration configuration for sub-agents
 */
export interface SubAgentIntegration {
  id: string;
  name: string;
  provider: string;
  requiredMCP?: string;
  isLocal?: boolean; // True if integration doesn't require external connector (e.g., playwright)
}

/**
 * Sub-Agent Metadata
 */
export interface SubAgentMetadata {
  role: string;
  name: string;
  description: string;
  icon: string; // Icon name (e.g., 'play', 'message-square', 'bot', 'file-search')
  integrations: SubAgentIntegration[];
  model?: string;
  color?: string;
  isRequired?: boolean;
  version: string;
}

/**
 * Available integrations by provider
 */
export const INTEGRATIONS: Record<string, SubAgentIntegration> = {
  linear: {
    id: 'linear',
    name: 'Linear',
    provider: 'linear',
    requiredMCP: 'mcp__linear__*'
  },
  jira: {
    id: 'jira',
    name: 'Jira',
    provider: 'jira',
    requiredMCP: 'mcp__jira__*'
  },
  notion: {
    id: 'notion',
    name: 'Notion',
    provider: 'notion',
    requiredMCP: 'mcp__notion__*'
  },
  confluence: {
    id: 'confluence',
    name: 'Confluence',
    provider: 'confluence',
    requiredMCP: 'mcp__confluence__*'
  },
  slack: {
    id: 'slack',
    name: 'Slack',
    provider: 'slack',
    requiredMCP: 'mcp__slack__*'
  },
  playwright: {
    id: 'playwright',
    name: 'Playwright',
    provider: 'playwright',
    requiredMCP: 'mcp__playwright__*',
    isLocal: true // Playwright runs locally, no external connector needed
  }
};

/**
 * Sub-Agents Registry - metadata only (templates loaded from files)
 */
export const SUBAGENTS: Record<string, SubAgentMetadata> = {
  'test-runner': {
    role: 'test-runner',
    name: 'Test Runner',
    description: 'Execute automated browser tests (always included)',
    icon: 'play',
    integrations: [INTEGRATIONS.playwright],
    model: 'sonnet',
    color: 'green',
    isRequired: true,
    version: '1.0.0'
  },
  'team-communicator': {
    role: 'team-communicator',
    name: 'Team Communicator',
    description: 'Send notifications and updates to your team',
    icon: 'message-square',
    integrations: [INTEGRATIONS.slack],
    model: 'sonnet',
    color: 'blue',
    version: '1.0.0'
  },
  'issue-tracker': {
    role: 'issue-tracker',
    name: 'Issue Tracker',
    description: 'Automatically create and track bugs and issues',
    icon: 'bot',
    integrations: [
      INTEGRATIONS.linear,
      INTEGRATIONS.jira,
      INTEGRATIONS.notion,
      INTEGRATIONS.slack
    ],
    model: 'sonnet',
    color: 'red',
    version: '1.0.0'
  },
  'documentation-researcher': {
    role: 'documentation-researcher',
    name: 'Documentation Researcher',
    description: 'Search and retrieve information from your documentation',
    icon: 'file-search',
    integrations: [INTEGRATIONS.notion, INTEGRATIONS.confluence],
    model: 'sonnet',
    color: 'cyan',
    version: '1.0.0'
  },
  'test-code-generator': {
    role: 'test-code-generator',
    name: 'Test Code Generator',
    description: 'Generate automated Playwright test scripts and Page Objects',
    icon: 'code',
    integrations: [INTEGRATIONS.playwright],
    model: 'sonnet',
    color: 'purple',
    isRequired: true, // Required for automated test generation
    version: '1.0.0'
  },
  'test-debugger-fixer': {
    role: 'test-debugger-fixer',
    name: 'Test Debugger & Fixer',
    description: 'Debug and fix failing automated tests automatically',
    icon: 'wrench',
    integrations: [INTEGRATIONS.playwright],
    model: 'sonnet',
    color: 'yellow',
    isRequired: true, // Required for automated test execution and fixing
    version: '1.0.0'
  }
};

/**
 * Get all available sub-agents
 */
export function getAllSubAgents(): SubAgentMetadata[] {
  return Object.values(SUBAGENTS);
}

/**
 * Get sub-agent by role
 */
export function getSubAgent(role: string): SubAgentMetadata | undefined {
  return SUBAGENTS[role];
}

/**
 * Get integration by ID
 */
export function getIntegration(integrationId: string): SubAgentIntegration | undefined {
  return INTEGRATIONS[integrationId];
}

/**
 * Get required sub-agents (always included)
 */
export function getRequiredSubAgents(): SubAgentMetadata[] {
  return Object.values(SUBAGENTS).filter(agent => agent.isRequired);
}

/**
 * Get optional sub-agents (user can choose)
 */
export function getOptionalSubAgents(): SubAgentMetadata[] {
  return Object.values(SUBAGENTS).filter(agent => !agent.isRequired);
}

/**
 * Map integration ID to display name
 */
export function getIntegrationDisplayName(integrationId: string): string {
  return INTEGRATIONS[integrationId]?.name || integrationId;
}

/**
 * Get required integrations from a list of subagent roles
 */
export function getRequiredIntegrationsFromSubagents(roles: string[]): string[] {
  const integrations = new Set<string>();

  for (const role of roles) {
    const agent = SUBAGENTS[role];
    if (agent?.integrations) {
      agent.integrations.forEach(int => integrations.add(int.id));
    }
  }

  return Array.from(integrations);
}
