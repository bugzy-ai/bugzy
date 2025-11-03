---
name: Run PR Tests
description: Execute automated tests on PR deployment preview
trigger: event
eventType: com.github.deployment_status
filters:
  - jsonPath: $.data.deployment_status.state
    operator: equals
    value: success
  - jsonPath: $.data.deployment.environment
    operator: regex
    value: ^(preview|Preview|production|Production)$
allowed-tools: Read, Bash, Task, Grep, WebFetch
argument-hint: ""
---

# Run Automated Tests on PR Deployment

## SECURITY NOTICE
**CRITICAL**: Never read the `.env` file. It contains ONLY secrets (passwords, API keys).
- **Read `.env.example`** for non-secret environment variables (TEST_BASE_URL, TEST_OWNER_EMAIL, etc.)
- `.env.example` contains actual values for test data, URLs, and non-sensitive configuration
- For secrets: Reference variable names only (TEST_OWNER_PASSWORD) - values are injected at runtime
- The `.env` file access is blocked by settings.json

Execute the full test suite against a PR deployment preview URL when the deployment succeeds.

## Context

This command is triggered automatically when a GitHub deployment status event is received with:
- **Deployment state**: `success`
- **Environment**: `preview`, `Preview`, `production`, or `Production`

### Event Data Structure

The event data will be available in the trigger context:

```json
{
  "eventType": "com.github.deployment_status",
  "event": {
    "id": "...",
    "source": "github://owner/repo",
    "type": "com.github.deployment_status",
    "subject": "deployment/Preview",
    "data": {
      "deployment_status": {
        "state": "success",
        "environment_url": "https://preview-pr-123.vercel.app",
        "target_url": "https://preview-pr-123.vercel.app",
        "description": "Deployment succeeded"
      },
      "deployment": {
        "id": 123456,
        "environment": "Preview",
        "ref": "refs/heads/feature-branch",
        "sha": "abc123..."
      },
      "pull_request": {
        "number": 123,
        "title": "Add new feature",
        "html_url": "https://github.com/owner/repo/pull/123"
      },
      "repository": {
        "full_name": "owner/repo",
        "html_url": "https://github.com/owner/repo"
      },
      "installation": {
        "id": 12345678
      }
    }
  }
}
```

## Task

### Step 1: Extract Preview URL

Extract the preview URL from the event data:
- Primary source: `$.data.deployment_status.environment_url`
- Fallback: `$.data.deployment_status.target_url`

Log the extracted URL and verify it's accessible.

### Step 2: Identify Test Suite

Determine which test suite to run:
1. Check if `.bugzy/test-suite.json` or similar config exists
2. Look for test commands in `package.json` scripts
3. Check for existing test files in the repository:
   - `tests/` directory
   - `__tests__/` directory
   - `*.test.ts` or `*.spec.ts` files

### Step 3: Run Tests Against Preview URL

Execute the appropriate test suite with the preview URL:

```bash
# Example for Playwright/Puppeteer tests
BASE_URL=<preview-url> npm run test:e2e

# Example for Cypress
CYPRESS_BASE_URL=<preview-url> npm run test:cypress

# Example for custom test runner
TEST_URL=<preview-url> npm test
```

Capture:
- Test output (stdout/stderr)
- Exit code (success/failure)
- Number of tests passed/failed
- Duration

### Step 4: Parse Test Results

Extract key information from test output:
- **Total tests**: How many tests ran
- **Passed**: Number of successful tests
- **Failed**: Number of failed tests
- **Skipped**: Number of skipped tests
- **Duration**: Total execution time
- **Failed test details**: Names and error messages for failed tests

### Step 5: Report Results to GitHub PR

Use GitHub integration tools to update the PR:

#### Create Check Run

Create or update a GitHub check run with:
- **Name**: "PR Tests / Deployment Preview"
- **Status**: `completed`
- **Conclusion**: `success` (all passed) or `failure` (any failed)
- **Summary**: "X/Y tests passed in Zs"
- **Details**: Failed test names and error messages

#### Post PR Comment

Post a comment to the PR with test results:

```markdown
## 🧪 Automated Test Results

**Deployment**: {environment} - [View Preview]({preview_url})

### Summary
- ✅ **{passed}** tests passed
- ❌ **{failed}** tests failed
- ⏭️ **{skipped}** tests skipped
- ⏱️ Duration: **{duration}**

{failed_tests_section}

---
🤖 Automated by Bugzy AI • [View Logs]({logs_url})
```

### Step 6: Handle Errors

If tests fail to run (not fail results, but execution errors):
1. Log the error clearly
2. Post a PR comment indicating test execution failed
3. Do NOT mark check run as failed - mark as `action_required` or `neutral`

## Important Considerations

### GitHub Tool Access

Use the GitHub MCP integration tools available in the execution environment:
- `github.create_check_run()` - Create/update check runs
- `github.create_issue_comment()` - Post PR comments
- `github.get_pull_request()` - Get PR details

### Test Environment Variables

Ensure the preview URL is passed to tests via environment variables. Common patterns:
- `BASE_URL`
- `APP_URL`
- `CYPRESS_BASE_URL`
- `PLAYWRIGHT_BASE_URL`
- `TEST_URL`

Check the repository's test configuration to determine the correct variable name.

### Timeout Handling

Tests may take several minutes. Ensure:
- Reasonable timeout (5-10 minutes)
- Progress logging so users know tests are running
- Graceful handling if timeout is reached

### Concurrent Runs

This task may be triggered for multiple PRs simultaneously. Each execution is isolated per project, so no coordination is needed.

## Example Output

After successful execution, the PR should show:
1. ✅ Green check run status
2. 💬 Comment with detailed test results
3. 📊 Clear pass/fail metrics

This provides immediate feedback to developers on PR quality.
