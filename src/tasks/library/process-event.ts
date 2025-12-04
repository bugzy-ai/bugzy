/**
 * Process Event Task
 * Process external system events (Jira, GitHub, Linear) using handler-defined rules to extract insights and track issues
 */

import { TaskTemplate } from '../types';
import { TASK_SLUGS } from '../constants';
import { KNOWLEDGE_BASE_READ_INSTRUCTIONS, KNOWLEDGE_BASE_UPDATE_INSTRUCTIONS } from '../templates/knowledge-base.js';

export const processEventTask: TaskTemplate = {
  slug: TASK_SLUGS.PROCESS_EVENT,
  name: 'Process Event',
  description: 'Process external system events (Jira, GitHub, Linear) using handler-defined rules to extract insights and track issues',

  frontmatter: {
    description: 'Process external system events (Jira, GitHub, Linear) using handler-defined rules to extract insights and track issues',
    'argument-hint': '[event payload or description]',
  },

  baseContent: `# Process Event Command

## SECURITY NOTICE
**CRITICAL**: Never read the \`.env\` file. It contains ONLY secrets (passwords, API keys).
- **Read \`.env.testdata\`** for non-secret environment variables (TEST_BASE_URL, TEST_OWNER_EMAIL, etc.)
- \`.env.testdata\` contains actual values for test data, URLs, and non-sensitive configuration
- For secrets: Reference variable names only (TEST_OWNER_PASSWORD) - values are injected at runtime
- The \`.env\` file access is blocked by settings.json

Process various types of events using intelligent pattern matching and historical context to maintain and evolve the testing system.

## Arguments
Arguments: \$ARGUMENTS

${KNOWLEDGE_BASE_READ_INSTRUCTIONS}

## Process

### Step 1: Understand Event Context

Events come from integrated external systems via webhooks or manual input. Common sources include:
- **Issue Trackers**: Jira, Linear, GitHub Issues
- **Source Control**: GitHub, GitLab
- **Communication Tools**: Slack

**Event structure and semantics vary by source.** Do not interpret events based on generic assumptions. Instead, load the appropriate handler file (Step 2.4) for system-specific processing rules.

#### Event Context to Extract:
- **What happened**: The core event (test failed, PR merged, etc.)
- **Where**: Component, service, or area affected
- **Impact**: How this affects testing strategy
- **Action Required**: What needs to be done in response

### Step 1.5: Clarify Unclear Events

If the event information is incomplete or ambiguous, seek clarification before processing:

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

This ensures future similar events can reference past clarifications and avoid redundant questions.

### Step 2: Load Context and Memory

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

#### 2.4 Load System-Specific Handler (REQUIRED)

Based on the event source, load the handler from \`.bugzy/runtime/handlers/\`:

**Step 1: Detect Event Source from Payload:**
- \`com.jira-server.*\` event type prefix → \`.bugzy/runtime/handlers/jira.md\`
- \`github.*\` or GitHub webhook structure → \`.bugzy/runtime/handlers/github.md\`
- \`linear.*\` or Linear webhook → \`.bugzy/runtime/handlers/linear.md\`
- Other sources → Check for matching handler file by source name

**Step 2: Load and Read the Handler File:**
The handler file contains system-specific instructions for:
- Event payload structure and field meanings
- Which triggers (status changes, resolutions) require specific actions
- How to interpret different event types
- When to invoke \`/verify-changes\`
- How to update the knowledge base

**Step 3: Follow Handler Instructions:**
The handler file is authoritative for this event source. Follow its instructions for:
- Interpreting the event payload
- Determining what actions to take
- Formatting responses and updates

**Step 4: If No Handler Exists:**
Do NOT guess or apply generic logic. Instead:
1. Inform the user that no handler exists for this event source
2. Ask how this event type should be processed
3. Suggest creating a handler file at \`.bugzy/runtime/handlers/{source}.md\`

**Project-Specific Configuration:**
Handlers reference \`.bugzy/runtime/project-context.md\` for project-specific rules like:
- Which status transitions trigger verify-changes
- Which resolutions should update the knowledge base
- Which transitions to ignore

### Step 3: Intelligent Event Analysis

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
+ Handler: jira.md says "Ready for QA" triggers /verify-changes
+ History: This issue was previously in "In Progress" for 3 days
+ Knowledge: Related PR #123 merged yesterday
= Decision: Invoke /verify-changes with issue context and PR reference
\`\`\`

**Pattern Recognition with Context**:
- An issue resolution depends on what the handler prescribes for that status
- A duplicate event (same issue, same transition) should be skipped
- Events from different sources about the same change should be correlated
- Handler instructions take precedence over generic assumptions

#### 3.2 Generate Semantic Queries
Based on event type and content, generate 3-5 specific search queries:
- Search for similar past events
- Look for related test cases
- Find relevant documentation
- Check for known issues

{{DOCUMENTATION_RESEARCHER_INSTRUCTIONS}}

### Step 4: Task Planning with Reasoning

Generate tasks based on event analysis, using examples from memory as reference.

#### Task Generation Logic:
Analyze the event in context of ALL available information to decide what actions to take:

**Consider the Full Context**:
- What does the handler prescribe for this event type?
- How does this relate to current knowledge?
- What's the state of related issues in external systems?
- Is this part of a larger pattern we've been seeing?
- What's the business impact of this event?

**Contextual Decision Making**:
The same event type can require different actions based on context:
- If handler says this status triggers verification → Invoke /verify-changes
- If this issue was already processed (check event history) → Skip to avoid duplicates
- If related PR exists in knowledge base → Include PR context in actions
- If this is a recurring pattern from the same source → Consider flagging for review
- If handler has no rule for this event type → Ask user for guidance

**Dynamic Task Selection**:
Based on the contextual analysis, decide which tasks make sense:
- **extract_learning**: When the event reveals something new about the system
- **update_test_plan**: When our understanding of what to test has changed
- **update_test_cases**: When tests need to reflect new reality
- **report_bug**: When we have a legitimate, impactful, reproducible issue
- **skip_action**: When context shows no action needed (e.g., known issue, already fixed)

The key is to use ALL available context - not just react to the event type

#### Document Reasoning:
For each task, document WHY it's being executed:
\`\`\`markdown
Task: extract_learning
Reasoning: This event reveals a pattern of login failures on Chrome that wasn't previously documented
Data: "Chrome-specific timeout issues with login button"
\`\`\`

### Step 5: Execute Tasks with Memory Updates

#### 5.1 Execute Each Task

{{ISSUE_TRACKER_INSTRUCTIONS}}

##### For Other Tasks:
Follow the standard execution logic with added context from memory.

#### 5.2 Update Event Processor Memory
If new patterns discovered, append to \`.bugzy/runtime/memory/event-processor.md\`:
\`\`\`markdown
### Pattern: [New Pattern Name]
**First Seen**: [Date]
**Indicators**: [What identifies this pattern]
**Typical Tasks**: [Common task responses]
**Example**: [This event]
\`\`\`

#### 5.3 Update Event History
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
\`\`\`

### Step 6: Learning from Events

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
- \`.bugzy/runtime/memory/event-history.md\`

## Important Considerations

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
- Only take actions prescribed by the handler or confirmed by the user
- Document why each decision was made with full context
- Skip redundant actions (e.g., duplicate events, already-processed issues)
- Escalate appropriately based on pattern recognition

### Continuous Learning
- Each event adds to our understanding of the system
- Update patterns when new correlations are discovered
- Refine decision rules based on outcomes
- Build institutional memory through event history

${KNOWLEDGE_BASE_UPDATE_INSTRUCTIONS}`,

  optionalSubagents: [
    {
      role: 'documentation-researcher',
      contentBlock: `#### 3.3 Use Documentation Researcher if Needed
For events mentioning unknown features or components:
\`\`\`
{{INVOKE_DOCUMENTATION_RESEARCHER}} to find information about: [component/feature]
\`\`\``
    },
    {
      role: 'issue-tracker',
      contentBlock: `##### For Issue Tracking:

When an issue needs to be tracked (task type: report_bug or update_story):
\`\`\`
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
\`\`\`

The issue-tracker agent will handle all aspects of issue tracking including duplicate detection, story management, QA workflow transitions, and integration with your project management system (Jira, Linear, Notion, etc.).`
    }
  ],
  requiredSubagents: [],
  dependentTasks: ['verify-changes']
};
