/**
 * Handle Message Task (Composed)
 * Handle team responses and Slack communications, maintaining context for ongoing conversations
 *
 * Slack messages are processed by the LLM layer (lib/slack/llm-processor.ts)
 * which routes feedback/general chat to this task via the 'collect_feedback' action.
 * This task must be in SLACK_ALLOWED_TASKS to be Slack-callable.
 */

import type { ComposedTaskTemplate } from '../steps/types';
import { TASK_SLUGS } from '../constants';

export const handleMessageTask: ComposedTaskTemplate = {
  slug: TASK_SLUGS.HANDLE_MESSAGE,
  name: 'Handle Message',
  description: 'Handle team responses and Slack communications, maintaining context for ongoing conversations (LLM-routed)',

  frontmatter: {
    description: 'Handle team responses and Slack communications, maintaining context for ongoing conversations',
    'argument-hint': '[slack thread context or team message]',
  },

  steps: [
    // Step 1: Overview (inline)
    {
      inline: true,
      title: 'Handle Message Overview',
      content: `# Handle Message Command

Process team responses from Slack threads and handle multi-turn conversations with the product team about testing clarifications, ambiguities, and questions.`,
    },
    // Step 2: Security Notice (library)
    'security-notice',
    // Step 3: Arguments (inline)
    {
      inline: true,
      title: 'Arguments',
      content: `Team message/thread context: $ARGUMENTS`,
    },
    // Step 4: Load Project Context (library)
    'load-project-context',
    // Step 5: Knowledge Base Read (library)
    'read-knowledge-base',
    // Step 5: Detect Intent (inline - task-specific)
    {
      inline: true,
      title: 'Detect Message Intent and Load Handler',
      content: `Before processing the message, identify the intent type to load the appropriate handler.

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
- Memory update instructions`,
    },
    // Step 6: Post Response via Team Communicator
    {
      inline: true,
      title: 'Post Response to Team',
      content: `## Post Response to the Team

After processing the message through the handler and composing your response:

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
    // Step 7: Clarification Protocol (for ambiguous intents)
    'clarification-protocol',
    // Step 8: Knowledge Base Update (library)
    'update-knowledge-base',
    // Step 9: Key Principles (inline)
    {
      inline: true,
      title: 'Key Principles',
      content: `## Key Principles

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
- Ask good follow-up questions when needed`,
    },
    // Step 10: Important Considerations (inline)
    {
      inline: true,
      title: 'Important Considerations',
      content: `## Important Considerations

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
    },
  ],

  requiredSubagents: ['team-communicator'],
  optionalSubagents: [],
  dependentTasks: ['verify-changes'],
};
