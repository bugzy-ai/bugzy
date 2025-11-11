/**
 * Verify Changes - Unified Multi-Trigger Task
 * Single dynamic task that handles all trigger sources: manual, Slack, GitHub PR, CI/CD
 *
 * This task replaces verify-changes-manual and verify-changes-slack with intelligent
 * trigger detection and multi-channel output routing.
 */

import { TaskTemplate } from '../types';
import { TASK_SLUGS } from '../constants';

export const verifyChangesTask: TaskTemplate = {
  slug: TASK_SLUGS.VERIFY_CHANGES,
  name: 'Verify Changes',
  description: 'Unified verification command for all trigger sources with automated tests and manual checklists',

  frontmatter: {
    description: 'Verify code changes with automated tests and manual verification checklists',
    'argument-hint': '[trigger-auto-detected]',
  },

  baseContent: `# Verify Changes - Unified Multi-Trigger Workflow

## SECURITY NOTICE
**CRITICAL**: Never read the \`.env\` file. It contains ONLY secrets (passwords, API keys).
- **Read \`.env.testdata\`** for non-secret environment variables (TEST_BASE_URL, TEST_OWNER_EMAIL, etc.)
- \`.env.testdata\` contains actual values for test data, URLs, and non-sensitive configuration
- For secrets: Reference variable names only (TEST_OWNER_PASSWORD) - values are injected at runtime
- The \`.env\` file access is blocked by settings.json

## Overview

This task performs comprehensive change verification with:
- **Automated testing**: Execute Playwright tests with automatic triage and fixing
- **Manual verification checklists**: Generate role-specific checklists for non-automatable scenarios
- **Multi-trigger support**: Works from manual CLI, Slack messages, GitHub PRs, and CI/CD
- **Smart output routing**: Results formatted and delivered to the appropriate channel

## Arguments

**Input**: \$ARGUMENTS

The input format determines the trigger source and context extraction strategy.

## Step 1: Detect Trigger Source

Analyze the input format to determine how this task was invoked:

### 1.1 Identify Trigger Type

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
→ **Trigger detected: GITHUB_PR**

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
→ **Trigger detected: SLACK_MESSAGE**

**CI/CD Environment:**
- Environment variables present:
  - \`CI=true\`
  - \`GITHUB_REF\` (e.g., "refs/heads/feature-branch")
  - \`GITHUB_SHA\` (commit hash)
  - \`GITHUB_BASE_REF\` (base branch)
  - \`GITHUB_HEAD_REF\` (head branch)
- Git context available via bash commands
→ **Trigger detected: CI_CD**

**Manual Invocation:**
- Input is natural language, URL, or issue identifier
- Patterns: "PR #123", GitHub URL, "PROJ-456", feature description
→ **Trigger detected: MANUAL**

### 1.2 Store Trigger Context

Store the detected trigger for use in Step 6 (output routing):
- Set variable: \`TRIGGER_SOURCE\` = [GITHUB_PR | SLACK_MESSAGE | CI_CD | MANUAL]
- This determines output formatting and delivery channel

## Step 2: Extract Context Based on Trigger

Based on the detected trigger source, extract relevant context:

### 2.1 GitHub PR Trigger - Extract PR Details

If trigger is GITHUB_PR:
- **PR number**: \`pull_request.number\`
- **Title**: \`pull_request.title\`
- **Description**: \`pull_request.body\`
- **Changed files**: \`pull_request.changed_files\` (array of file paths)
- **Author**: \`pull_request.user.login\`
- **Base branch**: \`pull_request.base.ref\`
- **Head branch**: \`pull_request.head.ref\`

Optional: Fetch additional details via GitHub API if needed (PR comments, reviews)

### 2.2 Slack Message Trigger - Parse Natural Language

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

### 2.3 CI/CD Trigger - Read CI Environment

If trigger is CI_CD:
- **CI platform**: Read \`CI\` env var
- **Branch**: \`GITHUB_REF\` → extract branch name
- **Commit**: \`GITHUB_SHA\`
- **Base branch**: \`GITHUB_BASE_REF\` (for PRs)
- **Changed files**: Run \`git diff --name-only $BASE_SHA...$HEAD_SHA\`

If in PR context, can also fetch PR number from CI env vars (e.g., \`GITHUB_EVENT_PATH\`)

### 2.4 Manual Trigger - Parse User Input

If trigger is MANUAL:
- **GitHub PR URL**: Parse to extract PR number, then fetch details via API
  - Pattern: \`https://github.com/owner/repo/pull/123\`
  - Extract: owner, repo, PR number
  - Fetch: PR details, diff, comments
- **Issue identifier**: Extract issue ID
  - Patterns: "PROJ-123", "#456", "BUG-789"
- **Feature description**: Use text as-is for verification context
- **Deployment URL**: Extract for testing environment

### 2.5 Unified Context Structure

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

  // For output routing:
  slackChannel: "C123456" (if Slack trigger),
  slackThread: "1234567890.123456" (if Slack trigger),
  githubRepo: "owner/repo" (if GitHub trigger)
}
\`\`\`

## Step 3: Determine Test Scope (Smart Selection)

**IMPORTANT**: You do NOT have access to code files. Infer test scope from change **descriptions** only.

Based on PR title, description, and commit messages, intelligently select which tests to run:

### 3.1 Infer Test Scope from Change Descriptions

Analyze the change description to identify affected feature areas:

**Example mappings from descriptions to test suites:**

| Description Keywords | Inferred Test Scope | Example |
|---------------------|-------------------|---------|
| "login", "authentication", "sign in/up" | \`tests/specs/auth/\` | "Fix login page validation" → Auth tests |
| "checkout", "payment", "purchase" | \`tests/specs/checkout/\` | "Optimize checkout flow" → Checkout tests |
| "cart", "shopping cart", "add to cart" | \`tests/specs/cart/\` | "Update cart calculations" → Cart tests |
| "API", "endpoint", "backend" | API test suites | "Add new user API endpoint" → User API tests |
| "profile", "account", "settings" | \`tests/specs/profile/\` or \`tests/specs/settings/\` | "Profile page redesign" → Profile tests |

**Inference strategy:**
1. **Extract feature keywords** from PR title and description
   - PR title: "feat(checkout): Add PayPal payment option"
   - Keywords: ["checkout", "payment"]
   - Inferred scope: Checkout tests

2. **Analyze commit messages** for conventional commit scopes
   - \`feat(auth): Add password reset flow\` → Auth tests
   - \`fix(cart): Resolve quantity update bug\` → Cart tests

3. **Map keywords to test organization**
   - Reference: Tests are organized by feature under \`tests/specs/\` (see \`.bugzy/runtime/testing-best-practices.md\`)
   - Feature areas typically include: auth/, checkout/, cart/, profile/, api/, etc.

4. **Identify test scope breadth from description tone**
   - "Fix typo in button label" → Narrow scope (smoke tests)
   - "Refactor shared utility functions" → Wide scope (full suite)
   - "Update single component styling" → Narrow scope (component tests)

### 3.2 Fallback Strategies Based on Description Analysis

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
- Examples: "Updated several components", "Various bug fixes", "Improvements"
- **ACTION REQUIRED**: Use AskUserQuestion tool to clarify test scope
- Provide options based on available test suites:
  \`\`\`typescript
  AskUserQuestion({
    questions: [{
      question: "The change description is broad. Which test suites should run?",
      header: "Test Scope",
      multiSelect: true,
      options: [
        { label: "Auth tests", description: "Login, signup, password reset" },
        { label: "Checkout tests", description: "Purchase flow, payment processing" },
        { label: "Full test suite", description: "Run all tests for comprehensive validation" },
        { label: "Smoke tests only", description: "Quick validation of critical paths" }
      ]
    }]
  })
  \`\`\`

**If specific test scope requested:**
- User can override with: "only smoke tests", "full suite", specific test suite names
- Honor user's explicit scope over smart selection

### 3.3 Test Selection Summary

Generate summary of test selection based on description analysis:
\`\`\`markdown
### Test Scope Determined
- **Change description**: [PR title or summary]
- **Identified keywords**: [list extracted keywords: "auth", "checkout", etc.]
- **Affected test suites**: [list inferred test suite paths or names]
- **Scope reasoning**: [explain why this scope was selected]
- **Execution strategy**: [smart selection | full suite | smoke tests | user-specified]
\`\`\`

**Example summary:**
\`\`\`markdown
### Test Scope Determined
- **Change description**: "feat(checkout): Add PayPal payment option"
- **Identified keywords**: checkout, payment, PayPal
- **Affected test suites**: tests/specs/checkout/payment.spec.ts, tests/specs/checkout/purchase-flow.spec.ts
- **Scope reasoning**: Change affects checkout payment processing; running all checkout tests to validate payment integration
- **Execution strategy**: Smart selection (checkout suite)
\`\`\`

## Step 4: Run Verification Workflow

Execute comprehensive verification combining automated tests and manual checklists:

### 4A: Automated Testing (Integrated from /run-tests)

Execute automated Playwright tests with full triage and fixing:

#### 4A.1 Execute Tests

Run the selected tests via Playwright:
\`\`\`bash
npx playwright test [scope] --reporter=json --output=test-results/
\`\`\`

Wait for execution to complete. Capture JSON report from \`test-results/.last-run.json\`.

#### 4A.2 Parse Test Results

Read and analyze the JSON report:
- Extract: Total, passed, failed, skipped counts
- For each failed test: file path, test name, error message, stack trace, trace file
- Calculate: Pass rate, total duration

#### 4A.3 Triage Failures (Classification)

#### Automatic Test Issue Fixing

For each test classified as **[TEST ISSUE]**, use the test-debugger-fixer agent to automatically fix the test:

\`\`\`
Use the test-debugger-fixer agent to fix test issues:

For each failed test classified as a test issue (not a product bug), provide:
- Test file path: [from JSON report]
- Test name/title: [from JSON report]
- Error message: [from JSON report]
- Stack trace: [from JSON report]
- Trace file path: [if available]

The agent will:
1. Read the failing test file
2. Analyze the failure details
3. Open browser via Playwright MCP to debug if needed
4. Identify the root cause (brittle selector, missing wait, race condition, etc.)
5. Apply appropriate fix to the test code
6. Rerun the test to verify the fix
7. Repeat up to 3 times if needed
8. Report success or escalate as likely product bug

After test-debugger-fixer completes:
- If fix succeeded: Mark test as fixed, add to "Tests Fixed" list
- If still failing after 3 attempts: Reclassify as potential product bug
\`\`\`

**Track Fixed Tests:**
- Maintain list of tests fixed automatically
- Include fix description (e.g., "Updated selector from CSS to role-based")
- Note verification status (test now passes)
- Reference .bugzy/runtime/testing-best-practices.md for best practices

For each failed test, classify as:
- **[PRODUCT BUG]**: Correct test code, but application behaves incorrectly
- **[TEST ISSUE]**: Test code needs fixing (selector, timing, assertion)

Classification guidelines:
- Product Bug: Expected behavior not met, functional issue
- Test Issue: Selector not found, timeout, race condition, brittle locator

#### 4A.4 Fix Test Issues Automatically

For tests classified as [TEST ISSUE]:
- Use test-debugger-fixer agent to analyze and fix
- Agent debugs with browser if needed
- Applies fix (selector update, wait condition, assertion correction)
- Reruns test to verify fix (10x for flaky tests)
- Max 3 fix attempts, then reclassify as product bug

Track fixed tests with:
- Test file path
- Fix description
- Verification status (now passes)

#### 4A.5 Log Product Bugs

{{ISSUE_TRACKER_INSTRUCTIONS}}

For tests classified as [PRODUCT BUG]:
- Use issue-tracker agent to create bug reports
- Agent checks for duplicates automatically
- Creates detailed report with:
  - Title, description, reproduction steps
  - Test reference, error details, stack trace
  - Screenshots, traces, environment details
  - Severity based on test type and impact
- Returns issue ID for tracking

### 4B: Manual Verification Checklist (NEW)

Generate human-readable checklist for non-automatable scenarios:

#### Generate Manual Verification Checklist

Analyze the code changes and generate a manual verification checklist for scenarios that cannot be automated.

#### Analyze Change Context

Review the provided context to understand what changed:
- Read PR title, description, and commit messages
- Identify change types from descriptions: visual, UX, forms, mobile, accessibility, edge cases
- Understand the scope and impact of changes from the change descriptions

#### Identify Non-Automatable Scenarios

Based on the change analysis, identify scenarios that require human verification:

**1. Visual Design Changes** (CSS, styling, design files, graphics)
- Color schemes, gradients, shadows
- Typography, font sizes, line heights
- Spacing, margins, padding, alignment
- Visual consistency across components
- Brand guideline compliance
→ Add **Design Validation** checklist items

**2. UX Interaction Changes** (animations, transitions, gestures, micro-interactions)
- Animation smoothness (60fps expectation)
- Transition timing and easing
- Interaction responsiveness and feel
- Loading states and skeleton screens
- Hover effects, focus states
→ Add **UX Feel** checklist items

**3. Form and Input Changes** (new form fields, input validation, user input)
- Screen reader compatibility
- Keyboard navigation (Tab order, Enter to submit)
- Error message clarity and placement
- Color contrast (WCAG 2.1 AA: 4.5:1 ratio for text)
- Focus indicators visibility
→ Add **Accessibility** checklist items

**4. Mobile and Responsive Changes** (media queries, touch interactions, viewport)
- Touch target sizes (≥44px iOS, ≥48dp Android)
- Responsive layout breakpoints
- Mobile keyboard behavior (doesn't obscure inputs)
- Swipe gestures and touch interactions
- Pinch-to-zoom functionality
→ Add **Mobile Experience** checklist items

**5. Low ROI or Rare Scenarios** (edge cases, one-time migrations, rare user paths)
- Scenarios used by < 1% of users
- Complex multi-system integrations
- One-time data migrations
- Leap year, DST, timezone edge cases
→ Add **Exploratory Testing** notes

**6. Cross-Browser Visual Consistency** (layout rendering differences)
- Layout consistency across Chrome, Firefox, Safari
- CSS feature support differences
- Font rendering variations
→ Add **Cross-Browser** checklist items (if significant visual changes)

#### Generate Role-Specific Checklist Items

For each identified scenario, create clear, actionable checklist items:

**Format for each item:**
- Clear, specific task description
- Assigned role (@design-team, @qa-team, @a11y-team, @mobile-team)
- Acceptance criteria (what constitutes pass/fail)
- Reference to standards when applicable (WCAG, iOS HIG, Material Design)
- Priority indicator (🔴 critical, 🟡 important, 🟢 nice-to-have)

**Example checklist items:**

**Design Validation (@design-team)**
- [ ] 🔴 Login button color matches brand guidelines (#FF6B35)
- [ ] 🟡 Loading spinner animation smooth (60fps, no jank)
- [ ] 🟡 Card shadows match design system (elevation-2: 0 2px 4px rgba(0,0,0,0.1))
- [ ] 🟢 Hover states provide appropriate visual feedback

**Accessibility (@a11y-team)**
- [ ] 🔴 Screen reader announces form errors clearly (tested with VoiceOver/NVDA)
- [ ] 🔴 Keyboard navigation: Tab through all interactive elements in logical order
- [ ] 🔴 Color contrast meets WCAG 2.1 AA (4.5:1 for body text, 3:1 for large text)
- [ ] 🟡 Focus indicators visible on all interactive elements

**Mobile Experience (@qa-team, @mobile-team)**
- [ ] 🔴 Touch targets ≥44px (iOS Human Interface Guidelines)
- [ ] 🔴 Mobile keyboard doesn't obscure input fields on iOS/Android
- [ ] 🟡 Swipe gestures work naturally without conflicts
- [ ] 🟡 Responsive layout adapts properly on iPhone SE (smallest screen)

**UX Feel (@design-team, @qa-team)**
- [ ] 🟡 Page transitions smooth and not jarring
- [ ] 🟡 Button click feedback immediate (< 100ms perceived response)
- [ ] 🟢 Loading states prevent confusion during data fetch

**Exploratory Testing (@qa-team)**
- [ ] 🟢 Test edge case: User submits form during network timeout
- [ ] 🟢 Test edge case: User navigates back during submission

#### Format for Output Channel

Adapt the checklist format based on the output channel (determined by trigger source):

**Terminal (Manual Trigger):**
\`\`\`markdown
MANUAL VERIFICATION CHECKLIST:
Please verify the following before merging:

Design Validation (@design-team):
  [ ] 🔴 Checkout button colors match brand guidelines (#FF6B35)
  [ ] 🟡 Loading spinner animation smooth (60fps)

Accessibility (@a11y-team):
  [ ] 🔴 Screen reader announces error messages
  [ ] 🔴 Keyboard navigation works (Tab order logical)
  [ ] 🔴 Color contrast meets WCAG 2.1 AA (4.5:1 ratio)

Mobile Experience (@qa-team):
  [ ] 🔴 Touch targets ≥44px (iOS HIG)
  [ ] 🟡 Responsive layout works on iPhone SE
\`\`\`

**Slack (Slack Trigger):**
\`\`\`markdown
*Manual Verification Needed:*
□ Visual: Button colors, animations (60fps)
□ Mobile: Touch targets ≥44px
□ A11y: Screen reader, keyboard nav, contrast

cc @design-team @qa-team @a11y-team
\`\`\`

**GitHub PR Comment (GitHub Trigger):**
\`\`\`markdown
### Manual Verification Required

The following scenarios require human verification before release:

#### Design Validation (@design-team)
- [ ] 🔴 Checkout button colors match brand guidelines (#FF6B35)
- [ ] 🟡 Loading spinner animation smooth (60fps)
- [ ] 🟡 Card shadows match design system

#### Accessibility (@a11y-team)
- [ ] 🔴 Screen reader announces error messages (VoiceOver/NVDA)
- [ ] 🔴 Keyboard navigation through all form fields (Tab order)
- [ ] 🔴 Color contrast meets WCAG 2.1 AA (4.5:1 for body text)

#### Mobile Experience (@qa-team)
- [ ] 🔴 Touch targets ≥44px (iOS Human Interface Guidelines)
- [ ] 🔴 Mobile keyboard doesn't obscure input fields
- [ ] 🟡 Responsive layout works on iPhone SE (375x667)

---
*Legend: 🔴 Critical • 🟡 Important • 🟢 Nice-to-have*
\`\`\`

#### Guidelines for Quality Checklists

**DO:**
- Make each item verifiable (clear pass/fail criteria)
- Include context (why this needs manual verification)
- Reference standards (WCAG, iOS HIG, Material Design)
- Assign to specific roles
- Prioritize items (critical, important, nice-to-have)
- Be specific (not "check colors" but "Login button color matches #FF6B35")

**DON'T:**
- Create vague items ("test thoroughly")
- List items that can be automated
- Skip role assignments
- Forget acceptance criteria
- Omit priority indicators

#### When NO Manual Verification Needed

If the changes are purely:
- Backend logic (no UI changes)
- Code refactoring (no behavior changes)
- Configuration changes (no user-facing impact)
- Fully covered by automated tests

Output:
\`\`\`markdown
**Manual Verification:** Not required for this change.
All user-facing changes are fully covered by automated tests.
\`\`\`

#### Summary

After generating the checklist:
- Count total items by priority (🔴 critical, 🟡 important, 🟢 nice-to-have)
- Estimate time needed (e.g., "~30 minutes for design QA, ~45 minutes for accessibility testing")
- Suggest who should perform each category of checks

### 4C: Aggregate Results

Combine automated and manual verification results:

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
[Checklist generated in 4B, or "Not required"]

### Overall Recommendation
[✅ Safe to merge | ⚠️ Review bugs before merging | ❌ Do not merge]
\`\`\`

## Step 5: Understanding the Change (Documentation Research)

{{DOCUMENTATION_RESEARCHER_INSTRUCTIONS}}

Before proceeding with test creation or execution, ensure requirements are clear through ambiguity detection and adaptive exploration.

**Note**: For detailed exploration and clarification protocols, refer to the complete instructions below. Adapt the depth of exploration based on requirement clarity and use the clarification protocol to detect ambiguity, assess severity, and seek clarification when needed.

After clarification and exploration, analyze the change to determine the verification approach:

### 5.1 Identify Test Scope
Based on the change description, exploration findings, and clarified requirements:
- **Direct impact**: Which features/functionality are directly modified
- **Indirect impact**: What else might be affected (dependencies, integrations)
- **Regression risk**: Existing functionality that should be retested
- **New functionality**: Features that need new test coverage

### 5.2 Determine Verification Strategy
Plan your testing approach based on validated requirements:
- **Priority areas**: Critical paths that must work
- **Test types needed**: Functional, regression, integration, UI/UX
- **Test data requirements**: What test accounts, data, or scenarios needed
- **Success criteria**: What determines the change is working correctly (now clearly defined)

## Step 6: Report Results (Multi-Channel Output)

Route output based on trigger source (from Step 1):

### 6.1 MANUAL Trigger → Terminal Output

Format as comprehensive markdown report for terminal display:

\`\`\`markdown
# Test Verification Report

## Change Summary
- **What Changed**: [Brief description]
- **Scope**: [Affected features/areas]
- **Changed Files**: [count] files

## Automated Test Results
### Statistics
- Total Tests: [count]
- Passed: [count] ([percentage]%)
- Failed: [count]
- Test Issues Fixed: [count]
- Product Bugs Logged: [count]
- Duration: [time]

### Tests Fixed Automatically
[For each fixed test:
- **Test**: [file path] › [test name]
- **Issue**: [problem found]
- **Fix**: [what was changed]
- **Status**: ✅ Now passing
]

### Product Bugs Logged
[For each bug:
- **Issue**: [ISSUE-123] [Bug title]
- **Test**: [test file] › [test name]
- **Severity**: [priority]
- **Link**: [issue tracker URL]
]

## Manual Verification Checklist

[Insert checklist from Step 4B]

## Recommendation
[✅ Safe to merge - all automated tests pass, complete manual checks before release]
[⚠️ Review bugs before merging - [X] bugs need attention]
[❌ Do not merge - critical failures]

## Test Artifacts
- JSON Report: test-results/.last-run.json
- HTML Report: playwright-report/index.html
- Traces: test-results/[test-id]/trace.zip
- Screenshots: test-results/[test-id]/screenshots/
\`\`\`

### 6.2 SLACK_MESSAGE Trigger → Thread Reply

{{TEAM_COMMUNICATOR_INSTRUCTIONS}}

Use team-communicator agent to post concise results to Slack thread:

\`\`\`
Use the team-communicator agent to post verification results.

**Channel**: [from CHANGE_CONTEXT.slackChannel]
**Thread**: [from CHANGE_CONTEXT.slackThread]

**Message**:
🧪 *Verification Results for [change title]*

*Automated:* ✅ [passed]/[total] tests passed ([duration])
[If test issues fixed:] 🔧 [count] test issues auto-fixed
[If bugs logged:] 🐛 [count] bugs logged ([list issue IDs])

*Manual Verification Needed:*
[Concise checklist summary - collapsed/expandable]
□ Visual: [key items]
□ Mobile: [key items]
□ A11y: [key items]

*Recommendation:* [✅ Safe to merge | ⚠️ Review bugs | ❌ Blocked]

[If bugs logged:] cc @[relevant-team-members]
[Link to full test report if available]
\`\`\`

### 6.3 GITHUB_PR Trigger → PR Comment

Use GitHub API to post comprehensive comment on PR:

**Format as GitHub-flavored markdown:**
\`\`\`markdown
## 🧪 Test Verification Results

**Status:** [✅ All tests passed | ⚠️ Issues found | ❌ Critical failures]

### Automated Tests
| Metric | Value |
|--------|-------|
| Total Tests | [count] |
| Passed | ✅ [count] ([percentage]%) |
| Failed | ❌ [count] |
| Test Issues Fixed | 🔧 [count] |
| Product Bugs Logged | 🐛 [count] |
| Duration | ⏱️ [time] |

### Failed Tests (Triaged)

[For each failure:]

#### ❌ **[Test Name]**
- **File:** \`[test-file-path]\`
- **Cause:** [Product bug | Test issue]
- **Action:** [Bug logged: [ISSUE-123](url) | Fixed: [commit-hash](url)]
- **Details:**
  \`\`\`
  [Error message]
  \`\`\`

### Tests Fixed Automatically

[For each fixed test:]
- ✅ **[Test Name]** (\`[file-path]\`)
  - **Issue:** [brittle selector | missing wait | race condition]
  - **Fix:** [description of fix applied]
  - **Verified:** Passes 10/10 runs

### Product Bugs Logged

[For each bug:]
- 🐛 **[[ISSUE-123](url)]** [Bug title]
  - **Test:** \`[test-file]\` › [test name]
  - **Severity:** [🔴 Critical | 🟡 Important | 🟢 Minor]
  - **Assignee:** @[backend-team | frontend-team]

### Manual Verification Required

The following scenarios require human verification before release:

#### Design Validation (@design-team)
- [ ] 🔴 [Critical design check]
- [ ] 🟡 [Important design check]

#### Accessibility (@a11y-team)
- [ ] 🔴 [Critical a11y check]
- [ ] 🟡 [Important a11y check]

#### Mobile Experience (@qa-team)
- [ ] 🔴 [Critical mobile check]
- [ ] 🟡 [Important mobile check]

---
*Legend: 🔴 Critical • 🟡 Important • 🟢 Nice-to-have*

### Test Artifacts
- [Full HTML Report](playwright-report/index.html)
- [Test Traces](test-results/)

### Recommendation
[✅ **Safe to merge** - All automated tests pass, complete manual checks before release]
[⚠️ **Review required** - [X] bugs need attention, complete manual checks]
[❌ **Do not merge** - Critical failures must be resolved first]

---
*🤖 Automated by Bugzy • [View Test Code](tests/specs/) • [Manual Test Cases](test-cases/)*
\`\`\`

**Post comment via GitHub API:**
- Endpoint: \`POST /repos/{owner}/{repo}/issues/{pr_number}/comments\`
- Use GitHub MCP or bash with \`gh\` CLI
- Requires GITHUB_TOKEN from environment

### 6.4 CI_CD Trigger → Build Log + PR Comment

**Output to CI build log:**
- Print detailed results to stdout (captured by CI)
- Use ANSI colors if supported by CI platform
- Same format as MANUAL terminal output

**Exit with appropriate code:**
- Exit 0: All tests passed (safe to merge)
- Exit 1: Tests failed or critical bugs found (block merge)

**Post PR comment if GitHub context available:**
- Check for PR number in CI environment
- If available: Post comment using 6.3 format
- Also notify team via Slack if critical failures

## Additional Steps

### Handle Special Cases

**If no tests found for changed files:**
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

### Update Memory

If team-communicator used:
- Record verification interaction
- Track team response patterns
- Document clarifications received
- Note output preferences by trigger type

## Important Notes

- This task handles **all trigger sources** with a single unified workflow
- Trigger detection is automatic based on input format
- Output is automatically routed to the appropriate channel
- Automated tests are executed with **full triage and automatic fixing**
- Manual verification checklists are generated for **non-automatable scenarios**
- Product bugs are logged with **automatic duplicate detection**
- Test issues are fixed automatically with **verification**
- Results include both automated and manual verification items
- For best results, ensure:
  - Playwright is installed (\`npx playwright install\`)
  - Environment variables configured (copy \`.env.testdata\` to \`.env\`)
  - GitHub token available for PR comments (if GitHub trigger)
  - Slack integration configured (if Slack trigger)
  - Issue tracker configured (Linear, Jira, etc.)

## Success Criteria

A successful verification includes:
1. ✅ Trigger source correctly detected
2. ✅ Context extracted completely
3. ✅ Tests executed (or skipped with explanation)
4. ✅ All failures triaged (product bug vs test issue)
5. ✅ Test issues fixed automatically (when possible)
6. ✅ Product bugs logged to issue tracker
7. ✅ Manual verification checklist generated
8. ✅ Results formatted for output channel
9. ✅ Results delivered to appropriate destination
10. ✅ Clear recommendation provided (merge / review / block)
`,

  optionalSubagents: [
    {
      role: 'documentation-researcher',
      contentBlock: `#### Research Project Documentation

Use the documentation-researcher agent to gather comprehensive context about the changed features:

\`\`\`
Use the documentation-researcher agent to explore project documentation related to the changes.

Specifically gather:
- Product specifications for affected features
- User stories and acceptance criteria
- Technical architecture documentation
- API endpoints and contracts
- User roles and permissions relevant to the change
- Business rules and validations
- UI/UX specifications
- Known limitations or constraints
- Related bug reports or known issues
- Existing test documentation for this area
\`\`\`

The agent will:
1. Check its memory for previously discovered documentation
2. Explore workspace for relevant pages and databases
3. Build comprehensive understanding of the affected features
4. Return synthesized information to inform testing strategy

Use this information to:
- Better understand the change context
- Identify comprehensive test scenarios
- Recognize integration points and dependencies
- Spot potential edge cases or risk areas
- Enhance manual verification checklist generation`
    },
    {
      role: 'issue-tracker',
      contentBlock: `#### Log Product Bugs

For tests classified as **[PRODUCT BUG]**, use the issue-tracker agent to log bugs:

\`\`\`
Use issue-tracker agent to:
1. Check for duplicate bugs in the tracking system
   - The agent will automatically search for similar existing issues
   - It maintains memory of recently reported issues
   - Duplicate detection happens automatically - don't create manual checks

2. For each new bug (non-duplicate):
   Create detailed bug report with:
   - **Title**: Clear, descriptive summary (e.g., "Login button fails with timeout on checkout page")
   - **Description**:
     - What happened vs. what was expected
     - Impact on users
     - Test reference: [file path] › [test title]
   - **Reproduction Steps**:
     - List steps from the failing test
     - Include specific test data used
     - Note any setup requirements from test file
   - **Test Execution Details**:
     - Test file: [file path from JSON report]
     - Test name: [test title from JSON report]
     - Error message: [from JSON report]
     - Stack trace: [from JSON report]
     - Trace file: [path if available]
     - Screenshots: [paths if available]
   - **Environment Details**:
     - Browser and version (from Playwright config)
     - Test environment URL (from .env.testdata BASE_URL)
     - Timestamp of failure
   - **Severity/Priority**: Based on:
     - Test type (smoke tests = high priority)
     - User impact
     - Frequency (always fails vs flaky)
   - **Additional Context**:
     - Error messages or stack traces from JSON report
     - Related test files (if part of test suite)
     - Relevant learnings from learnings.md

3. Track created issues:
   - Note the issue ID/number returned
   - Update issue tracker memory with new bugs
   - Prepare issue references for team communication
\`\`\`

**Note**: The issue tracker agent handles all duplicate detection and system integration automatically. Simply provide the bug details and let it manage the rest.`
    },
    {
      role: 'team-communicator',
      contentBlock: `#### Team Communication

Use the team-communicator agent to share verification results (primarily for Slack trigger, but can be used for other triggers):

\`\`\`
Use the team-communicator agent to:
1. Post verification results summary
2. Highlight critical failures that need immediate attention
3. Share bugs logged with issue tracker links
4. Provide manual verification checklist summary
5. Recommend next steps based on results
6. Tag relevant team members for critical issues
7. Use appropriate urgency level based on failure severity
\`\`\`

The team communication should include:
- **Execution summary**: Overall pass/fail statistics and timing
- **Tests fixed**: Count of test issues fixed automatically
- **Bugs logged**: Product bugs reported to issue tracker
- **Manual checklist**: Summary of manual verification items
- **Recommendation**: Safe to merge / Review required / Do not merge
- **Test artifacts**: Links to reports, traces, screenshots

**Communication strategy based on trigger**:
- **Slack**: Post concise message with expandable details in thread
- **Manual**: Full detailed report in terminal
- **GitHub PR**: Comprehensive PR comment with tables and checklists
- **CI/CD**: Build log output + optional Slack notification for critical failures

**Update team communicator memory**:
- Record verification communication
- Track response patterns by trigger type
- Document team preferences for detail level
- Note which team members respond to which types of issues`
    }
  ],
  requiredSubagents: ['test-runner', 'test-debugger-fixer']
};
