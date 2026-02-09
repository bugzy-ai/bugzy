/**
 * Verify Changes - Unified Multi-Trigger Task (Composed)
 * Single dynamic task that handles all trigger sources: manual, Slack, GitHub PR, CI/CD
 *
 * This task replaces verify-changes-manual and verify-changes-slack with intelligent
 * trigger detection and multi-channel output routing.
 */

import type { ComposedTaskTemplate } from '../steps/types';
import { TASK_SLUGS } from '../constants';

export const verifyChangesTask: ComposedTaskTemplate = {
  slug: TASK_SLUGS.VERIFY_CHANGES,
  name: 'Verify Changes',
  description: 'Unified verification command for all trigger sources with automated tests and manual checklists',

  frontmatter: {
    description: 'Verify code changes with automated tests and manual verification checklists',
    'argument-hint': '[trigger-auto-detected]',
  },

  steps: [
    // Step 1: Overview (inline)
    {
      inline: true,
      title: 'Verify Changes Overview',
      content: `# Verify Changes - Unified Multi-Trigger Workflow

## Overview

This task performs comprehensive change verification with:
- **Automated testing**: Execute Playwright tests with automatic triage and fixing
- **Manual verification checklists**: Generate role-specific checklists for non-automatable scenarios
- **Multi-trigger support**: Works from manual CLI, Slack messages, GitHub PRs, and CI/CD
- **Smart output routing**: Results formatted and delivered to the appropriate channel`,
    },
    // Step 2: Security Notice (library)
    'security-notice',
    // Step 3: Arguments (inline)
    {
      inline: true,
      title: 'Arguments',
      content: `**Input**: $ARGUMENTS

The input format determines the trigger source and context extraction strategy.`,
    },
    // Step 4: Load Project Context (library)
    'load-project-context',
    // Step 5: Knowledge Base Read (library)
    'read-knowledge-base',
    // Step 5: Detect Trigger Source (inline)
    {
      inline: true,
      title: 'Detect Trigger Source',
      content: `Analyze the input format to determine how this task was invoked:

### Identify Trigger Type

**GitHub PR Webhook:**
- Input contains \`pull_request\` object with structure:
  \`\`\`json
  {
    "pull_request": {
      "number": 123,
      "title": "...",
      "body": "...",
      "changed_files": [...],
      "base": { "ref": "main" },
      "head": { "ref": "feature-branch" },
      "user": { "login": "..." }
    }
  }
  \`\`\`
-> **Trigger detected: GITHUB_PR**

**Slack Event:**
- Input contains \`event\` object with structure:
  \`\`\`json
  {
    "eventType": "com.slack.message" or "com.slack.app_mention",
    "event": {
      "type": "message",
      "channel": "C123456",
      "user": "U123456",
      "text": "message content",
      "ts": "1234567890.123456",
      "thread_ts": "..." (optional)
    }
  }
  \`\`\`
-> **Trigger detected: SLACK_MESSAGE**

**CI/CD Environment:**
- Environment variables present:
  - \`CI=true\`
  - \`GITHUB_REF\` (e.g., "refs/heads/feature-branch")
  - \`GITHUB_SHA\` (commit hash)
  - \`GITHUB_BASE_REF\` (base branch)
  - \`GITHUB_HEAD_REF\` (head branch)
- Git context available via bash commands
-> **Trigger detected: CI_CD**

**Manual Invocation:**
- Input is natural language, URL, or issue identifier
- Patterns: "PR #123", GitHub URL, "PROJ-456", feature description
-> **Trigger detected: MANUAL**

### Store Trigger Context

Store the detected trigger for use in output routing:
- Set variable: \`TRIGGER_SOURCE\` = [GITHUB_PR | SLACK_MESSAGE | CI_CD | MANUAL]
- This determines output formatting and delivery channel`,
    },
    // Step 6: Clarification Protocol (library)
    'clarification-protocol',
    // Step 7: Extract Context (inline)
    {
      inline: true,
      title: 'Extract Context Based on Trigger',
      content: `Based on the detected trigger source, extract relevant context:

### GitHub PR Trigger - Extract PR Details

If trigger is GITHUB_PR:
- **PR number**: \`pull_request.number\`
- **Title**: \`pull_request.title\`
- **Description**: \`pull_request.body\`
- **Changed files**: \`pull_request.changed_files\` (array of file paths)
- **Author**: \`pull_request.user.login\`
- **Base branch**: \`pull_request.base.ref\`
- **Head branch**: \`pull_request.head.ref\`

### Slack Message Trigger - Parse Natural Language

If trigger is SLACK_MESSAGE:
- **Message text**: \`event.text\`
- **Channel**: \`event.channel\` (for posting results)
- **User**: \`event.user\` (requester)
- **Thread**: \`event.thread_ts\` or \`event.ts\` (for threading replies)

**Extract references from text:**
- PR numbers: "#123", "PR 123", "pull request 123"
- Issue IDs: "PROJ-456", "BUG-123"
- URLs: GitHub PR links, deployment URLs
- Feature names: Quoted terms, capitalized phrases
- Environments: "staging", "production", "preview"

### CI/CD Trigger - Read CI Environment

If trigger is CI_CD:
- **CI platform**: Read \`CI\` env var
- **Branch**: \`GITHUB_REF\` -> extract branch name
- **Commit**: \`GITHUB_SHA\`
- **Base branch**: \`GITHUB_BASE_REF\` (for PRs)
- **Changed files**: Run \`git diff --name-only $BASE_SHA...$HEAD_SHA\`

### Manual Trigger - Parse User Input

If trigger is MANUAL:
- **GitHub PR URL**: Parse to extract PR number, then fetch details via API
- **Issue identifier**: Extract issue ID (patterns: "PROJ-123", "#456", "BUG-789")
- **Feature description**: Use text as-is for verification context
- **Deployment URL**: Extract for testing environment

### Unified Context Structure

After extraction, create unified context structure:
\`\`\`
CHANGE_CONTEXT = {
  trigger: [GITHUB_PR | SLACK_MESSAGE | CI_CD | MANUAL],
  title: "...",
  description: "...",
  changedFiles: ["src/pages/Login.tsx", ...],
  author: "...",
  environment: "staging" | "production" | URL,
  prNumber: 123 (if available),
  issueId: "PROJ-456" (if available),
  slackChannel: "C123456" (if Slack trigger),
  slackThread: "1234567890.123456" (if Slack trigger),
  githubRepo: "owner/repo" (if GitHub trigger)
}
\`\`\``,
    },
    // Step 6b: Retrieve Code Change Details (conditional - changelog-historian)
    {
      inline: true,
      title: 'Retrieve Code Change Details',
      content: `{{INVOKE_CHANGELOG_HISTORIAN}} to gather comprehensive context about recent code changes:

Explore version control history related to the verification scope.

Specifically gather:
- Recent changes merged to the target branch
- Change authors and contributors
- Scope and impact of each change
- Change descriptions and rationale
- Related issues or tickets
- Files and components affected

The agent will:
1. Check its memory for previously discovered repository context
2. Explore version control for relevant changes
3. Build comprehensive understanding of the change history
4. Return synthesized change information

Use this information to:
- Identify which changes may have caused test failures
- Understand the scope and risk of the changes
- Enhance the verification report with change attribution
- Provide better context for manual verification checklist`,
      conditionalOnSubagent: 'changelog-historian',
    },
    // Step 7: Determine Test Scope (inline)
    {
      inline: true,
      title: 'Determine Test Scope (Smart Selection)',
      content: `**IMPORTANT**: You do NOT have access to code files. Infer test scope from change **descriptions** only.

Based on PR title, description, and commit messages, intelligently select which tests to run:

### Infer Test Scope from Change Descriptions

Analyze the change description to identify affected feature areas:

**Example mappings from descriptions to test suites:**

| Description Keywords | Inferred Test Scope | Example |
|---------------------|-------------------|---------|
| "login", "authentication", "sign in/up" | \`tests/specs/auth/\` | "Fix login page validation" -> Auth tests |
| "checkout", "payment", "purchase" | \`tests/specs/checkout/\` | "Optimize checkout flow" -> Checkout tests |
| "cart", "shopping cart", "add to cart" | \`tests/specs/cart/\` | "Update cart calculations" -> Cart tests |
| "API", "endpoint", "backend" | API test suites | "Add new user API endpoint" -> User API tests |
| "profile", "account", "settings" | \`tests/specs/profile/\` or \`tests/specs/settings/\` | "Profile page redesign" -> Profile tests |

**Inference strategy:**
1. **Extract feature keywords** from PR title and description
2. **Analyze commit messages** for conventional commit scopes
3. **Map keywords to test organization**
4. **Identify test scope breadth from description tone**

### Fallback Strategies Based on Description Analysis

**Description patterns that indicate full suite:**
- "Refactor shared/common utilities" (wide impact)
- "Update dependencies" or "Upgrade framework" (safety validation)
- "Merge main into feature" or "Sync with main" (comprehensive validation)
- "Breaking changes" or "Major version update" (thorough testing)
- "Database migration" or "Schema changes" (data integrity)

**Description patterns that indicate smoke tests only:**
- "Fix typo" or "Update copy/text" (cosmetic change)
- "Update README" or "Documentation only" (no functional change)
- "Fix formatting" or "Linting fixes" (no logic change)

**When description is vague or ambiguous:**
- **ACTION REQUIRED**: Use AskUserQuestion tool to clarify test scope

**If specific test scope requested:**
- User can override with: "only smoke tests", "full suite", specific test suite names
- Honor user's explicit scope over smart selection

### Test Selection Summary

Generate summary of test selection based on description analysis:
\`\`\`markdown
### Test Scope Determined
- **Change description**: [PR title or summary]
- **Identified keywords**: [list extracted keywords: "auth", "checkout", etc.]
- **Affected test suites**: [list inferred test suite paths or names]
- **Scope reasoning**: [explain why this scope was selected]
- **Execution strategy**: [smart selection | full suite | smoke tests | user-specified]
\`\`\``,
    },
    // Step 7b: Create Tests for Coverage Gaps (conditional - test-code-generator)
    {
      inline: true,
      title: 'Create Tests for Coverage Gaps',
      content: `If the test scope analysis found that existing tests do NOT cover the changed feature:

### Identify Coverage Gaps

Compare:
- **Changed feature**: What the Jira issue / PR describes
- **Existing tests**: What test specs already exist in tests/specs/

If there are NO automated tests covering the new/changed feature:

### Create Manual Test Cases

Create or update test case files in \`./test-cases/\` for the new feature:
- One file per test scenario (e.g., \`test-cases/TC-XXX-checkout-improved.md\`)
- Include: objective, preconditions, test steps, expected results
- Mark \`automated: true\` for scenarios that should be automated

### Handle Missing Test Data

If the Jira issue or PR references test accounts/data (e.g., TEST_PREMIUM_USER, TEST_ADMIN_PASSWORD) that don't exist in \`.env.testdata\`:

1. **DO NOT skip test creation** — missing data is not a blocker for writing tests
2. Add placeholder entries to \`.env.testdata\` for non-secret variables (empty value with comment)
3. Reference all variables as \`process.env.VAR_NAME\` in test code — they'll resolve at runtime
4. Create the test cases and specs normally — tests may fail until data is configured, which is expected
5. {{INVOKE_TEAM_COMMUNICATOR}} to notify the team about missing test data that needs to be configured
6. Include in the Slack message: which variables are missing, what values they need, and which tests depend on them

**CRITICAL**: Never conclude "manual verification required" or "BLOCKED" solely because test data is missing. Always create the test artifacts first.

### Generate Playwright Specs

{{INVOKE_TEST_CODE_GENERATOR}} to create automated test specs:
- Read the manual test cases you just created
- Explore the feature in the browser to discover selectors and flows
- Create Page Objects in \`./tests/pages/\` if needed
- Create test specs in \`./tests/specs/\` matching the test cases
- Run each new test to verify it passes
- Update the manual test case with \`automated_test\` reference

### If Tests Already Cover the Feature

Skip this step — proceed directly to running existing tests.`,
      conditionalOnSubagent: 'test-code-generator',
    },
    // Step 8-11: Test Execution (library steps)
    'run-playwright-tests',
    'parse-test-results',
    'triage-failures',
    'fix-test-issues',
    // Step 12: Log Product Bugs (conditional library step)
    {
      stepId: 'log-product-bugs',
      conditionalOnSubagent: 'issue-tracker',
    },
    // Step 13: Generate Manual Verification Checklist (inline)
    {
      inline: true,
      title: 'Generate Manual Verification Checklist',
      content: `Generate human-readable checklist for non-automatable scenarios:

### Analyze Change Context

Review the provided context to understand what changed:
- Read PR title, description, and commit messages
- Identify change types from descriptions: visual, UX, forms, mobile, accessibility, edge cases
- Understand the scope and impact of changes from the change descriptions

### Identify Non-Automatable Scenarios

Based on the change analysis, identify scenarios that require human verification:

**1. Visual Design Changes** (CSS, styling, design files, graphics)
-> Add **Design Validation** checklist items

**2. UX Interaction Changes** (animations, transitions, gestures, micro-interactions)
-> Add **UX Feel** checklist items

**3. Form and Input Changes** (new form fields, input validation, user input)
-> Add **Accessibility** checklist items

**4. Mobile and Responsive Changes** (media queries, touch interactions, viewport)
-> Add **Mobile Experience** checklist items

**5. Low ROI or Rare Scenarios** (edge cases, one-time migrations, rare user paths)
-> Add **Exploratory Testing** notes

### Generate Role-Specific Checklist Items

For each identified scenario, create clear, actionable checklist items:

**Format for each item:**
- Clear, specific task description
- Assigned role (@design-team, @qa-team, @a11y-team, @mobile-team)
- Acceptance criteria (what constitutes pass/fail)
- Reference to standards when applicable (WCAG, iOS HIG, Material Design)
- Priority indicator (red circle critical, yellow circle important, green circle nice-to-have)

**Example checklist items:**

**Design Validation (@design-team)**
- [ ] Login button color matches brand guidelines (#FF6B35)
- [ ] Loading spinner animation smooth (60fps, no jank)

**Accessibility (@a11y-team)**
- [ ] Screen reader announces form errors clearly (tested with VoiceOver/NVDA)
- [ ] Keyboard navigation: Tab through all interactive elements in logical order
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for body text, 3:1 for large text)

**Mobile Experience (@qa-team, @mobile-team)**
- [ ] Touch targets greater than or equal to 44px (iOS Human Interface Guidelines)
- [ ] Mobile keyboard doesn't obscure input fields on iOS/Android

### When NO Manual Verification Needed

If the changes are purely:
- Backend logic (no UI changes)
- Code refactoring (no behavior changes)
- Configuration changes (no user-facing impact)
- Fully covered by automated tests

Output:
\`\`\`markdown
**Manual Verification:** Not required for this change.
All user-facing changes are fully covered by automated tests.
\`\`\``,
    },
    // Step 14: Aggregate Results (inline)
    {
      inline: true,
      title: 'Aggregate Verification Results',
      content: `Combine automated and manual verification results:

\`\`\`markdown
## Verification Results Summary

### Automated Tests
- Total tests: [count]
- Passed: [count] ([percentage]%)
- Failed: [count] ([percentage]%)
- Test issues fixed: [count]
- Product bugs logged: [count]
- Duration: [time]

### Manual Verification Required
[Checklist generated in previous step, or "Not required"]

### Overall Recommendation
[Safe to merge | Review bugs before merging | Do not merge]
\`\`\``,
    },
    // Step 14b: Post Results to Slack (conditional on team-communicator)
    {
      inline: true,
      title: 'Post Results to Team Channel',
      content: `**IMPORTANT — Do this NOW before proceeding to any other step.**

{{INVOKE_TEAM_COMMUNICATOR}} to post the verification results summary to the team Slack channel.

Include in the message:
- What was verified (issue ID and feature name)
- Test results (total / passed / failed)
- New tests created (list file names)
- Manual verification items count
- Overall recommendation (safe to merge / review / block)
- Any blocking issues or critical findings`,
      conditionalOnSubagent: 'team-communicator',
    },
    // Step 15: Documentation Research (conditional library step)
    {
      stepId: 'gather-documentation',
      conditionalOnSubagent: 'documentation-researcher',
    },
    // Step 16: Report Results (inline)
    {
      inline: true,
      title: 'Report Results (Multi-Channel Output)',
      content: `Route output based on trigger source:

### MANUAL Trigger -> Terminal Output

Format as comprehensive markdown report for terminal display with:
- Change Summary (what changed, scope, affected files)
- Automated Test Results (statistics, tests fixed, bugs logged)
- Manual Verification Checklist
- Recommendation (safe to merge / review / do not merge)
- Test Artifacts (JSON report, HTML report, traces, screenshots)

### SLACK_MESSAGE Trigger -> Thread Reply

{{INVOKE_TEAM_COMMUNICATOR}} to post concise results to Slack thread with:
- Verification results summary
- Critical failures that need immediate attention
- Bugs logged with issue tracker links
- Manual verification checklist summary
- Recommendation and next steps
- Tag relevant team members for critical issues

### GITHUB_PR Trigger -> PR Comment

Use GitHub API to post comprehensive comment on PR with:
- Status (All tests passed / Issues found / Critical failures)
- Automated Tests table (Total, Passed, Failed, Fixed, Bugs, Duration)
- Failed Tests (triaged and with actions taken)
- Tests Fixed Automatically (issue, fix, verified)
- Product Bugs Logged (issue ID, title, test, severity)
- Manual Verification Required (checklist)
- Test Artifacts links
- Recommendation

### CI_CD Trigger -> Build Log + PR Comment

Output to CI build log (print detailed results to stdout) and exit with appropriate code:
- Exit 0: All tests passed (safe to merge)
- Exit 1: Tests failed or critical bugs found (block merge)

Post PR comment if GitHub context available.`,
      conditionalOnSubagent: 'team-communicator',
    },
    // Step 17: Knowledge Base Update (library)
    'update-knowledge-base',
    // Step 18: Handle Special Cases (inline)
    {
      inline: true,
      title: 'Handle Special Cases',
      content: `**If no tests found for changed files:**
- Inform user: "No automated tests found for changed files"
- Recommend: "Run smoke test suite for basic validation"
- Still generate manual verification checklist

**If all tests skipped:**
- Explain why (dependencies, environment issues)
- Recommend: Check test configuration and prerequisites

**If test execution fails:**
- Report specific error (Playwright not installed, env vars missing)
- Suggest troubleshooting steps
- Don't proceed with triage if tests didn't run

## Important Notes

- This task handles **all trigger sources** with a single unified workflow
- Trigger detection is automatic based on input format
- Output is automatically routed to the appropriate channel
- Automated tests are executed with **full triage and automatic fixing**
- Manual verification checklists are generated for **non-automatable scenarios**
- Product bugs are logged with **automatic duplicate detection**
- Test issues are fixed automatically with **verification**
- Results include both automated and manual verification items

## Success Criteria

A successful verification includes:
1. Trigger source correctly detected
2. Context extracted completely
3. Tests executed (or skipped with explanation)
4. All failures triaged (product bug vs test issue)
5. Test issues fixed automatically (when possible)
6. Product bugs logged to issue tracker
7. Manual verification checklist generated
8. Results formatted for output channel
9. Results delivered to appropriate destination
10. Clear recommendation provided (merge / review / block)`,
    },
  ],

  requiredSubagents: ['test-runner', 'test-debugger-fixer'],
  optionalSubagents: ['documentation-researcher', 'issue-tracker', 'team-communicator', 'changelog-historian', 'test-code-generator'],
  dependentTasks: [],
};
