/**
 * Verify Changes - Slack Trigger
 * Invoked by LLM processor when team member requests verification via Slack
 *
 * Slack messages are processed by the LLM layer (lib/slack/llm-processor.ts)
 * which intelligently routes to appropriate tasks via enqueueEventTask().
 * This task must be in SLACK_ALLOWED_TASKS to be Slack-callable.
 */

import { TaskTemplate } from '../types';
import { TASK_SLUGS } from '../constants';
import { VERIFY_CHANGES_CORE_INSTRUCTIONS } from '../templates/verify-changes-core';

export const verifyChangesSlackTask: TaskTemplate = {
  slug: TASK_SLUGS.VERIFY_CHANGES_SLACK,
  name: 'Verify Changes (Slack)',
  description: 'Verify changes requested via Slack message (LLM-routed)',

  frontmatter: {
    description: 'Verify changes requested via Slack message',
    'allowed-tools': 'Read, Write, Edit, Bash, Grep, Glob, Task',
    'argument-hint': '',
  },

  baseContent: `# Verify Changes - Slack Trigger

## SECURITY NOTICE
**CRITICAL**: Never read the \`.env\` file. It contains ONLY secrets (passwords, API keys).
- **Read \`.env.example\`** for non-secret environment variables (TEST_BASE_URL, TEST_OWNER_EMAIL, etc.)
- \`.env.example\` contains actual values for test data, URLs, and non-sensitive configuration
- For secrets: Reference variable names only (TEST_OWNER_PASSWORD) - values are injected at runtime
- The \`.env\` file access is blocked by settings.json

## Context

This task is triggered when a team member requests change verification via Slack. Common patterns:
- "@bugzy test PR #123"
- "@bugzy verify PROJ-456"
- "@bugzy check the login feature on staging"
- "Can you test the new checkout flow?"

## Parse Slack Message

Extract relevant information from the Slack event context (\$ARGUMENTS):

### Event Structure
\`\`\`json
{
  "eventType": "com.slack.message" or "com.slack.app_mention",
  "event": {
    "type": "message",
    "channel": "C123456",
    "user": "U123456",
    "text": "message content",
    "ts": "1234567890.123456",
    "thread_ts": "1234567890.123456" (if in thread)
  }
}
\`\`\`

### Information to Extract
- **Message text**: The actual request content
- **User**: Who made the request (for follow-up questions)
- **Channel/Thread**: Where to post results
- **References**: Extract PR numbers (#123), issue IDs (PROJ-456), URLs
- **Context clues**: Feature names, environment mentions (staging, production)

### Extraction Patterns
Look for:
- **PR references**: "#123", "PR 123", "pull request 123", GitHub PR URLs
- **Issue IDs**: "PROJ-456", "BUG-123", Jira/Linear URLs
- **URLs**: Deployment URLs, GitHub links, issue tracker links
- **Feature names**: Quoted terms, capitalized phrases
- **Environments**: "staging", "production", "preview", "dev"
- **Actions**: "test", "verify", "check", "validate"

${VERIFY_CHANGES_CORE_INSTRUCTIONS}`,

  optionalSubagents: [
    {
      role: 'documentation-researcher',
      contentBlock: `#### Step 2.3: Research Project Documentation

Use the documentation-researcher agent to gather comprehensive context about the changed features:

\`\`\`
Use the documentation-researcher agent to explore project documentation related to the changes mentioned in the Slack message.

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
- Prepare findings for team communication (Slack thread)`
    },
    {
      role: 'team-communicator',
      contentBlock: `### Step 6: Communicate Verification Results to Slack

Use the team-communicator agent to post results back to the Slack thread and handle clarifications:

#### 6.1 Post Initial Acknowledgment (Optional)

For complex verifications that will take time:

\`\`\`
Use the team-communicator agent to post acknowledgment.

**Channel**: [extracted from event.channel]
**Thread**: [extracted from event.thread_ts or event.ts]
**Message**: "On it! 🚀 Verifying [brief description]..."
\`\`\`

#### 6.2 Post Verification Results

After completing verification, post results to the Slack thread:

\`\`\`
Use the team-communicator agent to post verification results.

**Channel**: [extracted-channel-id]
**Thread**: [extracted-thread-ts or message-ts for new thread]

**Message**:
### ✅ Change Verification Complete

**What was tested**: [Brief description extracted from Slack message]
**Environment**: [URL or environment name if mentioned]

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
• Existing test cases: [list key ones]
• New test cases created: [list new ones]

**Details**: Test artifacts in ./test-runs/[timestamp]/
**Next Steps**: [Recommended actions]

[If critical issues found:]
<@[user-id]> - Critical issues found that need attention

---
🤖 Full test report available in test-runs folder
\`\`\`

**Slack Formatting Guidelines**:
- **Keep it concise**: Scannable bullet points
- **Use emojis**: Visual indicators (✅ ❌ ⚠️ 📝 🔴 🟠 🟡 🟢)
- **Link to details**: Don't overwhelm with details in Slack
- **Thread appropriately**: Reply in existing thread to keep channel clean
- **Tag user**: @mention requesting user for critical issues
- **Offer follow-up**: "Need more details? Just ask!"

#### 6.3 Request Clarifications (if needed)

If exploration revealed ambiguities during verification (Step 2.5 - MEDIUM severity):

\`\`\`
Use the team-communicator agent to ask clarification in Slack thread.

**Check memory first**: Query for similar past clarifications

**Channel**: [same channel]
**Thread**: [same thread]

**Message**:
### ⚠️ Need Clarification

While verifying [change description], I found something unclear:

**Question**: [Specific unclear aspect with concrete example]

**Options I see**:
1. [Option A] - [implications]
2. [Option B] - [implications]

**What I observed**: [Exploration findings]
**Why it matters**: [Impact on testing]

Which approach should I use?
\`\`\`

**Wait for response** in thread before proceeding with affected tests.

#### 6.4 Handle Multi-turn Conversations

For follow-up questions from the user:
- Reference the original verification execution
- Provide additional details from test artifacts
- Offer to re-run specific tests if needed
- Maintain conversation context

#### 6.5 Update Memory

After completing Slack interaction, update team-communicator memory:
- Record this verification request and interaction pattern
- Note the requester (user ID) and their communication preferences
- Track what level of detail they prefer in Slack
- Document any clarifications provided for future reference
- Record team response patterns to different types of results

#### 6.6 Response Timing

**Timing Strategy**:
- Acknowledgment: Quick (optional, for >5 min tasks)
- Results: When complete (don't spam progress updates)
- Clarifications: As soon as ambiguity detected (don't delay)
- Follow-ups: Responsive to user questions

#### 6.7 Error Handling

If verification cannot be completed:

\`\`\`
**Channel**: [same channel]
**Thread**: [same thread]

**Message**:
### ⚠️ Verification Blocked

I couldn't complete the verification because:

[Clear explanation of what went wrong]

**What I need**:
• [Missing information 1]
• [Missing information 2]

**Alternatives**:
• [Alternative approach 1]
• [Alternative approach 2]

Let me know how you'd like to proceed!
\`\`\`

**Don't leave user hanging** - always provide clear next steps or ask for help.`
    }
  ],
  requiredSubagents: ['test-runner', 'team-communicator']
};
