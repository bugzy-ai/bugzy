/**
 * Handle Message Task
 * Handle team responses and Slack communications, maintaining context for ongoing conversations
 *
 * Slack messages are processed by the LLM layer (lib/slack/llm-processor.ts)
 * which routes feedback/general chat to this task via the 'collect_feedback' action.
 * This task must be in SLACK_ALLOWED_TASKS to be Slack-callable.
 */

import { TaskTemplate } from '../types';
import { TASK_SLUGS } from '../constants';
import { KNOWLEDGE_BASE_READ_INSTRUCTIONS, KNOWLEDGE_BASE_UPDATE_INSTRUCTIONS } from '../templates/knowledge-base.js';

export const handleMessageTask: TaskTemplate = {
   slug: TASK_SLUGS.HANDLE_MESSAGE,
   name: 'Handle Message',
   description: 'Handle team responses and Slack communications, maintaining context for ongoing conversations (LLM-routed)',

   frontmatter: {
      description: 'Handle team responses and Slack communications, maintaining context for ongoing conversations',
      'argument-hint': '[slack thread context or team message]',
   },

   baseContent: `# Handle Message Command

## SECURITY NOTICE
**CRITICAL**: Never read the \`.env\` file. It contains ONLY secrets (passwords, API keys).
- **Read \`.env.testdata\`** for non-secret environment variables (TEST_BASE_URL, TEST_OWNER_EMAIL, etc.)
- \`.env.testdata\` contains actual values for test data, URLs, and non-sensitive configuration
- For secrets: Reference variable names only (TEST_OWNER_PASSWORD) - values are injected at runtime
- The \`.env\` file access is blocked by settings.json

Process team responses from Slack threads and handle multi-turn conversations with the product team about testing clarifications, ambiguities, and questions.

## Arguments
Team message/thread context: \$ARGUMENTS

${KNOWLEDGE_BASE_READ_INSTRUCTIONS}

## Process

### Step 0: Detect Message Intent and Load Handler

Before processing the message, identify the intent type to load the appropriate handler.

#### 0.1 Extract Intent from Event Payload

Check the event payload for the \`intent\` field provided by the LLM layer:
- If \`intent\` is present, use it directly
- Valid intent values: \`question\`, \`feedback\`, \`status\`

#### 0.2 Fallback Intent Detection (if no intent provided)

If intent is not in the payload, detect from message patterns:

| Condition | Intent |
|-----------|--------|
| Keywords: "status", "progress", "how did", "results", "how many passed" | \`status\` |
| Keywords: "bug", "issue", "broken", "doesn't work", "failed", "error" | \`feedback\` |
| Question words: "what", "which", "do we have", "is there" about tests/project | \`question\` |
| Default (none of above) | \`feedback\` |

#### 0.3 Load Handler File

Based on detected intent, load the handler from:
\`.bugzy/runtime/handlers/messages/{intent}.md\`

**Handler files:**
- \`question.md\` - Questions about tests, coverage, project details
- \`feedback.md\` - Bug reports, test observations, general information
- \`status.md\` - Status checks on test runs, task progress

#### 0.4 Follow Handler Instructions

**IMPORTANT**: The handler file is authoritative for this intent type.

1. Read the handler file completely
2. Follow its processing steps in order
3. Apply its context loading requirements
4. Use its response guidelines
5. Perform any memory updates it specifies

The handler file contains all necessary processing logic for the detected intent type. Each handler includes:
- Specific processing steps for that intent
- Context loading requirements
- Response guidelines
- Memory update instructions

${KNOWLEDGE_BASE_UPDATE_INSTRUCTIONS}

## Key Principles

### Context Preservation
- Always maintain full conversation context
- Link responses back to original uncertainties
- Preserve reasoning chain for future reference

### Actionable Responses
- Convert team input into concrete actions
- Don't let clarifications sit without implementation
- Follow through on commitments made to team

### Learning Integration
- Each interaction improves our understanding
- Build knowledge base of team preferences
- Refine communication approaches over time

### Quality Communication
- Acknowledge team input appropriately
- Provide updates on actions taken
- Ask good follow-up questions when needed

## Important Considerations

### Thread Organization
- Keep related discussions in same thread
- Start new threads for new topics
- Maintain clear conversation boundaries

### Response Timing
- Acknowledge important messages promptly
- Allow time for implementation before status updates
- Don't spam team with excessive communications

### Action Prioritization
- Address urgent clarifications first
- Batch related updates when possible
- Focus on high-impact changes

### Memory Maintenance
- Keep active conversations visible and current
- Archive resolved discussions appropriately
- Maintain searchable history of resolutions`,

   optionalSubagents: [],
   requiredSubagents: ['team-communicator']
};
