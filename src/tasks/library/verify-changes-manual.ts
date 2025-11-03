/**
 * Verify Changes - Manual Trigger
 * Manually trigger verification of changes from PR, issue, or feature description
 */

import { TaskTemplate } from '../types';
import { TASK_SLUGS } from '../constants';
import { VERIFY_CHANGES_CORE_INSTRUCTIONS } from '../templates/verify-changes-core';

export const verifyChangesManualTask: TaskTemplate = {
  slug: TASK_SLUGS.VERIFY_CHANGES_MANUAL,
  name: 'Verify Changes (Manual)',
  description: 'Manually verify changes from PR, issue, or feature description',

  frontmatter: {
    description: 'Manually verify changes from PR, issue, or feature description',
    'allowed-tools': 'Read, Write, Edit, Bash, Grep, Glob, Task',
    'argument-hint': '<PR-URL | issue-ID | description>',
  },

  baseContent: `# Verify Changes - Manual Trigger

## SECURITY NOTICE
**CRITICAL**: Never read the \`.env\` file. It contains ONLY secrets (passwords, API keys).
- **Read \`.env.example\`** for non-secret environment variables (TEST_BASE_URL, TEST_OWNER_EMAIL, etc.)
- \`.env.example\` contains actual values for test data, URLs, and non-sensitive configuration
- For secrets: Reference variable names only (TEST_OWNER_PASSWORD) - values are injected at runtime
- The \`.env\` file access is blocked by settings.json

## Context

This task is manually triggered to verify changes described by:
- **Pull Request URL**: GitHub PR link to analyze changes
- **Issue/Ticket ID**: Jira, Linear, or GitHub issue identifier
- **Feature Description**: Text description of what changed
- **Deployment URL**: Preview or staging environment to test

## Input

**Arguments**: $ARGUMENTS

Parse the arguments to extract:
- URLs (GitHub PR, deployment preview, issue tracker)
- Issue identifiers (PROJ-123, #456)
- Descriptive text about the change

If the input is a GitHub PR URL, you can fetch PR details including:
- Title and description
- Changed files and diff
- Comments and review feedback
- Linked issues

${VERIFY_CHANGES_CORE_INSTRUCTIONS}

## Output Format

Provide a comprehensive markdown summary with the following structure:

### Test Verification Report

#### Change Summary
- **What Changed**: [Brief description]
- **Scope**: [Affected features/areas]
- **Environment Tested**: [URL or environment]

#### Test Coverage
- **Existing Test Cases Run**: [Count and list]
- **New Test Cases Created**: [Count and list]
- **Total Test Scenarios**: [Number]

#### Test Results
- ✅ **Passed**: [Count] test cases
- ❌ **Failed**: [Count] test cases
- ⚠️ **Blocked**: [Count] test cases (if any)

#### Detailed Results
For each test case:
- **Test Case**: [Name/path]
- **Status**: [Pass/Fail/Blocked]
- **Key Findings**: [What was observed]
- **Issues**: [Problems found, if any]
- **Evidence**: [Link to test run folder]

#### Issues Found
[List any problems discovered with severity and details]

#### Recommendations
- [Next steps]
- [Actions needed]
- [Follow-up testing required]

#### Test Artifacts
- Test run folders: \`./test-runs/[timestamps]\`
- Screenshots and logs available in run folders
- New test cases: \`./test-cases/[new-files]\`

---
🤖 Automated verification completed`,

  optionalSubagents: [
    {
      role: 'documentation-researcher',
      contentBlock: `#### Step 2.3: Research Project Documentation

Use the documentation-researcher agent to gather comprehensive context about the changed features:

\`\`\`
Use the documentation-researcher agent to explore project documentation related to the changes described.

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
- Spot potential edge cases or risk areas`
    },
    {
      role: 'test-runner',
      contentBlock: `### Step 5: Execute Tests Using Test-Runner

Use the test-runner agent to execute both existing and newly created test cases:

\`\`\`
Use the test-runner agent to execute test cases for verifying the changes.

**Test Run Configuration**:
- test_run_folder: ./test-runs/[YYYYMMDD-HHMMSS]
- Test cases: [list of test case file paths from Steps 3 and 4]

The agent will:
1. Execute each test case in the appropriate order (considering dependencies)
2. Record video of test execution (automatic with --save-video)
3. Generate structured test artifacts per schema (.bugzy/runtime/templates/test-result-schema.md):
   - summary.json (outcome, video filename, failure details)
   - steps.json (structured steps with timestamps and video times)
4. Handle blocker test failures (skip dependent tests)
5. Return detailed execution report

Expected output:
- Pass/fail status for each test
- Execution time and statistics
- Failed steps and error details
- Video file locations
- Artifact locations in test-run folder
\`\`\`

**After test execution**:
- Analyze results for patterns and critical issues
- Identify any unexpected behaviors requiring clarification
- Prepare findings for team communication`
    },
    {
      role: 'team-communicator',
      contentBlock: `### Step 6: Communicate Verification Results

Use the team-communicator agent to share verification results and gather clarifications:

#### 6.1 Post Verification Results

After completing verification, communicate results to the team:

\`\`\`
Use the team-communicator agent to post verification results.

**Context**: Manual verification request for [change description]

**Message Content**:
### ✅ Change Verification Complete

**What was verified**: [Brief description of the change]
**Environment**: [URL or environment name]

**Results Summary**:
• ✅ [X] tests passed
• ❌ [Y] tests failed
• ⏭️ [Z] tests skipped (if any blocker failures)
• 📝 [Total] test cases (existing + new)

[If all tests passed:]
All tests passed successfully! ✨

[If tests failed:]
**Issues Found**:
• [Critical issue 1 with severity]
• [Critical issue 2 with severity]
• [Total count] issues discovered

**Test Coverage**:
• Existing test cases: [list key ones run]
• New test cases created: [list new ones]

**Details**: Test artifacts in ./test-runs/[timestamp]/
**Next Steps**: [Recommended actions based on results]

---
🤖 Full test report available in test-runs folder
\`\`\`

#### 6.2 Request Clarifications (if needed)

If exploration revealed ambiguities during verification (Step 2.5 - MEDIUM severity):

\`\`\`
Use the team-communicator agent to ask clarification questions.

**Check memory first**: Query for similar past clarifications about this feature

**If no answer in memory, ask**:
### ⚠️ Clarification Needed for Verification

While verifying [change description], I encountered ambiguity:

**Ambiguity**: [Specific unclear aspect with concrete example]

**Options**:
1. [Option A with implications]
2. [Option B with implications]

**Context**: [Exploration findings - what you observed]
**Impact**: [How this affects test results/coverage]

Which approach should I use for testing?
\`\`\`

**Wait for response** before finalizing verification results.

#### 6.3 Update Memory

After communication, update team-communicator memory:
- Record this verification interaction
- Note any clarifications received
- Track response patterns and team preferences
- Document decisions for future similar requests

**Communication Guidelines**:
- Keep messages clear and scannable
- Use severity indicators (🔴 🟠 🟡 🟢) for issues
- Provide links to detailed artifacts
- Highlight critical items needing immediate attention
- Offer to provide more details if needed
- Tag relevant team members for critical issues`
    }
  ],
  requiredSubagents: ['test-runner', 'team-communicator']
};
