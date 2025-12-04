# Notion MCP Server Setup Guide

This guide walks you through creating a Notion integration and obtaining an access token for the Bugzy Notion integration.

## Prerequisites

- A Notion workspace where you have admin permissions
- Access to https://www.notion.so/my-integrations

## Step 1: Create an Internal Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click **New integration**
3. Enter an integration name (e.g., "Bugzy QA")
4. Select the workspace you want to connect
5. Click **Submit**

## Step 2: Configure Capabilities

After creating the integration, configure its capabilities:

1. In the **Capabilities** section, ensure these are enabled:

| Capability | Purpose |
|------------|---------|
| Read content | Search and read pages and databases |
| Update content | Update existing pages (for issue tracking) |
| Insert content | Create new pages and database entries |
| Read comments | Access page comments (optional) |

2. Click **Save changes**

## Step 3: Copy the Integration Token

1. Go to the **Secrets** section of your integration
2. Click **Show** next to the Internal Integration Secret
3. Copy the token (starts with `ntn_` or `secret_`)

## Step 4: Configure Bugzy

Add the token to your `.env` file:

```bash
NOTION_TOKEN=ntn_your-token-here
```

## Step 5: Share Content with the Integration

**This step is critical** - Notion integrations can only access pages and databases that have been explicitly shared with them.

### Share a Page or Database:

1. Open the Notion page or database you want Bugzy to access
2. Click **Share** in the top right corner
3. In the "Invite" field, search for your integration name (e.g., "Bugzy QA")
4. Click on the integration to add it
5. Click **Invite**

### Important Notes:

- Share the **parent page** to give access to all child pages
- For issue tracking, share the **database** you want to use
- For documentation research, share your **documentation root page**
- Integrations inherit access to child pages of shared parents

## Troubleshooting

### "object_not_found" Error
The page or database hasn't been shared with the integration:
1. Open the page/database in Notion
2. Click **Share** and add your integration
3. Verify the integration appears in the share list

### "unauthorized" or "invalid_token" Error
- Verify the token was copied correctly (no extra spaces)
- Check that the token starts with `ntn_` or `secret_`
- Regenerate the token if needed from the integration settings

### Can't Find Content in Search
- Ensure the content's parent page is shared with the integration
- Check that "Read content" capability is enabled
- Wait a few seconds after sharing for permissions to propagate

### Can't Create Database Entries
- Verify "Insert content" capability is enabled
- Ensure the specific database is shared with the integration
- Check that database properties match expected types

## Integration Types

Bugzy uses **Internal Integrations**, which:
- Work only within a single workspace
- Access only explicitly shared content
- Use tokens that start with `ntn_` (newer) or `secret_` (older)

**Public Integrations** (OAuth-based) are used when building apps for distribution and require a different setup flow.

## Security Notes

- Never commit your Notion token to version control
- Store tokens in `.env` files that are gitignored
- Share only the specific pages/databases needed
- Regularly audit which pages are shared with integrations
- Revoke and regenerate tokens if compromised
