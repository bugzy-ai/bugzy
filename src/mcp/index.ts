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
 */
export interface MCPServerTemplate {
  provider: string;
  name: string;
  description: string;
  requiresCredentials: boolean;
  config: MCPServerConfig;
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
    config: {
      command: 'slack-mcp-server',
      args: [],
      env: {
        SLACK_BOT_TOKEN: '${SLACK_ACCESS_TOKEN}',
      },
    },
  },
  playwright: {
    provider: 'playwright',
    name: 'Playwright',
    description: 'Playwright MCP server for browser automation',
    requiresCredentials: false,
    config: {
      command: 'mcp-server-playwright',
      args: [
        '--browser',
        'chromium',
        '--secrets',
        '.env',
        '--headless',
        '--no-sandbox',
        '--viewport-size',
        '1280x720',
        '--save-video',
        '1280x720'
      ],
      env: {},
    },
  },
  notion: {
    provider: 'notion',
    name: 'Notion',
    description: 'Notion MCP server for documentation',
    requiresCredentials: true,
    config: {
      command: 'notion-mcp-server',
      args: [],
      env: {
        NOTION_TOKEN: '${NOTION_TOKEN}',
      },
    },
  },
  // github: {
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
  // jira: {
  //   provider: 'jira',
  //   name: 'Jira',
  //   description: 'Jira MCP server for issue tracking',
  //   requiresCredentials: true,
  //   config: {
  //     command: 'npx',
  //     args: ['-y', '@modelcontextprotocol/server-jira'],
  //     env: {
  //       JIRA_URL: '${JIRA_URL}',
  //       JIRA_EMAIL: '${JIRA_EMAIL}',
  //       JIRA_API_TOKEN: '${JIRA_API_TOKEN}',
  //     },
  //   },
  // },
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
 * Build MCP configuration for Cloud Run
 * Generates .mcp.json content (secrets are expanded by Claude Code automatically)
 *
 * @param requiredServers - List of MCP server provider names needed
 * @returns MCP config object ready for Cloud Run API
 */
export function buildMCPConfig(
  requiredServers: string[]
): { mcpServers: Record<string, MCPServerConfig> } {
  const mcpServers: Record<string, MCPServerConfig> = {};

  for (const serverName of requiredServers) {
    const template = MCP_SERVERS[serverName];
    if (!template) {
      console.warn(`Unknown MCP server: ${serverName}, skipping`);
      continue;
    }

    mcpServers[serverName] = template.config;
    console.log(`✓ Configured MCP server: ${template.name}`);
  }

  return { mcpServers };
}
