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
| **CRITICAL** | Expected behavior undefined/contradictory; test outcome unpredictable; core functionality unclear; success criteria missing; multiple interpretations = different strategies | "Fix the issue" (what issue?), "Improve performance" (which metrics?), "Fix sorting in todo list" (by date? priority? completion status?) | **STOP** - Seek clarification before proceeding |
| **HIGH** | Core underspecified but direction clear; affects majority of scenarios; vague success criteria; assumptions risky | "Fix ordering" (sequence OR visibility?), "Add validation" (what? messages?), "Update dashboard" (which widgets?) | **STOP** - Seek clarification before proceeding |
| **MEDIUM** | Specific details missing; general requirements clear; affects subset of cases; reasonable low-risk assumptions possible; wrong assumption = test updates not strategy overhaul | Missing field labels, unclear error message text, undefined timeouts, button placement not specified, date formats unclear | **PROCEED** - (1) Moderate exploration, (2) Document assumptions: "Assuming X because Y", (3) Proceed with creation/execution, (4) Async clarification (team-communicator), (5) Mark [ASSUMED: description] |
| **LOW** | Minor edge cases; documentation gaps don't affect execution; optional/cosmetic elements; minimal impact | Tooltip text, optional field validation, icon choice, placeholder text, tab order | **PROCEED** - (1) Mark [TO BE CLARIFIED: description], (2) Proceed, (3) Mention in report "Minor Details", (4) No blocking/async clarification |

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

**CRITICAL/HIGH → STOP and Wait:**
- Do NOT create tests, run tests, or make assumptions
- Wait for clarification, resume after answer
- *Rationale: Wrong assumptions = incorrect tests, false results, wasted time*

**MEDIUM → Proceed with Documented Assumptions:**
- Perform moderate exploration, document assumptions, proceed with creation/execution
- Ask clarification async (team-communicator), mark results "based on assumptions"
- Update tests after clarification received
- *Rationale: Waiting blocks progress; documented assumptions allow forward movement with later corrections*

**LOW → Proceed and Mark:**
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

- **Block for CRITICAL/HIGH** - Never proceed with assumptions on unclear core requirements
- **Ask correctly > guess poorly** - Specific questions lead to specific answers
- **Document MEDIUM assumptions** - Track what you assumed and why
- **Check memory first** - Avoid re-asking previously answered questions
- **Specific questions → specific answers** - Vague questions get vague answers`,
  tags: ['clarification', 'protocol', 'ambiguity'],
};
