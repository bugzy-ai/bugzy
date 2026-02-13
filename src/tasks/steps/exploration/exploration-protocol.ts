import type { TaskStep } from '../types';

/**
 * Exploration Protocol - Consolidated step
 * Provides adaptive exploratory testing instructions based on requirement clarity.
 * Used to validate requirements and discover actual behavior before formal testing.
 */
export const explorationProtocolStep: TaskStep = {
  id: 'exploration-protocol',
  title: 'Exploration Protocol',
  category: 'exploration',
  content: `## Exploratory Testing Protocol

Before creating or running formal tests, perform exploratory testing to validate requirements and understand actual system behavior.

### Assess Requirement Clarity

| Clarity | Indicators | Exploration Depth |
|---------|-----------|-------------------|
| **Clear** | Detailed acceptance criteria, screenshots/mockups, specific field names/URLs | **Quick (1-2 min)** — confirm feature exists, capture evidence |
| **Vague** | General direction clear but specifics missing, relative terms ("fix", "better") | **Moderate (3-5 min)** — document current behavior, identify ambiguities |
| **Unclear** | Contradictory info, multiple interpretations, no criteria, ambiguous scope | **Deep (5-10 min)** — systematically test scenarios, document all ambiguities |

### Maturity Adjustment

If the Clarification Protocol determined project maturity:
- **New project**: Default one level deeper (Clear → Moderate, Vague → Deep)
- **Growing project**: Use requirement clarity as-is
- **Mature project**: Can stay at suggested depth or go shallower if knowledge base covers the feature

**Always verify features exist before testing them.** If a referenced feature doesn't exist:
- If an authoritative trigger (Jira, PR, team request) asserts it exists → **execution obstacle** (proceed with artifacts, notify team). Do NOT block.
- If NO authoritative source claims it exists → **CRITICAL severity** — escalate via Clarification Protocol.

### Quick Exploration (1-2 min)

**When:** Requirements CLEAR

1. Navigate to feature, verify it loads without errors
2. Verify key elements exist (buttons, fields, sections mentioned)
3. Capture screenshot of initial state
4. Document: feature name, URL, status (accessible/not found/different), notes
5. **Decision:** Matches → test creation | Doesn't match → Moderate Exploration

### Moderate Exploration (3-5 min)

**When:** Requirements VAGUE or Quick Exploration revealed discrepancies

1. Navigate using appropriate role(s), set up preconditions
2. Test primary user flow, document steps and behavior, note unexpected behavior
3. Capture before/after screenshots, document field values/ordering/visibility
4. Compare to requirement: what matches, what differs, what's absent
5. Identify specific ambiguities with concrete examples
6. Assess severity using Clarification Protocol
7. **Decision:** Minor ambiguity → proceed with assumptions | Critical → stop, escalate

### Deep Exploration (5-10 min)

**When:** Requirements UNCLEAR or critical ambiguities found

1. **Define exploration matrix:** dimensions (user roles, feature states, input variations)
2. **Systematic testing:** test each matrix cell methodically, document observations
3. **Document patterns:** consistent behavior, role-based differences, what varies vs constant
4. **Comprehensive report:** findings per test, comparison table, identified patterns, critical ambiguities
5. **Next action:** Critical ambiguities → STOP, clarify | Patterns suggest answer → validate assumption | Behavior clear → test creation

### Document Exploration Results

Save exploration findings as a report including:
- Date, depth, duration
- Feature observations and current behavior
- Discrepancies between requirements and observations
- Assumptions made (if proceeding)
- Artifacts: screenshots, videos, notes

### Decision Tree

\`\`\`
Requirements clear? → YES → Quick Exploration → Matches? → YES → Test Creation
                                                         → NO  → Moderate Exploration
                   → NO  → Direction clear? → YES → Moderate Exploration → Ambiguity ≤ MEDIUM? → YES → Proceed with assumptions
                                                                                               → NO  → Deep Exploration / Clarify
                                            → NO  → Deep Exploration → Document findings → Clarify CRITICAL/HIGH
\`\`\`

---

## Remember

- **Explore before assuming** — validate requirements against actual behavior
- **Concrete observations > abstract interpretation** — document specific findings
- **Adaptive depth** — match exploration effort to requirement clarity
- **Always document** — create artifacts for future reference`,
  tags: ['exploration', 'protocol', 'adaptive'],
};
