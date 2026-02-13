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

Before proceeding with test creation or execution, ensure requirements are clear and testable.

### Check for Pending Clarification

1. If \`$ARGUMENTS.clarification\` exists, this task is resuming with a clarification response:
   - Extract \`clarification\` (the user's answer) and \`originalArgs\` (original task parameters)
   - Read \`.bugzy/runtime/blocked-task-queue.md\`, find and remove your task's entry
   - Proceed using the clarification, skip ambiguity detection for the clarified aspect
2. If no clarification in $ARGUMENTS: Proceed normally with ambiguity detection below.

### Assess Project Maturity

Maturity determines how aggressively you should ask questions.

**Measure from runtime artifacts:**

| Signal | New | Growing | Mature |
|--------|-----|---------|--------|
| \`knowledge-base.md\` | < 80 lines | 80-300 lines | 300+ lines |
| \`memory/\` files | 0 | 1-3 | 4+ files, >5KB each |
| Test cases in \`test-cases/\` | 0 | 1-6 | 7+ |
| Exploration reports | 0 | 1 | 2+ |

Check these signals and classify: majority New → **New**; majority Mature → **Mature**; otherwise → **Growing**.

**Maturity adjusts your question threshold:**
- **New**: STOP for CRITICAL + HIGH + MEDIUM
- **Growing**: STOP for CRITICAL + HIGH (default)
- **Mature**: STOP for CRITICAL only; handle HIGH with documented assumptions

### Detect Ambiguity

Scan for these signals:
- **Language**: Vague terms ("fix", "improve"), relative terms without reference, undefined scope, modal ambiguity
- **Details**: Missing acceptance criteria, no examples, incomplete element lists, unspecified error scenarios
- **Interpretation**: Multiple valid interpretations, contradictory information, implied vs explicit requirements
- **Context**: No reference documentation, assumes knowledge

**Quick Check** — can you write test assertions without assumptions? Is there only ONE reasonable interpretation?

### Assess Severity

| Severity | Characteristics | Action |
|----------|----------------|--------|
| **CRITICAL** | Expected behavior undefined/contradictory; core functionality unclear; success criteria missing; multiple interpretations = different strategies; page/feature confirmed absent with no authoritative trigger claiming it exists | **STOP** — ask via team-communicator |
| **HIGH** | Core underspecified but direction clear; affects majority of scenarios; assumptions risky | **STOP** — ask via team-communicator |
| **MEDIUM** | Specific details missing; general requirements clear; reasonable low-risk assumptions possible | **PROCEED** — moderate exploration, document assumptions [ASSUMED: X], async clarification |
| **LOW** | Minor edge cases; documentation gaps don't affect execution | **PROCEED** — mark [TO BE CLARIFIED: X], mention in report |

### Execution Obstacle vs. Requirement Ambiguity

Before classifying something as CRITICAL, distinguish:

**Requirement Ambiguity** = *What* to test is unclear → severity assessment applies normally.

**Execution Obstacle** = *What* to test is clear, but *how* to access/verify has obstacles → NEVER BLOCK.
- An authoritative trigger source (Jira, PR, team message) asserts the feature exists
- You browsed but couldn't find/access it (likely: wrong role, missing test data, feature flags, env config)
- → PROCEED with artifact creation. Notify team about the obstacle.

**The key test:** Does an authoritative trigger source assert the feature exists?
- **YES** → Execution obstacle. Proceed, create test artifacts, notify team about access issues.
- **NO** → May genuinely not exist. Apply CRITICAL severity, ask.

**Important:** A page loading is NOT the same as the requested functionality existing on it. Evaluate whether the REQUESTED FUNCTIONALITY exists, not just whether a URL resolves. If the page loads but requested features are absent and no authoritative source claims they were built → CRITICAL ambiguity.

| Scenario | Trigger Claims Feature | Browser Shows | Classification |
|----------|----------------------|---------------|----------------|
| Jira says "test premium dashboard", can't see it | Yes | Can't access | Execution obstacle — proceed |
| PR says "verify settings page", no settings page | Yes | Can't find | Execution obstacle — proceed |
| Manual request "test settings", no Jira/PR | No | Can't find | CRITICAL ambiguity — ask |
| Jira says "fix sorting", no sort criteria | Yes | Feature exists | HIGH ambiguity — ask |

### Check Memory for Similar Clarifications

Before asking, search memory by feature name, ambiguity pattern, and ticket keywords. If a directly applicable past answer exists, use it without re-asking. If partially applicable, adapt and reference.

### Formulate Clarification Questions

If clarification needed (CRITICAL/HIGH), formulate specific, concrete questions:

\`\`\`
**Context:** [Current understanding]
**Ambiguity:** [Specific unclear aspect]
**Question:** [Specific question with options]
**Why Important:** [Testing strategy impact]
\`\`\`

### Communicate Clarification Request

**For Slack-Triggered Tasks:** {{INVOKE_TEAM_COMMUNICATOR}} to ask in thread with context, ambiguity description, severity, and specific questions.

**For Manual/API Triggers:** Include a "Clarification Required Before Testing" section in task output with ambiguity, severity, questions with context/options/impact, and current observations.

### Register Blocked Task (CRITICAL/HIGH only)

When blocked, register in \`.bugzy/runtime/blocked-task-queue.md\`:

\`\`\`markdown
| Task Slug | Question | Original Args |
|-----------|----------|---------------|
| generate-test-plan | Should todos be sorted by date or priority? | \`{"ticketId": "TODO-456"}\` |
\`\`\`

The LLM processor reads this file and matches user responses to pending questions, then re-queues the task with the clarification.

### Wait or Proceed Based on Severity

**When severity meets your STOP threshold:**
- You MUST call team-communicator to ask — do NOT just mention it in text output
- Do NOT create tests, run tests, or make assumptions about the unclear aspect
- Do NOT silently adapt by working around the issue
- Do NOT invent your own success criteria when none are provided
- Register the blocked task and wait

**When severity is below your STOP threshold:**
- Perform moderate exploration, document assumptions, proceed
- Ask clarification async, mark results "based on assumptions"

### Document Clarification in Results

Include an "Ambiguities Encountered" section in results when clarification occurred, noting severity, question asked, response (or "Awaiting"), impact, assumptions made, and risk.

---

## Remember

- **STOP means STOP** — When you hit a STOP threshold, you MUST call team-communicator. Do NOT silently adapt or work around the issue
- **Non-existent features — check context first** — If a feature doesn't exist in browser, check whether an authoritative trigger asserts it exists. YES → execution obstacle (proceed). NO → CRITICAL severity, ask.
- **Never invent success criteria** — If the task says "improve" or "fix" without metrics, ask what "done" looks like
- **Check memory first** — Avoid re-asking previously answered questions
- **Maturity adjusts threshold, not judgment** — CRITICAL always triggers a question`,
  tags: ['clarification', 'protocol', 'ambiguity'],
};
