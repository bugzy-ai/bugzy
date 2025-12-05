# Microsoft Teams MCP Server Setup Guide

This guide walks you through creating a Microsoft Entra (Azure AD) application and obtaining an access token for the Bugzy Teams integration.

## Prerequisites

- A Microsoft 365 account with Teams access
- Admin permissions in Microsoft Entra (Azure AD) admin center, or ability to request admin consent
- Access to https://entra.microsoft.com

## Step 1: Register an Application

1. Go to [Microsoft Entra admin center](https://entra.microsoft.com)
2. Navigate to **Identity** > **Applications** > **App registrations**
3. Click **New registration**
4. Enter an application name (e.g., "Bugzy QA Bot")
5. Select **Accounts in this organizational directory only** (Single tenant)
6. Leave Redirect URI blank for now
7. Click **Register**

## Step 2: Configure API Permissions

The Bugzy Teams integration requires specific Microsoft Graph permissions:

1. In your app registration, click **API permissions** in the left sidebar
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Search for and add the following permissions:

| Permission | Purpose |
|------------|---------|
| `Team.ReadBasic.All` | List teams the user has joined |
| `Channel.ReadBasic.All` | List channels in a team |
| `ChannelMessage.Send` | Post messages to channels |
| `ChannelMessage.Read.All` | Read channel message history |

6. Click **Add permissions**

## Step 3: Grant Admin Consent

Some permissions require admin consent:

1. On the **API permissions** page, click **Grant admin consent for [Your Organization]**
2. Click **Yes** to confirm
3. Verify all permissions show a green checkmark under "Status"

> **Note**: If you don't have admin rights, contact your IT administrator to grant consent.

## Step 4: Generate an Access Token

The easiest way to generate a token for testing is using Microsoft Graph Explorer:

1. Go to [Graph Explorer](https://developer.microsoft.com/graph/graph-explorer)
2. Click **Sign in** and authenticate with your Microsoft account
3. Click **Modify permissions** (consent to the required scopes if prompted)
4. Ensure these permissions are enabled:
   - `Team.ReadBasic.All`
   - `Channel.ReadBasic.All`
   - `ChannelMessage.Send`
   - `ChannelMessage.Read.All`
5. Click the **Access token** tab in the response panel
6. Copy the token (starts with `eyJ...`)

> **Warning**: Graph Explorer tokens expire after 1 hour. For production use, implement a proper OAuth flow to refresh tokens automatically.

## Step 5: Configure Bugzy

Add the token to your `.env` file:

```bash
TEAMS_ACCESS_TOKEN=eyJ0eXAiOiJKV1QiLCJub25jZSI6...
```

## Step 6: Verify Setup

Test the connection by running a Bugzy task that uses Teams:

```bash
bugzy start
# Then use /verify-changes-teams
```

## Troubleshooting

### "Insufficient privileges" Error

**Problem**: API returns 403 Forbidden with "Insufficient privileges"

**Solution**:
1. Verify admin consent was granted for all permissions
2. Re-authenticate to get a fresh token with updated permissions
3. Check that your account has Teams access in your organization

### "Access token has expired" Error

**Problem**: API returns 401 Unauthorized

**Solution**:
1. Generate a new token from Graph Explorer
2. Update your `.env` file with the new token
3. For production, implement token refresh logic

### Can't List Teams

**Problem**: Empty response when listing teams

**Solution**:
- Ensure you're a member of at least one Team
- Verify `Team.ReadBasic.All` permission is granted
- Check that you're signed in with the correct account

### Can't Post Messages

**Problem**: Messages fail to send to channels

**Solution**:
- Verify `ChannelMessage.Send` permission is granted
- Ensure you have permission to post in the target channel
- Check that the channel ID is correct

## Token Types

Bugzy currently uses **delegated permissions** with user-context tokens:
- Posts appear as the authenticated user, not a bot
- Token must be refreshed periodically (expires after ~1 hour)
- User must have access to the Teams/channels they want to interact with

## Security Notes

- Never commit your access token to version control
- Store tokens in `.env` files that are gitignored
- Tokens expire after approximately 1 hour
- For production deployments, implement proper OAuth token refresh
- Use separate applications for development and production
- Regularly audit API permissions in Entra admin center
