/**
 * Environment Template Generator
 * Generate .env.example with required secrets
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Generate .env.example file with required secrets
 * @param mcpServers - List of MCP server names needed
 */
export async function generateEnvExample(mcpServers: string[]): Promise<void> {
  const cwd = process.cwd();
  const envExamplePath = path.join(cwd, '.env.example');

  const header = `# ============================================
# Bugzy OSS - Environment Variables
# ============================================
# Copy this file to .env and fill in your values
# Never commit .env to version control!

# --------------------------------------------
# MCP Server Secrets
# --------------------------------------------
`;

  const footer = `
# --------------------------------------------
# Test Data & Configuration
# --------------------------------------------

# Application under test
TEST_BASE_URL=http://localhost:3000

# Test user credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=

# Admin credentials
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=

# Other test data
TEST_TIMEOUT=30000
TEST_HEADLESS=false
`;

  // Build MCP secrets section
  let mcpSection = '';

  for (const server of mcpServers) {
    const config = getMCPEnvConfig(server);
    if (config) {
      mcpSection += config + '\n';
    }
  }

  const content = header + mcpSection + footer;
  fs.writeFileSync(envExamplePath, content, 'utf-8');
}

/**
 * Get environment variable configuration for an MCP server
 * @param serverName - Name of the MCP server
 * @returns Environment variable template or undefined
 */
function getMCPEnvConfig(serverName: string): string | undefined {
  const configs: Record<string, string> = {
    slack: `
# Slack MCP Server
# Get your token from: https://api.slack.com/apps
SLACK_ACCESS_TOKEN=`,

    notion: `
# Notion MCP Server
# Get your token from: https://www.notion.so/my-integrations
NOTION_TOKEN=`,

    linear: `
# Linear MCP Server
# Get your API key from: https://linear.app/settings/api
LINEAR_API_KEY=`,

    jira: `
# Jira MCP Server
# Get your credentials from: https://id.atlassian.com/manage-profile/security/api-tokens
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=
JIRA_API_TOKEN=`,

    confluence: `
# Confluence MCP Server
# Get your credentials from: https://id.atlassian.com/manage-profile/security/api-tokens
CONFLUENCE_URL=https://your-domain.atlassian.net/wiki
CONFLUENCE_EMAIL=
CONFLUENCE_API_TOKEN=`,

    github: `
# GitHub MCP Server
# Get your token from: https://github.com/settings/tokens
GITHUB_TOKEN=`,

    // Playwright has no required env vars (runs locally)
  };

  return configs[serverName];
}
