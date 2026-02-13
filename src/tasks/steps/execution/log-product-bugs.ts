import type { TaskStep } from '../types';

export const logProductBugsStep: TaskStep = {
  id: 'log-product-bugs',
  title: 'Log Product Bugs',
  category: 'execution',
  content: `## Log Product Bugs via Issue Tracker

After triage, for tests classified as **[PRODUCT BUG]**, use the issue-tracker agent to log bugs:

{{INVOKE_ISSUE_TRACKER}}

**For each bug to report:**

1. **Check for duplicate bugs** in the tracking system
   - The agent will automatically search for similar existing issues
   - It maintains memory of recently reported issues
   - Duplicate detection happens automatically

2. **For each new bug (non-duplicate):**
   Create detailed bug report with:
   - **Title**: Clear, descriptive summary (e.g., "Login button fails with timeout on checkout page")
   - **Description**:
     - What happened vs. what was expected
     - Impact on users
     - Test reference: [file path] > [test title]
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
     - Browser and version (from test framework config)
     - Test environment URL (from .env.testdata BASE_URL)
     - Timestamp of failure
   - **Severity/Priority**: Based on:
     - Test type (smoke tests = high priority)
     - User impact
     - Frequency (always fails vs flaky)

3. **Track created issues:**
   - Note the issue ID/number returned
   - Update issue tracker memory with new bugs
   - Prepare issue references for team communication

**Summary of Bug Reporting:**
\`\`\`markdown
### Bug Reporting Summary
- Total bugs found: [count of FAIL tests classified as PRODUCT BUG]
- New bugs reported: [count of newly created issues]
- Duplicate bugs found: [count of duplicates detected]
- Issues not reported: [count of skipped/known issues]

**New Bug Reports**:
- [Issue ID]: [Bug title] (Test: TC-XXX, Priority: [priority])

**Duplicate Bugs** (already tracked):
- [Existing Issue ID]: [Bug title] (Matches test: TC-XXX)
\`\`\``,
  requiresSubagent: 'issue-tracker',
  invokesSubagents: ['issue-tracker'],
  tags: ['execution', 'bug-tracking', 'optional'],
};
