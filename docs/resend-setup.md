# Resend Email MCP Server Setup Guide

This guide walks you through creating a Resend account and obtaining API credentials for the Bugzy Email integration.

## Prerequisites

- An email address to create a Resend account
- A domain you control (for production), or use Resend's sandbox for testing

## Step 1: Create a Resend Account

1. Go to [Resend](https://resend.com)
2. Click **Sign up** and create an account
3. Verify your email address

## Step 2: Verify a Domain (Production)

For production use, verify a domain you own:

1. In the Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `notifications.yourcompany.com`)
4. Add the DNS records Resend provides:
   - SPF record (TXT)
   - DKIM records (TXT)
   - Optional: DMARC record
5. Click **Verify** once DNS records have propagated (may take up to 48 hours)

### Using the Sandbox (Development)

For testing, you can skip domain verification and use Resend's sandbox:

- Sandbox email: `onboarding@resend.dev`
- Sandbox can only send to your account's email address
- Perfect for development and testing

## Step 3: Generate an API Key

1. In the Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Enter a name (e.g., "Bugzy QA Bot")
4. Select permissions:
   - **Full access** for all features, or
   - **Sending access** for send-only
5. Click **Create**
6. Copy the API key (starts with `re_`)

> **Important**: The API key is only shown once. Save it securely.

## Step 4: Configure Sender Email

Decide which email address to send from:

**With verified domain:**
```bash
RESEND_FROM_EMAIL=bugzy@notifications.yourcompany.com
```

**With sandbox (testing only):**
```bash
RESEND_FROM_EMAIL=onboarding@resend.dev
```

## Step 5: Configure Bugzy

Add the credentials to your `.env` file:

```bash
RESEND_API_KEY=re_123abc456def...
RESEND_FROM_EMAIL=bugzy@yourcompany.com
```

## Step 6: Verify Setup

Test the connection by running a Bugzy task that uses Email:

```bash
bugzy start
# Then use a task that sends notifications
```

## Troubleshooting

### "Invalid API key" Error

**Problem**: API returns 401 Unauthorized

**Solution**:
1. Verify the API key is copied correctly (starts with `re_`)
2. Check there are no extra spaces in the `.env` file
3. Generate a new API key if needed

### "Domain not verified" Error

**Problem**: Cannot send from the specified email address

**Solution**:
1. Verify DNS records are correctly configured
2. Wait for DNS propagation (up to 48 hours)
3. Use sandbox email for testing: `onboarding@resend.dev`

### "You can only send to your own email" Error

**Problem**: Sandbox mode restriction

**Solution**:
- This is expected when using sandbox
- Verify a domain for production use
- Or send test emails only to your account's email

### Emails Going to Spam

**Solution**:
1. Ensure SPF, DKIM, and DMARC records are configured
2. Use a professional sender name
3. Avoid spam trigger words in subject lines
4. Include an unsubscribe link for marketing emails

## API Key Permissions

| Permission | Use Case |
|------------|----------|
| Full access | Development and full control |
| Sending access | Production (recommended) |

## Security Notes

- Never commit your API key to version control
- Store keys in `.env` files that are gitignored
- Use separate API keys for development and production
- Rotate API keys periodically
- Use "Sending access" permission in production for least privilege
- Monitor your sending volume in the Resend dashboard
