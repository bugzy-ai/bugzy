/**
 * Environment Template Generator
 * Generate .env.example with required secrets
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Generate .env.example file with required secrets
 * Also creates .env if it doesn't exist (so users can fill it in directly)
 * @param mcpServers - List of MCP server names needed
 */
export async function generateEnvExample(mcpServers: string[]): Promise<void> {
  const cwd = process.cwd();
  const envExamplePath = path.join(cwd, '.env.example');
  const envPath = path.join(cwd, '.env');

  const header = `# ============================================
# Bugzy OSS - Environment Variables
# ============================================
# Fill in your values below
# Never commit .env to version control!

# --------------------------------------------
# MCP Server Secrets
# --------------------------------------------
`;

  const testDataSecretsSection = `
# --------------------------------------------
# Test Data Secrets
# --------------------------------------------
# Add passwords and sensitive test credentials here
# Non-secret test data (URLs, emails) goes in .env.testdata

# Example test user passwords:
# TEST_OWNER_PASSWORD=
# TEST_ADMIN_PASSWORD=
# TEST_API_KEY=
`;

  // Build MCP secrets section
  let mcpSection = '';

  for (const server of mcpServers) {
    const config = getMCPEnvConfig(server);
    if (config) {
      mcpSection += config + '\n';
    }
  }

  const content = header + mcpSection + testDataSecretsSection;

  // Always update .env.example (reference template)
  fs.writeFileSync(envExamplePath, content, 'utf-8');

  // Create .env if it doesn't exist (so users can fill it in directly)
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, content, 'utf-8');
  }
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
# Setup guide: https://github.com/bugzy-ai/bugzy/blob/main/docs/slack-setup.md
# Required scopes: channels:read, chat:write, chat:write.public, reactions:write
SLACK_ACCESS_TOKEN=`,

    notion: `
# Notion MCP Server
# Setup guide: https://github.com/bugzy-ai/bugzy/blob/main/docs/notion-setup.md
# Requires: Internal Integration Token (ntn_* or secret_*)
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

    teams: `
# Microsoft Teams MCP Server
# Setup guide: https://github.com/bugzy-ai/bugzy/blob/main/docs/teams-setup.md
# Required Graph API scopes: Team.ReadBasic.All, Channel.ReadBasic.All, ChannelMessage.Send, ChannelMessage.Read.All
TEAMS_ACCESS_TOKEN=`,

    resend: `
# Resend Email MCP Server
# Setup guide: https://github.com/bugzy-ai/bugzy/blob/main/docs/resend-setup.md
# Get your API key from: https://resend.com/api-keys
RESEND_API_KEY=
RESEND_FROM_EMAIL=`,

    // Playwright has no required env vars (runs locally)
  };

  return configs[serverName];
}
