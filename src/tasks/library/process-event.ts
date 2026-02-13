/**
 * Process Event Task (Composed)
 * Process webhook events by analyzing for QA relevance and queuing proposed actions for team confirmation
 */

import type { ComposedTaskTemplate } from '../steps/types';
import { TASK_SLUGS } from '../constants';

export const processEventTask: ComposedTaskTemplate = {
  slug: TASK_SLUGS.PROCESS_EVENT,
  name: 'Process Event',
  description: 'Process webhook events by analyzing for QA relevance and queuing proposed actions for team confirmation',

  frontmatter: {
    description: 'Process webhook events by analyzing for QA relevance and queuing proposed actions for team confirmation',
    'argument-hint': '[event payload or description]',
  },

  steps: [
    // Step 1: Overview (inline)
    {
      inline: true,
      title: 'Process Event Overview',
      content: `# Process Event Command

Process webhook events from integrated systems by analyzing event content, determining appropriate QA actions, and queuing them for team confirmation.

**This task does NOT execute actions directly.** It proposes actions via the blocked-task-queue and notifies the team for confirmation. Only knowledge base updates and event history logging are performed directly.`,
    },
    // Step 2: Security Notice (library)
    'security-notice',
    // Step 3: Arguments (inline)
    {
      inline: true,
      title: 'Arguments',
      content: `Arguments: $ARGUMENTS`,
    },
    // Step 4: Load Project Context (library)
    'load-project-context',
    // Step 5: Knowledge Base Read (library)
    'read-knowledge-base',
    // Step 5: Understand Event Context (inline)
    {
      inline: true,
      title: 'Understand Event Context',
      content: `Events come from integrated external systems via webhooks or manual input. Common sources include:
- **Issue Trackers**: Jira, Linear, GitHub Issues
- **Source Control**: GitHub, GitLab
- **Communication Tools**: Slack

**Event structure and semantics vary by source.** Use the inline event-action reference patterns and historical context to determine actions.

#### Event Context to Extract:
- **What happened**: The core event (test failed, PR merged, etc.)
- **Where**: Component, service, or area affected
- **Impact**: How this affects testing strategy
- **Action Required**: What needs to be done in response`,
    },
    // Step 6: Clarify Unclear Events (inline - task-specific)
    {
      inline: true,
      title: 'Clarify Unclear Events',
      content: `If the event information is incomplete or ambiguous, seek clarification before processing:

#### Detect Unclear Events

Events may be unclear in several ways:
- **Vague description**: "Something broke", "issue with login" (what specifically?)
- **Missing context**: Which component, which environment, which user?
- **Contradictory information**: Event data conflicts with other sources
- **Unknown references**: Mentions unfamiliar features, components, or systems
- **Unclear severity**: Impact or priority is ambiguous

#### Assess Ambiguity Severity

Classify the ambiguity level to determine appropriate response:

**🔴 CRITICAL - STOP and seek clarification:**
- Cannot identify which component is affected
- Event data is contradictory or nonsensical
- Unknown system or feature mentioned
- Cannot determine if this requires immediate action
- Example: Event says "production is down" but unclear which service

**🟠 HIGH - STOP and seek clarification:**
- Vague problem description that could apply to multiple areas
- Missing critical context needed for proper response
- Unclear which team or system is responsible
- Example: "Login issue reported" (login button? auth service? session? which page?)

**🟡 MEDIUM - Proceed with documented assumptions:**
- Some details missing but core event is clear
- Can infer likely meaning from context
- Can proceed but should clarify async
- Example: "Test failed on staging" (can assume main staging, but clarify which one)

**🟢 LOW - Mark and proceed:**
- Minor details missing (optional context)
- Cosmetic or non-critical information gaps
- Can document gap and continue
- Example: Missing timestamp or exact user who reported issue

#### Clarification Approach by Severity

**For CRITICAL/HIGH ambiguity:**
1. **{{INVOKE_TEAM_COMMUNICATOR}} to ask specific questions**
2. **WAIT for response before proceeding**
3. **Document the clarification request in event history**

Example clarification messages:
- "Event mentions 'login issue' - can you clarify if this is:
  • Login button not responding?
  • Authentication service failure?
  • Session management problem?
  • Specific page or global?"

- "Event references component 'XYZ' which is unknown. What system does this belong to?"

- "Event data shows contradictory information: status=success but error_count=15. Which is correct?"

**For MEDIUM ambiguity:**
1. **Document assumption** with reasoning
2. **Proceed with processing** based on assumption
3. **Ask for clarification async** (non-blocking)
4. **Mark in event history** for future reference

Example: [ASSUMED: "login issue" refers to login button based on recent similar events]

**For LOW ambiguity:**
1. **Mark with [TO BE CLARIFIED: detail]**
2. **Continue processing** normally
3. **Document gap** in event history

Example: [TO BE CLARIFIED: Exact timestamp of when issue was first observed]

#### Document Clarification Process

In event history, record:
- **Ambiguity detected**: What was unclear
- **Severity assessed**: CRITICAL/HIGH/MEDIUM/LOW
- **Clarification requested**: Questions asked (if any)
- **Response received**: Team's clarification
- **Assumption made**: If proceeded with assumption
- **Resolution**: How ambiguity was resolved

This ensures future similar events can reference past clarifications and avoid redundant questions.`,
    },
    // Step 7: Load Context and Memory (inline)
    {
      inline: true,
      title: 'Load Context and Memory',
      content: `### Step 2: Load Context and Memory

#### 2.1 Check Event Processor Memory
Read \`.bugzy/runtime/memory/event-processor.md\` to:
- Find similar event patterns
- Load example events with reasoning
- Get system-specific rules
- Retrieve task mapping patterns

#### 2.2 Check Event History
Read \`.bugzy/runtime/memory/event-history.md\` to:
- Ensure event hasn't been processed already (idempotency)
- Find related recent events
- Understand event patterns and trends

#### 2.3 Read Current State
- Read \`test-plan.md\` for current coverage
- List \`./test-cases/\` for existing tests
- Check \`.bugzy/runtime/knowledge-base.md\` for past insights

#### 2.4 Event-Action Reference Patterns

Use these as reference patterns for common events. The webhook routing system already handles events with specific default tasks (e.g., deployment_status → /run-tests). Process-event receives events that need analysis.

**Jira Events:**
- **Status → "Ready to Test" / "In Testing" / "Ready for QA"**: Propose \`/verify-changes\` with issue context
- **Resolution: "Not a Bug" / "Won't Fix" / "User Error"**: Update knowledge base directly with the learning (no queue needed)
- **Bug created with relevant labels**: Propose \`/generate-test-cases\` to update related test coverage, confirm with team
- **Backlog → To Do**: No QA action needed, log to event history only

**GitHub Events:**
- **PR merged (routed to process-event)**: Propose \`/verify-changes\` for the merged changes
- **Issue closed as "won't fix"**: Update knowledge base directly with the learning
- **Issue created/updated**: Analyze for QA relevance, propose actions if applicable

**Recall.ai Events (Meeting Transcripts):**
- **QA-relevant content found**: Propose appropriate follow-up tasks (e.g., \`/generate-test-cases\`, \`/verify-changes\`)
- **No QA content** (HR meeting, offsite planning, etc.): Skip — log to event history only

**Other Events:**
- Analyze for QA relevance based on knowledge base and project context
- If action needed, propose appropriate task. If not, log and skip.

Check \`.bugzy/runtime/project-context.md\` for project-specific context that may inform action decisions.`,
    },
    // Step 8: Intelligent Event Analysis (inline)
    {
      inline: true,
      title: 'Intelligent Event Analysis',
      content: `### Step 3: Intelligent Event Analysis

#### 3.1 Contextual Pattern Analysis
Don't just match patterns - analyze the event within the full context:

**Combine Multiple Signals**:
- Event details + Historical patterns from memory
- Current test plan state + Knowledge base
- External system status + Team activity
- Business priorities + Risk assessment

**Example Contextual Analysis**:
\`\`\`
Event: Jira issue PROJ-456 moved to "Ready for QA"
+ Reference Pattern: "Ready for QA" status suggests /verify-changes
+ History: This issue was previously in "In Progress" for 3 days
+ Knowledge: Related PR #123 merged yesterday
= Decision: Propose /verify-changes with issue context and PR reference
\`\`\`

**Pattern Recognition with Context**:
- An issue resolution depends on the event-action reference patterns and project context
- A duplicate event (same issue, same transition) should be skipped
- Events from different sources about the same change should be correlated

#### 3.2 Generate Semantic Queries
Based on event type and content, generate 3-5 specific search queries:
- Search for similar past events
- Look for related test cases
- Find relevant documentation
- Check for known issues`,
    },
    // Step 9: Documentation Research (conditional library step)
    {
      stepId: 'gather-documentation',
      conditionalOnSubagent: 'documentation-researcher',
    },
    // Step 10: Task Planning (inline)
    {
      inline: true,
      title: 'Task Planning with Reasoning',
      content: `### Step 4: Task Planning with Reasoning

Generate tasks based on event analysis, using examples from memory as reference.

#### Task Generation Logic:
Analyze the event in context of ALL available information to decide what actions to take:

**Consider the Full Context**:
- What do the event-action reference patterns suggest for this event type?
- How does this relate to current knowledge?
- What's the state of related issues in external systems?
- Is this part of a larger pattern we've been seeing?
- What's the business impact of this event?

**Contextual Decision Making**:
The same event type can require different actions based on context:
- If reference pattern suggests verification -> Propose /verify-changes (queue for confirmation)
- If this issue was already processed (check event history) -> Skip to avoid duplicates
- If related PR exists in knowledge base -> Include PR context in proposed actions
- If this is a recurring pattern from the same source -> Consider flagging for review
- If no clear action for this event type -> Analyze context or skip

**Dynamic Task Selection**:
Based on the contextual analysis, decide which tasks make sense:
- **extract_learning**: When the event reveals something new about the system
- **update_test_plan**: When our understanding of what to test has changed
- **propose_generate_test_cases**: When tests need to reflect new reality (queued for confirmation)
- **report_bug**: When we have a legitimate, impactful, reproducible issue
- **skip_action**: When context shows no action needed (e.g., known issue, already fixed)

The key is to use ALL available context - not just react to the event type

#### Document Reasoning:
For each task, document WHY it's being executed:
\`\`\`markdown
Task: extract_learning
Reasoning: This event reveals a pattern of login failures on Chrome that wasn't previously documented
Data: "Chrome-specific timeout issues with login button"
\`\`\``,
    },
    // Step 11: Issue Tracking (conditional inline)
    {
      inline: true,
      title: 'Issue Tracking',
      content: `##### For Issue Tracking:

When an issue needs to be tracked (task type: report_bug or update_story):

{{INVOKE_ISSUE_TRACKER}}

1. Check for duplicate issues in the tracking system
2. For bugs: Create detailed bug report with:
   - Clear, descriptive title
   - Detailed description with context
   - Step-by-step reproduction instructions
   - Expected vs actual behavior
   - Environment and configuration details
   - Test case reference (if applicable)
   - Screenshots or error logs
3. For stories: Update status and add QA comments
4. Track issue lifecycle and maintain categorization

The issue-tracker agent will handle all aspects of issue tracking including duplicate detection, story management, QA workflow transitions, and integration with your project management system (Jira, Linear, Notion, etc.).`,
      conditionalOnSubagent: 'issue-tracker',
    },
    // Step 12: Execute Tasks (inline)
    {
      inline: true,
      title: 'Queue Proposed Actions and Notify Team',
      content: `### Step 5: Queue Proposed Actions and Notify Team

#### 5.1 Categorize Determined Actions

Separate actions into two categories:

**Queued Actions** (require team confirmation):
- \`/verify-changes\`, \`/generate-test-cases\`, \`/run-tests\`, \`/explore-application\`
- Any task that modifies tests, runs automation, or takes significant action

**Direct Actions** (execute immediately):
- Knowledge base updates and learnings
- Event history logging
- Event processor memory updates
- Skip decisions

#### 5.2 Execute Direct Actions

Update \`.bugzy/runtime/knowledge-base.md\` directly for learnings (e.g., "Not a Bug" resolutions).

#### 5.3 Queue Action Tasks

For each proposed action task, append one row to \`.bugzy/runtime/blocked-task-queue.md\`:

| Task Slug | Question | Original Args |
|-----------|----------|---------------|
| /verify-changes | Verify PROJ-456 changes (moved to Ready for QA)? Related PR #123. | \`{"issue": "PROJ-456", "context": "Jira Ready to Test"}\` |

Rules:
1. Read file first (create if doesn't exist)
2. Each action gets its own row
3. **Question** must be clear and include enough context for team to decide
4. **Original Args** must include event source, IDs, and relevant context as JSON

#### 5.4 Notify Team

{{INVOKE_TEAM_COMMUNICATOR}} to share the outcome:

**If actions were queued:**
- What event was processed
- What actions are proposed (with brief reasoning)
- These are awaiting confirmation

**If no actions queued (KB-only update or skip):**
- What event was processed
- What was learned or why it was skipped
- That no action is needed from the team

#### 5.5 Complete Task

After queuing and notifying, the task is DONE. Do NOT:
- Execute /verify-changes, /run-tests, /generate-test-cases directly
- Wait for team response (messaging infrastructure handles that)
- Create or modify test files
- Run automated tests

#### 5.6 Update Event Processor Memory
If new patterns discovered, append to \`.bugzy/runtime/memory/event-processor.md\`:
\`\`\`markdown
### Pattern: [New Pattern Name]
**First Seen**: [Date]
**Indicators**: [What identifies this pattern]
**Typical Tasks**: [Common task responses]
**Example**: [This event]
\`\`\`

#### 5.7 Update Event History
Append to \`.bugzy/runtime/memory/event-history.md\`:
\`\`\`markdown
## [Timestamp] - Event #[ID]

**Original Input**: [Raw arguments provided]
**Parsed Event**:
\`\`\`yaml
type: [type]
source: [source]
[other fields]
\`\`\`

**Pattern Matched**: [Pattern name or "New Pattern"]
**Tasks Executed**:
1. [Task 1] - Reasoning: [Why]
2. [Task 2] - Reasoning: [Why]

**Files Modified**:
- [List of files]

**Outcome**: [Success/Partial/Failed]
**Notes**: [Any additional context]
---
\`\`\``,
    },
    // Step 13: Learning and Maintenance (inline)
    {
      inline: true,
      title: 'Learning from Events',
      content: `### Step 6: Learning from Events

After processing, check if this event teaches us something new:
1. Is this a new type of event we haven't seen?
2. Did our task planning work well?
3. Should we update our patterns?
4. Are there trends across recent events?

If yes, update the event processor memory with new patterns or refined rules.

### Step 7: Create Necessary Files

Ensure all required files and directories exist:
\`\`\`bash
mkdir -p ./test-cases .claude/memory
\`\`\`

Create files if they don't exist:
- \`.bugzy/runtime/knowledge-base.md\`
- \`.bugzy/runtime/memory/event-processor.md\`
- \`.bugzy/runtime/memory/event-history.md\``,
    },
    // Step 14: Knowledge Base Update (library)
    'update-knowledge-base',
    // Step 15: Important Considerations (inline)
    {
      inline: true,
      title: 'Important Considerations',
      content: `## Important Considerations

### Contextual Intelligence
- Never process events in isolation - always consider full context
- Use knowledge base, history, and external system state to inform decisions
- What seems like a bug might be expected behavior given the context
- A minor event might be critical when seen as part of a pattern

### Adaptive Response
- Same event type can require different actions based on context
- Learn from each event to improve future decision-making
- Build understanding of system behavior over time
- Adjust responses based on business priorities and risk

### Smart Task Generation
- NEVER execute action tasks directly — all action tasks go through blocked-task-queue for team confirmation
- Knowledge base updates and event history logging are the only direct operations
- Document why each decision was made with full context
- Skip redundant actions (e.g., duplicate events, already-processed issues)
- Escalate appropriately based on pattern recognition

### Continuous Learning
- Each event adds to our understanding of the system
- Update patterns when new correlations are discovered
- Refine decision rules based on outcomes
- Build institutional memory through event history`,
    },
  ],

  requiredSubagents: ['team-communicator'],
  optionalSubagents: ['documentation-researcher', 'issue-tracker'],
  dependentTasks: ['verify-changes', 'generate-test-cases', 'run-tests'],
};
