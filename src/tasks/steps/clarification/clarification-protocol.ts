import type { TaskStep } from '../types';

/**
 * Clarification Protocol - Consolidated step
 * Provides standardized instructions for detecting ambiguity, assessing severity, and seeking clarification.
 * Used across all agent library tasks for consistent clarification handling.
 */
export const clarificationProtocolStep: TaskStep = {
  id: 'clarification-protocol',
  title: 'Clarification Protocol',
  category: 'clarification',
  invokesSubagents: ['team-communicator'],
  content: `## Clarification Protocol

Before proceeding with test creation or execution, ensure requirements are clear and testable. Use this protocol to detect ambiguity, assess its severity, and determine the appropriate action.

### Check for Pending Clarification

Before starting, check if this task is resuming from a blocked clarification:

1. **Check $ARGUMENTS for clarification data:**
   - If \`$ARGUMENTS.clarification\` exists, this task is resuming with a clarification response
   - Extract: \`clarification\` (the user's answer), \`originalArgs\` (original task parameters)

2. **If clarification is present:**
   - Read \`.bugzy/runtime/blocked-task-queue.md\`
   - Find and remove your task's entry from the queue (update the file)
   - Proceed using the clarification as if user just provided the answer
   - Skip ambiguity detection for the clarified aspect

3. **If no clarification in $ARGUMENTS:** Proceed normally with ambiguity detection below.

### Assess Project Maturity

Before detecting ambiguity, assess how well you know this project. Maturity determines how aggressively you should ask questions — new projects require more questions, mature projects can rely on accumulated knowledge.

**Measure maturity from runtime artifacts:**

| Signal | New | Growing | Mature |
|--------|-----|---------|--------|
| \`knowledge-base.md\` | < 80 lines (template) | 80-300 lines | 300+ lines |
| \`memory/\` files | 0 files | 1-3 files | 4+ files, >5KB each |
| Test cases in \`test-cases/\` | 0 | 1-6 | 7+ |
| Exploration reports | 0 | 1 | 2+ |

**Steps:**
1. Read \`.bugzy/runtime/knowledge-base.md\` and count lines
2. List \`.bugzy/runtime/memory/\` directory and count files
3. List \`test-cases/\` directory and count \`.md\` files (exclude README)
4. Count exploration reports in \`exploration-reports/\`
5. Classify: If majority of signals = New → **New**; majority Mature → **Mature**; otherwise → **Growing**

**Maturity adjusts your question threshold:**
- **New**: Ask for CRITICAL + HIGH + MEDIUM severity (gather information aggressively)
- **Growing**: Ask for CRITICAL + HIGH severity (standard protocol)
- **Mature**: Ask for CRITICAL only (handle HIGH with documented assumptions)

**CRITICAL severity ALWAYS triggers a question, regardless of maturity level.**

### Detect Ambiguity

Scan for ambiguity signals:

**Language:** Vague terms ("fix", "improve", "better", "like", "mixed up"), relative terms without reference ("faster", "more"), undefined scope ("the ordering", "the fields", "the page"), modal ambiguity ("should", "could" vs "must", "will")

**Details:** Missing acceptance criteria (no clear PASS/FAIL), no examples/mockups, incomplete field/element lists, unclear role behavior differences, unspecified error scenarios

**Interpretation:** Multiple valid interpretations, contradictory information (description vs comments), implied vs explicit requirements

**Context:** No reference documentation, "RELEASE APPROVED" without criteria, quick ticket creation, assumes knowledge ("as you know...", "obviously...")

**Quick Check:**
- [ ] Success criteria explicitly defined? (PASS if X, FAIL if Y)
- [ ] All affected elements specifically listed? (field names, URLs, roles)
- [ ] Only ONE reasonable interpretation?
- [ ] Examples, screenshots, or mockups provided?
- [ ] Consistent with existing system patterns?
- [ ] Can write test assertions without assumptions?

### Assess Severity

If ambiguity is detected, assess its severity:

| Severity | Characteristics | Examples | Action |
|----------|----------------|----------|--------|
| **CRITICAL** | Expected behavior undefined/contradictory; test outcome unpredictable; core functionality unclear; success criteria missing; multiple interpretations = different strategies; **referenced page/feature confirmed absent after browser verification AND no authoritative trigger source (Jira, PR, team request) asserts the feature exists** | "Fix the issue" (what issue?), "Improve performance" (which metrics?), "Fix sorting in todo list" (by date? priority? completion status?), "Test the Settings page" (browsed app — no Settings page exists, and no Jira/PR claims it was built) | **STOP** - You MUST ask via team-communicator before proceeding |
| **HIGH** | Core underspecified but direction clear; affects majority of scenarios; vague success criteria; assumptions risky | "Fix ordering" (sequence OR visibility?), "Add validation" (what? messages?), "Update dashboard" (which widgets?) | **STOP** - You MUST ask via team-communicator before proceeding |
| **MEDIUM** | Specific details missing; general requirements clear; affects subset of cases; reasonable low-risk assumptions possible; wrong assumption = test updates not strategy overhaul | Missing field labels, unclear error message text, undefined timeouts, button placement not specified, date formats unclear | **PROCEED** - (1) Moderate exploration, (2) Document assumptions: "Assuming X because Y", (3) Proceed with creation/execution, (4) Async clarification (team-communicator), (5) Mark [ASSUMED: description] |
| **LOW** | Minor edge cases; documentation gaps don't affect execution; optional/cosmetic elements; minimal impact | Tooltip text, optional field validation, icon choice, placeholder text, tab order | **PROCEED** - (1) Mark [TO BE CLARIFIED: description], (2) Proceed, (3) Mention in report "Minor Details", (4) No blocking/async clarification |

### Execution Obstacle vs. Requirement Ambiguity

Before classifying something as CRITICAL, distinguish between these two fundamentally different situations:

**Requirement Ambiguity** = *What* to test is unclear → severity assessment applies normally
- No authoritative source describes the feature
- The task description is vague or contradictory
- You cannot determine what "correct" behavior looks like
- → Apply severity table above. CRITICAL/HIGH → BLOCK.

**Execution Obstacle** = *What* to test is clear, but *how* to access/verify has obstacles → NEVER BLOCK
- An authoritative trigger source (Jira issue, PR, team message) asserts the feature exists
- You browsed the app but couldn't find/access the feature
- The obstacle is likely: wrong user role/tier, missing test data, feature flags, environment config
- → PROCEED with artifact creation (test cases, test specs). Notify team about the obstacle.

**The key test:** Does an authoritative trigger source (Jira, PR, team request) assert the feature exists?
- **YES** → It's an execution obstacle. The feature exists but you can't access it. Proceed: create test artifacts, add placeholder env vars, notify team about access issues.
- **NO** → It may genuinely not exist. Apply CRITICAL severity, ask what was meant.

| Scenario | Trigger Says | Browser Shows | Classification | Action |
|----------|-------------|---------------|----------------|--------|
| Jira says "test premium dashboard", you log in as test_user and don't see it | Feature exists | Can't access | **Execution obstacle** | Create tests, notify team re: missing premium credentials |
| PR says "verify new settings page", you browse and find no settings page | Feature exists | Can't find | **Execution obstacle** | Create tests, notify team re: possible feature flag/env issue |
| Manual request "test the settings page", no Jira/PR, you browse and find no settings page | No source claims it | Can't find | **Requirement ambiguity (CRITICAL)** | BLOCK, ask what was meant |
| Jira says "fix sorting", but doesn't specify sort criteria | Feature exists | Feature exists | **Requirement ambiguity (HIGH)** | BLOCK, ask which sort criteria |

**Partial Feature Existence — URL found but requested functionality absent:**

A common edge case: a page/route loads successfully, but the SPECIFIC FUNCTIONALITY you were asked to test doesn't exist on it.

**Rule:** Evaluate whether the REQUESTED FUNCTIONALITY exists, not just whether a URL resolves.

| Page Exists | Requested Features Exist | Authoritative Trigger | Classification |
|-------------|--------------------------|----------------------|----------------|
| Yes | Yes | Any | Proceed normally |
| Yes | No | Yes (Jira/PR says features built) | Execution obstacle — features behind flag/env |
| Yes | No | No (manual request only) | **Requirement ambiguity (CRITICAL)** — ask what's expected |
| No | N/A | Yes | Execution obstacle — page not deployed yet |
| No | N/A | No | **Requirement ambiguity (CRITICAL)** — ask what was meant |

**Example:** Prompt says "Test the checkout payment form with credit card 4111..." You browse to /checkout and find an information form (first name, last name, postal code) but NO payment form, NO shipping options, NO Place Order button. No Jira/PR claims these features exist. → **CRITICAL requirement ambiguity.** Ask: "I found a checkout information form at /checkout but no payment form or shipping options. Can you clarify what checkout features you'd like tested?"

**Key insight:** Finding a URL is not the same as finding the requested functionality. Do NOT classify this as an "execution obstacle" just because the page loads.

### Check Memory for Similar Clarifications

Before asking, check if similar question was answered:

**Process:**
1. **Query team-communicator memory** - Search by feature name, ambiguity pattern, ticket keywords
2. **Review past Q&A** - Similar question asked? What was answer? Applicable now?
3. **Assess reusability:**
   - Directly applicable → Use answer, no re-ask
   - Partially applicable → Adapt and reference ("Previously for X, clarified Y. Same here?")
   - Not applicable → Ask as new
4. **Update memory** - Store Q&A with task type, feature, pattern tags

**Example:** Query "todo sorting priority" → Found 2025-01-15: "Should completed todos appear in main list?" → Answer: "No, move to separate archive view" → Directly applicable → Use, no re-ask needed

### Formulate Clarification Questions

If clarification needed (CRITICAL/HIGH severity), formulate specific, concrete questions:

**Good Questions:** Specific and concrete, provide context, offer options, reference examples, tie to test strategy

**Bad Questions:** Too vague/broad, assumptive, multiple questions in one, no context

**Template:**
\`\`\`
**Context:** [Current understanding]
**Ambiguity:** [Specific unclear aspect]
**Question:** [Specific question with options]
**Why Important:** [Testing strategy impact]

Example:
Context: TODO-456 "Fix the sorting in the todo list so items appear in the right order"
Ambiguity: "sorting" = (A) by creation date, (B) by due date, (C) by priority level, or (D) custom user-defined order
Question: Should todos be sorted by due date (soonest first) or priority (high to low)? Should completed items appear in the list or move to archive?
Why Important: Different sort criteria require different test assertions. Current app shows 15 active todos + 8 completed in mixed order.
\`\`\`

### Communicate Clarification Request

**For Slack-Triggered Tasks:** {{INVOKE_TEAM_COMMUNICATOR}} to ask in thread:
\`\`\`
Ask clarification in Slack thread:
Context: [From ticket/description]
Ambiguity: [Describe ambiguity]
Severity: [CRITICAL/HIGH]
Questions:
1. [First specific question]
2. [Second if needed]

Clarification needed to proceed. I'll wait for response before testing.
\`\`\`

**For Manual/API Triggers:** Include in task output:
\`\`\`markdown
## Clarification Required Before Testing

**Ambiguity:** [Description]
**Severity:** [CRITICAL/HIGH]

### Questions:
1. **Question:** [First question]
   - Context: [Provide context]
   - Options: [If applicable]
   - Impact: [Testing impact]

**Action Required:** Provide clarification. Testing cannot proceed.
**Current Observation:** [What exploration revealed - concrete examples]
\`\`\`

### Register Blocked Task (CRITICAL/HIGH only)

When asking a CRITICAL or HIGH severity question that blocks progress, register the task in the blocked queue so it can be automatically re-triggered when clarification arrives.

**Update \`.bugzy/runtime/blocked-task-queue.md\`:**

1. Read the current file (create if doesn't exist)
2. Add a new row to the Queue table

\`\`\`markdown
# Blocked Task Queue

Tasks waiting for clarification responses.

| Task Slug | Question | Original Args |
|-----------|----------|---------------|
| generate-test-plan | Should todos be sorted by date or priority? | \`{"ticketId": "TODO-456"}\` |
\`\`\`

**Entry Fields:**
- **Task Slug**: The task slug (e.g., \`generate-test-plan\`) - used for re-triggering
- **Question**: The clarification question asked (so LLM can match responses)
- **Original Args**: JSON-serialized \`$ARGUMENTS\` wrapped in backticks

**Purpose**: The LLM processor reads this file and matches user responses to pending questions. When a match is found, it re-queues the task with the clarification.

### Wait or Proceed Based on Severity

**Use your maturity assessment to adjust thresholds:**
- **New project**: STOP for CRITICAL + HIGH + MEDIUM
- **Growing project**: STOP for CRITICAL + HIGH (default)
- **Mature project**: STOP for CRITICAL only; handle HIGH with documented assumptions

**When severity meets your STOP threshold:**
- You MUST call team-communicator (Slack) to ask the question — do NOT just mention it in your text output
- Do NOT create tests, run tests, or make assumptions about the unclear aspect
- Do NOT silently adapt by working around the issue (e.g., running other tests instead)
- Do NOT invent your own success criteria when none are provided
- Register the blocked task and wait for clarification
- *Rationale: Wrong assumptions = incorrect tests, false results, wasted time*

**When severity is below your STOP threshold → Proceed with Documented Assumptions:**
- Perform moderate exploration, document assumptions, proceed with creation/execution
- Ask clarification async (team-communicator), mark results "based on assumptions"
- Update tests after clarification received
- *Rationale: Waiting blocks progress; documented assumptions allow forward movement with later corrections*

**LOW → Always Proceed and Mark:**
- Proceed with creation/execution, mark gaps [TO BE CLARIFIED] or [ASSUMED]
- Mention in report but don't prioritize, no blocking
- *Rationale: Details don't affect strategy/results significantly*

### Document Clarification in Results

When reporting test results, always include an "Ambiguities" section if clarification occurred:

\`\`\`markdown
## Ambiguities Encountered

### Clarification: [Topic]
- **Severity:** [CRITICAL/HIGH/MEDIUM/LOW]
- **Question Asked:** [What was asked]
- **Response:** [Answer received, or "Awaiting response"]
- **Impact:** [How this affected testing]
- **Assumption Made:** [If proceeded with assumption]
- **Risk:** [What could be wrong if assumption is incorrect]

### Resolution:
[How the clarification was resolved and incorporated into testing]
\`\`\`

---

## Remember

- **STOP means STOP** - When you hit a STOP threshold, you MUST call team-communicator to ask via Slack. Do NOT silently adapt, skip, or work around the issue
- **Non-existent features — check context first** - If a page/feature doesn't exist in the browser, check whether an authoritative trigger (Jira, PR, team request) asserts it exists. If YES → execution obstacle (proceed with artifact creation, notify team). If NO authoritative source claims it exists → CRITICAL severity, ask what was meant
- **Ask correctly > guess poorly** - Specific questions lead to specific answers
- **Never invent success criteria** - If the task says "improve" or "fix" without metrics, ask what "done" looks like
- **Check memory first** - Avoid re-asking previously answered questions
- **Maturity adjusts threshold, not judgment** - Even in mature projects, CRITICAL always triggers a question`,
  tags: ['clarification', 'protocol', 'ambiguity'],
};
