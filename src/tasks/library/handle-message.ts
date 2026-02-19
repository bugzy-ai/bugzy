/**
 * Handle Message Task (Composed)
 * Handle team messages and communications, maintaining context for ongoing conversations
 *
 * Messages are processed by the LLM layer which routes feedback/general chat
 * to this task via the 'collect_feedback' action.
 */

import type { ComposedTaskTemplate } from '../steps/types';
import { TASK_SLUGS } from '../constants';

export const handleMessageTask: ComposedTaskTemplate = {
  slug: TASK_SLUGS.HANDLE_MESSAGE,
  name: 'Handle Message',
  description: 'Handle team messages, maintaining context for ongoing conversations',

  frontmatter: {
    description: 'Handle team messages, maintaining context for ongoing conversations',
    'argument-hint': '[team thread context or message]',
  },

  steps: [
    // Step 1: Overview (inline)
    {
      inline: true,
      title: 'Handle Message Overview',
      content: `# Handle Message Command

Process team messages and handle multi-turn conversations with the product team about testing clarifications, ambiguities, and questions.`,
    },
    // Step 2: Security Notice (library)
    'security-notice',
    // Step 3: Arguments (inline)
    {
      inline: true,
      title: 'Arguments',
      content: `Team message/thread context: $ARGUMENTS`,
    },
    // Step 6: Detect Intent (inline - simplified, no handler file loading)
    {
      inline: true,
      title: 'Detect Message Intent',
      content: `Identify the intent type from the event payload or message patterns:

#### Extract Intent from Event Payload

Check the event payload for the \`intent\` field provided by the LLM layer:
- If \`intent\` is present, use it directly
- Valid intent values: \`question\`, \`feedback\`, \`status\`

#### Fallback Intent Detection (if no intent provided)

If intent is not in the payload, detect from message patterns:

| Condition | Intent |
|-----------|--------|
| Keywords: "status", "progress", "how did", "results", "how many passed" | \`status\` |
| Keywords: "bug", "issue", "broken", "doesn't work", "failed", "error", "wrong triage", "incorrect classification", "dispute", "that was wrong" | \`feedback\` |
| Question words: "what", "which", "do we have", "is there" about tests/project | \`question\` |
| Default (none of above) | \`feedback\` |

Then follow the matching handler section below.`,
    },
    // Step 7: Process by Intent (all three handlers consolidated)
    {
      inline: true,
      title: 'Process Message by Intent',
      content: `Based on the detected intent, follow the appropriate section:

---

## If intent = "feedback"

### Step 1: Parse Feedback

Extract the following from the message:

| Field | Description |
|-------|-------------|
| **Type** | \`bug_report\`, \`test_result\`, \`observation\`, \`suggestion\`, \`general\` |
| **Severity** | \`critical\`, \`high\`, \`medium\`, \`low\` |
| **Component** | Affected area (e.g., "login", "checkout") |
| **Description** | Core issue description |
| **Expected** | What should happen (if stated) |
| **Steps** | How to reproduce (if provided) |

**Type Detection**:
- \`bug_report\`: "bug", "broken", "doesn't work", "error", "crash"
- \`test_result\`: "test passed", "test failed", "ran tests", "testing showed"
- \`observation\`: "noticed", "observed", "found that", "saw that"
- \`suggestion\`: "should", "could we", "what if", "idea"
- \`general\`: Default for unclassified feedback

### Step 2: Check for Dispute Intent

Before processing other feedback types, check if the message is disputing a prior triage finding (e.g., "that triage was wrong", "the login timeout is actually CI flakiness not a product bug", "incorrect classification for...").

**If dispute detected:**
1. Call \`bugzy-findings list\` to retrieve recent findings
2. Match the customer's message to a specific finding by test name, description, or ID
3. If ambiguous (multiple possible matches), list recent findings and ask the customer to clarify which one they're disputing
4. Once matched, call:
   \`\`\`bash
   bugzy-findings dispute --finding-id <matched-finding-id> --explanation "<customer's explanation>"
   \`\`\`
5. Confirm the dispute was recorded: "Dispute recorded for [finding title]. A triage credit has been applied and the finding is now marked as disputed. This feedback will help improve future triages."
6. Skip the remaining feedback steps (the dispute is the action)

If \`bugzy-findings\` is not available (command not found), inform the customer that dispute functionality is not available for this project and suggest contacting support.

**If NOT a dispute**, continue with the standard feedback flow below.

### Step 3: Update Test Case Specifications

**CRITICAL**: When feedback requests changes to test behavior (e.g., "change the expected result", "update the test to check for X", "the test should verify Y instead"), you MUST update the test case markdown files to reflect the requested changes.

For each actionable feedback item:
1. Identify which test case(s) are affected
2. Read the test case markdown file
3. Update the test steps, expected results, or assertions as requested
4. Save the modified test case file

This step updates the **specification** (markdown test case files) only. The \`sync-automation-from-feedback\` step that follows handles syncing the **implementation** (automation code) to match.

### Step 4: Acknowledge and Confirm

Respond confirming: feedback received, summary of what was captured, actions taken (including any test case updates), and follow-up questions if needed.

---

## If intent = "question"

### Step 1: Classify Question Type

| Type | Indicators | Primary Context Sources |
|------|------------|------------------------|
| **Coverage** | "what tests", "do we have", "is there a test for" | test-cases/, test-plan.md |
| **Results** | "did tests pass", "what failed", "test results" | test-runs/ |
| **Knowledge** | "how does", "what is", "explain" | knowledge-base.md |
| **Plan** | "what's in scope", "test plan", "testing strategy" | test-plan.md |
| **Process** | "how do I", "when should", "what's the workflow" | project-context.md |

### Step 2: Load Relevant Context

Based on question type, load the appropriate files:
- **Coverage**: Read test-plan.md, list ./test-cases/, search for relevant keywords
- **Results**: List ./test-runs/ (newest first), read summary.json from relevant runs
- **Knowledge**: Read .bugzy/runtime/knowledge-base.md, search for relevant entries
- **Plan**: Read test-plan.md, extract relevant sections
- **Process**: Read .bugzy/runtime/project-context.md

### Step 3: Formulate Answer

- Be specific: quote relevant sections from source files
- Cite sources: mention which files contain the information
- Quantify when possible: "We have 12 test cases covering login..."
- Acknowledge gaps if information is incomplete

### Step 4: Offer Follow-up

End response with offer to provide more detail and suggest related information.

---

## If intent = "status"

### Step 1: Identify Status Scope

| Scope | Indicators | Data Sources |
|-------|------------|--------------|
| **Latest test run** | "last run", "recent tests", "how did tests go" | Most recent test-runs/ directory |
| **Specific test** | Test ID mentioned (TC-XXX) | test-runs/*/TC-XXX/, test-cases/TC-XXX.md |
| **Overall** | "overall", "all tests", "pass rate" | All test-runs/ summaries |
| **Task progress** | "is the task done", "what's happening with" | team-communicator memory |

### Step 2: Gather Status Data

Based on scope, read the appropriate test-runs/ directories and summary files. Calculate aggregate statistics for overall status requests.

### Step 3: Format Status Report

Present status clearly: lead with pass/fail summary, use bullet points, include timestamps, offer to drill down into specifics.

### Step 4: Provide Context and Recommendations

For failing tests: suggest review, note if new or recurring. For declining trends: highlight causes. For good results: acknowledge healthy state.`,
    },
    // Step 8: Sync automation from feedback (conditional on test-engineer)
    {
      stepId: 'sync-automation-from-feedback',
      conditionalOnSubagent: 'test-engineer',
    },
    // Step 9: Post Response via Team Communicator
    {
      inline: true,
      title: 'Post Response to Team',
      content: `## Post Response to the Team

After processing the message and composing your response:

{{INVOKE_TEAM_COMMUNICATOR}} to post the response back to the team.

**Context to include in the delegation:**
- The original message/question from the team member
- Your composed response with all gathered data
- Whether this should be a thread reply (if the original message was in a thread) or a new message
- The relevant channel (from project-context.md)

**Do NOT:**
- Skip posting and just display the response as text output
- Ask the user whether to post — the message came from the team, the response goes back to the team
- Compose a draft without sending it`,
    },
    // Step 10: Clarification Protocol (for ambiguous intents)
    'clarification-protocol',
    // Step 11: Knowledge Base Update (library)
    'update-knowledge-base',
  ],

  requiredSubagents: ['team-communicator'],
  optionalSubagents: ['test-engineer'],
  dependentTasks: ['verify-changes'],
};
