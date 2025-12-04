# Slack MCP Server Setup Guide

This guide walks you through creating a Slack App and obtaining a bot token for the Bugzy Slack integration.

## Prerequisites

- A Slack workspace where you have admin permissions (or can request app installation)
- Access to https://api.slack.com/apps

## Step 1: Create a Slack App

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click **Create New App**
3. Choose **From scratch**
4. Enter an app name (e.g., "Bugzy QA Bot")
5. Select your workspace
6. Click **Create App**

## Step 2: Configure Bot Token Scopes

The Bugzy Slack integration requires specific permissions to function:

1. In the left sidebar, click **OAuth & Permissions**
2. Scroll down to **Scopes** section
3. Under **Bot Token Scopes**, click **Add an OAuth Scope** and add:

| Scope | Purpose |
|-------|---------|
| `channels:read` | List public channels in the workspace |
| `chat:write` | Post messages to channels the bot is in |
| `chat:write.public` | Post messages to any public channel |
| `reactions:write` | Add emoji reactions to messages |
| `channels:history` | Read message history (optional, for context) |

## Step 3: Install the App

1. Scroll to the top of the **OAuth & Permissions** page
2. Click **Install to Workspace**
3. Review the permissions and click **Allow**
4. You'll be redirected back with your bot token

## Step 4: Copy the Bot Token

After installation, you'll see:

- **Bot User OAuth Token** (starts with `xoxb-`)

Copy this token - you'll need it for your `.env` file.

## Step 5: Configure Bugzy

Add the token to your `.env` file:

```bash
SLACK_ACCESS_TOKEN=xoxb-your-token-here
```

## Step 6: Invite the Bot to Channels

The bot can only access channels it has been explicitly added to:

1. Open Slack and go to the channel you want the bot to access
2. Click the channel name at the top
3. Go to **Integrations** tab
4. Click **Add apps**
5. Find and add your Bugzy app

Repeat for each channel the bot needs access to.

## Troubleshooting

### "missing_scope" Error
If you see this error, you need to add more scopes:
1. Go back to **OAuth & Permissions**
2. Add the missing scope
3. Reinstall the app to your workspace

### Bot Can't Post to Channel
- Ensure the bot has been added to the channel (Step 6)
- Verify `chat:write` scope is enabled
- For public channels, ensure `chat:write.public` is enabled

### Can't List Channels
- Verify `channels:read` scope is enabled
- The bot can only see public channels unless invited to private ones

## Token Types

Bugzy uses **Bot Tokens** (`xoxb-*`), which:
- Act as the bot user, not a specific person
- Have permissions defined by OAuth scopes
- Work independently of any user's Slack session

**User Tokens** (`xoxp-*`) are not currently supported but may be added in future versions for features requiring user-level permissions.

## Security Notes

- Never commit your Slack token to version control
- Store tokens in `.env` files that are gitignored
- Rotate tokens periodically via the Slack API dashboard
- Use separate apps for development and production workspaces
