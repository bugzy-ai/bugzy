# Subagents Guide

Subagents are specialized AI agents that provide specific capabilities to Bugzy tasks. Each subagent has access to different tools and integrations, allowing tasks to interact with your development workflow.

## Overview

Subagents are configured during `bugzy setup` and automatically injected into tasks that need them. Tasks specify which subagents they require, and Bugzy ensures those subagents are available and configured.

> **Note**: Subagent invocation may vary by tool. For Claude Code, subagents are invoked via the Task tool. For Cursor and Codex (experimental), subagents are invoked via CLI commands.

## Available Subagents

### Test Runner

**Status**: Required
**Role**: `test-runner`
**Model**: Sonnet
**Version**: 1.0.0

**Description**: Execute automated browser tests. This subagent is always included in your configuration.

**Capabilities**:
- Launch browsers (Chromium, Firefox, WebKit)
- Navigate to URLs
- Interact with page elements (click, type, select)
- Take screenshots and record videos
- Wait for elements and conditions
- Execute JavaScript in page context
- Handle authentication and cookies
- Simulate mobile devices

**Available Integrations**:

#### Playwright (Recommended)
- **Provider**: Playwright
- **Type**: Local (no external secrets needed)
- **Installation**: `npm install -g @modelcontextprotocol/server-playwright`
- **Environment Variables**: None required
- **Best For**: Modern web applications, cross-browser testing

**MCP Tools Available**:
- `playwright_navigate` - Navigate to URLs
- `playwright_screenshot` - Capture screenshots
- `playwright_click` - Click elements
- `playwright_fill` - Fill form inputs
- `playwright_evaluate` - Execute JavaScript
- `playwright_select` - Select dropdown options

**Example Usage**:
```
/run-tests for the login flow
```

The Test Runner will:
1. Launch a browser
2. Navigate to your application
3. Execute test steps
4. Capture screenshots on failure
5. Report results

---

### Test Code Generator

**Status**: Required
**Role**: `test-code-generator`
**Model**: Sonnet
**Version**: 1.0.0

**Description**: Generate automated Playwright test scripts and Page Objects. This subagent is always included in your configuration.

**Capabilities**:
- Generate Playwright test scripts from test cases
- Create Page Object patterns for maintainable tests
- Write reusable test utilities and helpers
- Generate test data fixtures
- Create assertions and verification logic
- Structure tests following best practices

**Available Integrations**:

#### Playwright (Recommended)
- **Provider**: Playwright
- **Type**: Local (no external secrets needed)
- **Installation**: `npm install -g @modelcontextprotocol/server-playwright`
- **Environment Variables**: None required
- **Best For**: Generating maintainable, cross-browser test automation

**Example Usage**:
```
/generate-test-cases from the authentication test plan
```

The Test Code Generator will:
1. Read the test plan or requirements
2. Generate Playwright test files
3. Create Page Objects for UI interactions
4. Add proper assertions and wait conditions
5. Structure code for maintainability

---

### Test Debugger & Fixer

**Status**: Required
**Role**: `test-debugger-fixer`
**Model**: Sonnet
**Version**: 1.0.0

**Description**: Debug and fix failing automated tests automatically. This subagent is always included in your configuration.

**Capabilities**:
- Analyze test failure logs and screenshots
- Identify root causes of test failures
- Fix flaky tests and timing issues
- Update selectors for changed UI
- Improve test stability
- Add proper error handling

**Available Integrations**:

#### Playwright (Recommended)
- **Provider**: Playwright
- **Type**: Local (no external secrets needed)
- **Installation**: `npm install -g @modelcontextprotocol/server-playwright`
- **Environment Variables**: None required
- **Best For**: Automatically fixing and stabilizing test suites

**Example Usage**:
```
/run-tests for the checkout flow
```

When tests fail, the Test Debugger & Fixer will:
1. Analyze failure screenshots and traces
2. Identify the root cause (selector change, timing issue, etc.)
3. Apply fixes to the test code
4. Re-run to verify the fix works
5. Update Page Objects if needed

---

### Team Communicator

**Status**: Required (Email fallback)
**Role**: `team-communicator`
**Model**: Sonnet
**Version**: 1.0.0

**Description**: Send notifications and updates to your team via messaging platforms. This subagent is always included - it falls back to Email if Slack/Teams are not configured.

**Capabilities**:
- Post messages to team channels
- Send direct messages
- Format messages with markdown
- Share test results
- Alert team about failures
- Provide status updates

**Available Integrations**:

#### Slack
- **Provider**: Slack
- **Type**: External (requires API token)
- **Installation**: `npm install -g @modelcontextprotocol/server-slack`
- **Environment Variables**:
  ```bash
  SLACK_BOT_TOKEN=xoxb-your-token-here
  ```
- **Setup**: Create a Slack App at [api.slack.com/apps](https://api.slack.com/apps)
- **Required Scopes**: `chat:write`, `channels:read`

**MCP Tools Available**:
- `slack_post_message` - Post messages to channels
- `slack_get_channels` - List available channels
- `slack_get_users` - List team members
- `slack_get_conversations` - Get channel conversations

#### Microsoft Teams
- **Provider**: Microsoft Teams
- **Type**: External (requires OAuth token)
- **Installation**: `npm install -g @bugzy-ai/teams-mcp-server`
- **Environment Variables**:
  ```bash
  TEAMS_ACCESS_TOKEN=eyJ0eXAiOiJKV1QiLCJub25jZSI6...
  ```
- **Setup**: See [Teams Setup Guide](./teams-setup.md)
- **Required Scopes**: `Team.ReadBasic.All`, `Channel.ReadBasic.All`, `ChannelMessage.Send`, `ChannelMessage.Read.All`

**MCP Tools Available**:
- `teams_list_teams` - List teams the user has joined
- `teams_list_channels` - List channels in a team
- `teams_post_message` - Post text/HTML messages to channels
- `teams_post_rich_message` - Post Adaptive Card messages
- `teams_get_channel_history` - Get recent channel messages
- `teams_get_thread_replies` - Get replies to a message

#### Email (Resend)
- **Provider**: Resend
- **Type**: External (requires API key)
- **Installation**: `npm install -g @bugzy-ai/resend-mcp-server`
- **Environment Variables**:
  ```bash
  RESEND_API_KEY=re_your-api-key
  RESEND_FROM_EMAIL=bugzy@yourcompany.com
  ```
- **Setup**: See [Resend Setup Guide](./resend-setup.md)
- **Best For**: Fallback communication when Slack/Teams not configured

**MCP Tools Available**:
- `resend_send_email` - Send email to one or more recipients
- `resend_send_batch_emails` - Send batch emails

**Example Usage**:
```
/verify-changes after running login tests
```

The Team Communicator will:
1. Format test results as a message
2. Post to configured channel (Slack, Teams, or Email)
3. Include screenshots if available
4. Tag relevant team members

---

### Documentation Researcher

**Status**: Optional
**Role**: `documentation-researcher`
**Model**: Sonnet
**Version**: 1.0.0

**Description**: Search and retrieve information from your team's documentation.

**Capabilities**:
- Search documentation by keywords
- Retrieve full page content
- Find API documentation
- Locate feature specifications
- Access requirements
- Read test plans

**Available Integrations**:

#### Notion
- **Provider**: Notion
- **Type**: External (requires API token)
- **Installation**: `npm install -g @modelcontextprotocol/server-notion`
- **Environment Variables**:
  ```bash
  NOTION_TOKEN=secret_your-token-here
  ```
- **Setup**: Create an integration at [notion.so/my-integrations](https://www.notion.so/my-integrations)
- **Best For**: Teams using Notion for documentation

**MCP Tools Available**:
- `notion_search` - Search pages and databases
- `notion_get_page` - Retrieve page content
- `notion_query_database` - Query databases
- `notion_create_page` - Create new pages

**Example Usage**:
```
/generate-test-plan for user authentication

# The Documentation Researcher will:
# 1. Search for "user authentication" in your docs
# 2. Retrieve relevant pages
# 3. Use that context to generate comprehensive test plan
```

---

### Issue Tracker

**Status**: Optional
**Role**: `issue-tracker`
**Model**: Sonnet
**Version**: 1.0.0

**Description**: Automatically create and track bugs and issues in your project management system.

**Capabilities**:
- Create issues/bugs automatically
- Add detailed descriptions
- Attach screenshots
- Set priority and labels
- Assign to team members
- Link to related items

**Available Integrations**:

#### Jira Server
- **Provider**: Jira Server (on-premise)
- **Type**: Custom (via MCP tunnel)
- **Installation**: `npm install -g @bugzy-ai/jira-mcp-server`
- **Environment Variables**:
  ```bash
  JIRA_HOST=your-jira-server.company.com
  JIRA_EMAIL=your-email@company.com
  JIRA_API_TOKEN=your-api-token
  JIRA_PROJECT_KEY=PROJ
  ```
- **Setup**: Requires MCP tunnel for on-premise Jira access
- **Best For**: Enterprise teams using self-hosted Jira Server

**MCP Tools Available**:
- `jira_create_issue` - Create new issues
- `jira_get_projects` - List projects
- `jira_search_issues` - Search issues
- `jira_add_comment` - Add comments to issues

#### Notion (as Issue Tracker)
- **Provider**: Notion
- **Type**: External (requires API token)
- **Environment Variables**:
  ```bash
  NOTION_TOKEN=secret_your-token-here
  NOTION_DATABASE_ID=your-issues-database-id
  ```
- **Best For**: Teams tracking issues in Notion databases

#### Slack (as Issue Tracker)
- **Provider**: Slack
- **Type**: External (requires bot token)
- **Environment Variables**:
  ```bash
  SLACK_BOT_TOKEN=xoxb-your-token-here
  SLACK_CHANNEL_ID=C01234567
  ```
- **Best For**: Lightweight issue tracking via Slack messages

**Example Usage**:
```
/run-tests for checkout flow

# If tests fail, Issue Tracker will:
# 1. Create an issue with failure details
# 2. Attach screenshots
# 3. Add relevant labels (e.g., "bug", "checkout")
# 4. Link to test logs
```

## Configuration

### Initial Setup

Configure subagents during first-time setup:

```bash
bugzy setup
```

You'll be prompted to choose integrations for each subagent role.

### Reconfiguration

Change your subagent configuration anytime:

```bash
bugzy setup
```

The reconfiguration flow shows your current setup and allows you to make changes.

### Configuration File

Bugzy stores your configuration in `.bugzy/config.json`:

```json
{
  "version": "1.0.0",
  "tool": "claude-code",
  "project": {
    "name": "my-project"
  },
  "subagents": {
    "test-runner": "playwright",
    "team-communicator": "slack",
    "documentation-researcher": "notion",
    "issue-tracker": "jira-server"
  }
}
```

The `tool` field specifies your AI coding tool (`claude-code`, `cursor`, or `codex`).

**Do not edit this file manually** - use `bugzy setup` instead.

## How Subagents Work

### Task Requirements

Each task declares which subagents it needs:

```typescript
{
  requiredSubAgents: ['test-runner'],
  optionalSubAgents: ['team-communicator']
}
```

- **Required**: Task cannot run without these subagents
- **Optional**: Task works better with these but can run without them

### Injection into Tasks

When you run a task, Bugzy:

1. Checks which subagents the task needs
2. Verifies those subagents are configured
3. Loads subagent templates from disk
4. Injects subagent blocks into the task prompt
5. Configures MCP servers for those subagents

### Example Task Prompt

Before injection:
```markdown
# Generate Test Plan

Create a comprehensive test plan.
```

After injection with test-runner and team-communicator:
```markdown
# Generate Test Plan

<subagent_blocks>
<test_runner>
# Playwright Test Runner
You have access to browser automation...
</test_runner>

<team_communicator>
# Slack Team Communicator
You can send messages to Slack...
</team_communicator>
</subagent_blocks>

Create a comprehensive test plan.
```

## Best Practices

1. **Start Minimal**: Configure only subagents you'll use immediately
2. **Add Gradually**: Add more subagents as your workflow matures
3. **Test Integrations**: Verify each integration works before adding to production workflow
4. **Document Tokens**: Keep track of which tokens are used for what
5. **Rotate Secrets**: Regularly update API tokens for security

## Troubleshooting

### Subagent Not Available in Task

**Problem**: Task says "Required subagent 'test-runner' not configured"

**Solution**: Run `bugzy setup` and ensure the subagent is configured.

### MCP Server Connection Failed

**Problem**: "Failed to connect to MCP server 'slack'"

**Solution**:
1. Verify the MCP server is installed: `npm list -g | grep slack`
2. Check environment variables are set correctly in `.env`
3. Verify API token has correct permissions

### Wrong Integration Configured

**Problem**: Task expects Notion but you have Confluence configured

**Solution**: Tasks work with any configured integration for a role. If a task specifically needs one integration, it will be noted in the task documentation.

## Next Steps

- Explore [Task Library](./tasks.md) to see which tasks use which subagents
- Review [Configuration Guide](./configuration.md) for environment setup
- Read [Architecture](./architecture.md) to understand the system
