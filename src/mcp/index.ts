/**
 * MCP Server Configuration Module
 * Defines MCP server templates and provides configuration builder
 */

/**
 * MCP Server Configuration
 */
export interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
  disabled?: boolean;
}

/**
 * MCP Server Template
 * Defines MCP server configuration (secrets are expanded by Claude Code automatically)
 * - config: Base configuration suitable for local development
 * - containerExtensions: Additional settings merged when target='container'
 * - npmPackages: Package names on npmjs for global installation (array for multiple packages)
 */
export interface MCPServerTemplate {
  provider: string;
  name: string;
  description: string;
  requiresCredentials: boolean;
  npmPackages?: string[];
  config: MCPServerConfig;
  containerExtensions?: Partial<MCPServerConfig>;
}

/**
 * MCP Server Registry
 * Single source of truth for all available MCP servers
 * Note: Environment variables like ${SLACK_BOT_TOKEN} are expanded automatically by Claude Code
 */
export const MCP_SERVERS: Record<string, MCPServerTemplate> = {
  slack: {
    provider: 'slack',
    name: 'Slack',
    description: 'Slack MCP server for messaging and channel operations',
    requiresCredentials: true,
    npmPackages: ['simple-slack-mcp-server'],
    config: {
      command: 'slack-mcp-server',
      args: [],
      env: {
        SLACK_BOT_TOKEN: '${SLACK_ACCESS_TOKEN}',
      },
    },
  },
  teams: {
    provider: 'teams',
    name: 'Microsoft Teams',
    description: 'Microsoft Teams MCP server for messaging via Bot Connector API',
    requiresCredentials: true,
    npmPackages: ['@bugzy-ai/teams-mcp-server'],
    config: {
      command: 'teams-mcp-server',
      args: [],
      env: {
        // Bot credentials (platform-level, from Bugzy's Azure Bot registration)
        TEAMS_BOT_APP_ID: '${TEAMS_BOT_APP_ID}',
        TEAMS_BOT_APP_PASSWORD: '${TEAMS_BOT_APP_PASSWORD}',
        TEAMS_BOT_TENANT_ID: '${TEAMS_BOT_TENANT_ID}',
        // Conversation context (per-project, from stored conversation reference)
        TEAMS_SERVICE_URL: '${TEAMS_SERVICE_URL}',
        TEAMS_CONVERSATION_ID: '${TEAMS_CONVERSATION_ID}',
      },
    },
  },
  notion: {
    provider: 'notion',
    name: 'Notion',
    description: 'Notion MCP server for documentation',
    requiresCredentials: true,
    npmPackages: ['@notionhq/notion-mcp-server'],
    config: {
      command: 'notion-mcp-server',
      args: [],
      env: {
        NOTION_TOKEN: '${NOTION_TOKEN}',
      },
    },
  },
  'jira-server': {
    provider: 'jira-server',
    name: 'Jira Server (On-Prem)',
    description: 'Jira Server MCP via tunnel for on-premise instances',
    requiresCredentials: true,
    npmPackages: ['@mcp-tunnel/wrapper', '@bugzy-ai/jira-mcp-server'],
    config: {
      command: 'mcp-tunnel',
      args: ["--server", "jira-mcp-server"],
      env: {
        ABLY_API_KEY: '${ABLY_API_KEY}',
        TENANT_ID: '${TENANT_ID}',
        JIRA_BASE_URL: '${JIRA_BASE_URL}',
        JIRA_AUTH_TYPE: '${JIRA_AUTH_TYPE}',
        JIRA_PAT: '${JIRA_PAT}',
        JIRA_USERNAME: '${JIRA_USERNAME}',
        JIRA_PASSWORD: '${JIRA_PASSWORD}',
      },
    },
  },
  resend: {
    provider: 'resend',
    name: 'Email (Resend)',
    description: 'Resend MCP server for sending email notifications',
    requiresCredentials: true,
    npmPackages: ['@bugzy-ai/resend-mcp-server'],
    config: {
      command: 'resend-mcp-server',
      args: [],
      env: {
        RESEND_API_KEY: '${RESEND_API_KEY}',
        RESEND_FROM_EMAIL: '${RESEND_FROM_EMAIL}',
      },
    },
  },
  github: {
    provider: 'github',
    name: 'GitHub',
    description: 'GitHub MCP server for PR and commit information',
    requiresCredentials: true,
    npmPackages: ['@bugzy-ai/github-mcp-server'],
    config: {
      command: 'github-mcp-server',
      args: [],
      env: {
        GITHUB_TOKEN: '${GITHUB_TOKEN}',
      },
    },
  },
  'azure-devops': {
    provider: 'azure-devops',
    name: 'Azure DevOps',
    description: 'Azure DevOps MCP server for Work Item Tracking (project specified per-request)',
    requiresCredentials: true,
    npmPackages: ['@bugzy-ai/azure-devops-mcp-server'],
    config: {
      command: 'azure-devops-mcp-server',
      args: [],
      env: {
        AZURE_DEVOPS_ORG_URL: '${AZURE_DEVOPS_ORG_URL}',
        AZURE_DEVOPS_PAT: '${AZURE_DEVOPS_PAT}',
      },
    },
  },
  // asana: CLI-only integration — no MCP server needed.
  // Agent uses `asana-cli task search|create|update|comment` via Bash.
  // Package is installed globally in the container for CLI access.
  // github-modelcontextprotocol: {
  //   provider: 'github',
  //   name: 'GitHub',
  //   description: 'GitHub MCP server for repository operations',
  //   requiresCredentials: true,
  //   config: {
  //     command: 'npx',
  //     args: ['-y', '@modelcontextprotocol/server-github'],
  //     env: {
  //       GITHUB_TOKEN: '${GITHUB_TOKEN}',
  //     },
  //   },
  // },
  // linear: {
  //   provider: 'linear',
  //   name: 'Linear',
  //   description: 'Linear MCP server for issue tracking',
  //   requiresCredentials: true,
  //   config: {
  //     command: 'npx',
  //     args: ['-y', '@modelcontextprotocol/server-linear'],
  //     env: {
  //       LINEAR_API_KEY: '${LINEAR_API_KEY}',
  //     },
  //   },
  // },
  jira: {
    provider: 'jira',
    name: 'Jira Cloud',
    description: 'Jira Cloud MCP server for issue tracking (REST API v3)',
    requiresCredentials: true,
    npmPackages: ['@bugzy-ai/jira-cloud-mcp-server'],
    config: {
      command: 'jira-cloud-mcp-server',
      args: [],
      env: {
        JIRA_CLOUD_TOKEN: '${JIRA_CLOUD_TOKEN}',
        JIRA_CLOUD_ID: '${JIRA_CLOUD_ID}',
      },
    },
  },
  // confluence: {
  //   provider: 'confluence',
  //   name: 'Confluence',
  //   description: 'Confluence MCP server for documentation',
  //   requiresCredentials: true,
  //   config: {
  //     command: 'npx',
  //     args: ['-y', '@modelcontextprotocol/server-confluence'],
  //     env: {
  //       CONFLUENCE_URL: '${CONFLUENCE_URL}',
  //       CONFLUENCE_EMAIL: '${CONFLUENCE_EMAIL}',
  //       CONFLUENCE_API_TOKEN: '${CONFLUENCE_API_TOKEN}',
  //     },
  //   },
  // },
};

/**
 * Build MCP configuration
 * Generates .mcp.json content (secrets are expanded by Claude Code automatically)
 *
 * @param requiredServers - List of MCP server provider names needed
 * @param target - Deployment target: 'container' (default) or 'local'
 *   - 'local': Uses base config only
 *   - 'container': Merges base config + containerExtensions
 * @returns MCP config object ready for deployment
 */
export function buildMCPConfig(
  requiredServers: string[],
  target: 'container' | 'local' = 'container'
): { mcpServers: Record<string, MCPServerConfig> } {
  const mcpServers: Record<string, MCPServerConfig> = {};

  for (const serverName of requiredServers) {
    const template = MCP_SERVERS[serverName];
    if (!template) {
      console.warn(`Unknown MCP server: ${serverName}, skipping`);
      continue;
    }

    // Deep clone the base config to avoid mutating the original
    let config: MCPServerConfig = JSON.parse(JSON.stringify(template.config));

    // Merge container extensions if target is 'container'
    if (target === 'container' && template.containerExtensions) {
      const extensions = template.containerExtensions;

      // Merge args: concatenate extension args to base args
      if (extensions.args && extensions.args.length > 0) {
        config.args = [...config.args, ...extensions.args];
      }

      // Merge env: spread extension env vars into base env
      if (extensions.env) {
        config.env = { ...(config.env || {}), ...extensions.env };
      }
    }

    mcpServers[serverName] = config;
    console.log(`✓ Configured MCP server: ${template.name}`);
  }

  return { mcpServers };
}
