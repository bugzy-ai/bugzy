---
allowed-tools: Read, Write, MultiEdit, Task, Grep
argument-hint: "[event description or structured data]"
description: Process events flexibly to extract learnings, update tests, and track issues using the issue-tracker agent
---

# Process Event Command

## SECURITY NOTICE
**CRITICAL**: Never read the `.env` file. It contains ONLY secrets (passwords, API keys).
- **Read `.env.example`** for non-secret environment variables (TEST_BASE_URL, TEST_OWNER_EMAIL, etc.)
- `.env.example` contains actual values for test data, URLs, and non-sensitive configuration
- For secrets: Reference variable names only (TEST_OWNER_PASSWORD) - values are injected at runtime
- The `.env` file access is blocked by settings.json

Process various types of events using intelligent pattern matching and historical context to maintain and evolve the testing system.

## Arguments
Arguments: $ARGUMENTS

## Process

### Step 1: Understand Event Context

Events come from two main sources:

#### Internal Events (from the testing system):
- **Test Failures**: Test case TC-XXX failed with specific error
- **Test Passes**: Test case TC-XXX passed after previous failures
- **Manual Updates**: User manually updated test plan or test cases
- **Environment Issues**: Test environment down, configuration problems
- **Performance Degradation**: Tests taking longer than expected
- **Flaky Test Detection**: Test showing intermittent failures

#### External Events (from integrated systems):
- **GitHub Events**: 
  - PR merged with bug fix
  - Issue closed as "won't fix" or "user error"
  - New feature branch created
  - Security vulnerability reported
- **Support Tickets**: Customer reported issue
- **Monitoring Alerts**: Production incident detected
- **Feature Releases**: New feature deployed to production

#### Event Context to Extract:
- **What happened**: The core event (test failed, PR merged, etc.)
- **Where**: Component, service, or area affected
- **Impact**: How this affects testing strategy
- **Action Required**: What needs to be done in response

### Step 2: Load Context and Memory

#### 2.1 Check Event Processor Memory
Read `.bugzy/runtime/memory/event-processor.md` to:
- Find similar event patterns
- Load example events with reasoning
- Get system-specific rules
- Retrieve task mapping patterns

#### 2.2 Check Event History
Read `.bugzy/runtime/memory/event-history.md` to:
- Ensure event hasn't been processed already (idempotency)
- Find related recent events
- Understand event patterns and trends

#### 2.3 Read Current State
- Read `test-plan.md` for current coverage
- List `./test-cases/` for existing tests
- Check `.bugzy/runtime/learnings.md` for past insights

### Step 3: Intelligent Event Analysis

#### 3.1 Contextual Pattern Analysis
Don't just match patterns - analyze the event within the full context:

**Combine Multiple Signals**:
- Event details + Historical patterns from memory
- Current test plan state + Recent learnings
- External system status + Team activity
- Business priorities + Risk assessment

**Example Contextual Analysis**:
```
Event: "Login test failed with timeout"
+ Learning: "Login service was updated yesterday"
+ GitHub: "PR #123 'Refactor auth service' merged 2 hours ago"
+ History: "No previous timeout issues with login"
= Decision: Don't report bug yet, likely related to recent refactor. 
           Monitor next few runs, update test if behavior changed intentionally.
```

**Pattern Recognition with Context**:
- A test failure after a deployment is different from a random failure
- A bug already reported shouldn't be reported again
- A test that fails only in one environment needs different handling
- An issue marked "won't fix" means we need to adjust our expectations

#### 3.2 Generate Semantic Queries
Based on event type and content, generate 3-5 specific search queries:
- Search for similar past events
- Look for related test cases
- Find relevant documentation
- Check for known issues

### Step 4: Task Planning with Reasoning

Generate tasks based on event analysis, using examples from memory as reference.

#### Task Generation Logic:
Analyze the event in context of ALL available information to decide what actions to take:

**Consider the Full Context**:
- What does this event mean given our current test plan?
- How does this relate to previous learnings?
- What's the state of related issues in external systems?
- Is this part of a larger pattern we've been seeing?
- What's the business impact of this event?

**Contextual Decision Making**:
For example, a "test failed" event might result in different actions:
- If we have a learning that this test is flaky → Don't report bug, investigate flakiness
- If GitHub shows a PR just merged touching this area → Wait for next run before reporting
- If this matches a known production issue → Report bug with high priority
- If test plan shows this is low priority feature → Document but don't escalate
- If this is 5th failure today in same component → Escalate to team immediately

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
```markdown
Task: extract_learning
Reasoning: This event reveals a pattern of login failures on Chrome that wasn't previously documented
Data: "Chrome-specific timeout issues with login button"
```

### Step 5: Execute Tasks with Memory Updates

#### 5.1 Execute Each Task

##### For Issue Tracking:

When an issue needs to be tracked (task type: report_bug or update_story):
```
Use issue-tracker agent to:
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
```

The issue-tracker agent will handle all aspects of issue tracking including duplicate detection, story management, QA workflow transitions, and integration with your project management system (Jira, Linear, Notion, etc.).

##### For Other Tasks:
Follow the standard execution logic with added context from memory.

#### 5.2 Update Event Processor Memory
If new patterns discovered, append to `.bugzy/runtime/memory/event-processor.md`:
```markdown
### Pattern: [New Pattern Name]
**First Seen**: [Date]
**Indicators**: [What identifies this pattern]
**Typical Tasks**: [Common task responses]
**Example**: [This event]
```

#### 5.3 Update Event History
Append to `.bugzy/runtime/memory/event-history.md`:
```markdown
## [Timestamp] - Event #[ID]

**Original Input**: [Raw arguments provided]
**Parsed Event**:
```yaml
type: [type]
source: [source]
[other fields]
```

**Pattern Matched**: [Pattern name or "New Pattern"]
**Tasks Executed**:
1. [Task 1] - Reasoning: [Why]
2. [Task 2] - Reasoning: [Why]

**Files Modified**:
- [List of files]

**Outcome**: [Success/Partial/Failed]
**Notes**: [Any additional context]
---
```

### Step 6: Learning from Events

After processing, check if this event teaches us something new:
1. Is this a new type of event we haven't seen?
2. Did our task planning work well?
3. Should we update our patterns?
4. Are there trends across recent events?

If yes, update the event processor memory with new patterns or refined rules.

### Step 7: Create Necessary Files

Ensure all required files and directories exist:
```bash
mkdir -p ./test-cases .claude/memory
```

Create files if they don't exist:
- `.bugzy/runtime/learnings.md`
- `.bugzy/runtime/memory/event-processor.md`
- `.bugzy/runtime/memory/event-history.md`

## Important Considerations

### Contextual Intelligence
- Never process events in isolation - always consider full context
- Use learnings, history, and external system state to inform decisions
- What seems like a bug might be expected behavior given the context
- A minor event might be critical when seen as part of a pattern

### Adaptive Response
- Same event type can require different actions based on context
- Learn from each event to improve future decision-making
- Build understanding of system behavior over time
- Adjust responses based on business priorities and risk

### Smart Task Generation
- Only take actions that make sense given all available information
- Document why each decision was made with full context
- Skip redundant actions (e.g., reporting already-known bugs)
- Escalate appropriately based on pattern recognition

### Continuous Learning
- Each event adds to our understanding of the system
- Update patterns when new correlations are discovered
- Refine decision rules based on outcomes
- Build institutional memory through event history